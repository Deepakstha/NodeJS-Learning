const express = require("express");
const {
  createContra,
  getContra,
  getIndividualContra,
  updateContra,
  deleteContra,
} = require("../controllers/organization/contra/contraController");
const router = express.Router();

const catchAsync = require("../utils/catchAsync");
const { protectMiddleware } = require("../utils/isAuthenticated");
router
  .route("/contra")
  .post(protectMiddleware, catchAsync(createContra))
  .get(protectMiddleware, catchAsync(getContra));
router
  .route("/contra/:id")
  .get(protectMiddleware, catchAsync(getIndividualContra))
  .patch(protectMiddleware, catchAsync(updateContra))
  .delete(protectMiddleware, catchAsync(deleteContra));

module.exports = router;
