#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Map};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct StakePosition {
    pub staked_amount: i128,
    pub accrued_yield: i128,
    pub last_update_ledger: u32,
    pub reward_debt: i128,
}

#[contracttype]
pub enum ImpactVaultKey {
    Admin,
    StakePosition(Address),
    TotalStaked,
    TreasuryReserve,
    AccYieldPerShare,
    LastYieldDistribution,
    YieldRate, // yield per ledger per staked token * 1e12
}

const ADMIN_KEY: &str = "impact_vault_admin";

#[contract]
pub struct ImpactVault;

#[contractimpl]
impl ImpactVault {
    pub fn initialize(env: Env, admin: Address, yield_rate: i128) {
        if env.storage().instance().has(&ADMIN_KEY) {
            panic!("already initialized");
        }
        env.storage().instance().set(&ADMIN_KEY, &admin);
        env.storage()
            .instance()
            .set(&ImpactVaultKey::TotalStaked, &0i128);
        env.storage()
            .instance()
            .set(&ImpactVaultKey::TreasuryReserve, &0i128);
        env.storage()
            .instance()
            .set(&ImpactVaultKey::AccYieldPerShare, &0i128);
        env.storage()
            .instance()
            .set(&ImpactVaultKey::LastYieldDistribution, &0u32);
        env.storage()
            .instance()
            .set(&ImpactVaultKey::YieldRate, &yield_rate);
    }

    fn check_admin(env: &Env) {
        let admin: Address = env
            .storage()
            .instance()
            .get(&ADMIN_KEY)
            .unwrap();
        admin.require_auth();
    }

    pub fn top_up_reserve(env: Env, admin: Address, amount: i128) {
        Self::check_admin(&env);
        let current: i128 = env
            .storage()
            .instance()
            .get(&ImpactVaultKey::TreasuryReserve)
            .unwrap_or(0);
        env.storage()
            .instance()
            .set(&ImpactVaultKey::TreasuryReserve, &(current + amount));
    }

    pub fn stake(env: Env, user: Address, amount: i128) {
        user.require_auth();
        if amount <= 0 {
            panic!("amount must be positive");
        }

        let mut position = env
            .storage()
            .persistent()
            .get(&ImpactVaultKey::StakePosition(user.clone()))
            .unwrap_or(StakePosition {
                staked_amount: 0,
                accrued_yield: 0,
                last_update_ledger: 0,
                reward_debt: 0,
            });

        let acc_yield_per_share: i128 = env
            .storage()
            .instance()
            .get(&ImpactVaultKey::AccYieldPerShare)
            .unwrap_or(0);

        let pending = (position.staked_amount * acc_yield_per_share / 1_000_000_000_000i128)
            - position.reward_debt;
        if pending > 0 {
            position.accrued_yield += pending;
        }

        position.staked_amount += amount;
        position.last_update_ledger = env.ledger().sequence();
        position.reward_debt = position.staked_amount * acc_yield_per_share / 1_000_000_000_000i128;

        env.storage()
            .persistent()
            .set(&ImpactVaultKey::StakePosition(user.clone()), &position);

        let total: i128 = env
            .storage()
            .instance()
            .get(&ImpactVaultKey::TotalStaked)
            .unwrap_or(0);
        env.storage()
            .instance()
            .set(&ImpactVaultKey::TotalStaked, &(total + amount));

        env.events()
            .publish(("impact_vault", "Staked"), (user, amount));
    }

    pub fn unstake(env: Env, user: Address, amount: i128) {
        user.require_auth();
        if amount <= 0 {
            panic!("amount must be positive");
        }

        let mut position: StakePosition = env
            .storage()
            .persistent()
            .get(&ImpactVaultKey::StakePosition(user.clone()))
            .unwrap_or(StakePosition {
                staked_amount: 0,
                accrued_yield: 0,
                last_update_ledger: 0,
                reward_debt: 0,
            });

        if position.staked_amount < amount {
            panic!("insufficient staked balance");
        }

        let acc_yield_per_share: i128 = env
            .storage()
            .instance()
            .get(&ImpactVaultKey::AccYieldPerShare)
            .unwrap_or(0);

        let pending = (position.staked_amount * acc_yield_per_share / 1_000_000_000_000i128)
            - position.reward_debt;
        if pending > 0 {
            position.accrued_yield += pending;
        }

        position.staked_amount -= amount;
        position.last_update_ledger = env.ledger().sequence();
        position.reward_debt = position.staked_amount * acc_yield_per_share / 1_000_000_000_000i128;

        env.storage()
            .persistent()
            .set(&ImpactVaultKey::StakePosition(user.clone()), &position);

        let total: i128 = env
            .storage()
            .instance()
            .get(&ImpactVaultKey::TotalStaked)
            .unwrap_or(0);
        env.storage()
            .instance()
            .set(&ImpactVaultKey::TotalStaked, &(total - amount));

        env.events()
            .publish(("impact_vault", "Unstaked"), (user, amount));
    }

