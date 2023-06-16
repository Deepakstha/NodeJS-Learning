const express = require("express");
const {
  createAccountGroupTable,
  createUnitTable,
  createLedgerAccountTable,
  getOrganization,
  createOrganizationTable,
  createStockGroupTable,
  createStockItemTable,
  changeOrganization,
  createFiscalYearTable,
  createJournalTable,
  createSalesTable,
  createSalesDetailsTable,
  createPurchaseTable,
  createPurchaseDetailsTable,
  createTaxTable,
  createManualJournalTable,
  createPaymentMadeTable,
  createPaymentForTable,
  createPaymentMadeHistoryTable,
  createCurrencyTable,
  createBalancesTable,
  createContraTable,
  deleteOrganization,
  getMyCurrentOrganization,
} = require("../controllers/organization/organizationController");
const router = express.Router();

const catchAsync = require("../utils/catchAsync");
const { protectMiddleware } = require("../utils/isAuthenticated");

//organization routes
// router.get("/organizations", protectMiddleware, getAllOrganizations);

router
  .route("/organization")
  .post(
    protectMiddleware,
    catchAsync(createOrganizationTable),
    catchAsync(createAccountGroupTable),
    catchAsync(createUnitTable),
    catchAsync(createStockGroupTable),
    catchAsync(createStockItemTable),
    catchAsync(createFiscalYearTable),
    catchAsync(createLedgerAccountTable),
    catchAsync(createPurchaseTable),
    catchAsync(createPurchaseDetailsTable),
    catchAsync(createSalesTable),
    catchAsync(createSalesDetailsTable),
    catchAsync(createJournalTable),
    catchAsync(createManualJournalTable),
    catchAsync(createPaymentForTable),
    catchAsync(createPaymentMadeTable),
    catchAsync(createPaymentMadeHistoryTable),
    catchAsync(createContraTable),
    catchAsync(createTaxTable),
    catchAsync(createCurrencyTable),
    catchAsync(createBalancesTable)
  )
  .get(protectMiddleware, catchAsync(getOrganization));

router
  .route("/changeOrganization")
  .post(protectMiddleware, catchAsync(changeOrganization));

router
  .route("/mycurrentorganization")
  .get(protectMiddleware, catchAsync(getMyCurrentOrganization));

// router.route("/organization/:id").delete(protectMiddleware, catchAsync(deleteOrganization));

module.exports = router;
