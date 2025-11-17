const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("DonateModule", (m) => {
    const donateContract = m.contract("Donate");
    return { donateContract };
});

