const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const saltRounds = 10; //required by bcrypt

exports.user_login_post = [
  // Validate and sanitize fields.
  body("username")
    .trim()
    .escape()
    .isLength({ min: 1 })
    .withMessage("Username must be specified."),
  body("password")
    .trim()
    .escape()
    .isLength({ min: 1 })
    .withMessage("Password must be specified."),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      res.status(400).send(errors.array());
    } else {
      // Data from form is valid.

      //check if username exists.
      const existingUsername = await User.find({
        username: { $eq: req.body.username },
      });
      //check if password matches
      const matchingPassword = [];
      for (const user of existingUsername) {
        const match = await bcrypt.compare(req.body.password, user.password);
        if (match) {
          matchingPassword.push(user);
        }
      }
      if (matchingPassword.length === 1) {
        const token = await getToken({
          username: matchingPassword[0].username,
          member: matchingPassword[0].member,
          admin: matchingPassword[0].admin,
        });

        if (token) {
          return res.json({
            token: token,
            username: matchingPassword[0].username,
            member: matchingPassword[0].member,
            admin: matchingPassword[0].admin,
          });
        }
        return res.status(401).send();
      } else {
        return res.status(400).send();
      }
    }
  }),
];

const getToken = (payload) =>
  new Promise((rslv, rjct) => {
    // Log in.
    jwt.sign(
      payload,
      process.env.JWT_SECRET_KEY,
      { algorithm: "HS256", expiresIn: "24h" },
      (err, token) => {
        if (err) rjct(err);
        else rslv(token);
      }
    );
  });

exports.allowAnonymous = (req, res, next) => {
  res.locals.allowAnonymous = true;
  next();
};

exports.user_member_put = [
  body("secretcode")
    .trim()
    .escape()
    .isLength({ min: 1 })
    .withMessage("Secret Code must be specified."),
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      res.status(400).send(errors.array());
    } else {
      // Data from form is valid.

      //check if username exists.
      const existingUsername = await User.findOne({
        username: { $eq: req.user.username },
      });

      if (existingUsername) {
        //check secret code
        if (req.body.secretcode == process.env.SECRET_CLUB_CODE) {
          const result = await User.findByIdAndUpdate(
            existingUsername._id.toString(),
            {
              member: true,
            }
          );
          const token = await getToken({
            username: result.username,
            member: true,
            admin: result.admin,
          });

          if (token) {
            return res.status(200).json({
              token: token,
              username: result.username,
              member: true,
              admin: result.admin,
            });
          } else {
            res.status(500).send();
          }
        } else {
          res.status(400).send();
        }
      } else {
        res.status(400).send();
      }
    }
  }),
];

exports.user_admin_put = [
  body("secretcode")
    .trim()
    .escape()
    .isLength({ min: 1 })
    .withMessage("Admin Code must be specified."),
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.

      res.status(400).send(errors.array());
    } else {
      // Data from form is valid.

      //check if username exists.
      const existingUsername = await User.findOne({
        username: { $eq: req.user.username },
      });

      if (existingUsername) {
        //check secret code
        if (req.body.secretcode == process.env.SECRET_ADMIN_CODE) {
          const result = await User.findByIdAndUpdate(
            existingUsername._id.toString(),
            {
              admin: true,
              member: true,
            }
          );
          const token = await getToken({
            username: result.username,
            member: true,
            admin: true,
          });

          if (token) {
            return res.status(200).json({
              token: token,
              username: result.username,
              member: true,
              admin: true,
            });
          } else {
            res.status(500).send();
          }
        } else {
          res.status(403).send();
        }
      } else {
        res.status(403).send();
      }
    }
  }),
];

exports.verifyToken = (req, res, next) => {
  req.user = { username: null, verified: false };
  const { JWT_SECRET_KEY } = process.env;
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== "undefined") {
    const bearerToken = bearerHeader.split(" ")[1];
    jwt.verify(bearerToken, JWT_SECRET_KEY, function (err, data) {
      if (!(err && typeof data === "undefined")) {
        req.user = {
          username: data.username,
          member: data.member,
          admin: data.admin,
          verified: true,
        };
        next();
      }
    });
  }

  if (req.user.verified === false) {
    if (res.locals.allowAnonymous) {
      next();
    } else {
      return res.status(403).send();
    }
  }
};

exports.user_authenticate_get = (req, res) => {
  return res.status(200).json({
    username: req.user.username,
    member: req.user.member,
    admin: req.user.admin,
  });
};

exports.user_logout_post = (req, res) => {
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== "undefined") {
    const bearerToken = bearerHeader.split(" ")[1];
    //add bearerToken to blacklist
  }
  return res.status(200).send();
};

exports.user_create_post = [
  // Validate and sanitize fields.
  body("firstName")
    .trim()
    .escape()
    .isLength({ min: 1 })
    .withMessage("First name must be specified."),
  body("lastName")
    .trim()
    .escape()
    .isLength({ min: 1 })
    .withMessage("Last name must be specified."),
  body("username")
    .trim()
    .escape()
    .toLowerCase()
    .isLength({ min: 1 })
    .withMessage("Username must be specified.")
    .isAlphanumeric()
    .withMessage("Username can only contains letters or numbers."),
  body("password")
    .trim()
    .escape()
    .isLength({ min: 1 })
    .withMessage("Password must be specified."),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create User object with escaped and trimmed data
    const user = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      username: req.body.username,
      password: null, //don't save password, it's not hashed yet.
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      res.status(400).send(errors.array());
    } else {
      // Data from form is valid.

      //check if username exists.
      const existingUsername = await User.find({
        username: { $eq: user.username },
      });
      if (existingUsername.length > 0) {
        res.status(409).send(); // Conflict with existing username.
      } else {
        // Create hashedPassword. Return error if failure.
        bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
          if (err) {
            res.status(500).send; //internal server error hasing the password...
          } else {
            // otherwise, store hashedPassword in DB
            user.password = hashedPassword;
            await user.save();
            const token = await getToken({
              username: req.body.username,
            });

            if (token) {
              return res.json({
                token: token,
                username: req.body.username,
              });
            }
            res.status(200).send();
          }
        });
      }
    }
  }),
];
