param(
    [string]$DataPath = ".\data.json",
    [string]$OutDir = ".\images",
    [int]$TimeoutSec = 30
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $DataPath)) {
    Write-Error "JSON file not found: $DataPath"
    exit 1
}

if (-not (Test-Path -LiteralPath $OutDir)) {
    New-Item -ItemType Directory -Path $OutDir | Out-Null
}

try {
    $json = Get-Content -LiteralPath $DataPath -Raw -Encoding UTF8 | ConvertFrom-Json
} catch {
    Write-Error "Invalid JSON in $DataPath. $($_.Exception.Message)"
    exit 1
}

$games = $json.games
if ($null -eq $games) {
    Write-Error 'Expected "games" array in JSON.'
    exit 1
}

$total = @($games).Count
$ok = 0
$failed = 0
$index = 0

foreach ($game in $games) {
    $index++
    $url = [string]$game.url
    if ([string]::IsNullOrWhiteSpace($url)) {
        $failed++
        Write-Host "[$index/$total] SKIP: missing url"
        continue
    }

    $name = [string]$game.image
    if ([string]::IsNullOrWhiteSpace($name)) {
        try {
            $name = [System.IO.Path]::GetFileName(([Uri]$url).AbsolutePath)
        } catch {
            $name = ""
        }
    }
    if ([string]::IsNullOrWhiteSpace($name)) {
        $name = "image_$index.png"
    }

    $destination = Join-Path $OutDir $name
    if (Test-Path -LiteralPath $destination) {
        $base = [System.IO.Path]::GetFileNameWithoutExtension($destination)
        $ext = [System.IO.Path]::GetExtension($destination)
        $dir = [System.IO.Path]::GetDirectoryName($destination)
        $n = 1
        do {
            $destination = Join-Path $dir "${base}_$n$ext"
            $n++
        } while (Test-Path -LiteralPath $destination)
    }

    try {
        Invoke-WebRequest -Uri $url -OutFile $destination -TimeoutSec $TimeoutSec | Out-Null
        $ok++
        Write-Host "[$index/$total] OK: $([System.IO.Path]::GetFileName($destination))"
    } catch {
        $failed++
        Write-Host "[$index/$total] ERROR: $url ($($_.Exception.Message))"
    }
}

Write-Host ""
Write-Host "Done. Success: $ok, Failed: $failed, Total: $total"
if ($failed -gt 0) { exit 2 }
