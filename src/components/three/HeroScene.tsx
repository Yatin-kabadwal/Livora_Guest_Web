'use client';
/**
 * Real-time WebGL hero: a low-poly misty Sal forest valley.
 * - instanced trees over procedural terrain, layered fog planes, GPU fireflies
 * - Day / Dusk / Night palettes that ease smoothly
 * - camera parallax (pointer / device tilt) and scroll-driven flight through the valley
 * Loaded with next/dynamic (ssr:false) from HeroSection.
 */
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useLayoutEffect, useMemo, useRef, type MutableRefObject } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export type TimeMode = 'day' | 'dusk' | 'night';
export type Quality = 'high' | 'low';

interface Pal {
  skyTop: string; skyHor: string; fog: string; fogD: number;
  sun: string; sunPos: [number, number]; sunSize: number; sunOp: number;
  amb: string; ambI: number; dir: string; dirI: number;
  ff: number; ffColor: string; water: string; fogPlane: string; fogPlaneOp: number; tree: string;
}
const PAL: Record<TimeMode, Pal> = {
  day: { skyTop: '#3f7fa6', skyHor: '#d8e7d2', fog: '#bcd3c3', fogD: 0.0105, sun: '#fff2c2', sunPos: [26, 46], sunSize: 120, sunOp: 1, amb: '#d3ecdc', ambI: 1.05, dir: '#fff0cc', dirI: 1.9, ff: 0.18, ffColor: '#fff3c8', water: '#9fd0d0', fogPlane: '#eaf3e4', fogPlaneOp: 0.55, tree: '#ffffff' },
  dusk: { skyTop: '#3a2a58', skyHor: '#f0894a', fog: '#8c5d58', fogD: 0.0125, sun: '#ffb163', sunPos: [-14, 30], sunSize: 170, sunOp: 1, amb: '#b39aa0', ambI: 0.85, dir: '#ff9a55', dirI: 1.6, ff: 0.6, ffColor: '#ffd48a', water: '#e59a6e', fogPlane: '#e8a37f', fogPlaneOp: 0.5, tree: '#d9b6a2' },
  night: { skyTop: '#02070d', skyHor: '#0d2a2c', fog: '#0a1f1c', fogD: 0.0135, sun: '#dfe9ff', sunPos: [-30, 42], sunSize: 62, sunOp: 0.95, amb: '#3f6580', ambI: 0.5, dir: '#8fb0e6', dirI: 0.7, ff: 1, ffColor: '#d8ff9a', water: '#173a45', fogPlane: '#254e48', fogPlaneOp: 0.42, tree: '#7d9a96' },
};

interface Env {
  skyTop: THREE.Color; skyHor: THREE.Color; fog: THREE.Color; sun: THREE.Color; amb: THREE.Color; dir: THREE.Color;
  ffColor: THREE.Color; water: THREE.Color; fogPlane: THREE.Color; tree: THREE.Color;
  portrait: number; fogD: number; sunX: number; sunY: number; sunSize: number; sunOp: number; ambI: number; dirI: number; ff: number; fogPlaneOp: number;
}
const makeEnv = (): Env => {
  const p = PAL.dusk;
  const c = (h: string) => new THREE.Color(h);
  return { skyTop: c(p.skyTop), skyHor: c(p.skyHor), fog: c(p.fog), sun: c(p.sun), amb: c(p.amb), dir: c(p.dir), ffColor: c(p.ffColor), water: c(p.water), fogPlane: c(p.fogPlane), tree: c(p.tree),
    portrait: 0, fogD: p.fogD, sunX: p.sunPos[0], sunY: p.sunPos[1], sunSize: p.sunSize, sunOp: p.sunOp, ambI: p.ambI, dirI: p.dirI, ff: p.ff, fogPlaneOp: p.fogPlaneOp };
};

