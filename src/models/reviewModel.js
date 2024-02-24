module.exports = (sequelize, DataTypes) => {
    const Review = sequelize.define('reviews', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        artwork_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        review: {
            type: DataTypes.STRING,
            allowNull: false
        }
    })
    return Review;
}