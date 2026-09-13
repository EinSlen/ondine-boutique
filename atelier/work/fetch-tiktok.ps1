$ErrorActionPreference = 'Stop'

$videos = @(
  @{ Name = 'live2die'; Url = 'https://www.tiktok.com/@llive2diie/video/7665848068016721166' },
  @{ Name = 'rawsoult'; Url = 'https://www.tiktok.com/@rawsoult/video/7644851305957084436' },
  @{ Name = '242g'; Url = 'https://www.tiktok.com/@242.g_/video/7675542422411070750' }
)

$headers = @{
  'User-Agent' = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/128.0.0.0 Safari/537.36'
}

$output = Join-Path $PSScriptRoot 'tiktok'
New-Item -ItemType Directory -Path $output -Force | Out-Null

foreach ($video in $videos) {
  $cookieJar = Join-Path $output "$($video.Name)-cookies.txt"
  $pageFile = Join-Path $output "$($video.Name)-page.html"
  & curl.exe -sS -L --fail --compressed --connect-timeout 20 --max-time 60 `
    -A $headers['User-Agent'] -c $cookieJar -o $pageFile $video.Url
  if ($LASTEXITCODE -ne 0) { throw "Page TikTok introuvable pour $($video.Name)" }
  $page = Get-Content -LiteralPath $pageFile -Raw
  $match = [regex]::Match($page, 'playAddr":"([^"]+)')
  if (-not $match.Success) { throw "Adresse video introuvable pour $($video.Name)" }

  $mediaUrl = $match.Groups[1].Value -replace '\\u002F', '/'
  $mediaUrl = $mediaUrl -replace '\\u0026', '&'
  $destination = Join-Path $output "$($video.Name).mp4"
  & curl.exe -sS -L --fail --connect-timeout 20 --max-time 60 `
    --compressed -A $headers['User-Agent'] -e $video.Url -b $cookieJar -o $destination $mediaUrl
  if ($LASTEXITCODE -ne 0) { throw "Telechargement video impossible pour $($video.Name)" }
  Write-Output $destination
}
