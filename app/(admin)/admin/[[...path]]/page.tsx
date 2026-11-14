'use client';

import { useState, useEffect } from 'react';
import { AdminRoot, cmsApi } from '@prenta/admin';
import type { CaptchaConfig } from '@prenta/admin';
import config from '../../../../prenta.config';
import { DEFAULT_SECTION_RENDERERS } from '@prenta/sections-react';
import { sectionRenderers as customSectionRenderers } from '../../../../src/sections/register';

export default function AdminPage() {
  const [session, setSession] = useState<any>(null);
  const [setupRequired, setSetupRequired] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [captchaConfig, setCaptchaConfig] = useState<CaptchaConfig | undefined>(undefined);

  useEffect(() => {
    async function checkAuth() {
      const [setupRes, captchaRes] = await Promise.all([
        cmsApi<{ setupRequired: boolean; migrationsRequired?: boolean }>('/setup/status'),
        cmsApi<{ provider: string; siteKey: string | null }>('/captcha/config?for=login'),
      ]);

      if (captchaRes.data) {
        setCaptchaConfig(captchaRes.data as CaptchaConfig);
      }

      // Database is reachable but has no Prenta CMS tables yet — tell the
      // operator to run migrations instead of dropping them on the login screen.
      if (setupRes.data?.migrationsRequired) {
        setStatusError('Your database has no Prenta CMS tables yet. Run `npx prisma migrate deploy` against your database, then reload this page.');
        setLoading(false);
        return;
      }

      // The status check itself failed (e.g. the database is unreachable).
      if (setupRes.error) {
        setStatusError('Could not reach the CMS backend: ' + setupRes.error);
        setLoading(false);
        return;
      }

      if (setupRes.data?.setupRequired) {
        setSetupRequired(true);
        setLoading(false);
        return;
      }
      const meRes = await cmsApi<{ id: string; email: string; name: string; role: string }>('/auth/me');
      if (meRes.data) {
        setSession({ user: meRes.data });
      }
      setLoading(false);
    }
    checkAuth();
  }, []);

  const handleLogin = async (email: string, password: string, captchaToken?: string) => {
    const res = await cmsApi<{
      token?: string;
      user?: any;
      requiresTOTP?: boolean;
      mfaPendingToken?: string;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, captchaToken }),
    });
    if (res.error) return { success: false, error: res.error };
    // Account has MFA enabled — password verified, advance to the TOTP step.
    if (res.data?.requiresTOTP && res.data.mfaPendingToken) {
      return { success: false, requiresTOTP: true, mfaPendingToken: res.data.mfaPendingToken };
    }
    if (res.data?.user) {
      setSession({ user: res.data.user });
    }
    return { success: true };
  };

  const handleVerifyTotp = async (mfaPendingToken: string, code: string) => {
    const res = await cmsApi<{ token: string; user: any }>('/auth/totp/login', {
      method: 'POST',
      body: JSON.stringify({ mfaPendingToken, code }),
    });
    if (res.error) return { success: false, error: res.error };
    if (res.data?.user) {
      setSession({ user: res.data.user });
    }
    return { success: true };
  };

  const handleSetupComplete = async (data: { name: string; email: string; password: string }) => {
    const res = await cmsApi<any>('/setup/create-admin', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.error) return { success: false, error: res.error };
    setSetupRequired(false);
    return handleLogin(data.email, data.password);
  };

  if (loading) {
    return (
      <div className="prenta-admin" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 24, height: 24, border: '3px solid #e5e7eb', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  if (statusError) {
    return (
      <div className="prenta-admin" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ maxWidth: 520, width: '100%', border: '1px solid #e5e7eb', borderRadius: 12, padding: '28px 32px', background: '#fff', color: '#111827' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 500, margin: '0 0 8px' }}>Setup can&apos;t continue yet</h1>
          <p style={{ margin: 0, color: '#6b7280', lineHeight: 1.5 }}>{statusError}</p>
        </div>
      </div>
    );
  }

  // Optional: themeChrome={{ header: ClientSiteHeader, footer: ClientSiteFooter }}
  // Client-safe only — never put React on prenta.config.ts. View site stays the pixel check.
  return (
    <AdminRoot
        config={config}
        session={session}
        basePath={process.env.PRENTA_ADMIN_PATH ?? '/admin'}
        initialPath="/"
        setupRequired={setupRequired}
        onSetupComplete={handleSetupComplete}
        onLogin={handleLogin}
        onVerifyTotp={handleVerifyTotp}
        onLogout={() => setSession(null)}
        captchaConfig={captchaConfig}
        sentryDsn={process.env.NEXT_PUBLIC_SENTRY_DSN}
        loginPath="/securelogin"
        sectionRenderers={{ ...DEFAULT_SECTION_RENDERERS, ...customSectionRenderers }}
      />
  );
}
