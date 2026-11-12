#!/bin/bash
# stills.sh <format 16x9|9x16> <zeiten,komma> <sheet.png> [cols] [breite]   (v5: film-v5.html)
cd "$(dirname "$0")"
export NODE_PATH=${NODE_PATH:-/Users/strachi/_Claude/Diekrankenkasse/node_modules}

if [ "$1" = "9x16" ]; then WH="--w 1080 --h 1920 --q f=9x16"; else WH="--w 1920 --h 1080"; fi
rm -rf out/stills-$1; node engine/stills.mjs --page film-v5.html $WH ${Q:+--q $Q} --times "$2" --out out/stills-$1 >/dev/null
./sheet.sh "$3" ${4:-5} ${5:-384} out/stills-$1/*.png
