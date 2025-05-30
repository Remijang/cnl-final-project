const request = require("supertest");
const app = require("../src/app/app");
const util = require("./utils");

describe("Auth API", () => {
  let token;

  beforeEach(async () => {
    await util.databaseCleanup();
    let res;
    res = await request(app)
      .post("/api/auth/register")
      .send({ name: "user1", email: "test@example.com", password: "test123" });
    expect(res.statusCode).toBe(201);
  });

  it("should not re-register and not re-use email", async () => {
    let res;
    res = await request(app)
      .post("/api/auth/register")
      .send({ name: "user1", email: "test@example.com", password: "test456" });
    expect(res.statusCode).toBe(500);
    res = await request(app)
      .post("/api/auth/register")
      .send({ name: "user2", email: "test@example.com", password: "test456" });
    expect(res.statusCode).toBe(500);
  });

  it("should login the user and successfully logout", async () => {
    let res;
    res = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@example.com", password: "test123" });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    token = res.body.token;
    res = await request(app)
      .post("/api/auth/logout")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(res.body.message).toBe("Logged out successfully");
  });

  it("should not login with invalid credential", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@example.com", password: "test456" });
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe("Invalid credentials");
  });

  it("should not access with non-existed users", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "alice@example.com", password: "test456" });
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe("Invalid credentials");
  });
});
