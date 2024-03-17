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



const GANACHE_ADDRESS = "0x10157065EffE466da72971451dD5d2465a6F2B92"

const getData = async ()=>{
    // const todoList = await UserData.deployed();
    // const taskCount = await UserData.methods;
    console.log('====================================');
    UserData.methods.userCount().call().then((res)=>{
        console.log("user count : " ,res);
    });
    // UserData.methods.addUser("bot","123").send({from:"0x96f4f3b7A9d38c71BF8eE5c9808261233A92db3a",gas:300000}).then((res)=>{
    //     console.log(res);
    // });
    UserData.methods.getUser("123").call().then((res)=>{
        console.log(res);
    });
    console.log('====================================');
}

router.get('/getData',async(req,res)=>{
    const{adhaarNumber} = req.query;

    try{
        const data = await userDetailsModel.findOne({adhaarNumber});
        if (!data) {
            return res.status(404).json({ error: 'Data not found' });
          }
          res.json(data);

    } catch(error){
        console.error('Error:', error);
        res.status(500).json({error:'Internal Server Error'});
    }

});

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
        const profile_pic = user.user_image
        const adhaar_pic = user.adhaar_image;

        UserData.methods.addUser(adhaarNumber,firstname,middlename,lastname,dob,address_1,address_2,contactNo,pincode,profile_pic,adhaar_pic).send({from:GANACHE_ADDRESS,gas:100000}).then(async (res)=>{
            user.isVerified = true;
            await user.save();
            console.log(res);
        }).then(()=>{
            res.json({"status":200,"message":"User verified successfully"});
        }).catch((err)=>{
            console.log("error while adding data to the blockchain ",err);
            res.json({"status":401,"message":"Some error occured"});
        });

        // res.json({"status":200,"message":"User verified successfully"});

    }
});




// UserData.methods.getUser(adhaarNumber).call().then((res)=>{
//     console.log(res);
// });

// const client = new Twilio(process.env.accountSid, process.env.authToken);
const client = new Twilio('AC934c51de0468383fe8be51a48b0a37f6',"08ae925955422d1c2ddeef0673fc1838");
const sendOTP = async (number) => {
    console.log("sending sms to : ", number)
    const randomOtp = Math.floor(100000 + Math.random() * 900000);

    try {
        const message = await client.messages.create({
            body: `Your E-verification OTP is ${randomOtp}. OTP will expire in 5 minutes.`,
            // twilio phone number
            from: "+12015716037",
            to: "\+91" + number
        });

        console.log("otp sent successfully with id : ", message.sid);

        const otp = new otpModel({
            contactNo: number,
            otp: randomOtp
        });

        await otp.save();
        return true;
    } catch (error) {
        console.error("Error sending OTP:", error);
        return false;
    }
}


// const sendOTP = async (number) =>{
//     console.log("sending sms to : ",number)
//     const randomOtp = Math.floor(100000 + Math.random() * 900000);

//     client.messages.create({
//         body: `Your E-verification OTP is ${randomOtp}. OTP will expire in 5 minutes.`,
//         // from: process.env.senderContact,
//         from: "+12015716037",
//         to: "\+91"+number
//     }).then(async (message) => {
//         console.log("otp sent successfull with id : " , message.sid);
//         // console.log(statusCode)
//         // Save the OTP in a database 
//         const otp = new otpModel({
//             contactNo:number,
//             otp:randomOtp
//         });

//         await otp.save();
//         return true;

//     }).catch(error =>{
//         console.error(error)
//         return false;
//     });
        
// }


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

    // const {adhaarNumber,firstname,middlename,lastname,dob,add1,add2,pincode,country,state,adharpic,userpic,phoneNumber} = data;
    const {adhaarNumber,firstname,middlename,lastname,dob,add1,add2,pincode,country,state,adhaarImage,userImage,phoneNumber} = data;

    
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
        adhaar_image:adhaarImage,
        user_image:userImage,
        country:country,
        state:state
    });

    await userDetailsModel.find({}).then((res)=>{
        console.log(res);
    })

    await entry.save().then(async(res)=>{
        console.log("data saved successfully");
        // await sendOTP(phoneNumber);
    });
    
    res.json({"status":201,"message":"User registered successfully"});
});

