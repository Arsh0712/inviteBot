require('dotenv').config();

const {
  DISCORD_TOKEN,
  DISCORD_CLIENT_ID,
  DATABASE_URL,
  MYSQL_URL,
} = process.env;

if (!DISCORD_TOKEN) {
  throw new Error('DISCORD_TOKEN is required');
}
if (!DISCORD_CLIENT_ID) {
  throw new Error('DISCORD_CLIENT_ID is required');
}

const databaseUrl = DATABASE_URL || MYSQL_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL (or MYSQL_URL) is required');
}

module.exports = {
  DISCORD_TOKEN,
  DISCORD_CLIENT_ID,
  DATABASE_URL: databaseUrl,
};
