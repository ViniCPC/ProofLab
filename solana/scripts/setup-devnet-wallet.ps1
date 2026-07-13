param(
  [Parameter(Mandatory = $true)]
  [string]$WalletAddress,

  [decimal]$SolAmount = 1,

  [string]$UsdcMint = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",

  [string]$DeployPayer = "solana\deploy-payer.key"
)

$ErrorActionPreference = "Stop"
$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
Push-Location $RepoRoot

function Require-Command($Name) {
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "$Name is not available in PATH."
  }
}

function Invoke-Checked($Command, [string[]]$Arguments) {
  & $Command @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "$Command failed with exit code $LASTEXITCODE."
  }
}

Require-Command "solana"
Require-Command "spl-token"

if (-not (Test-Path -LiteralPath $DeployPayer)) {
  throw "Deploy payer keypair not found: $DeployPayer"
}

Write-Host "== Airdropping $SolAmount SOL to $WalletAddress on devnet =="
& solana airdrop $SolAmount $WalletAddress --url devnet
if ($LASTEXITCODE -ne 0) {
  Write-Warning "SOL airdrop failed. Devnet faucet may be rate-limited."
  Write-Warning "Try a smaller amount later, or fund the wallet manually."
}

Write-Host ""
Write-Host "== Creating USDC associated token account =="
& spl-token create-account $UsdcMint `
    --owner $WalletAddress `
    --fee-payer $DeployPayer `
    --url devnet

if ($LASTEXITCODE -ne 0) {
  Write-Warning "ATA creation failed or the ATA already exists. Continuing."
}

Write-Host ""
Write-Host "== Wallet balances =="
Invoke-Checked "solana" @("balance", $WalletAddress, "--url", "devnet")
Invoke-Checked "spl-token" @("accounts", "--owner", $WalletAddress, "--url", "devnet")

Write-Host ""
Write-Host "USDC faucet still needs a manual claim:"
Write-Host "https://faucet.circle.com"
Write-Host "Select Solana Devnet and paste: $WalletAddress"
