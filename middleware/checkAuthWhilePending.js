const jwt = require("jsonwebtoken");
const config = require("config");

const authenticateTokenWhilePending = (req, res, next) => {
  const token = req.header("x-auth-token");

  if (!token)
    return res
      .status(401)
      .send({ error: "Access denied. No token provided for user" });

  try {
    // Get payload data
    //  const payload = await jwt.verify(token, config.get("jwtSecret"));
    jwt.verify(token, config.get("jwtSecret"), (err, user) => {
      req.userId = user.userId;
      req.userRole = user.userRole;
      req.userStatus = user.userStatus;
      next();
    });
    // req.user = payload.user;

    next();
  } catch (error) {
    //log to logging dependency
    console.error("Something wrong with the auth middleware...");
    res.status(400).json({ msg: "Invalid token." });
  }
};

module.exports = authenticateTokenWhilePending;
