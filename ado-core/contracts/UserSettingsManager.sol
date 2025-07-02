// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract UserSettingsManager {
    struct Settings {
        bool autoClaim;
        bool allowModAlerts;
        bool extendRecoveryWindow;
    }

    mapping(address => Settings) public userSettings;

    function updateSettings(bool _autoClaim, bool _allowModAlerts, bool _extendRecoveryWindow) external {
        userSettings[msg.sender] = Settings({
            autoClaim: _autoClaim,
            allowModAlerts: _allowModAlerts,
            extendRecoveryWindow: _extendRecoveryWindow
        });
    }

    function getSettings(address user) external view returns (Settings memory) {
        return userSettings[user];
    }
}
