const router = require("express").Router();
const authController = require("../controllers/auth/authController");
const catchAsync = require("../utils/catchAsync");
const { checkUser } = require("../utils/checkUser");
const { protectMiddleware } = require("../utils/isAuthenticated");

router.route("/register").post(catchAsync(authController.createUser));
router.route("/login").post(catchAsync(authController.loginUser));
router.route("/checkuser").post(catchAsync(checkUser));

router.route("/forgotPassword").post(catchAsync(authController.forgetPassword));
router.route("/resetPassword").post(catchAsync(authController.resetPassword));
router
  .route("/updatePassword")
  .post(protectMiddleware, catchAsync(authController.updatePassword));
router
  .route("/logout")
  .post(protectMiddleware, catchAsync(authController.logOut));

module.exports = router;
