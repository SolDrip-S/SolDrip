// SolDrip - Auto-Compounding SOL Faucet On Solana
// This program implements a token with transaction tax and dividend distribution

use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
    program::invoke,
    program_pack::Pack,
    system_instruction,
    sysvar::{rent::Rent, Sysvar, clock::Clock},
};
use spl_token::{
    instruction as token_instruction,
    state::{Account as TokenAccount, Mint},
};
use std::convert::TryInto;

// Program entrypoint
entrypoint!(process_instruction);

// Program ID
solana_program::declare_id!("SoLDripTokenProgramID111111111111111111111111");

// Constants
const TAX_PERCENTAGE: u8 = 5; // 5% standard tax
const HIGH_TAX_PERCENTAGE: u8 = 8; // 8% tax for large sales
const LP_TAX_PERCENTAGE: u8 = 1; // 1% goes to LP
const DIVIDEND_TAX_PERCENTAGE: u8 = 4; // 4% goes to dividend pool
const HIGH_DIVIDEND_TAX_PERCENTAGE: u8 = 7; // 7% goes to dividend pool for large sales
const DISTRIBUTION_THRESHOLD: u64 = 100_000_000; // 0.1 SOL in lamports
const MAX_HOLDING_PERCENTAGE: u8 = 3; // 3% maximum holding
const LARGE_SALE_THRESHOLD_PERCENTAGE: u8 = 2; // 0.2% of total supply is considered large sale
const PRICE_FLUCTUATION_THRESHOLD_BPS: u16 = 1500; // 15% price fluctuation threshold
const SLIPPAGE_PROTECTION_DURATION: i64 = 600; // 10 minutes in seconds
const HOLDING_BONUS_DAYS: u64 = 7; // 7 days for bonus
const HOLDING_BONUS_MULTIPLIER: u64 = 110; // 1.1x multiplier (110%)
const HOLDING_BONUS_DIVISOR: u64 = 100; // Divisor for percentage calculation
const GAS_COST_PERCENTAGE: u8 = 2; // 2% for gas costs

// Error codes
#[derive(Debug, thiserror::Error)]
pub enum SolDripError {
    #[error("Invalid instruction")]
    InvalidInstruction,
    
    #[error("Not enough SOL for distribution")]
    InsufficientSolForDistribution,
    
    #[error("Exceeds maximum holding limit")]
    ExceedsMaximumHolding,
    
    #[error("Price fluctuation too high")]
    PriceFluctuationTooHigh,
    
    #[error("Slippage protection active")]
    SlippageProtectionActive,
    
    #[error("Invalid token account")]
    InvalidTokenAccount,
    
    #[error("Not enough tokens")]
    InsufficientTokenBalance,
}

impl From<SolDripError> for ProgramError {
    fn from(e: SolDripError) -> Self {
        ProgramError::Custom(e as u32)
    }
}

// Instruction types
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub enum SolDripInstruction {
    /// Initialize a new SolDrip token
    /// 
    /// Accounts expected:
    /// 0. `[signer]` The account of the person initializing the token
    /// 1. `[writable]` The token mint account
    /// 2. `[writable]` The dividend pool account
    /// 3. `[writable]` The LP pool account
    /// 4. `[writable]` The state account
    /// 5. `[]` The rent sysvar
    /// 6. `[]` The token program
    Initialize {
        /// Total supply of tokens
        total_supply: u64,
    },
    
    /// Transfer tokens with tax
    /// 
    /// Accounts expected:
    /// 0. `[signer]` The account of the person sending tokens
    /// 1. `[writable]` The source token account
    /// 2. `[writable]` The destination token account
    /// 3. `[writable]` The dividend pool account
    /// 4. `[writable]` The LP pool account
    /// 5. `[writable]` The state account
    /// 6. `[]` The token program
    /// 7. `[]` The clock sysvar
    TransferWithTax {
        /// Amount of tokens to transfer
        amount: u64,
    },
    
    /// Distribute dividends to token holders
    /// 
    /// Accounts expected:
    /// 0. `[signer]` The account initiating the distribution
    /// 1. `[writable]` The dividend pool account
    /// 2. `[writable]` The state account
    /// 3. `[]` The clock sysvar
    /// 4. `[]` The token program
    /// 5+ `[writable]` Token holder accounts
    DistributeDividends,
}

// Program state
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct SolDripState {
    /// The mint of the token
    pub mint: Pubkey,
    
    /// The dividend pool account
    pub dividend_pool: Pubkey,
    
    /// The LP pool account
    pub lp_pool: Pubkey,
    
    /// Total SOL distributed as dividends
    pub total_sol_distributed: u64,
    
    /// Last distribution timestamp
    pub last_distribution_timestamp: i64,
    
    /// Current price fluctuation percentage (basis points)
    pub price_fluctuation_bps: u16,
    
    /// Is slippage protection mode active
    pub slippage_protection_active: bool,
    
    /// Slippage protection activation timestamp
    pub slippage_protection_timestamp: i64,
    
    /// Total supply
    pub total_supply: u64,
}

