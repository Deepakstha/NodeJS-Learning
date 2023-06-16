const db = require("../../model/index");
const sequelize = db.sequelize;
const User = db.users;
const AppError = require("../../utils/appError");

const { QueryTypes, DataTypes } = require("sequelize");

exports.createOrganizationTable = async (req, res, next) => {
  const { name, address, phoneNumber } = req.body;
  const { id, username } = req.user;
  const user = await User.findByPk(id);
  const OrganizationNumber = Math.floor(100000 + Math.random() * 900000);
  const panNumber = req.body.panNumber || null;
  const vatNumber = req.body.vatNumber || null;
  const fiscalYearId = req.body.fiscalYear || 0; // 0 is for default fiscal year

  // // console.log(user);
  // if (!panNumber) panNumber = null;
  // if (!vatNumber) vatNumber = null;

  if (!name || !address || !phoneNumber)
    return next(new AppError("Please add name,address,phoneNumber", 400));

  // req.user.organization = Organization

  await sequelize.query(
    "CREATE TABLE organization_" +
      OrganizationNumber +
      "(id INT NOT NUll AUTO_INCREMENT PRIMARY KEY,name VARCHAR(255), address VARCHAR(255),phoneNumebr INT,panNumber INT NULL,vatNumber INT NULL,ownerName VARCHAR(255),userId INT REFERENCES users(id)  ON DELETE CASCADE ON UPDATE CASCADE,organizationNumber INT,fiscalId INT NULL) ",
    {
      type: QueryTypes.CREATE,
    }
  );
  await sequelize.query(
    "INSERT INTO organization_" +
      OrganizationNumber +
      " values(?,?,?,?,?,?,?,?,?,?)",
    {
      type: QueryTypes.INSERT,

      replacements: [
        1,
        name,
        address,
        phoneNumber,
        panNumber,
        vatNumber,
        username,
        id,
        OrganizationNumber,
        fiscalYearId,
      ],
    }
  );
  await sequelize.query(
    "CREATE TABLE IF NOT EXISTS user_org(userId INT REFERENCES users(id),organizationNumber INT)",
    {
      types: QueryTypes.CREATE,
    }
  );

  await sequelize.query(
    "INSERT INTO user_org(userId,organizationNumber) values(?,?)",
    {
      types: QueryTypes.INSERT,
      replacements: [id, OrganizationNumber],
    }
  );

  user.organizationNumber = OrganizationNumber;

  await user.save();

  req.user.organizationNumber = OrganizationNumber;
  next();
};
exports.createAccountGroupTable = async (req, res, next) => {
  const { organizationNumber } = req.user;

  await sequelize.query(
    "CREATE TABLE accountGroup_" +
      organizationNumber +
      "(id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,accountName VARCHAR(255),accountNature VARCHAR(255),affectTradingAccount BOOLEAN,parentId INT NULL REFERENCES accountGroup_" +
      organizationNumber +
      "(id) ON DELETE CASCADE ON UPDATE CASCADE,type VARCHAR(255))",
    { type: QueryTypes.CREATE }
  );
  await sequelize.query(
    "INSERT INTO accountGroup_" +
      organizationNumber +
      "(id,accountName,accountNature,affectTradingAccount,parentId,type) values(1,'Branch/Divisions','dr',0,NULL,'Liabilities'),(2,'Capital Account','cr',0,NULL,'Liabilities'),(3,'Current Assets','dr',0,NULL,'Assets'),(4,'Current Liabilities','cr',0,NULL,'Liabilities'),(5,'Direct Expenses','dr',1,NULL,'Expenses'),(6,'Direct Incomes','cr',1,NULL,'Income'),(7,'Fixed Assets','dr',0,NULL,'Assets'),(8,'Indirect Expenses','dr',1,NULL,'Expenses'),(9,'Indirect Incomes','cr',1,NULL,'Income'),(10,'Investments','cr',1,NULL,'Assets'),(11,'Loans(liability)','dr',1,NULL,'Liabilities'),(12,'Misc.Expenses(ASSET)','dr',1,NULL,'Asset'),(13,'Purchase Accounts','dr',1,NULL,'Expenses'),(14,'Sales Accounts','cr',1,NULL,'Income'),(15,'Suspense Accounts','dr',1,NULL,'Liabilities'),(16,'Bank Accounts','dr',0,3,'Asset'),(17,'Bank OD Account','cr',0,11,'Liabilities'),(18,'Cash In Hand','dr',0,3,'Asset'),(19,'Deposits(Asset)','dr',0,3,'Asset'),(20,'Duties & Taxes','cr',0,4,'Liabilities'),(21,'Loans & Advances(Asset)','dr',0,3,'Asset'),(22,'Provisions','cr',0,4,'Liabilities'),(23,'Reserves & Surplus','cr',0,2,'Liabilities'),(24,'Secured Loans','cr',0,11,'Liabilities'),(25,'Stock In Hand','cr',0,3,'Asset'),(26,'Sundry Creditors','cr',0,4,'Liabilities'),(27,'Sundry Debtors','dr',0,3,'Asset'),(28,'Unsecured Loans','cr',0,11,'Liabilities'),(29,'Cash','dr',0,18,'Asset'),(30,'Profit & Loss Acc','cr',0,NULL,'Liabilities')",
    { type: QueryTypes.INSERT }
  );

  next();
};

