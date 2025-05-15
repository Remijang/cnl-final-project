require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/userRoutes");
const calendarRoutes = require("./routes/calendarRoutes");
const eventRoutes = require("./routes/eventRoutes");

const app = express();
app.use(bodyParser.json());

app.use("/api/users", userRoutes);
app.use("/api/calendars", calendarRoutes);
app.use("/api/events", eventRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
