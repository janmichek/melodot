const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("MyContractModule", (m) => {
  const message = m.getParameter("message", "Hello, Sepolia! This is my contract creation message");

  const myContract = m.contract("MyContract", [message]);

  return { myContract };
});
