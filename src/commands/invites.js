const { SlashCommandBuilder } = require('discord.js');
const { getInviteCount } = require('../db');

const data = new SlashCommandBuilder()
  .setName('invites')
  .setDescription('累計招待数を確認します')
  .addUserOption(opt =>
    opt.setName('user').setDescription('対象ユーザー（省略時は自分）').setRequired(false)
  )
  .setDMPermission(false);

async function execute(interaction) {
  const target = interaction.options.getUser('user') ?? interaction.user;
  const count = await getInviteCount(interaction.guildId, target.id);
  await interaction.reply({
    content: `<@${target.id}> の累計招待数は **${count} 人** です。`,
    ephemeral: true,
  });
}

module.exports = { data, execute };
