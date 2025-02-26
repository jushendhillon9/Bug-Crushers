const { DataTypes, Model, TEXT } = require("sequelize");
const sequelize = require("../config/connection");
class UserProfile extends Model {}
UserProfile.init(
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        full_name: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                len: [0, 50]
            }
        },
        bio: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                len: [0, 255]
            }
        },
        profile_picture: { //this is a URL
            type: DataTypes.STRING,
            allowNull: true, //make sure to have a check on the profile page; if the url is null, then no profile picture
        },
        challenge: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        current_steps: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
        },
        user_background_color: {
          type: DataTypes.STRING,
          false: true,
          defaultValue: "orangered"
        },
        user_id: {
            type: DataTypes.INTEGER,
            references: {
                model: "user",
                key: "id",
            },
            onDelete: "CASCADE",
            //put the foreign key as cascade, so that the entire entry is deleted when the parent table entry is deleted
            //this allows for the cascade deletion
        }
    },
    {
        sequelize,
        timestamps: true,
        freezeTableName: true,
        underscored: true,
        model_name: "UserProfile"
    }
)
module.exports = UserProfile;