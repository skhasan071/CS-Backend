import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  phNo: {
    type: String,
    required: true,
  },
  userClass:{
    type: String,
    required: true,
  },
  file:{
    type: String,
    required: true,
  },
  isEmailVerified:{
    type: Boolean,
    required: true,
  }

});

const User = mongoose.model("User", userSchema);

export default User;