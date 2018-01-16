var MultiNumberBettingV3 = artifacts.require("./MultiNumberBettingV3.sol");
var MultiNumberBettingV4 = artifacts.require("./MultiNumberBettingV4.sol");
var MultiNumberBettingV5 = artifacts.require("./MultiNumberBettingV5.sol");
var MultiNumberBettingV6 = artifacts.require("./MultiNumberBettingV6.sol");
var MultiNumberBettingV7 = artifacts.require("./MultiNumberBettingV7.sol");

module.exports = function(deployer) {
  deployer.deploy(MultiNumberBettingV3, 10, 20, 30);
  deployer.deploy(MultiNumberBettingV4, 1, 3, 5);
  deployer.deploy(MultiNumberBettingV5, 1, 3, 5);
  deployer.deploy(MultiNumberBettingV6, 3, 5, 7);
  deployer.deploy(MultiNumberBettingV7, 8, 9, 10);
};
