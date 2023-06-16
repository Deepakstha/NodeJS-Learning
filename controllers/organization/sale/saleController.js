const db = require("../../../model/index");
const sequelize = db.sequelize;
const User = db.users;
const AppError = require("../../../utils/appError");

const { QueryTypes, DATE } = require("sequelize");

exports.createSale = async (req, res, next) => {
  const { organizationNumber } = req.user;
  const generateRandomSaleId = Math.floor(100000 + Math.random() * 900000);
  const saleId = "SALE_" + generateRandomSaleId;
  const { partyAccount, salesAccount, totalBillValue, afterTax, tax } =
    req.body;
  const invoiceNo = req.body.invoiceNo || null;
  const referenceNo = req.body.referenceNo || null;
  const discount = req.body.discount || null;
  const adjustment = req.body.adjustment || null;
  const fiscalYear = req.body.fiscalYear || null;
  const afterAdjustment = req.body.afterAdjustment || null;
  const afterDiscount = req.body.afterDiscount || null;
  const date = req.body.date || null;
  const itemsTotalValue = req.body.itemsTotalValue || null;

  const array = req.body.items;

  if (
    !partyAccount ||
    !salesAccount ||
    !totalBillValue ||
    !afterTax ||
    !tax ||
    !array
  )
    return next(new AppError("Please provide all fields", 400));
  await sequelize.query(
    "INSERT INTO sale_" +
      organizationNumber +
      "(saleId,invoiceNo,referenceNo,adjustment,discount,partyAccount,salesAccount,totalBillValue,afterTax,afterDiscount,afterAdjustment,tax,fiscalYear,date) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
    {
      type: QueryTypes.INSERT,
      replacements: [
        saleId,
        invoiceNo,
        referenceNo,
        adjustment,
        discount,
        partyAccount,
        salesAccount,
        totalBillValue,
        afterTax,
        afterDiscount,
        afterAdjustment,
        tax,
        fiscalYear,
        date,
      ],
    }
  );
  let data = array.map(
    (item) =>
      `(${"'"}${saleId}${"'"}, ${item.productId}, ${"'"}${
        item.productName
      }${"'"}, ${item.productUnitPrice}, ${item.productTotalValue},${
        item.quantity
      })`
  );

  const finalData = await sequelize.query(
    "INSERT INTO saleDetail_" +
      organizationNumber +
      "(saleId,productId, productName,productUnitPrice,productTotalValue,quantity) VALUES " +
      data,
    {
      type: QueryTypes.INSERT,
    }
  );
  req.totalBillValue = totalBillValue;
  req.tax = tax;
  req.discount = discount;
  req.partyAccount = partyAccount;
  req.salesAccount = salesAccount;
  req.adjustment = adjustment;
  req.itemsTotalValue = itemsTotalValue;
  req.saleId = saleId;
  next();
};

exports.getSales = async (req, res) => {
  const { organizationNumber } = req.user;
  const sales = await sequelize.query(
    "SELECT * FROM sale_" +
      organizationNumber +
      " JOIN ledgerAccount_" +
      organizationNumber +
      " ON ledgerAccount_" +
      organizationNumber +
      ".ledgerId=sale_" +
      organizationNumber +
      ".partyAccount GROUP BY sale_" +
      organizationNumber +
      ".saleId ",
    {
      type: QueryTypes.SELECT,
    }
  );
  res.status(200).json({
    status: 200,
    message: "Purchases fetched",
    data: sales,
  });
};

exports.getSale = async (req, res, next) => {
  const { organizationNumber } = req.user;
  const { saleId } = req.params;
  const sale = await sequelize.query(
    "SELECT * FROM sale_" +
      organizationNumber +
      " JOIN saleDetail_" +
      organizationNumber +
      "  ON sale_" +
      organizationNumber +
      ".saleId=saleDetail_" +
      organizationNumber +
      ".saleId JOIN ledgerAccount_" +
      organizationNumber +
      "  ON ledgerAccount_" +
      organizationNumber +
      ".ledgerId=sale_" +
      organizationNumber +
      ".partyAccount WHERE sale_" +
      organizationNumber +
      ".saleId=" +
      JSON.stringify(saleId),
    {
      type: QueryTypes.SELECT,
    }
  );
  if (!sale) return next(new AppError("sale not found with that id", 404));
  const items = [];

  sale.forEach((row) => {
    items.push({
      productName: row.productName,
      quantity: row.quantity,
      productUnitPrice: row.productUnitPrice,
      productTotalValue: row.productTotalValue,
    });
  });

  res.status(200).json({
    status: 200,
    message: "sale fetched",
    data: sale,
    items,
  });
};

exports.updateSale = async (req, res, next) => {
  const { organizationNumber } = req.user;
  const { saleId } = req.params;
  const { partyAccount, salesAccount, totalBillValue, afterTax, tax } =
    req.body;
  const invoiceNo = req.body.invoiceNo || null;
  const referenceNo = req.body.referenceNo || null;
  const discount = req.body.discount || null;
  const adjustment = req.body.adjustment || null;
  const fiscalYear = req.body.fiscalYear || null;
  const afterAdjustment = req.body.afterAdjustment || null;
  const afterDiscount = req.body.afterDiscount || null;
  const date = req.body.date || null;
  const itemsTotalValue = req.body.itemsTotalValue || null;

  const array = req.body.items;

  const sale = await sequelize.query(
    "UPDATE sale_" +
      organizationNumber +
      " SET invoiceNo=?,referenceNo=?,adjustment=?,discount=?,partyAccount=?,salesAccount=?,totalBillValue=?,afterTax=?,afterDiscount=?,afterAdjustment=?,tax=?,fiscalYear=?,date=? WHERE saleId=?",
    {
      type: QueryTypes.UPDATE,
      replacements: [
        invoiceNo,
        referenceNo,
        adjustment,
        discount,
        partyAccount,
        salesAccount,
        totalBillValue,
        afterTax,
        afterDiscount,
        afterAdjustment,
        tax,
        fiscalYear,
        date,
        saleId,
      ],
    }
  );
  res.status(200).json({
    status: 200,
    message: "Sale updated",
  });
};

exports.deleteSale = async (req, res, next) => {
  const { organizationNumber } = req.user;
  const { saleId } = req.params;
  await sequelize.query(
    "DELETE FROM sale_" + organizationNumber + " WHERE saleId=?",
    {
      type: QueryTypes.DELETE,
      replacements: [saleId],
    }
  );
  await sequelize.query(
    "DELETE FROM saleDetail_" + organizationNumber + " WHERE saleId=?",
    {
      type: QueryTypes.DELETE,
      replacements: [saleId],
    }
  );
  res.status(200).json({
    status: 200,
    message: "sale deleted",
  });
};
