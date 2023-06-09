import mongoose from 'mongoose';


// this is our database model

const userDetails = mongoose.Schema({
    // other details is to be included
    adhaarNumber:{
        type:String,
        required:false
    },
    firstname:{
        type:String,
        required:false
    },
    middlename:{
        type:String,
        required:false
    },
    lastname:{
        type:String,
        required:false
    },
    dob:{
        type:String,
        required:false
    },
    address_1:{
        type:String,
        required:false
    },  
    address_2:{
        type:String,
        required:false
    },    
    contactNo:{
        type:String,
        required:false // temporary
    },
    pincode:{
        type:String,
        required:false
    },    
    country:{
        type:String,
        required:false
    },
    state:{
        type:String,
        required:false
    },    
    adhaar_image:{
        type:String,
        required:false // temporary
    },
    user_image:{
        type:String,
        required:false // temporary
    },
    isVerified:{
        type:Boolean,
        default:false,
        required:false // temporary
    },
    createdAt:{
        type: Date,
        default: new Date(),
    }
});


const userDetailsModel = mongoose.model('userDetails',userDetails);


export default userDetailsModel;