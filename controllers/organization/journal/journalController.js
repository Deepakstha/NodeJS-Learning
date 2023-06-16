const db = require("../../../model/index");
const sequelize = db.sequelize;
const User = db.users;
const AppError = require("../../../utils/appError");

const { QueryTypes } = require("sequelize");
exports.createPurchaseJournal = async (req, res, next) => {
  const { organizationNumber } = req.user;

  const {
    purchaseId,
    totalBillValue,
    tax,
    discount,
    adjustment,
    partyAccount,
    purchaseAccount,
    itemsTotalValue,
    discountId
  } = req;

  const entries = [
    {
      ledgerId: 1,
      debit: tax,
    },
    {
      ledgerId: purchaseAccount,
      debit: itemsTotalValue,
    },
    {
      ledgerId: discountId,
      credit: discount,
    },
    {
      ledgerId: 5,
      debit: adjustment,
    },
    {
      ledgerId: partyAccount,
      credit: totalBillValue,
    },
  ];

  for (var i = 0; i < entries.length; i++) {
    await sequelize.query(
      "INSERT INTO journal_" +
        organizationNumber +
        "(ledgerId, debit, credit,reference,particulars) VALUES (?, ?,?,?,?)",
      {
        type: QueryTypes.INSERT,
        replacements: [
          entries[i].ledgerId || 0,
          entries[i].debit || 0,
          entries[i].credit || 0,
          purchaseId,
          "Purchased Bill for " + partyAccount,
        ],
      }
    );
  }

  res.status(200).json({
    status: 200,
    message: "Purchase Journal created successfully",
  });
};

exports.createSaleJournal = async (req, res, next) => {
  const { organizationNumber } = req.user;

  const {
    saleId,
    totalBillValue,
    tax,
    discount,
    adjustment,
    partyAccount,
    salesAccount,
    itemsTotalValue,
  } = req;

  const entries = [
    {
      ledgerId: 7,
      credit: tax,
    },
    {
      ledgerId: salesAccount,
      credit: itemsTotalValue,
    },
    {
      ledgerId: 4,
      debit: discount,
    },
    {
      ledgerId: 5,
      credit: adjustment,
    },
    {
      ledgerId: partyAccount,
      debit: totalBillValue,
    },
  ];

  for (var i = 0; i < entries.length; i++) {
    await sequelize.query(
      "INSERT INTO journal_" +
        organizationNumber +
        "(ledgerId, debit, credit,reference,particulars) VALUES (?, ?,?,?,?)",
      {
        type: QueryTypes.INSERT,
        replacements: [
          entries[i].ledgerId || 0,
          entries[i].debit || 0,
          entries[i].credit || 0,
          saleId,
          "Saled Bill for " + partyAccount,
        ],
      }
    );
  }

  res.status(200).json({
    status: 200,
    message: "Sales Journal created successfully",
  });
};

exports.getJournal = async (req, res, next) => {
  const { organizationNumber } = req.user;
  const journal = await sequelize.query(
    "SELECT * FROM journal_" +
      organizationNumber +
      " JOIN ledgeraccount_" +
      organizationNumber +
      " ON journal_" +
      organizationNumber +
      ".ledgerId = ledgeraccount_" +
      organizationNumber +
      ".ledgerId",
    {
      type: QueryTypes.SELECT,
    }
  );
  res.status(200).json({
    status: 200,
    data: journal,
  });
};

exports.getInvidualJournal = async (req, res, next) => {
  const { organizationNumber } = req.user;
  const { id } = req.params;
  const journal = await sequelize.query(
    "SELECT * FROM journal_" +
      organizationNumber +
      " JOIN ledgeraccount_" +
      organizationNumber +
      " ON journal_" +
      organizationNumber +
      ".ledgerId = ledgeraccount_" +
      organizationNumber +
      ".ledgerId WHERE journal_" +
      organizationNumber +
      ".reference = " +
      JSON.stringify(id),
    {
      type: QueryTypes.SELECT,
    }
  );
  res.status(200).json({
    status: 200,
    data: journal,
  });
};