/* ---------- procedural terrain ---------- */
const hash = (x: number, y: number) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
const vnoise = (x: number, y: number) => {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
};
const fbm = (x: number, y: number) => vnoise(x, y) * 0.6 + vnoise(x * 2.1, y * 2.1) * 0.28 + vnoise(x * 4.3, y * 4.3) * 0.12;
const sstep = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
export const terrainH = (x: number, z: number) => {
  const ax = Math.abs(x);
  const wall = Math.pow(ax / 46, 1.7) * 30;
  const far = sstep(-60, -125, z) * 36;
  const n = (fbm(x * 0.045 + 3, z * 0.045) - 0.5) * 16 * sstep(0, 20, ax);
  return -4 + wall + far + n;
};
const rng = (seed: number) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

function Terrain({ quality }: { quality: Quality }) {
  const geo = useMemo(() => {
    const segX = quality === 'high' ? 110 : 64, segZ = quality === 'high' ? 130 : 76;
    const g = new THREE.PlaneGeometry(190, 210, segX, segZ);
    g.rotateX(-Math.PI / 2);
    g.translate(0, 0, -45);
    const pos = g.attributes.position as THREE.BufferAttribute;
    const col = new Float32Array(pos.count * 3);
    const lo = new THREE.Color('#163526'), mid = new THREE.Color('#25573b'), hi = new THREE.Color('#4a6b55'), tmp = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i);
      const h = terrainH(x, z);
      pos.setY(i, h);
      const t = Math.min(1, Math.max(0, (h + 4) / 30));
      tmp.copy(lo).lerp(mid, Math.min(1, t * 2.2)).lerp(hi, Math.max(0, t - 0.45) * 1.8);
      const v = 0.82 + hash(x * 0.9, z * 0.9) * 0.3;
      col[i * 3] = tmp.r * v; col[i * 3 + 1] = tmp.g * v; col[i * 3 + 2] = tmp.b * v;
    }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    g.computeVertexNormals();
    return g;
  }, [quality]);
  return (
    <mesh geometry={geo} receiveShadow={false}>
      <meshStandardMaterial vertexColors flatShading roughness={1} metalness={0} />
    </mesh>
  );
}

function Trees({ env, quality }: { env: Env; quality: Quality }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const count = quality === 'high' ? 1500 : 520;
  const geo = useMemo(() => {
    const trunk = new THREE.CylinderGeometry(0.18, 0.28, 1.2, 5); trunk.translate(0, 0.6, 0);
    const c1 = new THREE.ConeGeometry(2.0, 3.0, 6); c1.translate(0, 2.4, 0);
    const c2 = new THREE.ConeGeometry(1.6, 2.6, 6); c2.translate(0, 3.9, 0);
    const c3 = new THREE.ConeGeometry(1.1, 2.2, 6); c3.translate(0, 5.2, 0);
    return mergeGeometries([trunk, c1, c2, c3]) as THREE.BufferGeometry;
  }, []);
  useLayoutEffect(() => {
    const mesh = ref.current; if (!mesh) return;
    const r = rng(42), m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), s = new THREE.Vector3(), p = new THREE.Vector3(), c = new THREE.Color();
    let i = 0, guard = 0;
    while (i < count && guard++ < count * 12) {
      const side = r() < 0.5 ? -1 : 1;
      const z = -132 + r() * 168;
      const x = side * ((quality === 'low' ? 9 : 5.5) + (z > 0 ? 8 : 0) + Math.pow(r(), 1.5) * 66);
      const y = terrainH(x, z);
      if (y > 27) continue;
      const sc = 0.85 + r() * 1.5 + (i % 9 === 0 ? 0.9 : 0);
      e.set((r() - 0.5) * 0.12, r() * 6.28, (r() - 0.5) * 0.12); q.setFromEuler(e);
      s.set(sc * (0.9 + r() * 0.3), sc, sc * (0.9 + r() * 0.3)); p.set(x, y - 0.2, z);
      m.compose(p, q, s); mesh.setMatrixAt(i, m);
      c.setHSL(0.36 + r() * 0.06, 0.42 + r() * 0.2, 0.2 + r() * 0.15); mesh.setColorAt(i, c);
      i++;
    }
    mesh.count = i; mesh.instanceMatrix.needsUpdate = true; if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [count, quality]);
  useFrame(() => { matRef.current?.color.copy(env.tree); });
  return (
    <instancedMesh ref={ref} args={[geo, undefined, count]} frustumCulled={false}>
      <meshStandardMaterial ref={matRef} flatShading roughness={0.95} />
    </instancedMesh>
  );
}

