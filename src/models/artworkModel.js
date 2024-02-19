module.exports = (sequelize, DataTypes) => {
    const Artwork = sequelize.define('artworks', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        price: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false
        },
        category: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        artist: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        image: {
            type: DataTypes.STRING,
            allowNull: false
        },
        sold: {
            type: DataTypes.STRING,
            allowNull: false
        }
    })
    return Artwork;
}