$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Push-Location $scriptDir

Write-Host "Running backend migrations from $scriptDir"
node .\migrate.js

Pop-Location
