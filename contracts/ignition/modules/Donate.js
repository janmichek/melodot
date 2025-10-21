const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("DonateModule", (m) => {

    const myContract = m.contract("Donate");

    return { myContract };
});

