const db = require("../../../model/index");
const sequelize = db.sequelize;
const User = db.users;
const AppError = require("../../../utils/appError");

const { QueryTypes } = require("sequelize");

exports.createStockItem = async (req, res, next) => {
  const { organizationNumber } = req.user;
  const { name, quantity, rate, per, value } = req.body;
  const unit = req.body.unit || null;
  const under = req.body.under || null;
  if (!name || !quantity || !rate || !value)
    return next(new AppError("Please provide all fields", 400));
  await sequelize.query(
    "INSERT INTO stockItem_" +
      organizationNumber +
      "(itemName,under,unit,quantity,rate,per,value) values(?,?,?,?,?,?,?)",
    {
      type: QueryTypes.INSERT,
      replacements: [name, under, unit, quantity, rate, per, value],
    }
  );
  res.status(200).json({
    status: 200,
    message: "created stockItem sucessfully",
  });
};

exports.getStockItem = async (req, res) => {
  const { organizationNumber } = req.user;
  if (!organizationNumber)
    return next(new AppError("first create organization", 400));
  const stockItemsWithParent = await sequelize.query(
    "SELECT stockItemId,itemName,name,quantity,rate,per,value,parentId,unit,type,symbol FROM stockItem_" +
      organizationNumber +
      " LEFT JOIN stockGroup_" +
      organizationNumber +
      " ON stockItem_" +
      organizationNumber +
      ".under=stockGroup_" +
      organizationNumber +
      ".id LEFT JOIN units_" +
      organizationNumber +
      " ON stockItem_" +
      organizationNumber +
      ".unit=units_" +
      organizationNumber +
      ".id",

    {
      type: QueryTypes.SELECT,
    }
  );
  res.status(200).json({
    status: 200,
    stockItemsWithParent,
  });
};

exports.updateStockItem = async (req, res) => {
  const { organizationNumber } = req.user;
  // const { name, under, unit, quantity, rate, per, value } = req.body;
  const id = req.params.id;
  const stockItems = await sequelize.query(
    "SELECT * FROM stockItem_" +
      organizationNumber +
      " WHERE stockItemId=" +
      id,
    {
      type: QueryTypes.SELECT,
    }
  );
  const name = req.body.name || stockItems[0].name;
  const under = req.body.under || stockItems[0].under;
  const unit = req.body.unit || stockItems[0].unit;
  const quantity = req.body.quantity || stockItems[0].quantity;
  const rate = req.body.rate || stockItems[0].rate;
  const per = req.body.per || stockItems[0].per;
  const value = req.body.value || stockItems[0].value;
  await sequelize.query(
    "UPDATE stockItem_" +
      organizationNumber +
      " SET itemName=" +
      JSON.stringify(name) +
      " ,under=" +
      JSON.stringify(under) +
      ",unit=" +
      JSON.stringify(unit) +
      ",quantity=" +
      JSON.stringify(quantity) +
      ",rate=" +
      JSON.stringify(rate) +
      " ,per=" +
      JSON.stringify(per) +
      ",value=" +
      JSON.stringify(value) +
      " WHERE stockItemId=" +
      id,
    {
      type: QueryTypes.UPDATE,
    }
  );
  res.status(200).json({
    status: 200,
    message: "Updated stockItem sucesfully",
  });
};

exports.deleteStockItem = async (req, res, next) => {
  const id = req.params.id;
  const { organizationNumber } = req.user;
  await sequelize.query(
    "DELETE FROM stockItem_" + organizationNumber + " WHERE stockItemId=" + id,
    {
      type: QueryTypes.DELETE,
    }
  );
  res.status(200).json({
    status: 200,
    message: "Delete stockItem sucessfully",
  });
};
