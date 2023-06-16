const db = require("../../../model/index");
const sequelize = db.sequelize;
const User = db.users;
const AppError = require("../../../utils/appError");

const { QueryTypes, DataTypes } = require("sequelize");

exports.createContra = async (req, res, next) => {
  const { organizationNumber } = req.user;
  const { contraToAccount, contraFromAccount, totalAmount } = req.body;
  const narration = req.body.narration || "";
  const date = req.body.Date || new Date();
  const generateContraId = Math.floor(100000 + Math.random() * 900000);
  const contraId = "CONTRA_" + generateContraId;
  await sequelize.query(
    `INSERT INTO contra_${organizationNumber} (contraToAccount,contraFromAccount,totalAmount,narration,Date,contraId) VALUES(?,?,?,?,?,?) `,
    {
      type: QueryTypes.INSERT,
      replacements: [
        contraToAccount,
        contraFromAccount,
        totalAmount,
        narration,
        date,
        contraId,
      ],
    }
  );
  const entries = [
    {
      ledgerId: contraToAccount,
      debit: totalAmount,
    },
    {
      ledgerId: contraFromAccount,
      credit: totalAmount,
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
          contraId || null,
          "Contra Made for " + contraToAccount,
        ],
      }
    );
  }
  res.status(200).json({
    status: 200,
    message: "Contra created successfully",
  });
};

exports.getContra = async (req, res, next) => {
  const { organizationNumber } = req.user;
  const contra = await sequelize.query(
    `SELECT *,l1.ledgerName AS contraToAccountName,l2.ledgerName AS contraFromAccountName FROM contra_${organizationNumber} JOIN ledgerAccount_${organizationNumber} l1 ON contra_${organizationNumber}.contraToAccount=l1.ledgerId JOIN ledgerAccount_${organizationNumber} l2 ON contra_${organizationNumber}.contraFromAccount=l2.ledgerId `,
    {
      type: QueryTypes.SELECT,
    }
  );
  res.status(200).json({
    status: 200,
    contra,
  });
};

exports.getIndividualContra = async (req, res, next) => {
  const { organizationNumber } = req.user;
  const { id } = req.params;
  const contra = await sequelize.query(
    `SELECT *,l1.ledgerName AS contraToAccountName,l2.ledgerName AS contraFromAccountName FROM contra_${organizationNumber} JOIN ledgerAccount_${organizationNumber} l1 ON contra_${organizationNumber}.contraToAccount=l1.ledgerId JOIN ledgerAccount_${organizationNumber} l2 ON contra_${organizationNumber}.contraFromAccount=l2.ledgerId WHERE contraId=?`,
    {
      type: QueryTypes.SELECT,
      replacements: [id],
    }
  );
  const journal = await sequelize.query(
    `SELECT * FROM journal_${organizationNumber} JOIN ledgerAccount_${organizationNumber} ON journal_${organizationNumber}.ledgerId=ledgerAccount_${organizationNumber}.ledgerId WHERE reference=?`,
    {
      type: QueryTypes.SELECT,
      replacements: [id],
    }
  );

  res.status(200).json({
    status: 200,
    contra,
    journal,
  });
};

exports.updateContra = async (req, res, next) => {
  const { organizationNumber } = req.user;
  const { contraToAccount, contraFromAccount, totalAmount } = req.body;
  const narration = req.body.narration || "";
  const date = req.body.Date || new Date();
  const { id } = req.params;
  try {
    await sequelize.query(
      `UPDATE contra_${organizationNumber} SET contraToAccount=?,contraFromAccount=?,totalAmount=?,narration=?,Date=? WHERE contraId=?`,
      {
        type: QueryTypes.UPDATE,
        replacements: [
          contraToAccount,
          contraFromAccount,
          totalAmount,
          narration,
          date,
          id,
        ],
      }
    );
    await sequelize.query(
      "DELETE FROM journal_" + organizationNumber + " WHERE reference=?",
      {
        type: QueryTypes.DELETE,
        replacements: [id],
      }
    );
    const entries = [
      {
        ledgerId: contraToAccount,
        debit: totalAmount,
      },
      {
        ledgerId: contraFromAccount,
        credit: totalAmount,
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
            id,
            "Contra Made To  " + contraToAccount,
          ],
        }
      );
    }
    res.status(200).json({
      status: 200,
      message: "Contra updated successfully",
    });
  } catch (e) {
    res.json({
      status: 400,
      message: "Contra not updated",
      error: e.message,
    });
  }
};

exports.deleteContra = async (req, res, next) => {
  try {
    const { organizationNumber } = req.user;
    const { id } = req.params;
    await sequelize.query(
      `DELETE FROM contra_${organizationNumber} WHERE contraId=?`,
      {
        type: QueryTypes.DELETE,
        replacements: [id],
      }
    );
    await sequelize.query(
      `DELETE FROM journal_${organizationNumber} WHERE reference=?`,
      {
        type: QueryTypes.DELETE,
        replacements: [id],
      }
    );
    res.status(200).json({
      status: 200,
      message: "Contra deleted successfully",
    });
  } catch (e) {
    res.json({
      status: 400,
      message: "Contra not deleted",
      error: e.message,
    });
  }
};
