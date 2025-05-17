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
  let tokena, tokenb, uida, uidb;
  databaseCleanup();

  it("register and login user A and B", async () => {
    let res;

    res = await request(app)
      .post("/api/auth/register")
      .send({ name: a, email: "a@example.com", password: "testpass" });
    expect(res.statusCode).toBe(201);

    res = await request(app)
      .post("/api/auth/login")
      .send({ email: "a@example.com", password: "testpass" });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    tokena = res.body.token;

    res = await request(app)
      .post("/api/auth/register")
      .send({ name: a, email: "b@example.com", password: "testpass" });
    expect(res.statusCode).toBe(201);

    res = await request(app)
      .post("/api/auth/login")
      .send({ email: "b@example.com", password: "testpass" });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    tokenb = res.body.token;
  });

  let calendaraId, calendarbId;
  it("POST /calendar for a and b", async () => {
    res = await request(app)
      .post("/calendars")
      .set("Authorization", `Bearer ${tokena}`)
      .send({ title: "Calendar A" })
      .expect(201);

    expect(res.body.title).toBe("Calendar A");
    expect(res.body.id).toBeDefined();

    calendaraId = res.body.id;

    res = await request(app)
      .post("/calendars")
      .set("Authorization", `Bearer ${tokenb}`)
      .send({ title: "Calenda B" })
      .expect(201);

    expect(res.body.title).toBe("Calendar B");
    expect(res.body.id).toBeDefined();

    calendarbId = res.body.id;
  });

  it("GET /calendars/owned returns owned calendars", async () => {
    res = await request(app)
      .get("/calendars/owned")
      .set("Authorization", `Bearer ${tokena}`)
      .expect(200);

    expect(res.body.map((c) => c.title)).toContain("Calendar A");
    expect(res.body.map((c) => c.title)).not.toContain("Calendar B");

    res = await request(app)
      .get("/calendars/owned")
      .set("Authorization", `Bearer ${tokenb}`)
      .expect(200);

    expect(res.body.map((c) => c.title)).not.toContain("Calendar A");
    expect(res.body.map((c) => c.title)).toContain("Calendar B");
  });

  it("GET /calendars/aggregated returns owned + shared calendars", async () => {});

  test("PUT /calendars/:id updates a calendar", async () => {
    res = await request(app)
      .put(`/calendars/${calendaraId}`)
      .set("Authorization", `Bearer ${tokena}`)
      .send({ title: "New Title A" })
      .expect(200);

    expect(res.body.title).toBe("New Title A");

    res = await request(app)
      .put(`/calendars/${calendarbId}`)
      .set("Authorization", `Bearer ${tokena}`)
      .send({ title: "New Title A" })
      .expect(500);
    res = await request(app)
      .put(`/calendars/${calendarbId}`)
      .send({ title: "New Title A" })
      .expect(500);
  });

  it("DELETE /calendars/:id deletes owned calendar", async () => {
    res = await request(app)
      .delete(`/calendars/${calendaraId}`)
      .set("Authorization", `Bearer ${tokena}`)
      .expect(200);

    res = await request(app)
      .get("/calendars/owned")
      .set("Authorization", `Bearer ${tokena}`)
      .expect(200);

    expect(res.body.length).toBe(0);

    res = await request(app)
      .delete(`/calendars/${calendarbId}`)
      .set("Authorization", `Bearer ${tokena}`)
      .expect(500);
    res = await request(app).delete(`/calendars/${calendarbId}`).expect(500);
  });
});
