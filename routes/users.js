const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const cryptoRandomString = require("crypto-random-string");
const { check, validationResult } = require("express-validator");
const User = require("../models/User");
const Codes = require("../models/codes");
const emailService = require("../utils/nodemailer");

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
      "Please enter a password with 8 or more characters"
    ).isLength({
      min: 8,
    }),
    check(
      "password",
      "Your password needs to have at least one uppercase letter, one lowercase letter, and one special character"
    ).matches(
      "/^(?=.*d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*s).{6,}$/"
    ),
    check("password", "Password is required").not().isEmpty(),

    check("mobile", "Mobile Number is required").not().isEmpty(),
    check("accepted", "Please accept the terms of use.").not().isEmpty(),
  ],

  // check validation errors
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty) {
      return res.status(400).json({ errors: errors.array() });
    }

    // destructure the body of the request
    const { firstName, lastName, email, mobile, password, accepted } = req.body;
    // set isAdmin property to false because this is a regular user registration form
    // let isAdmin = false;
    // let status = "Pending";
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
        accepted,
      });

      // Encrypt password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();

      //create secret code and save secret to database with user account.

      // send email with activation link to user

      // return jsonwebtoken to client. This code section will be also part of the logic for the activateUser and
      //auth routes.
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

      // create token variable
      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 360000 },
        (err) => {
          if (err) throw err;
        }
      );
      //  req.session.token = token;

      // send verification link to user.
      const baseUrl = req.protocol + "://" + req.get("host");
      //algo to create secret code
      const secretCode = cryptoRandomString({
        length: 6,
      });
      saveCode = new Codes({
        email: user.email,
        code: secretCode,
      });

      await saveCode.save();

      // send verification e-mail to user
      const data = {
        from: `VENDOR CENTRAL<${config.get("EMAIL_USERNAME")}>`,
        to: user.email,
        subject: "Activation link for Vendor Central Registration",
        text: `Please use the following link within the next 10 minutes to activate your account on Vendor Central: ${baseUrl}/api/activateUser/verification/verify-account/${user._id}/${secretCode}`,
        html: `<p>Hi ${user.firstName},</p><p>Please use the following link within the next 10 minutes to activate your account on Vendor Central: <strong><a href="${baseUrl}/api/activateUser/verification/verify-account/${user._id}/${secretCode}" target="_blank">Activate Account</a></strong></p><br /><p>Thank You.</p><p>The Vendor Central Team.</p>`,
      };

      //send e-mail
      await emailService.sendMail(data);

      //send json object back to client with user data.
      res.status(201).send(user);
    } catch (error) {
      //log using log library
      console.error(error.message);
      res.status(500).send("An error occured on the server");
    }
  }
);

module.exports = router;
