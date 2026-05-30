const { Events, REST, Routes } = require('discord.js');
const inviteCache = require('../inviteCache');
const { DISCORD_TOKEN } = require('../config');

module.exports = {
  name: Events.GuildCreate,
  async execute(guild) {
    await inviteCache.loadGuild(guild);

    const commands = guild.client.commands.map((c) => c.data.toJSON());
    const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);
    try {
      await rest.put(Routes.applicationGuildCommands(guild.client.user.id, guild.id), { body: commands });
      console.log(`[guildCreate] Registered ${commands.length} commands for guild ${guild.id}`);
    } catch (err) {
      console.error(`[guildCreate] Failed to register commands for guild ${guild.id}:`, err.message);
    }
  },
};
