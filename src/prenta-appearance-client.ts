/**
 * Browser stand-in for `@prenta/core/appearance`.
 *
 * The published barrel also exports favicon rasterizing, which imports the
 * CMS route helpers and `@sentry/node`. The admin client only needs the
 * theme, logo, and brand helpers. The server compiler does not use this file.
 */
export {
  parsePublicTheme,
  publicThemeCssVars,
  publicThemeFieldError,
  toPublicBrandVoice,
  DESIGN_SYSTEM_INSTRUCTIONS,
} from '../node_modules/@prenta/core/dist/appearance/public-theme.js';
export { classifyLogoShape, logoShapeWarning } from '../node_modules/@prenta/core/dist/appearance/logo-shape.js';
export {
  parseColorToLinear,
  relativeLuminance,
  contrastRatio,
  isParseableColor,
  mixOklch,
  toHex,
} from '../node_modules/@prenta/core/dist/appearance/color.js';
export {
  ACCENT_PRESETS,
  ACCENT_PRESET_LIST,
  MIN_ACCENT_CONTRAST,
  ACCENT_TUNED_CONTRAST,
  tuneAccent,
  isAccentPreset,
  validateAccentColor,
  generateAdminThemeTokens,
  accentTokensToCssVars,
  accentPickCssVars,
} from '../node_modules/@prenta/core/dist/appearance/theme-tokens.js';
export {
  SETTINGS_GLOBAL_COLLECTION,
  DEFAULT_APPEARANCE,
  DEFAULT_BRAND,
  siteInitials,
  resolveAdminBrand,
  resolvePublicBrand,
  getFaviconMetadata,
  parseAppearance,
  parseBrand,
  brandAssetIds,
  gatherBrandAssets,
  getAppearanceSettings,
  getBrandSettings,
  resolveBrand,
} from '../node_modules/@prenta/core/dist/appearance/resolve.js';
export {
  APPLE_TOUCH_ICON_PATH,
  APPLE_TOUCH_PIXEL_SIZE,
  FAVICON_ICON_PATH,
  FAVICON_PIXEL_SIZE,
} from '../node_modules/@prenta/core/dist/appearance/favicon-paths.js';
