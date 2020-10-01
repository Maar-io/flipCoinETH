var web3 = new Web3(Web3.givenProvider);
console.log("web3 version = " + web3.version);
var contractInstance;
var userAccount;
var myMetaMaskAccount = "0x0C61Cfcdc9F84eD58271f3490960346623De2315"; // not needed, testing only
var contractAddress = "0xC0e200dC119bcF3F6AF55F56B98783166BbC6Bef";
var poolLimit = 0;
var userLimit = 0;


$(document).ready(function() {
    window.ethereum.enable().then(function(accounts){
        userAccount = accounts[0];
        if (userAccount != myMetaMaskAccount) {
            console.log("Warning: User account might be wrong!!!!");
            console.log("account[0] = " + userAccount);
        }
        console.log("myMetaMaskAccount = " + myMetaMaskAccount); 
        console.log("Account isConnected = " + window.ethereum._state.isConnected);
        
        refreshbalances();
    });
    $("#bet-head").click(betOnHead);
    $("#bet-tail").click(betOnTail);
});

function refreshbalances(){
    console.log("Let's refresh pool and user balance");

    // get contract instance
    contractInstance = new web3.eth.Contract(abi, contractAddress, {from: userAccount});
    $("#userAccount").removeClass("text-danger").addClass("text-success");
    $("#userAccount").text(userAccount);
    console.log(contractInstance);
    
    // get contract balance
    contractInstance.methods.getContractBalance().call()
    .then(function(contractBalance){
        poolLimit = Web3.utils.fromWei(contractBalance, 'ether');
        console.log("pool = " + poolLimit);
        $("#poolMax").text(poolLimit);
    });
    
    // get user balance
    web3.eth.getBalance(userAccount)
    .then(function(accountBalance){
        userLimit = Web3.utils.fromWei(accountBalance, 'ether');
        console.log(userLimit);
        $("#userAccountStatus").text(userLimit);
    });
}

function refreshStats(){
    console.log("Refresh statistics");
    contractInstance.methods.getPlayerData().call()
    .then(function(res){
        console.log(res);
        console.log(res["plays"]);
        $("#stat-play").text("Plays: "+ res["plays"]);
        $("#stat-won").text("Won: "+ res["won"]);
        $("#stat-lost").text("Lost: "+ res["lost"]);
    });
}

function betOnTail(){
    betOn(false);
}
function betOnHead(){
    betOn(true);
}

function betOn(betHead){
    $("#result-text").removeClass("text-danger text-success").addClass("text-white");
    $("#result-text").text("??????????????????????");
    console.log("betHead " + betHead + " with eth=" + ethValue);
    var ethValue = $("input[name='ethValue']:checked").val();
    contractInstance.methods.flipCoin(betHead).send({value: web3.utils.toWei(ethValue, "ether")})
    .on('transactionHash', function(hash){
      console.log("tx hash, bet");
    })
    .on('confirmation', function(confirmationNumber, receipt){
        console.log("conf");
    })
    .on('receipt', function(receipt){
        console.log(receipt);
    })
    .then(function(isWinner){
        console.log("bet result");
        console.log(isWinner);
        if(isWinner){
            $("#result-text").removeClass("text-white").addClass("text-success");
            $("#result-text").text("You won!!!!!");
        }
        else{
            $("#result-text").removeClass("text-white").addClass("text-danger");
            $("#result-text").text("You lost :(");
        }
        refreshbalances();
        refreshStats();
    });
}