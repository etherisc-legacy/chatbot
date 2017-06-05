function onContentLoaded() {
  var accountSpan = document.getElementById("account");
  accountSpan.innerHTML = "Hello world";
  //accountSpan.innerHTML = (typeof web3 === "undefined" ? "undefined" : web3.eth.accounts);
}
document.addEventListener("DOMContentLoaded", onContentLoaded);