console.log("➡️ Starting the main server process...");

const app = require("./app/app");
console.log("✅ app module has been required.");

const PORT = process.env.PORT || 3000;
console.log(`⚙️ Attempting to listen on port: ${PORT}`);

app.listen(PORT, '0.0.0.0', () => {
  console.log("------------------------------------");
  console.log(`🚀 Server is now running and listening on port: ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log("------------------------------------");
});

console.log("⏳ Waiting for the server to start...");
