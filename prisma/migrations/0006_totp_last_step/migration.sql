-- Single-use TOTP: track the last consumed time-step so a still-valid code
-- can't be replayed within its ~90s window (#565). Nullable with no default —
-- additive and safe on existing rows (null = no TOTP step consumed yet).
ALTER TABLE "actuate_users" ADD COLUMN "lastTotpStep" INTEGER;
