$ErrorActionPreference = 'Stop'
$PSNativeCommandUseErrorActionPreference = $true

$taskRoot = 'C:\Users\Valentin\Documents\Codex\2026-08-24\repr'
$ondineRoot = 'C:\Users\Valentin\Desktop\Ondine'
$outputRoot = Join-Path $taskRoot 'outputs\capsule-tiktok-v1'
$assetRoot = Join-Path $outputRoot 'assets'
$printRoot = Join-Path $outputRoot 'prints'
$mockupRoot = Join-Path $outputRoot 'mockups'
$previewRoot = Join-Path $outputRoot 'previews'
$placementRoot = Join-Path $outputRoot 'placements'

New-Item -ItemType Directory -Force -Path $assetRoot, $printRoot, $mockupRoot, $previewRoot, $placementRoot | Out-Null

$generatedRoot = 'C:\Users\Valentin\.codex\generated_images\01a032dc-3e5a-74c2-ae6a-9aa1372cbde9'
$longSleeveSource = Join-Path $generatedRoot 'exec-586beb7a-687b-4820-b226-6521f9255bb5.png'
$hoodieSource = Join-Path $generatedRoot 'exec-96481123-6a52-49b6-8fec-73ba9fe4d565.png'
$collapsedSource = Join-Path $generatedRoot 'exec-1d53ac41-2157-4909-b657-df1f4a7caf60.png'
$runnerSource = Join-Path $generatedRoot 'exec-591d29e6-5634-4d3e-8e3f-6a5991d9a792.png'
$blankTeeSource = Join-Path $taskRoot 'outputs\galerie-propositions-ondine\assets\templates\tee-front-blank.png'
$organicPaintSource = Join-Path $taskRoot 'outputs\capsule-finale-v1\assets\red-paint-organic.png'
$libraryRoot = Join-Path $ondineRoot 'contenu\bibliotheque'

Copy-Item -LiteralPath $longSleeveSource -Destination (Join-Path $assetRoot 'blank-bone-longsleeve.png') -Force
Copy-Item -LiteralPath $hoodieSource -Destination (Join-Path $assetRoot 'blank-bone-hoodie.png') -Force
Copy-Item -LiteralPath $blankTeeSource -Destination (Join-Path $assetRoot 'blank-tee.png') -Force
Copy-Item -LiteralPath $organicPaintSource -Destination (Join-Path $assetRoot 'red-paint-organic.png') -Force

# Original silhouette generated for this capsule; flatten to one screen-print color.
$collapsed = Join-Path $assetRoot 'collapsed-performer-black.png'
magick $collapsedSource -trim +repage -fill black -colorize 100 -filter Lanczos -resize '1280x' $collapsed

$runner = Join-Path $assetRoot 'runner-black.png'
$seatedNegative = Join-Path $assetRoot 'seated-cyan.png'
$birdWhite = Join-Path $assetRoot 'bird-white.png'
magick $runnerSource -trim +repage -fill black -colorize 100 -resize '1120x' $runner
magick -background none (Join-Path $libraryRoot 'personnage-307339.svg') -trim +repage -colorspace sRGB -fill '#9ed9e8' -colorize 100 -resize '1580x' $seatedNegative
magick -background none (Join-Path $libraryRoot 'symbole-279445.svg') -trim +repage -fill white -colorize 100 -resize '1420x' $birdWhite

$paintLarge = Join-Path $assetRoot 'red-paint-large.png'
magick $organicPaintSource -filter Lanczos -resize '980x' $paintLarge

# 01 — direct response to the Live2die TikTok grammar: two isolated figures,
# one organic burgundy impact, and sparse garment-wide drops.
$print1 = Join-Path $printRoot '01-stay-run-front-4500x5400.png'
magick -size 4500x5400 canvas:none `
  $paintLarge -geometry '+700+560' -composite `
  -fill '#6f111a' -draw 'ellipse 1220,1100 230,145 0,360 ellipse 1390,1190 150,95 0,360' `
  $collapsed -geometry '+760+860' -composite `
  $runner -geometry '+2560+1050' -composite `
  -fill '#77131b' `
  -draw 'circle 390,3990 445,3990 circle 1160,4380 1192,4380 circle 2050,3510 2090,3510 circle 3140,4260 3190,4260 circle 4050,3680 4080,3680 circle 3820,4700 3860,4700' `
  $print1

$leftSleeve1 = Join-Path $placementRoot '01-stay-run-left-sleeve-1500x1800.png'
$rightSleeve1 = Join-Path $placementRoot '01-stay-run-right-sleeve-1500x1800.png'
magick -size 1500x1800 canvas:none -fill '#77131b' `
  -draw 'circle 290,370 340,370 circle 810,910 840,910 circle 470,1430 505,1430' `
  $leftSleeve1
magick -size 1500x1800 canvas:none -fill '#77131b' `
  -draw 'circle 1180,360 1225,360 circle 650,1080 690,1080 circle 1070,1500 1100,1500' $rightSleeve1

