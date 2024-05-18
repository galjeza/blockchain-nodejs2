const express = require("express");
const Blockchain = require("../blockchain");
const bodyParser = require("body-parser");
const P2pserver = require("./p2p-server");
const Miner = require("./miner");

//get the port from the user or set the default port
const HTTP_PORT = process.env.HTTP_PORT || 3001;

const Wallet = require("../wallet");
const TransactionPool = require("../wallet/transaction-pool");

const app = express();

app.use(bodyParser.json());

const blockchain = new Blockchain();

const wallet = new Wallet();
const transactionPool = new TransactionPool();

const p2pserver = new P2pserver(blockchain, transactionPool);

const miner = new Miner(blockchain, transactionPool, wallet, p2pserver);
app.get("/blocks", (req, res) => {
  res.json(blockchain.chain);
});

//api to add blocks
app.post("/mine", (req, res) => {
  const block = blockchain.addBlock(req.body.data);
  console.log(`New block added: ${block.toString()}`);

  p2pserver.syncChain();
  res.redirect("/blocks");
});

app.get("/mine-transactions", (req, res) => {
  const block = miner.mine();
  console.log(`New block added: ${block.toString()}`);
  res.redirect("/blocks");
});

app.get("/transactions", (req, res) => {
  res.json(transactionPool.transactions);
});

// create transactions
app.post("/transact", (req, res) => {
  const { recipient, amount } = req.body;
  const transaction = wallet.createTransaction(
    recipient,
    amount,
    blockchain,
    transactionPool
  );
  p2pserver.broadcastTransaction(transaction);
  res.redirect("/transactions");
});

// get public key
app.get("/public-key", (req, res) => {
  res.json({ publicKey: wallet.publicKey });
});

// app server configurations
app.listen(HTTP_PORT, () => {
  console.log(`listening on port ${HTTP_PORT}`);
});

// p2p server configuration
p2pserver.listen();
