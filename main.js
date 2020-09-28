$(document).ready(function() {

    $("#eth-1").click(input1ETH);
    $("#eth-05").click(input05ETH);
    $("#eth-custom").click(inputCustomETH);
    $("#register").click(registerWithContract);

});

function registerWithContract(){
    var userAddr = $("#user_eth_addr").val();
    console.log("click register");
    console.log(userAddr);
    $("#userAccountStatus").text("1000000");

}
function input1ETH(){
    console.log("click ETH-1");
    inputETH(1);
}
function input05ETH(){
    console.log("click ETH-05");
    inputETH(0.5);
}
function inputCustomETH(){
    console.log("click ETH-Custom");
    inputETH(0.1);
}

function inputETH(amount){
    console.log("bet on eth=" + amount);
}