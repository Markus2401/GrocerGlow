param([Parameter(Mandatory=$true)][string]$DestinationPath)
$ErrorActionPreference = 'Stop'
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$target = [System.IO.Path]::GetFullPath($DestinationPath)
if (Test-Path -LiteralPath $target) { throw 'Destination already exists. Choose a new filename.' }
$files = @(
    '.gitignore', '.gitattributes', '.prettierignore', '.prettierrc.json', 'package.json', 'package-lock.json',
    'server.js', 'database.js', 'location.js', 'README.md'
)
foreach ($directory in @('public', 'test', 'test-support', 'scripts', 'docs', '.github')) {
    $files += Get-ChildItem -LiteralPath (Join-Path $projectRoot $directory) -File -Recurse |
        ForEach-Object { [System.IO.Path]::GetRelativePath($projectRoot, $_.FullName) }
}
# Explicit allowlist excludes the real database, backups and dependency folders.
if ($files | Where-Object { $_ -match '(?i)(\.db(?:-|$)|\.env(?:\.|$)|\.zip$|\.log$|node_modules|(^|[\\/])backups[\\/])' }) {
    throw 'Unexpected private/generated file in export manifest.'
}
Add-Type -AssemblyName System.IO.Compression
$archive = [System.IO.Compression.ZipFile]::Open($target, [System.IO.Compression.ZipArchiveMode]::Create)
try {
    foreach ($file in $files) {
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
            $archive, (Join-Path $projectRoot $file), ($file -replace '\\','/'),
            [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
    }
} finally { $archive.Dispose() }
Write-Output "Exported $($files.Count) source/evidence files to $target"
