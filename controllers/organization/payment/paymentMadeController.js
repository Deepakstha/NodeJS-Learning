const db = require("../../../model/index");
const sequelize = db.sequelize;
const User = db.users;
const AppError = require("../../../utils/appError");

const { QueryTypes, DATE } = require("sequelize");

exports.createPaymentMade = async (req, res, next) => {
  const { organizationNumber } = req.user;
  const generatePaymentMadeId = Math.floor(100000 + Math.random() * 900000);
  const paymentMadeId = "MADE_" + generatePaymentMadeId;
  const {
    vendorName,
    paymentMade,

    paidThrough,
    paymentMode,
    reference,
    bankCharges,
    total,
  } = req.body;
  const paymentDate = req.body.paymentDate || new Date();
  const array = req.body.items;
  if (
    !vendorName ||
    !paymentMade ||
    !paymentDate ||
    !paidThrough ||
    !array ||
    !total ||
    !paymentMode
  )
    return next(new AppError("Please provide all fields", 400));

  await sequelize.query(
    "INSERT INTO paymentMade_" +
      organizationNumber +
      "(vendorName,paymentMade,paymentDate,paidThrough,reference,bankCharges,total,paymentMode,paymentMadeId) values(?,?,?,?,?,?,?,?,?) ",
    {
      type: QueryTypes.INSERT,
      replacements: [
        vendorName,
        paymentMade,
        paymentDate,
        paidThrough,
        reference,
        bankCharges,
        total,
        paymentMode,
        paymentMadeId,
      ],
    }
  );
  let datas = array.map(
    (data) =>
      `(${"'"}${data.purchaseId}${"'"},${
        data.billAmount
      },${"'"}${paymentMadeId}${"'"})`
  );

  await sequelize.query(
    "INSERT INTO paymentFor_" +
      organizationNumber +
      "(billId,paymentAmount,paymentMadeId) VALUES " +
      datas,
    {
      type: QueryTypes.INSERT,
    }
  );

  for (var i = 0; i < array.length; i++) {
    const paymentDue = await sequelize.query(
      "SELECT paymentDue,purchaseId FROM purchase_" + organizationNumber,
      {
        type: QueryTypes.SELECT,
      }
    );

    const updatePaymentDue = await sequelize.query(
      "UPDATE purchase_" +
        organizationNumber +
        " SET purchase_" +
        organizationNumber +
        ".paymentDue = ? WHERE purchase_" +
        organizationNumber +
        ".purchaseId = ?",
      {
        type: QueryTypes.UPDATE,
        replacements: [
          paymentDue[i].paymentDue - array[i].billAmount,
          array[i].purchaseId,
        ],
      }
    );
    await sequelize.query(
      `INSERT INTO paymentMadeHistory_${organizationNumber} (paymentMadeId,billId,paymentAmount,paymentDate) VALUES (?,?,?,?)`,
      {
        type: QueryTypes.INSERT,
        replacements: [
          paymentMadeId,
          array[i].purchaseId,
          array[i].billAmount,
          paymentDate,
        ],
      }
    );
  }

  for (var i = 0; i < array.length; i++) {
    const entries = [
      {
        ledgerId: vendorName,
        debit: array[i].billAmount,
      },
      {
        ledgerId: paidThrough,
        credit: array[i].billAmount,
      },
    ];

    for (var j = 0; j < entries.length; j++) {
      await sequelize.query(
        "INSERT INTO journal_" +
          organizationNumber +
          "(ledgerId, debit, credit,reference,particulars) VALUES (?, ?,?,?,?)",
        {
          type: QueryTypes.INSERT,
          replacements: [
            entries[j].ledgerId || 0,
            entries[j].debit || 0,
            entries[j].credit || 0,
            paymentMadeId,
            "Payment Made for " + vendorName,
          ],
        }
      );
    }
  }

  res.status(200).json({
    status: 200,
    message: "Payment Made Successfully",
  });
};

exports.getPaymentMade = async (req, res, next) => {
  const { organizationNumber } = req.user;
  const paymentMade = await sequelize.query(
    "SELECT * FROM paymentMade_" +
      organizationNumber +
      " JOIN ledgerAccount_" +
      organizationNumber +
      " ON paymentMade_" +
      organizationNumber +
      ".vendorName = ledgerAccount_" +
      organizationNumber +
      ".ledgerId ORDER BY paymentMade_" +
      organizationNumber +
      ".createdDate DESC ",
    {
      type: QueryTypes.SELECT,
    }
  );

  res.status(200).json({
    status: 200,
    length: paymentMade.length,
    data: paymentMade,
  });
};

exports.getIndividualPaymentMade = async (req, res, next) => {
  const { organizationNumber } = req.user;
  const { id } = req.params;
  const paymentMade = await sequelize.query(
    "SELECT *,ledgerOne.ledgerName AS paidTo,ledgerTwo.ledgerName AS paidThrough FROM paymentMade_" +
      organizationNumber +
      ` JOIN ledgerAccount_${organizationNumber}` +
      " AS ledgerOne ON paymentMade_" +
      organizationNumber +
      ".vendorName=ledgerOne" +
      `.ledgerId JOIN ledgerAccount_${organizationNumber} AS ledgerTwo ON paymentMade_${organizationNumber}.paidThrough=ledgerTwo.ledgerId` +
      " WHERE paymentMade_" +
      organizationNumber +
      ".paymentMadeId = ? ",
    {
      type: QueryTypes.SELECT,
      replacements: [id],
    }
  );
  const paymentFor = await sequelize.query(
    "SELECT billId FROM paymentFor_" +
      organizationNumber +
      " WHERE paymentMadeId = ?",
    {
      type: QueryTypes.SELECT,
      replacements: [id],
    }
  );
  const purchaseData = await sequelize.query(
    "SELECT * FROM purchase_" + organizationNumber + " WHERE purchaseId IN (?)",
    {
      type: QueryTypes.SELECT,
      replacements: [paymentFor.map((data) => data.billId)],
    }
  );
  const journalData = await sequelize.query(
    "SELECT *,ledger.ledgerName FROM journal_" +
      organizationNumber +
      ` JOIN ledgerAccount_${organizationNumber} AS ledger ON journal_${organizationNumber}.ledgerId = ledger.ledgerId WHERE reference = ?`,
    {
      type: QueryTypes.SELECT,
      replacements: [id],
    }
  );

  res.status(200).json({
    status: 200,
    data: paymentMade,
    journalData,
    purchaseData,
  });
};

