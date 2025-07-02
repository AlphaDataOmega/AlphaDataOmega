import { expect } from "chai";
import { ethers } from "hardhat";

describe("UserSettingsManager", function () {
  it("updates and returns settings for a user", async () => {
    const [user, other] = await ethers.getSigners();

    const Manager = await ethers.getContractFactory("UserSettingsManager");
    const manager = await Manager.deploy();

    await manager.connect(user).updateSettings(true, false, true);

    const settings = await manager.getSettings(user.address);
    expect(settings.autoClaim).to.equal(true);
    expect(settings.allowModAlerts).to.equal(false);
    expect(settings.extendRecoveryWindow).to.equal(true);

    const otherSettingsBefore = await manager.getSettings(other.address);
    expect(otherSettingsBefore.autoClaim).to.equal(false);
    expect(otherSettingsBefore.allowModAlerts).to.equal(false);
    expect(otherSettingsBefore.extendRecoveryWindow).to.equal(false);

    await manager.connect(other).updateSettings(false, true, false);
    const otherSettings = await manager.getSettings(other.address);
    expect(otherSettings.autoClaim).to.equal(false);
    expect(otherSettings.allowModAlerts).to.equal(true);
    expect(otherSettings.extendRecoveryWindow).to.equal(false);
  });
});

