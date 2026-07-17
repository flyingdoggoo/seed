/**
 * Legacy remapping layer — intentionally emptied.
 *
 * Real people are now seeded authoritatively in
 * `modules/users/real-accounts.ts` with their @ehub.enosta.com logins and a
 * separate larkEmail for Lark resolution. The old name/email remapping (which
 * turned virtual users into real people via gmail/team.enosta.com addresses)
 * would double-seed those same people, so it is disabled.
 *
 * The maps are kept as empty objects so existing `map[x] || x` fallbacks pass the
 * original value through unchanged.
 */

export const nameMappings: Record<string, string> = {};

export const emailMappings: Record<string, string> = {};
