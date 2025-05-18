const request = require("supertest");
const app = require("../src/app/app");
const util = require("./utils");
const jwt = require("jsonwebtoken");

describe("Group API", () => {
  let tokenA, tokenB, tokenC, groupId;
  let idA, idB, idC;
  beforeEach(async () => {
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
      .post(`/api/groups/${groupId}/add`)
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
      .post(`/api/groups/${groupId}/add`)
      .send({ addUserId: idB })
      .expect(401);

    res = await request(app)
      .post(`/api/groups/${groupId}/remove`)
      .send({ addUserId: idB })
      .expect(401);

    res = await request(app).get(`/api/groups/${groupId}`).expect(401);
    res = await request(app).get("/api/groups").expect(401);
  });

  it("should reject if the permission is wrong", async () => {
    let res;
    res = await request(app)
      .post(`/api/groups/${groupId}/add`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({ addUserId: idB })
      .expect(403);

    res = await request(app)
      .post(`/api/groups/${groupId}/remove`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({ addUserId: idB })
      .expect(403);

    res = await request(app)
      .get(`/api/groups/${groupId}`)
      .set("Authorization", `Bearer ${tokenB}`)
      .expect(403);

    res = await request(app)
      .post(`/api/groups/${groupId}/add`)
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
      .post(`/api/groups/${groupId}/remove`)
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
      .post(`/api/groups/${groupId}/remove`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ addUserId: idA })
      .expect(200);
  });
});
