const Block = require("./block");
const { MINE_RATE } = require("../config.js");

describe("Block", () => {
  let data, lastBlock, block;
  beforeEach(() => {
    data = "bar";
    lastBlock = Block.genesis();
    block = Block.mineBlock(lastBlock, data);
  });
  it("sets the `data` to match the input", () => {
    expect(block.data).toEqual(data);
  });

  it("sets the `lastHash` to match the hash of the last block", () => {
    expect(block.lastHash).toEqual(lastBlock.hash);
  });

  it("correctly handles non-string data input", () => {
    const dataObject = { value: "test", id: 1 };
    const newBlock = Block.mineBlock(lastBlock, dataObject);
    expect(typeof newBlock.data).toBe("object");
    expect(newBlock.data).toEqual(dataObject);
  });

  it("generates a hash that matches the difficutly", () => {
    expect(block.hash.substring(0, block.difficulty)).toEqual(
      "0".repeat(block.difficulty)
    );
  });

  it("lower the difficulty for a slower generated block", () => {
    expect(Block.adjustDifficulty(block, block.timestamp + 300000)).toEqual(
      block.difficulty - 1
    );
  });

  it("raise the difficulty for a faster generated block", () => {
    expect(Block.adjustDifficulty(block, block.timestamp + 1)).toEqual(
      block.difficulty + 1
    );
  });

  it("prevents the difficulty from dropping below 1", () => {
    block.difficulty = -1;
    const newBlock = Block.mineBlock(block, "bar");
    expect(newBlock.difficulty).toBeGreaterThanOrEqual(1);
  });

  it("adjusts the difficulty correctly for edge case timings", () => {
    const newBlockFast = Block.mineBlock(lastBlock, "fast");
    //  fast block time
    expect(
      Block.adjustDifficulty(
        newBlockFast,
        newBlockFast.timestamp + MINE_RATE - 1
      )
    ).toEqual(newBlockFast.difficulty + 1);

    const newBlockSlow = Block.mineBlock(lastBlock, "slow");
    //  slow block time
    expect(
      Block.adjustDifficulty(
        newBlockSlow,
        newBlockSlow.timestamp + MINE_RATE + 1
      )
    ).toEqual(newBlockSlow.difficulty - 1);
  });
});
