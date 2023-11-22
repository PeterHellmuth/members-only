const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const User = require("../models/user");
const Message = require("../models/message");

exports.messages_post = [
  // Validate and sanitize fields.
  body("message")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Message must not be blank."),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      res.status(400).send(errors.array());
    } else {
      // Data from form is valid.
      const messageUser = await User.findOne({
        username: { $eq: req.user.username },
      });

      if (messageUser) {
        // Create message object with escaped and trimmed data
        const message = new Message({
          text: req.body.message,
          user: messageUser.username,
        });

        console.log(message.text);
        await message.save();
      }
    }
    res.status(200).send();
  }),
];

exports.messages_delete = asyncHandler(async (req, res, next) => {
  if (!req.user.verified || !req.user.admin) {
    res.status(403).send(); //reject non-admin
  } else {
    await Message.findByIdAndDelete(req.params.id);
    res.status(200).send();
  }
});

exports.messages_get = asyncHandler(async (req, res, next) => {
  const messages = await Message.find();
  messages.forEach((message) => {
    message.timestamp_formatted = message.gettimestamp_formatted;
  });
  if (!req.user.verified || !req.user.member) {
    //convert to anonymous
    messages.forEach((message) => {
      message.user = "anonymous";
    });
  }
  res.status(200).json(messages);
});
