const express = require("express");
const {
  getTotal,
} = require("../controllers/organization/accountGroup/accountGroupController");
const {
  createLedger,
  getLedger,
  deleteLedger,
  updateLedger,
  getLedgerAccount,
} = require("../controllers/organization/ledger/ledgerController");
const router = express.Router();

const { protectMiddleware } = require("../utils/isAuthenticated");
const catchAsync = require("../utils/catchAsync");

router
  .route("/ledger")
  .post(protectMiddleware, catchAsync(createLedger))
  .get(protectMiddleware, catchAsync(getLedger));

router.route("/ledger/getTotal").get(protectMiddleware, catchAsync(getTotal));
router
  .route("/ledger/:id")
  .delete(protectMiddleware, catchAsync(deleteLedger))
  .patch(protectMiddleware, catchAsync(updateLedger));

router
  .route("/getLedgerAccount")
  .get(protectMiddleware, catchAsync(getLedgerAccount));

module.exports = router;
