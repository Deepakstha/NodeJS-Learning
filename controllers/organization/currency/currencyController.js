const db = require("../../../model/index");
const sequelize = db.sequelize;
const User = db.users;
const AppError = require("../../../utils/appError");

const { QueryTypes, DataTypes } = require("sequelize");

exports.createCurrency = async (req, res, next) => {
  const { name, symbol } = req.body;
  if (!name || !symbol)
    return next(new AppError("Please provide all fields", 400));
  const { organizationNumber } = req.user;
  await sequelize.query(
    "INSERT INTO currency_" + organizationNumber + "(name,symbol) values(?,?)",
    {
      type: QueryTypes.INSERT,
      replacements: [name, symbol],
    }
  );
  res.status(200).json({
    status: 200,
    message: "Created Currency sucessfully",
  });
};

exports.getCurrency = async (req, res, next) => {
  const { organizationNumber } = req.user;
  const currency = await sequelize.query(
    "SELECT * FROM currency_" + organizationNumber,
    {
      type: QueryTypes.SELECT,
    }
  );
  res.status(200).json({
    status: 200,
    currency,
  });
};

exports.getIndividualCurrency = async (req, res, next) => {
  const { id } = req.params;
  const { organizationNumber } = req.user;
  const currency = await sequelize.query(
    "SELECT * FROM currency_" + organizationNumber + " WHERE id=?",
    {
      type: QueryTypes.SELECT,
      replacements: [id],
    }
  );
  res.status(200).json({
    status: 200,
    currency,
  });
};

exports.updateCurrency = async (req, res, next) => {
  const { id } = req.params;
  const { name, symbol } = req.body;
  if (!name || !symbol)
    return next(new AppError("Please provide all fields", 400));
  const { organizationNumber } = req.user;
  await sequelize.query(
    "UPDATE currency_" + organizationNumber + " SET name=?,symbol=? WHERE id=?",
    {
      type: QueryTypes.UPDATE,
      replacements: [name, symbol, id],
    }
  );
  res.status(200).json({
    status: 200,
    message: "Updated Currency sucessfully",
  });
};

exports.deleteCurrency = async (req, res, next) => {
  const { id } = req.params;
  const { organizationNumber } = req.user;
  await sequelize.query(
    "DELETE FROM currency_" + organizationNumber + " WHERE id=?",
    {
      type: QueryTypes.DELETE,
      replacements: [id],
    }
  );
  res.status(200).json({
    status: 200,
    message: "Deleted Currency sucessfully",
  });
};
