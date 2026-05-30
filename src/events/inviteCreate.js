const { Events } = require('discord.js');
const inviteCache = require('../inviteCache');

module.exports = {
  name: Events.InviteCreate,
  async execute(invite) {
    if (!invite.guild) return;
    inviteCache.setCachedUses(invite.guild.id, invite.code, invite.uses ?? 0);
  },
};
