import './App.css';
import React,{useState,useEffect} from 'react';
import UserDetails from './UserDetails';
import io from 'socket.io-client'
import {QRCode} from "react-qrcode-logo";

const id = crypto.randomUUID();

function App() {

  const [qrActive,setQrActive] = useState(true);
  const [userData,setUserData] = useState(null);
  const [socket,setSocket] = useState(null);

  useEffect(()=>{
      if(typeof socket === typeof null){
        var sc = io("http://localhost:5000",{autoConnect:true,auth: {
                UID: id
            }
        });
        setSocket(sc);
      }
  },[]);
 
  
  useEffect(()=>{
    socket?.on('connect',()=>{
      console.log("socket connection established");
    });
    
    socket?.on("user-scanned",(data)=>{
      setQrActive(false);
      setUserData(data);
      console.log(data);
    });
  },[socket]);


  const getQr = ()=>{
    return (
      <div className='qr-scanner'>
            <h3>Please Scan the QR code to verify</h3>
            <QRCode value={id}/>  
      </div>
    )  
  }


  return (
    <div className="App">
      <h1>E - User Verification </h1>
        {qrActive ? getQr() : (<UserDetails userData={userData} />)}
    </div>
  );
}


export default App;
