#!/bin/bash
# Kontaktbogen ohne drawtext: sheet.sh <out.png> <cols> <breite> <bilder...>
out=$1; cols=$2; sc=$3; shift 3; args=(); fc=""; lay=""; i=0
IFS=x read iw ih < <(ffprobe -v error -show_entries stream=width,height -of csv=s=x:p=0 "$1")
th=$(( sc*ih/iw/2*2 )); cw=$((sc+6)); chh=$((th+6))
for f in "$@"; do args+=(-i "$f"); fc+="[$i]scale=$sc:$th,pad=$cw:$chh:3:3:color=red[v$i];"; lay+="$(( (i%cols)*cw ))_$(( (i/cols)*chh ))|"; i=$((i+1)); done
ins=""; for j in $(seq 0 $((i-1))); do ins+="[v$j]"; done
ffmpeg -y -loglevel error "${args[@]}" -filter_complex "${fc}${ins}xstack=inputs=$i:layout=${lay%|}:fill=black" "$out"
