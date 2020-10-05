var web3 = new Web3(Web3.givenProvider);
console.log("web3 version = " + web3.version);
var contractInstance;
var userAccount;
var myMetaMaskAccount = "0xb7185A33d65b1bd3197779736c6D52Dda0D1E0A1"; // not needed, testing only
var contractAddress = "0x073A57F4Fe3504e43819316bb8a795B96D6A9a56";
var poolLimit = 0;
var userLimit = 0;
var clientReceiptContract;

$(document).ready(function() {
    window.ethereum.enable().then(function(accounts){
        userAccount = accounts[0];
        if (userAccount != myMetaMaskAccount) {
            console.log("Warning: User account might be wrong!!!!");
            console.log("account[0] = " + userAccount);
        }
        console.log("myMetaMaskAccount = " + myMetaMaskAccount); 
        console.log("Account isConnected = " + window.ethereum._state.isConnected);
        $("#contractHash").attr("href","https://ropsten.etherscan.io/address/"+contractAddress);
        // get contract instance
        contractInstance = new web3.eth.Contract(abi, contractAddress, {from: userAccount});

        $("#userAccount").removeClass("text-danger").addClass("text-success");
        $("#userAccount").text(userAccount);
        console.log(contractInstance);
        refreshbalances();
        refreshStats();
        eventListener();

    });
    $("#bet-head").click(betOnHead);
    $("#bet-tail").click(betOnTail);
});

function eventListener(){
    console.log("set event listeners");
    var event2 = contractInstance.events.generatedRandomNumber(function(error, result) {
        console.log("Event generatedRandomNumber");
        if (!error){
            console.log(result);
        }
        else{
            console.log("error in generatedRandomNumber");
            console.log(error);
        }
    });

    var event3 = contractInstance.events.coinFlipResult(function(error, result) {
        console.log("Event coinFlipResult");
        if (!error){
            console.log(result);
            if (result["returnValues"][0] === "loser"){
                refreshbalances();
                refreshStats();
                $("#result-text").removeClass("text-white").addClass("text-danger");
                $("#result-text").text("You lost :(");
            }
        }
        else{
            console.log("error in coinFlipResult");
            console.log(error);
        }
    });
    
    var event4 = contractInstance.events.fundsSentToPlayer(function(error, result) {
        console.log("Event fundsSentToPlayer");
        if (!error){
            console.log(result);
            console.log(["returnValues"][2]);
            if (result["returnValues"][2] > 0){
                refreshbalances();
                refreshStats();
                $("#result-text").removeClass("text-white").addClass("text-success");
                $("#result-text").text("You won!!!!!");
            }
        }
        else{
            console.log("error in fundsSentToPlayer");
            console.log(error);
        }
    });
}

function refreshbalances(){
    console.log("Let's refresh pool and user balance");

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
    .then((res) => {
            console.log(res);
            $("#stat-play").text("Plays: " + res["plays"]);
            $("#stat-won").text("Won: " + res["won"]);
            $("#stat-lost").text("Lost: " + res["lost"]);
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
    $("#result-text").text("Waiting network response...");
    var ethValue = $("input[name='ethValue']:checked").val();
    console.log("betHead " + betHead + " with eth=" + ethValue);
    contractInstance.methods.flipCoin(betHead).send({value: web3.utils.toWei(ethValue, "ether")})
    .on('transactionHash', function(hash){
      console.log("tx hash");
      console.log(hash);
      $("#txHash").attr("href","https://ropsten.etherscan.io/tx/"+hash);
    })
    .on('receipt', function(receipt){
        console.log("confirmation receipt:");
        console.log(receipt);
    })
    .on('confirmation', function(confirmationNumber, receipt){
        console.log("Transaction confirmed " + confirmationNumber + " times");
    });
}