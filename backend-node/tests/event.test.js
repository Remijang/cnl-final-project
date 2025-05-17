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

describe("Event API", () => {
  let tokena, tokenb, calendarId, eventId;
  beforeAll(async () => {
    let res;
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

    calendarId = res.body.id;

    res = await request(app)
      .post("/events")
      .set("Authorization", `Bearer ${tokena}`)
      .send({
        calendar_id: calendarId,
        title: "New Event",
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 3600000).toISOString(),
      })
      .expect(201);

    eventId = res.body.id;
  });

  it("should create new event and retrieve the event", async () => {
    res = await request(app)
      .post("/events")
      .set("Authorization", `Bearer ${tokena}`)
      .send({
        calendar_id: calendarId,
        title: "New Event 2",
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 3600000).toISOString(),
      })
      .expect(201);

    expect(res.body.length).toBe(2);

    res = await request(app)
      .get(`/events/calendar/${calendarId}`)
      .set("Authorization", `Bearer ${tokena}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].title).toBe("New ");
  });

  it("should reject if not authenticated", async () => {
    let res;
    await request(app)
      .post("/events")
      .send({
        calendar_id: calendarId,
        title: "Anonymous Event",
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 3600000).toISOString(),
      })
      .expect(401);

    await request(app).delete(`/events/${eventId}`).expect(401);

    res = await request(app)
      .put(`/events/${eventId}`)
      .send({
        title: "Updated Event",
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 7200000).toISOString(),
      })
      .expect(401);
  });

  it("should reject if permission is wrong", async () => {
    let res;
    res = await request(app)
      .post("/events")
      .set("Authorization", `Bearer ${tokena}`)
      .send({
        calendar_id: calendarId,
        title: "New Event",
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 3600000).toISOString(),
      })
      .expect(201);

    const eventId = res.body.id;

    await request(app)
      .post("/events")
      .set("Authorization", `Bearer ${tokenb}`)
      .send({
        calendar_id: calendarId,
        title: "Anonymous Event",
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 3600000).toISOString(),
      })
      .expect(401);

    await request(app)
      .delete(`/events/${eventId}`)
      .set("Authorization", `Bearer ${tokenb}`)
      .expect(401);

    res = await request(app)
      .put(`/events/${eventId}`)
      .set("Authorization", `Bearer ${tokenb}`)
      .send({
        title: "Updated Event",
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 7200000).toISOString(),
      })
      .expect(401);
  });

  it("should delete event", async () => {
    let res;
    await request(app)
      .delete(`/events/${eventId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .expect(204);

    res = await request(app)
      .get(`/events/calendar/${calendarId}`)
      .set("Authorization", `Bearer ${tokena}`)
      .expect(200);
    expect(res.body.rowCount).toBe(0);
  });

  it("should update event title and time", async () => {
    const res = await request(app)
      .put(`/events/${eventId}`)
      .set("Authorization", `Bearer ${tokena}`)
      .send({
        title: "Updated Event",
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 7200000).toISOString(),
      })
      .expect(200);

    expect(res.body.title).toBe("Updated Event");
  });
});
