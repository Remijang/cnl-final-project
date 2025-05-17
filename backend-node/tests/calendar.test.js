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

describe("Calendar API", () => {
  let tokena, tokenb;
  let calendaraId, calendarbId;
  let res;
  beforeAll(async () => {
    await databaseCleanup();
    res = await request(app)
      .post("/api/auth/register")
      .send({ name: "a", email: "a@example.com", password: "testpass" });
    expect(res.statusCode).toBe(201);

    res = await request(app)
      .post("/api/auth/login")
      .send({ email: "a@example.com", password: "testpass" });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    tokena = res.body.token;

    res = await request(app)
      .post("/api/auth/register")
      .send({ name: "b", email: "b@example.com", password: "testpass" });
    expect(res.statusCode).toBe(201);

    res = await request(app)
      .post("/api/auth/login")
      .send({ email: "b@example.com", password: "testpass" });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    tokenb = res.body.token;

    res = await request(app)
      .post("/api/calendars")
      .set("Authorization", `Bearer ${tokena}`)
      .send({ title: "Calendar A" })
      .expect(201);

    expect(res.body.title).toBe("Calendar A");
    expect(res.body.id).toBeDefined();

    calendaraId = res.body.id;

    res = await request(app)
      .post("/api/calendars")
      .set("Authorization", `Bearer ${tokenb}`)
      .send({ title: "Calenda B" })
      .expect(201);

    expect(res.body.title).toBe("Calendar B");
    expect(res.body.id).toBeDefined();

    calendarbId = res.body.id;
  });

  it("should return its own calendars", async () => {
    res = await request(app)
      .get("/api/calendars/owned")
      .set("Authorization", `Bearer ${tokena}`)
      .expect(200);

    expect(res.body.map((c) => c.title)).toContain("Calendar A");
    expect(res.body.map((c) => c.title)).not.toContain("Calendar B");

    res = await request(app)
      .get("/api/calendars/owned")
      .set("Authorization", `Bearer ${tokenb}`)
      .expect(200);

    expect(res.body.map((c) => c.title)).not.toContain("Calendar A");
    expect(res.body.map((c) => c.title)).toContain("Calendar B");
  });

  // it("GET /calendars/aggregated returns owned + shared calendars", async () => {});

  it("should update its calendar and only its", async () => {
    res = await request(app)
      .put(`/calendars/${calendaraId}`)
      .set("Authorization", `Bearer ${tokena}`)
      .send({ title: "New Title A" })
      .expect(200);

    expect(res.body.title).toBe("New Title A");

    res = await request(app)
      .put(`/api/calendars/${calendarbId}`)
      .set("Authorization", `Bearer ${tokena}`)
      .send({ title: "New Title A" })
      .expect(500);
    res = await request(app)
      .put(`/api/calendars/${calendarbId}`)
      .send({ title: "New Title A" })
      .expect(401);
  });

  it("delete its calendar and only its", async () => {
    res = await request(app)
      .delete(`/api/calendars/${calendaraId}`)
      .set("Authorization", `Bearer ${tokena}`)
      .expect(200);

    res = await request(app)
      .get("/api/calendars/owned")
      .set("Authorization", `Bearer ${tokena}`)
      .expect(200);

    expect(res.body.length).toBe(0);

    res = await request(app)
      .delete(`/api/calendars/${calendarbId}`)
      .expect(401);
    res = await request(app).delete(`/calendars/${calendarbId}`).expect(500);
  });
});
