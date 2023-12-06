const sequelize = require("../../config/connection");
const dayjs = require("dayjs");
const { UserProfile, UserSteps } = require('../../models'); // imports the User model for working with user data

let recordSteps = async () => {
    try {
      await sequelize.transaction(async (t) => {
      let currentTime = dayjs().unix();
      let allUsersProfilesDB = await UserProfile.findAll();
      let allUserProfiles = allUsersProfilesDB.map((profile) => profile.get({plain: true}));
      console.log(allUserProfiles);
      let allUsersStepInfo = [];
      for (let i = 0; i < 25; i++) {
        let usersSteps = {
          daysSteps: allUserProfiles[i].current_steps,
          userID: allUserProfiles[i].id,
        }
        allUsersStepInfo.push(usersSteps);
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