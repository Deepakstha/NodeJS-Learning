const express = require("express");
const {
  createPurchaseJournal,
  getJournal,
  getInvidualJournal,
} = require("../controllers/organization/journal/journalController");
const {
  createPurchase,
  getPurchase,
  deletePurchase,
  updatePurchase,
  getPurchases,
} = require("../controllers/organization/purchase/purchaseController");
const router = express.Router();

const catchAsync = require("../utils/catchAsync");
const { protectMiddleware } = require("../utils/isAuthenticated");

router
  .route("/purchase")
  .post(
    protectMiddleware,
    catchAsync(createPurchase),
    catchAsync(createPurchaseJournal)
  )
  .get(protectMiddleware, catchAsync(getPurchases));
router.route("/journal").get(protectMiddleware, catchAsync(getJournal));
router
  .route("/journal/:id")
  .get(protectMiddleware, catchAsync(getInvidualJournal));

router
  .route("/purchase/:purchaseId")
  .get(protectMiddleware, catchAsync(getPurchase))
  .delete(protectMiddleware, catchAsync(deletePurchase))
  .patch(protectMiddleware, catchAsync(updatePurchase));

module.exports = router;
