const request = require("supertest");
const app = require("../src/app/app");
const util = require("./utils");

describe("Polls API", () => {
  let tokena, tokenb;
  let userAId, userBId;
  let pollId;
  let groupId;

  beforeAll(async () => {
    await util.databaseCleanup();
    let res = await request(app)
      .post("/api/auth/register")
      .send({ name: "a", email: "a@example.com", password: "testpass" });
    expect(res.statusCode).toBe(201);
    userAId = res.body.userId;

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
    userBId = res.body.userId;

    res = await request(app)
      .post("/api/auth/login")
      .send({ email: "b@example.com", password: "testpass" });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    tokenb = res.body.token;

    res = await request(app)
      .post("/api/groups")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ name: "My Test Group" })
      .expect(201);
    groupId = res.body.id;

    // Create a poll
    const createPollRes = await request(app)
      .post("/api/polls")
      .set("Authorization", `Bearer ${tokena}`)
      .send({
        title: "Test Poll",
        description: "This is a test poll",
      });
    expect(createPollRes.statusCode).toBe(201);
    expect(createPollRes.body.pollId).toBeDefined();
    pollId = createPollRes.body.pollId;
  });

  it("should create a new poll", async () => {
    const res = await request(app)
      .post("/api/polls")
      .set("Authorization", `Bearer ${tokena}`)
      .send({
        title: "New Poll",
        description: "A brand new poll",
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.pollId).toBeDefined();
    expect(res.body.title).toBe("New Poll");
  });

  it("should invite a user to a poll (PUT /polls/:pollId/inviteUser)", async () => {
    const res = await request(app)
      .put(`/api/polls/${pollId}/inviteUser`)
      .set("Authorization", `Bearer ${tokena}`)
      .send({ userId: userBId });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBeDefined(); // Or check for specific success message
  });

  it("should invite a group of users to a poll (PUT /polls/:pollId/inviteGroupPoll)", async () => {
    // Assuming you have a way to identify groups and a corresponding API to get user IDs in a group
    // For this test, we'll just send an array of user IDs directly
    const res = await request(app)
      .put(`/api/polls/${pollId}/inviteGroupPoll`)
      .set("Authorization", `Bearer ${tokena}`)
      .send({ groupId: groupId });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBeDefined(); // Or check for specific success message
  });

  it("should list ongoing polls (GET /polls/listPoll)", async () => {
    const res = await request(app)
      .get("/api/polls/listPoll")
      .set("Authorization", `Bearer ${tokena}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((poll) => poll.id === pollId)).toBe(true);
  });

  it("should check a specific poll (GET /polls/:pollId)", async () => {
    const res = await request(app)
      .get(`/api/polls/${pollId}`)
      .set("Authorization", `Bearer ${tokena}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(pollId);
    expect(res.body.title).toBe("Test Poll");
    expect(res.body.timeRanges).toBeDefined();
    expect(res.body.timeRanges.length).toBe(2);
    expect(res.body.votes).toBeDefined(); // Check if votes/statistics are present
  });

  it("should submit a vote to a poll (POST /polls/:pollId)", async () => {
    const res = await request(app)
      .post(`/api/polls/${pollId}`)
      .set("Authorization", `Bearer ${tokenb}`)
      .send({ availability: [timeRange1Id] });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBeDefined(); // Or check for specific success message
  });

  it("should update a user's vote in a poll (PUT /polls/:pollId)", async () => {
    // First, submit a vote
    await request(app)
      .post(`/api/polls/${pollId}`)
      .set("Authorization", `Bearer ${tokenb}`)
      .send({ availability: [timeRange1Id] });

    // Then, update the vote
    const res = await request(app)
      .put(`/api/polls/${pollId}`)
      .set("Authorization", `Bearer ${tokenb}`)
      .send({ availability: [timeRange2Id] });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBeDefined(); // Or check for specific success message
  });

  it("should get a specific user's vote in a poll (GET /polls/:pollId/:userId)", async () => {
    // First, invite user b to the poll
    await request(app)
      .put(`/api/polls/${pollId}/inviteUser`)
      .set("Authorization", `Bearer ${tokena}`)
      .send({ userId: userBId });

    // Then, submit a vote for user b
    await request(app)
      .post(`/api/polls/${pollId}`)
      .set("Authorization", `Bearer ${tokenb}`)
      .send({ availability: [timeRange1Id] });

    const res = await request(app)
      .get(`/api/polls/${pollId}/${userBId}`)
      .set("Authorization", `Bearer ${tokena}`); // Owner can view
    expect(res.statusCode).toBe(200);
    expect(res.body.userId).toBe(userBId);
    expect(res.body.availability).toEqual([timeRange1Id]);
  });

  it("should confirm a poll and create an event (POST /polls/:pollId/confirm)", async () => {
    const res = await request(app)
      .post(`/api/polls/${pollId}/confirm`)
      .set("Authorization", `Bearer ${tokena}`)
      .send({ confirmedTimeRangeId: timeRange1Id });
    expect(res.statusCode).toBe(201);
    expect(res.body.eventId).toBeDefined();
    expect(res.body.confirmedTimeRangeId).toBe(timeRange1Id);
  });

  it("should cancel a poll (DELETE /polls/:pollId)", async () => {
    const res = await request(app)
      .delete(`/api/polls/${pollId}`)
      .set("Authorization", `Bearer ${tokena}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBeDefined(); // Or check for specific success message

    // Verify that the poll is indeed cancelled
    const checkRes = await request(app)
      .get(`/api/polls/${pollId}`)
      .set("Authorization", `Bearer ${tokena}`);
    expect(checkRes.statusCode).toBe(404); // Or appropriate "not found" status
  });
});
