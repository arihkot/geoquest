#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, Symbol};

#[contracttype]
pub enum RewardTokenKey {
    Admin,
    Balances(Address),
    TotalSupply,
    Decimals,
    Name,
    Symbol,
}

const BALANCE_BUMP: u32 = 518400;

#[contract]
pub struct RewardToken;

#[contractimpl]
impl RewardToken {
    pub fn initialize(env: Env, admin: Address, name: String, symbol: String, decimals: u32) {
        if env
            .storage()
            .instance()
            .has(&RewardTokenKey::Admin)
        {
            panic!("already initialized");
        }
        env.storage().instance().set(&RewardTokenKey::Admin, &admin);
        env.storage()
            .instance()
            .set(&RewardTokenKey::Name, &name);
        env.storage()
            .instance()
            .set(&RewardTokenKey::Symbol, &symbol);
        env.storage()
            .instance()
            .set(&RewardTokenKey::Decimals, &decimals);
        env.storage()
            .instance()
            .set(&RewardTokenKey::TotalSupply, &0i128);
    }

    fn check_admin(env: &Env) {
        let admin: Address = env
            .storage()
            .instance()
            .get(&RewardTokenKey::Admin)
            .unwrap();
        admin.require_auth();
    }

    pub fn mint(env: Env, to: Address, amount: i128) {
        Self::check_admin(&env);

        let current: i128 = env
            .storage()
            .persistent()
            .get(&RewardTokenKey::Balances(to.clone()))
            .unwrap_or(0);
        let new_balance = current + amount;
        env.storage()
            .persistent()
            .set(&RewardTokenKey::Balances(to.clone()), &new_balance);
        env.storage()
            .persistent()
            .extend_ttl(&RewardTokenKey::Balances(to), BALANCE_BUMP, BALANCE_BUMP);

        let total: i128 = env
            .storage()
            .instance()
            .get(&RewardTokenKey::TotalSupply)
            .unwrap();
        env.storage()
            .instance()
            .set(&RewardTokenKey::TotalSupply, &(total + amount));
    }

    pub fn burn(env: Env, from: Address, amount: i128) {
        from.require_auth();

        let current: i128 = env
            .storage()
            .persistent()
            .get(&RewardTokenKey::Balances(from.clone()))
            .unwrap_or(0);
        if current < amount {
            panic!("insufficient balance");
        }
        let new_balance = current - amount;
        env.storage()
            .persistent()
            .set(&RewardTokenKey::Balances(from.clone()), &new_balance);

        let total: i128 = env
            .storage()
            .instance()
            .get(&RewardTokenKey::TotalSupply)
            .unwrap();
        env.storage()
            .instance()
            .set(&RewardTokenKey::TotalSupply, &(total - amount));
    }

    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {
        from.require_auth();

        let from_balance: i128 = env
            .storage()
            .persistent()
            .get(&RewardTokenKey::Balances(from.clone()))
            .unwrap_or(0);
        if from_balance < amount {
            panic!("insufficient balance");
        }

        let to_balance: i128 = env
            .storage()
            .persistent()
            .get(&RewardTokenKey::Balances(to.clone()))
            .unwrap_or(0);

        env.storage()
            .persistent()
            .set(&RewardTokenKey::Balances(from.clone()), &(from_balance - amount));
        env.storage()
            .persistent()
            .set(&RewardTokenKey::Balances(to.clone()), &(to_balance + amount));
        env.storage()
            .persistent()
            .extend_ttl(&RewardTokenKey::Balances(to), BALANCE_BUMP, BALANCE_BUMP);
    }

    pub fn balance_of(env: Env, account: Address) -> i128 {
        env.storage()
            .persistent()
            .get(&RewardTokenKey::Balances(account))
            .unwrap_or(0)
    }

    pub fn total_supply(env: Env) -> i128 {
        env.storage()
            .instance()
            .get(&RewardTokenKey::TotalSupply)
            .unwrap_or(0)
    }

    pub fn name(env: Env) -> String {
        env.storage().instance().get(&RewardTokenKey::Name).unwrap()
    }

    pub fn symbol(env: Env) -> String {
        env.storage()
            .instance()
            .get(&RewardTokenKey::Symbol)
            .unwrap()
    }

    pub fn decimals(env: Env) -> u32 {
        env.storage()
            .instance()
            .get(&RewardTokenKey::Decimals)
            .unwrap()
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::Address as _;
    use soroban_sdk::Env;

    #[test]
    fn test_mint_and_balance() {
        let env = Env::default();
        let admin = Address::generate(&env);
        let user = Address::generate(&env);

        let contract_id = env.register(RewardToken, ());
        let client = RewardTokenClient::new(&env, &contract_id);

        client.initialize(
            &admin,
            &String::from_slice(&env, "GeoQuest"),
            &String::from_slice(&env, "GEO"),
            &7,
        );

        assert_eq!(client.total_supply(), 0);

        client.mint(&user, &100_0000000);
        assert_eq!(client.balance_of(&user), 100_0000000);
        assert_eq!(client.total_supply(), 100_0000000);
    }
}
