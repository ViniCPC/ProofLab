param(
  [string]$ProgramId = "5q7tMMX6j5M4m6JQ2R4kGPZZ8sJ5bxFcxwJkmxfW4AcJ",
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
Require-Command "solana-keygen"

Write-Host "== Solana devnet program =="
Invoke-Checked "solana" @("account", $ProgramId, "--url", "devnet")

Write-Host ""
Write-Host "== Deploy payer balance =="
if (-not (Test-Path -LiteralPath $DeployPayer)) {
  throw "Deploy payer keypair not found: $DeployPayer"
}

$DeployPayerAddress = (& solana-keygen pubkey $DeployPayer)
if ($LASTEXITCODE -ne 0) {
  throw "Could not read deploy payer address from $DeployPayer."
}

Invoke-Checked "solana" @("balance", $DeployPayerAddress, "--url", "devnet")

Write-Host ""
Write-Host "Devnet check completed."
