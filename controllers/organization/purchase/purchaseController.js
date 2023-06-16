const db = require("../../../model/index");
const sequelize = db.sequelize;
const User = db.users;
const AppError = require("../../../utils/appError");

const { QueryTypes, DATE } = require("sequelize");

exports.createPurchase = async (req, res, next) => {
  const { organizationNumber } = req.user;
  const generateRandomPurchaseId = Math.floor(100000 + Math.random() * 900000);
  const purchaseId = "PUR_" + generateRandomPurchaseId;
  const { partyAccount, purchaseAccount, totalBillValue, afterTax, tax } =
    req.body;
  const invoiceNo = req.body.invoiceNo || null;
  const referenceNo = req.body.referenceNo || null;
  const discount = req.body.discount || 0;
  const adjustment = req.body.adjustment || 0;
  const fiscalYear = req.body.fiscalYear || null;
  const afterAdjustment = req.body.afterAdjustment || 0;
  const afterDiscount = req.body.afterDiscount || 0;
  const date = req.body.date || null;
  const itemsTotalValue = req.body.itemsTotalValue || 0;
  const paymentDue = req.body.paymentDue || 0;
  const discountId = req.body.discountId || 0;

  const array = req.body.items;

  if (
    !partyAccount ||
    !purchaseAccount ||
    !totalBillValue ||
    !itemsTotalValue ||
    !tax ||
    !discountId ||
    !array
  )
    return next(new AppError("Please provide all fields", 400));
  await sequelize.query(
    "INSERT INTO purchase_" +
      organizationNumber +
      "(purchaseId,invoiceNo,referenceNo,adjustment,discount,partyAccount,purchaseAccount,totalBillValue,paymentDue,afterTax,afterDiscount,afterAdjustment,tax,fiscalYear,date) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
    {
      type: QueryTypes.INSERT,
      replacements: [
        purchaseId,
        invoiceNo,
        referenceNo,
        adjustment,
        discount,
        partyAccount,
        purchaseAccount,
        totalBillValue,
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
      `(${"'"}${purchaseId}${"'"}, ${item.productId}, ${"'"}${
        item.productName
      }${"'"}, ${item.productUnitPrice}, ${item.productTotalValue},${
        item.quantity
      })`
  );
  const finalData = await sequelize.query(
    "INSERT INTO purchaseDetail_" +
      organizationNumber +
      "(purchaseId,productId, productName,productUnitPrice,productTotalValue,quantity) VALUES " +
      data,
    {
      type: QueryTypes.INSERT,
    }
  );
  req.totalBillValue = totalBillValue;
  req.tax = tax;
  req.discount = discount;
  req.partyAccount = partyAccount;
  req.purchaseAccount = purchaseAccount;
  req.adjustment = adjustment;
  req.paymentDue = paymentDue;
  req.itemsTotalValue = itemsTotalValue;
  req.purchaseId = purchaseId;
  req.discountId = discountId;
  next();
};
exports.getPurchases = async (req, res) => {
  const { organizationNumber } = req.user;
  const purchases = await sequelize.query(
    "SELECT * FROM purchase_" +
      organizationNumber +
      " JOIN ledgerAccount_" +
      organizationNumber +
      " ON ledgerAccount_" +
      organizationNumber +
      ".ledgerId=purchase_" +
      organizationNumber +
      ".partyAccount GROUP BY purchase_" +
      organizationNumber +
      ".purchaseId ",
    {
      type: QueryTypes.SELECT,
    }
  );
  res.status(200).json({
    status: 200,
    message: "Purchases fetched",
    data: purchases,
  });
};

exports.getPurchase = async (req, res, next) => {
  const { organizationNumber } = req.user;
  const { purchaseId } = req.params;
  console.log(organizationNumber);
  const purchase = await sequelize.query(
    "SELECT * FROM purchase_" +
      organizationNumber +
      " JOIN purchaseDetail_" +
      organizationNumber +
      "  ON purchase_" +
      organizationNumber +
      ".purchaseId=purchaseDetail_" +
      organizationNumber +
      ".purchaseId JOIN ledgerAccount_" +
      organizationNumber +
      "  ON ledgerAccount_" +
      organizationNumber +
      ".ledgerId=purchase_" +
      organizationNumber +
      ".partyAccount WHERE purchase_" +
      organizationNumber +
      ".purchaseId=" +
      JSON.stringify(purchaseId),
    {
      type: QueryTypes.SELECT,
    }
  );
  if (!purchase)
    return next(new AppError("Purchase not found with that id", 404));
  const items = [];

  purchase.forEach((row) => {
    items.push({
      productName: row.productName,
      quantity: row.quantity,
      productUnitPrice: row.productUnitPrice,
      productTotalValue: row.productTotalValue,
    });
  });

  res.status(200).json({
    status: 200,
    message: "Purchase fetched",
    data: purchase,
    items,
  });
};

exports.updatePurchase = async (req, res, next) => {
  const { organizationNumber } = req.user;
  const { purchaseId } = req.params;
  const { partyAccount, purchaseAccount, totalBillValue, afterTax, tax } =
    req.body;
  const invoiceNo = req.body.invoiceNo || null;
  const referenceNo = req.body.referenceNo || null;
  const discount = req.body.discount || 0;
  const adjustment = req.body.adjustment || 0;
  const fiscalYear = req.body.fiscalYear || null;
  const afterAdjustment = req.body.afterAdjustment || 0;
  const afterDiscount = req.body.afterDiscount || 0;
  const date = req.body.date || null;
  const itemsTotalValue = req.body.itemsTotalValue || 0;
  const paymentDue = req.body.paymentDue || 0;

  const array = req.body.items;

  const purchase = await sequelize.query(
    "UPDATE purchase_" +
      organizationNumber +
      " SET invoiceNo=?,referenceNo=?,adjustment=?,discount=?,partyAccount=?,purchaseAccount=?,totalBillValue=?,paymentDue=?,afterTax=?,afterDiscount=?,afterAdjustment=?,tax=?,fiscalYear=?,date=? WHERE purchaseId=?",
    {
      type: QueryTypes.UPDATE,
      replacements: [
        invoiceNo,
        referenceNo,
        adjustment,
        discount,
        partyAccount,
        purchaseAccount,
        totalBillValue,
        paymentDue,
        afterTax,
        afterDiscount,
        afterAdjustment,
        tax,
        fiscalYear,
        date,
        purchaseId,
      ],
    }
  );
  res.status(200).json({
    status: 200,
    message: "Purchase updated",
  });
};

exports.deletePurchase = async (req, res, next) => {
  const { organizationNumber } = req.user;
  const { purchaseId } = req.params;
  await sequelize.query(
    "DELETE FROM purchase_" + organizationNumber + " WHERE purchaseId=?",
    {
      type: QueryTypes.DELETE,
      replacements: [purchaseId],
    }
  );
  await sequelize.query(
    "DELETE FROM purchaseDetail_" + organizationNumber + " WHERE purchaseId=?",
    {
      type: QueryTypes.DELETE,
      replacements: [purchaseId],
    }
  );
  res.status(200).json({
    status: 200,
    message: "Purchase deleted",
  });
};
