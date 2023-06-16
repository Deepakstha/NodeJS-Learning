const db = require("../../model/index");
const User = db.users;
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const { createHmac } = require("crypto");
const sendEmail = require("../../utils/email");
const { Op } = require("sequelize");
const AppError = require("./../../utils/appError");
const bcrypt = require("bcrypt");

require("dotenv").config();
//create user

exports.createUser = async (req, res, next) => {
  const {
    username,
    password,
    email,
    contactNumber,
    passwordConfirm,
    organizations,
  } = req.body;
  if (!username || !password || !email || !contactNumber || !passwordConfirm) {
    return next(
      new AppError(
        "Please provide username,password,email,contactNumber and passwordConfirm",
        400
      )
    );
  }
  if (password.toLowerCase() !== passwordConfirm.toLowerCase()) {
    return next(
      new AppError("password and passwordConfirm doesn't match", 400)
    );
  }
  const userExist = await User.findOne({
    where: { username: username },
  });
  const emailExist = await User.findOne({
    where: { email: email },
  });
  if (userExist)
    return next(new AppError("Username with that username already exists"));
  if (emailExist)
    return next(new AppError("email with that email already exists"));

  const hashedPassword = await bcrypt.hash(password, 10);
  const hashedPasswordConfirm = await bcrypt.hash(passwordConfirm, 10);
  // user.password = hashedPassword;
  // user.passwordConfirm = hashedPasswordConfirm;
  // user.email = user.email.toLowerCase();

  const user = await User.create({
    username,
    password: hashedPassword,
    email: email.toLowerCase(),
    contactNumber,
    passwordConfirm: hashedPasswordConfirm,
    organizations,
  });

  res.status(200).json({
    status: 200,
    user,
    message: "User created ",
  });
  // res.redirect("/createOrganizations");
};



exports.loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError("Please provide both email and password", 400));
  }
  try {
    //find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return next(new AppError("Invalid email or password", 401));
    }
    //compare provided password with the hashed password in the database
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return next(new AppError("Invalid email or password", 401));
    }
    //create and sign JWT token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.cookie("jwtToken", token, {
      expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      httpOnly: false,
      secure: false,
    });
    //send token to client
    res.status(200).json({
      status: 200,
      token,
        user,
    });
  } catch (error) {
    return next(new AppError("Server Error", 500));
  }
};

exports.forgetPassword = async (req, res, next) => {
  //check if user emai exists in the database
  const { email } = req.body;
  const user = await User.findOne({ where: { email: email } });
  if (!user) return next(new AppError("Invalid email address", 400));

  // createResetToken method is coming from usermodel file
  const otp = await user.createResetToken();

  const secret = process.env.SECRET;
  user.passwordResetToken = createHmac("sha256", secret)
    .update(`${otp}`)
    .digest("hex");
  user.passwordResetTokenExpiresIn = Date.now() + 10 * 60 * 1000;

  await user.save();

  const message = `Forgot your password ? Enter the otp  \n
  ${otp}. \n If you don't forget your password , please ignore this email! `;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset otp (only valids for 10 minutes)",
      message,
    });
    res.status(200).json({
      status: "success",
      user,

      message: "Email sent succesfully",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpiresIn = undefined;
    await user.save();

    return res.status(400).json({
      status: "error",
      message: err,
    });
  }
};

exports.resetPassword = async (req, res, next) => {
  const { otp, password, passwordConfirm } = req.body;
  if (!otp || !password || !passwordConfirm) {
    return next(
      new AppError("Please enter otp number,password and passwordconfirm", 400)
    );
  }
  const secret = process.env.SECRET;

  const hashedOtp = createHmac("sha256", secret).update(`${otp}`).digest("hex");

  const user = await User.findOne({
    where: {
      passwordResetToken: hashedOtp,

      passwordResetTokenExpiresIn: {
        [Op.gt]: Date.now(),
      },
    },
  });
  if (!user) {
    return next(new AppError("Invalid otp or otp has expired", 400));
  }
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.passwordResetTokenExpiresIn = undefined;
  user.passwordResetToken = undefined;
  await user.save();

  // sign in jwt token
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  res.cookie("jwtToken", token, {
    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    httpOnly: false,
    secure: true,
  });

  res.status(200).json({
    status: 200,
    token,
    data: {
      user,
    },
  });
};

exports.updatePassword = async (req, res, next) => {
  if (
    !req.body.currentPassword ||
    !req.body.newPassword ||
    !req.body.passwordConfirm
  ) {
    return next(
      new AppError(
        "Please provide currentPassword , newPassword and passwordConfirm in the body",
        400
      )
    );
  }
  const user = await User.findByPk(req.user.id);

  if (!user || !(await user.comparePassword(req.body.currentPassword))) {
    return next(new AppError("Invalid username or password", 400));
  }
  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // sign in jwt token
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  res.cookie("jwtToken", token, {
    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    httpOnly: false,
    secure: true,
  });

  res.status(200).json({
    status: 200,
    token,
    data: {
      user,
    },
  });
};

exports.logOut = async (req, res) => {
  const { jwtToken } = req.cookies;

  res.clearCookie(jwtToken);
  // localStorage.clear();
  // res.status(200).json({
  //   jwtToken,
  //   status: "sucess",
  //   message: "Logged out",
  // });
  res.json({
    status: 200,
    message: "Logged out",
  });
};
