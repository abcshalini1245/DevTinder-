
require("dotenv").config();
const express = require('express');
const cors = require('cors');


const connectDB = require('./config/database'); //importing the database connection   

const app = express(); //instance of express js applcation



app.use(cors({
    origin: process.env.FRONTEND_URL, //whitelisting origin domain name
    credentials: true,
})); //used as a middleware

const User = require('./models/user'); //importing the user model

app.use(express.json()); //middleware to parse incoming JSON requests  
const { validateSignUpData } = require('./utils/validation'); //importing the validation function 
const bcrypt = require('bcrypt'); //importing the bcrypt library to hash the password
const JWT = require('jsonwebtoken'); //importing the jsonwebtoken library to create a token
const secretKey = "mysecretkey"; //secret   key to sign the token
const cookieParser = require('cookie-parser'); //importing the cookie-parser library to parse the cookies
app.use(cookieParser()); //middleware to parse the cookies
const userAuth = require('./middlewares/auth'); //importing the user authentication middleware  





//importing the routes

const authRouter = require('./routes/auth'); //importing the auth routes
const requestRouter = require('./routes/request');  
const profileRouter = require('./routes/profile'); //importing the profile routes
const userRouter = require('./routes/user'); //importing the user routes

//using the routes

// app.use('/', authRouter); 
// app.use('/', requestRouter); 
// app.use('/', profileRouter);
// app.use('/', userRouter);


app.use("/api", authRouter);
app.use("/api", requestRouter);
app.use("/api", profileRouter);
app.use("/api", userRouter);

    
connectDB().then(() => {
    console.log("Connected to MongoDB");
    app.listen(7777,()=>{
    console.log("server is running on port 7777");
});
})
.catch((err) => {
    console.error("Error connecting to MongoDB:", err);
});






// Middleware 2: Authorization Check
//Handle user authentication for all admin routes using middlewares
// app.use("/admin", (req, res, next) => {
//     const token = "999";
//     const isAuthorizedAdmin = token === "999";
//     if (!isAuthorizedAdmin) {
//         res.status(401).send("Unauthorized Admin")
//     } else {
//         next();
//     }
// })
// app.get("/admin/getAllData", (req, res) => {
//     res.send("All data Generated")
// })
// app.get("/admin/deleteData", (req, res) => {
//     res.send("Data Deleted")
// })



// // URL: /userData?userId=103&password=1234
// // Query parameters are key-value pairs appended to the URL after the ?. They are used to pass data to the server.
// // Output: getting the data of {"userId":"103","password":"1234"}
// app.get("/userData", (req, res) => {
//   console.log(req.query); //{"userId":"103","password":"1234"}
//   res.send(`getting the data of ${JSON.stringify(req.query)}`);
// });

// app.get("/user", (req, res) => {
//   res.send({
//     uid: 101,
//     fname: "Vishesh",
//     lname: "",
//   });
// });



// // dynamic routing

// app.get("/userProfile/:userId/:collageId", (req, res) => {
//   console.log(req.params);
//   res.send(`showing the profile of ${JSON.stringify(req.params)}`);
// });

// //only handle get request
// app.get("/user", (req, res) => {
//     res.send("Hello World, I m Shalini"); //respond
// });

// //bc is optional
// app.get(/^\/a(bc)?d$/, (req, res) => {
//     res.send("Hello World");
// });


// //it should be start with ab,end with cd and can have anything in between.
// app.get(/^\/ab.*cd$/, (req, res) => {
//     res.send("Hello World");
// });


// //any number of b from 0 to many will be handled by this api
// app.get(/^\/ab+c$/, (req, res) => {
//     res.send("Hello World");
// });

// //only handle get request
// //now b because of ? it will handle both abc and ac. b is optional
// app.get(/^\/ab?c$/, (req, res) => {
//     res.send("Hello World");
// });

// //handle post request
// app.post("/user", (req, res) => {
//     res.send("Hello World, I m Shalini and this is post request"); //respond
// });

// //it will run for every request ,all kind of api request
// app.use("/test", (req, res) => {
//     res.send("Request is testing"); //respond
// });

// app.use("/Hello",(req, res) => {
//     res.send("Hello Hello Hello"); //respond
// });

// app.use("/", (req, res) => {
//     res.send("Request received 2"); //respond
// });


// app.use((req, res) => {
//     res.send("Request received"); //respond
// });


