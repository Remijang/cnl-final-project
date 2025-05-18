const request = require("supertest");
const app = require("../src/app/app");
const util = require("./utils");

describe("Calendar API", () => {
  let tokena, tokenb;
  let calendaraId, calendarbId;
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
      .send({ title: "Calendar B" })
      .expect(201);

    expect(res.body.title).toBe("Calendar B");
    expect(res.body.id).toBeDefined();

    calendarbId = res.body.id;

    res = await request(app)
      .post(`/api/permission/${calendarbId}/visibility/on`)
      .set("Authorization", `Bearer ${tokenb}`)
      .expect(200);

    expect(res.body.visibility).toBe(true);
    expect(res.body.id).toBeDefined();
  });

  it("should subscribe to a calendar", async () => {
    // add permission
    let res;
    res = await request(app)
      .post(`/api/subscriptions/${calendarbId}/subscribe`)
      .set("Authorization", `Bearer ${tokena}`)
      .expect(200);
    res = await request(app)
      .get("/api/calendars/subscribed")
      .set("Authorization", `Bearer ${tokena}`)
      .expect(200);

    expect(res.body.map((c) => c.title)).toContain("Calendar A");
    expect(res.body.map((c) => c.title)).toContain("Calendar B");
  });

  it("should unsubscribe from a calendar", async () => {
    let res;
    res = await request(app)
      .post(`/api/subscriptions/${calendarbId}/unsubscribe`)
      .set("Authorization", `Bearer ${tokena}`)
      .expect(200);
  });

  it("should not unsubscribe an already unsubscribed calendar", async () => {
    let res;
    res = await request(app)
      .post(`/api/subscriptions/${calendarbId}/unsubscribe`)
      .set("Authorization", `Bearer ${tokena}`)
      .expect(404);
  });

  it("should return 409 if already subscribed", async () => {
    // check permission

    await request(app)
      .post(`/api/subscriptions/${calendarbId}/subscribe`)
      .set("Authorization", `Bearer ${tokena}`)
      .expect(200);

    await request(app)
      .post(`/api/subscriptions/${calendarbId}/subscribe`)
      .set("Authorization", `Bearer ${tokena}`)
      .expect(409);
  });
});