exports.createLedgerAccountTable = async (req, res, next) => {
  const { organizationNumber } = req.user;

  await sequelize.query(
    "CREATE TABLE ledgerAccount_" +
      organizationNumber +
      "(ledgerId INT NOT NULL AUTO_INCREMENT PRIMARY KEY,ledgerName VARCHAR(255) UNIQUE,address VARCHAR(255) NULL,email VARCHAR(255),contactNo INT,pinNumber INT,userId INT REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,accountGroupId INT REFERENCES accountGroup_" +
      organizationNumber +
      "(id) ON DELETE CASCADE ON UPDATE CASCADE)",
    {
      type: QueryTypes.CREATE,
    }
  );
  await sequelize.query(
    "INSERT INTO ledgerAccount_" +
      organizationNumber +
      "(ledgerName,address,email,contactNo,pinNumber,userId,accountGroupId) values('Tax Payable',NULL,NULL,NULL,NULL,NULL,4),('Purchase Account',NULL,NULL,NULL,NULL,NULL,5),('Purchase Discount',NULL,NULL,NULL,NULL,NULL,5),('Sales Discount',NULL,NULL,NULL,NULL,NULL,6),('Other Expenses',NULL,NULL,NULL,NULL,NULL,5),('Sales Account',NULL,NULL,NULL,NULL,NULL,6),('Tax Receivable',NULL,NULL,NULL,NULL,NULL,4),('Petty Cash',NULL,NULL,NULL,NULL,NULL,29),('Bank Account',NULL,NULL,NULL,NULL,NULL,16),('Account Payable',NULL,NULL,NULL,NULL,NULL,4),('Account Receivable',NULL,NULL,NULL,NULL,NULL,3)",
    {
      type: QueryTypes.INSERT,
    }
  );

  next();
};

exports.createUnitTable = async (req, res, next) => {
  const { organizationNumber } = req.user;

  await sequelize.query(
    "CREATE TABLE units_" +
      organizationNumber +
      "(id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,type ENUM('simple','compound') NOT NULL,symbol VARCHAR(255) NOT NULL,formalName VARCHAR(255) NULL,noOfDecimal INT NULL ,firstUnit VARCHAR(255) NULL,conversion INT NULL,secondUnit VARCHAR(255) NULL )",
    {
      type: QueryTypes.CREATE,
    }
  );

  next();
};
exports.createStockGroupTable = async (req, res, next) => {
  const { organizationNumber } = req.user;
  await sequelize.query(
    "CREATE TABLE stockGroup_" +
      organizationNumber +
      "(id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,name VARCHAR(255),parentId INT  NULL   REFERENCES stockGroup_" +
      organizationNumber +
      "(id) ON DELETE CASCADE ON UPDATE CASCADE)",
    {
      type: QueryTypes.CREATE,
    }
  );
  next();
};

exports.createStockItemTable = async (req, res, next) => {
  const { organizationNumber } = req.user;
  console.log("stockItem", organizationNumber);
  await sequelize.query(
    "CREATE TABLE stockItem_" +
      organizationNumber +
      "(stockItemId INT NOT NULL AUTO_INCREMENT PRIMARY KEY,itemName VARCHAR(255),under INT NULL REFERENCES stockGroup_" +
      organizationNumber +
      "(id) ON DELETE CASCADE ON UPDATE CASCADE,unit INT REFERENCES units_" +
      organizationNumber +
      "(id) ON DELETE CASCADE ON UPDATE CASCADE,quantity REAL,rate REAL,per VARCHAR(255),value REAL)",
    {
      type: QueryTypes.CREATE,
    }
  );
  next();
};

