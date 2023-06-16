const express = require("express");
const {
  createStockGroup,
  getStockGroup,
  updateStockGroup,
  deleteStockGroup,
} = require("../controllers/organization/stockGroup/stockGroupController");
const catchAsync = require("../utils/catchAsync");
const { protectMiddleware } = require("../utils/isAuthenticated");
const router = express.Router();

router
  .route("/stockgroup")
  .post(protectMiddleware, catchAsync(createStockGroup))
  .get(protectMiddleware, catchAsync(getStockGroup));

router
  .route("/stockgroup/:id")
  .patch(protectMiddleware, catchAsync(updateStockGroup))
  .delete(protectMiddleware, catchAsync(deleteStockGroup));

module.exports = router;
