const express = require("express");
const {
  getMe,
  updateMe,
  deleteMe,
} = require("../controllers/user/userController");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const { protectMiddleware } = require("../utils/isAuthenticated");

router
  .route("/me")
  .get(protectMiddleware, catchAsync(getMe))
  .patch(protectMiddleware, catchAsync(updateMe))
  .delete(protectMiddleware, catchAsync(deleteMe));

module.exports = router;
