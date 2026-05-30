const { Events } = require('discord.js');
const inviteCache = require('../inviteCache');

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    console.log(`Logged in as ${client.user.tag}`);
    for (const guild of client.guilds.cache.values()) {
      await inviteCache.loadGuild(guild);
    }
  },
};
