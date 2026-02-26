import { useRef, useEffect } from 'react';
import { Renderer, Program, Mesh, Triangle } from 'ogl';

import './LiquidChrome.css';

export const LiquidChrome = ({
    baseColor = [0.1, 0.1, 0.1],
    speed = 0.2,
    amplitude = 0.3,
    frequencyX = 3,
    frequencyY = 3,
    interactive = true,
    ...props
}) => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        const renderer = new Renderer({ antialias: true, alpha: true });
        const gl = renderer.gl;
        // Transparent background
        gl.clearColor(0, 0, 0, 0);

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
      precision mediump float;
      uniform float uTime;
      uniform vec3 uResolution;
      uniform vec3 uBaseColor;
      uniform float uAmplitude;
      uniform float uFrequencyX;
      uniform float uFrequencyY;
      uniform vec2 uMouse;
      varying vec2 vUv;

      void main() {
          vec2 fragCoord = vUv * uResolution.xy;
          vec2 uv = (2.0 * fragCoord - uResolution.xy) / min(uResolution.x, uResolution.y);

          for (float i = 1.0; i < 8.0; i++){
              uv.x += uAmplitude / i * cos(i * uFrequencyX * uv.y + uTime + uMouse.x * 3.14159);
              uv.y += uAmplitude / i * cos(i * uFrequencyY * uv.x + uTime + uMouse.y * 3.14159);
          }

          vec3 color = uBaseColor / abs(sin(uTime - uv.y - uv.x));
          gl_FragColor = vec4(color, 1.0);
      }
    `;

        const geometry = new Triangle(gl);
        const program = new Program(gl, {
            vertex: vertexShader,
            fragment: fragmentShader,
            uniforms: {
                uTime: { value: 0 },
                uResolution: {
                    value: new Float32Array([gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height])
                },
                uBaseColor: { value: new Float32Array(baseColor) },
                uAmplitude: { value: amplitude },
                uFrequencyX: { value: frequencyX },
                uFrequencyY: { value: frequencyY },
                uMouse: { value: new Float32Array([0.5, 0.5]) }
            }
        });
        const mesh = new Mesh(gl, { geometry, program });

        function resize() {
            const scale = 1;
            renderer.setSize(container.offsetWidth * scale, container.offsetHeight * scale);
            const resUniform = program.uniforms.uResolution.value;
            resUniform[0] = gl.canvas.width;
            resUniform[1] = gl.canvas.height;
            resUniform[2] = gl.canvas.width / gl.canvas.height;
        }
        window.addEventListener('resize', resize);
        resize();

        function handleMouseMove(event) {
            const rect = container.getBoundingClientRect();
            const x = (event.clientX - rect.left) / rect.width;
            const y = 1 - (event.clientY - rect.top) / rect.height;
            const mouseUniform = program.uniforms.uMouse.value;
            mouseUniform[0] = x;
            mouseUniform[1] = y;
        }

        function handleTouchMove(event) {
            if (event.touches.length > 0) {
                const touch = event.touches[0];
                const rect = container.getBoundingClientRect();
                const x = (touch.clientX - rect.left) / rect.width;
                const y = 1 - (touch.clientY - rect.top) / rect.height;
                const mouseUniform = program.uniforms.uMouse.value;
                mouseUniform[0] = x;
                mouseUniform[1] = y;
            }
        }

        if (interactive) {
            container.addEventListener('mousemove', handleMouseMove);
            container.addEventListener('touchmove', handleTouchMove);
        }

        let animationId;
        let isVisible = true;

        function update(t) {
            animationId = requestAnimationFrame(update);
            if (!isVisible) return; // skip render when off-screen
            program.uniforms.uTime.value = t * 0.001 * speed;
            renderer.render({ scene: mesh });
        }
        animationId = requestAnimationFrame(update);

        // Pause loop when element leaves viewport
        const observer = new IntersectionObserver(
            ([entry]) => { isVisible = entry.isIntersecting; },
            { threshold: 0 }
        );
        observer.observe(container);

        container.appendChild(gl.canvas);

        return () => {
            cancelAnimationFrame(animationId);
            observer.disconnect();
            window.removeEventListener('resize', resize);
            if (interactive) {
                container.removeEventListener('mousemove', handleMouseMove);
                container.removeEventListener('touchmove', handleTouchMove);
            }
            if (gl.canvas.parentElement) {
                gl.canvas.parentElement.removeChild(gl.canvas);
            }
            gl.getExtension('WEBGL_lose_context')?.loseContext();
        };
    }, [baseColor, speed, amplitude, frequencyX, frequencyY, interactive]);

    return <div ref={containerRef} className="liquidChrome-container" {...props} />;
};

export default LiquidChrome;
