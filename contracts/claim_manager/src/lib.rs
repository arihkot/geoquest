#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Address, BytesN, Env, Map, Vec};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Attestation {
    pub user: Address,
    pub quest_id: u64,
    pub timestamp: u64,
    pub location_hash: BytesN<32>,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ClaimRecord {
    pub user: Address,
    pub quest_id: u64,
    pub claimed_at_ledger: u32,
    pub tx_ref: BytesN<32>,
}

#[contracttype]
pub enum ClaimManagerKey {
    Admin,
    OracleKey(BytesN<32>),
    Claimed((Address, u64)),
    ClaimsMap,
}

const ADMIN_KEY: &str = "claim_manager_admin";
const ORACLE_KEY_SLOT: &str = "oracle_pubkey";

#[contract]
pub struct ClaimManager;

#[contractimpl]
impl ClaimManager {
    pub fn initialize(env: Env, admin: Address, oracle_public_key: BytesN<32>) {
        if env.storage().instance().has(&ADMIN_KEY) {
            panic!("already initialized");
        }
        env.storage().instance().set(&ADMIN_KEY, &admin);
        env.storage()
            .instance()
            .set(&ORACLE_KEY_SLOT, &oracle_public_key);
        env.storage()
            .instance()
            .set(&ClaimManagerKey::ClaimsMap, &Map::<u64, Vec<Address>>::new(&env));
    }

    pub fn set_oracle_key(env: Env, admin: Address, new_oracle_key: BytesN<32>) {
        admin.require_auth();
        let stored_admin: Address = env.storage().instance().get(&ADMIN_KEY).unwrap();
        if stored_admin != admin {
            panic!("unauthorized");
        }
        env.storage()
            .instance()
            .set(&ORACLE_KEY_SLOT, &new_oracle_key);
    }

    pub fn get_oracle_key(env: Env) -> BytesN<32> {
        env.storage()
            .instance()
            .get(&ORACLE_KEY_SLOT)
            .unwrap()
    }

    pub fn is_claimed(env: Env, user: Address, quest_id: u64) -> bool {
        env.storage()
            .instance()
            .get(&ClaimManagerKey::Claimed((user, quest_id)))
            .unwrap_or(false)
    }

    pub fn record_claim(
        env: Env,
        user: Address,
        quest_id: u64,
        attestation: Attestation,
        signature: BytesN<64>,
    ) {
        let oracle_key: BytesN<32> = env
            .storage()
            .instance()
            .get(&ORACLE_KEY_SLOT)
            .unwrap();

        let attestation_bytes = Self::serialize_attestation(&env, &attestation);

        env.crypto().ed25519_verify(
            &oracle_key,
            &attestation_bytes.into(),
            &signature,
        );

        if attestation.user != user || attestation.quest_id != quest_id {
            panic!("attestation does not match claimed user/quest");
        }

        let already_claimed: bool = env
            .storage()
            .instance()
            .get(&ClaimManagerKey::Claimed((user.clone(), quest_id)))
            .unwrap_or(false);

        if already_claimed {
            panic!("user has already claimed this quest");
        }

        env.storage().instance().set(
            &ClaimManagerKey::Claimed((user.clone(), quest_id)),
            &true,
        );

        let ledger = env.ledger().sequence();
        let claim = ClaimRecord {
            user: user.clone(),
            quest_id,
            claimed_at_ledger: ledger,
            tx_ref: attestation.location_hash.clone(),
        };

        let mut claim_map: Map<u64, Vec<Address>> = env
            .storage()
            .instance()
            .get(&ClaimManagerKey::ClaimsMap)
            .unwrap_or(Map::new(&env));

        let mut users = claim_map.get(quest_id).unwrap_or(Vec::new(&env));
        users.push_back(user);
        claim_map.set(quest_id, users);
        env.storage()
            .instance()
            .set(&ClaimManagerKey::ClaimsMap, &claim_map);

        env.events()
            .publish(("claim_manager", "RewardClaimed"), (quest_id, user));
    }

