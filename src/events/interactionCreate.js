const { Events } = require('discord.js');
const db = require('../db');
const inviteCache = require('../inviteCache');

async function handleIssueInvite(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const guild = interaction.guild;
  const userId = interaction.user.id;
  const targetChannel = interaction.channel;

  // Check for existing owner invite
  const existingCode = await db.getOwnerInvite(guild.id, userId);
  if (existingCode) {
    try {
      const invites = await guild.invites.fetch();
      if (invites.has(existingCode)) {
        await interaction.editReply(
          `あなたの招待リンク: https://discord.gg/${existingCode}`
        );
        return;
      }
    } catch (err) {
      console.error('[interactionCreate] Failed to fetch existing invites:', err.message);
    }
    // The recorded invite no longer exists — fall through to create a new one.
  }

  let invite;
  try {
    invite = await targetChannel.createInvite({
      maxAge: 0,
      maxUses: 0,
      unique: true,
      reason: `Issued via panel for user ${interaction.user.tag} (${userId})`,
    });
  } catch (err) {
    console.error('[interactionCreate] createInvite failed:', err);
    await interaction.editReply('招待リンクの発行に失敗しました。Bot の権限を確認してください。');
    return;
  }

  await db.saveInviteOwner(guild.id, invite.code, userId);
  inviteCache.setCachedUses(guild.id, invite.code, invite.uses ?? 0);

  await interaction.editReply(`あなたの招待リンク: https://discord.gg/${invite.code}`);
}

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    try {
      if (interaction.isChatInputCommand()) {
        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) return;
        await command.execute(interaction);
        return;
      }

      if (interaction.isButton()) {
        if (interaction.customId === 'issue_invite') {
          await handleIssueInvite(interaction);
        }
      }
    } catch (err) {
      console.error('[interactionCreate] handler error:', err);
      const msg = 'エラーが発生しました。しばらくしてから再度お試しください。';
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply(msg).catch(() => {});
      } else {
        await interaction.reply({ content: msg, ephemeral: true }).catch(() => {});
      }
    }
  },
};
