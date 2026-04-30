[CmdletBinding()]
param(
  [string]$DbUser = "postgres",
  [string]$DbName = "eventhub",
  [string]$BackupRoot = "ops/postgres/backups",
  [switch]$SkipAppRestart
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

function Get-DockerOutput {
  param(
    [Parameter(Mandatory = $true)]
    [string[]]$Args
  )

  $output = & docker @Args
  if ($LASTEXITCODE -ne 0) {
    throw "Docker command failed: docker $($Args -join ' ')"
  }

  return ($output | Out-String).Trim()
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

  throw "Timed out waiting for database readiness ($TimeoutSeconds seconds)."
}

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..\")).Path
Push-Location $repoRoot

try {
  $compose16 = @("compose", "-f", "docker-compose.yml")
  $compose18 = @("compose", "-f", "docker-compose.yml", "-f", "docker-compose.pg18.yml")
  $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"

  $backupDirectory = Join-Path $repoRoot $BackupRoot
  New-Item -ItemType Directory -Path $backupDirectory -Force | Out-Null

  $logicalBackupPath = Join-Path $backupDirectory "eventhub-pg16-logical-$timestamp.sql"
  $volumeBackupPath = Join-Path $backupDirectory "eventhub-pg16-volume-$timestamp.tar.gz"

  Write-Host ""
  Write-Host "== Pre-flight =="
  Invoke-Docker -Args @("compose", "-f", "docker-compose.yml", "config", "-q")
  Invoke-Docker -Args @("compose", "-f", "docker-compose.yml", "-f", "docker-compose.pg18.yml", "config", "-q")

  Write-Host ""
  Write-Host "== Stop writers and ensure Postgres 16 is up =="
  Invoke-Docker -Args ($compose16 + @("stop", "backend", "celery_worker", "celery_beat"))
  Invoke-Docker -Args ($compose16 + @("up", "-d", "db"))
  Wait-ForDb -ComposeArgs $compose16 -DbUserName $DbUser -DatabaseName $DbName

  $db16ContainerId = Get-DockerOutput -Args ($compose16 + @("ps", "-q", "db"))
  if ([string]::IsNullOrWhiteSpace($db16ContainerId)) {
    throw "Unable to resolve db container id for Postgres 16."
  }

  Write-Host ""
  Write-Host "== Capture logical backup from Postgres 16 =="
  $logicalDumpInContainer = "/tmp/eventhub_pg16_dump.sql"
  Invoke-Docker -Args ($compose16 + @(
      "exec", "-T", "db", "sh", "-lc",
      "pg_dumpall -U $DbUser --clean --if-exists --quote-all-identifiers > $logicalDumpInContainer"
    ))
  Invoke-Docker -Args @("cp", "${db16ContainerId}:$logicalDumpInContainer", $logicalBackupPath)
  Invoke-Docker -Args ($compose16 + @("exec", "-T", "db", "rm", "-f", $logicalDumpInContainer))

  Write-Host ""
  Write-Host "== Capture physical backup of Postgres 16 volume =="
  $sourceVolumeName = Get-DockerOutput -Args @(
    "inspect", $db16ContainerId,
    "--format", '{{range .Mounts}}{{if eq .Destination "/var/lib/postgresql/data"}}{{.Name}}{{end}}{{end}}'
  )

  if ([string]::IsNullOrWhiteSpace($sourceVolumeName)) {
    throw "Unable to detect source Postgres 16 volume name from db container mounts."
  }

  $backupDirectoryForDocker = (Resolve-Path $backupDirectory).Path
  Invoke-Docker -Args @(
    "run", "--rm",
    "-v", "${sourceVolumeName}:/volume:ro",
    "-v", "${backupDirectoryForDocker}:/backup",
    "alpine",
    "sh", "-lc",
    "tar -czf /backup/$(Split-Path $volumeBackupPath -Leaf) -C /volume ."
  )

  Write-Host ""
  Write-Host "== Start Postgres 18 on dedicated volume =="
  Invoke-Docker -Args ($compose16 + @("stop", "db"))
  Invoke-Docker -Args ($compose18 + @("up", "-d", "db"))
  Wait-ForDb -ComposeArgs $compose18 -DbUserName $DbUser -DatabaseName "postgres"

  $db18ContainerId = Get-DockerOutput -Args ($compose18 + @("ps", "-q", "db"))
  if ([string]::IsNullOrWhiteSpace($db18ContainerId)) {
    throw "Unable to resolve db container id for Postgres 18."
  }

  Write-Host ""
  Write-Host "== Restore logical backup into Postgres 18 =="
  $logicalDumpOnPg18 = "/tmp/eventhub_pg16_dump.sql"
  Invoke-Docker -Args @("cp", $logicalBackupPath, "${db18ContainerId}:$logicalDumpOnPg18")
  Invoke-Docker -Args ($compose18 + @(
      "exec", "-T", "db", "sh", "-lc",
      "psql -v ON_ERROR_STOP=1 -U $DbUser -d postgres -f $logicalDumpOnPg18"
    ))
  Invoke-Docker -Args ($compose18 + @("exec", "-T", "db", "rm", "-f", $logicalDumpOnPg18))

  Write-Host ""
  Write-Host "== Validate upgraded database =="
  $versionOutput = Get-DockerOutput -Args ($compose18 + @("exec", "-T", "db", "psql", "-U", $DbUser, "-d", "postgres", "-tAc", "SELECT version();"))
  $databaseCount = Get-DockerOutput -Args ($compose18 + @("exec", "-T", "db", "psql", "-U", $DbUser, "-d", "postgres", "-tAc", "SELECT count(*) FROM pg_database;"))
  $publicTableCount = Get-DockerOutput -Args ($compose18 + @("exec", "-T", "db", "psql", "-U", $DbUser, "-d", $DbName, "-tAc", "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';"))

  Write-Host "PostgreSQL version: $versionOutput"
  Write-Host "Databases found: $databaseCount"
  Write-Host "Public tables in ${DbName}: $publicTableCount"

  if (-not $SkipAppRestart) {
    Write-Host ""
    Write-Host "== Start app services against Postgres 18 =="
    Invoke-Docker -Args ($compose18 + @("up", "-d", "backend", "celery_worker", "celery_beat", "frontend"))
  }

  Write-Host ""
  Write-Host "Migration completed."
  Write-Host "Logical backup: $logicalBackupPath"
  Write-Host "Volume backup:  $volumeBackupPath"
  Write-Host "Old Postgres 16 volume kept intact: $sourceVolumeName"
}
finally {
  Pop-Location
}
