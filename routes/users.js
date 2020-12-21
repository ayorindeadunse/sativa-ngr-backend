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
    // confirm that an actual e-mail was used
    check("email", "Please use an actual e-mail address").not().isEmail(),
    check("email", "Email is required").not().isEmpty(),
    check(
      "password",
      "Please enter a password with 8 or more characters,has at least one uppercase letter, one lowercase letter, and one special character"
    )
      .isLength({
        min: 8,
      })
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/, "i"),
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
    // set isAdmin property to false because this is a regular user registration form
    let isAdmin = false;
    let status = "pending verification";

    try {
      // check if user exists in the database using both the email address and mobile number
      let user = await User.findOne({ email, mobile });
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
        status,
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
          status: user.status,
          // consider other properties to add to payload
          // in the object that is sent back to the client, if status is "pending activation", user can see only limited
          //features but cannot buy any products
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