exports.getOrganization = async (req, res) => {
  const { organizationNumber, id } = req.user;
  console.log("id", id);
  const organizations = await sequelize.query(
    "SELECT organizationNumber FROM user_org WHERE userId=" + id,
    {
      type: QueryTypes.SELECT,
    }
  );

  const allOrganizationNumberOfUser = organizations.map((organization) => {
    return organization.organizationNumber;
  });
  let organization;
  let organizationArr = [];

  for (var i = 0; i < allOrganizationNumberOfUser.length; i++) {
    organization = await sequelize.query(
      "SELECT * FROM organization_" + allOrganizationNumberOfUser[i],
      {
        type: QueryTypes.SELECT,
      }
    );
    organizationArr.push(organization);
  }

  res.status(200).json({
    status: 200,
    organizationArr,
  });
};

exports.changeOrganization = async (req, res, next) => {
  const id = req.user.id;
  const { organizationNumber } = req.body;
  if (!organizationNumber)
    return next(new AppError("Organization number should be provided", 400));
  const user = await User.findByPk(id);
  user.organizationNumber = organizationNumber;

  await user.save();
  res.status(200).json({
    status: 200,
    message: "Changed Organization Sucessfully",
    user,
  });
};

exports.getMyCurrentOrganization = async (req, res) => {
  const { organizationNumber } = req.user;
  const organization = await sequelize.query(
    "SELECT * FROM organization_" + organizationNumber,
    {
      type: QueryTypes.SELECT,
    }
  );
  res.status(200).json({
    status: 200,
    organization,
  });
};


exports.createFiscalYearTable = async (req, res, next) => {
  const { organizationNumber } = req.user;

  await sequelize.query(
    "CREATE TABLE fiscalYear_" +
      organizationNumber +
      "(id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,name VARCHAR(255) NULL,startDate DATE NULL,endDate DATE NULL,status BOOLEAN NULL)",
    {
      type: QueryTypes.CREATE,
    }
  );
  next();
};

exports.createJournalTable = async (req, res, next) => {
  const { organizationNumber } = req.user;
  console.log(organizationNumber);
  await sequelize.query(
    "CREATE TABLE journal_" +
      organizationNumber +
      "(id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,ledgerId INT REFERENCES ledgerAccount_" +
      organizationNumber +
      "(ledgerId) ON DELETE CASCADE ON UPDATE CASCADE,debit REAL,credit REAL,reference VARCHAR(255),particulars VARCHAR(255),fiscalYear INT REFERENCES fiscalYear_" +
      organizationNumber +
      "(id) ON DELETE CASCADE ON UPDATE CASCADE)",
    {
      type: QueryTypes.CREATE,
    }
  );
  next();
};

exports.createPurchaseTable = async (req, res, next) => {
  const { organizationNumber } = req.user;
  await sequelize.query(
    "CREATE TABLE purchase_" +
      organizationNumber +
      "(id INT NULL,purchaseId VARCHAR(255) PRIMARY KEY,purchaseAccount INT REFERENCES ledgerAccount_" +
      organizationNumber +
      "(ledgerId) ON DELETE CASCADE ON UPDATE CASCADE,partyAccount INT REFERENCES ledgerAccount_" +
      organizationNumber +
      "(ledgerId) ON DELETE CASCADE ON UPDATE CASCADE,invoiceNo VARCHAR(255),referenceNo VARCHAR(255),totalBillValue REAL,paymentDue REAL,afterTax REAL,afterDiscount REAL,afterAdjustment REAL,tax REAL,discount REAL,adjustment REAL,date DATE,fiscalYear INT REFERENCES fiscalYear_" +
      organizationNumber +
      "(id) ON DELETE CASCADE ON UPDATE CASCADE )",

    {
      type: QueryTypes.CREATE,
    }
  );
  next();
};

