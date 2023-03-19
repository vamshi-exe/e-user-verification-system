import express from "express";
import userDetailsModel from "../models/userDetails.js";
import otpModel from "../models/otp.js";
import Twilio from 'twilio';
import dotenv from 'dotenv';
dotenv.config();
const router = express.Router();import UserDataArtifact from "../../build/contracts/UserData.json" assert { type: "json" };
import Web3 from 'web3'
const provider = new Web3.providers.HttpProvider("HTTP://127.0.0.1:7545");
const web3 = new Web3(provider);
let UserData = new web3.eth.Contract(UserDataArtifact.abi,UserDataArtifact.networks['5777'].address)



const getData = async ()=>{
    // const todoList = await UserData.deployed();
    // const taskCount = await UserData.methods;
    console.log('====================================');
    UserData.methods.userCount().call().then((res)=>{
        console.log(res);
    });
    // UserData.methods.addUser("bot","123").send({from:"0x96f4f3b7A9d38c71BF8eE5c9808261233A92db3a",gas:300000}).then((res)=>{
    //     console.log(res);
    // });
    UserData.methods.getUser("123").call().then((res)=>{
        console.log(res);
    });
    console.log('====================================');
}


router.post('/verify-user',async (req,res)=>{
    const {adhaarNumber} = req.body;

    console.log(adhaarNumber);
    const user = await userDetailsModel.findOne({
        adhaarNumber:adhaarNumber
    });

    if(user){
        const adhaarNumber = user.adhaarNumber;
        const firstname = user.firstname
        const middlename = user.middlename
        const lastname = user.lastname
        const dob = user.dob
        const address_1 = user.address_1
        const address_2 = user.address_2
        const contactNo = user.contactNo
        const pincode = user.pincode

        UserData.methods.addUser(adhaarNumber,firstname,middlename,lastname,dob,address_1,address_2,contactNo,pincode,"dummy profile url ").send({from:"0x96f4f3b7A9d38c71BF8eE5c9808261233A92db3a",gas:300000}).then(async (res)=>{
            user.isVerified = true;
            await user.save();
            console.log(res);
            res.json({"status":200,"message":"User verified successfully"});
        }).catch((err)=>{
            console.log("error while adding data to the blockchain ",err);
            res.json({"status":401,"message":"Some error occured"});
        });
    }
});




// UserData.methods.getUser(adhaarNumber).call().then((res)=>{
//     console.log(res);
// });

// const client = new Twilio(process.env.accountSid, process.env.authToken);
const client = new Twilio('AC1f4a33e93ebd6884cc06fbe660a4e741',"d42be250d6f1ba9534946d9ac3e62865");

const sendOTP = async (number) =>{
    console.log("sending sms to : ",number)
    const randomOtp = Math.floor(100000 + Math.random() * 900000);

    client.messages.create({
        body: `Your E-verification OTP is ${randomOtp}. OTP will expire in 5 minutes.`,
        // from: process.env.senderContact,
        from: "+15747667525",
        to: "\+91"+number
    }).then(async (message) => {
        console.log("otp sent successfull with id : " , message.sid);
        // Save the OTP in a database 
        const otp = new otpModel({
            contactNo:number,
            otp:randomOtp
        });

        await otp.save();
        return true;

    }).catch(error =>{
        console.error(error)
        return false;
    });
        
}


router.post("/register",async (req,res)=>{
    /*
        1) while registering the user will upload the data which will contain his data along with adharnumber and phonenumber
        2) we will check if the adharumber is valid and it is authentic and then we will check that it is not regstered already
        3) then if the adharnumber is not already registerd we can send an otp to the uses mob no and we will authenticate the user 
        4) if the user enters correct otp then we can store the data of the user in DB and can maintain the user authentication data (adharnumber will be unique identifier of the user)
        5) now the user is successfully registered

    */
   
    // store the users data in mongodb

    const data = req.body;
    console.log(data);

    const {adhaarNumber,firstname,middlename,lastname,dob,add1,add2,pincode,country,state,adharpic,userpic,phoneNumber} = data;
    
    const entry = new userDetailsModel({
        adhaarNumber:adhaarNumber,
        firstname:firstname,
        middlename:middlename,
        lastname:lastname,
        dob:dob,
        address_1:add1,
        address_2:add2,
        contactNo:phoneNumber,
        pincode:pincode,
        // country:country,
        // state:state
    });

    await entry.save().then(async(res)=>{
        console.log("data saved successfully");
        // await sendOTP(phoneNumber);
    });
    
    res.json({"status":201,"message":"User registered successfully"});
});




router.post("/otp/verify",async (req,res)=>{
    // return if the otp is correct on not 

    const {otp,adhaarNumber} = req.body;

    // once the frontend is readty check if the contact number is getting correctly
    const user = await userDetailsModel.find({
        adhaarNumber:adhaarNumber
    });

    const contactNo = user[0]?.contactNo;

    const data = await otpModel.find({
        'contactNo':contactNo
    });
    
    const dbOtp = data[0]?.otp;
    if(dbOtp === otp){
        
        res.json({
            statusCode:200,
            data:user, // set this in frontend if unable to persist the previous adhar input
            messgae:"Otp verified"
        });

    }else{
        res.json({
            statusCode:401,
            message:"Invalid Otp"
        });
    }
});




router.post("/login",async (req,res)=>{
    /*

    1) for login the user will give his/her adhar number
    2) we will check if the user exists based on the adhar number
    3) if it exixts then we can send the otp on the users mobile number 
    4) if the user enters valid otp then we can login the user

    */
    // store the users data in mongodb

    const {adhaarNumber} = req.body;
    const user = await userDetailsModel.find({
        adhaarNumber:adhaarNumber
    });

    if(!user){
        res.json({
            statusCode:401,
            message:"User not found"
        });
    }
    
    const OtpStatus = await sendOTP(user[0]?.contactNo);
    console.log(OtpStatus)
    if(OtpStatus){
        res.json({
            statusCode:200,
            message:"OTP sent successfully"
        })
    }else{
        res.json({
            statusCode:401,
            message:"Failed to send otp"
        });
    }
});


// router.get("/check",(req,res) => {
//     userDetailsModel.find().then((res)=>{
//         console.log(res);
//     }).catch((err)=>{
//         console.log(err);
//     });

// });




router.get('/unverified-users',async (req,res)=>{
    
    const users = await userDetailsModel.find({
        isVerified:false
    })
    res.json(users);
});


export default router;
