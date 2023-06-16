const express = require("express");
const {
  createCurrency,
  getCurrency,
  getIndividualCurrency,
  updateCurrency,
  deleteCurrency,
} = require("../controllers/organization/currency/currencyController");
const router = express.Router();

const catchAsync = require("../utils/catchAsync");
const { protectMiddleware } = require("../utils/isAuthenticated");

router
  .route("/currency")
  .post(protectMiddleware, catchAsync(createCurrency))
  .get(protectMiddleware, catchAsync(getCurrency));

router
  .route("/currency/:id")
  .get(protectMiddleware, catchAsync(getIndividualCurrency))
  .patch(protectMiddleware, catchAsync(updateCurrency))
  .delete(protectMiddleware, catchAsync(deleteCurrency));

module.exports = router;
