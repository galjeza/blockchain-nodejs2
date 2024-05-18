const Blockchain = require("./index");
const Block = require("./block");

describe("Blockchain", () => {
  let blockchain, blockchain2, newChain, originalChain;

  beforeEach(() => {
    blockchain = new Blockchain();
    blockchain2 = new Blockchain();
    newChain = new Blockchain();
    originalChain = blockchain.chain;
  });

  it("starts with the genesis block", () => {
    expect(blockchain.chain[0]).toEqual(Block.genesis());
  });

  it("adds a new block", () => {
    const data = "foo";
    blockchain.addBlock(data);
    expect(blockchain.chain[blockchain.chain.length - 1].data).toEqual(data);
  });

  it("validates a valid chain", () => {
    blockchain2.addBlock("foo");
    expect(blockchain.isValidChain(blockchain2.chain)).toBe(true);
  });

  it("invalidates a chain with a corrupt genesis block", () => {
    blockchain2.chain[0].data = "bad data";
    expect(blockchain.isValidChain(blockchain2.chain)).toBe(false);
  });

  it("invalidates a corrupt chain", () => {
    blockchain2.addBlock("foo");
    blockchain2.chain[1].data = "not foo";
    expect(blockchain.isValidChain(blockchain2.chain)).toBe(false);
  });

  it("replaces the chain with a valid chain", () => {
    blockchain2.addBlock("goo");
    blockchain.replaceChain(blockchain2.chain);
    expect(blockchain.chain).toEqual(blockchain2.chain);
  });

  it("does not replace the chain with one with less than or equal length", () => {
    blockchain.addBlock("foo");
    blockchain.replaceChain(blockchain2.chain);
    expect(blockchain.chain).not.toEqual(blockchain2.chain);
  });

  it("does not replace the chain with an invalid data type", () => {
    blockchain.replaceChain("not a chain");
    expect(blockchain.chain).toEqual(originalChain);
  });

  it("handles addition of blocks with various data types correctly", () => {
    const dataTypes = [123, { test: "data" }, [1, 2, 3]];
    dataTypes.forEach((data) => {
      blockchain.addBlock(data);
      expect(blockchain.chain[blockchain.chain.length - 1].data).toEqual(data);
    });
  });

  it("correctly identifies a modified block deep in the chain as invalid", () => {
    newChain.addBlock("foo");
    newChain.addBlock("bar");
    newChain.chain[1].data = "NOT bar";
    expect(blockchain.isValidChain(newChain.chain)).toBe(false);
  });

  it("rejects chain replacement with invalid sequential hashes", () => {
    newChain.addBlock("foo");
    newChain.chain[newChain.chain.length - 1].lastHash = "brokenLastHash";
    blockchain.replaceChain(newChain.chain);
    expect(blockchain.chain).toEqual(originalChain);
  });
});
