const express = require("express");
const router = express.Router();
const gravatar = require("gravatar"); //for image
const bcrypt = require("bcryptjs"); // for password encryption
const jwt = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require("express-validator"); // used to check validaations

const User = require("../../models/User");

//@route Post api/users
//@desc Register Route
//@access Public

router.post(
  "/",
  [
    check("name", "Name is Required")
      .not()
      .isEmpty(),
    check("email", "Please ENter valid Email Address").isEmail(),
    check(
      "password",
      "Please ENter a Password of 6 characters or more"
    ).isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() }); // this is to check if our validator are working fine can check from postman
    }
    const { name, email, password } = req.body;
    try {
      //see if user exists
      let user = await User.findOne({ email });

      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "user already exists" }] });
      }

      //get users gravatar

      const avatar = gravatar.url(email, {
        s: "200",
        r: "pg",
        d: "mm"
      });

      //encrypt password

      user = new User({
        name,
        email,
        avatar,
        password
      });

      const salt = await bcrypt.genSalt(10); //the higher the number the stronger the encryption
      user.password = await bcrypt.hash(password, salt);

      await user.save();
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
