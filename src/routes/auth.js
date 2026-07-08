const express = require('express'); //importing the express library
const authRouter = express.Router(); 
const { validateSignUpData } = require('../utils/validation'); //importing the validation function
const bcrypt = require('bcrypt');   
const User = require('../models/user'); //importing the user model
const JWT = require('jsonwebtoken'); //importing the jsonwebtoken library to create a token
const secretKey = "mysecretkey"; //secret key to sign the token
const cookieParser = require('cookie-parser'); //importing the cookie-parser library to parse the cookies
authRouter.use(cookieParser()); //using the cookie-parser middleware
const userAuth = require('../middlewares/auth'); //importing the user authentication middleware



authRouter.post("/signup",async(req,res)=>{
    // console.log(req.body);
    //Handle signup logic here
    
    // const user = new User({
    //     // firstName: "Vishesh",
    //     firstName: "Mohit",
    //     lastName: "Sharma",
    //     emailId: "mohit@gmaill.com",
    //     password: "1234",
    //     age: 24,    

    // });

    try{
        validateSignUpData(req); //validating the signup data
    const user = new User(req.body);
    const passwordHashed = await bcrypt.hash(user.password, 10); //hashing the password
    user.password = passwordHashed; //replacing the plain password with hashed password
    
    const savedUser = await user.save(); //saving the user to the database
    //create a session or token for the user and send it to the client
     const token = await savedUser.getJWT() ;
    //  JWT.sign({ _id: user._id}, secretKey, { expiresIn: '1d' }); //creating a token for the user
     res.cookie('token', token, 
        // {httpOnly: true}
        {expires: new Date(Date.now() + 24 * 60 * 60 * 1000)}
        ); //setting the token in the cookie
    res.json( {message: "User signed up successfully", data: savedUser} ); //responding to the client
    }catch(err){
        res.status(500).send(err.message);          
    }
    

});


authRouter.post("/login", async (req, res) => {
   
    try{
     const { emailId, password } = req.body; //getting the emailId and password from the request body
     const user = await User.findOne({ emailId }); //finding the user by emailId
     if (!user) {
         return res.status(404).send("User not found"); //if user not found
     }
     const isMatch = await user.validatePassword(password); //validating the password using the method defined in the user model
    //  bcrypt.compare(password, user.password); //comparing the password
     if (!isMatch) {
         return res.status(401).send("Invalid credentials"); //if password doesn't match
     }
     //create a session or token for the user and send it to the client
     const token = await user.getJWT() ;
    //  JWT.sign({ _id: user._id}, secretKey, { expiresIn: '1d' }); //creating a token for the user
     res.cookie('token', token, 
        // {httpOnly: true}
        {expires: new Date(Date.now() + 24 * 60 * 60 * 1000)}
        ); //setting the token in the cookie
     res.send(user); //if login is successful         

    }
    catch(err){
        res.status(500).send(err.message);          
    }
});


authRouter.post("/logout",  async (req, res) => {
    try{
        res.clearCookie("token"); //clearing the token from the cookie  
        res.send("Logout successful"); //responding to the client   
        
        // res.cookie('token', '', { expires: new Date(0) }); //clearing the token from the cookie
        // res.send("Logout successful"); //responding to the client   
    }
    catch(err){
        res.status(500).send(err.message);          
    }       
});


module.exports = authRouter; //exporting the router to be used in other files
