const express = require('express'); //importing the express library
const ProfileRouter = express.Router(); 

const userAuth = require('../middlewares/auth'); //importing the user authentication middleware
const User = require('../models/user'); //importing the user model
const { validateEditProfileData } = require('../utils/validation'); //importing the validation function 
const validator = require('validator'); //importing the validator library to validate the password
const bcrypt = require('bcrypt'); //importing the bcrypt library to hash the password

const crypto = require("crypto"); //importing the crypto library to generate a random token for password reset
const sendOTP = require("../utils/sendEmail");


const upload = require("../middlewares/upload");
const cloudinary = require("../utils/cloudinary");
const fs = require("fs");





ProfileRouter.post(
  "/upload",
  upload.single("photo"),
  async (req, res) => {
    try {
      const result = await cloudinary.uploader.upload(req.file.path);
     

      fs.unlinkSync(req.file.path);

      res.json({
    photourl:result.secure_url
});
    } catch (err) {
      
      res.status(500).send("Upload failed");
    }
  }
);








ProfileRouter.get("/profile/view", userAuth, async (req, res) => {
    try{
        const user = req.user; //getting the user data from the request object  
        res.send(user); //sending the user data to the client   
    }   
    catch(err){
        res.status(500).send(err.message);                  
    }
});



ProfileRouter.patch("/profile/edit", userAuth, async (req, res) => {
    try{
        if (!validateEditProfileData(req)) { //validating the edit profile data
            throw new Error("Invalid fields in the request body");
        }

        const loggedInUser = req.user; //getting the user data from the request object
         Object.keys(req.body).forEach((key) => {
            loggedInUser[key] = req.body[key];
        });
        await loggedInUser.save(); //saving the updated user data to the database
        // res.send(`Profile updated successfully for ${loggedInUser.firstName} ${loggedInUser.lastName}`); //responding to the client
        res.json({ message: `Profile updated successfully for ${loggedInUser.firstName} ${loggedInUser.lastName}`, user: loggedInUser }); //responding to the client with updated user data
    }catch(err){
        res.status(500).send(err.message);                         
    }
});


ProfileRouter.patch("/profile/edit/password", userAuth, async (req, res) => {
    try {

        const loggedInUser = req.user;

        const { currentPassword, newPassword } = req.body;

        // Check if both passwords are provided
        if (!currentPassword || !newPassword) {
            throw new Error("Current password and new password are required.");
        }

        // Check password strength
        if (!validator.isStrongPassword(newPassword)) {
            throw new Error("Please enter a strong password!");
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(
            currentPassword,
            loggedInUser.password
        );

        if (!isPasswordValid) {
            throw new Error("Current password is incorrect.");
        }

        // Check if new password is same as old password
        const isSamePassword = await bcrypt.compare(
            newPassword,
            loggedInUser.password
        );

        if (isSamePassword) {
            throw new Error("New password cannot be the same as the old password.");
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        loggedInUser.password = hashedPassword;

        // Save updated user
        await loggedInUser.save();

        res.status(200).json({
            message: "Password updated successfully."
        });

    } catch (err) {
        res.status(400).json({
            message: err.message
        });
    }
});



// {
// API 1: /forgot-password

// Purpose:

// User enters their email.
// Server verifies the email.
// Server generates and sends an OTP (or reset link).

// Example:

// Email → Generate OTP → Send OTP
// API 2: /reset-password

// Purpose:

// User enters the OTP and the new password.
// Server verifies the OTP.
// Server updates the password.

// Example:

// OTP + New Password → Verify OTP → Update Password

// Why not one API?

// Because the user doesn't have the OTP immediately. The flow is:

// User requests an OTP.
// Waits for the email/SMS.
// Enters the received OTP.
// Resets the password.

// This requires two separate requests, so two APIs.

// }

ProfileRouter.post("/forgot-password", async (req, res) => {
    try {

        const { emailId } = req.body;

        const user = await User.findOne({ emailId });

        if (!user) {
            return res.status(404).send("User not found");
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        user.resetOTP = otp;
        user.resetOTPExpiry = new Date(Date.now() + 10 * 60 * 1000);

        await user.save();

        // For now just return OTP
        // Later you'll send it through email
       await sendOTP(emailId, otp);

res.json({
  message: "OTP sent successfully",
});


    } 
    catch (err) {
 

    res.status(500).json({
        message: err.message,
    });
}
});




ProfileRouter.patch("/reset-password", async (req, res) => {

    try {

        const { emailId, otp, newPassword } = req.body;

        const user = await User.findOne({ emailId });

        if (!user) {
            return res.status(404).send("User not found");
        }

        if (user.resetOTP !== otp) {
            return res.status(400).send("Invalid OTP");
        }

        if (user.resetOTPExpiry < new Date()) {
            return res.status(400).send("OTP Expired");
        }

        if (!validator.isStrongPassword(newPassword)) {
            return res.status(400).send("Weak Password");
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;

        user.resetOTP = undefined;
        user.resetOTPExpiry = undefined;

        await user.save();

        res.send("Password Updated Successfully");

    } catch (err) {

        res.status(500).send(err.message);

    }

});

module.exports = ProfileRouter;

