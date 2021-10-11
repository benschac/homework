const express = require("express");
const app = express();
const cors = require("cors");
const EC = require("elliptic").ec;
const port = 3042;
const SHA256 = require("crypto-js/sha256");

// localhost can have cross origin errors
// depending on the browser you use!
app.use(cors());
app.use(express.json());

const ec = new EC("secp256k1");

const accounts = [1, 2, 3]
  .map(() => ec.genKeyPair())
  .map((key) => {
    return {
      key,
      privateKey: key.getPrivate().toString(16),
      public: key.getPublic().encode("hex"),
    };
  });

const balances = {
  1: 100,
  2: 50,
  3: 75,
};

const publicAccountBalances = accounts.reduce((prev, curr, index) => {
  prev[[accounts[index].public]] = balances[index + 1];
  return prev;
}, {});

console.log(accounts, "accounts");

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  console.log(
    address,
    "address",
    publicAccountBalances,
    publicAccountBalances[address]
  );
  const balance = publicAccountBalances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { sender, signedTransaction, recipient, amount } = req.body;

  // TODO: look in lib for the de
  // There needs to be a way to verify with the private key signature
  // that the person sending with the private key owns the account.
  console.log("hiiiiiiii", sender, signedTransaction, recipient, amount);

  const key = ec.keyFromPublic(sender, "hex");

  // TODO: change this message to whatever was signed
  const msgHash = SHA256(signedTransaction.message).toString();
  if (key.verify(msgHash, signedTransaction.signature)) {
    console.log("do I happen ZZZZ", Number(amount));
    publicAccountBalances[sender] -= amount;
    publicAccountBalances[recipient] =
      (publicAccountBalances[recipient] || 0) + Number(amount);

    res.send({ balance: publicAccountBalances[sender] });
    return;
  }

  res.send({ balances: "Error" });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});
