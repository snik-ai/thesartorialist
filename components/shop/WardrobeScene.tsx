'use client';

// 3D-Kleiderschrank (three.js / react-three-fiber).
// Nussbaum-Schrank, die Türen schwingen beim Laden auf, die Kamera fährt heran.
// Innen hängen freigestellte Stücke an einer Messingstange und pendeln
// (Feder-Dämpfer). Stange ziehen/wischen, Pfeile oder Tastatur; nach ein paar
// Sekunden ohne Eingriff rückt sie von selbst ein Stück weiter.
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

export type Piece = {
  handle: string;
  title: string;
  brand: string;
  price: number;
  hang: 'buegel' | 'klammer';
  w: number;
  h: number;
};

export type Control = {
  /** Ziel-Position der Stange in Stück-Einheiten (wird weich angefahren). */
  target: number;
  /** Aktuelle Position (von der Szene geschrieben). */
  pos: number;
  /** Zeitpunkt der letzten Interaktion (ms). */
  touched: number;
  dragging: boolean;
};

const W = 6.4; // Innenbreite
const H = 4.2; // Innenhöhe
const D = 1.5; // Tiefe
const T = 0.16; // Wandstärke
const RAIL_Y = 1.62;
const HOOK = 0.2;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Prozedurale Holzmaserung (Nussbaum) als Canvas-Textur — keine Bilddatei nötig. */
function wood(seed: number, base: string, dark: string, vertical = true) {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 1024;
  const g = c.getContext('2d')!;
  g.fillStyle = base;
  g.fillRect(0, 0, c.width, c.height);
  let s = seed;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 140; i++) {
    const x0 = rnd() * c.width;
    const amp = 4 + rnd() * 22;
    const freq = 0.002 + rnd() * 0.006;
    const ph = rnd() * 10;
    g.strokeStyle = dark;
    g.globalAlpha = 0.05 + rnd() * 0.18;
    g.lineWidth = 0.6 + rnd() * 2.6;
    g.beginPath();
    for (let y = 0; y <= c.height; y += 8) {
      const x = x0 + Math.sin(y * freq + ph) * amp + Math.sin(y * freq * 3.1 + ph) * amp * 0.25;
      if (y === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.stroke();
  }
  g.globalAlpha = 1;
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  if (!vertical) t.rotation = Math.PI / 2;
  t.anisotropy = 4;
  return t;
}

function useWood() {
  return useMemo(
    () => ({
      outer: new THREE.MeshStandardMaterial({ map: wood(7, '#4a2f1e', '#1e120a'), roughness: 0.55, metalness: 0 }),
      inner: new THREE.MeshStandardMaterial({ map: wood(31, '#3a2416', '#140b05'), roughness: 0.75 }),
      door: new THREE.MeshStandardMaterial({ map: wood(99, '#53341f', '#1d1108'), roughness: 0.45 }),
      brass: new THREE.MeshStandardMaterial({ color: '#c9a063', metalness: 0.85, roughness: 0.28 }),
      hanger: new THREE.MeshStandardMaterial({ map: wood(5, '#b07a45', '#5e3a1c'), roughness: 0.5 }),
      chrome: new THREE.MeshStandardMaterial({ color: '#d8d8d8', metalness: 0.9, roughness: 0.25 }),
    }),
    [],
  );
}

function Door({ side, open, mat }: { side: -1 | 1; open: React.MutableRefObject<number>; mat: ReturnType<typeof useWood> }) {
  const ref = useRef<THREE.Group>(null);
  const dw = W / 2 + T;
  const dh = H + 2 * T;
  useFrame(() => {
    if (ref.current) ref.current.rotation.y = side * open.current * 1.92;
  });
  // Scharnier an der Aussenkante; die Tür liegt von dort zur Mitte hin
  return (
    <group ref={ref} position={[side * dw, 0, D / 2 + 0.05]}>
      <group position={[-side * dw / 2, 0, 0]}>
        <mesh material={mat.door} castShadow receiveShadow>
          <boxGeometry args={[dw - 0.01, dh, 0.08]} />
        </mesh>
        {/* Kassette (erhabenes Feld) vorne und innen */}
        {[0.045, -0.045].map((z) => (
          <group key={z}>
            <mesh material={mat.outer} position={[0, 0.35, z]} castShadow>
              <boxGeometry args={[dw - 0.5, dh * 0.5, 0.02]} />
            </mesh>
            <mesh material={mat.outer} position={[0, -dh * 0.33, z]} castShadow>
              <boxGeometry args={[dw - 0.5, dh * 0.2, 0.02]} />
            </mesh>
          </group>
        ))}
        {/* Messinggriff an der Innenkante */}
        <mesh material={mat.brass} position={[-side * (dw / 2 - 0.2), -0.05, 0.1]}>
          <cylinderGeometry args={[0.018, 0.018, 0.5, 12]} />
        </mesh>
        {[0.2, -0.3].map((y) => (
          <mesh key={y} material={mat.brass} position={[-side * (dw / 2 - 0.2), y, 0.07]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.06, 8]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Carcass({ mat }: { mat: ReturnType<typeof useWood> }) {
  const ow = W + 2 * T;
  return (
    <group>
      {/* Rückwand, Seiten, Boden, Decke */}
      <mesh material={mat.inner} position={[0, 0, -D / 2 - T / 2]} receiveShadow>
        <boxGeometry args={[ow, H + 2 * T, T]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} material={mat.outer} position={[s * (W / 2 + T / 2), 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[T, H + 2 * T, D + T]} />
        </mesh>
      ))}
      <mesh material={mat.outer} position={[0, H / 2 + T / 2, 0]} receiveShadow>
        <boxGeometry args={[ow, T, D + T]} />
      </mesh>
      <mesh material={mat.outer} position={[0, -H / 2 - T / 2, 0]} receiveShadow>
        <boxGeometry args={[ow, T, D + T]} />
      </mesh>
      {/* Kranz oben, Sockel unten */}
      <mesh material={mat.outer} position={[0, H / 2 + T + 0.07, 0.03]} castShadow>
        <boxGeometry args={[ow + 0.24, 0.14, D + T + 0.2]} />
      </mesh>
      <mesh material={mat.outer} position={[0, -H / 2 - T - 0.13, 0]}>
        <boxGeometry args={[ow - 0.1, 0.26, D + T - 0.1]} />
      </mesh>
      {/* Hutablage mit LED-Leiste */}
      <mesh material={mat.inner} position={[0, H / 2 - 0.32, 0]} receiveShadow castShadow>
        <boxGeometry args={[W, 0.05, D]} />
      </mesh>
      <mesh position={[0, H / 2 - 0.35, D / 2 - 0.12]}>
        <boxGeometry args={[W - 0.2, 0.012, 0.03]} />
        <meshBasicMaterial color="#ffe2b0" toneMapped={false} />
      </mesh>
      {/* Messingstange mit Haltern */}
      <mesh material={mat.brass} position={[0, RAIL_Y, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, W, 20]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} material={mat.brass} position={[s * (W / 2 - 0.02), RAIL_Y, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.06, 0.06, 0.04, 20]} />
        </mesh>
      ))}
      {/* Schublade unten */}
      <mesh material={mat.outer} position={[0, -H / 2 + 0.28, D / 2 - 0.05]} castShadow receiveShadow>
        <boxGeometry args={[W - 0.1, 0.5, 0.06]} />
      </mesh>
      <mesh material={mat.brass} position={[0, -H / 2 + 0.28, D / 2 + 0.01]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.016, 0.016, 0.6, 10]} />
      </mesh>
    </group>
  );
}

