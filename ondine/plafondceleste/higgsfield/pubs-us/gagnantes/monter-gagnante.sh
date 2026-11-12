#!/usr/bin/env bash
# bash monter-gagnante.sh <disc shot.mp4> : builds the 3 final versions of the best ad (no text / "à vos enfants" / "peur du noir"),
# new disc shot + plug and lights-off from V1 + sky zoomed to fill the screen, warm light on the room shots, grain and a slight handheld shake
set -euo pipefail
cd "$(dirname "$0")"
DISC="$1"
D0=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$DISC")
SWITCH=$(awk -v d="$D0" 'BEGIN { printf "%.2f", d + 4.53 }')
WARM="colorbalance=rs=0.08:gs=0.03:bs=-0.08:rm=0.05:bm=-0.05"
ZOOM="scale=1080:1920:flags=lanczos,setsar=1"
GRAPH="[0:v]scale=1080:1920:flags=lanczos,setsar=1,fps=24,${WARM}[s0];\
[1:v]trim=5.67:10.2,setpts=PTS-STARTPTS,fps=24,${WARM}[s1];\
[1:v]trim=10.2:15.2,setpts=PTS-STARTPTS,fps=24,crop=720:1280:180:'max(0,min(640,(0.18+0.044*t)*1920-640))',${ZOOM}[s2];\
[1:v]trim=15.2:17.33,setpts=PTS-STARTPTS,fps=24,crop=720:1280:180:205,${ZOOM}[s3];\
[1:v]trim=17.33:20.06,setpts=PTS-STARTPTS,fps=24,crop=720:1280:180:378,${ZOOM}[s4];\
[0:a]aresample=44100[a0];[1:a]atrim=5.67:20.06,asetpts=PTS-STARTPTS,aresample=44100[a1];\
[s0][s1][s2][s3][s4]concat=n=5:v=1:a=0[vc];\
[a0][a1]concat=n=2:v=0:a=1[a];\
[vc]crop=1040:1848:'20+12*sin(2*PI*t*0.6)':'36+16*sin(2*PI*t*0.45+1)',scale=1080:1920,noise=alls=9:allf=t+u[base]"
E=(-c:v libx264 -preset slow -crf 19 -pix_fmt yuv420p -c:a aac -b:a 160k -movflags +faststart)

ffmpeg -v error -y -i "$DISC" -i V1-1080.mp4 -filter_complex "${GRAPH}" -map "[base]" -map "[a]" "${E[@]}" G-base.mp4
ffmpeg -v error -y -i G-base.mp4 -c copy G1-sans-texte.mp4
ffmpeg -v error -y -i G-base.mp4 -loop 1 -i t-enfants.png -filter_complex "[0:v][1:v]overlay=shortest=1[v]" -map "[v]" -map 0:a "${E[@]}" G2-montrez-pas-aux-enfants.mp4
ffmpeg -v error -y -i G-base.mp4 -loop 1 -i t-peur.png -loop 1 -i t-etoiles.png -filter_complex "[0:v][1:v]overlay=shortest=1:enable='lt(t,${SWITCH})'[v1];[v1][2:v]overlay=shortest=1:enable='gte(t,${SWITCH})'[v]" -map "[v]" -map 0:a "${E[@]}" G3-peur-du-noir.mp4
for f in G1-sans-texte G2-montrez-pas-aux-enfants G3-peur-du-noir; do echo "$f $(ffprobe -v error -show_entries format=duration -of csv=p=0 $f.mp4)"; done
