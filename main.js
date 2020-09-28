var web3 = new Web3(Web3.givenProvider);
console.log("web3 version = " + web3.version);
var contractInstance;

$(document).ready(function() {
    window.ethereum.enable().then(function(accounts){
        console.log("Account = " + accounts[0]);
        if (accounts[0] != "0x32Dc0A2beFDADc2C76b1D034ae354A97DDa80Ba6") {
            console.log("Error: Owner account is wrong!!!!");
        }
        console.log("Account isConnected = " + window.ethereum._state.isConnected);
      contractInstance = new web3.eth.Contract(abi, "0x484db5b2627De962fCa7517087D913e1C800faA7", {from: accounts[0]});
      console.log(contractInstance);
      console.log(contractInstance.methods);
    });
    $("#register").click(registerWithContract);
    $("#bet-head").click(betOnHead);
    $("#bet-tail").click(betOnTail);
});

function registerWithContract(){
    var userAddr = $("#user_eth_addr").val();
    console.log("click register");
    console.log(userAddr);
    let contractBalance = contractInstance.balance.call()
    $("#poolMax").text(contractBalance);
    
}
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
        $("#poolMax").text("Head");

    }
    else{
        console.log("bet on TAIL, eth = " + ethValue);
        $("#poolMax").text("Tail");
    }
}