const express = require("express");
const requestRouter = express.Router();

const userAuth = require("../middlewares/auth"); //importing the user authentication middleware 
const User = require("../models/user"); //importing the user model
const ConnectionRequest = require("../models/connectionRequest"); //importing the connection request model  




requestRouter.post("/request/send/:status/:toUserId", userAuth, async (req, res) => {
    try{
        const fromUserId = req.user._id; //getting the user data from the request object
        const  toUserId  = req.params.toUserId ; //getting the status and toUserId from the request parameters
        const status = req.params.status; //getting the status and toUserId from the request parameters
        

        const allowedStatuses = [ "ignored", "interested"];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).send(`Invalid status. Allowed statuses are: ${allowedStatuses.join(", ")}`);
        }


        const toUser = await User.findById(toUserId);
        if (!toUser) {
            return res.status(404).send("User not found");
        }   



        //if there is existing connection request from the same user to the same user, then throw error
        const existingRequest = await ConnectionRequest.findOne({ 
        $or: [
            { fromUserId, toUserId },
            { fromUserId: toUserId, toUserId: fromUserId }  
        ],
    });
        if (existingRequest) {
            return res.status(400).send("Connection request already sent");
        }


        const connectionRequest = new ConnectionRequest({
            fromUserId,
            toUserId,
            status
        });

        await connectionRequest.save();
        res.send(
  `${req.user.firstName} is ${status} to ${toUser.firstName}`
);
    }
    catch(err){
        res.status(500).send(err.message);                  
    }  
});




// { connection request send and status can be accepted or rejected by user
//     validate the status and toUserId in the request parameters
//     shalini -> Preetu[from userId  to touserId]
//     shalini must be logged in
    //    stustus can be accepted or rejected by Preetu .it mesy be interested before accepting or rejecting the request
    //    request id should be valid



// }

requestRouter.post("/request/review/:status/:requestId", userAuth, async (req, res) => {
    try{
        const loggedInUser = req.user; //getting the user data from the request object 
        const requestId = req.params.requestId; //getting the request id from the request parameters
        const allowedStatuses = ["accepted", "rejected"];
        if (!allowedStatuses.includes(req.params.status)) {
            return res.status(400).send(`Invalid status. Allowed statuses are: ${allowedStatuses.join(", ")}`);
        }
        const connectionRequest = await ConnectionRequest.findOne({ _id: requestId,
        toUserId: loggedInUser._id,
        status: "interested" });

        if (!connectionRequest) {
            return res.status(404).send("Connection request not found or not in 'interested' status");
        }

        connectionRequest.status = req.params.status;
        await connectionRequest.save();
        res.send(`Connection request ${req.params.status} by ${loggedInUser.firstName}`);   

        


    }
    catch(err){
        res.status(500).send(err.message);                  
    }
});

module.exports = requestRouter;

