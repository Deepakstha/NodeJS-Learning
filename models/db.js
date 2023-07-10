const dbConfig = require("../config/dbConfig")
const { Sequelize, DataTypes } = require('sequelize')

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    pool: {
        max: dbConfig.pool.max,
        min: dbConfig.pool.min,
        acquire: dbConfig.pool.acquire,
        idle: dbConfig.pool.idle,
    },
})

try {
    sequelize.authenticate()
    console.log("Database Connected Succesfully!")
} catch (error) {
    console.log("Unable to connect to the Database! ", error)
}

const db = {}
db.sequelize = sequelize
db.Sequelize = Sequelize

db.users = require("./userModel")(sequelize, DataTypes)

db.sequelize.sync({ force: false })
module.exports = db