exports.createPurchaseDetailsTable = async (req, res, next) => {
  const { organizationNumber } = req.user;
  await sequelize.query(
    "CREATE TABLE purchaseDetail_" +
      organizationNumber +
      "(id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,purchaseId VARCHAR(255) REFERENCES purchase_" +
      organizationNumber +
      "(purchaseId) ON DELETE CASCADE ON UPDATE CASCADE, productId INT REFERENCES stockItem_" +
      organizationNumber +
      "(stockItemId) ON DELETE CASCADE ON UPDATE CASCADE, productName VARCHAR(255),productUnitPrice REAL,quantity REAL,productTotalValue REAL ) ",
    {
      type: QueryTypes.CREATE,
    }
  );
  next();
};

exports.createSalesTable = async (req, res, next) => {
  const { organizationNumber } = req.user;
  await sequelize.query(
    "CREATE TABLE sale_" +
      organizationNumber +
      "(id INT NULL,saleId VARCHAR(255) PRIMARY KEY,salesAccount INT REFERENCES ledgerAccount_" +
      organizationNumber +
      "(ledgerId) ON DELETE CASCADE ON UPDATE CASCADE,partyAccount INT REFERENCES ledgerAccount_" +
      organizationNumber +
      "(ledgerId) ON DELETE CASCADE ON UPDATE CASCADE,invoiceNo VARCHAR(255),referenceNo VARCHAR(255),totalBillValue REAL, paymentDue REAL,afterTax REAL,afterDiscount REAL,afterAdjustment REAL,tax REAL,discount REAL,adjustment REAL,date DATE,fiscalYear INT REFERENCES fiscalYear_" +
      organizationNumber +
      "(id) ON DELETE CASCADE ON UPDATE CASCADE )",

    {
      type: QueryTypes.CREATE,
    }
  );
  next();
};

exports.createSalesDetailsTable = async (req, res, next) => {
  const { organizationNumber } = req.user;
  await sequelize.query(
    "CREATE TABLE saleDetail_" +
      organizationNumber +
      "(id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,saleId VARCHAR(255) REFERENCES sale_" +
      organizationNumber +
      "(saleId) ON DELETE CASCADE ON UPDATE CASCADE, productId INT REFERENCES stockItem_" +
      organizationNumber +
      "(stockItemId) ON DELETE CASCADE ON UPDATE CASCADE, productName VARCHAR(255),productUnitPrice REAL,quantity REAL,productTotalValue REAL ) ",
    {
      type: QueryTypes.CREATE,
    }
  );
  next();
};

exports.createTaxTable = async (req, res, next) => {
  const { organizationNumber } = req.user;
  await sequelize.query(
    "CREATE TABLE tax_" +
      organizationNumber +
      "(id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,name VARCHAR(255) UNIQUE,rate REAL)",
    {
      type: QueryTypes.CREATE,
    }
  );
  next();
};

exports.createManualJournalTable = async (req, res, next) => {
  const { organizationNumber } = req.user;

  await sequelize.query(
    "CREATE TABLE manualJournal_" +
      organizationNumber +
      "(id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,manualJournalId VARCHAR(255),journal INT,date DATE,reference VARCHAR(255),notes VARCHAR(255),subTotalDebit REAL, subTotalCredit REAL,taxDebit REAL,taxCredit REAL,totalDebit REAL,totalCredit REAL,total REAL,difference REAL)",
    {
      type: QueryTypes.CREATE,
    }
  );
  next();
};

exports.createPaymentMadeTable = async (req, res, next) => {
  const { organizationNumber } = req.user;

  await sequelize.query(
    "CREATE TABLE paymentMade_" +
      organizationNumber +
      "(id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,paymentMadeId VARCHAR(255) NULL, vendorName INT NULL REFERENCES ledgerAccount_" +
      organizationNumber +
      "(ledgerId) ON DELETE CASCADE ON UPDATE CASCADE,paymentMade REAL,paymentMode VARCHAR(255), createdDate DATETIME DEFAULT CURRENT_TIMESTAMP,paymentDate DATE,paidThrough INT REFERENCES ledgerAccount_" +
      organizationNumber +
      "(ledgerId) ON DELETE CASCADE ON UPDATE CASCADE ,reference VARCHAR(255) ,bankCharges REAL,total REAL)",
    {
      type: QueryTypes.CREATE,
    }
  );
  next();
};

