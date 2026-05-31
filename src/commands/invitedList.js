const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getInviteesByInviter } = require('../db');
const { hasAdminRole } = require('../permissions');

const data = new SlashCommandBuilder()
  .setName('invited-list')
  .setDescription('指定したユーザーが招待した人の一覧を表示します（管理者ロール限定）')
  .addUserOption(opt =>
    opt.setName('user').setDescription('招待者').setRequired(true)
  )
  .setDMPermission(false);

async function execute(interaction) {
  if (!hasAdminRole(interaction)) {
    await interaction.reply({ content: 'このコマンドを実行する権限がありません。', ephemeral: true });
    return;
  }

  const target = interaction.options.getUser('user');
  const rows = await getInviteesByInviter(interaction.guildId, target.id);

  if (rows.length === 0) {
    await interaction.reply({
      content: `<@${target.id}> が招待した人はまだいません。`,
      ephemeral: true,
    });
    return;
  }

  const lines = rows.map((r, i) => {
    const ts = Math.floor(new Date(r.created_at).getTime() / 1000);
    return `${i + 1}. <@${r.invitee_id}> — <t:${ts}:f>`;
  });

  // Discord embed description has 4096 char limit; chunk if needed
  const chunks = [];
  let buf = '';
  for (const line of lines) {
    if ((buf + '\n' + line).length > 3800) {
      chunks.push(buf);
      buf = line;
    } else {
      buf = buf ? buf + '\n' + line : line;
    }
  }
  if (buf) chunks.push(buf);

  await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setTitle(`📋 ${target.tag} が招待した人 (${rows.length} 人)`)
        .setDescription(chunks[0])
        .setColor(0x5865f2),
    ],
    ephemeral: true,
  });

  for (let i = 1; i < chunks.length; i++) {
    await interaction.followUp({
      embeds: [new EmbedBuilder().setDescription(chunks[i]).setColor(0x5865f2)],
      ephemeral: true,
    });
  }
}

module.exports = { data, execute };
