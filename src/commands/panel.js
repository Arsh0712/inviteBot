const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

const data = new SlashCommandBuilder()
  .setName('panel')
  .setDescription('招待リンク発行パネルをこのチャンネルに設置します（管理者専用）')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .setDMPermission(false);

async function execute(interaction) {
  const embed = new EmbedBuilder()
    .setTitle('📨 招待リンク発行パネル')
    .setDescription('下のボタンを押すと、あなた専用の招待リンクを発行します。\nそのリンクから入ってきたメンバーは、あなたの招待としてカウントされます。')
    .setColor(0x5865f2);

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('issue_invite')
      .setLabel('🔗 招待リンクを発行')
      .setStyle(ButtonStyle.Primary)
  );

  await interaction.channel.send({ embeds: [embed], components: [row] });
  await interaction.reply({ content: 'パネルを設置しました。', ephemeral: true });
}

module.exports = { data, execute };
