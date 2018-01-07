//
// Simple betting smart contract from Section 7 (Ethereum Smart Contract Development Using Solidity) Coding
// Exercise 4 (Enum, Mapping, & Struct)
//    
//    https://www.udemy.com/ethereum-dapp/learn/v4/t/lecture/7030576?start=0
//

pragma solidity ^0.4.4;

contract MultiNumberBettingV4 {
  uint public loserCount;
  uint public winnerCount;

  uint8[3] nums;

  // Note:Getting compiler warning about 'string winnerName' needing explicit keyword 'storage' but I hit
  //      compiler errors when I attempt to add the keyword.
  struct Winner {
    address address_;
    string name;
    uint8 guessVal;
    uint guessTime;
  }

  mapping (address => Winner) winners;

  address public lastWinnerAddress;

  function MultiNumberBettingV4(uint8 num1, uint8 num2, uint8 num3) public {
    nums[0] = num1;
    nums[1] = num2;
    nums[2] = num3;
  }

  function guess(uint8 guessVal, string name) public returns (bool) {
    require(guessVal <= 10);

    for (uint i = 0; i < nums.length; i++) {
      if (nums[i] == guessVal) {
        winnerCount++;

        // Obtain reference to Winner instance from mapping and populate it
        Winner storage winner = winners[msg.sender];

        winner.address_ = msg.sender;
        winner.name = name;
        winner.guessVal = guessVal;
        winner.guessTime = now;

        lastWinnerAddress = msg.sender;

        return true;
      }
    }
    loserCount++;
    return false;
  }

  function getLastWinnerInfo() public returns (address address_, string name, uint guessTime) {
    if (winnerCount > 0) {
      address_ = lastWinnerAddress;
      name = winners[lastWinnerAddress].name;
      guessTime = winners[lastWinnerAddress].guessTime;
    }
  }

  function checkWinning(address address_) public returns (address retAddress, string name, uint8 guessVal, uint guessTime) {
    Winner storage winner = winners[address_];
    if (winner.guessTime != 0) {
      retAddress = winner.address_;
      name = winner.name;
      guessVal = winner.guessVal;
      guessTime = winner.guessTime;
    }
  }

  function totalGuesses() public returns (uint) {
    return winnerCount + loserCount;
  }

  function lastWinnerDays() public returns (uint) {
    return winners[lastWinnerAddress].guessTime * 1 days;
  }

  function lastWinnerHours() public returns (uint) {
    return winners[lastWinnerAddress].guessTime * 1 hours;
  }

  function lastWinnerMinutes() public returns (uint) {
    return winners[lastWinnerAddress].guessTime * 1 minutes;
  }
}