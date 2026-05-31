const mysql = require('mysql2/promise');
const { DATABASE_URL } = require('./config');

const pool = mysql.createPool(DATABASE_URL);

async function initSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS invite_counts (
      guild_id   VARCHAR(32) NOT NULL,
      inviter_id VARCHAR(32) NOT NULL,
      count      INT NOT NULL DEFAULT 0,
      PRIMARY KEY (guild_id, inviter_id)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS invite_logs (
      id          BIGINT AUTO_INCREMENT PRIMARY KEY,
      guild_id    VARCHAR(32) NOT NULL,
      inviter_id  VARCHAR(32),
      invitee_id  VARCHAR(32) NOT NULL,
      invite_code VARCHAR(32),
      created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_guild_inviter (guild_id, inviter_id)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS invite_owners (
      guild_id    VARCHAR(32) NOT NULL,
      invite_code VARCHAR(32) NOT NULL,
      owner_id    VARCHAR(32) NOT NULL,
      created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (guild_id, invite_code)
    )
  `);
}

async function incrementInviteCount(guildId, inviterId) {
  await pool.query(
    `INSERT INTO invite_counts (guild_id, inviter_id, count)
     VALUES (?, ?, 1)
     ON DUPLICATE KEY UPDATE count = count + 1`,
    [guildId, inviterId]
  );
}

async function getInviteCount(guildId, inviterId) {
  const [rows] = await pool.query(
    `SELECT count FROM invite_counts WHERE guild_id = ? AND inviter_id = ?`,
    [guildId, inviterId]
  );
  return rows[0]?.count ?? 0;
}

async function logInvite({ guildId, inviterId, inviteeId, inviteCode }) {
  await pool.query(
    `INSERT INTO invite_logs (guild_id, inviter_id, invitee_id, invite_code)
     VALUES (?, ?, ?, ?)`,
    [guildId, inviterId, inviteeId, inviteCode]
  );
}

async function saveInviteOwner(guildId, inviteCode, ownerId) {
  await pool.query(
    `INSERT INTO invite_owners (guild_id, invite_code, owner_id)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE owner_id = VALUES(owner_id)`,
    [guildId, inviteCode, ownerId]
  );
}

async function getInviteOwner(guildId, inviteCode) {
  const [rows] = await pool.query(
    `SELECT owner_id FROM invite_owners WHERE guild_id = ? AND invite_code = ?`,
    [guildId, inviteCode]
  );
  return rows[0]?.owner_id ?? null;
}

async function getOwnerInvite(guildId, ownerId) {
  const [rows] = await pool.query(
    `SELECT invite_code FROM invite_owners
     WHERE guild_id = ? AND owner_id = ?
     ORDER BY created_at DESC LIMIT 1`,
    [guildId, ownerId]
  );
  return rows[0]?.invite_code ?? null;
}

async function getInviteesByInviter(guildId, inviterId) {
  const [rows] = await pool.query(
    `SELECT invitee_id, created_at FROM invite_logs
     WHERE guild_id = ? AND inviter_id = ?
     ORDER BY created_at DESC`,
    [guildId, inviterId]
  );
  return rows;
}

async function getInviterOfInvitee(guildId, inviteeId) {
  const [rows] = await pool.query(
    `SELECT inviter_id, created_at FROM invite_logs
     WHERE guild_id = ? AND invitee_id = ?
     ORDER BY created_at DESC LIMIT 1`,
    [guildId, inviteeId]
  );
  return rows[0] ?? null;
}

module.exports = {
  pool,
  initSchema,
  incrementInviteCount,
  getInviteCount,
  logInvite,
  saveInviteOwner,
  getInviteOwner,
  getOwnerInvite,
  getInviteesByInviter,
  getInviterOfInvitee,
};
