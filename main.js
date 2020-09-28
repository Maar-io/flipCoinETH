$(document).ready(function() {

    $("#register").click(registerWithContract);
    $("#bet-head").click(betOnHead);
    $("#bet-tail").click(betOnTail);
    
});

function registerWithContract(){
    var userAddr = $("#user_eth_addr").val();
    console.log("click register");
    console.log(userAddr);
    $("#userAccountStatus").text("10000000");
    
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