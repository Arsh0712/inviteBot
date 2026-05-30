const { Events, REST, Routes } = require('discord.js');
const inviteCache = require('../inviteCache');
const { DISCORD_TOKEN } = require('../config');

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    console.log(`Logged in as ${client.user.tag}`);

    const commands = client.commands.map((c) => c.data.toJSON());
    const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

    for (const guild of client.guilds.cache.values()) {
      await inviteCache.loadGuild(guild);
      try {
        await rest.put(Routes.applicationGuildCommands(client.user.id, guild.id), { body: commands });
        console.log(`[ready] Registered ${commands.length} commands for guild ${guild.id}`);
      } catch (err) {
        console.error(`[ready] Failed to register commands for guild ${guild.id}:`, err.message);
      }
    }
  },
};
