// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

/// @title GeoOracle
/// @notice Country-level content enforcement and geo-blocking system
/// @dev Enforces regional rules and content visibility constraints
contract GeoOracle is Ownable {
    mapping(bytes32 => string) public postCountry; // postHash => ISO-3166 alpha-2 code
    mapping(string => bool) public countryEnabled; // ISO-3166 alpha-2 => enabled
    mapping(string => mapping(string => bool)) public categoryBlocked; // country => category => blocked
    mapping(string => uint256) public countrySlashingThreshold; // country => BRN threshold
    mapping(address => bool) public authorizedUpdaters;
    
    event PostCountrySet(bytes32 indexed postHash, string country);
    event CountryEnabled(string country, bool enabled);
    event CategoryBlocked(string country, string category, bool blocked);
    event SlashingThresholdSet(string country, uint256 threshold);
    event GeoViolation(bytes32 indexed postHash, string country, string category);

    constructor() Ownable() {}

    modifier onlyAuthorized() {
        require(authorizedUpdaters[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }

    /// @notice Authorize a contract to update geo data
    function authorizeUpdater(address updater) external onlyOwner {
        authorizedUpdaters[updater] = true;
    }

    /// @notice Set the country for a post
    function setPostCountry(bytes32 postHash, string calldata country) external onlyAuthorized {
        require(bytes(country).length == 2, "Invalid country code");
        postCountry[postHash] = country;
        emit PostCountrySet(postHash, country);
    }

    /// @notice Enable or disable a country
    function setCountryEnabled(string calldata country, bool enabled) external onlyOwner {
        require(bytes(country).length == 2, "Invalid country code");
        countryEnabled[country] = enabled;
        emit CountryEnabled(country, enabled);
    }

    /// @notice Block or unblock a category in a country
    function setCategoryBlocked(string calldata country, string calldata category, bool blocked) external onlyOwner {
        require(bytes(country).length == 2, "Invalid country code");
        categoryBlocked[country][category] = blocked;
        emit CategoryBlocked(country, category, blocked);
    }

    /// @notice Set slashing threshold for a country
    function setSlashingThreshold(string calldata country, uint256 threshold) external onlyOwner {
        require(bytes(country).length == 2, "Invalid country code");
        countrySlashingThreshold[country] = threshold;
        emit SlashingThresholdSet(country, threshold);
    }

    /// @notice Check if a post is visible in a country
    function isPostVisible(bytes32 postHash, string calldata viewerCountry) external view returns (bool) {
        string memory postCountryCode = postCountry[postHash];
        
        // If post has no country set, it's globally visible
        if (bytes(postCountryCode).length == 0) {
            return countryEnabled[viewerCountry];
        }
        
        // If post country matches viewer country, check if country is enabled
        if (keccak256(bytes(postCountryCode)) == keccak256(bytes(viewerCountry))) {
            return countryEnabled[viewerCountry];
        }
        
        // Cross-country visibility (can be customized)
        return true;
    }

    /// @notice Check if a category is blocked in a country
    function isCategoryBlocked(string calldata country, string calldata category) external view returns (bool) {
        return categoryBlocked[country][category];
    }

    /// @notice Get the country for a post
    function getPostCountry(bytes32 postHash) external view returns (string memory) {
        return postCountry[postHash];
    }

    /// @notice Check if a country is enabled
    function isCountryEnabled(string calldata country) external view returns (bool) {
        return countryEnabled[country];
    }

    /// @notice Get slashing threshold for a country
    function getSlashingThreshold(string calldata country) external view returns (uint256) {
        return countrySlashingThreshold[country];
    }

    /// @notice Report a geo violation (called by moderation system)
    function reportGeoViolation(bytes32 postHash, string calldata country, string calldata category) external onlyAuthorized {
        emit GeoViolation(postHash, country, category);
    }

    /// @notice Batch set post countries (for efficiency)
    function batchSetPostCountries(bytes32[] calldata postHashes, string[] calldata countries) external onlyAuthorized {
        require(postHashes.length == countries.length, "Arrays must match");
        
        for (uint256 i = 0; i < postHashes.length; i++) {
            require(bytes(countries[i]).length == 2, "Invalid country code");
            postCountry[postHashes[i]] = countries[i];
            emit PostCountrySet(postHashes[i], countries[i]);
        }
    }

    /// @notice Get geo data for multiple posts
    function getBatchPostCountries(bytes32[] calldata postHashes) external view returns (string[] memory) {
        string[] memory countries = new string[](postHashes.length);
        
        for (uint256 i = 0; i < postHashes.length; i++) {
            countries[i] = postCountry[postHashes[i]];
        }
        
        return countries;
    }

    /// @notice Emergency function to clear geo data
    function emergencyClearGeoData(bytes32 postHash) external onlyOwner {
        delete postCountry[postHash];
    }
} 