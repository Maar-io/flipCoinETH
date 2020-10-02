pragma solidity 0.5.12;
import "./Ownable.sol";
import "./provableAPI.sol";

contract Flipcoin is Ownable, usingProvable{

    struct Player {
      uint lost;
      uint won;
      uint plays;
      bytes32 provableQuery;
      bool betOnHead;
      uint downPayment;
    }

    event playerRegistered(address adr);
    event coinFlipResult(string messageToPlayer);
    event fundsSentToPlayer(string messageToPlayer, address creator, uint toTransfer);
    event provableQuerySent(string messageToPlayer, address creator);
    event generatedRandomNumber(string messageToPlayer, address creator, uint256 randomNumber);


    uint public balance;
    uint MIN_BET = 0.1 ether;
    uint MIN_INITIAL_FUNDS = 0.5 ether;
    uint256 constant MAX_INT_FROM_BYTE = 256;
    uint256 constant NUM_RANDOM_BYTES_REQUESTED = 1;
    bytes m_proof;
    modifier costs(uint msgFunds){
        require(msg.value >= msgFunds);
        _;
    }
    
    mapping (address => Player) private gambler;
    address payable[] public creators; //TODO change to private
    

    function __callback(bytes32 _queryId, string memory _result, bytes memory _proof) public {
        //require(msg.sender == provable_cbAddress()); TODO uncomment
        m_proof = _proof; //not used, but compiler complains
        uint256 randomNumber = uint256(keccak256(abi.encodePacked(_result))) % 2;
        updatePlayer(_queryId, randomNumber);
    }

    function queryOracle() payable public returns (bytes32)
    {
        uint256 QUERY_EXECUTION_DELAY = 0;
        uint256 GAS_FOR_CALLBACK = 200000;
        bytes32  queryId = provable_newRandomDSQuery(
            QUERY_EXECUTION_DELAY,
            NUM_RANDOM_BYTES_REQUESTED,
            GAS_FOR_CALLBACK
        );
        return queryId;
    }

    function testRandom() public returns (bytes32){
        bytes32 queryId = bytes32(keccak256(abi.encodePacked(msg.sender)));
        __callback(queryId, "1", bytes("test"));
        return queryId;
    }

    function updatePlayer(bytes32 queryId, uint256 randomNumber) private{
        address payable creator;
        for (uint i=0; i<creators.length; i++){
            creator = creators[i];
            if (gambler[creator].provableQuery == queryId){
                gambler[creator].provableQuery = 0;
                gambler[creator].provableQuery = 0;
                break;
            }
        }
        emit generatedRandomNumber("created random", creator, randomNumber);
        isWinner(creator, randomNumber);
    }

    function depositFunds() public payable{
        balance += msg.value;
    }
    
    function register() private{
        Player memory newPlayer;
        address payable creator = msg.sender;
        
        //This creates a player
        newPlayer.lost = 0;
        newPlayer.won = 0;
        newPlayer.plays = 0;
        newPlayer.downPayment = 0;
        newPlayer.provableQuery = 0;
        gambler[creator] = newPlayer; //create new gambler entry
        creators.push(creator); //save player's address to creators array
        emit playerRegistered(creator);
    }
    
    function isRegistered(address sender) private{
        bool userRegistered = false;
        for (uint i=0; i<creators.length; i++) {
            if (sender == creators[i]){
                userRegistered = true;
            }
        }
        //Register before using this contract
        if(!userRegistered){
            register();
        }
    }

    function flipCoin(bool betOnHead) public payable costs(MIN_BET){
        uint downPayment = msg.value;

        balance += downPayment;
        isRegistered(msg.sender);
        queryOracle();
        //testRandom();
        gambler[msg.sender].plays++;
        gambler[msg.sender].downPayment = downPayment;
        gambler[msg.sender].betOnHead = betOnHead;
        emit provableQuerySent("provable queried", msg.sender);
    }

    function isWinner(address payable creator, uint256 randomNumber) private{
        Player memory player = gambler[creator];
        bool betOnHead;
        if(randomNumber == 1){
            betOnHead = true;
        }
        else if(randomNumber == 0){
            betOnHead = false;
        }
        else{
            assert(false);
        }
        if (betOnHead == player.betOnHead) {
            player.won++;
            sendFundsToWinner(creator);
        }
        else{
            player.lost++;
            emit coinFlipResult("loser");
        }
    }

    function sendFundsToWinner(address payable creator) private{
       uint toTransfer = gambler[creator].downPayment * 2;
       balance -= toTransfer;
       creator.transfer(toTransfer);
       emit fundsSentToPlayer("Winner!!!, Funds sent to player ", creator, toTransfer);
    } 
    
    function getPlayerData() public view returns(uint won, uint lost, uint plays){
        address creator = msg.sender;
        return (gambler[creator].won, gambler[creator].lost, gambler[creator].plays);
    }
    
    function getContractBalance() public view returns (uint){
        return balance;
    }

    function withdrawAll() public onlyOwner returns(uint) {
       uint toTransfer = balance;
       balance = 0;
       msg.sender.transfer(toTransfer);
       return toTransfer;
    }

}
