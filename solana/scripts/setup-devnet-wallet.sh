#!/usr/bin/env bash
# Prepares a devnet wallet for testing the ProofLab escrow program:
#   1. Airdrops SOL for transaction fees.
#   2. Creates the wallet's USDC associated token account (paid by the deploy payer,
#      so the target wallet needs zero SOL for this step).
#   3. Prints a reminder to claim devnet USDC from Circle's faucet, since the
#      configured USDC_MINT_ADDRESS is Circle's official devnet mint and its mint
#      authority is a multisig we don't control — minting can't be scripted here.
#
# Usage: ./setup-devnet-wallet.sh <WALLET_ADDRESS> [SOL_AMOUNT]

set -euo pipefail

WALLET_ADDRESS="${1:?Usage: setup-devnet-wallet.sh <WALLET_ADDRESS> [SOL_AMOUNT]}"
SOL_AMOUNT="${2:-1}"
USDC_MINT="4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PAYER="$SCRIPT_DIR/../deploy-payer.key"

echo "== Airdropping ${SOL_AMOUNT} SOL to ${WALLET_ADDRESS} (devnet) =="
solana airdrop "$SOL_AMOUNT" "$WALLET_ADDRESS" --url devnet

echo "== Creating USDC associated token account (paid by deploy-payer) =="
spl-token create-account "$USDC_MINT" \
  --owner "$WALLET_ADDRESS" \
  --fee-payer "$PAYER" \
  --url devnet \
  || echo "(ATA may already exist, continuing)"

echo
echo "== Done =="
echo "Wallet ${WALLET_ADDRESS} now has SOL for fees and a USDC token account."
echo "To fund it with devnet USDC, claim from Circle's faucet (20 USDC / 2h per address):"
echo "  https://faucet.circle.com  (select Solana Devnet, paste ${WALLET_ADDRESS})"
