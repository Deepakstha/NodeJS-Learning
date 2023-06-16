const dotenv = require("dotenv");
dotenv.config();
const app = require("./app");

//for handling uncaughtexception error
process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  console.log("uncaught exception occured shutting down");

  process.exit(1);
});

//initializign config file

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`backend server has started at PORT , ${PORT}`);
});

//for unhandledrejection error
process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("unhandled rejection occured shutting down");
  server.close(() => {
    process.exit(1);
  });
});
