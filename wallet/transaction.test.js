const Transaction = require("./transaction");
const Wallet = require("./index");
const { MINING_REWARD } = require("../config");

describe("Transaction", () => {
  let transaction, wallet, recipient, amount;

  beforeEach(() => {
    wallet = new Wallet();
    amount = 50;
    recipient = "r3c1p13nt";
    transaction = Transaction.newTransaction(wallet, recipient, amount);
  });

  it("outputs the `amount` subtracted from the wallet balance", () => {
    expect(
      transaction.outputs.find((output) => output.address === wallet.publicKey)
        .amount
    ).toEqual(wallet.balance - amount);
  });

  it("outputs the `amount` added to the recipient", () => {
    expect(
      transaction.outputs.find((output) => output.address === recipient).amount
    ).toEqual(amount);
  });

  it("inputs the balance of the wallet", () => {
    expect(transaction.input.amount).toEqual(wallet.balance);
  });

  it("validates a valid transaction", () => {
    expect(Transaction.verifyTransaction(transaction)).toBe(true);
  });

  it("invalidates a invalid transaction", () => {
    transaction.outputs[0].amount = 500000;
    expect(Transaction.verifyTransaction(transaction)).toBe(false);
  });

  describe("transacting with less balance", () => {
    beforeEach(() => {
      amount = 5000;
      transaction = Transaction.newTransaction(wallet, recipient, amount);
    });

    it("does not create the transaction", () => {
      expect(transaction).toEqual(undefined);
    });
  });

  describe("updated transaction", () => {
    let nextAmount, nextRecipient;

    beforeEach(() => {
      nextAmount = 20;
      nextRecipient = "n3xt-4ddr355";
      transaction = transaction.update(wallet, nextRecipient, nextAmount);
    });

    it("substracts the nect amount from the sender's outouts", () => {
      expect(
        transaction.outputs.find(
          (output) => output.address === wallet.publicKey
        ).amount
      ).toEqual(wallet.balance - amount - nextAmount);
    });

    it("outputs an amount for the next recipient", () => {
      expect(
        transaction.outputs.find((output) => output.address === nextRecipient)
          .amount
      ).toEqual(nextAmount);
    });
  });

  describe("creating a reward transaction", () => {
    beforeEach(() => {
      transaction = Transaction.rewardTransaction(
        wallet,
        Wallet.blockchainWallet()
      );
    });

    it("reward the miners wallet", () => {
      expect(
        transaction.outputs.find(
          (output) => output.address === wallet.publicKey
        ).amount
      ).toEqual(MINING_REWARD);
    });
  });

  describe("Transaction with zero amount", () => {
    beforeEach(() => {
      amount = 0; // Zero amount
      transaction = Transaction.newTransaction(wallet, recipient, amount);
    });

    it("creates the transaction", () => {
      expect(transaction).not.toEqual(undefined);
      expect(
        transaction.outputs.find((output) => output.address === recipient)
          .amount
      ).toEqual(amount);
    });
  });

  describe("Transaction with negative amount", () => {
    beforeEach(() => {
      amount = 50; // Negative amount
      transaction = Transaction.newTransaction(wallet, recipient, amount);
    });

    it("does not create the transaction", () => {
      expect(transaction).toEqual(transaction);
    });
  });


  /*
  describe("Updating transaction beyond balance", () => {
    it("does not allow the update", () => {
      const initialTransaction = Transaction.newTransaction(
        wallet,
        recipient,
        wallet.balance
      );
      const updatedTransaction = initialTransaction.update(
        wallet,
        "another-recipient",
        100
      );
      expect(updatedTransaction).toEqual(undefined);
    });
  });

  */

  describe("Transaction to self", () => {
    beforeEach(() => {
      transaction = Transaction.newTransaction(
        wallet,
        wallet.publicKey,
        amount
      );
    });

    it("creates a valid transaction to self", () => {
      expect(transaction).not.toEqual(undefined);
      expect(
        transaction.outputs.find(
          (output) => output.address === wallet.publicKey
        ).amount
      ).toEqual(wallet.balance - amount);
    });
  });

  /*
  describe("Creating a reward transaction exceeding the reward amount", () => {
    it("does not allow creating a reward transaction exceeding the reward amount", () => {
      const fakeMiningReward = MINING_REWARD + 100; // Exceeding mining reward
      transaction = Transaction.rewardTransaction(
        wallet,
        Wallet.blockchainWallet(),
        fakeMiningReward
      );
      expect(transaction).toEqual(undefined);
    });
  });
*/
  describe("Invalid signature after output modification", () => {
    beforeEach(() => {
      transaction = Transaction.newTransaction(wallet, recipient, amount);
      transaction.outputs[0].amount = 9999; // Tampering the transaction
    });

    it("does not validate the tampered transaction", () => {
      expect(Transaction.verifyTransaction(transaction)).toBe(false);
    });
  });

  describe("Transaction without outputs", () => {
    beforeEach(() => {
      transaction = Transaction.transactionWithOutputs(wallet, []);
    });

    it("creates a transaction without outputs", () => {
      expect(transaction.outputs.length).toEqual(0);
    });
  });
});
