const sequelize = require("../../config/connection");
const { UserProfile } = require('../../models');

let generateSteps = async () => {
    try {
      await sequelize.transaction(async (t) => {
        let allUsersProfilesDB = await UserProfile.findAll();
        let allUserProfiles = allUsersProfilesDB.map((profile) => profile.get({plain: true}));
        console.log(allUserProfiles);
        let userChallenge = [];
        for (let i = 0; i < 25; i++) {
          userChallenge.push(allUserProfiles[i].challenge)
          if (allUserProfiles[i].challenge == "Challenge One") {
            autogeneratedStepCount = Math.floor(Math.random() * 2001) + 8000;
          }
          if (allUserProfiles[i].challenge == "Challenge Two") {
            autogeneratedStepCount = Math.floor(Math.random() * 2001) + 6000;
          }
          if (allUserProfiles[i].challenge == "Challenge Three") {
            autogeneratedStepCount = Math.floor(Math.random() * 2001) + 4000;
          }
          await UserProfile.update(
            {
              current_steps: autogeneratedStepCount,
            },
            {
              where: {
                user_id : allUserProfiles[i].user_id
              }
            }
          )
        }
     });
    }
    catch (error) {
      console.error("Error in cron job:", error);
    }
  }

  generateSteps();