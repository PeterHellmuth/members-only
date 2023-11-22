var express = require("express");
var router = express.Router();
const messageController = require("../controllers/messageController");
const userController = require("../controllers/userController");

/* POST a message. */
router.post("/", userController.verifyToken, messageController.messages_post);

/* DELETE a message. */
router.delete(
  "/:id",
  userController.verifyToken,
  messageController.messages_delete
);

/* GET messages */
router.get(
  "/",
  userController.allowAnonymous,
  userController.verifyToken,
  messageController.messages_get
);

module.exports = router;
