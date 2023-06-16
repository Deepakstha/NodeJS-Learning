const express = require("express");
const {
  createManualJournal,
  getManualJournal,
  getIndividualManualJournal,
  deleteManualJournal,
  updateManaualJournal,
} = require("../controllers/organization/journal/manualJournalController");
const catchAsync = require("../utils/catchAsync");
const { protectMiddleware } = require("../utils/isAuthenticated");

const router = express.Router();

router
  .route("/manualJournal")

  .post(protectMiddleware, catchAsync(createManualJournal))
  .get(protectMiddleware, catchAsync(getManualJournal));

router
  .route("/manualJournal/:id")
  .get(protectMiddleware, catchAsync(getIndividualManualJournal))
  .patch(protectMiddleware, catchAsync(updateManaualJournal))
  .delete(protectMiddleware, catchAsync(deleteManualJournal));
module.exports = router;
