const db = require("../../../model/index");
const sequelize = db.sequelize;

const AppError = require("../../../utils/appError");

const { QueryTypes, DataTypes } = require("sequelize");

exports.createLedger = async (req, res, next) => {
  const { organizationNumber, id } = req.user;
  if (!organizationNumber)
    return res.status(401).json({
      status: 401,
      message: "First create organization in order to create ledger",
    });
  const {
    ledgerName,
    openingBalance,
    openingBalancePosition,
    contactNumber,
    pinNumber,
    address,
    email,
    accountGroupId,
  } = req.body;
  const fiscalYearId = req.body.fiscalYearId || null;
  const closingBalance = req.body.closingBalance || 0;
  const closingBalancePosition = req.body.closingBalancePosition || null;
  if (
    !ledgerName ||
    !openingBalance ||
    !openingBalancePosition ||
    !contactNumber ||
    !pinNumber ||
    !email ||
    !address ||
    !accountGroupId
  )
    return next(new AppError("Please enter all fields", 400));

  try {
    await sequelize.query(
      "INSERT INTO ledgerAccount_" +
        organizationNumber +
        "(ledgerName,contactNo,pinNumber,userId,email,address,accountGroupId) values(?,?,?,?,?,?,?)",
      {
        type: QueryTypes.INSERT,
        replacements: [
          ledgerName,

          contactNumber,
          pinNumber,
          id,
          email,
          address,
          accountGroupId,
        ],
      }
    );
  } catch (error) {
    res.status(400).json({
      status: 400,
      message: error.errors[0].message,
    });
  }
  const ledgerId = await sequelize.query(
    "SELECT ledgerId FROM ledgerAccount_" +
      organizationNumber +
      " WHERE ledgerName=?",

    {
      type: QueryTypes.SELECT,
      replacements: [ledgerName],
    }
  );
  await sequelize.query(
    "INSERT INTO balances_" +
      organizationNumber +
      "(openingBalance,closingBalance,fiscalYearId,accountId,openingBalancePosition,closingBalancePosition) values(?,?,?,?,?,?)",
    {
      type: QueryTypes.INSERT,
      replacements: [
        openingBalance,
        closingBalance,
        fiscalYearId,
        ledgerId[0].ledgerId,
        openingBalancePosition,
        closingBalancePosition,
      ],
    }
  );
  res.status(200).json({
    status: 200,
    message: "Ledger created",
  });
};

exports.getLedger = async (req, res, next) => {
  const { organizationNumber } = req.user;
  if (!organizationNumber)
    return next(
      new AppError(
        "First create organization & ledger in order to get ledger",
        400
      )
    );

  const ledger = await sequelize.query(
    "SELECT ledgerId,ledgerName,accountNature,email,address,parentId,pinNumber,accountName,openingBalance,openingBalancePosition,fiscalYearId FROM ledgerAccount_" +
      organizationNumber +
      " JOIN accountGroup_" +
      organizationNumber +
      " ON ledgerAccount_" +
      organizationNumber +
      ".accountGroupId=accountGroup_" +
      organizationNumber +
      ".id JOIN balances_" +
      organizationNumber +
      " ON ledgerAccount_" +
      organizationNumber +
      ".ledgerId=balances_" +
      organizationNumber +
      ".accountId",
    {
      type: QueryTypes.SELECT,
    }
  );

  res.status(200).json({
    status: 200,
    message: "success",
    ledger,
  });
};

exports.deleteLedger = async (req, res, next) => {
  const { organizationNumber } = req.user;
  if (!organizationNumber)
    return next(
      new AppError(
        "First create organization & ledger in order to delete ledger",
        400
      )
    );

  const id = req.params.id;

  const userId = await sequelize.query(
    "SELECT userId FROM ledgerAccount_" + organizationNumber,
    { type: QueryTypes.SELECT }
  );

  console.log(userId[0].userId);
  if (userId[0].userId !== req.user.id)
    return next(
      new AppError("You don't have permission to delete this ledger", 400)
    );

  await sequelize.query(
    "DELETE FROM ledgerAccount_" + organizationNumber + " WHERE ledgerId=" + id,
    {
      type: QueryTypes.DELETE,
    }
  );
  res.status(200).json({
    status: "success",
    message: "deleted ledger sucessfully",
  });
};

exports.updateLedger = async (req, res, next) => {
  const { organizationNumber } = req.user;
  const {
    ledgerName,

    contactNumber,
    vatNumber,
    accountGroup,
  } = req.body;
  if (!organizationNumber)
    return next(
      new AppError(
        "First create organization or ledger in order to update ledger",
        400
      )
    );

  await sequelize.query(
    "UPDATE ledgerAccount_" +
      organizationNumber +
      "SET ledgerName=" +
      ledgerName +
      " contactNo=" +
      contactNumber +
      " vatNumber=" +
      vatNumber +
      " accountGroup=" +
      accountGroup,
    {
      type: QueryTypes.UPDATE,
    }
  );
};

exports.getLedgerAccount = async (req, res, next) => {
  const { organizationNumber } = req.user;
  if (!organizationNumber)
    return next(
      new AppError(
        "First create organization in order to get ledger account",
        400
      )
    );
  const ledgerAccount = await sequelize.query(
    "SELECT *  FROM ledgerAccount_" + organizationNumber,
    { type: QueryTypes.SELECT }
  );
  res.status(200).json({
    status: 200,
    message: "success",
    ledgerAccount,
  });
};
