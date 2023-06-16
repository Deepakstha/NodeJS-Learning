const express = require("express");
const {
  getFiscalYear,
  createFiscalYear,
  updateFiscalYear,
  deleteFiscalYear,
} = require("../controllers/organization/fiscalYear/fiscalYearController");
const { protectMiddleware } = require("../utils/isAuthenticated");
const router = express.Router();

router
  .route("/fiscalyear")
  .get(protectMiddleware, getFiscalYear)
  .post(protectMiddleware, createFiscalYear);
router
  .route("/fiscalyear/:id")
  .patch(protectMiddleware, updateFiscalYear)
  .delete(protectMiddleware, deleteFiscalYear);

module.exports = router;