    fn serialize_attestation(env: &Env, attestation: &Attestation) -> Vec<u8> {
        let mut data = Vec::new(env);
        let user_bytes = attestation.user.to_string();
        data.extend_from_array(&user_bytes.into());
        data.push_back((attestation.quest_id >> 56) as u8);
        data.push_back(((attestation.quest_id >> 48) & 0xFF) as u8);
        data.push_back(((attestation.quest_id >> 40) & 0xFF) as u8);
        data.push_back(((attestation.quest_id >> 32) & 0xFF) as u8);
        data.push_back(((attestation.quest_id >> 24) & 0xFF) as u8);
        data.push_back(((attestation.quest_id >> 16) & 0xFF) as u8);
        data.push_back(((attestation.quest_id >> 8) & 0xFF) as u8);
        data.push_back((attestation.quest_id & 0xFF) as u8);
        data.push_back((attestation.timestamp >> 56) as u8);
        data.push_back(((attestation.timestamp >> 48) & 0xFF) as u8);
        data.push_back(((attestation.timestamp >> 40) & 0xFF) as u8);
        data.push_back(((attestation.timestamp >> 32) & 0xFF) as u8);
        data.push_back(((attestation.timestamp >> 24) & 0xFF) as u8);
        data.push_back(((attestation.timestamp >> 16) & 0xFF) as u8);
        data.push_back(((attestation.timestamp >> 8) & 0xFF) as u8);
        data.push_back((attestation.timestamp & 0xFF) as u8);
        data.extend_from_array(&attestation.location_hash.to_array().as_slice().into());
        data
    }

    pub fn get_claimers(env: Env, quest_id: u64) -> Vec<Address> {
        let claim_map: Map<u64, Vec<Address>> = env
            .storage()
            .instance()
            .get(&ClaimManagerKey::ClaimsMap)
            .unwrap_or(Map::new(&env));
        claim_map.get(quest_id).unwrap_or(Vec::new(&env))
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::Address as _;
    use soroban_sdk::{vec, Bytes, Env};

    #[test]
    fn test_record_claim_rejects_replay() {
        let env = Env::default();
        let admin = Address::generate(&env);
        let user = Address::generate(&env);
        let oracle_privkey = BytesN::<32>::from_array(&env, &[1u8; 32]);
        let oracle_pubkey = BytesN::<32>::from_array(&env, &[2u8; 32]);

        let contract_id = env.register(ClaimManager, ());
        let client = ClaimManagerClient::new(&env, &contract_id);

        client.initialize(&admin, &oracle_pubkey);

        let location_hash = BytesN::<32>::from_array(&env, &[42u8; 32]);
        let attestation = Attestation {
            user: user.clone(),
            quest_id: 1,
            timestamp: 1000,
            location_hash,
        };

        let signature = BytesN::<64>::from_array(&env, &[3u8; 64]);

        client.record_claim(&user, &1, &attestation, &signature);

        let result = client.try_record_claim(&user, &1, &attestation, &signature);
        assert!(result.is_err());
    }

    #[test]
    fn test_record_claim_rejects_mismatched_attestation() {
        let env = Env::default();
        let admin = Address::generate(&env);
        let user = Address::generate(&env);
        let other_user = Address::generate(&env);
        let oracle_pubkey = BytesN::<32>::from_array(&env, &[2u8; 32]);

        let contract_id = env.register(ClaimManager, ());
        let client = ClaimManagerClient::new(&env, &contract_id);

        client.initialize(&admin, &oracle_pubkey);

        let location_hash = BytesN::<32>::from_array(&env, &[42u8; 32]);
        let attestation = Attestation {
            user: user.clone(),
            quest_id: 1,
            timestamp: 1000,
            location_hash,
        };

        let signature = BytesN::<64>::from_array(&env, &[3u8; 64]);

        let result = client.try_record_claim(&other_user, &1, &attestation, &signature);
        assert!(result.is_err());
    }
}
