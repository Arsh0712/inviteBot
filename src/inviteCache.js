const cache = new Map();

function snapshot(invites) {
  const map = new Map();
  for (const invite of invites.values()) {
    map.set(invite.code, invite.uses ?? 0);
  }
  return map;
}

async function loadGuild(guild) {
  try {
    const invites = await guild.invites.fetch();
    cache.set(guild.id, snapshot(invites));
    console.log(`[inviteCache] Cached ${invites.size} invites for guild ${guild.id}`);
  } catch (err) {
    console.error(`[inviteCache] Failed to fetch invites for guild ${guild.id}:`, err.message);
    cache.set(guild.id, new Map());
  }
}

function getCachedUses(guildId, code) {
  return cache.get(guildId)?.get(code) ?? 0;
}

function setCachedUses(guildId, code, uses) {
  let guildCache = cache.get(guildId);
  if (!guildCache) {
    guildCache = new Map();
    cache.set(guildId, guildCache);
  }
  guildCache.set(code, uses);
}

function deleteCached(guildId, code) {
  cache.get(guildId)?.delete(code);
}

/**
 * Compare cached uses with current invites to find which invite was used.
 * Returns the discord.js Invite object, or null if it cannot be determined.
 */
async function findUsedInvite(guild) {
  let current;
  try {
    current = await guild.invites.fetch();
  } catch (err) {
    console.error(`[inviteCache] Failed to refetch invites for guild ${guild.id}:`, err.message);
    return null;
  }

  const guildCache = cache.get(guild.id) ?? new Map();

  // Case 1: an invite still exists and its uses increased
  let used = null;
  for (const invite of current.values()) {
    const prev = guildCache.get(invite.code) ?? 0;
    if ((invite.uses ?? 0) > prev) {
      used = invite;
      break;
    }
  }

  // Case 2: an invite disappeared (e.g. single-use exhausted).
  if (!used) {
    for (const [code] of guildCache) {
      if (!current.has(code)) {
        // We can't return the original Invite object since it's gone,
        // but we can build a minimal shim with just the code.
        used = { code, inviter: null, uses: null, __gone: true };
        break;
      }
    }
  }

  // Replace cache with the fresh snapshot regardless.
  cache.set(guild.id, snapshot(current));

  return used;
}

module.exports = {
  loadGuild,
  getCachedUses,
  setCachedUses,
  deleteCached,
  findUsedInvite,
};
