$ErrorActionPreference = 'Stop'

$taskRoot = 'C:\Users\Valentin\Documents\Codex\2026-08-24\repr'
$ondineRoot = 'C:\Users\Valentin\Desktop\Ondine'
$outputRoot = Join-Path $taskRoot 'outputs\capsule-finale-v1'
$assetRoot = Join-Path $outputRoot 'assets'
$silhouetteRoot = Join-Path $assetRoot 'silhouettes'
$printRoot = Join-Path $outputRoot 'prints'
$mockupRoot = Join-Path $outputRoot 'mockups'
$previewRoot = Join-Path $outputRoot 'previews'

New-Item -ItemType Directory -Force -Path $silhouetteRoot, $printRoot, $mockupRoot, $previewRoot | Out-Null

$prototype = Join-Path $taskRoot 'outputs\galerie-propositions-ondine\assets\live-grammar-v4\prototypes\02-empty-stage-ivory-tee.png'
$blankTee = Join-Path $taskRoot 'outputs\galerie-propositions-ondine\assets\templates\tee-front-blank.png'
$library = Join-Path $ondineRoot 'contenu\bibliotheque'

# Recover the three original figures from the accepted V4 prototype. The neutral-color
# test rejects the burgundy paint while retaining the black silhouettes.
magick $prototype -crop '230x270+575+320' +repage `
  -alpha off -fx '(r<0.33 && abs(r-g)<0.075 && abs(g-b)<0.075)?0:1' `
  -threshold 50% -transparent white -fill black -colorize 100 -trim +repage `
  (Join-Path $silhouetteRoot 'mic-black.png')
# Remove one isolated garment-shadow fragment at the upper-right edge.
magick (Join-Path $silhouetteRoot 'mic-black.png') -region '9x6+184+0' `
  -channel A -evaluate set 0 +channel +region -trim +repage `
  (Join-Path $silhouetteRoot 'mic-black.png')

magick $prototype -crop '300x250+250+610' +repage `
  -alpha off -fx '(r<0.33 && abs(r-g)<0.075 && abs(g-b)<0.075)?0:1' `
  -threshold 50% -transparent white -fill black -colorize 100 -trim +repage `
  (Join-Path $silhouetteRoot 'guitar-black.png')

magick $prototype -crop '285x410+590+720' +repage `
  -alpha off -fx '(r<0.33 && abs(r-g)<0.075 && abs(g-b)<0.075)?0:1' `
  -threshold 50% -transparent white -fill black -colorize 100 -trim +repage `
  (Join-Path $silhouetteRoot 'seated-chair-original-black.png')

# Vector silhouettes already selected in Ondine's CC0 library.
$vectorSources = @{
  'runner-black.png'       = 'personnage-274599.svg'
  'seated-floor-black.png' = 'personnage-307339.svg'
  'seated-chair-black.png' = 'personnage-307340.svg'
  'couple-away-black.png'  = 'personnage-329257.svg'
  'empty-bench-black.png'  = 'objet-317571.svg'
}

foreach ($entry in $vectorSources.GetEnumerator()) {
  magick -background none (Join-Path $library $entry.Value) -trim +repage `
    -fill black -colorize 100 (Join-Path $silhouetteRoot $entry.Key)
}

# Organic textile paint recovered from the V4 garment. Only burgundy pixels survive;
# the person and the shirt are transparent in this derived asset.
$organicPaint = Join-Path $assetRoot 'red-paint-organic.png'
magick $prototype -crop '360x500+575+650' +repage -alpha set -channel A `
  -fx '(u.r>0.16 && u.r>u.g*1.22 && u.r>u.b*1.18)?1:0' +channel `
  -trim +repage $organicPaint

# Smooth high-resolution variants of the three recovered raster silhouettes.
magick (Join-Path $silhouetteRoot 'mic-black.png') -filter Lanczos -resize '550x' `
  (Join-Path $silhouetteRoot 'mic-black-hi.png')
magick (Join-Path $silhouetteRoot 'guitar-black.png') -filter Lanczos -resize '1000x' `
  (Join-Path $silhouetteRoot 'guitar-black-hi.png')
magick (Join-Path $silhouetteRoot 'seated-chair-original-black.png') -filter Lanczos -resize '1400x' `
  (Join-Path $silhouetteRoot 'seated-chair-original-black-hi.png')

# White variants for the washed-black piece.
foreach ($name in @('mic-black-hi.png','runner-black.png','seated-chair-black.png','empty-bench-black.png')) {
  $whiteName = $name -replace 'black','white'
  magick (Join-Path $silhouetteRoot $name) -fill white -colorize 100 `
    (Join-Path $silhouetteRoot $whiteName)
}

$impactLarge = Join-Path $assetRoot 'red-paint-organic-large.png'
$impactSmall = Join-Path $assetRoot 'red-paint-organic-small.png'
$threadWide = Join-Path $assetRoot 'red-thread-wide.png'
$threadDiagonal = Join-Path $assetRoot 'red-thread-diagonal.png'

magick $organicPaint -filter Lanczos -resize '1400x' $impactLarge
magick $organicPaint -filter Lanczos -resize '520x' $impactSmall
magick -background none (Join-Path $assetRoot 'red-thread.svg') -resize '3150x790' $threadWide
magick -background none (Join-Path $assetRoot 'red-thread.svg') -resize '3000x750' -rotate 42 $threadDiagonal