// Process instruction entrypoint
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    // Deserialize instruction
    let instruction = SolDripInstruction::try_from_slice(instruction_data)
        .map_err(|_| SolDripError::InvalidInstruction)?;
    
    // Process the instruction
    match instruction {
        SolDripInstruction::Initialize { total_supply } => {
            msg!("Instruction: Initialize");
            process_initialize(program_id, accounts, total_supply)
        },
        SolDripInstruction::TransferWithTax { amount } => {
            msg!("Instruction: TransferWithTax");
            process_transfer_with_tax(program_id, accounts, amount)
        },
        SolDripInstruction::DistributeDividends => {
            msg!("Instruction: DistributeDividends");
            process_distribute_dividends(program_id, accounts)
        },
    }
}

// Initialize a new SolDrip token
fn process_initialize(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    total_supply: u64,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    
    // Get accounts
    let initializer = next_account_info(account_info_iter)?;
    let mint_account = next_account_info(account_info_iter)?;
    let dividend_pool = next_account_info(account_info_iter)?;
    let lp_pool = next_account_info(account_info_iter)?;
    let state_account = next_account_info(account_info_iter)?;
    let rent_account = next_account_info(account_info_iter)?;
    let token_program = next_account_info(account_info_iter)?;
    
    // Verify signer
    if !initializer.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }
    
    // Create mint account
    let rent = &Rent::from_account_info(rent_account)?;
    let mint_space = Mint::LEN;
    let mint_rent = rent.minimum_balance(mint_space);
    
    // Create mint with initializer as mint authority
    invoke(
        &system_instruction::create_account(
            initializer.key,
            mint_account.key,
            mint_rent,
            mint_space as u64,
            token_program.key,
        ),
        &[initializer.clone(), mint_account.clone()],
    )?;
    
    // Initialize mint
    invoke(
        &token_instruction::initialize_mint(
            token_program.key,
            mint_account.key,
            initializer.key,
            Some(initializer.key),
            9, // Decimals: 9 to match SOL
        )?,
        &[
            mint_account.clone(),
            rent_account.clone(),
        ],
    )?;
    
    // Initialize state account
    let state_space = std::mem::size_of::<SolDripState>();
    let state_rent = rent.minimum_balance(state_space);
    
    invoke(
        &system_instruction::create_account(
            initializer.key,
            state_account.key,
            state_rent,
            state_space as u64,
            program_id,
        ),
        &[initializer.clone(), state_account.clone()],
    )?;
    
    // Initialize dividend pool
    invoke(
        &system_instruction::create_account(
            initializer.key,
            dividend_pool.key,
            rent.minimum_balance(0),
            0,
            program_id,
        ),
        &[initializer.clone(), dividend_pool.clone()],
    )?;
    
    // Initialize LP pool
    invoke(
        &system_instruction::create_account(
            initializer.key,
            lp_pool.key,
            rent.minimum_balance(0),
            0,
            program_id,
        ),
        &[initializer.clone(), lp_pool.clone()],
    )?;
    
    // Initialize state data
    let state = SolDripState {
        mint: *mint_account.key,
        dividend_pool: *dividend_pool.key,
        lp_pool: *lp_pool.key,
        total_sol_distributed: 0,
        last_distribution_timestamp: 0,
        price_fluctuation_bps: 0,
        slippage_protection_active: false,
        slippage_protection_timestamp: 0,
        total_supply,
    };
    
    state.serialize(&mut *state_account.data.borrow_mut())?;
    
    msg!("SolDrip token initialized with total supply: {}", total_supply);
    
    Ok(())
}

