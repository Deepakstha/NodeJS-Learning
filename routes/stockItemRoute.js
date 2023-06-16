const express = require("express");
const {
  createStockItem,
  getStockItem,
  deleteStockItem,
  updateStockItem,
} = require("../controllers/organization/stockItem/stockItem");
const catchAsync = require("../utils/catchAsync");
const { protectMiddleware } = require("../utils/isAuthenticated");
const router = express.Router();

router
  .route("/stockItem")
  .post(protectMiddleware, catchAsync(createStockItem))
  .get(protectMiddleware, catchAsync(getStockItem));

router
  .route("/stockItem/:id")
  .delete(protectMiddleware, catchAsync(deleteStockItem))
  .patch(protectMiddleware, catchAsync(updateStockItem));
module.exports = router;
