#!/bin/sh
# Contact-Sheet aus den Kontrollbildern: sh sheet.sh <ordner> <desktop|mobile> <spalten> <breite>
D="$1"; G="${2:-desktop}"; C="${3:-4}"; B="${4:-480}"
ls "$D"/$G-*.png | sort -t- -k2 -g > "$D/liste.txt"
N=$(wc -l < "$D/liste.txt" | tr -d ' ')
ARGS=""; FC=""; LAY=""; i=0
while read f; do
  ARGS="$ARGS -i $f"
  FC="$FC[$i:v]scale=$B:-1[v$i];"
  i=$((i+1))
done < "$D/liste.txt"
H=$(ffprobe -v error -select_streams v -show_entries stream=height,width -of csv=p=0 "$(head -1 "$D/liste.txt")" | awk -F, -v b="$B" '{printf "%d", $2*b/$1}')
L=""; j=0
while [ $j -lt $N ]; do
  x=$(( (j % C) * B )); y=$(( (j / C) * H ))
  L="$L${L:+|}${x}_${y}"; FC="$FC[v$j]"; j=$((j+1))
done
ffmpeg -loglevel error -y $ARGS -filter_complex "${FC}xstack=inputs=$N:layout=$L:fill=black" -frames:v 1 "$D/sheet-$G.png"
echo "$D/sheet-$G.png"