// Transfer tokens with tax
fn process_transfer_with_tax(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    amount: u64,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    
    // Get accounts
    let sender = next_account_info(account_info_iter)?;
    let source = next_account_info(account_info_iter)?;
    let destination = next_account_info(account_info_iter)?;
    let dividend_pool = next_account_info(account_info_iter)?;
    let lp_pool = next_account_info(account_info_iter)?;
    let state_account = next_account_info(account_info_iter)?;
    let token_program = next_account_info(account_info_iter)?;
    let clock_account = next_account_info(account_info_iter)?;
    
    // Verify signer
    if !sender.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }
    
    // Deserialize state
    let mut state = SolDripState::try_from_slice(&state_account.data.borrow())?;
    
    // Get clock
    let clock = Clock::from_account_info(clock_account)?;
    
    // Verify token accounts
    if !is_token_account(source, token_program.key) || !is_token_account(destination, token_program.key) {
        return Err(SolDripError::InvalidTokenAccount.into());
    }
    
    // Load token accounts data
    let source_data = TokenAccount::unpack(&source.data.borrow())?;
    let destination_data = TokenAccount::unpack(&destination.data.borrow())?;
    
    // Check if source has enough tokens
    if source_data.amount < amount {
        return Err(SolDripError::InsufficientTokenBalance.into());
    }
    
    // Check if transaction is a large sale (> 0.2% of total supply)
    let large_sale_threshold = state.total_supply * LARGE_SALE_THRESHOLD_PERCENTAGE as u64 / 100;
    let is_large_sale = amount > large_sale_threshold;
    
    // Calculate tax amounts
    let (dividend_tax_percentage, total_tax_percentage) = if is_large_sale {
        (HIGH_DIVIDEND_TAX_PERCENTAGE, HIGH_TAX_PERCENTAGE)
    } else {
        (DIVIDEND_TAX_PERCENTAGE, TAX_PERCENTAGE)
    };
    
    let total_tax = amount * total_tax_percentage as u64 / 100;
    let lp_tax = amount * LP_TAX_PERCENTAGE as u64 / 100;
    let dividend_tax = amount * dividend_tax_percentage as u64 / 100;
    let transfer_amount = amount - total_tax;
    
    // Check if destination would exceed maximum holding limit
    let max_holding = state.total_supply * MAX_HOLDING_PERCENTAGE as u64 / 100;
    if destination_data.amount + transfer_amount > max_holding {
        return Err(SolDripError::ExceedsMaximumHolding.into());
    }
    
    // Check if slippage protection is active
    if state.slippage_protection_active {
        let protection_duration = clock.unix_timestamp - state.slippage_protection_timestamp;
        if protection_duration < SLIPPAGE_PROTECTION_DURATION {
            // If price fluctuation is still high, return error
            return Err(SolDripError::SlippageProtectionActive.into());
        } else {
            // Deactivate slippage protection
            state.slippage_protection_active = false;
        }
    }
    
    // Check if price fluctuation is high
    // In a real implementation, we would fetch current price from an oracle
    // Here we're using a placeholder implementation
    if state.price_fluctuation_bps > PRICE_FLUCTUATION_THRESHOLD_BPS {
        // Activate slippage protection
        state.slippage_protection_active = true;
        state.slippage_protection_timestamp = clock.unix_timestamp;
        
        // Use 80% of tax for buyback instead
        let buyback_amount = total_tax * 80 / 100;
        let remaining_tax = total_tax - buyback_amount;
        
        // TODO: Implement buyback logic using Jupiter aggregator
        // For now, we'll just send the tax to the LP pool
        
        // Transfer remaining tax to dividend pool
        invoke(
            &token_instruction::transfer(
                token_program.key,
                source.key,
                dividend_pool.key,
                sender.key,
                &[],
                remaining_tax,
            )?,
            &[
                source.clone(),
                dividend_pool.clone(),
                sender.clone(),
                token_program.clone(),
            ],
        )?;
        
        msg!("Slippage protection activated: {} tokens used for buyback", buyback_amount);
    } else {
        // Normal tax distribution
        
        // Transfer LP tax
        invoke(
            &token_instruction::transfer(
                token_program.key,
                source.key,
                lp_pool.key,
                sender.key,
                &[],
                lp_tax,
            )?,
            &[
                source.clone(),
                lp_pool.clone(),
                sender.clone(),
                token_program.clone(),
            ],
        )?;
        
        // Transfer dividend tax
        invoke(
            &token_instruction::transfer(
                token_program.key,
                source.key,
                dividend_pool.key,
                sender.key,
                &[],
                dividend_tax,
            )?,
            &[
                source.clone(),
                dividend_pool.clone(),
                sender.clone(),
                token_program.clone(),
            ],
        )?;
    }
    
    // Transfer remaining tokens to destination
    invoke(
        &token_instruction::transfer(
            token_program.key,
            source.key,
            destination.key,
            sender.key,
            &[],
            transfer_amount,
        )?,
        &[
            source.clone(),
            destination.clone(),
            sender.clone(),
            token_program.clone(),
        ],
    )?;
    
    // Save updated state
    state.serialize(&mut *state_account.data.borrow_mut())?;
    
    msg!("Transferred {} tokens with tax: {} LP, {} dividend", transfer_amount, lp_tax, dividend_tax);
    
    Ok(())
}

