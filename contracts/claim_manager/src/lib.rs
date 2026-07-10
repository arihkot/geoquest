#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Address, Bytes, BytesN, Env, Map, Vec};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Attestation {
    pub user: Address,
    pub quest_id: u64,
    pub timestamp: u64,
    pub location_hash: BytesN<32>,
}

#[contracttype]
pub enum ClaimManagerKey {
    Claimed(Address, u64),
    ClaimsMap,
    AdminKey,
    OracleKey,
}

#[contract]
pub struct ClaimManager;

#[contractimpl]
impl ClaimManager {
    pub fn initialize(env: Env, admin: Address, oracle_public_key: BytesN<32>) {
        if env.storage().instance().has(&ClaimManagerKey::AdminKey) {
            panic!("already initialized");
        }
        env.storage()
            .instance()
            .set(&ClaimManagerKey::AdminKey, &admin);
        env.storage()
            .instance()
            .set(&ClaimManagerKey::OracleKey, &oracle_public_key);

        let empty_map: Map<u64, Vec<Address>> = Map::new(&env);
        env.storage()
            .instance()
            .set(&ClaimManagerKey::ClaimsMap, &empty_map);
    }

    pub fn set_oracle_key(env: Env, admin: Address, new_key: BytesN<32>) {
        admin.require_auth();
        let stored_admin: Address = env
            .storage()
            .instance()
            .get(&ClaimManagerKey::AdminKey)
            .unwrap();
        if stored_admin != admin {
            panic!("unauthorized");
        }
        env.storage()
            .instance()
            .set(&ClaimManagerKey::OracleKey, &new_key);
    }

    pub fn get_oracle_key(env: Env) -> BytesN<32> {
        env.storage()
            .instance()
            .get(&ClaimManagerKey::OracleKey)
            .unwrap()
    }

    pub fn is_claimed(env: Env, user: Address, quest_id: u64) -> bool {
        env.storage()
            .instance()
            .get(&ClaimManagerKey::Claimed(user, quest_id))
            .unwrap_or(false)
    }

    /// Records a verified quest completion as a claim.
    ///
    /// This entrypoint is invoked from the frontend after the user connects their
    /// Stellar wallet via the Freighter browser extension. The flow is:
    ///   1. Frontend calls `setAllowed()` to grant the dapp wallet permissions.
    ///   2. Frontend calls `getAddress()` to read the claimer's `G...` public key.
    ///   3. Frontend builds a Soroban transaction for `record_claim` and calls
    ///      `signTransaction()` so the wallet signs it with the claimer's key.
    ///   4. The signed transaction is submitted on-chain; `user` is the address
    ///      that authorized (signed) the call.
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
            .get(&ClaimManagerKey::OracleKey)
            .unwrap();

        // Verify oracle signature over attestation location_hash
        let loc_hash = soroban_sdk::Bytes::from_slice(&env, &attestation.location_hash.to_array());
        env.crypto()
            .ed25519_verify(&oracle_key, &loc_hash, &signature);

        if attestation.user != user || attestation.quest_id != quest_id {
            panic!("attestation does not match user/quest");
        }

        let already_claimed: bool = env
            .storage()
            .instance()
            .get(&ClaimManagerKey::Claimed(user.clone(), quest_id))
            .unwrap_or(false);

        if already_claimed {
            panic!("user has already claimed this quest");
        }

        env.storage().instance().set(
            &ClaimManagerKey::Claimed(user.clone(), quest_id),
            &true,
        );

        let mut claim_map: Map<u64, Vec<Address>> = env
            .storage()
            .instance()
            .get(&ClaimManagerKey::ClaimsMap)
            .unwrap_or(Map::new(&env));

        let mut users = claim_map.get(quest_id).unwrap_or(Vec::new(&env));
        users.push_back(user.clone());
        claim_map.set(quest_id, users);
        env.storage()
            .instance()
            .set(&ClaimManagerKey::ClaimsMap, &claim_map);
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
    use soroban_sdk::Env;

    #[test]
    fn test_record_claim_rejects_replay() {
        let env = Env::default();
        let admin = Address::generate(&env);
        let user = Address::generate(&env);
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
