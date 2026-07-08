
const mongoose = require('mongoose');


// Connect to MongoDB
const connectDB = async () => {         
await mongoose.connect("mongodb+srv://namaste_dev:eATyNA8gpS44HVkc@cluster0.dpxtpqp.mongodb.net/?appName=Cluster0");
};

module.exports = connectDB;




 
