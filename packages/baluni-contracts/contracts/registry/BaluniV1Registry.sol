// SPDX-License-Identifier: GNU AGPLv3
pragma solidity 0.8.25;

/**
 *  __                  __                      __
 * /  |                /  |                    /  |
 * $$ |____    ______  $$ | __    __  _______  $$/
 * $$      \  /      \ $$ |/  |  /  |/       \ /  |
 * $$$$$$$  | $$$$$$  |$$ |$$ |  $$ |$$$$$$$  |$$ |
 * $$ |  $$ | /    $$ |$$ |$$ |  $$ |$$ |  $$ |$$ |
 * $$ |__$$ |/$$$$$$$ |$$ |$$ \__$$ |$$ |  $$ |$$ |
 * $$    $$/ $$    $$ |$$ |$$    $$/ $$ |  $$ |$$ |
 * $$$$$$$/   $$$$$$$/ $$/  $$$$$$/  $$/   $$/ $$/
 *
 *
 *                  ,-""""-.
 *                ,'      _ `.
 *               /       )_)  \
 *              :              :
 *              \              /
 *               \            /
 *                `.        ,'
 *                  `.    ,'
 *                    `.,'
 *                     /\`.   ,-._
 *                         `-'    \__
 *                              .
 *               s                \
 *                                \\
 *                                 \\
 *                                  >\/7
 *                              _.-(6'  \
 *                             (=___._/` \
 *                                  )  \ |
 *                                 /   / |
 *                                /    > /
 *                               j    < _\
 *                           _.-' :      ``.
 *                           \ r=._\        `.
 */

import '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';
import '@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol';
import '../interfaces/IBaluniV1Registry.sol';

