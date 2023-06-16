const db = require("../../../model/index");
const sequelize = db.sequelize;
const User = db.users;
const AppError = require("../../../utils/appError");

const { QueryTypes } = require("sequelize");

exports.createManualJournal = async (req, res, next) => {
  const { organizationNumber } = req.user;
  const generateRandomManualPurchaseId = Math.floor(
    100000 + Math.random() * 900000
  );
  const manualJournalId = "MAN_" + generateRandomManualPurchaseId;
  const { date, journal, reference, notes, particulars, tax } = req.body;
  const subTotalDebit = req.body.subTotalDebit || 0;
  const subTotalCredit = req.body.subTotalCredit || 0;
  const taxDebit = req.body.taxDebit || 0;
  const taxCredit = req.body.taxCredit || 0;
  const totalDebit = req.body.totalDebit || 0;
  const totalCredit = req.body.totalCredit || 0;
  const difference = req.body.difference || 0;
  const total = req.body.total || 0;
  const debits = req.body.debits || 0;
  const credits = req.body.credits || 0;
  const array = req.body.array;
  const ledgerId = req.body.ledgerId || null;
  if (!date || !journal || !reference || !notes) {
    return next(new AppError("Please fill all the fields", 400));
  }

  await sequelize.query(
    "INSERT INTO manualJournal_" +
      organizationNumber +
      "(date,journal,reference,notes,subTotalDebit,subTotalCredit,taxDebit,taxCredit,totalDebit,totalCredit,difference,total,manualJournalId) VALUES (?, ?,?,?,?,?,?,?,?,?,?,?,?)",
    {
      type: QueryTypes.INSERT,
      replacements: [
        date,
        journal,
        reference,
        notes,
        subTotalDebit,
        subTotalCredit,
        taxDebit,
        taxCredit,
        totalDebit,
        totalCredit,
        difference,
        total,
        manualJournalId,
      ],
    }
  );

  let datas = array.map(
    (data) =>
      `(${"'"}${manualJournalId}${"'"}, ${data.ledgerId || null}, ${"'"}${
        data.particulars
      }${"'"}, ${data.credits || 0}, ${data.debits || 0})`
  );

  await sequelize.query(
    "INSERT INTO journal_" +
      organizationNumber +
      "(reference,ledgerId, particulars,debit, credit) VALUES " +
      datas,
    {
      type: QueryTypes.INSERT,
    }
  );

  res.status(200).json({
    status: 200,
    message: "Manual journal created successfully",
  });
};

exports.getManualJournal = async (req, res, next) => {
  const { organizationNumber } = req.user;

  const manualJournal = await sequelize.query(
    "SELECT * FROM manualJournal_" + organizationNumber,
    {
      type: QueryTypes.SELECT,
    }
  );
  res.status(200).json({
    status: 200,
    data: manualJournal,
  });
};

exports.getIndividualManualJournal = async (req, res, next) => {
  const { organizationNumber } = req.user;
  const id = req.params.id;

  const manualJournal = await sequelize.query(
    "SELECT * FROM manualJournal_" +
      organizationNumber +
      " WHERE manualJournalId=?",
    // " JOIN ledgerAccount_" +
    // organizationNumber +
    // " ON journal_" +
    // organizationNumber +
    // ".ledgerId=ledgerAccount_" +
    // organizationNumber +
    // ".ledgerId WHERE manualJournal_" +
    // organizationNumber +
    // ".manualJournalId=?",
    {
      type: QueryTypes.SELECT,
      replacements: [id],
    }
  );

  const journal = await sequelize.query(
    "SELECT * FROM journal_" + organizationNumber + " WHERE reference=?",
    {
      type: QueryTypes.SELECT,
      replacements: [id],
    }
  );
  if (!manualJournal)
    return next(new AppError("manualJournal not found with that id", 404));
  // const items = [];

  // manualJournal.forEach((row) => {
  //   items.push({
  //     ledgerName: row.ledgerName,
  //     tax: row.taxDebit || row.taxCredit,
  //     debits: row.debit,
  //     credits: row.credit,
  //   });
  // });
  res.status(200).json({
    status: 200,
    data: manualJournal,
    journal,
  });
};
// what is today?

exports.updateManaualJournal = async (req, res, next) => {
  const { organizationNumber } = req.user;
  const { date, journal, reference, notes, particulars, tax } = req.body;
  const subTotalDebit = req.body.subTotalDebit || 0;
  const subTotalCredit = req.body.subTotalCredit || 0;
  const taxDebit = req.body.taxDebit || 0;
  const taxCredit = req.body.taxCredit || 0;
  const totalDebit = req.body.totalDebit || 0;
  const totalCredit = req.body.totalCredit || 0;
  const difference = req.body.difference || 0;
  const total = req.body.total || 0;
  const debits = req.body.debits || 0;
  const credits = req.body.credits || 0;
  const array = req.body.array;
  const ledgerId = req.body.ledgerId || null;
  const id = req.params.id;
  if (!date || !journal || !reference || !notes) {
    return next(new AppError("Please fill all the fields", 400));
  }

  await sequelize.query(
    "UPDATE manualJournal_" +
      organizationNumber +
      " SET date=?,journal=?,reference=?,notes=?,subTotalDebit=?,subTotalCredit=?,taxDebit=?,taxCredit=?,totalDebit=?,totalCredit=?,difference=?,total=? WHERE manualJournalId=?",
    {
      type: QueryTypes.UPDATE,
      replacements: [
        date,
        journal,
        reference,
        notes,
        subTotalDebit,
        subTotalCredit,
        taxDebit,
        taxCredit,
        totalDebit,
        totalCredit,
        difference,
        total,
        id,
      ],
    }
  );

  let datas = array.map(
    (data) =>
      `(${"'"}${id}${"'"}, ${data.ledgerId || null}, ${"'"}${
        data.particulars
      }${"'"}, ${data.credits || 0}, ${data.debits || 0})`
  );

  await sequelize.query(
    "INSERT INTO journal_" +
      organizationNumber +
      "(reference,ledgerId, particulars,debit, credit) VALUES " +
      datas,
    {
      type: QueryTypes.INSERT,
    }
  );

  res.status(200).json({
    status: 200,
    message: "Manual journal updated successfully",
  });
};

exports.deleteManualJournal = async (req, res, next) => {
  const { organizationNumber } = req.user;
  const id = req.params.id;
  const manualJournal = await sequelize.query(
    "DELETE FROM manualJournal_" +
      organizationNumber +
      " WHERE manualJournalId=?",
    {
      type: QueryTypes.DELETE,
      replacements: [id],
    }
  );

  await sequelize.query(
    "DELETE FROM journal_" + organizationNumber + " WHERE reference=?",
    {
      type: QueryTypes.DELETE,
      replacements: [id],
    }
  );
  res.status(200).json({
    status: 200,
    message: "Manual journal deleted successfully",
  });
};
