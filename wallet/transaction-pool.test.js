const TransactionPool = require("./transaction-pool");
const Transaction = require("./transaction");
const Wallet = require("./index");
const Blockchain = require("../blockchain");

describe("Transaction Pool", () => {
  let transactionPool, wallet, transaction, blockchain;

  beforeEach(() => {
    transactionPool = new TransactionPool();
    wallet = new Wallet();
    blockchain = new Blockchain();
    // transaction = Transaction.newTransaction(wallet,'r4nd-addr355',30);
    // transactionPool.updateOrAddTransaction(transaction);
    transaction = wallet.createTransaction(
      "r4nd-addr355",
      30,
      blockchain,
      transactionPool
    );
  });

  it("adds a transaction to the pool", () => {
    expect(
      transactionPool.transactions.find((t) => t.id === transaction.id)
    ).toEqual(transaction);
  });

  it("updates a transaction in the pool", () => {
    const oldTransaction = JSON.stringify(transaction);
    newTransaction = transaction.update(wallet, "foo-4ddr355", 40);
    transactionPool.updateOrAddTransaction(newTransaction);
    expect(
      JSON.stringify(
        transactionPool.transactions.find((t) => t.id === transaction.id)
      )
    ).not.toEqual(oldTransaction);
  });

  it("clears transactions", () => {
    transactionPool.clear();
    expect(transactionPool.transactions).toEqual([]);
  });

  describe("mixing valid and corrupt transactions", () => {
    let validTransactions;

    beforeEach(() => {
      validTransactions = [...transactionPool.transactions];

      // creating new transactions with corrupted transactions
      for (let i = 0; i < 6; i++) {
        wallet = new Wallet();
        transaction = wallet.createTransaction(
          "r4nd-4ddr355",
          30,
          blockchain,
          transactionPool
        );
        if (i & 1) {
          transaction.input.amount = 999999;
        } else {
          validTransactions.push(transaction);
        }
      }
    });

    it("shows a difference between valid adnd corrupt transactions", () => {
      expect(JSON.stringify(transactionPool.transactions)).not.toEqual(
        JSON.stringify(validTransactions)
      );
    });

    it("grabs valid transactions", () => {
      expect(transactionPool.validTransactions()).toEqual(validTransactions);
    });
  });

  describe("existingTransaction", () => {
    it("finds an existing transaction by address", () => {
      expect(transactionPool.existingTransaction(wallet.publicKey)).toEqual(
        transaction
      );
    });

    it("returns undefined for non-existing address", () => {
      expect(
        transactionPool.existingTransaction("non-existing-address")
      ).toEqual(undefined);
    });

    it("returns the first transaction for address with multiple transactions", () => {
      const firstTransaction = transaction;
      const secondTransaction = wallet.createTransaction(
        "another-r4nd-addr355",
        20,
        blockchain,
        transactionPool
      );
      transactionPool.updateOrAddTransaction(secondTransaction);

      expect(transactionPool.existingTransaction(wallet.publicKey)).toEqual(
        firstTransaction
      );
    });
  });

  describe("validTransactions", () => {
    it("excludes transactions with invalid output totals", () => {
      let transaction = wallet.createTransaction(
        "r4nd-4ddr355",
        30,
        blockchain,
        transactionPool
      );
      transaction.outputs[0].amount = 999999; // Corrupt transaction
      transactionPool.updateOrAddTransaction(transaction);

      expect(transactionPool.validTransactions()).not.toContain(transaction);
    });

    it("excludes transactions with invalid signatures", () => {
      let transaction = wallet.createTransaction(
        "r4nd-4ddr355",
        30,
        blockchain,
        transactionPool
      );
      transaction.input.signature = new Wallet().sign("tamper"); // Invalid signature
      transactionPool.updateOrAddTransaction(transaction);

      expect(transactionPool.validTransactions()).not.toContain(transaction);
    });
  });

  describe("clear", () => {
    it("resets the transaction pool to empty array even with corrupt transactions", () => {
      transactionPool.clear();
      expect(transactionPool.transactions).toEqual([]);
    });

    it("clearing pool does not affect newly added transactions", () => {
      transactionPool.clear();
      let newTransaction = wallet.createTransaction(
        "new-r4nd-addr355",
        30,
        blockchain,
        transactionPool
      );
      expect(transactionPool.transactions).toContain(newTransaction);
    });
  });
});