type ItemState = { a: number; v: number; tw: number; tv: number; hover: number };

function Garment({
  piece,
  index,
  count,
  ctl,
  states,
  railAcc,
  clip,
  mat,
  onPick,
}: {
  piece: Piece;
  index: number;
  count: number;
  ctl: React.MutableRefObject<Control>;
  states: React.MutableRefObject<ItemState[]>;
  railAcc: React.MutableRefObject<number>;
  clip: THREE.Plane[];
  mat: { hanger: THREE.Material; brass: THREE.Material; chrome: THREE.Material };
  onPick: (i: number) => void;
}) {
  const tex = useLoader(THREE.TextureLoader, `/media/schrank/${piece.handle}.webp`);
  const g = useRef<THREE.Group>(null);
  const pants = piece.hang === 'klammer';
  const gw = pants ? 0.78 : 1.3;
  const gh = (gw * piece.h) / piece.w;

  const { material, depth, geometry } = useMemo(() => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    const material = new THREE.MeshStandardMaterial({
      map: tex,
      alphaTest: 0.5,
      roughness: 0.92,
      side: THREE.DoubleSide,
      clippingPlanes: clip,
    });
    const depth = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: tex, alphaTest: 0.5 });
    // Leicht gewölbt, damit das Stück Volumen bekommt
    const geometry = new THREE.PlaneGeometry(gw, gh, 16, 8);
    const p = geometry.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i) / (gw / 2);
      p.setZ(i, -0.12 * x * x + 0.06);
    }
    geometry.computeVertexNormals();
    return { material, depth, geometry };
  }, [tex, clip, gw, gh]);

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 1 / 30);
    const st = states.current[index];
    const c = ctl.current;
    // Position auf der Stange (endlos): Abstand zur Mitte in Stück-Einheiten
    let s = index - c.pos;
    s = ((((s + count / 2) % count) + count) % count) - count / 2;
    const as = Math.abs(s);
    const sg = Math.sign(s);
    const x = sg * (Math.min(as, 1) * 1.45 + Math.max(as - 1, 0) * 0.82);
    const yaw = -sg * Math.min(Math.min(as, 1) * 0.5 + Math.max(as - 1, 0) * 0.16, 1.05);
    const scale = 1 + 0.06 * (1 - Math.min(as, 1));

    // Pendel: Feder-Dämpfer, angestossen von der Beschleunigung der Stange
    st.v += (-26 * st.a - 2.6 * st.v - railAcc.current * 0.11 * (0.6 + 0.4 * Math.cos(index * 1.7))) * dt;
    st.a += st.v * dt;
    st.tv += (-18 * st.tw - 2.2 * st.tv) * dt;
    st.tw += st.tv * dt;
    st.a = clamp(st.a, -0.5, 0.5);

    if (g.current) {
      g.current.position.set(x, RAIL_Y, 0.02 * Math.cos(index * 2.3));
      g.current.rotation.set(0, yaw + st.tw, st.a, 'YXZ');
      g.current.scale.setScalar(scale);
    }
  });

  const push = (dir: number) => {
    const st = states.current[index];
    st.v += dir * 0.9;
    st.tv += 0.6 * dir;
  };

  return (
    <group ref={g}>
      {/* Haken über der Stange */}
      <mesh material={pants ? mat.chrome : mat.brass} position={[0, 0.0, 0]} rotation={[0, Math.PI / 2, Math.PI * 0.15]}>
        <torusGeometry args={[0.05, 0.007, 8, 24, Math.PI * 1.35]} />
      </mesh>
      <mesh material={pants ? mat.chrome : mat.brass} position={[0, -HOOK / 2 - 0.02, 0]}>
        <cylinderGeometry args={[0.007, 0.007, HOOK - 0.04, 8]} />
      </mesh>
      {pants ? (
        <group position={[0, -HOOK, 0]}>
          {/* Klammerbügel: Holzleiste mit zwei Klammern */}
          <mesh material={mat.hanger} castShadow>
            <boxGeometry args={[gw * 1.05, 0.05, 0.05]} />
          </mesh>
          {[-1, 1].map((s) => (
            <mesh key={s} material={mat.chrome} position={[s * gw * 0.36, -0.05, 0.03]}>
              <boxGeometry args={[0.06, 0.09, 0.02]} />
            </mesh>
          ))}
        </group>
      ) : (
        // Holzbügel-Hals, der aus dem Kragen schaut
        <mesh material={mat.hanger} position={[0, -HOOK - 0.02, -0.03]} castShadow>
          <boxGeometry args={[0.16, 0.06, 0.05]} />
        </mesh>
      )}
      <mesh
        geometry={geometry}
        material={material}
        customDepthMaterial={depth}
        position={[0, -HOOK - (pants ? 0.06 : 0.04) - gh / 2, 0]}
        castShadow
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
          push(e.point.x > 0 ? 1 : -1);
        }}
        onPointerOut={() => {
          document.body.style.cursor = '';
        }}
        onClick={(e) => {
          e.stopPropagation();
          onPick(index);
        }}
      />
    </group>
  );
}

