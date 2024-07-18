// SPDX-License-Identifier: BUSL-1.1

pragma solidity 0.7.6;

import '../interfaces/IHypervisor.sol';
import '@openzeppelin/contracts/math/SignedSafeMath.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/SafeERC20.sol';
import '@uniswap/v3-core/contracts/libraries/FullMath.sol';
import '@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol';
import '@uniswap/v3-core/contracts/libraries/TickMath.sol';
import '@uniswap/v3-periphery/contracts/libraries/LiquidityAmounts.sol';

contract AutoRebal {
    using SafeMath for uint256;

    address public admin;
    address public advisor;
    address public feeRecipient;
    IUniswapV3Pool public pool;
    int24 public limitWidth = 1;

    modifier onlyAdvisor() {
        require(msg.sender == advisor, 'only advisor');
        _;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, 'only admin');
        _;
    }

    constructor(address _admin) {
        require(_admin != address(0), '_admin should be non-zero');
        admin = _admin;
        advisor = _admin;
        feeRecipient = admin;
    }

    function liquidityOptions(address _hypervisor) public view returns (bool, int24 currentTick) {
        IHypervisor hypervisor = IHypervisor(_hypervisor);
        (uint256 total0, uint256 total1) = hypervisor.getTotalAmounts();

        uint160 sqrtRatioX96;
        (sqrtRatioX96, currentTick, , , , , ) = hypervisor.pool().slot0();

        uint128 liquidity = LiquidityAmounts.getLiquidityForAmounts(
            sqrtRatioX96,
            TickMath.getSqrtRatioAtTick(hypervisor.baseLower()),
            TickMath.getSqrtRatioAtTick(hypervisor.baseUpper()),
            total0,
            total1
        );

        (uint256 amount0, uint256 amount1) = LiquidityAmounts.getAmountsForLiquidity(
            sqrtRatioX96,
            TickMath.getSqrtRatioAtTick(hypervisor.baseLower()),
            TickMath.getSqrtRatioAtTick(hypervisor.baseUpper()),
            liquidity
        );

        uint256 price = FullMath.mulDiv(uint256(sqrtRatioX96), (uint256(sqrtRatioX96)), 2 ** (96 * 2));
        return ((total0 - amount0) * price > (total1 - amount1), currentTick);
    }

    /// @param  outMin min amount0,1 returned for shares of liq
    function autoRebalance(
        address _hypervisor,
        uint256[4] memory outMin
    ) external onlyAdvisor returns (int24 limitLower, int24 limitUpper) {
        (bool token0Limit, int24 currentTick) = liquidityOptions(_hypervisor);
        IHypervisor hypervisor = IHypervisor(_hypervisor);

        if (!token0Limit) {
            // extra token1 in limit position = limit below
            limitUpper = (currentTick / hypervisor.tickSpacing()) * hypervisor.tickSpacing() - hypervisor.tickSpacing();
            if (limitUpper == currentTick) limitUpper = limitUpper - hypervisor.tickSpacing();

            limitLower = limitUpper - hypervisor.tickSpacing() * limitWidth;
        } else {
            // extra token0 in limit position = limit above
            limitLower = (currentTick / hypervisor.tickSpacing()) * hypervisor.tickSpacing() + hypervisor.tickSpacing();
            if (limitLower == currentTick) limitLower = limitLower + hypervisor.tickSpacing();

            limitUpper = limitLower + hypervisor.tickSpacing() * limitWidth;
        }

        uint256[4] memory inMin;

        hypervisor.rebalance(
            hypervisor.baseLower(),
            hypervisor.baseUpper(),
            limitLower,
            limitUpper,
            feeRecipient,
            inMin,
            outMin
        );
    }

    /// @param _hypervisor Hypervisor Address
    /// @param _baseLower The lower tick of the base position
    /// @param _baseUpper The upper tick of the base position
    /// @param _limitLower The lower tick of the limit position
    /// @param _limitUpper The upper tick of the limit position
    /// @param _feeRecipient Address of recipient of 10% of earned fees since last rebalance
    function rebalance(
        address _hypervisor,
        int24 _baseLower,
        int24 _baseUpper,
        int24 _limitLower,
        int24 _limitUpper,
        address _feeRecipient,
        uint256[4] memory inMin,
        uint256[4] memory outMin
    ) external onlyAdvisor {
        IHypervisor(_hypervisor).rebalance(
            _baseLower,
            _baseUpper,
            _limitLower,
            _limitUpper,
            _feeRecipient,
            inMin,
            outMin
        );
    }

    /// @notice compound pending fees
    function compound(
        address _hypervisor
    )
        external
        onlyAdvisor
        returns (
            uint128 baseToken0Owed,
            uint128 baseToken1Owed,
            uint128 limitToken0Owed,
            uint128 limitToken1Owed,
            uint256[4] memory inMin
        )
    {
        IHypervisor hypervisor = IHypervisor(_hypervisor);
        uint256[4] memory inMin;
        hypervisor.compound(inMin);
    }

    /// @param newAdmin New Admin Address
    function transferAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), 'newAdmin should be non-zero');
        admin = newAdmin;
    }

    /// @notice Transfer tokens to recipient from the contract
    /// @param token Address of token
    /// @param recipient Recipient Address
    function rescueERC20(IERC20 token, address recipient) external onlyAdmin {
        require(recipient != address(0), 'recipient should be non-zero');
        require(token.transfer(recipient, token.balanceOf(address(this))));
    }

    /// @param _recipient fee recipient
    function setRecipient(address _recipient) external onlyAdmin {
        //require(feeRecipient == address(0), 'fee recipient already set');
        feeRecipient = _recipient;
    }

    function setAdvisor(address _advisor) external onlyAdmin {
        require(_advisor != address(0), '_advisor should be non-zero');
        advisor = _advisor;
    }

    /// @param _hypervisor Hypervisor Address
    /// @param newOwner New Owner Address
    function transferHypervisorOwner(address _hypervisor, address newOwner) external onlyAdmin {
        IHypervisor(_hypervisor).transferOwnership(newOwner);
    }
}