function Sky({ env }: { env: Env }) {
  const group = useRef<THREE.Group>(null);
  const skyMat = useRef<THREE.ShaderMaterial>(null);
  const sunMat = useRef<THREE.ShaderMaterial>(null);
  const sunMesh = useRef<THREE.Mesh>(null);
  const { camera } = useThree();
  const skyU = useMemo(() => ({ uTop: { value: new THREE.Color() }, uHor: { value: new THREE.Color() } }), []);
  const sunU = useMemo(() => ({ uColor: { value: new THREE.Color() }, uOp: { value: 1 } }), []);
  useFrame(() => {
    group.current?.position.copy(camera.position);
    skyU.uTop.value.copy(env.skyTop); skyU.uHor.value.copy(env.skyHor);
    sunU.uColor.value.copy(env.sun); sunU.uOp.value = env.sunOp;
    if (sunMesh.current) { sunMesh.current.position.set(env.sunX * 2.4 * (env.portrait ? 0.45 : 1), env.sunY * 2.4 - env.portrait * 40, -330); sunMesh.current.scale.setScalar(env.sunSize); }
  });
  return (
    <group ref={group}>
      <mesh renderOrder={-10} frustumCulled={false}>
        <sphereGeometry args={[520, 24, 14]} />
        <shaderMaterial ref={skyMat} side={THREE.BackSide} depthWrite={false} fog={false} uniforms={skyU}
          vertexShader={`varying float vY; void main(){ vY = normalize(position).y; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`}
          fragmentShader={`uniform vec3 uTop; uniform vec3 uHor; varying float vY; void main(){ float t = smoothstep(-0.02,0.55,vY); gl_FragColor = vec4(mix(uHor,uTop,pow(t,1.7)),1.);
#include <colorspace_fragment>
 }`} />
      </mesh>
      <mesh ref={sunMesh} renderOrder={-9} frustumCulled={false}>
        <planeGeometry args={[1, 1]} />
        <shaderMaterial ref={sunMat} transparent depthWrite={false} fog={false} blending={THREE.AdditiveBlending} uniforms={sunU}
          vertexShader={`varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`}
          fragmentShader={`uniform vec3 uColor; uniform float uOp; varying vec2 vUv; void main(){ float d = length(vUv-.5)*2.; float core = 1.-smoothstep(.12,.16,d); float glow = pow(max(0.,1.-d),2.6)*.75; float k = core*2.4 + glow*3.2; gl_FragColor = vec4(uColor*k, min(1.,k)*uOp);
#include <colorspace_fragment>
 }`} />
      </mesh>
    </group>
  );
}

function softTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d')!;
  const grd = g.createRadialGradient(64, 64, 4, 64, 64, 62);
  grd.addColorStop(0, 'rgba(255,255,255,.9)'); grd.addColorStop(0.5, 'rgba(255,255,255,.35)'); grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd; g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

function FogPlanes({ env, quality }: { env: Env; quality: Quality }) {
  const n = quality === 'high' ? 11 : 6;
  const tex = useMemo(softTexture, []);
  const items = useMemo(() => { const r = rng(7); return Array.from({ length: n }, (_, i) => ({ x: (r() - 0.5) * 34, y: -1.5 + r() * 7, z: 34 - (i / n) * 150 - r() * 6, w: 46 + r() * 34, h: 9 + r() * 8, sp: 0.06 + r() * 0.1, ph: r() * 6.28, op: 0.55 + r() * 0.45 })); }, [n]);
  const refs = useRef<Array<THREE.Mesh | null>>([]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    items.forEach((it, i) => {
      const m = refs.current[i]; if (!m) return;
      m.position.x = it.x + Math.sin(t * it.sp + it.ph) * 9;
      const mat = m.material as THREE.MeshBasicMaterial;
      mat.color.copy(env.fogPlane); mat.opacity = env.fogPlaneOp * it.op * 0.55;
    });
  });
  return (
    <group>
      {items.map((it, i) => (
        <mesh key={i} ref={(el) => { refs.current[i] = el; }} position={[it.x, it.y, it.z]} scale={[it.w, it.h, 1]} renderOrder={5}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial map={tex} transparent depthWrite={false} fog={false} opacity={0.2} />
        </mesh>
      ))}
    </group>
  );
}

