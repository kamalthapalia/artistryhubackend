module.exports = (sequelize, DataTypes) => {
    const OrderItems = sequelize.define('orderItems', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        order_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        artwork_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    })
    return OrderItems;
}