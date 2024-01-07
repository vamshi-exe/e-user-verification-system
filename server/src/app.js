import express from "express";
import cors from "cors"
import bodyParser from "body-parser";
import registerRoutes from "./routes/auth.js"
import mongoose from "mongoose"
const app = express();
import { createServer } from 'http';
import { Server } from "socket.io";
import userDetailsModel from "./models/userDetails.js";
const server = createServer(app);
const io = new Server(server, { cors: { origin: '*' } });


// main

app.use(express.json());
app.use(cors({origin:'*',credentials:true}));
app.use(bodyParser.json({limit:"30mb",extended:true}));   //to set the limit of image upload
app.use(bodyParser.urlencoded({limit:"30mb",extended:true}));

// define routes
app.use("/api/auth",registerRoutes);

app.post('/api/verify-scan',async (req,res)=>{
    const {id,adhaarnumber} = req;
    if(!adhaarnumber || !id) return res.json({
        status:400,
        message:"Data not provided"
    })

    console.log("Id : ", id + " adhaar : ",adhaarnumber);
    // insted of geting the data from database get it from the blockchain
    const user = await userDetailsModel.find({adhaarNumber:adharnumber});
    io.to(id).emit('user-scanned',user[0]);
    res.json({
        status:200,
        message:"User Scanned Success"
    });
});



io.on('connection', (socket) => {
    socket.join(socket.handshake.auth.UID);
    // if()
    console.log('User with id ', socket.id , " ",socket.handshake.auth.UID , " connected !");
    socket.on('disconnect', () => {
      console.log('Disconnected');
    });
});      


const PORT = 5000;

// const CONNECTION_URL = 'mongodb+srv://temp:temp123@cluster0.3fkx0wm.mongodb.net/project-db?retryWrites=true&w=majority'

const CONNECTION_URL = 'mongodb+srv://vvadnala5:vamshi123@cluster0.2iuiyqq.mongodb.net/?retryWrites=true&w=majority'
// const CONNECTION_URL = 'mongodb+srv://vismay:password1111@cluster0.3fkx0wm.mongodb.net/project-db?retryWrites=true&w=majority'
mongoose.set('strictQuery', false);

const main = async () =>{

    try{

        mongoose.connect(CONNECTION_URL,{useNewUrlParser:true,useUnifiedTopology:true}).then(()=>{
        console.log("connected to database")
        server.listen(PORT,()=>{
            console.log(`server running on port : ${PORT}`);
        })}).catch((err)=>console.log(err));
    
    }catch(err){
        console.log(err);
        console.log("Some error occured while starting  the server")
        process.exit();
    }
}

main().catch(console.error);

