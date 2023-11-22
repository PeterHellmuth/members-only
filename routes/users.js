var express = require("express");
var router = express.Router();
const userController = require("../controllers/userController");

/* POST create a user. */
router.post("/", userController.user_create_post);

/* POST login a user. */
router.post("/login", userController.user_login_post);

/* POST logout a user. */
router.post("/logout", userController.user_logout_post);

/* PUT user wants to join the club */
router.put(
  "/member",
  userController.verifyToken,
  userController.user_member_put
);

/* PUT user wants to be an admin */
router.put("/admin", userController.verifyToken, userController.user_admin_put);

/* GET profile page. verify login-status first*/
router.get(
  "/authenticate",
  userController.verifyToken,
  userController.user_authenticate_get
);

module.exports = router;
