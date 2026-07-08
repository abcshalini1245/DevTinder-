
const mongoose = require('mongoose');
const validator = require('validator'); //importing the validator library to validate email and other fields
const bcrypt = require('bcrypt'); //importing the bcrypt library to hash the password
const JWT = require('jsonwebtoken');    
const secretKey = "mysecretkey"; //secret key to sign the token



const userSchema = new mongoose.Schema({
    firstName: {            
        type: String,
        required: true, //first name is required
        minlength: 4, //minimum length of first name is 4
        maxlength: 20, //maximum length of first name is 20
    },
    lastName: {
        type: String,
    },      
    emailId: {
        type: String,
        required: true, //email is required
        unique: true, //email should be unique
        lowercase: true, //email should be in lowercase
        validate: {
            validator: (v) => validator.isEmail(v),
            message: "Please enter a valid email"
        }
    },      
    password: {
        type: String,  
        required: true, //password is required  
         validate: {
            validator: (v) => validator.isLength(v, { min: 6 }),
            message: "Password must be at least 6 characters long"
        }     
    },
    age: {
        type: Number,
        min: 18, //minimum age is 18
        default:20,
    },
    gender: {
        type: String,
        validate(x){
            if(!["male", "female", "other"].includes(x)){
                throw new Error("Gender should be male, female or   others"); //    
            }
        }
        // enum: ['male', 'female', 'other'], //only these values are allowed
    },  
    photourl:{
        type: String,
        default: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
         validate: {
            validator: (v) => validator.isURL(v),
            message: "Please enter a valid URL"
        }
    },
    about:{
        type: String,
        default: "Hey there! I am using DevTindeer",
    },
    skills: {
        type: [String],
    },
    resetOTP: {
    type: String,
},

    resetOTPExpiry: {
    type: Date,
},

company: {
  type: String,
  trim: true,
  maxlength: 100,
  default: "",
},

education: {
  type: String,
  trim: true,
  maxlength: 150,
  default: "",
},

experience: {
  type: String,
  trim: true,
  maxlength: 150,
  default: "",
},


location: {
  type: String,
  trim: true,
  maxlength: 100,
  default: "",
},

github: {
  type: String,
  trim: true,
  lowercase: true,
  validate(value) {
    if (value && !value.startsWith("https://github.com/")) {
      throw new Error("Please enter a valid GitHub URL");
    }
  },
  default: "",
},

linkedin: {
  type: String,
  trim: true,
  lowercase: true,
  validate(value) {
    if (value && !value.startsWith("https://www.linkedin.com/")) {
      throw new Error("Please enter a valid LinkedIn URL");
    }
  },
  default: "",
},

portfolio: {
  type: String,
  trim: true,
  validate(value) {
    if (
      value &&
      !/^https?:\/\/.+/i.test(value)
    ) {
      throw new Error("Please enter a valid Portfolio URL");
    }
  },
  default: "",
},
},
    {timestamps: true} //to get createdAt and updatedAt fields
)


userSchema.methods.getJWT = async function() {
    return await JWT.sign({ _id: this._id}, secretKey, { expiresIn: '1d' }); //creating a token for the user
}



userSchema.methods.validatePassword = async function(password) {
    return await bcrypt.compare(password, this.password); //comparing the password
}   



const User = mongoose.model("User", userSchema);   //name of model,schema to be used for that model


module.exports = User;    
