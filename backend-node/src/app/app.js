require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");

const userRoutes = require("../routes/userRoutes");
const calendarRoutes = require("../routes/calendarRoutes");
const eventRoutes = require("../routes/eventRoutes");
const subscriptionRoutes = require("../routes/subscriptionRoutes");
const groupRoutes = require("../routes/groupRoutes");
const availabilityRoutes = require("../routes/availabilityRoutes");
const pollRoutes = require("../routes/pollRoutes");

const app = express();
app.use(bodyParser.json());
app.use("/api/users", userRoutes);
app.use("/api/calendars", calendarRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/avaiability", availabilityRoutes);
app.use("/api/polls", pollRoutes);

module.exports = app;
