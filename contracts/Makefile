.PHONY: build test clean deploy-all deploy-%

build:
	stellar contract build

test:
	cargo test --workspace

clean:
	cargo clean
	rm -rf target

deploy-quest_registry:
	stellar contract deploy \
		--wasm target/wasm32v1-none/release/quest_registry.wasm \
		--source-account $$STELLAR_SOURCE_ACCOUNT \
		--network $$STELLAR_NETWORK \
		--alias quest_registry

deploy-reward_token:
	stellar contract deploy \
		--wasm target/wasm32v1-none/release/reward_token.wasm \
		--source-account $$STELLAR_SOURCE_ACCOUNT \
		--network $$STELLAR_NETWORK \
		--alias reward_token

deploy-claim_manager:
	stellar contract deploy \
		--wasm target/wasm32v1-none/release/claim_manager.wasm \
		--source-account $$STELLAR_SOURCE_ACCOUNT \
		--network $$STELLAR_NETWORK \
		--alias claim_manager

deploy-impact_vault:
	stellar contract deploy \
		--wasm target/wasm32v1-none/release/impact_vault.wasm \
		--source-account $$STELLAR_SOURCE_ACCOUNT \
		--network $$STELLAR_NETWORK \
		--alias impact_vault

deploy-bounty_escrow:
	stellar contract deploy \
		--wasm target/wasm32v1-none/release/bounty_escrow.wasm \
		--source-account $$STELLAR_SOURCE_ACCOUNT \
		--network $$STELLAR_NETWORK \
		--alias bounty_escrow

deploy-all: build deploy-quest_registry deploy-reward_token deploy-claim_manager deploy-impact_vault deploy-bounty_escrow
	@echo "All contracts deployed. Update DEPLOYMENTS.md with contract IDs."
