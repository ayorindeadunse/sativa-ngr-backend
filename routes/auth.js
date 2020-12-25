const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require("express-validator");
const User = require("../models/User");

// @route POST api/auth
// @desc authenticate a user with the username and password
// @access public

router.post(
  "/login",
  [
    check("email", "Please use a valid e-mail address").isEmail(),
    check("password", "Password is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(500).json({ errors: errors.array() });
    }

    // use the email and passowrd in the body of the request to
    // authenticate against the database

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "invalid Credentials " }] });
      }
      // check if password matches what's in the database
      const isMatch = await bcrypt.compare(pasword, user.password);
      // if it doesn't match
      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid Credentials" }] });
      }

      // get the user payload data from the database
      const payload = {
        user: {
          userId: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email,
          avatar: user.avatar,
          isAdmin: user.isAdmin,
          status: user.status,
          mobile: user.mobile,
        },
      };

      const token = jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 60 * 60 * 24 * 14 },
        (err) => {
          if (err) throw err;
          //  res.send(token);
        }
      );

      // if status is "pending", redirect user to
      // pending email activation page, (just do it )

      if (status === "Pending") {
        res.send(token);
        redirectPath = `http://localhost:4200/activate-email`;
        res.redirect(redirectPath);
      }

      // in one breath on the server. Else, use the
      // token sent in protected routes. Do this in other
      // pages.
    } catch (error) {
      // remember to use logger
      console.log("Error on /api/auth/login: ", error.message);
      res.status(500).send("Error on /api/auth/login: ", error.message);
    }
  }
);
