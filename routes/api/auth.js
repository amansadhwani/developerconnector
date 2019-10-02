const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const User = require("../../models/User");
const bcrypt = require("bcryptjs"); // for password encryption
const jwt = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require("express-validator"); // used to check validaations

//@route GET api/auth
//@desc Test Route
//@access Public

router.get("/", auth, async (req, res) => {
  // note here before going inside we are passing auth so it will first verify token and than proceed further
  try {
    const user = await User.findById(req.user.id).select("-password"); //this will ommit password and return other details
    res.json(user);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("server err");
  }
});

//@route Post api/auth
//@desc auth user and get token
//@access Public

router.post(
  "/",
  [
    check("email", "Please ENter valid Email Address").isEmail(),
    check(
      "password",
      "Please ENter a Password of 6 characters or more"
    ).exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() }); // this is to check if our validator are working fine can check from postman
    }
    const { email, password } = req.body;
    try {
      //see if user exists
      let user = await User.findOne({ email });

      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "invalid credentials " }] });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid Credentials" }] });
      }

      //return jsonwebtoken

      const payload = {
        user: {
          id: user.id //here user.id is actually our mongodb id ie "_id" using moongose we just need to pass id
        }
      };

      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 36000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
      //console.log(token);
      //console.log(req.body); // this will print anything you send from postman
      // res.send("user Registered");
    } catch (err) {
      console.error(err.message);
      res.status(500).send("server error");
    }
  }
);

module.exports = router;