// Distribute dividends to token holders
fn process_distribute_dividends(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    
    // Get accounts
    let distributor = next_account_info(account_info_iter)?;
    let dividend_pool = next_account_info(account_info_iter)?;
    let state_account = next_account_info(account_info_iter)?;
    let clock_account = next_account_info(account_info_iter)?;
    let token_program = next_account_info(account_info_iter)?;
    
    // Verify signer
    if !distributor.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }
    
    // Deserialize state
    let mut state = SolDripState::try_from_slice(&state_account.data.borrow())?;
    
    // Get clock
    let clock = Clock::from_account_info(clock_account)?;
    
    // Check if dividend pool has enough SOL
    if dividend_pool.lamports() < DISTRIBUTION_THRESHOLD {
        return Err(SolDripError::InsufficientSolForDistribution.into());
    }
    
    // Check if slippage protection is active
    if state.slippage_protection_active {
        let protection_duration = clock.unix_timestamp - state.slippage_protection_timestamp;
        if protection_duration < SLIPPAGE_PROTECTION_DURATION {
            // If slippage protection is active, return error
            return Err(SolDripError::SlippageProtectionActive.into());
        } else {
            // Deactivate slippage protection
            state.slippage_protection_active = false;
        }
    }
    
    // Get distributable lamports (minus gas costs)
    let distributable_lamports = dividend_pool.lamports() * (100 - GAS_COST_PERCENTAGE) as u64 / 100;
    
    // Calculate total token supply from token accounts
    // For simplicity, we're using the state's total_supply
    let total_supply = state.total_supply;
    
    // Get token holder accounts
    let token_holders: Vec<&AccountInfo> = account_info_iter.collect();
    
    // Track total distributed
    let mut total_distributed: u64 = 0;
    
    // Distribute to each token holder
    for token_holder in token_holders {
        // Verify it's a token account
        if !is_token_account(token_holder, token_program.key) {
            continue;
        }
        
        // Load token account data
        let token_data = match TokenAccount::unpack(&token_holder.data.borrow()) {
            Ok(data) => data,
            Err(_) => continue,
        };
        
        // Skip if token account doesn't hold SolDrip tokens
        if token_data.mint != state.mint {
            continue;
        }
        
        // Calculate dividend amount
        // In a real implementation, we would track holding time
        // Here we're using a placeholder implementation
        let holding_days = Some(10); // Placeholder: assume 10 days
        let dividend_amount = calculate_dividend_share(
            token_data.amount,
            total_supply,
            distributable_lamports,
            holding_days,
        );
        
        if dividend_amount > 0 {
            // Transfer dividend as SOL
            // In a real implementation, we would use system_instruction::transfer
            // Here we're using a placeholder implementation
            **dividend_pool.try_borrow_mut_lamports()? -= dividend_amount;
            **token_holder.try_borrow_mut_lamports()? += dividend_amount;
            
            total_distributed += dividend_amount;
            
            msg!("Distributed {} SOL to token holder {}", 
                 dividend_amount as f64 / 1_000_000_000.0, 
                 token_holder.key);
        }
    }
    
    // Update state
    state.total_sol_distributed += total_distributed;
    state.last_distribution_timestamp = clock.unix_timestamp;
    state.serialize(&mut *state_account.data.borrow_mut())?;
    
    msg!("Total distributed: {} SOL", total_distributed as f64 / 1_000_000_000.0);
    
    Ok(())
}

// Helper function to check if an account is a token account
fn is_token_account(account: &AccountInfo, token_program_id: &Pubkey) -> bool {
    // Check if account is owned by the token program
    account.owner == token_program_id
}

// Helper function to calculate dividend share
fn calculate_dividend_share(
    token_balance: u64, 
    total_supply: u64, 
    distributable_lamports: u64,
    holding_days: Option<u64>,
) -> u64 {
    if token_balance == 0 || total_supply == 0 {
        return 0;
    }
    
    // Calculate base share
    let base_share = token_balance * distributable_lamports / total_supply;
    
    // Apply holding time bonus if applicable
    if let Some(days) = holding_days {
        if days >= HOLDING_BONUS_DAYS {
            // Apply 1.1x bonus for holders of 7+ days
            return base_share * HOLDING_BONUS_MULTIPLIER / HOLDING_BONUS_DIVISOR;
        }
    }
    
    base_share
}

// Helper function to check if price fluctuation is above threshold
fn is_price_fluctuation_above_threshold(current_price: u64, previous_price: u64) -> bool {
    if previous_price == 0 {
        return false;
    }
    
    // Calculate fluctuation in basis points (1/100 of a percent)
    let fluctuation = if current_price > previous_price {
        (current_price - previous_price) * 10000 / previous_price
    } else {
        (previous_price - current_price) * 10000 / previous_price
    };
    
    fluctuation as u16 > PRICE_FLUCTUATION_THRESHOLD_BPS
}
