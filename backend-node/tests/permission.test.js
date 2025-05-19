const request = require("supertest");
const app = require("../src/app/app");
const util = require("./utils");

describe("Permission API", () => {
  let tokenA, tokenB;
  let calendarAId, calendarBId;
  let res;
  beforeAll(async () => {
    await util.databaseCleanup();
    res = await request(app)
      .post("/api/auth/register")
      .send({ name: "a", email: "a@example.com", password: "testpass" });
    expect(res.statusCode).toBe(201);

    res = await request(app)
      .post("/api/auth/login")
      .send({ email: "a@example.com", password: "testpass" });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    tokenA = res.body.token;

    res = await request(app)
      .post("/api/auth/register")
      .send({ name: "b", email: "b@example.com", password: "testpass" });
    expect(res.statusCode).toBe(201);

    res = await request(app)
      .post("/api/auth/login")
      .send({ email: "b@example.com", password: "testpass" });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    tokenB = res.body.token;

    res = await request(app)
      .post("/api/calendars")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ title: "Calendar A" })
      .expect(201);

    expect(res.body.title).toBe("Calendar A");
    expect(res.body.id).toBeDefined();

    calendarAId = res.body.id;

    res = await request(app)
      .post("/api/calendars")
      .set("Authorization", `Bearer ${tokenB}`)
      .send({ title: "Calendar B" })
      .expect(201);

    expect(res.body.title).toBe("Calendar B");
    expect(res.body.id).toBeDefined();

    calendarBId = res.body.id;
  });

  it("should turn on / off visibility", async () => {
    let res;
    res = await request(app)
      .post(`/api/permission/${calendarBId}/visibility/on`)
      .set("Authorization", `Bearer ${tokenB}`)
      .expect(200);
    expect(res.body.visibility).toBe(true);

    res = await request(app)
      .get("/api/calendars/aggregated")
      .set("Authorization", `Bearer ${tokenA}`)
      .expect(200);

    expect(res.body.length).toBe(2);

    res = await request(app)
      .post(`/api/permission/${calendarBId}/visibility/off`)
      .set("Authorization", `Bearer ${tokenB}`)
      .expect(200);

    res = await request(app)
      .get("/api/calendars/aggregated")
      .set("Authorization", `Bearer ${tokenA}`)
      .expect(200);

    expect(res.body.length).toBe(1);
  });

  it("should get read link and add get the read permission", async () => {
    res = await request(app)
      .post(`/api/permission/${calendarBId}/read/on`)
      .set("Authorization", `Bearer ${tokenB}`)
      .expect(200);
    const key = res.body.read_link;
    res = await request(app)
      .post(`/api/permission/${calendarBId}/read/claim?key=${key}`)
      .set("Authorization", `Bearer ${tokenA}`)
      .expect(200);

    res = await request(app)
      .get("/api/calendars/aggregated")
      .set("Authorization", `Bearer ${tokenA}`)
      .expect(200);
    expect(res.body.length).toBe(2);

    res = await request(app)
      .post("/api/events")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        calendar_id: calendarBId,
        title: "New Event 2",
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 3600000).toISOString(),
      })
      .expect(403);

    res = await request(app)
      .post(`/api/permission/${calendarBId}/read/off`)
      .set("Authorization", `Bearer ${tokenB}`)
      .expect(200);

    res = await request(app)
      .get("/api/calendars/aggregated")
      .set("Authorization", `Bearer ${tokenA}`)
      .expect(200);
    expect(res.body.length).toBe(1);
  });
});