function Fireflies({ env, quality }: { env: Env; quality: Quality }) {
  const count = quality === 'high' ? 320 : 110;
  const { geo, uniforms } = useMemo(() => {
    const r = rng(99); const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3), seed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (r() - 0.5) * 2 * (6 + r() * 26); pos[i * 3 + 1] = -2 + r() * 11; pos[i * 3 + 2] = -110 + r() * 150; seed[i] = r();
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    return { geo: g, uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color() }, uIntensity: { value: 1 }, uSize: { value: quality === 'high' ? 70 : 60 } } };
  }, [count, quality]);
  useFrame(({ clock }) => { uniforms.uTime.value = clock.elapsedTime; uniforms.uColor.value.copy(env.ffColor); uniforms.uIntensity.value = env.ff; });
  return (
    <points geometry={geo} frustumCulled={false} renderOrder={6}>
      <shaderMaterial transparent depthWrite={false} blending={THREE.AdditiveBlending} uniforms={uniforms}
        vertexShader={`attribute float aSeed; uniform float uTime; uniform float uSize; varying float vA;
          void main(){ vec3 p = position; p.x += sin(uTime*.35+aSeed*20.)*1.8; p.y += sin(uTime*.55+aSeed*13.)*.9; p.z += cos(uTime*.3+aSeed*7.)*1.8;
            vec4 mv = modelViewMatrix*vec4(p,1.); gl_Position = projectionMatrix*mv; gl_PointSize = clamp(uSize*(1./-mv.z)*(.6+aSeed*.9), 1.5, 14.);
            vA = .35+.65*sin(uTime*(.8+aSeed*1.6)+aSeed*40.)*sin(uTime*(.8+aSeed*1.6)+aSeed*40.); }`}
        fragmentShader={`uniform vec3 uColor; uniform float uIntensity; varying float vA;
          void main(){ float d = length(gl_PointCoord-.5); float a = smoothstep(.5,.0,d); gl_FragColor = vec4(uColor, a*a*vA*uIntensity);
#include <colorspace_fragment>
 }`} />
    </points>
  );
}

function River({ env }: { env: Env }) {
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(() => { mat.current?.color.copy(env.water); });
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.7, -40]}>
      <planeGeometry args={[7, 200]} />
      <meshBasicMaterial ref={mat} transparent opacity={0.75} />
    </mesh>
  );
}

