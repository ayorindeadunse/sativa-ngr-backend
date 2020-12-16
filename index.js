const express = require("express");

// DB Connections
const path = require("path");
const helmet = require("helmet");
const compression = require("compression");
const config = require("config");

const app = express();

//connect to the Database

app.use(express.static("public"));
app.use(express.json());
app.use(helmet());
app.use(compression());

const port = process.env.PORT || config.get("port");
app.listen(port, () => {
  console.log(`Server started on port ${port}...`);
});
