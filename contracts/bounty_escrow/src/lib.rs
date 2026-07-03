#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Map};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct EscrowPool {
    pub quest_id: u64,
    pub total_funded: i128,
    pub remaining: i128,
    pub paused: bool,
    pub admin: Address,
}

#[contracttype]
pub enum BountyEscrowKey {
    Admin,
    Pool(u64),
    PoolsMap,
}

const ADMIN_KEY: &str = "bounty_escrow_admin";

#[contract]
pub struct BountyEscrow;

#[contractimpl]
impl BountyEscrow {
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&ADMIN_KEY) {
            panic!("already initialized");
        }
        env.storage().instance().set(&ADMIN_KEY, &admin);
        env.storage()
            .instance()
            .set(&BountyEscrowKey::PoolsMap, &Map::<u64, EscrowPool>::new(&env));
    }

    fn check_admin(env: &Env) {
        let admin: Address = env.storage().instance().get(&ADMIN_KEY).unwrap();
        admin.require_auth();
    }

    pub fn create_pool(env: Env, admin: Address, quest_id: u64, initial_funding: i128) {
        Self::check_admin(&env);

        let pool = EscrowPool {
            quest_id,
            total_funded: initial_funding,
            remaining: initial_funding,
            paused: false,
            admin: admin.clone(),
        };

        env.storage()
            .instance()
            .set(&BountyEscrowKey::Pool(quest_id), &pool);

        let mut pools: Map<u64, EscrowPool> = env
            .storage()
            .instance()
            .get(&BountyEscrowKey::PoolsMap)
            .unwrap_or(Map::new(&env));
        pools.set(quest_id, pool);
        env.storage()
            .instance()
            .set(&BountyEscrowKey::PoolsMap, &pools);

        env.events()
            .publish(("bounty_escrow", "PoolCreated"), (quest_id, initial_funding));
    }

    pub fn top_up(env: Env, admin: Address, quest_id: u64, amount: i128) {
        Self::check_admin(&env);

        let mut pool: EscrowPool = env
            .storage()
            .instance()
            .get(&BountyEscrowKey::Pool(quest_id))
            .unwrap_or_else(|| panic!("pool not found"));

        pool.total_funded += amount;
        pool.remaining += amount;

        env.storage()
            .instance()
            .set(&BountyEscrowKey::Pool(quest_id), &pool);

        let mut pools: Map<u64, EscrowPool> = env
            .storage()
            .instance()
            .get(&BountyEscrowKey::PoolsMap)
            .unwrap_or(Map::new(&env));
        pools.set(quest_id, pool);
        env.storage()
            .instance()
            .set(&BountyEscrowKey::PoolsMap, &pools);
    }

    pub fn release_reward(env: Env, quest_id: u64, amount: i128) -> i128 {
        let mut pool: EscrowPool = env
            .storage()
            .instance()
            .get(&BountyEscrowKey::Pool(quest_id))
            .unwrap_or_else(|| panic!("pool not found"));

        if pool.paused {
            panic!("pool is paused");
        }

        if pool.remaining < amount {
            panic!("insufficient pool funds");
        }

        pool.remaining -= amount;

        env.storage()
            .instance()
            .set(&BountyEscrowKey::Pool(quest_id), &pool);

        let mut pools: Map<u64, EscrowPool> = env
            .storage()
            .instance()
            .get(&BountyEscrowKey::PoolsMap)
            .unwrap_or(Map::new(&env));
        pools.set(quest_id, pool);
        env.storage()
            .instance()
            .set(&BountyEscrowKey::PoolsMap, &pools);

        env.events()
            .publish(("bounty_escrow", "RewardReleased"), (quest_id, amount));

        amount
    }

    pub fn pause_pool(env: Env, admin: Address, quest_id: u64) {
        Self::check_admin(&env);

        let mut pool: EscrowPool = env
            .storage()
            .instance()
            .get(&BountyEscrowKey::Pool(quest_id))
            .unwrap_or_else(|| panic!("pool not found"));

        pool.paused = true;

        env.storage()
            .instance()
            .set(&BountyEscrowKey::Pool(quest_id), &pool);

        let mut pools: Map<u64, EscrowPool> = env
            .storage()
            .instance()
            .get(&BountyEscrowKey::PoolsMap)
            .unwrap_or(Map::new(&env));
        pools.set(quest_id, pool);
        env.storage()
            .instance()
            .set(&BountyEscrowKey::PoolsMap, &pools);
    }

    pub fn unpause_pool(env: Env, admin: Address, quest_id: u64) {
        Self::check_admin(&env);

        let mut pool: EscrowPool = env
            .storage()
            .instance()
            .get(&BountyEscrowKey::Pool(quest_id))
            .unwrap_or_else(|| panic!("pool not found"));

        pool.paused = false;

        env.storage()
            .instance()
            .set(&BountyEscrowKey::Pool(quest_id), &pool);

        let mut pools: Map<u64, EscrowPool> = env
            .storage()
            .instance()
            .get(&BountyEscrowKey::PoolsMap)
            .unwrap_or(Map::new(&env));
        pools.set(quest_id, pool);
        env.storage()
            .instance()
            .set(&BountyEscrowKey::PoolsMap, &pools);
    }

    pub fn get_pool(env: Env, quest_id: u64) -> EscrowPool {
        env.storage()
            .instance()
            .get(&BountyEscrowKey::Pool(quest_id))
            .unwrap_or_else(|| panic!("pool not found"))
    }

    pub fn list_pools(env: Env) -> Map<u64, EscrowPool> {
        env.storage()
            .instance()
            .get(&BountyEscrowKey::PoolsMap)
            .unwrap_or(Map::new(&env))
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::Address as _;
    use soroban_sdk::Env;

    #[test]
    fn test_create_and_release() {
        let env = Env::default();
        let admin = Address::generate(&env);

        let contract_id = env.register(BountyEscrow, ());
        let client = BountyEscrowClient::new(&env, &contract_id);

        client.initialize(&admin);

        client.create_pool(&admin, &0, &1_000_0000000);

        client.release_reward(&0, &100_0000000);

        let pool = client.get_pool(&0);
        assert_eq!(pool.remaining, 900_0000000);
    }

    #[test]
    fn test_pause_blocks_release() {
        let env = Env::default();
        let admin = Address::generate(&env);

        let contract_id = env.register(BountyEscrow, ());
        let client = BountyEscrowClient::new(&env, &contract_id);

        client.initialize(&admin);

        client.create_pool(&admin, &0, &1_000_0000000);
        client.pause_pool(&admin, &0);

        let result = client.try_release_reward(&0, &100_0000000);
        assert!(result.is_err());
    }

    #[test]
    fn test_top_up_increases_pool() {
        let env = Env::default();
        let admin = Address::generate(&env);

        let contract_id = env.register(BountyEscrow, ());
        let client = BountyEscrowClient::new(&env, &contract_id);

        client.initialize(&admin);

        client.create_pool(&admin, &0, &500_0000000);
        client.top_up(&admin, &0, &300_0000000);

        let pool = client.get_pool(&0);
        assert_eq!(pool.remaining, 800_0000000);
        assert_eq!(pool.total_funded, 800_0000000);
    }

    #[test]
    fn test_release_insufficient_funds() {
        let env = Env::default();
        let admin = Address::generate(&env);

        let contract_id = env.register(BountyEscrow, ());
        let client = BountyEscrowClient::new(&env, &contract_id);

        client.initialize(&admin);

        client.create_pool(&admin, &0, &100_0000000);

        let result = client.try_release_reward(&0, &200_0000000);
        assert!(result.is_err());
    }
}
