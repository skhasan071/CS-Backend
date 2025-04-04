import express from "express";
import User from "../models/user.js";
import Otp from "../models/otp-verification.js";
import College from "../models/colleges.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const sendVerificationEmail = (userEmail, verificationToken) => {

    const transporter = nodemailer.createTransport({
        secure: true,
        port: 465,
        host: "smtp.gmail.com",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASS,
        }
    })
  
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: 'Email Verification',
      text: `Your Email Verification Code is ${verificationToken}`,
    };
  
    return transporter.sendMail(mailOptions);
};

// Register Route
router.post("/auth/register", async (req, res) => {

    try {

        const { name, email, password, state, city, phNo, userClass, file, isEmailVerified} = req.body;
        
        // Check if user exists
        let user = await User.findOne({ email });
        if (user && user.isEmailVerified) return res.status(400).json({ msg: "Error: User already exists" });

        user = new User({ name, email, password, state, city, phNo, userClass, file, isEmailVerified});
        await user.save().then(()=>{
            res.status(200).json({msg: "Registration Successful"})
        });
        
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: error.message });
    }
});

// Login Route
router.post("/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check user
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: "Invalid credentials" });

        if(password == user.password){

            if(!user.isEmailVerified) return res.status(400).json({msg : "Verify Email First"});

            res.status(200).json({msg : "Logged In Successfully"})
        }else{
            res.status(400).json({msg : "Incorrect Password"})
        }

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/auth/profile/:email', async (req, res) => {

    try{
        
        const {email} = req.params;

        const user  = await User.findOne({email});

        if (!user) return res.status(404).json({ msg: "User Not found" });

        return res.status(200).json({name:user.name, pass: user.password, email: user.email, state: user.state, city: user.city, userClass: user.userClass, phNo: user.phNo, isEmailVerified: user.isEmailVerified, file: user.file});

    }catch (err){
        res.status(500).json({error: err.message})
    }

});

router.get('/auth/getUsers', async (req, res) => {

    try{

        const users  = await User.find();

        if (!users) return res.status(404).json([]);

        let usersData = [];

        users.forEach(user => {
            usersData.push({name:user.name, pass: user.password, email: user.email, state: user.state, city: user.city, userClass: user.userClass, phNo: user.phNo, isEmailVerified: user.isEmailVerified, file: user.file});
        });

        return res.status(200).json(usersData);

    }catch (err){
        res.status(500).json({error: err.message})
    }

});

router.get('/auth/verify-otp/:otp/:email', async (req, res) => {
    const { otp, email } = req.params;

    try {
        // Find OTP entry
        const user = await Otp.findOne({ email: email, otp: otp });

        if (!user) {
            return res.status(400).json({ msg: 'Invalid OTP' });
        }

        // Delete OTP after verification
        await Otp.deleteOne({ email: email });

        return res.status(200).json({ msg: "Verification Done" });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

router.get('/auth/getOtp/:email', async (req, res)=>{

    const {email} = req.params;

    try{

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        const model = new Otp({email: email, otp: otp});

        await model.save().then(()=>{
            sendVerificationEmail(email, otp).then(()=>{
                res.status(200).json({msg: "OTP sent successfully, check your mail to verify"})
            }).catch((err)=>{
                console.error('Error sending OTP:', err);
                res.status(500).send('OTP NOT SENT.');
            })
        })

    }catch (err) {
        res.status(500).json({err: "Error Message: "  + err.message});
    }

});

// Fetch all users' file URLs
router.get('/auth/getAllUrls', async (req, res) => {
    try {
        const users = await User.find({}, 'name email url');  // Fetch name, email, and url fields only
        if (!users) {
            return res.status(404).json({ msg: "No users found" });
        }
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/getAllSchools', async (req, res) => {

    try{

        const colleges = await College.find();

        if(!colleges) return res.status(404).json({error: "No Colleges Found"});

        res.status(200).json(colleges);

    }catch(err){
        res.status(500).json({error: err.message});
    }
    
})

router.put('/colleges/:id', async (req, res) => {
    try {
      const collegeId = req.params.id;
      const updateData = req.body;
  
      const updatedCollege = await College.findByIdAndUpdate(
        collegeId,
        updateData,
        { new: true, runValidators: true }
      );
      if (!updatedCollege) {
        return res.status(404).json({ message: 'College not found' });
      }
  
      res.status(200).json({
        message: 'Update successful',
        data: updatedCollege
      });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
      }
    }
);

export default router;