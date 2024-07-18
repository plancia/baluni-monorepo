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

import '@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol';
import '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';
import '@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol';

import '../interfaces/IBaluniV1PoolPeriphery.sol';
import '../interfaces/IBaluniV1Registry.sol';
import '../interfaces/IBaluniV1Rebalancer.sol';
import '../interfaces/IBaluniV1Oracle.sol';
import '../interfaces/IBaluniV1Pool.sol';

contract BaluniV1Pool is
    Initializable,
    UUPSUpgradeable,
    OwnableUpgradeable,
    ERC20Upgradeable,
    ReentrancyGuardUpgradeable,
    PausableUpgradeable,
    IBaluniV1Pool
{
    // An array to store information about different assets in the pool
    AssetInfo[] public assetInfos;

    // A constant value representing 1
    uint256 public ONE;

    // The address of the base asset in the pool
    address public baseAsset;

    // A scaling factor used in calculations
    uint256 private scalingFactor;

    // The registry contract used in the BaluniV1 system
    IBaluniV1Registry public registry;

    /**
     * @dev A mapping that stores the reserves for each address.
     */
    mapping(address => uint256) public reserves;

    /**
     * @dev Modifier to ensure that the provided deadline is not expired.
     * @param deadline The deadline timestamp to check against the current block timestamp.
     * @dev Throws an error if the deadline is expired.
     */
    modifier ensure(uint256 deadline) {
        require(deadline >= block.timestamp, 'EXPIRED');
        _;
    }

    /**
     * @dev Initializes the BaluniV1Pool contract.
     * @param _assets The array of asset addresses.
     * @param _weights The array of asset weights.
     * @param _registry The address of the BaluniV1Registry contract.
     */
    function initialize(
        string memory _name,
        string memory _symbol,
        address[] memory _assets,
        uint256[] memory _weights,
        address _registry
    ) external initializer {
        __Ownable_init(msg.sender);
        __ERC20_init(_name, _symbol);
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();
        __Pausable_init();

        registry = IBaluniV1Registry(_registry);
        ONE = 1e18;
        baseAsset = registry.getUSDC();
        scalingFactor = 10 ** (18 - 6);

        require(baseAsset != address(0), 'Invalid base asset address');
        require(initializeAssets(_assets, _weights), 'Initialization failed');

        uint256 totalWeight = 0;

        for (uint256 i = 0; i < _weights.length; i++) {
            totalWeight += _weights[i];
        }

        require(totalWeight == 10000, 'Invalid weights');
    }

    function reinitialize(
        string memory _name,
        string memory _symbol,
        address[] memory _assets,
        uint256[] memory _weights,
        address _registry,
        uint64 _version
    ) external reinitializer(_version) {
        __Ownable_init(msg.sender);
        __ERC20_init(_name, _symbol);
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();
        __Pausable_init();

        registry = IBaluniV1Registry(_registry);
        ONE = 1e18;
        baseAsset = registry.getUSDC();
        scalingFactor = 10 ** (18 - 6);

        // reset assetInfos

        require(baseAsset != address(0), 'Invalid base asset address');
        require(initializeAssets(_assets, _weights), 'Initialization failed');

        uint256 totalWeight = 0;

        for (uint256 i = 0; i < _weights.length; i++) {
            totalWeight += _weights[i];
        }

        require(totalWeight == 10000, 'Invalid weights');
    }

    /**
     * @dev Internal function to authorize an upgrade to a new implementation contract.
     * @param newImplementation The address of the new implementation contract.
     * @notice This function can only be called by the contract owner.
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    /**
     * @dev Initializes the assets and their weights for the pool.
     * @param _assets The array of asset addresses.
     * @param _weights The array of weights corresponding to each asset.
     */
    function initializeAssets(address[] memory _assets, uint256[] memory _weights) internal returns (bool) {
        address rebalancer = registry.getBaluniRebalancer();

        require(registry.getBaluniRebalancer() != address(0), 'Invalid rebalancer address');
        require(_assets.length == _weights.length, 'Assets and weights length mismatch');
        // reset asset Infos
        delete assetInfos;

        for (uint256 i = 0; i < _assets.length; i++) {
            require(_assets[i] != address(0), 'Invalid asset address');
            require(_weights[i] > 0, 'Invalid weight');

            assetInfos.push(
                AssetInfo({
                    asset: _assets[i],
                    weight: _weights[i],
                    slippage: 0, // Imposta slippage iniziale a 1%
                    reserve: 0
                })
            );

            IERC20 asset = IERC20(_assets[i]);
            if (asset.allowance(address(this), address(rebalancer)) == 0) {
                asset.approve(address(rebalancer), type(uint256).max);
            }
        }
        return true;
    }

    /**
     * @dev Rebalances the weights of the pool by calculating the amounts to add for each token,
     * transferring the calculated amounts from the user to the pool, minting the total added liquidity,
     * updating the reserves, and emitting an event to indicate the rebalancing of weights.
     * @param receiver The address to receive the minted liquidity tokens.
     */
    function rebalanceAndDeposit(address receiver) external override returns (uint256[] memory) {
        require(isRebalanceNeeded(), 'Rebalance not needed');
        (uint256 tVal, uint256[] memory valuations) = _computeTotalValuation();

        uint256[] memory amountsToAdd = _calculateAmountsToAdd(tVal, valuations);
        uint256[] memory amounts = new uint256[](assetInfos.length);
        uint256 totalAddedLiquidity = _calculateTotalAddedLiquidity(amountsToAdd);

        totalAddedLiquidity *= scalingFactor;

        for (uint256 i = 0; i < amountsToAdd.length; i++) {
            if (amountsToAdd[i] > 0) {
                amounts[i] = _calculateLiquidity(i, amountsToAdd[i]);
                IERC20(assetInfos[i].asset).transferFrom(msg.sender, address(this), amountsToAdd[i]);
            }
        }

        _mint(receiver, totalAddedLiquidity);

        _updateSlippage();
        _update();

        emit WeightsRebalanced(msg.sender, amountsToAdd);

        return amounts;
    }

    /**
     * @dev Swaps `amount` of `fromToken` to `toToken` and transfers the received amount to `receiver`.
     *
     * Requirements:
     * - `fromToken` and `toToken` must be different tokens.
     * - `amount` must be greater than zero.
     * - Sufficient liquidity of `toToken` must be available in the contract.
     *
     * Emits a `Swap` event with the details of the swap.
     *
     * Updates the reserves after the swap.
     *
     * @param fromToken The address of the token to swap from.
     * @param toToken The address of the token to swap to.
     * @param amount The amount of `fromToken` to swap.
     * @param receiver The address to receive the swapped tokens.
     * @return amountOut The amount of `toToken` received after the swap.
     */
    function swap(
        address fromToken,
        address toToken,
        uint256 amount,
        uint256 minAmount,
        address receiver,
        uint256 deadline
    ) external override ensure(deadline) nonReentrant returns (uint256 amountOut, uint256 fee) {
        require(fromToken != address(0) && toToken != address(0), 'Invalid token address');
        require(fromToken != toToken, 'Cannot swap the same token');
        require(amount > 0, 'Amount must be greater than zero');
        require(receiver != address(0), 'Invalid receiver address');

        bool transferInSuccess = IERC20(fromToken).transferFrom(msg.sender, address(this), amount);
        require(transferInSuccess, 'Token transfer failed');

        uint256 receivedAmount = quotePotentialSwap(fromToken, toToken, amount);
        require(getAssetReserve(toToken) >= receivedAmount, 'Insufficient Liquidity');

        fee = _haircut(receivedAmount);
        amountOut = receivedAmount - fee;
        require(amountOut > 0, 'Amount to send must be greater than 0');
        require(amountOut >= minAmount, 'Amount out must be greater than min amount');

        bool transferOutSuccess = IERC20(toToken).transfer(receiver, amountOut);
        require(transferOutSuccess, 'Token transfer failed');

        _updateSlippage();
        _update();

        emit Swap(receiver, fromToken, toToken, amount, amountOut);

        return (amountOut, fee);
    }

    /**
     * @dev Calculates the potential amount of `toToken` that can be obtained by swapping `amount` of `fromToken`.
     * This function takes into account the slippage and token weights to provide an accurate estimation.
     *
     * @param fromToken The address of the token being swapped from.
     * @param toToken The address of the token being swapped to.
     * @param amount The amount of `fromToken` being swapped.
     *
     * @return The potential amount of `toToken` that can be obtained.
     */
    function quotePotentialSwap(
        address fromToken,
        address toToken,
        uint256 amount
    ) public view override returns (uint256) {
        uint256 amountOut = getAmountOut(fromToken, toToken, amount);

        uint256 slippageFrom = getSlippage(fromToken);
        uint256 slippageTo = getSlippage(toToken);

        uint256 fromTokenWeight = getTokenWeight(fromToken);
        uint256 toTokenWeight = getTokenWeight(toToken);

        uint256 slippageFromAmount = ((amountOut * slippageFrom)) / 10000;
        uint256 slippageToAmount = (amountOut * slippageTo) / 10000;

        if (fromTokenWeight > getDeviationForToken(fromToken)) {
            amountOut = amountOut - slippageFromAmount;
        } else {
            amountOut = amountOut + slippageFromAmount;
        }

        if (toTokenWeight < getDeviationForToken(toToken)) {
            amountOut = amountOut + slippageToAmount;
        } else {
            amountOut = amountOut - slippageToAmount;
        }

        return amountOut;
    }

    /**
     * @dev Restituisce lo slippage attuale per un dato token.
     * @param token The address of the token.
     * @return Lo slippage attuale per il token.
     */
    function getSlippage(address token) public view override returns (uint256) {
        for (uint256 i = 0; i < assetInfos.length; i++) {
            if (assetInfos[i].asset == token) {
                return assetInfos[i].slippage;
            }
        }
        return 0; // Default slippage se non trovato
    }

    /**
     * @dev Updates the slippage for each asset in the pool based on the deviations.
     * @notice This function is internal and should only be called within the contract.
     */
    function _updateSlippage() internal {
        (bool[] memory directions, uint256[] memory deviations) = getDeviations();

        uint256 sdf = 100;
        uint256 slippageLimit = 10;

        for (uint256 i = 0; i < assetInfos.length; i++) {
            uint256 previousSlippage = assetInfos[i].slippage;

            if (deviations[i] <= sdf) {
                assetInfos[i].slippage = slippageLimit;
                continue;
            }

            if (directions[i]) {
                assetInfos[i].slippage += deviations[i] / sdf;
                require(assetInfos[i].slippage >= previousSlippage, 'Overflow incrementing slippage');
            } else {
                if (assetInfos[i].slippage > deviations[i] / sdf) {
                    assetInfos[i].slippage -= deviations[i] / sdf;
                    require(assetInfos[i].slippage <= previousSlippage, 'Underflow decrementing slippage');
                } else {
                    assetInfos[i].slippage += deviations[i] / sdf;
                }
            }

            // Limita lo slippage al massimo consentito
            if (assetInfos[i].slippage > slippageLimit) {
                assetInfos[i].slippage = slippageLimit;
            }
        }
    }

    /**
     * @dev Returns the weight of a token in the pool.
     * @param token The address of the token.
     * @return The weight of the token.
     */
    function getTokenWeight(address token) public view override returns (uint256) {
        for (uint256 i = 0; i < assetInfos.length; i++) {
            if (assetInfos[i].asset == token) {
                return assetInfos[i].weight;
            }
        }
        return 0; // Default weight if not found
    }

    /**
     * @dev Returns the deviation for a token in the pool.
     * @param token The address of the token.
     * @return The deviation for the token.
     */
    function getDeviationForToken(address token) public view override returns (uint256) {
        (, uint256[] memory deviations) = getDeviations();
        for (uint256 i = 0; i < assetInfos.length; i++) {
            if (assetInfos[i].asset == token) {
                return deviations[i];
            }
        }
        return 0;
    }

    /**
     * @dev Returns an array of slippage parameters for each token in the pool.
     * @return An array of slippage parameters.
     */
    function getSlippageParams() external view override returns (uint256[] memory) {
        uint256[] memory slippages = new uint256[](assetInfos.length);
        for (uint256 i = 0; i < assetInfos.length; i++) {
            slippages[i] = assetInfos[i].slippage;
        }
        return slippages;
    }

    /**
     * @dev Mints new tokens and adds them to the specified address.
     * @param to The address to which the new tokens will be minted.
     * @return The amount of tokens minted.
     */
    function deposit(
        address to,
        uint256[] memory amounts,
        uint256 deadline
    ) external override ensure(deadline) nonReentrant whenNotPaused returns (uint256) {
        uint256 totalSupply = totalSupply();
        uint256 totalValue = 0;
        uint256[] memory _reserves = getReserves();
        require(assetInfos.length == _reserves.length, 'Invalid reserves length');
        require(assetInfos.length > 0, 'No assets');

        for (uint256 i = 0; i < assetInfos.length; i++) {
            address asset = assetInfos[i].asset;
            bool success = IERC20(asset).transferFrom(msg.sender, address(this), amounts[i]);
            require(success, 'BaluniV1Pool: Transfer from failed');

            uint256 valuation;

            if (asset == baseAsset) {
                valuation = amounts[i];
                totalValue += valuation;
                continue;
            }

            valuation = _convertTokenToBase(asset, amounts[i]);
            totalValue += valuation;
        }

        require(totalValue > 0, 'Total value must be greater than 0');

        uint256 toMint;

        if (totalSupply == 0) {
            toMint = totalValue * scalingFactor;
        } else {
            (uint256 totalLiquidity, ) = _computeTotalValuation();
            require(totalLiquidity > 0, 'Total liquidity must be greater than 0');
            toMint = ((totalValue * scalingFactor) * totalSupply) / (totalLiquidity * scalingFactor);
        }

        require(toMint != 0, 'Mint qty is 0');

        _mint(to, toMint);

        _updateSlippage();
        _update();

        emit Deposit(to, toMint);

        return toMint;
    }

    /**
     * @dev Burns the pool tokens and transfers the underlying assets to the specified address.
     * @param to The address to transfer the underlying assets to.
     * @notice This function can only be called by the periphery contract.
     * @notice The pool tokens must have a balance greater than 0.
     * @notice The total supply of pool tokens must be greater than 0.
     * @notice The function calculates the amounts of each underlying asset to transfer based on the share of pool tokens being burned.
     * @notice A fee is deducted from the share of pool tokens being burned and transferred to the treasury address.
     * @notice The function checks if the pool has sufficient liquidity before performing any transfers.
     * @notice If any transfer fails, the function reverts the entire operation.
     * @notice After the transfers, the function updates the reserves of the pool.
     * @notice Emits a `Burn` event with the address and share of pool tokens burned.
     */
    function withdraw(
        uint256 share,
        address to,
        uint256 deadline
    ) external override ensure(deadline) nonReentrant whenNotPaused returns (uint256) {
        require(to != address(0), 'Invalid address');
        require(share > 0, 'Share must be greater than 0');

        uint256 allowance = IERC20(address(this)).allowance(msg.sender, address(this));
        require(allowance >= share, 'BaluniV1Pool: Insufficient Allowance');

        bool transferResult = IERC20(address(this)).transferFrom(msg.sender, address(this), share);
        require(transferResult, 'Transfer From Failed');

        uint256 totalSupply = totalSupply();
        require(totalSupply > 0, 'No liquidity');

        address treasury = registry.getTreasury();
        require(treasury != address(0), 'Invalid treasury address');

        for (uint256 i = 0; i < assetInfos.length; i++) {
            uint256 amountToSend = calculateAssetShare(share)[i];
            require(
                IERC20(assetInfos[i].asset).balanceOf(address(this)) >= amountToSend,
                'BaluniV1Pool: Insufficient Asset Balance'
            );

            uint256 fee = _haircut(amountToSend);
            amountToSend -= fee;
            bool transferProtocolSuccess = IERC20(assetInfos[i].asset).transfer(treasury, fee);
            require(transferProtocolSuccess, 'BaluniV1Pool: Fee Transfer Failed');

            bool transferSuccess = IERC20(assetInfos[i].asset).transfer(to, amountToSend);
            require(transferSuccess, 'Asset transfer failed');
        }

        require(balanceOf(address(this)) >= share, 'Insufficient BALUNI liquidity');

        _burn(address(this), share);

        _updateSlippage();
        _update();

        emit Withdraw(to, share);

        return share;
    }

    /**
     * @dev Calculates the asset shares based on the provided share amount.
     * @param share The share amount to calculate the asset shares for.
     * @return An array of asset shares corresponding to each asset in the pool.
     */
    function calculateAssetShare(uint256 share) public view returns (uint256[] memory) {
        uint256 fee = _haircut(share);
        uint256 shareAfterFee = share - fee;
        uint256[] memory assetShares = new uint256[](assetInfos.length);
        for (uint256 i = 0; i < assetInfos.length; i++) {
            uint256 assetBalance = IERC20(assetInfos[i].asset).balanceOf(address(this));
            assetShares[i] = (assetBalance * shareAfterFee) / totalSupply();
        }
        return assetShares;
    }

    /**
     * @dev Calculates the fee amount based on the provided amount using the haircut formula.
     * @param amount The amount to calculate the fee for.
     * @return The fee amount.
     */
    function _haircut(uint256 amount) internal view returns (uint256) {
        uint256 _BPS_FEE = registry.getBPS_FEE();
        uint256 _BPS_BASE = registry.getBPS_BASE();
        return (amount * _BPS_FEE) / _BPS_BASE;
    }

    /**
     * @dev Calculates the amount of `toToken` that will be received when swapping `fromToken` for `toToken`.
     * @param fromToken The address of the token being swapped from.
     * @param toToken The address of the token being swapped to.
     * @param amount The amount of `fromToken` being swapped.
     * @return The amount of `toToken` that will be received.
     */
    function getAmountOut(address fromToken, address toToken, uint256 amount) public view override returns (uint256) {
        IBaluniV1Oracle baluniOracle = IBaluniV1Oracle(registry.getBaluniOracle());
        require(registry.getBaluniOracle() != address(0), 'Invalid oracle address');
        uint256 amountOut = baluniOracle.convert(fromToken, toToken, amount);
        return amountOut;
    }

    /**
     * @dev Performs rebalance
     */
    function rebalance() external override {
        require(isRebalanceNeeded(), 'Rebalance not needed');
        return _performRebalanceIfNeeded();
    }

    /**
     * @dev Returns the deviation between the current weights and target weights of the assets in the pool.
     * @return directions An array of boolean values indicating whether the current weight is higher (true) or lower (false) than the target weight.
     */
    function getDeviations() public view override returns (bool[] memory directions, uint256[] memory deviations) {
        (uint256 totVal, uint256[] memory valuations) = _computeTotalValuation();
        uint256 numAssets = assetInfos.length;

        directions = new bool[](numAssets);
        deviations = new uint256[](numAssets);

        for (uint256 i = 0; i < numAssets; i++) {
            uint256 currentWeight = (valuations[i] * 10000) / totVal;
            uint256 targetWeight = assetInfos[i].weight;

            if (currentWeight > targetWeight) {
                deviations[i] = currentWeight - targetWeight;
                directions[i] = true;
            } else {
                deviations[i] = targetWeight - currentWeight;
                directions[i] = false;
            }
        }

        return (directions, deviations);
    }

    /**
     * @dev Returns the liquidity of a specific asset in the pool.
     * @param assetIndex The index of the asset.
     * @return The liquidity of the asset.
     */
    function assetLiquidity(uint256 assetIndex) external view override returns (uint256) {
        (, uint256[] memory usdValuations) = _computeTotalValuation();
        require(assetIndex < usdValuations.length, 'Invalid asset index');
        return usdValuations[assetIndex];
    }

    /**
     * @dev Computes the total valuation of the pool and returns the total valuation and an array of individual valuations.
     * @return totalVal The total valuation of the pool.
     * @return valuations An array of individual valuations.
     */
    function totalValuation() external view override returns (uint256 totalVal, uint256[] memory valuations) {
        (totalVal, valuations) = _computeTotalValuation();
        return (totalVal, valuations);
    }

    /**
     * @dev Returns the total liquidity of the pool.
     * @return The total liquidity of the pool.
     */
    function liquidity() external view override returns (uint256) {
        (uint256 totalVal, ) = _computeTotalValuation();
        return totalVal;
    }

    /**
     * @dev Returns the unit price of the pool.
     * @return The unit price of the pool.
     */
    function unitPrice() external view override returns (uint256) {
        uint256 baseDecimal = IERC20Metadata(baseAsset).decimals();
        uint256 factor = 10 ** (18 - baseDecimal);
        uint256 supply = totalSupply();

        if (supply == 0) {
            return 0;
        }

        (uint256 tVal, ) = _computeTotalValuation();

        if (tVal == 0) {
            return 0;
        }

        // Ensure scaling is done properly to avoid precision loss
        uint256 scaledTotalVal = tVal * factor;
        uint256 unitPriceScaledDown = (scaledTotalVal * ONE) / supply;

        return unitPriceScaledDown;
    }

    /**
     * @dev Returns an array of reserves for each asset in the pool.
     * @return An array of reserves.
     */
    function getReserves() public view override returns (uint256[] memory) {
        uint256[] memory _reserves = new uint256[](assetInfos.length);

        for (uint256 i = 0; i < assetInfos.length; i++) {
            _reserves[i] = IERC20(assetInfos[i].asset).balanceOf(address(this));
        }

        return _reserves;
    }

    /**
     * @dev Returns the reserve amount of the specified asset.
     * @param asset The address of the asset.
     * @return The reserve amount of the asset.
     */
    function getAssetReserve(address asset) public view override returns (uint256) {
        for (uint256 i = 0; i < assetInfos.length; i++) {
            if (asset == assetInfos[i].asset) return IERC20(asset).balanceOf(address(this));
        }
    }

    /**
     * @dev Retrieves the list of assets in the pool.
     * @return An array of addresses representing the assets.
     */
    function getAssets() public view override returns (address[] memory) {
        address[] memory assets = new address[](assetInfos.length);
        for (uint256 i = 0; i < assetInfos.length; i++) {
            assets[i] = assetInfos[i].asset;
        }
        return assets;
    }

    /**
     * @dev Retrieves the list of weights associated with the assets in the pool.
     * @return An array of uint256 values representing the weights.
     */
    function getWeights() public view override returns (uint256[] memory) {
        uint256[] memory weights = new uint256[](assetInfos.length);
        for (uint256 i = 0; i < assetInfos.length; i++) {
            weights[i] = assetInfos[i].weight;
        }
        return weights;
    }

    /**
     * @dev Checks if rebalancing is needed for the pool.
     * @return A boolean value indicating whether rebalancing is needed or not.
     */
    function isRebalanceNeeded() public view returns (bool) {
        uint256 rebalance_threshold = registry.getREBALANCE_THRESHOLD();
        (bool[] memory directions, uint256[] memory deviations) = getDeviations();
        for (uint256 i = 0; i < deviations.length; i++) {
            if (directions[i] && deviations[i] > rebalance_threshold) {
                return true;
            }
        }
        return false;
    }

    /**
     * @dev Computes the total valuation of the assets in the pool.
     * @return tVal The total valuation of the assets.
     * @return valuations An array of valuations for each asset in the pool.
     */
    function _computeTotalValuation() internal view returns (uint256 tVal, uint256[] memory valuations) {
        uint256 numAssets = assetInfos.length;
        valuations = new uint256[](numAssets);
        for (uint256 i = 0; i < numAssets; i++) {
            address asset = assetInfos[i].asset;
            uint256 assetReserve = getAssetReserve(address(asset));

            if (assetReserve == 0) continue;

            if ((address(asset) == baseAsset)) {
                valuations[i] = assetReserve;
            } else {
                uint256 valuation = _convertTokenToBase(address(asset), assetReserve);
                valuations[i] = valuation;
            }
            tVal += valuations[i];
        }
        return (tVal, valuations);
    }

    /**
     * @dev Performs rebalance if needed.
     * This function retrieves the assets and weights from the `assetInfos` array,
     * and calls the `rebalance` function of the `rebalancer` contract with the retrieved values.
     * It emits a `RebalancePerformed` event after the rebalance is performed.
     * @notice This function should only be called internally.
     */
    function _performRebalanceIfNeeded() internal {
        address rebalancer = registry.getBaluniRebalancer();
        address[] memory assets = getAssets();
        uint256[] memory weights = getWeights();

        for (uint256 i = 0; i < assetInfos.length; i++) {
            uint256 allowance = IERC20(assetInfos[i].asset).allowance(address(this), rebalancer);
            if (allowance < type(uint256).max) {
                IERC20(assetInfos[i].asset).approve(rebalancer, type(uint256).max);
            }
        }

        uint256[] memory balances = getReserves();
        uint256 rebalance_threshold = registry.getREBALANCE_THRESHOLD();
        IBaluniV1Rebalancer(rebalancer).rebalance(
            balances,
            assets,
            weights,
            rebalance_threshold,
            address(this),
            address(this),
            baseAsset
        );

        _updateSlippage();
        _update();

        emit RebalancePerformed(msg.sender, assets);
    }

    /**
     * @dev Calculates the total added liquidity based on the amounts to add.
     * @param amountsToAdd An array of amounts to add for each asset.
     * @return totalAddedLiquidity The total added liquidity.
     */
    function _calculateTotalAddedLiquidity(
        uint256[] memory amountsToAdd
    ) internal view returns (uint256 totalAddedLiquidity) {
        for (uint256 i = 0; i < assetInfos.length; i++) {
            totalAddedLiquidity += amountsToAdd[i];
        }
        return totalAddedLiquidity;
    }

    /**
     * @dev Calculates the amounts to add to each asset based on the total valuation and current valuations.
     * @param tVal The total valuation of the pool.
     * @param valuations An array of current valuations for each asset.
     * @return amountsToAdd An array of amounts to add to each asset.
     */
    function _calculateAmountsToAdd(
        uint256 tVal,
        uint256[] memory valuations
    ) internal view returns (uint256[] memory amountsToAdd) {
        amountsToAdd = new uint256[](assetInfos.length);
        for (uint256 i = 0; i < assetInfos.length; i++) {
            uint256 targetValuation = (tVal * assetInfos[i].weight) / 10000;
            if (valuations[i] < targetValuation) {
                amountsToAdd[i] = targetValuation - valuations[i];
            }
        }

        return amountsToAdd;
    }

    /**
     * @dev Internal function to transfer tokens from the caller to the contract and calculate the liquidity.
     * @param index The index of the asset in the assetInfos array.
     * @param amountToAdd The amount of native tokens to add as liquidity.
     */
    function _calculateLiquidity(uint256 index, uint256 amountToAdd) internal view returns (uint256) {
        if (assetInfos[index].asset == baseAsset) return amountToAdd;
        uint256 tokenAmount = _convertBaseToToken(assetInfos[index].asset, amountToAdd);
        require(tokenAmount > 0, 'Invalid token amount to add');
        return tokenAmount;
    }

    /**
     * @dev Converts the specified amount of native token to the corresponding token amount.
     * @param toToken The address of the native token to convert from.
     * @param amount The amount of native token to convert.
     * @return The corresponding token amount.
     */
    function _convertBaseToToken(address toToken, uint256 amount) internal view returns (uint256) {
        return getAmountOut(baseAsset, toToken, amount);
    }

    /**
     * @dev Converts the specified token to the native token using the rebalancer contract.
     * @param fromToken The address of the token to convert from.
     * @param amount The amount of tokens to convert.
     * @return tokenAmount The converted amount of tokens.
     */
    function _convertTokenToBase(address fromToken, uint256 amount) internal view returns (uint256 tokenAmount) {
        return getAmountOut(fromToken, baseAsset, amount);
    }

    /**
     * @dev Generates the name for the pool token based on the symbols of the assets.
     * @param _assets The array of asset addresses.
     * @return The generated token name.
     */
    function generateTokenName(address[] memory _assets) internal pure returns (string memory) {
        string memory name = 'Baluni Liquidity Pool';
        return name;
    }

    /**
     * @dev Generates the symbol for the pool token based on the symbols of the assets.
     * @param _assets The array of asset addresses.
     * @return The generated token symbol.
     */
    function generateTokenSymbol(address[] memory _assets) internal view returns (string memory) {
        string memory symbol = 'bLP-';
        for (uint256 i = 0; i < _assets.length; i++) {
            if (i == 0) {
                symbol = string(abi.encodePacked(symbol, IERC20Metadata(_assets[i]).symbol()));
            } else {
                symbol = string(abi.encodePacked(symbol, '-', IERC20Metadata(_assets[i]).symbol()));
            }
        }
        return symbol;
    }

    /**
     * @dev pause pool, restricting certain operations
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev unpause pool, enabling certain operations
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    function _update() internal {
        for (uint256 i = 0; i < assetInfos.length; i++) {
            assetInfos[i].reserve = IERC20(assetInfos[i].asset).balanceOf(address(this));
        }
    }
}
