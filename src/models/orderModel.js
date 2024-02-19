module.exports = (sequelize, DataTypes) => {
    const Order = sequelize.define('orders', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
    })
    return Order;
}