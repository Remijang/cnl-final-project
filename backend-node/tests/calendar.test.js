const request = require("supertest");
const app = require("../src/app/app");
const util = require("./utils");

describe("Calendar API", () => {
  let tokena, tokenb;
  let calendaraId, calendarbId;
  let res;
  beforeEach(async () => {
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
      .put(`/api/calendars/${calendaraId}`)
      .set("Authorization", `Bearer ${tokena}`)
      .send({ title: "New Title A" })
      .expect(200);

    expect(res.body.title).toBe("New Title A");

    res = await request(app)
      .put(`/api/calendars/${calendarbId}`)
      .set("Authorization", `Bearer ${tokena}`)
      .send({ title: "New Title A" })
      .expect(403);
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
      .set("Authorization", `Bearer ${tokena}`)
      .expect(403);
    res = await request(app)
      .delete(`/api/calendars/${calendarbId}`)
      .expect(401);
  });
});
