const db = require("../../../model/index");
const sequelize = db.sequelize;

const AppError = require("../../../utils/appError");

const { QueryTypes, DataTypes } = require("sequelize");

exports.createFiscalYear = async (req, res, next) => {
  const { organizationNumber } = req.user;
  const { name, startDate, endDate } = req.body;
  const status = req.body.status || 0;
  if (!name || !startDate || !endDate)
    return next(new AppError("Please enter all fields", 400));
  await sequelize.query(
    "INSERT INTO fiscalYear_" +
      organizationNumber +
      "(name,startDate,endDate,status) values(?,?,?,?)",
    {
      type: QueryTypes.INSERT,
      replacements: [name, startDate, endDate, status],
    }
  );
  const fiscalYear = await sequelize.query(
    "SELECT id FROM fiscalYear_" +
      organizationNumber +
      " WHERE name=" +
      JSON.stringify(name),
    {
      type: QueryTypes.SELECT,
    }
  );
  //update organization table fiscalYearId
  await sequelize.query(
    "UPDATE organization_" +
      organizationNumber +
      " SET fiscalId=? WHERE organizationNumber=?",
    {
      type: QueryTypes.UPDATE,
      replacements: [fiscalYear[0].id, organizationNumber],
    }
  );

  res.status(200).json({
    status: 200,
    fiscalYear,
    message: "Fiscal year created",
  });
};

exports.getFiscalYear = async (req, res, next) => {
  const { organizationNumber } = req.user;
  const fiscalYear = await sequelize.query(
    "SELECT * FROM fiscalYear_" + organizationNumber,
    {
      type: QueryTypes.SELECT,
    }
  );
  res.status(200).json({
    status: 200,
    fiscalYear,
  });
};

exports.updateFiscalYear = async (req, res, next) => {
  const { organizationNumber } = req.user;
  const { id } = req.params;
  // const { status, name, startDate, endDate } = req.body;

  const fiscalYear = await sequelize.query(
    "SELECT * FROM fiscalYear_" + organizationNumber + " WHERE id=" + id,
    {
      type: QueryTypes.SELECT,
    }
  );
  const status = req.body.status || fiscalYear[0].status;
  const name = req.body.name || fiscalYear[0].name;
  const startDate = req.body.startDate || fiscalYear[0].startDate;
  const endDate = req.body.endDate || fiscalYear[0].endDate;
  await sequelize.query(
    "UPDATE fiscalYear_" +
      organizationNumber +
      " SET name=?,startDate=?,endDate=?,status=? WHERE id=?",
    {
      type: QueryTypes.UPDATE,
      replacements: [name, startDate, endDate, status, id],
    }
  );
  res.status(200).json({
    status: 200,
    message: "Fiscal year updated",
  });
};

exports.deleteFiscalYear = async (req, res, next) => {
  const { organizationNumber } = req.user;
  const { id } = req.params;
  await sequelize.query(
    "DELETE FROM fiscalYear_" + organizationNumber + " WHERE id=" + id,
    {
      type: QueryTypes.DELETE,
    }
  );
  res.status(200).json({
    status: 200,
    message: "Fiscal year deleted",
  });
};
