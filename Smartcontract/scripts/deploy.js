const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

  // ── Deploy DisputeArbitrator ───────────────────────────────────────────
  console.log("\n📜 Deploying DisputeArbitrator...");
  const DisputeArbitrator = await ethers.getContractFactory("DisputeArbitrator");
  const arbitrator = await DisputeArbitrator.deploy();
  await arbitrator.waitForDeployment();
  const arbitratorAddress = await arbitrator.getAddress();
  console.log("✅ DisputeArbitrator deployed at:", arbitratorAddress);

  // ── Deploy sample Escrow ──────────────────────────────────────────────
  console.log("\n📜 Deploying sample Escrow...");
  const FREELANCER = process.env.FREELANCER_ADDRESS || "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"; // Hardhat account #1
  const DEADLINE_DAYS = 30;
  const LOCK_AMOUNT = ethers.parseEther("0.01"); // 0.01 ETH for testing

  const Escrow = await ethers.getContractFactory("Escrow");
  const escrow = await Escrow.deploy(
    FREELANCER,
    arbitratorAddress,
    "Sample PayShield Project",
    DEADLINE_DAYS,
    { value: LOCK_AMOUNT }
  );
  await escrow.waitForDeployment();
  const escrowAddress = await escrow.getAddress();
  console.log("✅ Escrow deployed at:", escrowAddress);
  console.log("   Locked:", ethers.formatEther(LOCK_AMOUNT), "ETH");

  // ── Summary ───────────────────────────────────────────────────────────
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🚀 PayShield Deployment Complete");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("DisputeArbitrator:", arbitratorAddress);
  console.log("Escrow (sample):  ", escrowAddress);
  console.log("Network:          ", (await ethers.provider.getNetwork()).name);
  console.log("\n📋 Add to your frontend .env:");
  console.log(`VITE_ARBITRATOR_ADDRESS=${arbitratorAddress}`);
  console.log(`VITE_ESCROW_ADDRESS=${escrowAddress}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
