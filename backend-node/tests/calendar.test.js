const request = require("supertest");
const app = require("../src/app/app");
const pool = require("../src/config/db");

const databaseCleanup = async () => {
  await pool.query("DELETE FROM users");
  await pool.query("DELETE FROM user_tokens");
  await pool.query("DELETE FROM user_auth_providers");
  await pool.query("DELETE FROM calendars");
  await pool.query("DELETE FROM calendar_shared_users");
  await pool.query("DELETE FROM events");
  await pool.query("DELETE FROM calendar_subscriptions");
  await pool.query("DELETE FROM groups");
  await pool.query("DELETE FROM group_members");
  await pool.query("DELETE FROM user_availability");
  await pool.query("DELETE FROM polls");
  await pool.query("DELETE FROM poll_invited_users");
  await pool.query("DELETE FROM poll_time_ranges");
  await pool.query("DELETE FROM poll_votes");
};

describe("Auth API", () => {
  let token;
  databaseCleanup();

  it("should register a user", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "test@example.com", password: "test123" });
    expect(res.statusCode).toBe(201);
  });

  it("should login the user", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@example.com", password: "test123" });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    token = res.body.token;
  });

  it("should fetch profile after login", async () => {
    const res = await request(app)
      .get("/api//profile")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe("test@example.com");
  });
});