exports.createPaymentForTable = async (req, res, next) => {
  const { organizationNumber } = req.user;

  await sequelize.query(
    "CREATE TABLE paymentFor_" +
      organizationNumber +
      "(id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,paymentMadeId VARCHAR(255)  ,billId VARCHAR(255) REFERENCES purchase_" +
      organizationNumber +
      "(purchaseId) ON DELETE CASCADE ON UPDATE CASCADE, paymentAmount REAL)",
    {
      type: QueryTypes.CREATE,
    }
  );
  next();
};

exports.createPaymentMadeHistoryTable = async (req, res, next) => {
  const { organizationNumber } = req.user;

  await sequelize.query(
    "CREATE TABLE  IF NOT EXISTS paymentMadeHistory_" +
      organizationNumber +
      "(id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,paymentMadeId VARCHAR(255) , billId VARCHAR(255) NULL REFERENCES purchase_" +
      organizationNumber +
      "(purchaseId) ON DELETE CASCADE ON UPDATE CASCADE, paymentAmount REAL, paymentDate DATE)",
    {
      type: QueryTypes.CREATE,
    }
  );
  next();
};

exports.createCurrencyTable = async (req, res, next) => {
  const { organizationNumber } = req.user;
  await sequelize.query(
    "CREATE TABLE currency_" +
      organizationNumber +
      "(id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,name VARCHAR(255) UNIQUE,symbol VARCHAR(255) UNIQUE)",
    {
      type: QueryTypes.CREATE,
    }
  );
  next();
};

exports.createBalancesTable = async (req, res, next) => {
  const { organizationNumber } = req.user;
  await sequelize.query(
    "CREATE TABLE balances_" +
      organizationNumber +
      "(balanceId INT NOT NULL AUTO_INCREMENT PRIMARY KEY,accountId INT REFERENCES ledgerAccount_" +
      organizationNumber +
      "(ledgerId) ON DELETE CASCADE ON UPDATE CASCADE,openingBalance REAL NULL,closingBalance REAL NULL,fiscalYearId INT NULL REFERENCES fiscalYear_" +
      organizationNumber +
      "(id) ON DELETE CASCADE ON UPDATE CASCADE,openingBalancePosition VARCHAR(255),closingBalancePosition VARCHAR(255), createdAt DATETIME DEFAULT CURRENT_TIMESTAMP )",
    {
      type: QueryTypes.CREATE,
    }
  );
  res.status(200).json({
    status: 200,
    organizationNumber,
    message: "Organization created sucesfully",
  });
};

exports.createContraTable = async (req, res, next) => {
  const { organizationNumber } = req.user;
  await sequelize.query(
    `CREATE TABLE contra_${organizationNumber} ( id INT NOT NULL  AUTO_INCREMENT PRIMARY KEY, contraId VARCHAR(255) ,contraToAccount INT REFERENCES accountGroup_${organizationNumber}(id) ON DELETE CASCADE ON UPDATE CASCADE,contraFromAccount INT REFERENCES accountGroup_${organizationNumber}(id) ON DELETE CASCADE ON UPDATE CASCADE,Date DATE,totalAmount REAL,Narration VARCHAR(255),createdAt DATETIME DEFAULT CURRENT_TIMESTAMP )`,
    {
      type: QueryTypes.CREATE,
    }
  );
  next();
};

// exports.deleteOrganization = async (req, res, next) => {
//   const organizationNumber = req.params.id;
//   await sequelize.query(
//     `DROP TABLE IF EXISTS contra_${organizationNumber},balances_${organizationNumber},currency_${organizationNumber},paymentMadeHistory_${organizationNumber},paymentFor_${organizationNumber},paymentMade_${organizationNumber},manualJournal_${organizationNumber},tax_${organizationNumber},sale_${organizationNumber},purchase_${organizationNumber},stockItem_${organizationNumber},ledgerAccount_${organizationNumber},accountGroup_${organizationNumber},fiscalYear_${organizationNumber},organization_${organizationNumber},journal_${organizationNumber},purchaseDetail_${organizationNumber},saleDetail_${organizationNumber},stockGroup_${organizationNumber},units_${organizationNumber} `,
//     {
//       type: QueryTypes.DELETE,
//     }
//   );
//   res.status(200).json({
//     status: 200,
//     organizationNumber,
//     message: "Organization deleted sucesfully",
//   });
// };
