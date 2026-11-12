// ton-sprecher.mjs – Sprecher (ElevenLabs TTS mit Wort-Zeitstempeln) auf die Filmzeit legen und über den fertigen Ton mischen.
//   ELEVENLABS_KEY_FILE=~/_Claude/Luma/.env node ../../_vorlage/engine/ton-sprecher.mjs \
//     --plan ton/sprecher.json --ton out/ton.wav --out out/ton-sprecher.wav [--kalt 2.2] [--stimme <voice_id>] [--neu]
//
// sprecher.json: { stimme: {id}, modell, einstellungen, zeit?: {szenen, zonen}, zeilen: [...] }
//   Zeile: { id, text, t, bis }              Einsatz in Filmzeit (nach Speed-Ramps), bis = spätestes Ende in Filmzeit
//          { id, text, szene, bis }          Einsatz in Szenenzeit (braucht plan.zeit), bis in Szenenzeit
//          { id, text, anker: {wort, szene}, bis }  dieses Wort (0-basiert) beginnt zur Szenenzeit – die Stimme folgt dem Bild
//          { id, text, nach: 0.15 }          direkt nach der vorigen Zeile (Sprech-Ende + Pause in s)
//          { id, text, kalt: 0.1 }           nur im Cold Open (9:16): Sekunden ab Filmbeginn, vor dem Hauptfilm
// --kalt s: Länge des Cold Opens. Ohne --kalt fallen kalt-Zeilen weg und nichts wird verschoben.
// Ergebnis: Mischung (OUT) + Wortzeiten für den Film: <plan-ordner>/sprecher-zeiten.js
//   (window.SPRECHER[id] = {von, bis, worte:[{w,t,e}]} in Szenenzeit; Cold-Open-Zeilen in Sekunden ab Filmbeginn)
//
// Ablauf: jede Zeile einzeln erzeugen (/with-timestamps, previous_text/next_text, Seed 7) → exakt auf erstes/letztes Zeichen
// zuschneiden (Wortzeiten bleiben genau) → Sprecherspur 48 kHz. Mischung: Stimme (Hochpass, Kompressor, Präsenz, +15 dB) liegt
// 8–13 dB über Musik+Effekte (Bett −3 dB, Sidechain-Ducking), Summe zweistufig auf −14 LUFS, True Peak −1.5 dB.
// Zeile zu lang → Text kürzen, nicht beschleunigen (klingt gehetzt).
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { resolve, dirname, basename } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { anfrage } from './eleven.mjs';

const HIER = dirname(new URL(import.meta.url).pathname);
createRequire(import.meta.url)(resolve(HIER, '../lib/timewarp.js'));
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const PLAN = resolve(arg('plan', 'ton/sprecher.json')), TON = resolve(arg('ton', 'out/ton.wav')), OUT = resolve(arg('out', 'out/ton-sprecher.wav'));
const KALT = +arg('kalt', 0);
const plan = JSON.parse(readFileSync(PLAN, 'utf8'));
const stimme = arg('stimme', plan.stimme.id), modell = plan.modell ?? 'eleven_multilingual_v2';
const TW = globalThis.TW.make(plan.zeit?.zonen ?? [], plan.zeit?.szenen ?? 600);
const zuFilm = (s) => TW.oldToNew(s), zuSzene = (f) => TW.newToOld(f);
const ZEILEN = resolve(dirname(PLAN), 'sprecher/zeilen');
mkdirSync(ZEILEN, { recursive: true }); mkdirSync(dirname(OUT), { recursive: true });
const SR = 48000;
const ff = (...a) => execFileSync('ffmpeg', ['-y', '-v', 'error', ...a], { maxBuffer: 1 << 28 });
const dauer = (f) => +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString();

