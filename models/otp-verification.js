import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({

  email: {
    type: String,
    unique: true,
    required: true,
  },
  
  otp:{
    type: String,
    required: false,
  }

});

const Otp = mongoose.model("Otp", otpSchema);

export default Otp;