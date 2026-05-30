const { Events } = require('discord.js');
const inviteCache = require('../inviteCache');

module.exports = {
  name: Events.InviteDelete,
  async execute(invite) {
    if (!invite.guild) return;
    inviteCache.deleteCached(invite.guild.id, invite.code);
  },
};
