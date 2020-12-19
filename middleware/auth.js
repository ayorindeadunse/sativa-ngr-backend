const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = async (req, res, next) => {
  // get user token from the headers
  const token = req.header("x-auth-token");

  //if token does not exist
  if (!token)
    return res
      .status(401)
      .send({ error: "Access denied. No token provided for user" });

  try {
    // Get payload data
    const payload = await jwt.verify(token, config.get("jwtSecret"));
    req.user = payload.user;

    next();
  } catch (error) {
    //log to logging dependency
    console.error("Something wrong with the auth middleware...");
    res.status(400).json({ msg: "Invalid token." });
  }
};
