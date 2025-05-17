const request = require("supertest");
const app = require("../src/app/app");
const pool = require("../src/config/db");
const jwt = require("jsonwebtoken");

const databaseCleanup = async () => {
  await pool.query("DELETE FROM users");
  await pool.query("DELETE FROM user_tokens");
  await pool.query("DELETE FROM user_auth_providers");
  await pool.query("DELETE FROM calendars");
  await pool.query("DELETE FROM calendar_shared_users");
  await pool.query("DELETE FROM events");
  await pool.query("DELETE FROM calendar_subscriptions");
  await pool.query("DELETE FROM groups");
  await pool.query("DELETE FROM group_members");
  await pool.query("DELETE FROM user_availability");
  await pool.query("DELETE FROM polls");
  await pool.query("DELETE FROM poll_invited_users");
  await pool.query("DELETE FROM poll_time_ranges");
  await pool.query("DELETE FROM poll_votes");
};

describe("User API", () => {
  let tokena, tokenb, uida, uidb;
  beforeAll(async () => {
    await databaseCleanup();
    let res;
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
    const decodedTokenA = jwt.verify(tokena, process.env.JWT_SECRET);
    uida = decodedTokenA.id;

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
  });

  it("should get the user's profile", async () => {
    res = await request(app)
      .get("/api/users/profile")
      .set("Authorization", `Bearer ${tokena}`)
      .expect(200);

    expect(res.body).toMatchObject({
      id: uida,
      name: "a",
      email: "a@example.com",
      avatar_url: null,
      bio: null,
    });
  });

  it("should update the user's profile", async () => {
    res = await request(app)
      .put("/api/users/profile")
      .set("Authorization", `Bearer ${tokena}`)
      .send({
        name: "Updated name",
        avatar_url: "http://avatar.com/b.jpg",
        bio: "Updated bio",
      })
      .expect(200);

    res = await request(app)
      .get("/api/users/profile")
      .set("Authorization", `Bearer ${tokena}`)
      .expect(200);

    expect(res.body).toMatchObject({
      id: uida,
      name: "Updated name",
      email: "a@example.com",
      avatar_url: "http://avatar.com/b.jpg",
      bio: "Updated bio",
    });
  });

  it("should return 401", async () => {
    res = await request(app)
      .put("/api/users/profile")
      .send({
        name: "Updated name",
        avatar_url: "http://avatar.com/b.jpg",
        bio: "Updated bio",
      })
      .expect(401);
  });
});
