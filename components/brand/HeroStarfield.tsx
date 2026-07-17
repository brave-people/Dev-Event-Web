import { useEffect, useRef } from 'react';

const DESKTOP_STAR_COUNT = 360;
const DESKTOP_NEBULA_DUST_COUNT = 216;

const vertexShader = `
  attribute float starSize;
  attribute float twinkleSpeed;
  varying vec3 vColor;
  varying float vTwinkle;
  uniform float time;
  uniform float pixelRatio;

  void main() {
    vColor = color;
    vTwinkle = 0.72 + sin(time * twinkleSpeed + position.x * 2.3) * 0.28;

    vec3 animatedPosition = position;
    animatedPosition.y += sin(time * 0.08 + position.x) * 0.018;

    vec4 modelViewPosition = modelViewMatrix * vec4(animatedPosition, 1.0);
    gl_Position = projectionMatrix * modelViewPosition;
    gl_PointSize = starSize * pixelRatio * (5.5 / -modelViewPosition.z);
  }
`;

const fragmentShader = `
  varying vec3 vColor;
  varying float vTwinkle;

  void main() {
    float distanceFromCenter = distance(gl_PointCoord, vec2(0.5));
    float core = 1.0 - smoothstep(0.0, 0.18, distanceFromCenter);
    float halo = 1.0 - smoothstep(0.08, 0.5, distanceFromCenter);
    float alpha = (halo * 0.46 + core * 0.54) * vTwinkle;

    if (alpha < 0.02) discard;
    gl_FragColor = vec4(vColor, alpha);
  }
`;

const nebulaVertexShader = `
  attribute float dustSize;
  attribute float dustOpacity;
  attribute float phase;
  varying vec3 vColor;
  varying float vOpacity;
  uniform float time;
  uniform float pixelRatio;

  void main() {
    vColor = color;

    vec3 animatedPosition = position;
    float flowTime = time * 0.28;
    float curl = sin(position.x * 0.54 + flowTime + phase)
      + cos(position.y * 0.82 - flowTime * 0.72 + phase * 0.7);
    animatedPosition.x += cos(curl + phase + flowTime) * 0.34;
    animatedPosition.y += sin(curl * 0.8 + phase + flowTime * 0.82) * 0.28;
    animatedPosition.z += sin(time * 0.18 + phase) * 0.16;

    float centerDistance = length(vec2(animatedPosition.x * 0.74, animatedPosition.y));
    float breathing = 0.82 + sin(time * 0.46 + phase) * 0.18;
    vOpacity = dustOpacity * breathing
      * mix(0.75, 1.0, smoothstep(0.7, 2.35, centerDistance));

    vec4 modelViewPosition = modelViewMatrix * vec4(animatedPosition, 1.0);
    gl_Position = projectionMatrix * modelViewPosition;
    gl_PointSize = dustSize * pixelRatio * (5.8 / -modelViewPosition.z);
  }
`;

const nebulaFragmentShader = `
  varying vec3 vColor;
  varying float vOpacity;

  void main() {
    float distanceFromCenter = distance(gl_PointCoord, vec2(0.5));
    float haze = 1.0 - smoothstep(0.04, 0.5, distanceFromCenter);
    float softCore = 1.0 - smoothstep(0.0, 0.22, distanceFromCenter);
    float alpha = (haze * 0.72 + softCore * 0.28) * vOpacity;

    if (alpha < 0.004) discard;
    gl_FragColor = vec4(vColor, alpha);
  }
`;

function HeroStarfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const compactViewport = window.matchMedia('(max-width: 600px)');

    if (
      reducedMotion.matches ||
      compactViewport.matches ||
      !('WebGLRenderingContext' in window)
    ) {
      return;
    }

    let disposed = false;
    let disposeScene: () => void = () => undefined;

    const initialize = async () => {
      try {
        const THREE = await import('three');

        if (disposed) return;

        const renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: false,
          canvas,
          powerPreference: 'low-power',
          premultipliedAlpha: false,
        });
        renderer.setClearColor(0x000000, 0);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.35));

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 30);
        camera.position.z = 6;

        const positions = new Float32Array(DESKTOP_STAR_COUNT * 3);
        const colors = new Float32Array(DESKTOP_STAR_COUNT * 3);
        const sizes = new Float32Array(DESKTOP_STAR_COUNT);
        const speeds = new Float32Array(DESKTOP_STAR_COUNT);
        const color = new THREE.Color();

        for (let index = 0; index < DESKTOP_STAR_COUNT; index += 1) {
          const offset = index * 3;
          const tint = Math.random();

          positions[offset] = (Math.random() - 0.5) * 12;
          positions[offset + 1] = (Math.random() - 0.5) * 6.8;
          positions[offset + 2] = (Math.random() - 0.5) * 5;

          if (tint > 0.9) {
            color.setRGB(0.58, 0.72, 1);
          } else if (tint > 0.82) {
            color.setRGB(0.72, 0.62, 1);
          } else {
            const warmth = 0.82 + Math.random() * 0.18;
            color.setRGB(warmth, warmth, Math.min(1, warmth + 0.08));
          }

          colors[offset] = color.r;
          colors[offset + 1] = color.g;
          colors[offset + 2] = color.b;
          sizes[index] = 0.7 + Math.random() * 1.8;
          speeds[index] = 0.7 + Math.random() * 1.2;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute(
          'position',
          new THREE.BufferAttribute(positions, 3)
        );
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('starSize', new THREE.BufferAttribute(sizes, 1));
        geometry.setAttribute(
          'twinkleSpeed',
          new THREE.BufferAttribute(speeds, 1)
        );

        const material = new THREE.ShaderMaterial({
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          fragmentShader,
          transparent: true,
          uniforms: {
            pixelRatio: { value: renderer.getPixelRatio() },
            time: { value: 0 },
          },
          vertexColors: true,
          vertexShader,
        });
        const stars = new THREE.Points(geometry, material);
        scene.add(stars);

        const nebulaPositions = new Float32Array(DESKTOP_NEBULA_DUST_COUNT * 3);
        const nebulaColors = new Float32Array(DESKTOP_NEBULA_DUST_COUNT * 3);
        const nebulaSizes = new Float32Array(DESKTOP_NEBULA_DUST_COUNT);
        const nebulaOpacities = new Float32Array(DESKTOP_NEBULA_DUST_COUNT);
        const nebulaPhases = new Float32Array(DESKTOP_NEBULA_DUST_COUNT);

        for (let index = 0; index < DESKTOP_NEBULA_DUST_COUNT; index += 1) {
          const offset = index * 3;
          const stream = index % 3;
          const x = -3.6 + Math.random() * 7.8;
          const streamOffset =
            stream === 0 ? 1.05 : stream === 1 ? 0.35 : -0.42;
          const tint = Math.random();

          nebulaPositions[offset] = x;
          nebulaPositions[offset + 1] =
            x * 0.18 + streamOffset + (Math.random() - 0.5) * 0.5;
          nebulaPositions[offset + 2] = 0.3 + Math.random() * 1.7;

          if (tint > 0.68) {
            color.setRGB(0.48, 0.38, 1);
          } else if (tint > 0.34) {
            color.setRGB(0.12, 0.5, 1);
          } else {
            color.setRGB(0.08, 0.86, 0.82);
          }

          nebulaColors[offset] = color.r;
          nebulaColors[offset + 1] = color.g;
          nebulaColors[offset + 2] = color.b;
          nebulaSizes[index] = 120 + Math.random() * 140;
          nebulaOpacities[index] = 0.18 + Math.random() * 0.22;
          nebulaPhases[index] = Math.random() * Math.PI * 2;
        }

        const nebulaGeometry = new THREE.BufferGeometry();
        nebulaGeometry.setAttribute(
          'position',
          new THREE.BufferAttribute(nebulaPositions, 3)
        );
        nebulaGeometry.setAttribute(
          'color',
          new THREE.BufferAttribute(nebulaColors, 3)
        );
        nebulaGeometry.setAttribute(
          'dustSize',
          new THREE.BufferAttribute(nebulaSizes, 1)
        );
        nebulaGeometry.setAttribute(
          'dustOpacity',
          new THREE.BufferAttribute(nebulaOpacities, 1)
        );
        nebulaGeometry.setAttribute(
          'phase',
          new THREE.BufferAttribute(nebulaPhases, 1)
        );

        const nebulaMaterial = new THREE.ShaderMaterial({
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          fragmentShader: nebulaFragmentShader,
          transparent: true,
          uniforms: {
            pixelRatio: { value: renderer.getPixelRatio() },
            time: { value: 0 },
          },
          vertexColors: true,
          vertexShader: nebulaVertexShader,
        });
        const nebulaDust = new THREE.Points(nebulaGeometry, nebulaMaterial);
        nebulaDust.renderOrder = -1;
        scene.add(nebulaDust);

        const pointer = new THREE.Vector2(0, 0);
        const pointerTarget = new THREE.Vector2(0, 0);
        const clock = new THREE.Clock();
        const hero = canvas.parentElement;
        let animationFrame = 0;
        let isVisible = true;

        const resize = () => {
          const width = canvas.clientWidth;
          const height = canvas.clientHeight;

          if (!width || !height) return;

          renderer.setSize(width, height, false);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
        };

        const handlePointerMove = (event: PointerEvent) => {
          if (!hero) return;

          const bounds = hero.getBoundingClientRect();
          pointerTarget.set(
            ((event.clientX - bounds.left) / bounds.width - 0.5) * 2,
            -((event.clientY - bounds.top) / bounds.height - 0.5) * 2
          );
        };

        const resetPointer = () => pointerTarget.set(0, 0);

        const render = () => {
          if (
            !isVisible ||
            reducedMotion.matches ||
            compactViewport.matches ||
            document.hidden ||
            disposed
          ) {
            animationFrame = 0;
            return;
          }

          const elapsed = clock.getElapsedTime();
          pointer.lerp(pointerTarget, 0.035);
          camera.position.x = pointer.x * 0.16;
          camera.position.y = pointer.y * 0.1;
          camera.lookAt(0, 0, 0);
          stars.rotation.z = elapsed * 0.0025;
          nebulaDust.position.x =
            Math.sin(elapsed * 0.22) * 0.2 + pointer.x * -0.06;
          nebulaDust.position.y =
            Math.cos(elapsed * 0.18) * 0.14 + pointer.y * -0.04;
          nebulaDust.rotation.z = Math.sin(elapsed * 0.12) * 0.018;
          material.uniforms.time.value = elapsed;
          nebulaMaterial.uniforms.time.value = elapsed;
          renderer.render(scene, camera);
          animationFrame = window.requestAnimationFrame(render);
        };

        const startRendering = () => {
          if (!animationFrame && !disposed) {
            clock.start();
            animationFrame = window.requestAnimationFrame(render);
          }
        };

        const stopRendering = () => {
          if (animationFrame) {
            window.cancelAnimationFrame(animationFrame);
            animationFrame = 0;
          }
          clock.stop();
        };

        const updateRenderingState = () => {
          if (
            isVisible &&
            !reducedMotion.matches &&
            !compactViewport.matches &&
            !document.hidden
          ) {
            resize();
            startRendering();
          } else {
            stopRendering();
          }
        };

        const visibilityObserver = new IntersectionObserver(
          ([entry]) => {
            isVisible = entry.isIntersecting;
            updateRenderingState();
          },
          { threshold: 0.02 }
        );
        visibilityObserver.observe(canvas);

        const resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(canvas);
        hero?.addEventListener('pointermove', handlePointerMove, {
          passive: true,
        });
        hero?.addEventListener('pointerleave', resetPointer);
        compactViewport.addEventListener('change', updateRenderingState);
        reducedMotion.addEventListener('change', updateRenderingState);
        document.addEventListener('visibilitychange', updateRenderingState);

        resize();
        updateRenderingState();

        disposeScene = () => {
          stopRendering();
          visibilityObserver.disconnect();
          resizeObserver.disconnect();
          hero?.removeEventListener('pointermove', handlePointerMove);
          hero?.removeEventListener('pointerleave', resetPointer);
          compactViewport.removeEventListener('change', updateRenderingState);
          reducedMotion.removeEventListener('change', updateRenderingState);
          document.removeEventListener(
            'visibilitychange',
            updateRenderingState
          );
          geometry.dispose();
          material.dispose();
          nebulaGeometry.dispose();
          nebulaMaterial.dispose();
          renderer.dispose();
        };
      } catch {
        // The static hero image remains the complete visual fallback.
      }
    };

    initialize();

    return () => {
      disposed = true;
      disposeScene();
    };
  }, []);

  return <canvas ref={canvasRef} className="hero-starfield" aria-hidden />;
}

export default HeroStarfield;
