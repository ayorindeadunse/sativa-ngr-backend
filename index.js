const express = require("express");

// DB Connections
const connectDB = require("./config/db");
const path = require("path");
const helmet = require("helmet");
const compression = require("compression");
const config = require("config");
//users
const users = require("./routes/users");
const app = express();

//connect to the Database
connectDB();
app.use(express.static("public"));
app.use(express.json());
app.use(helmet());
app.use(compression());

// add routes
app.use("/api/users", users);
const port = process.env.PORT || config.get("port");
app.listen(port, () => {
  console.log(`Server started on port ${port}...`);
});
