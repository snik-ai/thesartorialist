#!/bin/zsh
# Paralleles Rendern in Teilstücken: ./render-par.sh <fps> <sub> <dur> <out.mp4> [chunks]
FPS=$1; SUB=$2; DUR=$3; OUT=$4; N=${5:-8}
E=~/.claude/skills/motion-reel/engine
rm -rf out/parts; mkdir -p out/parts
STEP=$(python3 -c "print(round($DUR/$N*$FPS)/$FPS)")
for i in $(seq 0 $((N-1))); do
  A=$(python3 -c "print(round($i*$STEP,4))"); B=$(python3 -c "print(min($DUR, round(($i+1)*$STEP,4)) if $i<$N-1 else $DUR)")
  node $E/render.mjs --page film.html --w 1080 --h 1920 --fps $FPS --sub $SUB --from $A --to $B --dur $DUR --out out/parts/p$i.mp4 > out/parts/log$i.txt 2>&1 &
  echo "file 'p$i.mp4'" >> out/parts/list.txt
done
wait
ffmpeg -v error -y -f concat -safe 0 -i out/parts/list.txt -c copy $OUT && ffprobe -v error -show_entries format=duration -of csv=p=0 $OUT
