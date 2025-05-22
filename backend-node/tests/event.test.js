const request = require("supertest");
const app = require("../src/app/app");
const util = require("./utils");

describe("Event API", () => {
  let tokena, tokenb, calendarId, eventId;
  beforeEach(async () => {
    let res;
    await util.databaseCleanup();
    ({ id: _, token: tokena } = await util.registerAndLogin(
      "a",
      "a@example.com",
      "passwordA"
    ));

    ({ id: _, token: tokenb } = await util.registerAndLogin(
      "b",
      "b@example.com",
      "passwordB"
    ));

    res = await request(app)
      .post("/api/calendars")
      .set("Authorization", `Bearer ${tokena}`)
      .send({ title: "Calendar A" })
      .expect(201);

    expect(res.body.title).toBe("Calendar A");
    expect(res.body.id).toBeDefined();

    calendarId = res.body.id;

    res = await request(app)
      .post("/api/events")
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
    let res;
    res = await request(app)
      .post("/api/events")
      .set("Authorization", `Bearer ${tokena}`)
      .send({
        calendar_id: calendarId,
        title: "New Event 2",
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 3600000).toISOString(),
      })
      .expect(201);

    res = await request(app)
      .get(`/api/events/calendar/${calendarId}`)
      .set("Authorization", `Bearer ${tokena}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
    expect(res.body[0].title).toBe("New Event");
  });

  it("should reject if not authenticated", async () => {
    let res;
    await request(app)
      .post("/api/events")
      .send({
        calendar_id: calendarId,
        title: "Anonymous Event",
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 3600000).toISOString(),
      })
      .expect(401);

    await request(app).delete(`/api/events/${eventId}`).expect(401);

    res = await request(app)
      .put(`/api/events/${eventId}`)
      .send({
        title: "Updated Event",
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 7200000).toISOString(),
      })
      .expect(401);
  });

  it("should reject if permission is wrong", async () => {
    let res;

    await request(app)
      .post("/api/events")
      .set("Authorization", `Bearer ${tokenb}`)
      .send({
        calendar_id: calendarId,
        title: "Anonymous Event",
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 3600000).toISOString(),
      })
      .expect(403);

    await request(app)
      .delete(`/api/events/${eventId}`)
      .set("Authorization", `Bearer ${tokenb}`)
      .expect(403);

    res = await request(app)
      .put(`/api/events/${eventId}`)
      .set("Authorization", `Bearer ${tokenb}`)
      .send({
        title: "Updated Event",
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 7200000).toISOString(),
      })
      .expect(403);
  });

  it("should delete event", async () => {
    let res;
    await request(app)
      .delete(`/api/events/${eventId}`)
      .set("Authorization", `Bearer ${tokena}`)
      .expect(204);

    res = await request(app)
      .get(`/api/events/calendar/${calendarId}`)
      .set("Authorization", `Bearer ${tokena}`)
      .expect(200);
    expect(res.body.length).toBe(0);
  });

  it("should update event title and time", async () => {
    const res = await request(app)
      .put(`/api/events/${eventId}`)
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