# 02 — direct response to RawSoult: naive storyboard drawing, one corecore line,
# and only a few red pinpricks.
$print2 = Join-Path $printRoot '02-did-it-feel-worth-it-front-4500x5400.png'
magick -background none (Join-Path $assetRoot '02-did-it-feel-worth-it.svg') -depth 8 $print2
$sleeve2 = Join-Path $placementRoot '02-did-it-feel-worth-it-cuff-drops-1500x1800.png'
magick -size 1500x1800 canvas:none -fill '#77131b' `
  -draw 'circle 240,1460 285,1460 circle 1030,1570 1060,1570 circle 760,1260 785,1260' $sleeve2

# 03 — direct response to 242g: pale negative fragments on black, one pictogram,
# and a two-part lowercase phrase.
$copy3 = Join-Path $assetRoot '03-copy-and-fragments.png'
magick -background none (Join-Path $assetRoot '03-copy-and-fragments.svg') -depth 8 $copy3
$seatedGhost = Join-Path $assetRoot 'seated-white-ghost.png'
magick $seatedNegative -fill white -colorize 100 -channel A -evaluate multiply 0.58 +channel $seatedGhost
$seatedGhostRotated = Join-Path $assetRoot 'seated-white-ghost-rotated.png'
$seatedCyanRotated = Join-Path $assetRoot 'seated-cyan-rotated.png'
magick $seatedGhost -background none -rotate -18 +repage $seatedGhostRotated
magick $seatedNegative -background none -rotate -18 +repage $seatedCyanRotated
$print3 = Join-Path $printRoot '03-same-night-different-exits-4500x5400.png'
magick -size 4500x5400 canvas:none `
  $seatedGhostRotated -geometry '+350+1050' -composite `
  $seatedCyanRotated -geometry '+395+1090' -composite `
  $birdWhite -geometry '+2740+1080' -composite `
  $copy3 -geometry '+0+0' -composite `
  $print3

foreach ($deliveryPrint in @($print1, $print2, $print3, $leftSleeve1, $rightSleeve1, $sleeve2)) {
  magick $deliveryPrint -depth 8 -units PixelsPerInch -set density 300 $deliveryPrint
}

# Mockup 01: front placement plus optional sleeve placements.
$front1Mock = Join-Path $assetRoot 'front1-mock.png'
magick $print1 -resize '720x864' $front1Mock
$leftSleeveMock = Join-Path $assetRoot 'left-sleeve1-mock.png'
$rightSleeveMock = Join-Path $assetRoot 'right-sleeve1-mock.png'
magick $leftSleeve1 -resize '210x252' -background none -rotate -17 +repage $leftSleeveMock
magick $rightSleeve1 -resize '210x252' -background none -rotate 17 +repage $rightSleeveMock
magick (Join-Path $assetRoot 'blank-bone-longsleeve.png') `
  $front1Mock -geometry '+408+270' -composite `
  $leftSleeveMock -geometry '+105+590' -composite `
  $rightSleeveMock -geometry '+1210+575' -composite `
  (Join-Path $mockupRoot '01-stay-run-longsleeve.png')

# Mockup 02: hoodie print ends above the kangaroo pocket; cuff dots are a separate placement.
$front2Mock = Join-Path $assetRoot 'front2-mock.png'
$cuff2Mock = Join-Path $assetRoot 'cuff2-mock.png'
$cuff2LeftMock = Join-Path $assetRoot 'cuff2-left-mock.png'
$cuff2RightMock = Join-Path $assetRoot 'cuff2-right-mock.png'
magick $print2 -resize '610x732' $front2Mock
magick $sleeve2 -resize '170x204' $cuff2Mock
magick $cuff2Mock -background none -rotate -18 +repage $cuff2LeftMock
magick $cuff2Mock -flop -background none -rotate 18 +repage $cuff2RightMock
magick (Join-Path $assetRoot 'blank-bone-hoodie.png') `
  $front2Mock -geometry '+322+300' -composite `
  $cuff2LeftMock -geometry '+110+830' -composite `
  $cuff2RightMock -geometry '+970+830' -composite `
  (Join-Path $mockupRoot '02-did-it-feel-worth-it-hoodie.png')

# Mockup 03: washed-black tee, one conventional front placement.
$blackTee = Join-Path $assetRoot 'blank-washed-black-tee.png'
magick (Join-Path $assetRoot 'blank-tee.png') -channel RGB `
  -fx '((r+g+b)/3<0.04)?0:(0.035+0.18*((r+g+b)/3))' $blackTee
$front3Mock = Join-Path $assetRoot 'front3-mock.png'
magick $print3 -resize '650x780' $front3Mock
magick $blackTee $front3Mock -geometry '+302+245' -composite `
  (Join-Path $mockupRoot '03-same-night-different-exits-tee.png')

# Print-only previews.
magick $print1 -background '#eeeae1' -alpha background -alpha remove -resize '900x1080' (Join-Path $previewRoot '01-stay-run.png')
magick $print2 -background '#eeeae1' -alpha background -alpha remove -resize '900x1080' (Join-Path $previewRoot '02-did-it-feel-worth-it.png')
magick $print3 -background '#151515' -alpha background -alpha remove -resize '900x1080' (Join-Path $previewRoot '03-same-night-different-exits.png')

$mockups = @(
  (Join-Path $mockupRoot '01-stay-run-longsleeve.png'),
  (Join-Path $mockupRoot '02-did-it-feel-worth-it-hoodie.png'),
  (Join-Path $mockupRoot '03-same-night-different-exits-tee.png')
)
magick montage $mockups -tile '3x1' -geometry '900x900+24+24' -background '#080808' `
  (Join-Path $outputRoot 'planche-tiktok-3-produits.jpg')

magick identify $print1 $print2 $print3
