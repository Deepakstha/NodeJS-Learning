const express = require("express");
const {
  createUnit,
  getUnits,
  deleteUnits,
  updateUnits,
} = require("../controllers/organization/Units/unitsController");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const { protectMiddleware } = require("../utils/isAuthenticated");

router
  .route("/units")
  .post(protectMiddleware, catchAsync(createUnit))
  .get(protectMiddleware, catchAsync(getUnits));

router
  .route("/units/:id")
  .delete(protectMiddleware, catchAsync(deleteUnits))
  .patch(protectMiddleware, catchAsync(updateUnits));
module.exports = router;
