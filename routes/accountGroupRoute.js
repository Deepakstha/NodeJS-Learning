const express = require("express");
const router = express.Router();

const {
  getAccountGroup,
  createAccountType,
} = require("../controllers/organization/accountGroup/accountGroupController");

const { protectMiddleware } = require("../utils/isAuthenticated");
const catchAsync = require("../utils/catchAsync");

router
  .route("/accountGroup")
  .get(protectMiddleware, catchAsync(getAccountGroup))
  .post(protectMiddleware, catchAsync(createAccountType));

module.exports = router;
