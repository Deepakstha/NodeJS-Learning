const db = require("../../../model/index");
const sequelize = db.sequelize;
const User = db.users;
const AppError = require("../../../utils/appError");

const { QueryTypes, DataTypes } = require("sequelize");

exports.createTax = async (req, res, next) => {
  const { name, rate } = req.body;
  if (!name || !rate)
    return next(new AppError("Please provide all fields", 400));
  const { organizationNumber } = req.user;
  await sequelize.query(
    "INSERT INTO tax_" + organizationNumber + "(name,rate) values(?,?)",
    {
      type: QueryTypes.INSERT,
      replacements: [name, rate],
    }
  );
  res.status(200).json({
    status: 200,
    message: "Created Tax sucessfully",
  });
};

exports.getTax = async (req, res, next) => {
  const { organizationNumber } = req.user;
  const tax = await sequelize.query("SELECT * FROM tax_" + organizationNumber, {
    type: QueryTypes.SELECT,
  });
  res.status(200).json({
    status: 200,
    tax,
  });
};

exports.updateTax = async (req, res, next) => {
  const { id } = req.params;
  const { name, rate } = req.body;
  if (!name || !rate)
    return next(new AppError("Please provide all fields", 400));
  const { organizationNumber } = req.user;
  await sequelize.query(
    "UPDATE tax_" + organizationNumber + " SET name=?,rate=? WHERE id=?",
    {
      type: QueryTypes.UPDATE,
      replacements: [name, rate, id],
    }
  );
  res.status(200).json({
    status: 200,
    message: "Updated Tax sucessfully",
  });
};

exports.deleteTax = async (req, res, next) => {
  const { id } = req.params;
  const { organizationNumber } = req.user;
  await sequelize.query(
    "DELETE FROM tax_" + organizationNumber + " WHERE id=?",
    {
      type: QueryTypes.DELETE,
      replacements: [id],
    }
  );
  res.status(200).json({
    status: 200,
    message: "Deleted Tax sucessfully",
  });
};