// 1) Zeilen erzeugen (Cache-Schlüssel: Stimme + Modell + Einstellungen + Text + Nachbarn)
const z = plan.zeilen;
const ergebnis = [];
const NACHLAUF = 0.18; // Ausklang nach dem letzten Zeichen
for (let i = 0; i < z.length; i++) {
  const body = {
    text: z[i].text, model_id: modell, language_code: 'de', seed: 7, voice_settings: plan.einstellungen,
    ...(i > 0 ? { previous_text: z[i - 1].text } : {}), ...(i < z.length - 1 ? { next_text: z[i + 1].text } : {}),
  };
  const h = createHash('sha1').update(stimme + JSON.stringify(body)).digest('hex').slice(0, 10);
  const roh = `${ZEILEN}/${String(i + 1).padStart(2, '0')}-${z[i].id ?? 'z'}-${h}.json`;
  if (!existsSync(roh) || process.argv.includes('--neu')) {
    await anfrage(`/v1/text-to-speech/${stimme}/with-timestamps?output_format=mp3_44100_192`, body, roh, `sprecher ${z[i].id ?? i + 1} ${z[i].text.length} Zeichen`);
  }
  const j = JSON.parse(readFileSync(roh, 'utf8')), al = j.alignment;
  const mp3 = `${dirname(OUT)}/sprecher-${basename(roh, '.json')}.mp3`;
  writeFileSync(mp3, Buffer.from(j.audio_base64, 'base64'));
  // Wörter aus der Zeichen-Ausrichtung
  const worte = []; let cur = null;
  al.characters.forEach((ch, k) => {
    if (/\s/.test(ch)) { cur = null; return; }
    if (!cur) { cur = { w: '', a: al.character_start_times_seconds[k], e: al.character_end_times_seconds[k] }; worte.push(cur); }
    // v5: Satzzeichen tragen bei langsamen Stimmen die Pause danach (bis 1 s) – Wortende nur aus Buchstaben/Ziffern
    cur.w += ch; if (/[\p{L}\p{N}]/u.test(ch)) cur.e = al.character_end_times_seconds[k];
  });
  const a0 = Math.max(0, worte[0].a - 0.03), a1 = worte.at(-1).e + NACHLAUF;     // exakt zuschneiden
  const wav = mp3.replace(/\.mp3$/, '.wav');
  ff('-i', mp3, '-af', `atrim=start=${a0}:end=${a1},asetpts=PTS-STARTPTS,afade=t=in:d=0.02,afade=t=out:st=${Math.max(0, a1 - a0 - 0.08)}:d=0.08`, '-ar', String(SR), '-ac', '1', wav);
  const rel = worte.map((w) => ({ w: w.w, t: w.a - a0, e: w.e - a0 })), d = a1 - a0;
  // Einsatz in Filmzeit (Hauptfilm, ohne Cold Open)
  let tFilm, grenze = Infinity;
  if (z[i].kalt != null) tFilm = z[i].kalt;
  else if (z[i].t != null) { tFilm = z[i].t; if (z[i].bis != null) grenze = z[i].bis; }
  else if (z[i].nach != null) {
    const v = ergebnis.at(-1);
    tFilm = v.tFilm + v.d - NACHLAUF + z[i].nach;
    if (z[i].bis != null) grenze = plan.zeit ? zuFilm(z[i].bis) : z[i].bis;
  }
  else {
    tFilm = z[i].anker ? zuFilm(z[i].anker.szene) - rel[z[i].anker.wort].t : zuFilm(z[i].szene);
    if (z[i].bis != null) grenze = zuFilm(z[i].bis);
  }
  const ende = tFilm + d, passt = ende <= grenze + 0.05;
  console.log(`${String(i + 1).padStart(2)} ${(z[i].id ?? '').padEnd(11)} ${tFilm.toFixed(2)}–${ende.toFixed(2)} s${z[i].kalt != null ? ' (Cold Open)' : ''}${passt ? '' : `  ⚠ ZU LANG (Grenze ${grenze.toFixed(2)})`}  «${z[i].text}»`);
  ergebnis.push({ id: z[i].id ?? `z${i + 1}`, text: z[i].text, kalt: z[i].kalt != null, tFilm, d, wav, rel, roh });
}

// Cache aufräumen: nur die aktuell verwendeten Zeilen bleiben (gehören ins Repo)
const genutzt = new Set(ergebnis.map((e) => e.roh));
for (const f of readdirSync(ZEILEN)) if (!genutzt.has(`${ZEILEN}/${f}`)) rmSync(`${ZEILEN}/${f}`);

