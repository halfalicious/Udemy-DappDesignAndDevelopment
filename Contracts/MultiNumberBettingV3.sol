//
// Simple betting smart contract from Section 7 (Ethereum Smart Contract Development Using Solidity)
// Coding Exercise 3 (Global Variables)
//    
//    https://www.udemy.com/ethereum-dapp/learn/v4/t/lecture/7029938?start=0
//

pragma solidity ^0.4.4;

contract MultiNumberBettingV3 {
  uint public loserCount;
  uint public winnerCount;

  uint8[3] nums;

  uint lastWinnerGuessTime;
  string lastWinnerName;
  address public lastWinnerAddress;

  function MultiNumberBettingV3(uint8 num1, uint8 num2, uint8 num3) {
    nums[0] = num1;
    nums[1] = num2;
    nums[2] = num3;
  }

  function guess(uint8 guessVal, string name) returns (bool) {
    require(guessVal <= 10);

    for (uint i = 0; i < nums.length; i++) {
      if (nums[i] == guessVal) {
        winnerCount++;
        lastWinnerName = name;
        lastWinnerGuessTime = now;
        lastWinnerAddress = msg.sender;
        return true;
      }
    }
    loserCount++;
    return false;
  }

  function totalGuesses() returns (uint) {
    return winnerCount + loserCount;
  }

  function getLastWinner() returns (string) {
    // Create var length byte array copy of winner name so we can
    // check length (Solidity doesn't currently support string
    // length checks due to UTF-8 encoding)
    bytes memory bytesLastWinnerName = bytes(lastWinnerName);
      if (bytesLastWinnerName.length > 0) {
        // Create 3-char string return value - need to use bytes "wrapper" reference
        // in order to write to individual string positions due to Solidity string UTF8
        // encoding
        string memory lastWinnerNameBegin = new string(3);
        bytes memory bytesLastWinnerNameBegin = bytes(lastWinnerNameBegin);
        for (uint i = 0; i < 3 && i < bytesLastWinnerName.length; i++) {
          bytesLastWinnerNameBegin[i] = bytesLastWinnerName[i];
        }
        return lastWinnerNameBegin;
    } else {
      return "***";
    }
  }

  function lastWinnerDays() returns (uint) {
    return lastWinnerGuessTime * 1 days;
  }

  function lastWinnerHours() returns (uint) {
    return lastWinnerGuessTime * 1 hours;
  }

  function lastWinnerMinutes() returns (uint) {
    return lastWinnerGuessTime * 1 minutes;
  }
}