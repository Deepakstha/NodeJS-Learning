const db = require("../../../model/index");
const sequelize = db.sequelize;
const User = db.users;
const AppError = require("../../../utils/appError");

const { QueryTypes, DataTypes } = require("sequelize");

exports.getBalances = async (req, res, next) => {
  const { organizationNumber } = req.user;
  const balances = await sequelize.query(
    "SELECT * FROM balances_" +
      organizationNumber +
      " JOIN ledgerAccount_" +
      organizationNumber +
      " ON ledgerAccount_" +
      organizationNumber +
      ".ledgerId=balances_" +
      organizationNumber +
      ".accountId JOIN fiscalYear_" +
      organizationNumber +
      " ON fiscalYear_" +
      organizationNumber +
      ".id=balances_" +
      organizationNumber +
      ".fiscalYearId",
    {
      type: QueryTypes.SELECT,
    }
  );
  res.status(200).json({
    status: 200,
    balances,
  });
};
exports.getIndividualBalances = async (req, res, next) => {
  const { id } = req.params;
  const { organizationNumber } = req.user;
  const balances = await sequelize.query(
    "SELECT * FROM balances_" +
      organizationNumber +
      " JOIN ledgerAccount_" +
      organizationNumber +
      " ON ledgerAccount_" +
      organizationNumber +
      ".ledgerId=balances_" +
      organizationNumber +
      ".accountId JOIN fiscalYear_" +
      organizationNumber +
      " ON fiscalYear_" +
      organizationNumber +
      ".id=balances_" +
      organizationNumber +
      ".fiscalYearId WHERE balances_" +
      organizationNumber +
      ".balanceId=? ",
    {
      type: QueryTypes.SELECT,
      replacements: [id],
    }
  );
  res.status(200).json({
    status: 200,
    balances,
  });
};
exports.updateBalances = async (req, res, next) => {
  const { id } = req.params;
  const {
    openingBalance,
    fiscalYearId,
    accountId,
    closingBalancePosition,
    openingBalancePosition,
  } = req.body;
  const closingBalance = req.body.closingBalance || 0;
  if (!openingBalance || !fiscalYearId || !accountId)
    return next(new AppError("Please provide all fields", 400));
  const { organizationNumber } = req.user;
  await sequelize.query(
    "UPDATE balances_" +
      organizationNumber +
      " SET openingBalance=?,closingBalance=?,fiscalYearId=?,accountId=?,closingBalancePosition=?,openingBalancePosition=? WHERE balanceId=?",
    {
      type: QueryTypes.UPDATE,
      replacements: [
        openingBalance,
        closingBalance,
        fiscalYearId,
        accountId,
        closingBalancePosition || null,
        openingBalancePosition || null,
        id,
      ],
    }
  );
  res.status(200).json({
    status: 200,
    message: "Updated Balances sucessfully",
  });
};
exports.deleteBalances = async (req, res, next) => {
  const { id } = req.params;
  const { organizationNumber } = req.user;
  await sequelize.query(
    "DELETE FROM balances_" + organizationNumber + " WHERE balanceId=?",
    {
      type: QueryTypes.DELETE,
      replacements: [id],
    }
  );
  res.status(200).json({
    status: 200,
    message: "Deleted Balances sucessfully",
  });
};
