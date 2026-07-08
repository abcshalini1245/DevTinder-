const mongoose = require("mongoose");
const { Schema } = mongoose;



const connectionRequestSchema = new Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", //referencing the User model
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", //referencing the User model
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "ignored", "interested", "accepted", "rejected"],
        message: `{VALUE} is incorrect status type`,
        // {VALUE} → A special Mongoose placeholder that is automatically replaced with the invalid value provided by the user.
        //enum means that the value of the status field can only be one of the values specified in the enum array. If a value is provided that is not in the enum array, Mongoose will throw a validation error and the message specified in the message property will be returned to the user.
      },
      required: true,
    },
  },
  { timestamps: true }
);

// Creating index
connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 });

// pre save is a middleware that is executed before saving a document to the database. It is used to perform some operations or validations before the document is saved. In this case, it is used to check if the fromUserId and toUserId are the same, and if they are, it throws an error.
connectionRequestSchema.pre("save", async function () {
  // checking if fromUserId is same as toUserId

  if (this.fromUserId.equals(this.toUserId)) {
    throw new Error("You Could not send request to yourself");
  }

//   next();
});

const ConnectionRequest = new mongoose.model(
  "ConnectionRequest",
  connectionRequestSchema
);



module.exports = ConnectionRequest;