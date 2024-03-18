// import React from 'react'

// const UserDetails = ({userData}) => {


//   return (
//     <div className='user-details'>
//      <div className='img-holder'>
//         <img src="https://rb.gy/lcvws8"/>
//      </div>

//      <div><h3>Name </h3> : <span> {userData && userData.name} </span></div>
//      <div><h3>ContactNo</h3> : <span>{userData && userData.contact} </span></div>
//      <div><h3>Address </h3> : <span> Dummy address </span></div>
//      <div><h3>Adhaar No</h3> : <span> 887788778877 </span></div>

//     <div className="verification-holder">
//         <span className="user-verified">Verified</span>
//         {/* <span className="user-unverified">unverified</span> */}
//     </div>
//     </div>
//   )
// }

// export default UserDetails;



import React from 'react';

const UserDetails = ({ userData }) => {
  console.log("Received userData:", userData);

  return (
    <div className='user-details'>
      <div className='img-holder'>
        <img src={userData && userData.user_image} alt="User" />
      </div>

      <div><h3>Name </h3> : <span>{`${userData && userData.firstname} ${userData && userData.middlename} ${userData && userData.lastname}`}</span></div>
      <div><h3>ContactNo</h3> : <span>{userData && userData.contactNo}</span></div>
      <div><h3>Address </h3> : <span>{`${userData && userData.address_1}, ${userData && userData.address_2}, ${userData && userData.pincode}, ${userData && userData.state}`}</span></div>
      <div><h3>Adhaar No</h3> : <span>{userData && userData.adhaarNumber}</span></div>

      <div className="verification-holder">
        <span className={userData && userData.isVerified ? "user-verified" : "user-unverified"}>
          {userData && userData.isVerified ? "Verified" : "Unverified"}
        </span>
      </div>
    </div>
  );
};

export default UserDetails;
