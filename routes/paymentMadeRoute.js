const express = require("express");
const {
  createPaymentMade,
  getPaymentMade,
  getIndividualPaymentMade,
  updatePaymentMade,
  deletePaymentMade,
} = require("../controllers/organization/payment/paymentMadeController");
const catchAsync = require("../utils/catchAsync");
const { protectMiddleware } = require("../utils/isAuthenticated");
const router = express.Router();

router
  .route("/paymentmade")
  .post(protectMiddleware, catchAsync(createPaymentMade))
  .get(protectMiddleware, catchAsync(getPaymentMade));

router
  .route("/paymentmade/:id")
  .get(protectMiddleware, catchAsync(getIndividualPaymentMade))
  .patch(protectMiddleware, catchAsync(updatePaymentMade))
  .delete(protectMiddleware, catchAsync(deletePaymentMade));

module.exports = router;
