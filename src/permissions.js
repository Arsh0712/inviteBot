const { ADMIN_ROLE_IDS } = require('./constants');

/**
 * Returns true if the interaction's invoker has any of the configured admin roles,
 * or if no admin roles are configured (open mode).
 */
function hasAdminRole(interaction) {
  if (!ADMIN_ROLE_IDS || ADMIN_ROLE_IDS.length === 0) return true;
  const member = interaction.member;
  if (!member || !member.roles) return false;
  const roleCache = member.roles.cache;
  if (!roleCache) return false;
  return ADMIN_ROLE_IDS.some((id) => roleCache.has(id));
}

module.exports = { hasAdminRole };
