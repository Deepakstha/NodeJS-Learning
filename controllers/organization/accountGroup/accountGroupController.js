const db = require("../../../model/index");
const sequelize = db.sequelize;

const AppError = require("../../../utils/appError");

const { QueryTypes, DataTypes } = require("sequelize");

exports.getTotal = async (req, res, next) => {
  const { organizationNumber } = req.user;

  const crTotal = await sequelize.query(
    "SELECT SUM(openingBalance) as crTotal FROM balances_" +
      organizationNumber +
      " WHERE openingBalancePosition = 'cr'",
    {
      type: QueryTypes.SELECT,
    }
  );
  const drTotal = await sequelize.query(
    "SELECT SUM(openingBalance) as drTotal FROM balances_" +
      organizationNumber +
      " WHERE openingBalancePosition = 'dr'",
    {
      type: QueryTypes.SELECT,
    }
  );
  res.status(200).json({
    status: 200,
    crTotal,
    drTotal,
  });
};

exports.getAccountGroup = async (req, res, next) => {
  const { organizationNumber } = req.user;
  const accountGroup = await sequelize.query(
    "SELECT * FROM accountGroup_" + organizationNumber,
    {
      type: QueryTypes.SELECT,
    }
  );
  const accountGroupWithParent = await sequelize.query(
    "SELECT accountGroup.id,accountGroup.accountName,accountGroup.accountNature,accountGroup.affectTradingAccount,accountGroup.type,accountGroup.parentId,parentGroup.accountName as parent FROM accountGroup_" +
      organizationNumber +
      " accountGroup LEFT JOIN accountGroup_" +
      organizationNumber +
      " parentGroup ON accountGroup.parentId=parentGroup.id ORDER BY accountGroup.id",
    {
      type: QueryTypes.SELECT,
    }
  );
  res.status(200).json({
    status: 200,
    accountGroup,
    accountGroupWithParent,
  });
};

exports.createAccountType = async (req, res, next) => {
  const { accountName, accountNature, parentId, type } = req.body;

  const { organizationNumber } = req.user;
  const affectTradingAccount = req.body.affectTradingAccount || false;

  if (!accountName || !accountNature || !type) {
    return next(new AppError("Please enter all fields", 400));
  }

  await sequelize.query(
    "INSERT INTO accountGroup_" +
      organizationNumber +
      "(accountName,accountNature,affectTradingAccount,parentId,type) values(?,?,?,?,?)",
    {
      type: QueryTypes.INSERT,
      replacements: [
        accountName,
        accountNature,
        affectTradingAccount,
        parentId || null,
        type,
      ],
    }
  );
  res.status(200).json({
    status: 200,
    message: "Account Group created successfully",
  });
};
