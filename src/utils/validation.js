const validator = require("validator");

const validateSignUpData = (req) => {
    const { firstName, lastName, emailId, password } = req.body;

    if (!firstName || !lastName) {
        throw new Error("Name is not valid!");
    } 
    else if (!validator.isEmail(emailId)) {
        throw new Error("Email is not valid!");
    } 
    else if (!validator.isStrongPassword(password)) {
        throw new Error("Please enter a strong password!");
    }
};


const validateEditProfileData = (req) => {
    const allowedEditFields = [
  "firstName",
  "lastName",
  "age",
  "gender",
  "about",
  "skills",
  "photourl",
  "company",
  "education",
  "location",
  "github",
  "linkedin",
  "portfolio",
  "experience",
];

    const isAllowed = Object.keys(req.body).every((field) => allowedEditFields.includes(field)); //checking if all the fields in the request body are allowed to be edited
    if (!isAllowed) {
        throw new Error("Invalid fields in the request body");
    }   
    return true; //if all the fields are allowed to be edited   

    

};
module.exports = {
    validateSignUpData, 
    validateEditProfileData
};       
