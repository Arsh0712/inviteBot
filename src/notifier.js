const { EmbedBuilder } = require('discord.js');
const { LOG_CHANNEL_ID } = require('./constants');

async function notifyMemberJoin(client, { guild, member, inviter, totalCount }) {
  if (!LOG_CHANNEL_ID) {
    console.warn('[notifier] LOG_CHANNEL_ID is not configured. Skipping channel post.');
    console.log('[notifier] join:', {
      guild: guild.id,
      member: member.id,
      inviter: inviter?.id ?? 'unknown',
      totalCount,
    });
    return;
  }

  const channel = await client.channels.fetch(LOG_CHANNEL_ID).catch(() => null);
  if (!channel || !channel.isTextBased()) {
    console.error(`[notifier] LOG_CHANNEL_ID ${LOG_CHANNEL_ID} not found or not text-based.`);
    return;
  }

  const embed = new EmbedBuilder()
    .setTitle('🎉 新メンバー参加')
    .setColor(0x57f287)
    .addFields(
      { name: '👤 参加者', value: `<@${member.id}>`, inline: false },
      {
        name: '🔗 招待者',
        value: inviter ? `<@${inviter.id}>` : '不明（Vanity URL かキャッシュ未同期の可能性）',
        inline: false,
      },
      {
        name: '📊 累計招待数',
        value: inviter ? `${totalCount} 人` : '—',
        inline: false,
      }
    );

  await channel.send({ embeds: [embed] });
}

module.exports = { notifyMemberJoin };
