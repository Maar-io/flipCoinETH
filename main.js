var web3 = new Web3(Web3.givenProvider);
console.log("web3 version = " + web3.version);
var contractInstance;
var myMetaMaskAccount = "0x0C61Cfcdc9F84eD58271f3490960346623De2315"; // not needed, testing only
var contractAddress = "0xB587a9d161c5E0480a16F239e2360C5aBdf080E1";
var poolLimit = 0;

$(document).ready(function() {
    window.ethereum.enable().then(function(accounts){
        if (accounts[0] != myMetaMaskAccount) {
            console.log("Warning: User account might be wrong!!!!");
            console.log("account[0] = " + accounts[0]);
        }
        console.log("myMetaMaskAccount = " + myMetaMaskAccount); 
        console.log("Account isConnected = " + window.ethereum._state.isConnected);
      contractInstance = new web3.eth.Contract(abi, contractAddress, {from: accounts[0]});
      $("#userAccount").text(accounts[0]);
      console.log(contractInstance);
      contractInstance.methods.getContractBalance().call()
        .then(function(contractBalance){
            console.log(contractBalance);
            poolLimit = Web3.utils.fromWei(contractBalance, 'ether');
            console.log(poolLimit);
            $("#poolMax").text(poolLimit);
        });
    });
    $("#bet-head").click(betOnHead);
    $("#bet-tail").click(betOnTail);
});

function betOnTail(){
    betOn(false);
}
function betOnHead(){
    betOn(true);
}
function betOn(betHead){
    console.log("bet on ...");
    var ethValue = $("input[name='ethValue']:checked").val();
    if(betHead){
        console.log("bet on HEAD, eth = " + ethValue);
        $("#result-text").text("Head");

    }
    else{
        console.log("bet on TAIL, eth = " + ethValue);
        $("#result-text").text("Tail");
    }
}