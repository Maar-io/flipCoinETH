import "./Ownable.sol";
pragma solidity 0.5.12;

contract Flipcoin is Ownable{

    struct Player {
      uint lost;
      uint won;
      uint plays;
    }

    event playerRegistered(address adr);
    event coinFlipResult(string messageToPlayer);
    event fundsSentToPlayer(string messageToPlayer, uint toTransfer);

    uint public balance;
    uint MIN_BET = 0.1 ether;
    uint MIN_INITIAL_FUNDS = 5 ether;

    modifier costs(uint msgFunds){
        require(msg.value >= msgFunds);
        _;
    }
    
    mapping (address => Player) private gambler;
    address[] public creators; //TODO change to private
    
    function depositFunds() public payable onlyOwner costs(MIN_INITIAL_FUNDS){
        balance += msg.value;
    }
    
    function register() public{
        Player memory newPlayer;
        address creator = msg.sender;
        
        //This creates a player
        newPlayer.lost = 0;
        newPlayer.won = 0;
        newPlayer.plays = 0;
        gambler[creator] = newPlayer; //create new gambler entry
        creators.push(creator); //save player's address to creators array
        emit playerRegistered(creator);
    }
    
    function isRegistered(address sender) private view returns(bool){
        for (uint i=0; i<creators.length; i++) {
            if (sender == creators[i]){
                return true;
            }
        }
        //Please register before using this contract
        return false;
    }

    function flipCoin(bool betOnHead) public payable costs(MIN_BET) returns (bool){
        uint downPayment = msg.value;
        balance += downPayment;
        bool result;
        assert (isRegistered(msg.sender) == true);
        
        gambler[msg.sender].plays++;
        result = isWinner(betOnHead, downPayment) ;
        if (result) {
            gambler[msg.sender].won++;
            emit coinFlipResult("winner");
        }
        else{
            gambler[msg.sender].lost++;
            emit coinFlipResult("loser");
        }
        return result;
    }

    function isWinner(bool betOnHead, uint downPayment) private returns(bool){
        bool flippedHead = goFlip();
        if (flippedHead && betOnHead == true){
            sendFundsToWinner(downPayment);
            return true;
        }
        else if(!flippedHead && betOnHead == false){
            sendFundsToWinner(downPayment);
            return true;
        }
        else{
            return false;
        }
    }
    
    function goFlip() private view returns (bool){
        uint rdm = now % 2;
        if (rdm == 1){
            return true;
        }
        return false;
    }

    function sendFundsToWinner(uint downPayment) private{
       uint toTransfer = downPayment * 2;
       balance -= toTransfer;
       msg.sender.transfer(toTransfer);
       emit fundsSentToPlayer("Funds sent to player ", toTransfer);
    } 
    
    function getPlayerData() public view returns(uint won, uint lost, uint plays){
        address creator = msg.sender;
        return (gambler[creator].won, gambler[creator].lost, gambler[creator].plays);
    }

   function withdrawAll() public onlyOwner returns(uint) {
       uint toTransfer = balance;
       balance = 0;
       msg.sender.transfer(toTransfer);
       return toTransfer;
   }

}
