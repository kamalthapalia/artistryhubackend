const config = require('../config/config')
const {DataTypes, Sequelize} = require("sequelize");

const sequelize = new Sequelize(config.database, config.user, config.password, {
    host: config.host,
    dialect: config.dialect,
    logging: console.log
})
sequelize.authenticate().then(() => {
    console.log("Connected to database")
})
    .catch(err => {
        console.log("db conn err: " + err)
    })
sequelize.sync({force: false}).then(() => {
    console.log("Tables created")
})
const db = {}
db.Sequelize = Sequelize
db.sequelize = sequelize

db.users = require('./userModel')(sequelize, DataTypes)
db.artworks = require('./artworkModel')(sequelize, DataTypes)
db.categories = require('./categoryModel')(sequelize, DataTypes)
db.orderitems = require('./orderItemModel')(sequelize, DataTypes)
db.orders = require('./orderModel')(sequelize, DataTypes)

module.exports = db