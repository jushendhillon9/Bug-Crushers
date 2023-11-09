const router = require('express').Router(); // imports the Express.js router module
const cron = require('node-cron');
const dayjs = require("dayjs");
const { User, UserProfile, UserConnection, UserSteps } = require('../../models'); // imports the User model for working with user data

//autogenerates the step count for the day for each dummy user depending on their challenge (at 7pm)
//the following route will save this autogenerated number as the Dummy User's total steps for the day
cron.schedule("0 19 * * *", async (req,res) => {
  let allUsersProfilesDB = await UserProfile.findAll();
  let allUserProfiles = allUsersProfilesDB.map((profile) => profile.get({plain: true}));
  let userChallenge = [];
  for (const userProfile of allUserProfiles) {
    userChallenge.push(userProfile.challenge);
    if (userProfile.challenge == "Challenge One") {
      autogeneratedStepCount = Math.floor(Math.random() * 2001) + 8000;
      //between 8 and 10 thousand
    }
    if (userProfile.challenge == "Challenge Two") {
      autogeneratedStepCount = Math.floor(Math.random() * 2001) + 6000;
      //between 6 and 8 thousand
    }
    if (userProfile.challenge == "Challenge Three") {
      autogeneratedStepCount = Math.floor(Math.random() * 2001) + 4000;
      //between 4 and 6 thousand
    }
    await UserProfile.update(
      {
        current_steps: autogeneratedStepCount,
      },
      {
        where: {
          user_id : userProfile.user_id
        }
      }
    )
  }
  }
)


//will grab every "currentSteps" for each UserProfile and log it as each User's steps for the day
//it sets the current_steps (for the day) equal to 0 afterwards and it will stay 0 until the route above autogenerates a stepcount
cron.schedule("55 12 * * *", async () => {
  //need to require dayjs for the date
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
})

// POST route for user registration
router.post('/signup', async (req, res) => {
  try {

    const {email, password} = req.body;
    //destructuring with variable names on left that match property names of object on right
    

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      const error = new Error('Email is already registered');
      throw error;
    }
    else {
      req.session.save(() => {
        req.session.email = email,
        req.session.password = password,
        res.json({email: email, password: password})
      })
    }
  } 
  catch (err) {
    console.error(err);
    res.status(500).json({err});
  }
});

// route for user login
router.post('/login', async (req, res) => {
  try {
    // attempts to find a user in the database with the provided email
    const userData = await User.findOne({ where: { email: req.body.email } });

    // checks if no user was found with the provided email
    if (!userData) {
      res
        .status(400) // responds with a status code 400 (Bad Request)
        .json({ message: 'Incorrect email or password, please try again' });
      return; // exits function
    }
    // checks if the provided password matches the stored password for the user
    const validPassword = await userData.checkPassword(req.body.password);
    console.log(validPassword);
    //returning false even when correct

    // if the password is not valid
    if (!validPassword) {
      res
        .status(400) // responds with status code 400 (Bad Request)
        .json({ message: 'Incorrect email or password, please try again' });
      return; // exits function
    }

    console.log("CORRECT");

    // saves user information in a session to indicate the user is now logged in
    await req.session.save(() => {
      req.session.user_id = userData.id; // stores the user's ID in the session
      req.session.logged_in = true; // sets the 'logged_in' property to true
      console.log(req.session.logged_in);
      
      // responds with the user's data and a success message
      res.json({ user: { id: userData.id, email: userData.email }, message: 'You are now logged in!' });
    });

  } catch (err) {
    console.log(err);
    res.status(400).json(err); // responds with status code 400 (Bad Request) & an error if one occurs
  }
});


router.post("/register", async (req, res) => {
  try {
    //in registerUser route (which is a post route)
    let newUsername = req.body.newUsername;
    let newEmail = req.session.email;
    //checking to see if username is already in use
    const existingUser = await User.findOne({ where: {username: newUsername} });
    if (existingUser) {
      const error = new Error("Username is already in use. Please try again.")
      throw error;
    }

    let newPassword = req.session.password;
    let newUser = {
      username: newUsername,
      email: newEmail,
      password: newPassword
    }
    newUser = await User.create(newUser);

    let newChallenge = req.body.selectedChallenge;
    //let newChallenge = ...
    await UserProfile.create({
      full_name: "",
      bio: "", 
      profile_picture: "",
      challenge: newChallenge,
      step_count: 0,
      user_background_color: "orangered",
      user_id: newUser.id
    });

    await req.session.save(() => {
      req.session.user_id = newUser.id;
      req.session.logged_in = true;
      res.json({newUser});
    })
  }
  catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
})

// route for user logout
router.get('/logout', (req, res) => {
  // checks if the user is currently logged in (as indicated by 'logged_in' property in the session)
  if (req.session.logged_in) {
    // if logged in, destroys the session to log the user out
    req.session.destroy((err) => {
      if (err) {
        console.log("shouldn't be here");
        console.log (err);
        res.status(500).json({error: "error occured"})
      }
      else {
        //res.status("Successfully logged out.").end(); 
        res.json({message: "Successful logout!"});
      }
    });
  } else {
    //if the logout button is visible when the user is not logged in, that is an error in server
    res.status(500).end();
  }
});

