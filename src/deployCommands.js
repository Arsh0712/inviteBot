const { REST, Routes } = require('discord.js');
const { DISCORD_TOKEN, DISCORD_CLIENT_ID } = require('./config');
const panel = require('./commands/panel');
const invites = require('./commands/invites');

const commands = [panel.data.toJSON(), invites.data.toJSON()];

(async () => {
  const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);
  console.log(`Registering ${commands.length} application commands globally...`);
  await rest.put(Routes.applicationCommands(DISCORD_CLIENT_ID), { body: commands });
  console.log('Done. (Global commands can take up to 1 hour to propagate.)');
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
