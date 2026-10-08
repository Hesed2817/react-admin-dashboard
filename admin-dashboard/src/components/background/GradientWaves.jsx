/*
	Installed from https://reactbits.dev/backgrounds/gradient-waves
*/
import { Renderer, Program, Mesh, Color, Triangle } from "ogl";
import { useEffect, useRef } from "react";

import "./GradientWaves.css";

const GradientWaves = ({
  colorStops = ["#00d8ff", "#7cff67", "#00d8ff"],
  baseSpeed = 0.0125,
  waveLayers = 4,
  amplitude = 0.8,
  swell = 1.0,
  turbulence = 0.3,
  opacity = 1.0,
  brightness = 1.0,
  detail = "medium", // 'low' | 'medium' | 'high'
  grain = false,
  mouseInteraction = true,
}) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const animationIdRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const glRef = useRef(null);
  const meshRef = useRef(null);
  const programRef = useRef(null);
  const rendererRef = useRef(null);
  const timeRef = useRef(0);
  const observerRef = useRef(null);
  const isVisibleRef = useRef(true);


  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    try {
      const renderer = new Renderer({
        canvas,
        alpha: true,
        powerPreference: "high-performance",
      });
      rendererRef.current = renderer;
      const gl = renderer.gl;
      glRef.current = gl;
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      const geometry = new Triangle(gl);

      const vertexShader = `
        attribute vec2 position;
        attribute vec2 uv;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 0.0, 1.0);
        }
      `;

      const fragmentShader = `
        precision highp float;
        varying vec2 vUv;
        uniform vec3 uColorStops[3];
        uniform float uTime;
        uniform float uBaseSpeed;
        uniform float uAmplitude;
        uniform float uSwell;
        uniform float uTurbulence;
        uniform float uOpacity;
        uniform float uBrightness;
        uniform vec2 uMouse;
        uniform float uMouseInfluence;
        uniform int uWaveLayers;
        uniform int uDetail;
        uniform bool uGrain;

        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

        float snoise(vec3 v) {
          const vec2 C = vec2(1.0/6.0, 1.0/3.0);
          const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
          vec3 i  = floor(v + dot(v, C.yyy));
          vec3 x0 = v - i + dot(i, C.xxx);
          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min(g.xyz, l.zxy);
          vec3 i2 = max(g.xyz, l.zxy);
          vec3 x1 = x0 - i1 + C.xxx;
          vec3 x2 = x0 - i2 + C.yyy;
          vec3 x3 = x0 - D.yyy;
          i = mod289(i);
          vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0)) +
            i.y + vec4(0.0, i1.y, i2.y, 1.0)) +
            i.x + vec4(0.0, i1.x, i2.x, 1.0));
          float n_ = 0.142857142857;
          vec3 ns = n_ * D.wyz - D.xzx;
          vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_);
          vec4 x = x_ * ns.x + ns.yyyy;
          vec4 y = y_ * ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);
          vec4 b0 = vec4(x.xy, y.xy);
          vec4 b1 = vec4(x.zw, y.zw);
          vec4 s0 = floor(b0) * 2.0 + 1.0;
          vec4 s1 = floor(b1) * 2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));
          vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
          vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
          vec3 p0 = vec3(a0.xy, h.x);
          vec3 p1 = vec3(a0.zw, h.y);
          vec3 p2 = vec3(a1.xy, h.z);
          vec3 p3 = vec3(a1.zw, h.w);
          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
          p0 *= norm.x;
          p1 *= norm.y;
          p2 *= norm.z;
          p3 *= norm.w;
          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
        }

        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }

        void main() {
          vec2 uv = vUv;
          vec2 centeredUv = uv - 0.5;
          float aspect = 1.0;
          float distFromCenter = length(centeredUv);
          float baseWave = sin(uv.x * 2.0 + uTime * uBaseSpeed) * 0.5 + 0.5;
          float wave1 = snoise(vec3(uv.x * (1.2 + float(uDetail)/10.0), uv.y * 0.8, uTime * uBaseSpeed * 0.8)) * uAmplitude;
          float wave2 = snoise(vec3(uv.x * (0.8 - float(uDetail)/20.0), uv.y * 1.2 + uTime * uBaseSpeed * 0.4, uTime * 0.3)) * (uAmplitude * 0.6);
          float wave = wave1 + wave2;
          wave *= (1.0 + uSwell * (1.0 - distFromCenter));
          float turb = snoise(vec3(uv.x * 0.5, uv.y * 0.5, uTime * 0.1)) * uTurbulence;
          wave += turb * 0.1;
          vec2 mouseOffset = uMouse * 0.0005 * uMouseInfluence;
          float mouseWave = snoise(vec3((uv.x + mouseOffset.x) * 1.5, (uv.y + mouseOffset.y) * 1.5, uTime * 0.05)) * (uAmplitude * 0.3);
          wave += mouseWave;
          float horizon = smoothstep(0.4, 0.0, uv.y + wave * 0.2);
          float colorMix = baseWave * 0.4 + (1.0 - horizon) * 0.6 + wave * 0.1;
          colorMix = clamp(colorMix, 0.0, 1.0);
          vec3 color1 = uColorStops[0];
          vec3 color2 = uColorStops[1];
          vec3 color3 = uColorStops[2];
          vec3 gradient = mix(color1, color2, smoothstep(0.0, 0.5, colorMix));
          gradient = mix(gradient, color3, smoothstep(0.5, 1.0, colorMix));
          float alpha = (1.0 - horizon) * uOpacity * (0.8 + baseWave * 0.2);
          alpha = clamp(alpha, 0.0, 1.0);
          float grainValue = 0.0;
          if (uGrain) {
            grainValue = hash(uv + fract(uTime * 0.01)) * 0.05;
          }
          vec3 finalColor = gradient * uBrightness + vec3(grainValue);
          gl_FragColor = vec4(finalColor, alpha);
        }
      `;

      const uniforms = {
        uTime: { value: 0 },
        uBaseSpeed: { value: baseSpeed },
        uAmplitude: { value: amplitude },
        uSwell: { value: swell },
        uTurbulence: { value: turbulence },
        uOpacity: { value: opacity },
        uBrightness: { value: brightness },
        uMouse: { value: [0, 0] },
        uMouseInfluence: { value: mouseInteraction ? 1.0 : 0.0 },
        uWaveLayers: { value: waveLayers },
        uDetail: {
          value: detail === "low" ? 1 : detail === "medium" ? 2 : 3,
        },
        uGrain: { value: grain },
        uColorStops: {
          value: colorStops.map((c) => new Color(c)),
        },
      };

      const program = new Program(gl, {
        vertex: vertexShader,
        fragment: fragmentShader,
        uniforms,
      });
      programRef.current = program;

      const mesh = new Mesh(gl, { geometry, program });
      meshRef.current = mesh;

      const resize = () => {
        const rect = container.getBoundingClientRect();
        const w = rect.width;
        const h = rect.height;
        renderer.setSize(w, h);
      };

      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(container);

      const handleMouseMove = (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouseRef.current.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      };

      if (mouseInteraction) {
        canvas.addEventListener("mousemove", handleMouseMove);
      }

      isVisibleRef.current = true;
      const io = new IntersectionObserver(
        ([entry]) => {
          isVisibleRef.current = entry.isIntersecting;
        },
        { threshold: 0 }
      );
      io.observe(container);
      observerRef.current = io;

      let lastT = 0;
      const animate = (t) => {
        if (!isVisibleRef.current) {
          animationIdRef.current = requestAnimationFrame(animate);
          return;
        }
        const dt = (t - lastT) / 1000;
        lastT = t;
        timeRef.current += dt;
        if (programRef.current) {
          programRef.current.uniforms.uTime.value = timeRef.current;
          programRef.current.uniforms.uMouse.value[0] = mouseRef.current.x;
          programRef.current.uniforms.uMouse.value[1] = mouseRef.current.y;
        }
        if (rendererRef.current && meshRef.current) {
          rendererRef.current.render({ scene: meshRef.current });
        }
        animationIdRef.current = requestAnimationFrame(animate);
      };
      animationIdRef.current = requestAnimationFrame(animate);

      return () => {
        cancelAnimationFrame(animationIdRef.current);
        ro.disconnect();
        io.disconnect();
        if (mouseInteraction) {
          canvas.removeEventListener("mousemove", handleMouseMove);
        }
        if (programRef.current && typeof programRef.current.remove === "function") {
          programRef.current.remove();
        }
        // Mesh in ogl has no remove; cleanup not required beyond refs dropping
        if (rendererRef.current) {
          rendererRef.current.gl.canvas.width = 0;
          rendererRef.current.gl.canvas.height = 0;
        }
      };
    } catch (err) {
      console.error("GradientWaves: failed to initialize WebGL", err);
      return;
    }
  }, [
    colorStops,
    baseSpeed,
    waveLayers,
    amplitude,
    swell,
    turbulence,
    opacity,
    brightness,
    detail,
    grain,
    mouseInteraction,
  ]);

  return (
    <div className="gradient-waves" ref={containerRef}>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default GradientWaves;