# 01 — EMPTY STAGE: the performance is over; the body remains, the instrument doesn't.
$print1 = Join-Path $printRoot '01-empty-stage-bone-4500x5400.png'
magick -size 4500x5400 canvas:none `
  $impactLarge -geometry '+2740+2250' -composite `
  (Join-Path $silhouetteRoot 'mic-black-hi.png') -geometry '+2820+500' -composite `
  (Join-Path $silhouetteRoot 'guitar-black-hi.png') -geometry '+470+2280' -composite `
  (Join-Path $silhouetteRoot 'seated-chair-original-black-hi.png') -geometry '+2700+3060' -composite `
  $print1

# 02 — AFTER US: a shared past in the upper corner, an isolated present below.
$coupleScaled = Join-Path $silhouetteRoot 'couple-away-black-scaled.png'
$floorScaled = Join-Path $silhouetteRoot 'seated-floor-black-scaled.png'
magick (Join-Path $silhouetteRoot 'couple-away-black.png') -resize '1250x' $coupleScaled
magick (Join-Path $silhouetteRoot 'seated-floor-black.png') -resize '1500x' $floorScaled
$print2 = Join-Path $printRoot '02-after-us-ash-4500x5400.png'
magick -size 4500x5400 canvas:none `
  $threadWide -geometry '+640+2130' -composite `
  $coupleScaled -geometry '+430+560' -composite `
  -fill black -draw 'rectangle 2210,1420 2244,2780' `
  $impactSmall -geometry '+1980+2180' -composite `
  $floorScaled -geometry '+2520+3650' -composite `
  $print2

# 03 — NO ENCORE: four beats that move from performance to an empty place.
$micWhite = Join-Path $silhouetteRoot 'mic-white-hi.png'
$micWhiteScaled = Join-Path $silhouetteRoot 'mic-white-scaled.png'
$runnerWhiteScaled = Join-Path $silhouetteRoot 'runner-white-scaled.png'
$chairWhiteScaled = Join-Path $silhouetteRoot 'seated-chair-white-scaled.png'
$benchWhiteScaled = Join-Path $silhouetteRoot 'empty-bench-white-scaled.png'
magick $micWhite -resize '450x' $micWhiteScaled
magick (Join-Path $silhouetteRoot 'runner-white.png') -resize '820x' $runnerWhiteScaled
magick (Join-Path $silhouetteRoot 'seated-chair-white.png') -resize '820x' $chairWhiteScaled
magick (Join-Path $silhouetteRoot 'empty-bench-white.png') -resize '1150x' $benchWhiteScaled
$print3 = Join-Path $printRoot '03-no-encore-black-4500x5400.png'
magick -size 4500x5400 canvas:none `
  $threadDiagonal -geometry '+760+1040' -composite `
  $micWhiteScaled -geometry '+380+430' -composite `
  $runnerWhiteScaled -geometry '+1460+1580' -composite `
  $chairWhiteScaled -geometry '+2520+2800' -composite `
  $benchWhiteScaled -geometry '+3040+4250' -composite `
  $print3

# Normalize delivery files for common DTG uploaders.
foreach ($deliveryPrint in @($print1, $print2, $print3)) {
  magick $deliveryPrint -units PixelsPerInch -density 300 -depth 8 $deliveryPrint
}

# Faithful front-print mockups. Every visible mark stays inside one printable front area.
$ashTee = Join-Path $assetRoot 'tee-front-ash.png'
$blackTee = Join-Path $assetRoot 'tee-front-washed-black.png'
magick $blankTee -channel RGB -fx '((r+g+b)/3<0.04)?0:(0.22+0.54*((r+g+b)/3))' $ashTee
magick $blankTee -channel RGB -fx '((r+g+b)/3<0.04)?0:(0.035+0.18*((r+g+b)/3))' $blackTee

function New-FrontMockup {
  param(
    [string]$Garment,
    [string]$Print,
    [string]$Destination
  )
  $resizedPrint = Join-Path $env:TEMP ('ondine-print-' + [guid]::NewGuid().ToString('N') + '.png')
  magick $Print -resize '660x792' $resizedPrint
  magick $Garment $resizedPrint -gravity northwest -geometry '+297+242' -composite $Destination
  Remove-Item -LiteralPath $resizedPrint
}

New-FrontMockup -Garment $blankTee -Print $print1 -Destination (Join-Path $mockupRoot '01-empty-stage-bone.png')
New-FrontMockup -Garment $ashTee -Print $print2 -Destination (Join-Path $mockupRoot '02-after-us-ash.png')
New-FrontMockup -Garment $blackTee -Print $print3 -Destination (Join-Path $mockupRoot '03-no-encore-black.png')

# Transparent previews and a three-product contact sheet.
magick $print1 -background '#eeeae1' -alpha background -alpha remove -resize '900x1080' (Join-Path $previewRoot '01-empty-stage-preview.png')
magick $print2 -background '#b9b6af' -alpha background -alpha remove -resize '900x1080' (Join-Path $previewRoot '02-after-us-preview.png')
magick $print3 -background '#171717' -alpha background -alpha remove -resize '900x1080' (Join-Path $previewRoot '03-no-encore-preview.png')

$mockups = @(
  (Join-Path $mockupRoot '01-empty-stage-bone.png'),
  (Join-Path $mockupRoot '02-after-us-ash.png'),
  (Join-Path $mockupRoot '03-no-encore-black.png')
)
magick montage $mockups -tile '3x1' -geometry '900x900+24+24' -background '#090909' `
  (Join-Path $outputRoot 'planche-3-produits.jpg')

magick identify $print1 $print2 $print3
