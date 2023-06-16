require("dotenv").config();

const express = require("express");
const app = express();
const organizationRoute = require("./routes/organizationRoute");
const accountGroupRoute = require("./routes/accountGroupRoute");
const ledgerRoute = require("./routes/ledgerRoute");
const unitsRoute = require("./routes/unitsRoute");
const authRoute = require("./routes/authRoute");
const userRoute = require("./routes/userRoute");
const stockItemRoute = require("./routes/stockItemRoute");
const stockGroupRoute = require("./routes/stockGroupRoute");
const fiscalYearRoute = require("./routes/fiscalYearRoute");
const taxRoute = require("./routes/taxRoute");
const purchaseRoute = require("./routes/purchaseRoute");
const saleRoute = require("./routes/saleRoute");
const manualJournalRoute = require("./routes/manualJournalRoute");
const paymentMadeRoute = require("./routes/paymentMadeRoute");
const currencyRoute = require("./routes/currencyRoute");
const balancesRoute = require("./routes/balancesRoute");
const contraRoute = require("./routes/contraRoute");
const cors = require("cors");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./utils/errorHandler");

// for parsing cookies (req.cookies && res.cookies)
const cookieParser = require("cookie-parser");
const { protectMiddleware } = require("./utils/isAuthenticated");

const corsOption = {
  origin: "http://127.0.0.1:5173",
  // "Access-Control-Allow-Origin": "*",
  // preflightContinue: false,
  // credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};
// const corsOptions = {
//   origin: "*",
//   credentials: true, //access-control-allow-credentials:true
//   optionSuccessStatus: 200,
// };
app.use(cors(corsOption));
app.use(cookieParser());

//parsing incoming req body data to json
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//middlewares initialize for routes
app.use("/api/v1/auth", authRoute);
app.use("/api/v1", organizationRoute);
app.use("/api/v1", accountGroupRoute);
app.use("/api/v1", ledgerRoute);
app.use("/api/v1", unitsRoute);
app.use("/api/v1", userRoute);
app.use("/api/v1", stockGroupRoute);
app.use("/api/v1", stockItemRoute);
app.use("/api/v1", fiscalYearRoute);
app.use("/api/v1", taxRoute);
app.use("/api/v1", purchaseRoute);
app.use("/api/v1", saleRoute);
app.use("/api/v1", manualJournalRoute);
app.use("/api/v1", paymentMadeRoute);
app.use("/api/v1", currencyRoute);
app.use("/api/v1", balancesRoute);
app.use("/api/v1", contraRoute);

app.get("/home", (req, res) => {
  console.log(req.cookies);
});

//for routes other than defined routes throw eror

app.all("*", (req, res, next) => {
  next(new AppError(`Cannot find the path ${req.originalUrl}`, 404));
});

app.use(globalErrorHandler);
// hello
module.exports = app;
