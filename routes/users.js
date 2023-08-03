const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const config = require("config");

// importing the user model
const User = require("../models/User");

// details about this endpoint route
// @route     POST api/users
// @desc      Register a user
// @access    Public  (i.e accessible without authentication)
router.post(
  "/",
  [
    check("name", "Please add a name").not().isEmpty(),
    check("email", "please include a valid email").isEmail(),
    check(
      "password",
      "please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ erros: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (user) {
        return res
          .status(404)
          .json({ msg: `Email is taken, user already exists` });
      }

      user = new User({
        name,
        email,
        password,
      });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();

      // we are gonna take user's id for generating token(it is refered as payload)
      // note: we gave user's id for generating token so even for different tokens that we generate if we decode them then at last we will get the same user's id payload so the time at which it is created doesn't matter
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
      // if there is server error then the catch block will execute 
      console.error(err.message);
      res.status(500).send("server error");
    }
  }
);

module.exports = router;
