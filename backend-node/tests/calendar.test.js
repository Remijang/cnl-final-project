const request = require("supertest");
const app = require("../src/app/app"); // Express 應用程式

describe("Auth API", () => {
  let token;

  it("should register a user", async () => {
    const res = await request(app)
      .post("/api/users/register")
      .send({ email: "test@example.com", password: "test123" });
    expect(res.statusCode).toBe(201);
  });

  it("should login the user", async () => {
    const res = await request(app)
      .post("/api/users/login")
      .send({ email: "test@example.com", password: "test123" });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    token = res.body.token;
  });

  it("should fetch profile after login", async () => {
    const res = await request(app)
      .get("/api/users/profile")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe("test@example.com");
  });
});
