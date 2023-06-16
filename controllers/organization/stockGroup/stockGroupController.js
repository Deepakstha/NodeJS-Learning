const db = require("../../../model/index");
const sequelize = db.sequelize;

const AppError = require("../../../utils/appError");

const { QueryTypes, DataTypes } = require("sequelize");

exports.createStockGroup = async (req, res, next) => {
  const { name } = req.body;

  const parentId = req.body.parentId || null;
  const { organizationNumber } = req.user;
  if (!organizationNumber)
    return next(
      new AppError("first create organization to perform this request")
    );
  if (!name) return next(new AppError("Please provide name and parentId", 400));

  const insertedData = await sequelize.query(
    "INSERT INTO stockGroup_" +
      organizationNumber +
      "(name,parentId) VALUES(?,?)",
    {
      type: QueryTypes.INSERT,
      replacements: [name, parentId],
    }
  );

  res.status(200).json({
    status: 200,
    message: "stock Group created successfully",
    insertedData,
  });
};

exports.getStockGroup = async (req, res) => {
  const { organizationNumber } = req.user;
  if (!organizationNumber)
    return next(
      new AppError("first create organization to perform this request")
    );
  const stockGroupWithParent = await sequelize.query(
    "SELECT stockGroup.id,stockGroup.name,stockGroup.parentId,parentgroup.name as parent FROM stockGroup_" +
      organizationNumber +
      " stockGroup LEFT JOIN stockGroup_" +
      organizationNumber +
      " parentgroup ON stockGroup.parentId=parentgroup.id ORDER BY stockGroup.id",
    {
      type: QueryTypes.SELECT,
    }
  );
  // const stockGroupWithParent = await sequelize.query(
  //   "SELECT * FROM stockGroup_" + organizationNumber,
  //   {
  //     type: QueryTypes.SELECT,
  //   }
  // );
  const showTables = await sequelize.query("SHOW TABLES", {
    type: QueryTypes.SELECT,
  });

  res.status(200).json({
    status: 200,
    stockGroupWithParent,
    showTables,
  });
};

exports.updateStockGroup = async (req, res) => {
  const { organizationNumber } = req.user;
  const id = req.params.id;

  if (!organizationNumber)
    return next(
      new AppError("first create organization to perform this request")
    );
  const stockGroup = await sequelize.query(
    "SELECT * FROM stockGroup_" + organizationNumber + " WHERE id=" + id,
    {
      type: QueryTypes.SELECT,
    }
  );
  const name = req.body.name || stockGroup[0].name;
  const parentId = req.body.parentId || stockGroup[0].parentId;
  await sequelize.query(
    "UPDATE stockGroup_" +
      organizationNumber +
      " SET name=" +
      JSON.stringify(name) +
      ",parentId=" +
      JSON.stringify(parentId) +
      " WHERE id=" +
      id,
    {
      type: QueryTypes.UPDATE,
    }
  );
  res.status(200).json({
    status: 200,
    message: "updated the stockGroup sucessfully",
  });
};

exports.deleteStockGroup = async (req, res, next) => {
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
    "DELETE FROM stockGroup_" + organizationNumber + " WHERE id=" + id,
    {
      type: QueryTypes.DELETE,
    }
  );
  res.status(200).json({
    status: "success",
    message: "deleted stockgroup sucessfully",
  });
};
