const { Events } = require('discord.js');
const inviteCache = require('../inviteCache');

module.exports = {
  name: Events.GuildCreate,
  async execute(guild) {
    await inviteCache.loadGuild(guild);
  },
};
