const express = require("express");
const router = express.Router();
const { protectMiddleware } = require("../utils/isAuthenticated");
const catchAsync = require("../utils/catchAsync");
const {
  createSale,
  getSale,
  deleteSale,
  updateSale,
  getSales,
} = require("../controllers/organization/sale/saleController");
const {
  createSaleJournal,
} = require("../controllers/organization/journal/journalController");

router
  .route("/sale")
  .post(
    protectMiddleware,
    catchAsync(createSale),
    catchAsync(createSaleJournal)
  )
  .get(protectMiddleware, catchAsync(getSales));
//   .get(protectMiddleware, catchAsync(getPurchases));

router
  .route("/sale/:saleId")
  .get(protectMiddleware, catchAsync(getSale))
  .delete(protectMiddleware, catchAsync(deleteSale))
  .patch(protectMiddleware, catchAsync(updateSale));
module.exports = router;