// router.use(bodyParser.json());
router.post("/otp/verify", async (req, res) => {
    // Return if the OTP is correct or not
    const { otp, adhaarNumber } = req.body;
    console.log("Request body:", req.body);

    // Fetch user based on Aadhar number
    const user = await userDetailsModel.findOne({
        adhaarNumber: adhaarNumber,
    });

    const contactNo = user?.contactNo;
    console.log("Contact number:", contactNo);

    // Fetch OTP data based on the contact number
    const otpData = await otpModel.findOne({
        contactNo: contactNo,
    });
    
    console.log("OTP data:", otpData);

    if (otpData) {
        const dbOtp = otpData.otp;
        console.log("Database OTP:", dbOtp);

        // Compare the provided OTP with the one in the database
        if (dbOtp === otp) {
            res.status(200).json({
                // statusCode: 200,
                data: user,
                message: "OTP verified",
            });
        } else {
            console.log("Invalid OTP");
            res.status(401).json({
                // statusCode: 401,
                message: "Invalid OTP",
            });
        }
    } else {
        console.log("No OTP data found for the contact number:", contactNo);
        res.status(401).json({
            statusCode: 401,
            message: "Invalid contact number or OTP data not found",
        });
    }
});


// router.post("/otp/verify",async (req,res)=>{
//     // return if the otp is correct on not 

//     const {otp,adhaarNumber} = req.body;
//     console.log(req.body)

//     // once the frontend is readty check if the contact number is getting correctly
//     const user = await userDetailsModel.find({
//         AdhaarNumber:adhaarNumber,
//     });

//     const contactNo = user[0]?.contactNo;
//     console.log(contactNo)

//     const data = await otpModel.findOne({
//         'contactNo':contactNo
//     });
    
//     const dbOtp = data[0]?.otp;
//     console.log(`dbOtp: ${dbOtp}`)
//     console.log(`Otp: ${otp}`)
//     if(dbOtp === otp ){
//         console.log(`this otp from if block ${JSON.stringify(dbOtp)}  ${JSON.stringify(otp)}`)
//         res.status(200).json({
//             statusCode:200,
//             data:user, // set this in frontend if unable to persist the previous adhar input
//             messgae:"Otp verified"
//         });
//     }
//     else{
        
//         console.log(`this otp from db ${JSON.stringify(dbOtp)}  ${(otp)}`)
//         res.status(401).json({
//             statusCode:401,
//             message:"Invalid Otp"
//         });

//     }
// });






// router.post("/login",async (req,res)=>{
    
//     /*

//     1) for login the user will give his/her adhar number
//     2) we will check if the user exists based on the adhar number
//     3) if it exixts then we can send the otp on the users mobile number 
//     4) if the user enters valid otp then we can login the user

//     */
//     // store the users data in mongodb

//     const {adhaarNumber} = req.body;
//     const user = await userDetailsModel.find({
//         adhaarNumber:adhaarNumber
//     });


//     if(!user){
//         res.json({
//             statusCode:401,
//             message:"User not found"
//         });
//     }
    
//     const OtpStatus = await sendOTP(user[0]?.contactNo);
//     console.log(OtpStatus)
//     if(OtpStatus === 200){
//         res.json({
//             statusCode:200,
//             message:"OTP sent successfully"
//         })
//     }else{
//         console.log(`this is otp status: ${OtpStatus}`)
//         res.json({
//             statusCode:401,
//             message:"Failed to send otp"
//         });
//     }
// },
// );
router.post("/login", async (req, res) => {
    const { adhaarNumber } = req.body;
    const user = await userDetailsModel.find({
        adhaarNumber: adhaarNumber
    });

    if (!user) {
        res.status(401).json({
            statusCode: 401,
            message: "User not found"
        });
    }

    try {
        const OtpStatus = await sendOTP(user[0]?.contactNo);
        console.log(OtpStatus);

        if (OtpStatus === true) {
            res.status(200).json({
                statusCode: 200,
                message: "OTP sent successfully"
            });
        } else {
            console.log("Failed to send OTP");
            res.status(401).json({
                statusCode: 401,
                message: "Failed to send OTP"
            });
        }
    } catch (error) {
        console.error("Error sending OTP:", error);
        res.status(500).json({
            statusCode: 500,
            message: "Internal Server Error"
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
        // isVerified:false 
    })
    res.json(users);
});

router.get('/check',async (req,res)=>{
    // await userDetailsModel.find({}).then((res)=>{
    //     console.log(res);
    // });

    UserData.methods.getUser("123456789123").call().then((res)=>{
        console.log(res);
    });

    res.send("done")
});

export default router;
//change the module type to common then then truffle compile then truffle migrate
