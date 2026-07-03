#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Map, String, Vec};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Quest {
    pub id: u64,
    pub admin: Address,
    pub title: String,
    pub description: String,
    pub lat_e7: i32,
    pub lng_e7: i32,
    pub radius_m: u32,
    pub reward_amount: i128,
    pub budget_remaining: i128,
    pub budget_total: i128,
    pub active: bool,
    pub start_ledger: u32,
    pub end_ledger: u32,
    pub total_claims: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct QuestParams {
    pub title: String,
    pub description: String,
    pub lat_e7: i32,
    pub lng_e7: i32,
    pub radius_m: u32,
    pub reward_amount: i128,
    pub budget_total: i128,
    pub start_ledger: u32,
    pub end_ledger: u32,
}

#[contracttype]
pub enum QuestRegistryKey {
    QuestsMap,
    QuestCounter,
    QuestById(u64),
}

const ADMIN_KEY: &str = "admin";

#[contract]
pub struct QuestRegistry;

#[contractimpl]
impl QuestRegistry {
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&ADMIN_KEY) {
            panic!("already initialized");
        }
        env.storage().instance().set(&ADMIN_KEY, &admin);
        env.storage().instance().set(&QuestRegistryKey::QuestCounter, &0u64);
    }

    pub fn create_quest(env: Env, admin: Address, params: QuestParams) -> u64 {
        admin.require_auth();
        let stored_admin: Address = env.storage().instance().get(&ADMIN_KEY).unwrap();
        if stored_admin != admin {
            panic!("unauthorized");
        }

        let mut counter: u64 = env
            .storage()
            .instance()
            .get(&QuestRegistryKey::QuestCounter)
            .unwrap_or(0u64);
        let quest_id = counter;

        let quest = Quest {
            id: quest_id,
            admin: admin.clone(),
            title: params.title,
            description: params.description,
            lat_e7: params.lat_e7,
            lng_e7: params.lng_e7,
            radius_m: params.radius_m,
            reward_amount: params.reward_amount,
            budget_remaining: params.budget_total,
            budget_total: params.budget_total,
            active: true,
            start_ledger: params.start_ledger,
            end_ledger: params.end_ledger,
            total_claims: 0,
        };

        env.storage()
            .instance()
            .set(&QuestRegistryKey::QuestById(quest_id), &quest);

        counter += 1;
        env.storage()
            .instance()
            .set(&QuestRegistryKey::QuestCounter, &counter);

        let mut quests: Map<u64, Quest> = env
            .storage()
            .instance()
            .get(&QuestRegistryKey::QuestsMap)
            .unwrap_or(Map::new(&env));
        quests.set(quest_id, quest);
        env.storage()
            .instance()
            .set(&QuestRegistryKey::QuestsMap, &quests);

        quest_id
    }

    pub fn get_quest(env: Env, quest_id: u64) -> Quest {
        env.storage()
            .instance()
            .get(&QuestRegistryKey::QuestById(quest_id))
            .unwrap_or_else(|| panic!("quest not found"))
    }

    pub fn list_quests(env: Env) -> Map<u64, Quest> {
        env.storage()
            .instance()
            .get(&QuestRegistryKey::QuestsMap)
            .unwrap_or(Map::new(&env))
    }

    pub fn pause_quest(env: Env, admin: Address, quest_id: u64) {
        admin.require_auth();
        let stored_admin: Address = env.storage().instance().get(&ADMIN_KEY).unwrap();
        if stored_admin != admin {
            panic!("unauthorized");
        }
        let mut quest = Self::get_quest(env.clone(), quest_id);
        quest.active = false;
        env.storage()
            .instance()
            .set(&QuestRegistryKey::QuestById(quest_id), &quest);
        let mut quests: Map<u64, Quest> = env
            .storage()
            .instance()
            .get(&QuestRegistryKey::QuestsMap)
            .unwrap_or(Map::new(&env));
        quests.set(quest_id, quest);
        env.storage()
            .instance()
            .set(&QuestRegistryKey::QuestsMap, &quests);
    }

    pub fn resume_quest(env: Env, admin: Address, quest_id: u64) {
        admin.require_auth();
        let stored_admin: Address = env.storage().instance().get(&ADMIN_KEY).unwrap();
        if stored_admin != admin {
            panic!("unauthorized");
        }
        let mut quest = Self::get_quest(env.clone(), quest_id);
        quest.active = true;
        env.storage()
            .instance()
            .set(&QuestRegistryKey::QuestById(quest_id), &quest);
        let mut quests: Map<u64, Quest> = env
            .storage()
            .instance()
            .get(&QuestRegistryKey::QuestsMap)
            .unwrap_or(Map::new(&env));
        quests.set(quest_id, quest);
        env.storage()
            .instance()
            .set(&QuestRegistryKey::QuestsMap, &quests);
    }

    pub fn top_up_budget(env: Env, admin: Address, quest_id: u64, amount: i128) {
        admin.require_auth();
        let stored_admin: Address = env.storage().instance().get(&ADMIN_KEY).unwrap();
        if stored_admin != admin {
            panic!("unauthorized");
        }
        let mut quest = Self::get_quest(env.clone(), quest_id);
        quest.budget_remaining += amount;
        quest.budget_total += amount;
        env.storage()
            .instance()
            .set(&QuestRegistryKey::QuestById(quest_id), &quest);
        let mut quests: Map<u64, Quest> = env
            .storage()
            .instance()
            .get(&QuestRegistryKey::QuestsMap)
            .unwrap_or(Map::new(&env));
        quests.set(quest_id, quest);
        env.storage()
            .instance()
            .set(&QuestRegistryKey::QuestsMap, &quests);
    }

    pub fn deduct_budget(env: Env, quest_id: u64, amount: i128) {
        let mut quest = Self::get_quest(env.clone(), quest_id);
        if quest.budget_remaining < amount {
            panic!("insufficient budget");
        }
        quest.budget_remaining -= amount;
        quest.total_claims += 1;
        env.storage()
            .instance()
            .set(&QuestRegistryKey::QuestById(quest_id), &quest);
        let mut quests: Map<u64, Quest> = env
            .storage()
            .instance()
            .get(&QuestRegistryKey::QuestsMap)
            .unwrap_or(Map::new(&env));
        quests.set(quest_id, quest);
        env.storage()
            .instance()
            .set(&QuestRegistryKey::QuestsMap, &quests);
    }

    pub fn is_admin(env: Env, address: Address) -> bool {
        let stored_admin: Address = env.storage().instance().get(&ADMIN_KEY).unwrap();
        stored_admin == address
    }

    pub fn get_admin(env: Env) -> Address {
        env.storage().instance().get(&ADMIN_KEY).unwrap()
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::Address as _;
    use soroban_sdk::{vec, Env, IntoVal};

    #[test]
    fn test_create_quest_success() {
        let env = Env::default();
        let admin = Address::generate(&env);

        let contract_id = env.register(QuestRegistry, ());
        let client = QuestRegistryClient::new(&env, &contract_id);

        client.initialize(&admin);

        let params = QuestParams {
            title: String::from_slice(&env, "Riverside Park"),
            description: String::from_slice(&env, "Cleanup zone"),
            lat_e7: 407483000,
            lng_e7: -739850000,
            radius_m: 50,
            reward_amount: 100_0000000,
            budget_total: 1_000_0000000,
            start_ledger: 0,
            end_ledger: 99999999,
        };

        let quest_id = client.create_quest(&admin, &params);
        assert_eq!(quest_id, 0);

        let quest = client.get_quest(&quest_id);
        assert_eq!(quest.budget_remaining, 1_000_0000000);
        assert!(quest.active);
    }

    #[test]
    fn test_create_quest_unauthorized() {
        let env = Env::default();
        let admin = Address::generate(&env);
        let attacker = Address::generate(&env);

        let contract_id = env.register(QuestRegistry, ());
        let client = QuestRegistryClient::new(&env, &contract_id);

        client.initialize(&admin);

        let params = QuestParams {
            title: String::from_slice(&env, "Riverside Park"),
            description: String::from_slice(&env, "Cleanup zone"),
            lat_e7: 407483000,
            lng_e7: -739850000,
            radius_m: 50,
            reward_amount: 100_0000000,
            budget_total: 1_000_0000000,
            start_ledger: 0,
            end_ledger: 99999999,
        };

        let result = client.try_create_quest(&attacker, &params);
        assert!(result.is_err());
    }

    #[test]
    fn test_pause_quest() {
        let env = Env::default();
        let admin = Address::generate(&env);

        let contract_id = env.register(QuestRegistry, ());
        let client = QuestRegistryClient::new(&env, &contract_id);

        client.initialize(&admin);

        let params = QuestParams {
            title: String::from_slice(&env, "Riverside Park"),
            description: String::from_slice(&env, "Cleanup zone"),
            lat_e7: 407483000,
            lng_e7: -739850000,
            radius_m: 50,
            reward_amount: 100_0000000,
            budget_total: 1_000_0000000,
            start_ledger: 0,
            end_ledger: 99999999,
        };

        let quest_id = client.create_quest(&admin, &params);
        client.pause_quest(&admin, &quest_id);

        let quest = client.get_quest(&quest_id);
        assert!(!quest.active);

        client.resume_quest(&admin, &quest_id);
        let quest = client.get_quest(&quest_id);
        assert!(quest.active);
    }

    #[test]
    fn test_top_up_budget() {
        let env = Env::default();
        let admin = Address::generate(&env);

        let contract_id = env.register(QuestRegistry, ());
        let client = QuestRegistryClient::new(&env, &contract_id);

        client.initialize(&admin);

        let params = QuestParams {
            title: String::from_slice(&env, "Riverside Park"),
            description: String::from_slice(&env, "Cleanup zone"),
            lat_e7: 407483000,
            lng_e7: -739850000,
            radius_m: 50,
            reward_amount: 100_0000000,
            budget_total: 1_000_0000000,
            start_ledger: 0,
            end_ledger: 99999999,
        };

        let quest_id = client.create_quest(&admin, &params);
        client.top_up_budget(&admin, &quest_id, &500_0000000);

        let quest = client.get_quest(&quest_id);
        assert_eq!(quest.budget_remaining, 1_500_0000000);
        assert_eq!(quest.budget_total, 1_500_0000000);
    }

    #[test]
    fn test_deduct_budget() {
        let env = Env::default();
        let admin = Address::generate(&env);

        let contract_id = env.register(QuestRegistry, ());
        let client = QuestRegistryClient::new(&env, &contract_id);

        client.initialize(&admin);

        let params = QuestParams {
            title: String::from_slice(&env, "Riverside Park"),
            description: String::from_slice(&env, "Cleanup zone"),
            lat_e7: 407483000,
            lng_e7: -739850000,
            radius_m: 50,
            reward_amount: 100_0000000,
            budget_total: 1_000_0000000,
            start_ledger: 0,
            end_ledger: 99999999,
        };

        let quest_id = client.create_quest(&admin, &params);
        client.deduct_budget(&quest_id, &100_0000000);

        let quest = client.get_quest(&quest_id);
        assert_eq!(quest.budget_remaining, 900_0000000);
        assert_eq!(quest.total_claims, 1);
    }
}
