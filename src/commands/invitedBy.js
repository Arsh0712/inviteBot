const { SlashCommandBuilder } = require('discord.js');
const { getInviterOfInvitee } = require('../db');
const { hasAdminRole } = require('../permissions');

const data = new SlashCommandBuilder()
  .setName('invited-by')
  .setDescription('指定したユーザーが誰の招待で入ったかを表示します（管理者ロール限定）')
  .addUserOption(opt =>
    opt.setName('user').setDescription('対象ユーザー').setRequired(true)
  )
  .setDMPermission(false);

async function execute(interaction) {
  if (!hasAdminRole(interaction)) {
    await interaction.reply({ content: 'このコマンドを実行する権限がありません。', ephemeral: true });
    return;
  }

  const target = interaction.options.getUser('user');
  const row = await getInviterOfInvitee(interaction.guildId, target.id);

  if (!row) {
    await interaction.reply({
      content: `<@${target.id}> の招待元の記録は見つかりませんでした。`,
      ephemeral: true,
    });
    return;
  }

  const ts = Math.floor(new Date(row.created_at).getTime() / 1000);
  const inviterText = row.inviter_id ? `<@${row.inviter_id}>` : '不明';

  await interaction.reply({
    content: `<@${target.id}> は ${inviterText} の招待で参加しました（<t:${ts}:f>）。`,
    ephemeral: true,
  });
}

module.exports = { data, execute };
