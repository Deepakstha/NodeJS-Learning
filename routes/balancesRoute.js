const express = require("express");
const {
  createBalances,
  getBalances,
  getIndividualBalances,
  updateBalances,
  deleteBalances,
} = require("../controllers/organization/balances/balancesController");
const { prepareStackTrace } = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const { protectMiddleware } = require("../utils/isAuthenticated");
const router = express.Router();

router.route("/balances").get(protectMiddleware, catchAsync(getBalances));

router
  .route("/balances/:id")
  .get(protectMiddleware, catchAsync(getIndividualBalances))
  .patch(protectMiddleware, catchAsync(updateBalances))
  .delete(protectMiddleware, catchAsync(deleteBalances));

module.exports = router;
