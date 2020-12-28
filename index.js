const express = require("express");

// DB Connections
const connectDB = require("./config/db");
const path = require("path");
const helmet = require("helmet");
const compression = require("compression");
const config = require("config");
//users
const users = require("./routes/users");
const activateUser = require("./routes/activateUser");
const auth = require("./routes/auth");
const app = express();

//connect to the Database
connectDB();
app.use(express.static("public"));
app.use(express.json());
app.use(helmet());
app.use(compression());

// enable CORS
/*** check best practices for enabling CORS on the server
 * in node apps
 */

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PATCH,PUT,DELETE,OPTIONS"
  );
  next();
});
// add routes
app.use("/api/users", users);
app.use("/api/activateUser", activateUser);
app.use("/api/auth", auth);
const port = process.env.PORT || config.get("port");
app.listen(port, () => {
  console.log(`Server started on port ${port}...`);
});