contract BaluniV1Registry is Initializable, OwnableUpgradeable, UUPSUpgradeable, IBaluniV1Registry {
    address public uniswapFactory;
    address public uniswapRouter;
    address public baluniAgentFactory;
    address public baluniPoolPeriphery;
    address public baluniPoolRegistry;
    address public baluniRebalancer;
    address public baluniRouter;
    address public baluniRegistry;
    address public baluniOracle;
    address public baluniSwapper;
    address public baluniYearnVaultRegistry;
    address public baluniDCAVaultRegistry;

    address public treasury;
    address public staticOracle;
    address public WNATIVE;
    address public USDC;
    address public _1inchSpotAgg;
    uint256 public _MAX_BPS_FEE;
    uint256 public _BPS_FEE;
    uint256 public _BPS_BASE;
    uint256 public _REBALANCE_THRESHOLD;

    function initialize() public initializer {
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
        _MAX_BPS_FEE = 100;
        _BPS_FEE = 30;
        _BPS_BASE = 10000;
        _REBALANCE_THRESHOLD = 100;
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    function setTreasury(address _treasury) external override onlyOwner {
        treasury = _treasury;
    }

    function setUniswapFactory(address _uniswapFactory) external override onlyOwner {
        uniswapFactory = _uniswapFactory;
    }

    function setUniswapRouter(address _uniswapRouter) external override onlyOwner {
        uniswapRouter = _uniswapRouter;
    }

    function setBaluniSwapper(address _baluniSwapper) external override onlyOwner {
        baluniSwapper = _baluniSwapper;
    }

    function setBaluniOracle(address _baluniOracle) external override onlyOwner {
        baluniOracle = _baluniOracle;
    }

    function setBaluniAgentFactory(address _baluniAgentFactory) external override onlyOwner {
        baluniAgentFactory = _baluniAgentFactory;
    }

    function setBaluniPoolPeriphery(address _baluniPoolPeriphery) external override onlyOwner {
        baluniPoolPeriphery = _baluniPoolPeriphery;
    }

    function setBaluniPoolRegistry(address _baluniPoolRegistry) external override onlyOwner {
        baluniPoolRegistry = _baluniPoolRegistry;
    }

    function setBaluniRebalancer(address _baluniRebalancer) external override onlyOwner {
        baluniRebalancer = _baluniRebalancer;
    }

    function setBaluniYearnVaultRegistry(address _baluniYearnVaultRegistry) external override onlyOwner {
        baluniYearnVaultRegistry = _baluniYearnVaultRegistry;
    }

    function setBaluniRouter(address _baluniRouter) external override onlyOwner {
        baluniRouter = _baluniRouter;
    }

    function setBaluniRegistry(address _baluniRegistry) external override onlyOwner {
        baluniRegistry = _baluniRegistry;
    }

    function setWNATIVE(address _WNATIVE) external override onlyOwner {
        WNATIVE = _WNATIVE;
    }

    function setUSDC(address _USDC) external override onlyOwner {
        USDC = _USDC;
    }

    function set1inchSpotAgg(address __1inchSpotAgg) external override onlyOwner {
        _1inchSpotAgg = __1inchSpotAgg;
    }

    function setStaticOracle(address _staticOracle) external override onlyOwner {
        staticOracle = _staticOracle;
    }

    function setBaluniDCAVaultRegistry(address _baluniDCAVaultRegistry) external override onlyOwner {
        baluniDCAVaultRegistry = _baluniDCAVaultRegistry;
    }

    function setBPS_FEE(uint256 __BPS_FEE) external override onlyOwner {
        _BPS_FEE = __BPS_FEE;
    }

    function setREBALANCE_THRESHOLD(uint256 __REBALANCE_THRESHOLD) external override onlyOwner {
        _REBALANCE_THRESHOLD = __REBALANCE_THRESHOLD;
    }

    function getUniswapFactory() external view override returns (address) {
        return uniswapFactory;
    }

    function getUniswapRouter() external view override returns (address) {
        return uniswapRouter;
    }

    function getBaluniSwapper() external view override returns (address) {
        return baluniSwapper;
    }

    function getBaluniOracle() external view override returns (address) {
        return baluniOracle;
    }

    function getBaluniAgentFactory() external view override returns (address) {
        return baluniAgentFactory;
    }

    function getBaluniPoolPeriphery() external view override returns (address) {
        return baluniPoolPeriphery;
    }

    function getBaluniPoolRegistry() external view override returns (address) {
        return baluniPoolRegistry;
    }

    function getBaluniRebalancer() external view override returns (address) {
        return baluniRebalancer;
    }

    function getBaluniRouter() external view override returns (address) {
        return baluniRouter;
    }

    function getBaluniRegistry() external view override returns (address) {
        return baluniRegistry;
    }

    function getWNATIVE() external view override returns (address) {
        return WNATIVE;
    }

    function getUSDC() external view override returns (address) {
        return USDC;
    }

    function get1inchSpotAgg() external view override returns (address) {
        return _1inchSpotAgg;
    }

    function getBPS_FEE() external view override returns (uint256) {
        return _BPS_FEE;
    }

    function getMAX_BPS_FEE() external view override returns (uint256) {
        return _MAX_BPS_FEE;
    }

    function getBPS_BASE() external view override returns (uint256) {
        return _BPS_BASE;
    }

    function getREBALANCE_THRESHOLD() external view override returns (uint256) {
        return _REBALANCE_THRESHOLD;
    }

    function getTreasury() external view override returns (address) {
        return treasury;
    }

    function getStaticOracle() external view override returns (address) {
        return staticOracle;
    }

    function getBaluniYearnVaultRegistry() external view override returns (address) {
        return baluniYearnVaultRegistry;
    }

    function getBaluniDCAVaultRegistry() external view override returns (address) {
        return baluniDCAVaultRegistry;
    }

    // v1
    address public uniswapQuoter;

    function setUniswapQuoter(address _uniswapQuoter) external override onlyOwner {
        uniswapQuoter = _uniswapQuoter;
    }

    function getUniswapQuoter() external view override returns (address) {
        return uniswapQuoter;
    }

    // v2

    address public baluniPoolZap;

    function setBaluniPoolZap(address _baluniPoolZap) external override onlyOwner {
        baluniPoolZap = _baluniPoolZap;
    }

    function getBaluniPoolZap() external view override returns (address) {
        return baluniPoolZap;
    }

    // v3

    address public baluniHyperPoolZap;

    function setBaluniHyperPoolZap(address _baluniHyperPoolZap) external override onlyOwner {
        baluniHyperPoolZap = _baluniHyperPoolZap;
    }

    function getBaluniHyperPoolZap() external view override returns (address) {
        return baluniHyperPoolZap;
    }
}
