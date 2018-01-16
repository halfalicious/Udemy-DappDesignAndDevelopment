//
// Simple betting smart contract from Section 7 (Ethereum Smart Contract Development Using Solidity) Coding
// Exercise 7 (Events)
//    
//    https://www.udemy.com/ethereum-dapp/learn/v4/t/lecture/7030598?start=0
//

pragma solidity ^0.4.4;

import "./MultiNumberBettingAbstractV3.sol";

contract MultiNumberBettingV7 is MultiNumberBettingAbstractV3 {
  function MultiNumberBettingV7(uint8 num1, uint8 num2, uint8 num3) public {
    owner = msg.sender;

    nums[0] = num1;
    nums[1] = num2;
    nums[2] = num3;
  }

  function ownerDeposit() ownerOnly payable public {
    require (msg.sender == owner);
    require (msg.value > 0);
  }

  function ownerWithdrawal(uint amount) ownerOnly public {
    require(this.balance - amount >= 2 * MAX_BET);

    msg.sender.transfer(amount);
  }

  function guess(uint8 guessVal, string name) payable public returns (bool) {
    require(guessVal <= 10);
    require(msg.value >= MIN_BET && msg.value <= MAX_BET);
    require(this.balance > 2 * MAX_BET);

    for (uint i = 0; i < nums.length; i++) {
      if (nums[i] == guessVal) {
        winnerCount++;

        // Obtain reference to Winner instance from mapping and populate it
        Winner storage winner = winners[msg.sender];

        winner.address_ = msg.sender;
        winner.name = name;
        winner.guessVal = guessVal;
        winner.guessTime = now;

        // Send 2x winning bet to better (if available) - otherwise just send them
        // the remaining balance
        uint rewardVal = msg.value * 2;
        if (this.balance < rewardVal) {
          rewardVal = this.balance;
        }

        winner.ethersReceived = rewardVal;

        // Should ideally use the withdraw design pattern but unnecessary for this
        // simple test contract. See: 
        //
        //    http://solidity.readthedocs.io/en/develop/common-patterns.html
        //
        msg.sender.transfer(rewardVal);

        lastWinnerAddress = msg.sender;

        WinningBet(winner.address_, winner.name, msg.value);

        return true;
      }
    }

    // Ethers in accompanying tx are automatically credited to contract
    loserCount++;
    LosingBet(msg.sender, name, msg.value);
    return false;
  }

  function getLastWinnerInfo() public returns (address address_, string name, uint guessTime, uint ethersReceived) {
    if (winnerCount > 0) {
      address_ = lastWinnerAddress;
      name = winners[lastWinnerAddress].name;
      guessTime = winners[lastWinnerAddress].guessTime;
      ethersReceived = winners[lastWinnerAddress].ethersReceived;
    }
  }

  function checkWinning(address address_) public returns (address retAddress, string name, uint8 guessVal, uint guessTime, uint ethersReceived) {
    Winner storage winner = winners[address_];
    if (winner.guessTime != 0) {
      retAddress = winner.address_;
      name = winner.name;
      guessVal = winner.guessVal;
      guessTime = winner.guessTime;
      ethersReceived = winner.ethersReceived;
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