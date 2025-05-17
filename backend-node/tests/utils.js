exports.databaseCleanup = async () => {
  await pool.query(`
      TRUNCATE TABLE 
        users, user_tokens, user_auth_providers, 
        calendars, calendar_shared_users, 
        events, calendar_subscriptions, 
        groups, group_members, 
        user_availability, polls, 
        poll_invited_users, poll_time_ranges, poll_votes
      RESTART IDENTITY CASCADE;
    `);
};
