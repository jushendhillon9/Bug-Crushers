const sequelize = require("../../config/connection");
const { UserProfile, UserSteps } = require('../../models'); // imports the User model for working with user data

let recordSteps = async () => {
    try {
      await sequelize.transaction(async (t) => {
        let currentTime = dayjs().unix();
      let allUsersProfilesDB = await UserProfile.findAll();
      let allUserProfiles = allUsersProfilesDB.map((profile) => profile.get({plain: true}));
      console.log(allUserProfiles); //all userProfiles
      let allUsersStepInfo = [];
      for (const userProfile of allUserProfiles) {
        let usersSteps = {
          daysSteps: userProfile.current_steps,
          userID: userProfile.id,
        }
        allUsersStepInfo.push(usersSteps);
        //now I need to go into the database and set each UserProfile's current steps equal to 0, since it is a new day now
        //each usersSteps holds the current UserProfile's id, use this to locate that specific UserProfile and change current_steps to 0
        await UserProfile.update(
          {
            current_steps: 0,
          },
          {
            where: {
              user_id : usersSteps.userID
            }
          }
        )
      }
      let allNewEntriesDB = [];
      for (const userStepLog of allUsersStepInfo) {
        let newEntryDB = await UserSteps.create(
          {
            steps_for_day: userStepLog.daysSteps,
            date: currentTime, //give appropriate date with dayjs();
            user_id: userStepLog.userID
          }
        )
        allNewEntriesDB.push(newEntryDB);
      }
      let allNewEntries = allNewEntriesDB.map((newEntry) => newEntry.get({plain: true}));
      console.log(allNewEntries);
     });
    }
    catch (error) {
      console.error("Error in cron job:", error);
    }
  }

  recordSteps();