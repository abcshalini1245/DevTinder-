const express = require('express'); //importing the express library
const userRouter = express.Router();
const userAuth = require('../middlewares/auth'); //importing the user authentication middleware
const connectionRequest = require('../models/connectionRequest'); //importing the connection request model

const User = require("../models/user");




//userRouter
// GET/USER/CONNECTIONSREQUESTS
// GET/USER/CONNECTION
// GET/USER/FEED-gets you the profile of the users that you have not connected with yet and are not in your connection requests


//get all the pending connection requests for the logged in user
userRouter.get("/user/requests/recieved", userAuth,async (req, res) => {
    try{
        const loggedInUser = req.user; //getting the logged in user from the request object
        const connectionRequests = await connectionRequest.find({ toUserId: loggedInUser._id, status: "interested" }).populate("fromUserId", "firstName lastName age gender about photourl"); //finding all the connection requests
        res.json(connectionRequests); //sending the connection requests as json response
     
    }
    catch(err){
        res.status(500).send(err.message);                  
    }   
});


//get my connection and matches now
userRouter.get("/user/connections", userAuth, async (req, res) => {
    try{
        const loggedInUser = req.user; //getting the logged in user from the request object
        const connections = await connectionRequest.find({ $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }], status: "accepted" }).populate("fromUserId toUserId", "firstName lastName age gender about photourl "); //finding all the connections

        const data  = connections.map((row) => {
        if(row.fromUserId.equals(loggedInUser._id)){
            return row.toUserId;
        }  
        return row.fromUserId;
    });
        res.json(data); //sending the connections as json response
    }
    catch(err){
        res.status(500).send(err.message);                  
    }   
});





// GET /feed?page=1&limit=10
userRouter.get("/feed", userAuth, async (req, res) => {
    try {

        const loggedInUser = req.user;
        const { skills, gender, location } = req.query;

        const page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        limit = limit>50? 50:limit;
        const skip = (page - 1) * limit;

        // Prevent users from requesting too many records
        const safeLimit = Math.min(limit, 50);

        // Find all connection requests involving the logged-in user
        const connectionRequests = await connectionRequest.find({
            $or: [
                { fromUserId: loggedInUser._id },
                { toUserId: loggedInUser._id }
            ]
        }).select("fromUserId toUserId");

        const hideUsersFromFeed = new Set();

        connectionRequests.forEach((request) => {
            hideUsersFromFeed.add(request.fromUserId.toString());
            hideUsersFromFeed.add(request.toUserId.toString());
        });

        const filter = {
  _id: {
    $nin: [...Array.from(hideUsersFromFeed), loggedInUser._id],
  },
};

if (skills) {
  filter.skills = { $in: [skills] };
}

if (gender) {
  filter.gender = gender;
}

if (location) {
  filter.location = {
    $regex: location,
    $options: "i",
  };
}

const users = await User.find(filter)
  .select(
    "firstName lastName age gender about skills photourl location"
  )
  .skip(skip)
  .limit(safeLimit);

        res.status(200).json(users);

    } catch (err) {
        res.status(400).json({
            message: err.message,
        });
    }
});







userRouter.get("/user/profile/:userId", userAuth, async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const { userId } = req.params;

    // Prevent viewing your own profile through this API
    if (loggedInUserId.toString() === userId) {
      return res.status(400).json({
        message: "Use /profile/view for your own profile",
      });
    }

    // Check if users are connected
    const connection = await connectionRequest.findOne({
      status: "accepted",
      $or: [
        {
          fromUserId: loggedInUserId,
          toUserId: userId,
        },
        {
          fromUserId: userId,
          toUserId: loggedInUserId,
        },
      ],
    });

    if (!connection) {
      return res.status(403).json({
        message: "You can only view profiles of your connections.",
      });
    }

    // Fetch profile
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json(user);

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});
    

// ============================================
// GET USER DASHBOARD STATS
// ============================================

userRouter.get("/stats", userAuth, async (req, res) => {

    try{

        const userId = req.user._id;

        const [pending, accepted, rejected] = await Promise.all([

            connectionRequest.countDocuments({
                toUserId:userId,
                status:"interested"
            }),

            connectionRequest.countDocuments({
                status:"accepted",
                $or:[
                    {fromUserId:userId},
                    {toUserId:userId}
                ]
            }),

          connectionRequest.countDocuments({
                status:"ignored",
                $or:[
                    {fromUserId:userId},
                    {toUserId:userId}
                ]
            })

        ]);

        res.status(200).json({

            connections:accepted,
            pending,
            accepted,
            rejected

        });

    }

    catch(err){

        res.status(500).json({

            message:err.message

        });

    }

});
    

  
module.exports = userRouter;