function Rig({
  pieces,
  ctl,
  reduced,
  onCenter,
  onPick,
  onOpened,
}: {
  pieces: Piece[];
  ctl: React.MutableRefObject<Control>;
  reduced: boolean;
  onCenter: (i: number) => void;
  onPick: (i: number) => void;
  onOpened: () => void;
}) {
  const mat = useWood();
  const open = useRef(reduced ? 1 : 0);
  const t0 = useRef<number | null>(null);
  const states = useRef<ItemState[]>(pieces.map((_, i) => ({ a: 0, v: reduced ? 0 : (i % 2 ? 1 : -1) * 0.5, tw: 0, tv: 0, hover: 0 })));
  const railAcc = useRef(0);
  const lastVel = useRef(0);
  const center = useRef(-1);
  const opened = useRef(false);
  const { camera, size, gl } = useThree();
  const clip = useMemo(() => [new THREE.Plane(new THREE.Vector3(1, 0, 0), W / 2), new THREE.Plane(new THREE.Vector3(-1, 0, 0), W / 2)], []);
  // Bügel und Haken werden wie die Kleider an den Schrankwänden abgeschnitten
  const hang = useMemo(() => {
    const c = (m: THREE.MeshStandardMaterial) => {
      const k = m.clone();
      k.clippingPlanes = clip;
      return k;
    };
    return { hanger: c(mat.hanger), brass: c(mat.brass), chrome: c(mat.chrome) };
  }, [mat, clip]);

  useEffect(() => {
    gl.localClippingEnabled = true;
  }, [gl]);

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 1 / 30);
    const now = state.clock.elapsedTime;
    if (t0.current === null) t0.current = now;
    // Türen öffnen (nach kurzer Pause), Kamera fährt dabei heran
    const k = reduced ? 1 : clamp((now - t0.current - 0.5) / 2.6, 0, 1);
    open.current = ease(k);
    if (k >= 1 && !opened.current) {
      opened.current = true;
      onOpened();
    }

    const aspect = size.width / size.height;
    const tan = Math.tan(THREE.MathUtils.degToRad(17.5));
    const wide = aspect > 1.25;
    const needW = aspect < 1 ? 3.1 : wide ? 7.4 / 0.64 : 7.9;
    const needH = aspect < 1 ? 5.6 : 5.6;
    const dOpen = Math.max(needW / (2 * tan * aspect), needH / (2 * tan));
    const dClosed = dOpen * 1.22;
    const z = dClosed + (dOpen - dClosed) * open.current;
    // Breite Bildschirme: Schrank sitzt in den rechten zwei Dritteln
    const camX = wide ? -2 * z * tan * aspect * 0.165 : 0;
    camera.position.set(camX, 0.15 + 0.15 * (1 - open.current), z);
    camera.lookAt(camX, 0.05, 0);

    // Stange: weich zum Ziel, Beschleunigung für die Pendel
    const c = ctl.current;
    if (!c.dragging) {
      const idle = performance.now() - c.touched;
      if (!reduced && opened.current && idle > 4200) {
        c.target = Math.round(c.target) + 1;
        c.touched = performance.now() - 600;
      }
      const prev = c.pos;
      c.pos += (c.target - c.pos) * (1 - Math.exp(-dt * 5));
      const vel = (c.pos - prev) / dt;
      railAcc.current = (vel - lastVel.current) / dt;
      lastVel.current = vel;
    } else {
      railAcc.current = 0;
    }
    const n = pieces.length;
    const ci = ((Math.round(c.pos) % n) + n) % n;
    if (ci !== center.current) {
      center.current = ci;
      onCenter(ci);
    }
  });

  return (
    <>
      <color attach="background" args={['#17110d']} />
      <hemisphereLight args={['#ffe8cc', '#1a120c', 0.7]} />
      <spotLight
        position={[0.6, 5.2, 6.5]}
        angle={0.62}
        penumbra={0.8}
        intensity={140}
        decay={2}
        color="#ffe6c4"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
      />
      <pointLight position={[0, H / 2 - 0.45, 0.4]} intensity={9} distance={7} decay={2} color="#ffd29a" />
      <directionalLight position={[-4, 1, 5]} intensity={0.5} color="#cfd8ff" />

      {/* Raum: Wand und Parkett */}
      <mesh position={[0, 0.5, -D / 2 - T - 0.02]} receiveShadow>
        <planeGeometry args={[40, 20]} />
        <meshStandardMaterial color="#231914" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -H / 2 - T - 0.26, 3]} receiveShadow>
        <planeGeometry args={[40, 14]} />
        <meshStandardMaterial map={mat.door.map} color="#6b4a33" roughness={0.6} />
      </mesh>

      <Carcass mat={mat} />
      <Door side={-1} open={open} mat={mat} />
      <Door side={1} open={open} mat={mat} />

      {pieces.map((p, i) => (
        <Garment key={p.handle} piece={p} index={i} count={pieces.length} ctl={ctl} states={states} railAcc={railAcc} clip={clip} mat={hang} onPick={onPick} />
      ))}
    </>
  );
}

export default function WardrobeScene(props: {
  pieces: Piece[];
  ctl: React.MutableRefObject<Control>;
  active: boolean;
  reduced: boolean;
  onCenter: (i: number) => void;
  onPick: (i: number) => void;
  onOpened: () => void;
  onReady: () => void;
}) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      frameloop={props.active ? 'always' : 'never'}
      camera={{ fov: 35, near: 0.1, far: 80, position: [0, 0.4, 14] }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      onCreated={() => props.onReady()}
    >
      <Suspense fallback={null}>
        <Rig {...props} />
      </Suspense>
    </Canvas>
  );
}
