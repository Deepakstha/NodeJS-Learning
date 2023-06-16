module.exports = (sequelize, DataTypes, bcrypt, crypto) => {
  const User = sequelize.define("user", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    organizationNumber: { type: DataTypes.INTEGER },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    role: {
      type: DataTypes.ENUM("admin", "user"),
      defaultValue: "user",
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        min: 8,
      },
    },
    passwordConfirm: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contactNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    passwordResetToken: DataTypes.STRING,
    passwordResetTokenExpiresIn: DataTypes.DATE,
  });

  //runs everytime before saving the data in the database : example in await user.save()
  // User.beforeSave(async (user, options) => {
  //   const hashedPassword = await bcrypt.hash(user.password, 10);
  //   const hashedPasswordConfirm = await bcrypt.hash(user.passwordConfirm, 10);
  //   user.password = hashedPassword;
  //   user.passwordConfirm = hashedPasswordConfirm;
  //   user.email = user.email.toLowerCase();
  // });
  // comparePassword for comparing user provided password and their stored password in the database
  User.prototype.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
  };

  //createResetToken generates the 4 digit random otp
  User.prototype.createResetToken = function () {
    const otp = crypto.randomInt(1000, 9999);
    return otp;
  };
  return User;
};
