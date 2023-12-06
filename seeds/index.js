const sequelize = require("../config/connection");
const seedUsers = require("./user-seeds")
const seedUserProfilesDayOne = require("./userProfile-seeds-day1");
const seedUserConnections = require("./UserConnection-seeds");

const seedAllDayOne = async () => {
    try {
        await sequelize.sync({ force: true });

        await seedUsers();
        console.log('Users seeded successfully');

        await seedUserProfilesDayOne();
        console.log('User profiles seeded successfully');

        await seedUserConnections();
        console.log('User connections seeded successfully');
        process.exit(0);
    } 
    catch (error) {
        console.error('Error during seeding:', error);
        process.exit(1);
    }

};

seedAllDayOne();