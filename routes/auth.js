const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const config = require("config");
const auth = require("../middleware/auth");

const User = require("../models/User");

// @route     GET api/auth
// @desc      get logged in user
// @access    Private  (i.e accessible only if authenticated)
router.get("/", auth, async (req, res) => {
  // if the user is authentic with token then we can get his id from the req header ie from req.user.id coz we passed the token(which has user id) in the header in postman
  // it(ie id) will be in req.user coz we have send user(whose id is similar to that of the header tokens id) as a json response  
  // this getting user's id is handled by auth middleware
  try {
    const user = await User.findById(req.user.id).select("-password"); // password is excluded in the response

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("server error");
  }
});

// @route     POST api/auth
// @desc      Authenticate user and get token(ie log in the user)
// @access    Public
router.post(
  "/",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(404).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      // check for email validation
      if (!user) {
        return res.status(400).json({ msg: "No such email found" });
      }

      // compare the password
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ msg: "Password is incorrect" });  // it's better to write invalid credentials in error message
      }

      // if validation passed then create the payload for jwt
      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        config.get("jwtSecret"),
        {
          expiresIn: 360000,
        },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send("server error");
    }
  }
);

module.exports = router;
