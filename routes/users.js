const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require("express-validator");
const User = require("../models/User");

// create a user
router.post(
  "/",
  [
    check("firstName", "First Name is required").not().isEmpty(),
    check("lastName", "Last Name is required").not().isEmpty(),
    check(
      "password",
      "Please enter a password with 8 or more characters"
    ).isLength({
      min: 8,
      // consider using regular expressions for password pattern
    }),
    check("password", "Password is required").not().isEmpty(),
    check("mobile", "Mobile Number is required").not().isEmpty(),
  ],

  // check validation errors
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty) {
      return res.status(400).json({ errors: errors.array() });
    }

    // destructure the body of the request
    const { firstName, lastName, email, mobile, password } = req.body;
    // set isAdmin property to true
    let isAdmin = true;

    try {
      // check if user exists in the database
      let user = await User.findOne({ email });
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "User already exists" }] });
      }

      // else get the user gravatar/ or populate user record inclusive of image
      const avatar = gravatar.url(email, {
        s: "200",
        r: "pg",
        d: "mm",
      });

      // Add user

      // send verification code before persisting in database.
      user = new User({
        firstName,
        lastName,
        email,
        avatar,
        mobile,
        password,
        isAdmin,
      });

      // Encrypt password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();

      // send verification code via sms and e-mail for user, if successful,
      // update status to active.

      // return jsonwebtoken to client
      const payload = {
        user: {
          userId: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          mobile: user.mobile,
          email: user.email,
          isAdmin: user.isAdmin,
          // consider other properties to add to payload
        },
      };
      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
        }
      );
      res.status(201).send(user);
    } catch (error) {
      //log using log library
      console.error(err.message);
      res.status(500).send("An error occured on the server");
    }
  }
);
