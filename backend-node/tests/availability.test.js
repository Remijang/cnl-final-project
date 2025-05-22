const request = require("supertest");
const app = require("../src/app/app");
const util = require("./utils");
const jwt = require("jsonwebtoken");

describe("Availability API", () => {
  const today = new Date().toISOString().split("T")[0];
  let tokenA, tokenB, tokenC, groupId;
  let idA, idB, idC;
  beforeAll(async () => {
    let res;
    await util.databaseCleanup();
    ({ id: idA, token: tokenA } = await util.registerAndLogin(
      "a",
      "a@example.com",
      "passwordA"
    ));

    ({ id: idB, token: tokenB } = await util.registerAndLogin(
      "b",
      "b@example.com",
      "passwordB"
    ));

    ({ id: idC, token: tokenC } = await util.registerAndLogin(
      "c",
      "c@example.com",
      "passwordC"
    ));

    groupId = await util.createGroup(tokenA, "availability test");
    await util.addGroupUser(tokenA, groupId, idB);
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
    let res;
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
    let res;
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
    let res;
    res = await request(app)
      .get(`/api/availability/groups/${groupId}?day=${today}`)
      .set("Authorization", `Bearer ${tokenC}`)
      .expect(403);
    res = await request(app)
      .get(`/api/availability/groups/${groupId}?day=${today}`)
      .expect(401);
  });
});
