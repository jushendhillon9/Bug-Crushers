// imports the Sequelize library
const Sequelize = require('sequelize');

//imports the database connection config
const sequelize = require('../config/connection');
// imports the User, UserProfile, and UserConnection models
const User = require('./User');
const UserProfile = require('./UserProfile');
const UserConnection = require('./UserConnection');
const UserSteps = require("./UserSteps");


//following two relationships set up the connection between UserSteps and User
User.hasMany(UserSteps, {
    foreignKey: "user_id",
    onDelete: "CASCADE"
})

UserSteps.belongsTo(User, {
    foreignKey: "user_id",
    onDelete: "CASCADE"
})

// defines relationships between the models
User.hasOne(UserProfile, {
    foreignKey: 'user_id', // connects a user to their user profile
    onDelete: 'CASCADE', // if a user is deleted, their profile is deleted
});

UserProfile.belongsTo(User, {
    foreignKey: 'user_id', // connects a user profile to its user
});

// optionally, defines relationships for the UserConnection model
User.belongsToMany(User, {
    through: UserConnection, // represents connections between users
    as: 'userConnections',
    foreignKey: 'user_id_1', // identifies the first user in a connection

    //this key, part of the through table, is the foreign key that links to the first user table
    otherKey: 'user_id_2', // identifies the second user in a connection
    //this key, which is also the part of the through table, is the foreign key that links to the second user table
    //still works to join the second User to the first User even though it was not declared as a foreign key in the join table.
    onDelete: 'CASCADE', // If a user is deleted, their connections are deleted
});

UserConnection.belongsTo(User, {
    foreignKey: 'user_id_1', // connects a connection to its first user
});
//this means that the User Connection table, which details which users are connected to each other
//can only be accessed by the first user

module.exports ={
    User,
    UserProfile,
    UserConnection,
    UserSteps,
    sequelize, // this is the connection instance for use in other parts of the app
};

