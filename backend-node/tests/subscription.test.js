const request = require("supertest");
const app = require("../src/app/app");
const util = require("./utils");

let visibilityOn = async function (calendarId, token) {
  res = await request(app)
    .post(`/api/permission/${calendarId}/visibility/on`)
    .set("Authorization", `Bearer ${token}`)
    .expect(200);
  expect(res.body.visibility).toBe(true);
};

let visibilityOff = async function (calendarId, token) {
  res = await request(app)
    .post(`/api/permission/${calendarId}/visibility/off`)
    .set("Authorization", `Bearer ${token}`)
    .expect(200);
  expect(res.body.visibility).toBe(false);
};

let subscribe = async function (calendarId, token) {
  res = await request(app)
    .post(`/api/subscriptions/${calendarId}/subscribe`)
    .set("Authorization", `Bearer ${token}`)
    .expect(200);
};

describe("Subscription API", () => {
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
  });

  it("should subscribe to a calendar", async () => {
    let res;
    // add read permission
    await visibilityOn(calendarbId, tokenb);

    // subscribe
    await subscribe(calendarbId, tokena);

    res = await request(app)
      .get("/api/calendars/subscribed")
      .set("Authorization", `Bearer ${tokena}`)
      .expect(200);

    expect(res.body.map((c) => c.title)).toContain("Calendar A");
    expect(res.body.map((c) => c.title)).toContain("Calendar B");
  });

  it("should return 409 if already subscribed", async () => {
    await request(app)
      .post(`/api/subscriptions/${calendarbId}/subscribe`)
      .set("Authorization", `Bearer ${tokena}`)
      .expect(409);
  });

  it("should unsubscribe from a calendar", async () => {
    let res;

    res = await request(app)
      .post(`/api/subscriptions/${calendarbId}/unsubscribe`)
      .set("Authorization", `Bearer ${tokena}`)
      .expect(200);

    res = await request(app)
      .get("/api/calendars/subscribed")
      .set("Authorization", `Bearer ${tokena}`)
      .expect(200);

    expect(res.body.map((c) => c.title)).toContain("Calendar A");
    expect(res.body.map((c) => c.title)).not.toContain("Calendar B");
  });

  it("should unsubscribe to a calendar after the permission if off", async () => {
    let res;
    // subscribe
    await subscribe(calendarbId, tokena);

    // turn off the visibility
    await visibilityOff(calendarbId, tokenb);

    // calendar B should be unsubscribed
    res = await request(app)
      .get("/api/calendars/subscribed")
      .set("Authorization", `Bearer ${tokena}`)
      .expect(200);

    expect(res.body.map((c) => c.title)).toContain("Calendar A");
    expect(res.body.map((c) => c.title)).not.toContain("Calendar B");
  });

  it("should not unsubscribe an already unsubscribed calendar", async () => {
    let res;
    res = await request(app)
      .post(`/api/subscriptions/${calendarbId}/unsubscribe`)
      .set("Authorization", `Bearer ${tokena}`)
      .expect(404);
  });
});
