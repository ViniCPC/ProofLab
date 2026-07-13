param(
  [Parameter(ValueFromRemainingArguments = $true)]
  [string[]]$AnchorArgs
)

$ErrorActionPreference = "Stop"
$CargoBin = Join-Path $env:USERPROFILE ".cargo\bin"
$AnchorExe = Join-Path $CargoBin "anchor.exe"

if (-not (Test-Path -LiteralPath $AnchorExe)) {
  throw "anchor.exe not found at $AnchorExe. Install Anchor or add it to PATH."
}

$env:PATH = "$CargoBin;$env:PATH"
& $AnchorExe @AnchorArgs
