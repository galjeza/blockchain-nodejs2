const Transaction = require("../wallet/transaction");
const Wallet = require("../wallet/index");

class Miner {
  constructor(blockchain, transactionPool, wallet, p2pServer) {
    this.blockchain = blockchain;
    this.p2pServer = p2pServer;
    this.wallet = wallet;
    this.transactionPool = transactionPool;
  }

  mine() {
    const validTransactions = this.transactionPool.validTransactions();

    validTransactions.push(
      Transaction.rewardTransaction(this.wallet, Wallet.blockchainWallet())
    );

    const block = this.blockchain.addBlock(validTransactions);

    this.p2pServer.syncChain();

    this.transactionPool.clear();
    this.p2pServer.broadcastClearTransactions();

    return block;
  }
}

module.exports = Miner;