exports.updatePaymentMade = async (req, res, next) => {
  const { organizationNumber } = req.user;
  const {
    paymentMade,
    vendorName,
    paidThrough,
    paymentMode,
    reference,
    bankCharges,
    total,
  } = req.body;
  const paymentDate = req.body.paymentDate || new Date();

  const array = req.body.items;
  await sequelize.query(
    ` UPDATE paymentMade_${organizationNumber} SET vendorName=?,paymentDate=?, paymentMade = ? , paidThrough = ? , paymentMode = ? , reference = ? , bankCharges = ? , total = ? WHERE paymentMadeId = ?`,
    {
      type: QueryTypes.UPDATE,
      replacements: [
        vendorName,
        paymentDate,
        paymentMade,
        paidThrough,
        paymentMode,
        reference,
        bankCharges,
        total,
        req.params.id,
      ],
    }
  );
  if (array && array.length > 0) {
    for (var i = 0; i < array.length; i++) {
      await sequelize.query(
        `UPDATE paymentFor_${organizationNumber} SET paymentAmount = ? WHERE billId = ?`,
        {
          type: QueryTypes.UPDATE,
          replacements: [array[i].billAmount, array[i].purchaseId],
        }
      );
      const paymentDue = await sequelize.query(
        "SELECT paymentDue,purchaseId FROM purchase_" + organizationNumber,
        {
          type: QueryTypes.SELECT,
        }
      );
      const paymentMadeHistory = await sequelize.query(
        `SELECT paymentAmount FROM paymentMadeHistory_${organizationNumber} WHERE billId = ?  ORDER BY id DESC `,
        {
          type: QueryTypes.SELECT,
          replacements: [array[i].purchaseId],
        }
      );
      const updatePaymentDue = await sequelize.query(
        "UPDATE purchase_" +
          organizationNumber +
          " SET purchase_" +
          organizationNumber +
          ".paymentDue = ? WHERE purchase_" +
          organizationNumber +
          ".purchaseId = ?",
        {
          type: QueryTypes.UPDATE,
          replacements: [
            paymentDue[i].paymentDue +
              paymentMadeHistory[0].paymentAmount -
              array[i].billAmount,
            array[i].purchaseId,
          ],
        }
      );
      const insertNewPaymentMadeHistory = await sequelize.query(
        `INSERT INTO paymentMadeHistory_${organizationNumber} (billId,paymentMadeId,paymentAmount,paymentDate) VALUES (?,?,?,?)`,
        {
          type: QueryTypes.INSERT,
          replacements: [
            array[i].purchaseId,
            req.params.id,
            array[i].billAmount,
            paymentDate,
          ],
        }
      );
    }
  }
  await sequelize.query(
    " DELETE  FROM journal_" + organizationNumber + " WHERE reference = ?",
    {
      type: QueryTypes.DELETE,
      replacements: [req.params.id],
    }
  );
  for (var i = 0; i < array.length; i++) {
    const entries = [
      {
        ledgerId: vendorName,
        debit: array[i].billAmount,
      },
      {
        ledgerId: paidThrough,
        credit: array[i].billAmount,
      },
    ];

    for (var j = 0; j < entries.length; j++) {
      await sequelize.query(
        "INSERT INTO journal_" +
          organizationNumber +
          "(ledgerId, debit, credit,reference,particulars) VALUES (?, ?,?,?,?)",
        {
          type: QueryTypes.INSERT,
          replacements: [
            entries[j].ledgerId || 0,
            entries[j].debit || 0,
            entries[j].credit || 0,
            req.params.id,
            "Payment Made for " + vendorName,
          ],
        }
      );
    }
  }
  res.status(200).json({
    status: 200,
    message: "Payment Made Updated Successfully",
  });
};

exports.deletePaymentMade = async (req, res, next) => {
  const { organizationNumber } = req.user;
  const { id } = req.params;
  const paymentMade = await sequelize.query(
    "DELETE FROM paymentMade_" +
      organizationNumber +
      " WHERE paymentMadeId = ?",
    {
      type: QueryTypes.DELETE,
      replacements: [id],
    }
  );
  const paymentFor = await sequelize.query(
    "DELETE FROM paymentFor_" + organizationNumber + " WHERE paymentMadeId = ?",
    {
      type: QueryTypes.DELETE,
      replacements: [id],
    }
  );
  const journal = await sequelize.query(
    "DELETE FROM journal_" + organizationNumber + " WHERE reference = ?",
    {
      type: QueryTypes.DELETE,
      replacements: [id],
    }
  );
  res.status(200).json({
    status: 200,
    message: "Payment Made Deleted Successfully",
  });
};