    pub fn distribute_yield(env: Env, admin: Address) {
        Self::check_admin(&env);

        let reserve: i128 = env
            .storage()
            .instance()
            .get(&ImpactVaultKey::TreasuryReserve)
            .unwrap_or(0);

        let total_staked: i128 = env
            .storage()
            .instance()
            .get(&ImpactVaultKey::TotalStaked)
            .unwrap_or(0);

        if total_staked == 0 || reserve == 0 {
            return;
        }

        let yield_rate: i128 = env
            .storage()
            .instance()
            .get(&ImpactVaultKey::YieldRate)
            .unwrap_or(0);

        let current_ledger = env.ledger().sequence();
        let last_dist: u32 = env
            .storage()
            .instance()
            .get(&ImpactVaultKey::LastYieldDistribution)
            .unwrap_or(0);

        let ledgers_passed = if last_dist == 0 {
            1u32
        } else {
            current_ledger - last_dist
        };

        let yield_amount = (yield_rate * (ledgers_passed as i128) * total_staked)
            / 1_000_000_000_000i128;

        let distribute_amount = if yield_amount > reserve {
            reserve
        } else {
            yield_amount
        };

        if distribute_amount <= 0 {
            return;
        }

        let acc_yield_per_share_current: i128 = env
            .storage()
            .instance()
            .get(&ImpactVaultKey::AccYieldPerShare)
            .unwrap_or(0);

        let new_acc = acc_yield_per_share_current
            + (distribute_amount * 1_000_000_000_000i128 / total_staked);

        env.storage()
            .instance()
            .set(&ImpactVaultKey::AccYieldPerShare, &new_acc);
        env.storage()
            .instance()
            .set(&ImpactVaultKey::LastYieldDistribution, &current_ledger);
        env.storage()
            .instance()
            .set(&ImpactVaultKey::TreasuryReserve, &(reserve - distribute_amount));

        env.events()
            .publish(("impact_vault", "YieldDistributed"), distribute_amount);
    }

    pub fn get_position(env: Env, user: Address) -> StakePosition {
        let position: StakePosition = env
            .storage()
            .persistent()
            .get(&ImpactVaultKey::StakePosition(user.clone()))
            .unwrap_or(StakePosition {
                staked_amount: 0,
                accrued_yield: 0,
                last_update_ledger: 0,
                reward_debt: 0,
            });

        let acc_yield_per_share: i128 = env
            .storage()
            .instance()
            .get(&ImpactVaultKey::AccYieldPerShare)
            .unwrap_or(0);

        let pending = (position.staked_amount * acc_yield_per_share / 1_000_000_000_000i128)
            - position.reward_debt;

        StakePosition {
            staked_amount: position.staked_amount,
            accrued_yield: position.accrued_yield + if pending > 0 { pending } else { 0 },
            last_update_ledger: position.last_update_ledger,
            reward_debt: position.reward_debt,
        }
    }

    pub fn get_total_staked(env: Env) -> i128 {
        env.storage()
            .instance()
            .get(&ImpactVaultKey::TotalStaked)
            .unwrap_or(0)
    }

    pub fn get_treasury_reserve(env: Env) -> i128 {
        env.storage()
            .instance()
            .get(&ImpactVaultKey::TreasuryReserve)
            .unwrap_or(0)
    }

    pub fn get_yield_rate(env: Env) -> i128 {
        env.storage()
            .instance()
            .get(&ImpactVaultKey::YieldRate)
            .unwrap_or(0)
    }

    pub fn set_yield_rate(env: Env, admin: Address, rate: i128) {
        Self::check_admin(&env);
        env.storage()
            .instance()
            .set(&ImpactVaultKey::YieldRate, &rate);
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::Address as _;
    use soroban_sdk::Env;

    #[test]
    fn test_stake_and_get_position() {
        let env = Env::default();
        let admin = Address::generate(&env);
        let user = Address::generate(&env);

        let contract_id = env.register(ImpactVault, ());
        let client = ImpactVaultClient::new(&env, &contract_id);

        client.initialize(&admin, &1000);

        assert_eq!(client.get_total_staked(), 0);

        client.stake(&user, &100_0000000);

        let position = client.get_position(&user);
        assert_eq!(position.staked_amount, 100_0000000);
        assert_eq!(client.get_total_staked(), 100_0000000);
    }

    #[test]
    fn test_stake_and_unstake() {
        let env = Env::default();
        let admin = Address::generate(&env);
        let user = Address::generate(&env);

        let contract_id = env.register(ImpactVault, ());
        let client = ImpactVaultClient::new(&env, &contract_id);

        client.initialize(&admin, &1000);

        client.stake(&user, &200_0000000);
        client.unstake(&user, &100_0000000);

        let position = client.get_position(&user);
        assert_eq!(position.staked_amount, 100_0000000);
        assert_eq!(client.get_total_staked(), 100_0000000);
    }

    #[test]
    fn test_yield_distribution() {
        let env = Env::default();
        let admin = Address::generate(&env);
        let user = Address::generate(&env);

        let contract_id = env.register(ImpactVault, ());
        let client = ImpactVaultClient::new(&env, &contract_id);

        let yield_rate = 10_000_000i128;
        client.initialize(&admin, &yield_rate);

        client.top_up_reserve(&admin, &1_000_0000000);
        client.stake(&user, &100_0000000);

        client.distribute_yield(&admin);

        let reserve = client.get_treasury_reserve();
        assert!(reserve < 1_000_0000000);

        let position = client.get_position(&user);
        assert!(position.accrued_yield > 0);
    }

    #[test]
    fn test_unstake_insufficient_balance() {
        let env = Env::default();
        let admin = Address::generate(&env);
        let user = Address::generate(&env);

        let contract_id = env.register(ImpactVault, ());
        let client = ImpactVaultClient::new(&env, &contract_id);

        client.initialize(&admin, &1000);

        client.stake(&user, &100_0000000);

        let result = client.try_unstake(&user, &200_0000000);
        assert!(result.is_err());
    }
}
