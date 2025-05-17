require("dotenv").config({
  path: process.env.NODE_ENV === "test" ? ".test.env" : ".env",
});

const express = require("express");
const bodyParser = require("body-parser");

const authRoutes = require("../routes/authRoutes");
const userRoutes = require("../routes/userRoutes");
const calendarRoutes = require("../routes/calendarRoutes");
const eventRoutes = require("../routes/eventRoutes");
const subscriptionRoutes = require("../routes/subscriptionRoutes");
const groupRoutes = require("../routes/groupRoutes");
const availabilityRoutes = require("../routes/availabilityRoutes");
const pollRoutes = require("../routes/pollRoutes");
const authMiddleware = require("../middleware/authMiddleware");

const app = express();
app.use(bodyParser.json());
app.use("/api/auth", authRoutes);
app.use("/api/users", authMiddleware, userRoutes);
app.use("/api/calendars", authMiddleware, calendarRoutes);
app.use("/api/events", authMiddleware, eventRoutes);
app.use("/api/subscriptions", authMiddleware, subscriptionRoutes);
app.use("/api/groups", authMiddleware, groupRoutes);
app.use("/api/avaiability", authMiddleware, availabilityRoutes);
app.use("/api/polls", authMiddleware, pollRoutes);

module.exports = app;
