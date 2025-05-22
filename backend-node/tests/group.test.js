const request = require("supertest");
const app = require("../src/app/app");
const util = require("./utils");

describe("Group API", () => {
  let tokenA, tokenB, tokenC, groupId;
  let idA, idB, idC;
  beforeEach(async () => {
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

    groupId = await util.createGroup(tokenA, "group test");
  });

  it("should get groups whose owner is the caller", async () => {
    const res = await request(app)
      .get("/api/groups")
      .set("Authorization", `Bearer ${tokenA}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body.some((g) => g.id === groupId)).toBe(true);
  });

  it("should add the user to the group and get the group members", async () => {
    let res;
    res = await request(app)
      .post(`/api/groups/${groupId}/user`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ addUserId: idB })
      .expect(200);

    res = await request(app)
      .get(`/api/groups/${groupId}`)
      .set("Authorization", `Bearer ${tokenA}`)
      .expect(200);

    expect(Array.isArray(res.body.members)).toBe(true);
    const memberIds = res.body.members.map((m) => m.id);
    expect(memberIds).toContain(idA);
    expect(memberIds).toContain(idB);
  });

  it("should reject if not authenticated", async () => {
    let res;
    res = await request(app).post("/api/groups").expect(401);
    res = await request(app)
      .post(`/api/groups/${groupId}/user`)
      .send({ addUserId: idB })
      .expect(401);

    res = await request(app)
      .delete(`/api/groups/${groupId}/user`)
      .send({ removeUserId: idB })
      .expect(401);

    res = await request(app).get(`/api/groups/${groupId}`).expect(401);
    res = await request(app).get("/api/groups").expect(401);
  });

  it("should reject if the permission is wrong", async () => {
    let res;
    res = await request(app)
      .post(`/api/groups/${groupId}/user`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({ addUserId: idB })
      .expect(403);

    res = await request(app)
      .delete(`/api/groups/${groupId}/user`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({ addUserId: idB })
      .expect(403);

    res = await request(app)
      .get(`/api/groups/${groupId}`)
      .set("Authorization", `Bearer ${tokenB}`)
      .expect(403);

    res = await request(app)
      .post(`/api/groups/${groupId}/user`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ addUserId: idB })
      .expect(200);

    // if the user is in the group then it should be able to GET
    res = await request(app)
      .get(`/api/groups/${groupId}`)
      .set("Authorization", `Bearer ${tokenB}`)
      .expect(200);

    expect(Array.isArray(res.body.members)).toBe(true);
    const memberIds = res.body.members.map((m) => m.id);
    expect(memberIds).toContain(idA);
    expect(memberIds).toContain(idB);
  });

  it("should remove the user from the group", async () => {
    let res = await request(app)
      .delete(`/api/groups/${groupId}/user`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ addUserId: idB })
      .expect(200);

    res = await request(app)
      .get(`/api/groups/${groupId}`)
      .set("Authorization", `Bearer ${tokenA}`)
      .expect(200);

    const memberIds = res.body.members.map((m) => m.id);
    expect(memberIds).not.toContain(idB);

    // should denied removing the owner
    res = await request(app)
      .delete(`/api/groups/${groupId}/user`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ addUserId: idA })
      .expect(200);
  });
});
