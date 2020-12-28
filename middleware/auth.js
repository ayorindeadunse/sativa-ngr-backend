const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = async (req, res, next) => {
  // get user token from the headers
  // const token = req.header("x-auth-token");
  const token = req.headers.authorization.split(" ")[1];

  //if token does not exist
  if (!token)
    return res
      .status(401)
      .send({ error: "Access denied. No token provided for user" });

  try {
    // Get payload data
    const payload = await jwt.verify(token, config.get("jwtSecret"));
    /* req.userId = payload._id;
    req.userStatus = payload.status;
    req.email = payload.email;*/
    res.user = payload.user;

    next();
  } catch (error) {
    //log to logging dependency
    console.error("Something wrong with the auth middleware...");
    res.status(400).json({ msg: "Invalid token." });
  }
};
