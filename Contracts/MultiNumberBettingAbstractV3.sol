//
// Simple betting smart contract from Section 7 (Ethereum Smart Contract Development Using Solidity) Coding
// Exercise 7 (Events)
//    
//    https://www.udemy.com/ethereum-dapp/learn/v4/t/lecture/7030598?start=0
//

pragma solidity ^0.4.4;

contract MultiNumberBettingAbstractV3 {
  modifier ownerOnly {
    require(owner == msg.sender);
    _;
  }

  event WinningBet(address indexed winner, string winnerName, uint amount);
  event LosingBet(address indexed loser, string loserName, uint amount);

  address owner;

  uint public loserCount;
  uint public winnerCount;

  // TODO: Will this uatomatically convert to wei? 
  uint constant MAX_BET = 0.0005 ether;
  uint constant MIN_BET = 0.000001 ether;

  uint8[3] nums;

  // Note:Getting compiler warning about 'string winnerName' needing explicit keyword 'storage' but I hit
  //      compiler errors when I attempt to add the keyword.
  struct Winner {
    address address_;
    string name;
    uint8 guessVal;
    uint guessTime;
    uint ethersReceived;
  }

  mapping (address => Winner) winners;

  address public lastWinnerAddress;

  function ownerDeposit() ownerOnly payable public;
  function ownerWithdrawal(uint amount) ownerOnly public;
  function guess(uint8 guessVal, string name) payable public returns (bool);
  function getLastWinnerInfo() public returns (address address_, string name, uint guessTime, uint ethersReceived);
  function checkWinning(address address_) public returns (address retAddress, string name, uint8 guessVal, uint guessTime, uint ethersReceived);
  function totalGuesses() public returns (uint);
  function lastWinnerDays() public returns (uint);
  function lastWinnerHours() public returns (uint);
  function lastWinnerMinutes() public returns (uint);
}