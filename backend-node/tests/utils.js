const request = require("supertest");
const app = require("../src/app/app");
const pool = require("../src/config/db");

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

exports.registerAndLogin = async (name, email, pass) => {
  let res = await request(app)
    .post("/api/auth/register")
    .send({ name: name, email: email, password: pass })
    .expect(201);
  let id = res.body.id;

  res = await request(app)
    .post("/api/auth/login")
    .send({ email: email, password: pass })
    .expect(200);
  expect(res.body.token).toBeDefined();
  let token = res.body.token;
  return { id, token };
};

exports.createGroup = async (token, name) => {
  let res = await request(app)
    .post("/api/groups")
    .set("Authorization", `Bearer ${token}`)
    .send({ name })
    .expect(201);

  expect(res.body).toHaveProperty("id");
  return res.body.id;
};

exports.addGroupUser = async (token, groupId, userId) => {
  await request(app)
    .post(`/api/groups/${groupId}/user`)
    .set("Authorization", `Bearer ${token}`)
    .send({ addUserId: userId })
    .expect(200);
};
