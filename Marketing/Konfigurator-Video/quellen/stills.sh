#!/bin/bash
# stills.sh <format 16x9|9x16> <zeiten,komma> <sheet.png> [cols] [breite]
cd "$(dirname "$0")"
export NODE_PATH=${NODE_PATH:-/private/tmp/claude-501/-Users-strachi--Claude-thesartorialist/0879bee5-c610-4686-8f94-864f4f573b0b/scratchpad/pw/node_modules}
E=~/.claude/skills/motion-reel/engine
if [ "$1" = "9x16" ]; then WH="--w 1080 --h 1920 --q f=9x16"; else WH="--w 1920 --h 1080"; fi
rm -rf out/stills-$1; node $E/stills.mjs --page film.html $WH ${Q:+--q $Q} --times "$2" --out out/stills-$1 >/dev/null
./sheet.sh "$3" ${4:-5} ${5:-384} out/stills-$1/*.png
