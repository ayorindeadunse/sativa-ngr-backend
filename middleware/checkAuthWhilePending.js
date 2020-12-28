const jwt = require("jsonwebtoken");
const config = require("config");

const authenticateTokenWhilePending = (req, res, next) => {
  //Retrieve the token
  try {
    const token = req.headers.authorization.split(" ")[1];

    if (!token)
      return res
        .status(401)
        .send({ error: "Access denied. No token provided for user" });
    //verify token
    // const payload = jwt.verify(token, process.env.JWT_KEY);
    const payload = jwt.verify(token, config.get("jwtSecret"));
    req.userId = payload._id;
    req.userStatus = payload.status;
    req.email = payload.email;

    next();

    /*, (err, user) => {
      req.userId = user.userId;
      // req.userRole = user.userRole;
      req.userStatus = user.userStatus;
      next();
    });*/
    //req.userData = { email: decodedToken.email, userId: decodedToken.userId };
  } catch (error) {
    //log to logging dependency
    console.error("Something wrong with the auth middleware...");
    res.status(400).json({ msg: "Invalid token." });
  }
};

/*const authenticateTokenWhilePending = (req, res, next) => {
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
};*/

module.exports = authenticateTokenWhilePending;
