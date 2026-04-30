[CmdletBinding()]
param(
  [string]$DbUser = "postgres",
  [string]$DbName = "eventhub"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Invoke-Docker {
  param(
    [Parameter(Mandatory = $true)]
    [string[]]$Args
  )

  & docker @Args
  if ($LASTEXITCODE -ne 0) {
    throw "Docker command failed: docker $($Args -join ' ')"
  }
}

function Wait-ForDb {
  param(
    [Parameter(Mandatory = $true)]
    [string[]]$ComposeArgs,
    [Parameter(Mandatory = $true)]
    [string]$DbUserName,
    [Parameter(Mandatory = $true)]
    [string]$DatabaseName,
    [int]$TimeoutSeconds = 180
  )

  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)

  while ((Get-Date) -lt $deadline) {
    & docker @ComposeArgs exec -T db pg_isready -U $DbUserName -d $DatabaseName *> $null
    if ($LASTEXITCODE -eq 0) {
      return
    }
    Start-Sleep -Seconds 3
  }

  throw "Timed out waiting for Postgres 16 readiness ($TimeoutSeconds seconds)."
}

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..\")).Path
Push-Location $repoRoot

try {
  $compose16 = @("compose", "-f", "docker-compose.yml")

  Write-Host ""
  Write-Host "== Rollback to Postgres 16 =="
  Invoke-Docker -Args @("compose", "-f", "docker-compose.yml", "config", "-q")
  Invoke-Docker -Args ($compose16 + @("stop", "backend", "celery_worker", "celery_beat", "frontend"))
  Invoke-Docker -Args ($compose16 + @("up", "-d", "db"))
  Wait-ForDb -ComposeArgs $compose16 -DbUserName $DbUser -DatabaseName $DbName
  Invoke-Docker -Args ($compose16 + @("up", "-d", "backend", "celery_worker", "celery_beat", "frontend"))

  Write-Host ""
  Write-Host "Rollback completed. Stack is now running against Postgres 16."
}
finally {
  Pop-Location
}