//meant to save the inputted dailySteps to the User's Profile
//cron.schedule route above will grab all UserProfiles dailySteps and save them into the UserSteps table with a specific date at 11:59PM
router.put("/dailySteps", async (req,res) => {
  //userID is the logged in userSteps;
  try {
    const dailySteps = req.body.inputtedStepValue;
    let userProfile = await UserProfile.update(
      {
        current_steps: dailySteps,
      },
      {
        where: {
          id: req.session.user_id,
        }
      }
    )
    console.log(userProfile);
    res.json({user: userProfile});
  }
  catch(err) {
    console.log(err);
    res.status(500).json(err);
  }
})

//this post route makes the get past steps button functional
router.post("/pastSteps", async (req,res) => {
  try {
    let desiredStepDate = req.body.date;

    //grabbing Step Challenge section data for UserProfile
    const dbStepData = await UserSteps.findAll({
      where: {
        user_id: req.session.user_id,
      },
      order: [["date", "DESC"]]
    })
    const stepData = dbStepData.map((stepLog) => stepLog.get({plain: true}));

    let correctEntry;
    //copy all the code leading up to this point create a post rout
    for (const stepEntry of stepData) {
      let dateCreated = stepEntry.date;
      let dateFormatted = dayjs.unix(dateCreated).format("MM/DD/YYYY");
      if (dateFormatted === desiredStepDate) {
        correctEntry = stepEntry;
      }
    }
    let desiredStepCount = false;
    if (correctEntry) {
      desiredStepCount = correctEntry.steps_for_day;
    }
    
    res.json(desiredStepCount); //no need for curly braces, don't want to wrap it as a json object
    /*
    if I did add a curly braces to this it would look like the following: 
    {
      "desiredStepCount": 5000,
    }
    this is a Json object with a property called desiredStepCount
    */
  }
  catch(err) {
    console.log(err);
    res.status(500).json(err);
  }
})

router.get("/friendRequest", async (req, res) => {
  try {
    const allFriendRequestsDBData = await UserConnection.findAll(
      {
        where: {
          user_id_2: req.session.user_id,
          status: "pending",
        },
        include: {
          model: User
        }
      }
    )

    const allFriendRequestData = await allFriendRequestsDBData.map((friendRequest) => friendRequest.get({ plain: true }));
    let friendRequesterProfilePics = [];
    let userProfilePics = [];

    for (const request of allFriendRequestData) {
      const UserProfileData = await UserProfile.findAll({
        where: {
          id: request.user_id_1
        }
      });
    
      const simplifiedRequest = UserProfileData.map(requester => requester.get({ plain: true }));
      const requesterProfilePic = simplifiedRequest[0].profile_picture;
      userProfilePics.push(requesterProfilePic);
    }
    

    console.log(userProfilePics);
    res.json({allFriendRequestData, userProfilePics});
  }
  catch(error) {
    console.log(error);
    res.status(500).json(error);
  }
})

//route to create friend connections
router.post("/addFriend", async (req,res) => {
  try {
    const friendInitiatior = req.session.user_id; //logged in user creates friend request
    const friendReceiver = req.body.profileID;
    const newConnection = await UserConnection.create({
      "user_id_1": friendInitiatior,
      "user_id_2": friendReceiver
    })
    console.log(newConnection);
    res.json({newConnection});
  }
  catch(err) {
    console.log(err);
    res.status(500).json(err);
  }
})

//route to accept friend connection
router.post("/acceptFriend", async (req,res) => {
  //use the logged in user id from session to find connections where they are user id 2
  //then change the status from pending to accepted
  try {
    let requesterUsername = req.body.username;
    const matchingUserDB = await User.findAll(
        {
          where: {
            username: requesterUsername,
          }
      } 
    )
    const matchingUser = matchingUserDB.map((user) => user.get({plain: true}));
    let requesterID = matchingUser[0].id;
    console.log(requesterID);
    await UserConnection.update(
      {
        status: "accepted",
      },
      {
        where: {
          user_id_2: req.session.user_id,
          user_id_1: requesterID
        }
      }
    )
    let currentURL = "/profile/" + req.session.user_id;
    res.json(currentURL);
  }
  catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
})

router.delete("/declineFriend", async (req,res) => {
  try {
    let requesterUsername = req.body.username;
    const matchingUserDB = await User.findAll(
        {
          where: {
            username: requesterUsername,
          }
      } 
    )
    const matchingUser = matchingUserDB.map((user) => user.get({plain: true}));
    let requesterID = matchingUser[0].id;
    console.log(requesterID);
    await UserConnection.destroy(
      {
        where: {
          user_id_2: req.session.user_id,
          user_id_1: requesterID
        }
      }
    )
    let currentURL = "/profile/" + req.session.user_id;
    res.json(currentURL);
  }
  catch(err) {
    console.log(err);
    res.status(500).json(err);
  }
})

router.get("/circularProgressBar/:userId", async(req,res) => {
  //need the challenge to get the number 
  const userID = req.params.userId;
  const allUserStepsDB = await UserSteps.findAll(
    {
      where: {
        user_id: userID
      }
    }
  )
  const allUserSteps = allUserStepsDB.map((stepEntry) => stepEntry.get({plain: true}));
  let totalSteps = 0;
  let thisMonth = dayjs().format("MM/YYYY");
  for (const stepEntry of allUserSteps) {
    let dateCreated = stepEntry.date;
    let dateFormatted = dayjs.unix(dateCreated).format("MM/YYYY");
    if (dateFormatted == thisMonth) {
      totalSteps += stepEntry.steps_for_day;
    }
  }
  res.json(totalSteps);
})

//route to decline friend connection, this will tak the pending connection and delete it




module.exports = router; // exports the router with defined routes for use in other parts of the app
