const request = require("supertest");
const app = require("../src/app/app");
const util = require("./utils");
const jwt = require("jsonwebtoken");

describe("Group API", () => {
  const today = new Date().toISOString().split("T")[0];
  let tokenA, tokenB, tokenC, groupId;
  let idA, idB, idC;
  beforeAll(async () => {
    let res;
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
    idA = jwt.verify(tokenA, process.env.JWT_SECRET).id;

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
    idB = jwt.verify(tokenB, process.env.JWT_SECRET).id;

    res = await request(app)
      .post("/api/auth/register")
      .send({ name: "c", email: "c@example.com", password: "testpass" });
    expect(res.statusCode).toBe(201);

    res = await request(app)
      .post("/api/auth/login")
      .send({ email: "c@example.com", password: "testpass" });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    tokenC = res.body.token;
    idC = jwt.verify(tokenC, process.env.JWT_SECRET).id;

    res = await request(app)
      .post("/api/groups")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ name: "My Test Group" })
      .expect(201);

    expect(res.body).toHaveProperty("id");
    groupId = res.body.id;

    await request(app)
      .post(`/api/groups/${groupId}/user`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ addUserId: idB });
  });

  it("should set availability for User A", async () => {
    let res;
    res = await request(app)
      .post("/api/availability")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        available_date: today,
        start_time: `09:00:00`,
        end_time: `10:00:00`,
      })
      .expect(201);
  });
  it("should set availability for User B", async () => {
    res = await request(app)
      .post("/api/availability")
      .set("Authorization", `Bearer ${tokenB}`)
      .send({
        available_date: today,
        start_time: `09:30:00`,
        end_time: `11:00:00`,
      })
      .expect(201);
  });

  it("should get group availability", async () => {
    res = await request(app)
      .get(`/api/availability/groups/${groupId}?day=${today}`)
      .set("Authorization", `Bearer ${tokenA}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    const userA = res.body.find((a) => a.user_id === idA);
    const userB = res.body.find((a) => a.user_id === idB);

    expect(userA).toBeDefined();
    expect(userB).toBeDefined();
    expect(userA.start_time).toBe(`09:00:00`);
    expect(userB.start_time).toBe(`09:30:00`);
  });

  it("should get reject unauthenticated user and wrong permission", async () => {
    res = await request(app)
      .get(`/api/availability/groups/${groupId}?day=${today}`)
      .set("Authorization", `Bearer ${tokenC}`)
      .expect(403);
    res = await request(app)
      .get(`/api/availability/groups/${groupId}?day=${today}`)
      .expect(401);
  });
});
