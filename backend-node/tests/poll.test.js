const request = require("supertest");
const app = require("../src/app/app");
const util = require("./utils");

describe("Polls API", () => {
  let tokenA, tokenB, tokenC;
  let idA, idB, idC;
  let pollId;
  let groupId;
  let timeRange1Id, timeRange2Id;

  beforeAll(async () => {
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
    await util.addGroupUser(tokenA, groupId, idC);

    // Create a poll
    const createPollRes = await request(app)
      .post("/api/polls")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        title: "Test Poll",
        description: "This is a test poll",
        time_ranges: [
          {
            start_time: "2025-05-20T10:00:00Z",
            end_time: "2025-05-20T11:00:00Z",
          },
          {
            start_time: "2025-05-20T14:00:00Z",
            end_time: "2025-05-20T15:00:00Z",
          },
        ],
      });
    expect(createPollRes.statusCode).toBe(201);
    expect(createPollRes.body.poll.id).toBeDefined();
    pollId = createPollRes.body.poll.id;
    timeRange1Id = createPollRes.body.time_ranges[0].id;
    timeRange2Id = createPollRes.body.time_ranges[1].id;
  });

  it("should create a new poll", async () => {
    const res = await request(app)
      .post("/api/polls")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        title: "New Poll",
        description: "A brand new poll",
        time_ranges: [
          {
            start_time: "2025-05-20T09:00:00Z",
            end_time: "2025-05-20T10:00:00Z",
          },
        ],
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.poll.id).toBeDefined();
    expect(res.body.poll.title).toBe("New Poll");
  });

  it("should invite a user to a poll (PUT /polls/:pollId/inviteUser)", async () => {
    const res = await request(app)
      .put(`/api/polls/${pollId}/inviteUser`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ userId: idB });
    expect(res.statusCode).toBe(201);
  });

  it("should invite a group of users to a poll (PUT /polls/:pollId/inviteGroupPoll)", async () => {
    // Assuming you have a way to identify groups and a corresponding API to get user IDs in a group
    // For this test, we'll just send an array of user IDs directly
    const res = await request(app)
      .put(`/api/polls/${pollId}/inviteGroup`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ groupId: groupId });
    expect(res.statusCode).toBe(201);
  });

  it("should list ongoing polls (GET /polls/listPoll)", async () => {
    const res = await request(app)
      .get("/api/polls/listPoll")
      .set("Authorization", `Bearer ${tokenA}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((poll) => poll.id === pollId)).toBe(true);
  });

  it("should check a specific poll (GET /polls/:pollId)", async () => {
    const res = await request(app)
      .get(`/api/polls/${pollId}`)
      .set("Authorization", `Bearer ${tokenA}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.poll).toBeDefined();
    expect(res.body.poll.id).toBe(pollId);
    expect(res.body.poll.title).toBe("Test Poll");
    expect(res.body.time_ranges).toBeDefined();
    expect(res.body.time_ranges.length).toBe(2);
  });

  it("should submit a vote to a poll (POST /polls/:pollId)", async () => {
    const res = await request(app)
      .post(`/api/polls/${pollId}`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({ votes: [{ time_range_id: timeRange1Id, is_available: true }] });
    expect(res.statusCode).toBe(201);
  });

  it("should update a user's vote in a poll (PUT /polls/:pollId)", async () => {
    // update the vote
    const res = await request(app)
      .put(`/api/polls/${pollId}`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({
        votes: [
          { time_range_id: timeRange1Id, is_available: false },
          { time_range_id: timeRange2Id, is_available: true },
        ],
      });
    expect(res.statusCode).toBe(201);
  });

  it("should get a specific user's vote in a poll (GET /polls/:pollId/:userId)", async () => {
    const res = await request(app)
      .get(`/api/polls/${pollId}/${idB}`)
      .set("Authorization", `Bearer ${tokenA}`); // Owner can view
    expect(res.statusCode).toBe(200);
    expect(res.body[0].time_range_id).toBe(timeRange1Id);
    expect(res.body[0].is_available).toBe(false);
    expect(res.body[1].time_range_id).toBe(timeRange2Id);
    expect(res.body[1].is_available).toBe(true);
  });

  it("should confirm a poll and create an event (POST /polls/:pollId/confirm)", async () => {
    const res = await request(app)
      .post(`/api/polls/${pollId}/confirm`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ confirmed_time_range_id: timeRange1Id });
    expect(res.statusCode).toBe(200);
    expect(res.body.confirmed_time_range_id).toBe(timeRange1Id);
  });

  it("should cancel a poll (DELETE /polls/:pollId)", async () => {
    const res = await request(app)
      .delete(`/api/polls/${pollId}`)
      .set("Authorization", `Bearer ${tokenA}`);
    expect(res.statusCode).toBe(200);

    // Verify that the poll is indeed cancelled
    const checkRes = await request(app)
      .get(`/api/polls/${pollId}`)
      .set("Authorization", `Bearer ${tokenA}`);
    expect(checkRes.statusCode).toBe(404); // Or appropriate "not found" status
  });
});
