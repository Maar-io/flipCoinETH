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

    uint public balance;
    uint MIN_BET = 0.1 ether;
    
    modifier costs(){
        require(msg.value >= MIN_BET);
        _;
    }
    
    function isRegistered(address sender) private view returns(bool){
        for (uint i=0; i<creators.length; i++) {
            if (sender == creators[i]){
                return true;
            }
        }
        //console.log("Please register before using this contract");
        return false;
    }

    mapping (address => Player) private gambler;
    address[] public creators; //TODO change to private

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

    function flipCoin(bool betOnHead) public payable costs() returns (bool){
        balance += msg.value;
        bool result;
        isRegistered(msg.sender);
        
        //This creates a person
        gambler[msg.sender].plays++;
        result = isWinner(betOnHead) ;
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

    function isWinner(bool betOnHead) private view returns(bool){
        bool flippedHead = goFlip();
        if (flippedHead && betOnHead == true){
            //console.log("HEAD is winner");
            return true;
        }
        else if(!flippedHead && betOnHead == false){
            //console.log("TAIL is winner");
            return true;
        }
        else{
            //console.log("You loose");
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

    function getPlayerData() public view returns(uint won, uint lost, uint plays){
        address creator = msg.sender;
        return (gambler[creator].won, gambler[creator].lost, gambler[creator].plays);
    }

   function withdrawAll() public onlyOwner returns(uint) {
       uint toTransfer = balance;
       balance = 0;
       msg.sender.transfer(toTransfer);
       //console.log("withrawal of all fonds from contract, value = " + toTransfer);
       return toTransfer;
   }

}
