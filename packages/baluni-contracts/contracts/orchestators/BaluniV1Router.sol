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
import '@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol';
import '@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol';
import '@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol';
import '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';

import '../interfaces/IBaluniV1Agent.sol';
import '../interfaces/IBaluniV1AgentFactory.sol';
import '../interfaces/IBaluniV1Rebalancer.sol';
import '../interfaces/I1inchSpotAgg.sol';
import '../interfaces/IBaluniV1Oracle.sol';
import '../libs/EnumerableSetUpgradeable.sol';
import '../interfaces/IBaluniV1Swapper.sol';
import '../interfaces/IBaluniV1Registry.sol';

contract BaluniV1Router is
    Initializable,
    ERC20Upgradeable,
    OwnableUpgradeable,
    ReentrancyGuardUpgradeable,
    UUPSUpgradeable
{
    struct Call {
        address to;
        uint256 value;
        bytes data;
    }

    EnumerableSetUpgradeable.AddressSet private tokens;

    IBaluniV1Registry public registry;

    using EnumerableSetUpgradeable for EnumerableSetUpgradeable.AddressSet;

    address public baseAsset;

    event Execute(address user, IBaluniV1Agent.Call[] calls, address[] tokensReturn);
    event Burn(address user, uint256 value);
    event Mint(address user, uint256 value);
    event Log(string message, uint256 value);

    /**
     * @dev Initializes the BaluniV1Router contract.
     * It sets the initial values for various variables and mints 1 ether to the contract's address.
     * It also sets the USDC token address, WNATIVE token address, oracle address, Uniswap router address, and Uniswap factory address.
     * Finally, it adds the USDC token address to the tokens set.
     */
    function initialize(address _registry) public initializer {
        __ERC20_init('Baluni', 'BALUNI');
        __Ownable_init(msg.sender);
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();
        _mint(address(this), 1 ether);

        registry = IBaluniV1Registry(_registry);
        baseAsset = registry.getUSDC();
    }

    function reinitialize(address _registry, uint64 version) public reinitializer(version) {
        // __UUPSUpgradeable_init();
        // __Ownable_init(msg.sender);
        registry = IBaluniV1Registry(_registry);
    }

    function resetContract(address _registry) public onlyOwner {
        registry = IBaluniV1Registry(_registry);
    }

    /**
     * @dev Internal function to authorize an upgrade to a new implementation contract.
     * @param newImplementation The address of the new implementation contract.
     * @notice This function can only be called by the contract owner.
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    /**
     * @dev Returns the unit price of the token in USDC.
     * @return The unit price of the token in USDC.
     */
    function unitPrice() public view returns (uint256) {
        return _calculateBaluniToUSDC(1e18);
    }

    /**
     * @dev Executes a series of calls to a BaluniV1Agent contract and handles token returns.
     * @param calls An array of IBaluniV1Agent.Call structs representing the calls to be executed.
     * @param tokensReturn An array of addresses representing the tokens to be returned.
     * @notice This function requires the agentFactory to be set and creates a new agent if necessary.
     * @notice If a token is new and a Uniswap pool exists for it, the token is added to the tokens set.
     * @notice If no Uniswap pool exists for a token, the token balance is transferred back to the caller.
     */
    function execute(IBaluniV1Agent.Call[] memory calls, address[] memory tokensReturn) external nonReentrant {
        address agentFactory = registry.getBaluniAgentFactory();
        address uniswapFactory = registry.getUniswapFactory();
        address WNATIVE = registry.getWNATIVE();
        address USDC = registry.getUSDC();

        require(address(agentFactory) != address(0), 'Agent factory not set');
        address agent = IBaluniV1AgentFactory(agentFactory).getOrCreateAgent(msg.sender);
        bool[] memory isTokenNew = new bool[](tokensReturn.length);
        uint256[] memory tokenBalances = new uint256[](tokensReturn.length);

        for (uint256 i = 0; i < tokensReturn.length; i++) {
            isTokenNew[i] = !EnumerableSetUpgradeable.contains(tokens, tokensReturn[i]);
            tokenBalances[i] = IERC20(tokensReturn[i]).balanceOf(address(this));
        }

        IBaluniV1Agent(agent).execute(calls, tokensReturn);

        for (uint256 i = 0; i < tokensReturn.length; i++) {
            address token = tokensReturn[i];
            uint256 balance = IERC20(token).balanceOf(address(this));
            address poolNative3000 = IUniswapV3Factory(uniswapFactory).getPool(token, address(WNATIVE), 3000);
            address poolNative500 = IUniswapV3Factory(uniswapFactory).getPool(token, address(WNATIVE), 500);
            address poolUSDC500 = IUniswapV3Factory(uniswapFactory).getPool(token, address(USDC), 500);
            address poolUSDC3000 = IUniswapV3Factory(uniswapFactory).getPool(token, address(USDC), 3000);
            bool poolExist = poolNative3000 != address(0) ||
                poolNative500 != address(0) ||
                poolUSDC3000 != address(0) ||
                poolUSDC500 != address(0);

            if (isTokenNew[i] && poolExist) {
                EnumerableSetUpgradeable.add(tokens, token);
            }

            uint256 amountReceived = balance - tokenBalances[i];

            if (!poolExist) {
                IERC20(token).transfer(msg.sender, amountReceived);
                return;
            }

            address treasury = registry.getTreasury();
            uint256 _BPS_FEE = registry.getBPS_FEE();
            uint256 _BPS_BASE = registry.getBPS_BASE();

            if (balance > tokenBalances[i]) {
                uint256 fee = (amountReceived * _BPS_FEE) / _BPS_BASE;
                IERC20(token).transfer(treasury, fee);
            }
        }
    }

    /**
     * @dev Liquidates the specified token by swapping it for USDC.
     * @param token The address of the token to be liquidated.
     * @notice The contract must have sufficient approval to spend the specified token.
     * @notice If a pool exists for the token and USDC on Uniswap, a direct swap is performed.
     * @notice If no pool exists, a multi-hop swap is performed through the WNATIVE token.
     * @notice If the swap fails, the `burn` function should be called to handle the failed swap.
     */
    function liquidate(address token) public {
        address WNATIVE = registry.getWNATIVE();
        address baluniSwapper = registry.getBaluniSwapper();

        uint256 totalERC20Balance = IERC20(token).balanceOf(address(this));
        bool haveBalance = totalERC20Balance > 0;
        IERC20(token).approve(baluniSwapper, totalERC20Balance);

        if (!haveBalance) return;

        try IBaluniV1Swapper(baluniSwapper).singleSwap(token, baseAsset, totalERC20Balance, address(this)) {
            return;
        } catch {
            uint256 multiHopSwapResult = IBaluniV1Swapper(baluniSwapper).multiHopSwap(
                token,
                address(WNATIVE),
                baseAsset,
                totalERC20Balance,
                address(this)
            );

            require(multiHopSwapResult > 0, 'Muti Hop Swap Failed, Try Burn()');
            return;
        }
    }

    /**
     * @dev Liquidates all tokens in the contract.
     * This function iterates through all the tokens in the contract and calls the `liquidate` function for each token.
     * Can only be called by the contract owner.
     */
    function liquidateAll() public nonReentrant {
        uint256 length = tokens.length();
        for (uint256 i = 0; i < length; i++) {
            address token = tokens.at(i);
            if (token == baseAsset) continue;
            liquidate(token);
        }
    }

    /**
     * @dev Burns a specified amount of BALUNI tokens from the caller's balance.
     * @param burnAmount The amount of BALUNI tokens to burn.
     * @notice This function requires the caller to have a balance of at least `burnAmount` BAL tokens.
     * @notice The function also checks the USDC balance before burning the tokens.
     * @notice After burning the tokens, the function transfers a proportional share of each ERC20 token held by the contract to the caller.
     * @notice The share is calculated based on the total supply of BAL tokens, the balance of each ERC20 token, and the decimals of each token.
     * @notice Finally, the function emits a `Burn` event with the caller's address and the amount of tokens burned.
     */
    function burnERC20(uint256 burnAmount) external nonReentrant {
        require(burnAmount > 0, 'Burn amount must be greater than 0');
        address treasury = registry.getTreasury();
        require(treasury != address(0), 'Treasury not set');
        require(balanceOf(msg.sender) >= burnAmount, 'Insufficient BAL');
        uint256 burnAmountAfterFee = _calculateNetAmountAfterFee(burnAmount);
        require(burnAmountAfterFee <= burnAmount, 'Fee calculation error');
        transfer(treasury, burnAmount - burnAmountAfterFee);

        for (uint256 i; i < tokens.length(); i++) {
            address token = tokens.at(i);
            require(token != address(0), 'Invalid token address');
            uint256 totalBaluni = totalSupply();
            require(totalBaluni > 0, 'Total supply is 0');
            uint256 totalERC20Balance = IERC20(token).balanceOf(address(this));
            if (totalERC20Balance == 0 || token == address(this)) continue;
            uint256 decimals = IERC20Metadata(token).decimals();
            uint256 share = _calculateERC20Share(totalBaluni, totalERC20Balance, burnAmountAfterFee, decimals);
            require(share <= totalERC20Balance, 'Share calculation error');
            IERC20(token).transfer(msg.sender, share);
        }
        _burn(msg.sender, burnAmountAfterFee);
        emit Burn(msg.sender, burnAmountAfterFee);
    }

    /**
     * @dev Burns a specified amount of BAL tokens and performs token swaps on multiple tokens.
     * @param burnAmount The amount of BAL tokens to burn.
     */
    function burnUSDC(uint256 burnAmount) public nonReentrant {
        require(burnAmount > 0, 'Burn amount must be greater than 0');
        address uniswapFactory = registry.getUniswapFactory();
        require(uniswapFactory != address(0), 'UniswapFactory not set');
        address treasury = registry.getTreasury();
        require(treasury != address(0), 'Treasury not set');
        address WNATIVE = registry.getWNATIVE();
        require(WNATIVE != address(0), 'WNATIVE not set');

        uint256 burnAmountAfterFee = _calculateNetAmountAfterFee(burnAmount);
        require(burnAmountAfterFee <= burnAmount, 'Fee calculation error');

        uint burnAmountToSend = burnAmount - burnAmountAfterFee;

        transfer(treasury, burnAmountToSend);

        for (uint256 i; i < tokens.length(); i++) {
            address token = tokens.at(i);
            require(token != address(0), 'Invalid token address');

            uint256 totalBaluni = totalSupply();
            require(totalBaluni > 0, 'Total supply is 0');

            uint256 totalERC20Balance = IERC20(token).balanceOf(address(this));

            if (totalERC20Balance == 0 || token == address(this)) continue;

            uint256 decimals = IERC20Metadata(token).decimals();

            uint256 burnAmountToken = _calculateERC20Share(
                totalBaluni,
                totalERC20Balance,
                burnAmountAfterFee,
                decimals
            );

            require(burnAmountToken <= totalERC20Balance, 'Share calculation error');

            if (token == baseAsset) {
                IERC20(baseAsset).transfer(msg.sender, burnAmountToken);
                continue;
            }

            address baluniSwapper = registry.getBaluniSwapper();
            require(baluniSwapper != address(0), 'BaluniSwapper not set');

            IERC20(token).approve(baluniSwapper, burnAmountToken);

            try IBaluniV1Swapper(baluniSwapper).singleSwap(token, baseAsset, burnAmountToken, msg.sender) returns (
                uint256 amountOut
            ) {
                require(amountOut > 0, 'Swap Failed');
                IERC20(baseAsset).transfer(msg.sender, amountOut);
            } catch {
                uint256 amountOutHop = IBaluniV1Swapper(baluniSwapper).multiHopSwap(
                    token,
                    address(WNATIVE),
                    baseAsset,
                    burnAmountToken,
                    msg.sender
                );
                require(amountOutHop > 0, 'MultiHopSwap Failed');
                IERC20(baseAsset).transfer(msg.sender, amountOutHop);
            }
        }

        _burn(msg.sender, burnAmountAfterFee);
        emit Burn(msg.sender, burnAmountAfterFee);
    }

    /**
     * @dev Retrieves the agent address associated with a user.
     * @param _user The user's address.
     * @return The agent address.
     */
    function getAgentAddress(address _user) external view returns (address) {
        address agentFactory = registry.getBaluniAgentFactory();
        return IBaluniV1AgentFactory(agentFactory).getAgentAddress(_user);
    }

    /**
     * @dev Mints a specified amount of BALUNI tokens in exchange for USDC.
     * @param balAmountToMint The amount of BALUNI tokens to mint.
     */
    function mintWithUSDC(uint256 balAmountToMint) public nonReentrant {
        address treasury = registry.getTreasury();
        address USDC = registry.getUSDC();
        uint256 _BPS_FEE = registry.getBPS_FEE();
        uint256 _BPS_BASE = registry.getBPS_BASE();
        uint256 totalUSDValuation = _totalValuationScaled();
        uint256 totalBalSupply = totalSupply();
        uint256 usdcRequired = (balAmountToMint * totalUSDValuation) / totalBalSupply;
        IERC20(USDC).transferFrom(msg.sender, address(this), usdcRequired / 1e12);
        uint256 balance = IERC20(USDC).balanceOf(msg.sender);
        uint256 allowed = IERC20(USDC).allowance(msg.sender, address(this));

        require(totalBalSupply > 0, 'Total BALUNI supply cannot be zero');
        require(balance >= usdcRequired / 1e12, 'USDC balance is insufficient');
        require(allowed >= usdcRequired / 1e12, 'Check the token allowance');

        _mint(msg.sender, balAmountToMint);
        emit Mint(msg.sender, balAmountToMint);

        uint256 fee = ((usdcRequired / 1e12) * _BPS_FEE) / _BPS_BASE;
        IERC20(address(USDC)).transfer(treasury, fee);
    }

    /**
     * @dev Calls the `rebalance` function of the `rebalancer` contract.
     * @param assets An array of addresses representing the assets to rebalance.
     * @param weights An array of uint256 values representing the weights of the assets.
     * @param sender The address of the sender.
     * @param receiver The address of the receiver.
     * @param limit The maximum number of assets to rebalance.
     */
    function callRebalance(
        address[] calldata assets,
        uint256[] calldata weights,
        address sender,
        address receiver,
        uint256 limit,
        address /* baseAsset */
    ) external {
        address USDC = registry.getUSDC();
        address rebalancer = registry.getBaluniRebalancer();
        uint256[] memory balances = new uint256[](0);
        IBaluniV1Rebalancer(rebalancer).rebalance(balances, assets, weights, limit, sender, receiver, USDC);
    }

    /**
     * @dev Calculates the amount of USDC required to mint a given amount of BAL tokens.
     * @param balAmountToMint The amount of BAL tokens to be minted.
     * @return The amount of USDC required to mint the specified amount of BAL tokens.
     */
    function requiredUSDCtoMint(uint256 balAmountToMint) public view returns (uint256) {
        uint256 totalUSDValuation = _totalValuationScaled();
        uint256 totalBalSupply = totalSupply();
        uint256 usdcRequired = (balAmountToMint * totalUSDValuation) / totalBalSupply;
        return usdcRequired / 1e12;
    }

    /**
     * @dev Calculates the token share based on the total Baluni supply, total ERC20 balance, Baluni amount, and token decimals.
     * @param totalBaluni The total supply of Baluni tokens.
     * @param totalERC20Balance The total balance of the ERC20 token.
     * @param baluniAmount The amount of Baluni tokens.
     * @param tokenDecimals The number of decimals for the ERC20 token.
     * @return The calculated token share.
     */
    function calculateTokenShare(
        uint256 totalBaluni,
        uint256 totalERC20Balance,
        uint256 baluniAmount,
        uint256 tokenDecimals
    ) external pure returns (uint256) {
        return _calculateERC20Share(totalBaluni, totalERC20Balance, baluniAmount, tokenDecimals);
    }

    /**
     * @dev Calculates the valuation of a given amount of a specific ERC20 token.
     * @param amount The amount of the ERC20 token.
     * @param token The address of the ERC20 token.
     * @return The calculated valuation of the ERC20 token.
     */
    function tokenValuation(uint256 amount, address token) external view returns (uint256) {
        address baluniOracle = registry.getBaluniOracle();
        return IBaluniV1Oracle(baluniOracle).convertScaled(token, baseAsset, amount);
    }

    /**
     * @dev Returns the total valuation of the Baluni ecosystem.
     * @return The total valuation of the Baluni ecosystem.
     */
    function totalValuation() external view returns (uint256) {
        return _totalValuationScaled();
    }

    /**
     * @dev Calculates the value of a given amount of Baluni tokens in USDC.
     * @param amount The amount of Baluni tokens.
     * @return The calculated value of the Baluni tokens in USDC.
     */
    function getUSDCShareValue(uint256 amount) external view returns (uint256) {
        return _calculateBaluniToUSDC(amount);
    }

    /**
     * @dev Calculates the valuation of an ERC20 token based on the amount and token address.
     * @param amount The amount of the token.
     * @param token The address of the token.
     * @return valuation The valuation of the token.
     */
    function _calculateERC20ValuationScaled(uint256 amount, address token) internal view returns (uint256 valuation) {
        address baluniOracle = registry.getBaluniOracle();
        return IBaluniV1Oracle(baluniOracle).convertScaled(token, baseAsset, amount);
    }

    /**
     * @dev Calculates the equivalent amount of USDC tokens for a given amount of Baluni tokens.
     * @param amount The amount of Baluni tokens to convert.
     * @return shareUSDC The equivalent amount of USDC tokens.
     *
     * Requirements:
     * - The total supply of Baluni tokens must be greater than zero.
     */
    function _calculateBaluniToUSDC(uint256 amount) internal view returns (uint256 shareUSDC) {
        uint256 baseDecimal = IERC20Metadata(baseAsset).decimals();
        uint256 totalBaluni = totalSupply();
        require(totalBaluni > 0, 'Total supply cannot be zero');
        uint256 totalUSDC = _totalValuationScaled();
        shareUSDC = (amount * totalUSDC) / totalBaluni;
        shareUSDC /= 10 ** (18 - baseDecimal);
    }

    /**
     * @dev Calculates the ERC20 share based on the total Baluni supply, total ERC20 balance,
     * Baluni amount, and token decimals.
     * @param totalBaluni The total supply of Baluni tokens.
     * @param totalERC20Balance The total balance of the ERC20 token.
     * @param baluniAmount The amount of Baluni tokens.
     * @param tokenDecimals The number of decimals for the ERC20 token.
     * @return The calculated ERC20 share.
     */
    function _calculateERC20Share(
        uint256 totalBaluni,
        uint256 totalERC20Balance,
        uint256 baluniAmount,
        uint256 tokenDecimals
    ) internal pure returns (uint256) {
        require(totalBaluni > 0, 'Total supply cannot be zero');
        require(tokenDecimals <= 18, 'Token decimals should be <= 18');
        uint256 baluniAdjusted;
        uint256 amountAdjusted;
        uint256 factor = (10 ** (18 - tokenDecimals));

        if (tokenDecimals < 18) {
            baluniAdjusted = totalBaluni / factor;
            amountAdjusted = baluniAmount / factor;
        } else {
            baluniAdjusted = totalBaluni;
            amountAdjusted = baluniAmount;
        }

        uint256 result = (amountAdjusted * totalERC20Balance) / baluniAdjusted;

        return result;
    }

    /**
     * @dev Calculates the total valuation of the contract by summing up the valuation of each token held.
     * @return The total valuation of the contract.
     */
    function _totalValuationScaled() internal view returns (uint256) {
        uint256 _totalV = 0;

        for (uint256 i = 0; i < tokens.length(); i++) {
            address token = tokens.at(i);
            uint256 balance = IERC20(token).balanceOf(address(this));

            if (balance == 0) continue;

            if (token == baseAsset) {
                _totalV += balance * 1e12;
                continue;
            }

            address baluniOracle = registry.getBaluniOracle();
            uint256 tokenBalanceValuation = IBaluniV1Oracle(baluniOracle).convertScaled(token, baseAsset, balance);
            require(tokenBalanceValuation > 0, 'Token valuation is zero');
            _totalV += tokenBalanceValuation;
        }
        return _totalV;
    }

    /**
     * @dev Calculates the net amount after deducting the fee.
     * @param _amount The input amount.
     * @return The net amount after deducting the fee.
     */
    function _calculateNetAmountAfterFee(uint256 _amount) internal view returns (uint256) {
        uint256 _BPS_FEE = registry.getBPS_FEE();
        uint256 _BPS_BASE = registry.getBPS_BASE();
        uint256 amountInWithFee = (_amount * (_BPS_BASE - (_BPS_FEE))) / _BPS_BASE;
        return amountInWithFee;
    }

    /**
     * @dev Returns the version of the contract.
     * @return The version string.
     */
    function getVersion() external view returns (uint64) {
        return _getInitializedVersion();
    }

    /**
     * @dev Returns an array of addresses representing the tokens.
     * @return An array of addresses representing the tokens.
     */
    function getTokens() external view returns (address[] memory) {
        return tokens.values();
    }

    /**
     * @dev Adds a token to the `tokens` set.
     * Can only be called by the contract owner.
     * @param _token The address of the token to be added.
     */
    function addToken(address _token) external onlyOwner {
        EnumerableSetUpgradeable.add(tokens, _token);
    }

    /**
     * @dev Removes a token from the `tokens` set.
     * Can only be called by the contract owner.
     * @param _token The address of the token to be removed.
     */
    function removeToken(address _token) external onlyOwner {
        EnumerableSetUpgradeable.remove(tokens, _token);
    }
}
