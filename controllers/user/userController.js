const db = require("../../model/index");
const User = db.users;
const sequelize = db.sequelize;

const AppError = require("../../utils/appError");

const { QueryTypes, DataTypes } = require("sequelize");

exports.getMe = async (req, res, next) => {
  const { id } = req.user;
  const user = await sequelize.query("SELECT * FROM users WHERE id=" + id, {
    type: QueryTypes.SELECT,
  });
  if (!user) return next(new AppError("invalid id is provided", 400));
  //   const organization = await sequelize.query("")
  res.status(200).json({
    status: 200,
    user,
  });
};

exports.updateMe = async (req, res, next) => {
  const { id } = req.user;
  const user = await sequelize.query("SELECT * FROM users WHERE id=" + id, {
    type: QueryTypes.SELECT,
  });
  const username = req.body.username || user[0].username;
  const email = req.body.email || user[0].email;
  const contactNumber = req.body.contactNumber || user[0].contactNumber;

  await sequelize.query(
    "UPDATE users SET username=" +
      JSON.stringify(username) +
      ",email=" +
      JSON.stringify(email) +
      ",contactNumber=" +
      JSON.stringify(contactNumber) +
      " WHERE id=" +
      id,
    {
      type: QueryTypes.UPDATE,
    }
  );
  res.status(200).json({
    status: 200,
    message: "Updated user sucesfully",
  });
};
exports.deleteMe = async (req, res, next) => {
  const { id } = req.user;
  if (!id) return next(new AppError("no user exist with that id", 400));
  await sequelize.query("DELETE FROM users WHERE id=" + id, {
    types: QueryTypes.DELETE,
  });
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
    console.log(allOrganizationNumberOfUser);
    organization = await sequelize.query(
      "DROP TABLE stockgroup_" + allOrganizationNumberOfUser[i],
      { type: QueryTypes.DELETE }
    );
    organization = await sequelize.query(
      "DROP TABLE ledgeraccount_" + allOrganizationNumberOfUser[i],
      { type: QueryTypes.DELETE }
    );
    organization = await sequelize.query(
      "DROP TABLE organization_" + allOrganizationNumberOfUser[i],
      { type: QueryTypes.DELETE }
    );
    organization = await sequelize.query(
      "DROP TABLE units_" + allOrganizationNumberOfUser[i],
      { type: QueryTypes.DELETE }
    );
    organization = await sequelize.query(
      "DROP TABLE accountgroup_" + allOrganizationNumberOfUser[i],
      { type: QueryTypes.DELETE }
    );
    organizationArr.push(organization);
  }
  await sequelize.query("DELETE FROM user_org WHERE userId=" + id, {
    type: QueryTypes.DELETE,
  });
  res.status(200).json({
    status: 200,
    message: "deleted user sucessfully",
  });
};
