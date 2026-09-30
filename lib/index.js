/**
 * dsh-solarized-themes — host half.
 *
 * Deliberately empty: this plugin is client-only. The browser half
 * (client/index.js) registers the two Solarized themes through
 * `ctx.theme.register` and persists the preference in localStorage, so no
 * host-side state or settings namespace is required. This file exists only
 * because the cordis loader imports the package root as a plugin.
 */

/** Stable cordis plugin name. */
export const name = 'solarized-themes'

/** No host services are required. */
export const inject = []

/**
 * Host plugin body — a no-op mount.
 * @param {import('@deepseek-ai/cordis').Context} _ctx - host plugin context (unused).
 */
export function apply(_ctx) {
  // nothing to do on the host plane
}
