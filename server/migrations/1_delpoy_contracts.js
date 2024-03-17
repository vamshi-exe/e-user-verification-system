const UserData = artifacts.require('../contracts/UserData.sol');


module.exports = function(deployer){
    deployer.deploy(UserData);
}

