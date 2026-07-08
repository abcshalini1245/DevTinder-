const JWT = require("jsonwebtoken");
const User = require("../models/user");
const secretKey = "mysecretkey"; //secret key to sign the token


const userAuth = async (req, res, next) => {
   try{
     const token = req.cookies.token; //getting the token from the cookie
     console.log("Cookies:", req.cookies);
     console.log("Cookie Header:", req.headers.cookie);     
     if(!token){ 
        return res.status(401).send("Unauthorized"); //if no token is found
     }  
     //decoding and validating the token to get the payload back
             const decodedToken = await JWT.verify(token, secretKey); //verifying the token
             const {_id} = decodedToken; //getting the user id from the token
             const user = await User.findById(_id); //finding the user by id
             if(!user){
                 return res.status(404).send("User not found"); //if user not found
             }
             req.user = user; //attaching the user data to the request object
             next(); //calling the next middleware

   } catch (error) {
     console.error("Error in userAuth middleware:", error);
     return res.status(500).send("Internal Server Error");
   }
};

module.exports = userAuth;  
