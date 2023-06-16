const db = require("../../../model/index");
const sequelize = db.sequelize;
const User = db.users;
const AppError = require("../../../utils/appError");

const { QueryTypes, DataTypes } = require("sequelize");

exports.createUnit = async (req, res, next) => {
  const { type, symbol } = req.body;
  const formalName = req.body.formalName || null;
  const noOfDecimal = req.body.noOfDecimal || null;
  const firstUnit = req.body.firstName || null;
  const conversion = req.body.conversion || null;
  const secondUnit = req.body.secondUnit || null;
  if (!type || !symbol)
    return next(new AppError("Please provide type and symbol in fields"));
  const { organizationNumber } = req.user;
  await sequelize.query(
    "INSERT INTO units_" +
      organizationNumber +
      "(type,symbol,formalName,noOfDecimal,firstUnit,conversion,secondUnit) values(?,?,?,?,?,?,?)",
    {
      type: QueryTypes.INSERT,
      replacements: [
        type,
        symbol,
        formalName,
        noOfDecimal,
        firstUnit,
        conversion,
        secondUnit,
      ],
    }
  );
  res.status(200).json({
    status: 200,
    message: "Created Unit sucessfully",
  });
};

exports.getUnits = async (req, res, next) => {
  const { organizationNumber } = req.user;
  const units = await sequelize.query(
    "SELECT * FROM units_" + organizationNumber,
    {
      type: QueryTypes.SELECT,
    }
  );
  res.status(200).json({
    status: 200,
    units,
  });
};

exports.deleteUnits = async (req, res, next) => {
  const { organizationNumber } = req.user;
  const { id } = req.params;
  if (!organizationNumber)
    return next(
      new AppError(
        "First create organization and units in order to delete units",
        400
      )
    );

  await sequelize.query(
    "DELETE FROM units_" + organizationNumber + " WHERE id=" + id,
    {
      type: QueryTypes.DELETE,
    }
  );
  res.status(200).json({
    status: "success",
    message: "deleted unit sucessfully",
  });
};

exports.updateUnits = async (req, res) => {
  const { organizationNumber } = req.user;
  const id = req.params.id;
  const units = await sequelize.query(
    "SELECT * FROM units_" + organizationNumber + " WHERE id=" + id,
    {
      type: QueryTypes.SELECT,
    }
  );

  const type = req.body.type || units[0].type;
  const symbol = req.body.symbol || units[0].symbol;
  const formalName = req.body.formalName || units[0].formalName;
  const noOfDecimal = req.body.noOfDecimal || units[0].noOfDecimal;
  const firstUnit = req.body.firstUnit || units[0].firstUnit;
  const conversion = req.body.conversion || units[0].conversion;
  const secondUnit = req.body.secondUnit || units[0].firstUnit;

  await sequelize.query(
    "UPDATE units_" +
      organizationNumber +
      " SET type=" +
      JSON.stringify(type) +
      " ,symbol=" +
      JSON.stringify(symbol) +
      " ,formalName=" +
      JSON.stringify(formalName) +
      " ,noOfDecimal=" +
      JSON.stringify(noOfDecimal) +
      " ,firstUnit=" +
      JSON.stringify(firstUnit) +
      " ,conversion=" +
      JSON.stringify(conversion) +
      " ,secondUnit=" +
      JSON.stringify(secondUnit) +
      " WHERE id=" +
      id,
    { type: QueryTypes.UPDATE }
  );
  res.status(200).json({
    status: 200,
    message: "Updated units sucesfully",
  });
};