interface RigProps { mode: TimeMode; env: Env; progressRef: MutableRefObject<number>; pointerRef: MutableRefObject<{ x: number; y: number }>; }
function Rig({ mode, env, progressRef, pointerRef }: RigProps) {
  const { camera, scene } = useThree();
  const amb = useRef<THREE.AmbientLight>(null);
  const dir = useRef<THREE.DirectionalLight>(null);
  const smooth = useRef({ p: 0, x: 0, y: 0 });
  const look = useMemo(() => new THREE.Vector3(), []);
  const tmp = useMemo(() => new THREE.Color(), []);
  useEffect(() => { scene.fog = new THREE.FogExp2(env.fog.getHex(), env.fogD); return () => { scene.fog = null; }; }, [scene, env]);
  useFrame(({ clock, size }, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    const aspect = size.width / size.height;
    const cam = camera as THREE.PerspectiveCamera;
    const fov = aspect < 0.8 ? 80 : aspect < 1.2 ? 68 : 58;
    if (cam.fov !== fov) { cam.fov = fov; cam.updateProjectionMatrix(); }
    env.portrait = aspect < 0.8 ? 1 : 0;
    const P = PAL[mode]; const k = 1 - Math.exp(-dt * 2.2);
    const lerpC = (c: THREE.Color, hex: string) => c.lerp(tmp.set(hex), k);
    lerpC(env.skyTop, P.skyTop); lerpC(env.skyHor, P.skyHor); lerpC(env.fog, P.fog); lerpC(env.sun, P.sun); lerpC(env.amb, P.amb); lerpC(env.dir, P.dir);
    lerpC(env.ffColor, P.ffColor); lerpC(env.water, P.water); lerpC(env.fogPlane, P.fogPlane); lerpC(env.tree, P.tree);
    const L = (a: number, b: number) => a + (b - a) * k;
    env.fogD = L(env.fogD, P.fogD); env.sunX = L(env.sunX, P.sunPos[0]); env.sunY = L(env.sunY, P.sunPos[1]); env.sunSize = L(env.sunSize, P.sunSize); env.sunOp = L(env.sunOp, P.sunOp);
    env.ambI = L(env.ambI, P.ambI); env.dirI = L(env.dirI, P.dirI); env.ff = L(env.ff, P.ff); env.fogPlaneOp = L(env.fogPlaneOp, P.fogPlaneOp);
    const fog = scene.fog as THREE.FogExp2 | null;
    if (fog) { fog.color.copy(env.fog); fog.density = env.fogD; }
    if (amb.current) { amb.current.color.copy(env.amb); amb.current.intensity = env.ambI; }
    if (dir.current) { dir.current.color.copy(env.dir); dir.current.intensity = env.dirI; dir.current.position.set(env.sunX * 0.6, Math.max(12, env.sunY * 0.5), -60); }

    const s = smooth.current;
    s.p += (progressRef.current - s.p) * (1 - Math.exp(-dt * 3.2));
    s.x += (pointerRef.current.x - s.x) * (1 - Math.exp(-dt * 2.6));
    s.y += (pointerRef.current.y - s.y) * (1 - Math.exp(-dt * 2.6));
    const t = clock.elapsedTime;
    const z = 46 - s.p * 112;
    camera.position.set(s.x * 3.6 + Math.sin(s.p * 4.2) * 3.2 + Math.sin(t * 0.25) * 0.4, 5.2 - s.p * 0.6 + Math.sin(s.p * Math.PI) * 1.4 + s.y * 1.1 + Math.sin(t * 0.4) * 0.15, z);
    look.set(s.x * 6 + Math.sin(s.p * 4.2 + 0.6) * 2, 5.4 + s.y * 2.2 + s.p * 1.5 + env.portrait * 6, z - 55);
    camera.lookAt(look);
  });
  return (
    <>
      <ambientLight ref={amb} />
      <directionalLight ref={dir} />
    </>
  );
}

export interface HeroSceneProps {
  mode: TimeMode; quality: Quality; visible: boolean;
  progressRef: MutableRefObject<number>; pointerRef: MutableRefObject<{ x: number; y: number }>;
  onReady?: () => void;
}

export default function HeroScene({ mode, quality, visible, progressRef, pointerRef, onReady }: HeroSceneProps) {
  const env = useMemo(makeEnv, []);
  return (
    <Canvas
      dpr={[1, quality === 'low' ? 1.25 : 1.75]}
      frameloop={visible ? 'always' : 'demand'}
      camera={{ position: [0, 5.2, 46], fov: 58, near: 0.5, far: 1000 }}
      gl={{ antialias: quality === 'high', powerPreference: 'high-performance', alpha: false, stencil: false }}
      onCreated={({ gl }) => { gl.setClearColor('#07110c'); onReady?.(); }}
      aria-hidden="true"
    >
      <Rig mode={mode} env={env} progressRef={progressRef} pointerRef={pointerRef} />
      <Sky env={env} />
      <Terrain quality={quality} />
      <River env={env} />
      <Trees env={env} quality={quality} />
      <FogPlanes env={env} quality={quality} />
      <Fireflies env={env} quality={quality} />
    </Canvas>
  );
}
