const { Events } = require('discord.js');
const inviteCache = require('../inviteCache');
const db = require('../db');
const { notifyMemberJoin } = require('../notifier');

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member) {
    if (member.user.bot) return;

    const guild = member.guild;
    const used = await inviteCache.findUsedInvite(guild);

    let inviterId = null;
    let inviteCode = null;

    if (used) {
      inviteCode = used.code;
      // Priority 1: bot-issued invite → look up the owner we recorded
      inviterId = await db.getInviteOwner(guild.id, used.code);
      // Priority 2: fall back to the invite's own inviter field (manual invites)
      if (!inviterId && used.inviter && !used.inviter.bot) {
        inviterId = used.inviter.id;
      }
    }

    let inviter = null;
    let totalCount = 0;

    if (inviterId) {
      await db.incrementInviteCount(guild.id, inviterId);
      totalCount = await db.getInviteCount(guild.id, inviterId);
      inviter = await member.client.users.fetch(inviterId).catch(() => null);
    }

    await db.logInvite({
      guildId: guild.id,
      inviterId,
      inviteeId: member.id,
      inviteCode,
    });

    await notifyMemberJoin(member.client, {
      guild,
      member,
      inviter,
      totalCount,
    });
  },
};
