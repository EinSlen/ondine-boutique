param(
    [string]$OutputDir = "C:\Users\Valentin\Documents\Codex\2026-08-24\repr\work\research-100\pack"
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

$families = @(
    [pscustomobject]@{ Key = "01-personnages"; Query = "man silhouette"; Limit = 10 },
    [pscustomobject]@{ Key = "02-chaises"; Query = "chair silhouette"; Limit = 10 },
    [pscustomobject]@{ Key = "03-mains"; Query = "hand silhouette"; Limit = 10 },
    [pscustomobject]@{ Key = "04-corbeaux"; Query = "crow silhouette"; Limit = 10 },
    [pscustomobject]@{ Key = "05-roses"; Query = "rose silhouette"; Limit = 10 },
    [pscustomobject]@{ Key = "06-anges"; Query = "angel silhouette"; Limit = 10 },
    [pscustomobject]@{ Key = "07-telephones"; Query = "telephone silhouette"; Limit = 10 },
    [pscustomobject]@{ Key = "08-barbeles"; Query = "barbed wire"; Limit = 10 },
    [pscustomobject]@{ Key = "09-cimetieres"; Query = "cemetery"; Limit = 10 },
    [pscustomobject]@{ Key = "10-portes"; Query = "door silhouette"; Limit = 10 }
)

$svgDir = Join-Path $OutputDir "svg"
$thumbDir = Join-Path $OutputDir "thumbs"
New-Item -ItemType Directory -Force -Path $svgDir, $thumbDir | Out-Null

$seen = [System.Collections.Generic.HashSet[string]]::new()
$manifest = [System.Collections.Generic.List[object]]::new()
$globalIndex = 0

foreach ($family in $families) {
    $encoded = [uri]::EscapeDataString($family.Query)
    $searchUrl = "https://openclipart.org/search/?query=$encoded"
    $html = (Invoke-WebRequest -Uri $searchUrl -UseBasicParsing -TimeoutSec 30).Content
    $matches = [regex]::Matches($html, 'href=["''](?<url>/detail/(?<id>\d+)/(?<slug>[^"'']+))["'']')
    $accepted = 0

    foreach ($match in $matches) {
        if ($accepted -ge $family.Limit) { break }

        $id = $match.Groups["id"].Value
        $slug = $match.Groups["slug"].Value.Trim("/")
        if (-not $seen.Add($id)) { continue }

        $globalIndex++
        $safeSlug = ($slug -replace '[^a-zA-Z0-9_-]', '-')
        $baseName = "{0:D3}-{1}-{2}" -f $globalIndex, $id, $safeSlug
        $svgPath = Join-Path $svgDir "$baseName.svg"
        $thumbPath = Join-Path $thumbDir "$baseName.png"
        $downloadUrl = "https://openclipart.org/download/$id/$slug.svg"
        $detailUrl = "https://openclipart.org/detail/$id/$slug"

        try {
            Invoke-WebRequest -Uri $downloadUrl -OutFile $svgPath -UseBasicParsing -TimeoutSec 30
            $firstLine = Get-Content -LiteralPath $svgPath -TotalCount 1
            if ($firstLine -notmatch '<\?xml|<svg') {
                Remove-Item -LiteralPath $svgPath -Force
                $globalIndex--
                continue
            }

            & magick -background white $svgPath -alpha remove -alpha off -thumbnail "520x420" -gravity center -extent "560x480" $thumbPath
            if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $thumbPath)) {
                Remove-Item -LiteralPath $svgPath -Force
                $globalIndex--
                continue
            }

            $accepted++
            $manifest.Add([pscustomobject]@{
                index = $globalIndex
                family = $family.Key
                query = $family.Query
                title = ($slug -replace '-', ' ')
                openclipart_id = $id
                detail_url = $detailUrl
                download_url = $downloadUrl
                svg_file = "svg/$baseName.svg"
                thumbnail_file = "thumbs/$baseName.png"
                license = "CC0 1.0 / Public Domain"
            })
        }
        catch {
            if (Test-Path -LiteralPath $svgPath) { Remove-Item -LiteralPath $svgPath -Force }
            if (Test-Path -LiteralPath $thumbPath) { Remove-Item -LiteralPath $thumbPath -Force }
            $globalIndex--
        }
    }
}

$manifest | Export-Csv -LiteralPath (Join-Path $OutputDir "manifest.csv") -NoTypeInformation -Encoding UTF8
$manifest | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath (Join-Path $OutputDir "manifest.json") -Encoding UTF8

$summary = $manifest | Group-Object family | Sort-Object Name | ForEach-Object {
    [pscustomobject]@{ family = $_.Name; count = $_.Count }
}
$summary | Format-Table -AutoSize
Write-Output ("TOTAL={0}" -f $manifest.Count)