// 2) Wortzeiten für den Film (Szenenzeit; Cold-Open-Zeilen in Sekunden ab Filmbeginn)
const zeiten = {};
for (const e of ergebnis) {
  const conv = (f) => +(e.kalt ? f : zuSzene(f)).toFixed(3);
  zeiten[e.id] = { text: e.text, kalt: e.kalt, von: conv(e.tFilm), bis: conv(e.tFilm + e.d),
    worte: e.rel.map((w) => ({ w: w.w, t: conv(e.tFilm + w.t), e: conv(e.tFilm + w.e) })) };
}
writeFileSync(resolve(dirname(PLAN), 'sprecher-zeiten.js'),
  `// erzeugt von ton-sprecher.mjs – nicht von Hand ändern. Szenenzeit (Cold Open: Sekunden ab Filmbeginn).\nwindow.SPRECHER = ${JSON.stringify(zeiten)};\n`);

// 3) Sprecherspur: jede Zeile an ihre Filmzeit (+ Cold Open)
const filmDauer = dauer(TON);
const N = Math.ceil(filmDauer * SR), spur = new Float32Array(N);
for (const e of ergebnis) {
  if (e.kalt && !KALT) continue;
  const t = e.kalt ? e.tFilm : e.tFilm + KALT;
  const raw = execFileSync('ffmpeg', ['-v', 'error', '-i', e.wav, '-f', 'f32le', '-ac', '1', '-ar', String(SR), '-'], { maxBuffer: 1 << 28 });
  const s = new Float32Array(raw.buffer, raw.byteOffset, raw.length / 4), s0 = Math.round(t * SR);
  for (let k = 0; k < s.length && s0 + k < N; k++) spur[s0 + k] += s[k];
}
const tmp = OUT.replace(/\.wav$/, '');
writeFileSync(`${tmp}-stimme.f32`, Buffer.from(spur.buffer));
ff('-f', 'f32le', '-ar', String(SR), '-ac', '1', '-i', `${tmp}-stimme.f32`, `${tmp}-stimme.wav`);

// 4) Mischen: Stimme vorne, Bett (Musik + Effekte) duckt unter der Stimme
const ducken = +arg('ducken', 0.05); // Sidechain-Schwelle (linear); tiefer = stärkeres Ducking
const pegel = +arg('stimmePegel', 15); // ElevenLabs liefert leise (~−30 dB) → Stimme 8–13 dB über dem Bett
const graph = (nach) => [
  `[1:a]highpass=f=90,equalizer=f=220:t=q:w=1.2:g=-2,equalizer=f=3200:t=q:w=1.4:g=2.5,`,
  `acompressor=threshold=-22dB:ratio=3:attack=4:release=90:makeup=3dB,aformat=channel_layouts=stereo,volume=${pegel}dB,asplit=2[st][sk];`,
  `[0:a]volume=-3dB[bett];[bett][sk]sidechaincompress=threshold=${ducken}:ratio=6:attack=20:release=420:knee=4[geduckt];`,
  `[geduckt][st]amix=inputs=2:normalize=0,acompressor=threshold=-14dB:ratio=2:attack=10:release=150,${nach}`,
].join('');
// Lautheit zweistufig: erst messen, dann linear normalisieren
const r = spawnSync('ffmpeg', ['-v', 'info', '-i', TON, '-i', `${tmp}-stimme.wav`, '-filter_complex',
  graph('loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json'), '-f', 'null', '-'], { maxBuffer: 1 << 26 });
const json = r.stderr.toString().match(/\{[^{}]*"input_i"[^{}]*\}/);
const m = json ? JSON.parse(json[0]) : null;
const norm = m ? `loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`
  : 'loudnorm=I=-14:TP=-1.5:LRA=11';
ff('-i', TON, '-i', `${tmp}-stimme.wav`, '-filter_complex', graph(`${norm},aresample=${SR}`), '-ar', String(SR), '-c:a', 'pcm_s24le', OUT);
console.log(`→ ${OUT}  (Stimme: ${plan.stimme.name ?? stimme}, ${modell}${KALT ? `, Cold Open ${KALT} s` : ''})`);
