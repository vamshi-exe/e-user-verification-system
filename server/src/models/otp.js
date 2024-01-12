import mongoose from 'mongoose';


// this is our database model

const otpSchema = mongoose.Schema({
    contactNo:{
        type:String,
        required:true
    },
    otp:{
        type:String,
        required:true
    },
    createdAt:{
        type: Date,
        default: Date.now,
        index:{expires:300} // it will automatically get deleted after 5 mins
    }
});


const otpModel = mongoose.model('Otp',otpSchema);


export default otpModel;