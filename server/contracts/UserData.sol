// SPDX-License-Identifier: MIT 
pragma solidity >=0.4.22 <0.9.0;

contract UserData{
 
    // data to be stored
    struct User{
        string adhaarNumber;
        string firstname;
        string middlename;
        string lastname;
        string dob;
        string address_1;
        string address_2;
        string contactNo;
        string pincode;
        string profile_pic;
        string adhaar_pic;
        string isVerified;
    }

    // mappping in key value pair
    mapping(string => User) public users;

    // count of users
    uint public userCount = 0;

    function addUser(string memory _adhaarNumber,string memory _firstname,string memory _middlename,string memory _lastname,string memory _dob,string memory _address_1,string memory _address_2,string memory _contactNo,string memory _pincode,string memory profile_pic,string memory adhaar_pic) external {
        userCount++;
        users[_adhaarNumber] = User(_adhaarNumber,_firstname,_middlename,_lastname,_dob,_address_1,_address_2,_contactNo,_pincode,profile_pic,adhaar_pic,'true');
    }
    
    function updateUser(string memory _adhaarNumber,string memory _firstname,string memory _middlename,string memory _lastname,string memory _dob,string memory _address_1,string memory _address_2,string memory _contactNo,string memory _pincode,string memory profile_pic,string memory adhaar_pic) external {
        users[_adhaarNumber] = User(_adhaarNumber,_firstname,_middlename,_lastname,_dob,_address_1,_address_2,_contactNo,_pincode,profile_pic,adhaar_pic,'true');
    }

    function getUser(string memory _adhaarNo) public view returns (string memory,string memory,string memory,string memory,string memory,string memory,string memory,string memory,string memory,string memory,string memory,string memory) {
        User storage userData = users[_adhaarNo];
        return ( userData.adhaarNumber, userData.firstname, userData.middlename,  userData.lastname, userData.dob, userData.address_1, userData.address_2,userData.contactNo, userData.pincode, userData.profile_pic,userData.adhaar_pic,userData.isVerified);
    }
}
