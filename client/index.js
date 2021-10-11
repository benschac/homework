import "./index.scss";

const server = "http://localhost:3042";
const EC = require("elliptic").ec;
const SHA256 = require("crypto-js/sha256");

document
  .getElementById("exchange-address")
  .addEventListener("input", ({ target: { value } }) => {
    if (value === "") {
      document.getElementById("balance").innerHTML = 0;
      return;
    }

    fetch(`${server}/balance/${value}`)
      .then((response) => {
        return response.json();
      })
      .then(({ balance }) => {
        document.getElementById("balance").innerHTML = balance;
      });
  });

document.getElementById("transfer-amount").addEventListener("click", () => {
  const sender = document.getElementById("exchange-address").value;
  const recipient = document.getElementById("recipient").value;

  const ec = new EC("secp256k1");

  const privateKey = document.getElementById(
    "exchange-address-private-key"
  ).value;

  const key = ec.keyFromPrivate(privateKey);

  // TODO: change this message to whatever you would like to sign
  const amount = document.getElementById("send-amount").value;
  const msgHash = SHA256(amount);

  const signedTransaction = key.sign(msgHash.toString());

  const body = JSON.stringify({
    sender,
    signedTransaction: {
      message: amount,
      signature: {
        r: signedTransaction.r.toString(16),
        s: signedTransaction.s.toString(16),
      },
    },
    amount,
    recipient,
  });

  const request = new Request(`${server}/send`, { method: "POST", body });

  fetch(request, { headers: { "Content-Type": "application/json" } })
    .then((response) => {
      return response.json();
    })
    .then(({ balance }) => {
      console.log("lets see!");
      document.getElementById("balance").innerHTML = balance;
    });
});
