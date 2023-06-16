const express = require("express");
const {
  createTax,
  getTax,
  updateTax,
  deleteTax,
} = require("../controllers/organization/tax/taxController");

const router = express.Router();

const catchAsync = require("../utils/catchAsync");
const { protectMiddleware } = require("../utils/isAuthenticated");
const { get } = require("./organizationRoute");

router
  .route("/tax")
  .post(protectMiddleware, catchAsync(createTax))
  .get(protectMiddleware, catchAsync(getTax));
router
  .route("/tax/:id")
  .patch(protectMiddleware, catchAsync(updateTax))
  .delete(protectMiddleware, catchAsync(deleteTax));

module.exports = router;
