import { useEffect, useRef } from 'react';
import createGlobe from 'cobe';

// City coordinates [lat, lng] for arc connections
const CITIES = [
    { lat: 40.7128, lng: -74.006 },   // New York
    { lat: 51.5074, lng: -0.1278 },   // London
    { lat: 35.6762, lng: 139.6503 },  // Tokyo
    { lat: 1.3521, lng: 103.8198 },   // Singapore
    { lat: 25.2048, lng: 55.2708 },   // Dubai
    { lat: 48.8566, lng: 2.3522 },    // Paris
    { lat: -33.8688, lng: 151.2093 }, // Sydney
    { lat: 37.7749, lng: -122.4194 }, // San Francisco
    { lat: 55.7558, lng: 37.6173 },   // Moscow
    { lat: 19.076, lng: 72.8777 },    // Mumbai
    { lat: -23.5505, lng: -46.6333 }, // São Paulo
    { lat: 31.2304, lng: 121.4737 },  // Shanghai
    { lat: 13.7563, lng: 100.5018 },  // Bangkok
    { lat: -1.2921, lng: 36.8219 },   // Nairobi
    { lat: 52.52, lng: 13.405 },      // Berlin
];

// Convert lat/lng to cobe marker format
function toMarker(lat, lng) {
    return { location: [lat, lng], size: 0.04 };
}

// Convert lat/lng to 3D unit sphere coords
function latLngToXYZ(lat, lng) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    return {
        x: -Math.sin(phi) * Math.cos(theta),
        y: Math.cos(phi),
        z: Math.sin(phi) * Math.sin(theta),
    };
}

// Generate random arc pairs
function generateArcs(count = 6) {
    const arcs = [];
    for (let i = 0; i < count; i++) {
        const src = CITIES[Math.floor(Math.random() * CITIES.length)];
        let tgt = CITIES[Math.floor(Math.random() * CITIES.length)];
        while (tgt === src) tgt = CITIES[Math.floor(Math.random() * CITIES.length)];
        arcs.push({
            src,
            tgt,
            progress: Math.random(),  // 0..1
            speed: 0.002 + Math.random() * 0.003,
            color: [
                `rgba(96, 165, 250,`,   // blue
                `rgba(167, 139, 250,`,  // purple
                `rgba(52, 211, 153,`,   // emerald
                `rgba(249, 115, 22,`,   // orange
                `rgba(236, 72, 153,`,   // pink
            ][Math.floor(Math.random() * 5)],
        });
    }
    return arcs;
}

const GlobeCanvas = ({ width = 480, height = 480 }) => {
    const canvasRef = useRef(null);
    const overlayRef = useRef(null);
    const phiRef = useRef(0.5);
    const pointerInteracting = useRef(null);
    const pointerDelta = useRef(0);
    const arcsRef = useRef(generateArcs(8));
    const animRef = useRef(null);
    const globeRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // ── COBE GLOBE ──────────────────────────────────────────────────
        const globe = createGlobe(canvas, {
            devicePixelRatio: Math.min(window.devicePixelRatio, 2),
            width: width * 2,
            height: height * 2,
            phi: phiRef.current,
            theta: 0.3,
            dark: 1,
            diffuse: 1.8,
            mapSamples: 24000,
            mapBrightness: 4,
            baseColor: [0.06, 0.04, 0.14],
            markerColor: [0.4, 0.8, 1.0],
            glowColor: [0.22, 0.08, 0.5],
            markers: CITIES.map(c => toMarker(c.lat, c.lng)),
            onRender(state) {
                if (!pointerInteracting.current) {
                    phiRef.current += 0.003;
                }
                state.phi = phiRef.current + pointerDelta.current;
                state.width = width * 2;
                state.height = height * 2;
            },
        });
        globeRef.current = globe;

        // ── OVERLAY CANVAS for arcs ─────────────────────────────────────
        const overlay = overlayRef.current;
        const ctx = overlay.getContext('2d');
        const dpr = Math.min(window.devicePixelRatio, 2);
        overlay.width = width * dpr;
        overlay.height = height * dpr;
        overlay.style.width = width + 'px';
        overlay.style.height = height + 'px';
        ctx.scale(dpr, dpr);

        const cx = width / 2;
        const cy = height / 2;
        const R = Math.min(width, height) * 0.44;

        // Project a 3D point (cobe coordinate system) to 2D canvas
        function project(lat, lng, currentPhi, theta = 0.3) {
            const p = latLngToXYZ(lat, lng);

            // Apply cobe's phi rotation (around Y axis) and theta tilt (around X)
            const cosPhi = Math.cos(currentPhi);
            const sinPhi = Math.sin(currentPhi);
            const rx = p.x * cosPhi - p.z * sinPhi;
            const rz = p.x * sinPhi + p.z * cosPhi;
            const ry = p.y;

            // theta tilt (up/down)
            const cosT = Math.cos(-theta);
            const sinT = Math.sin(-theta);
            const ty = ry * cosT - rz * sinT;
            const tz = ry * sinT + rz * cosT;

            // Perspective
            const fov = 2.5;
            const scale = fov / (fov + tz);

            return {
                x: cx + R * rx * scale,
                y: cy - R * ty * scale,
                visible: tz < 0.1,  // cull back-face
                depth: tz,
            };
        }

        // Draw a curved arc between two projected 2D points
        function drawArc(ctx, p1, p2, color, progress, glowRadius) {
            if (!p1.visible || !p2.visible) return;

            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            if (len < 2) return;

            // Control point perpendicular to mid-point, lifted toward center
            const mx = (p1.x + p2.x) / 2;
            const my = (p1.y + p2.y) / 2;
            const lift = Math.min(len * 0.4, R * 0.35);
            const nx = -(dy / len) * lift;
            const ny = (dx / len) * lift;
            // Lift toward globe center
            const toCx = cx - mx;
            const toCy = cy - my;
            const dot = toCx * nx + toCy * ny;
            const sign = dot >= 0 ? 1 : -1;
            const cpx = mx + sign * nx;
            const cpy = my + sign * ny;

            // Draw the tail (fading previous segment)
            const tailLen = 0.25;
            const t0 = Math.max(0, progress - tailLen);
            const t1 = progress;

            // Sample points along Bezier
            const steps = 32;
            const pts = [];
            for (let i = 0; i <= steps; i++) {
                const t = t0 + (t1 - t0) * (i / steps);
                const mt = 1 - t;
                pts.push({
                    x: mt * mt * p1.x + 2 * mt * t * cpx + t * t * p2.x,
                    y: mt * mt * p1.y + 2 * mt * t * cpy + t * t * p2.y,
                    a: i / steps,  // alpha multiplier along tail
                });
            }

            // Glow pass
            ctx.save();
            ctx.filter = `blur(${glowRadius}px)`;
            ctx.beginPath();
            ctx.moveTo(pts[0].x, pts[0].y);
            for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
            ctx.strokeStyle = color + '0.35)';
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            ctx.stroke();
            ctx.restore();

            // Sharp line with gradient alpha
            for (let i = 1; i < pts.length; i++) {
                const a = pts[i].a;
                ctx.beginPath();
                ctx.moveTo(pts[i - 1].x, pts[i - 1].y);
                ctx.lineTo(pts[i].x, pts[i].y);
                ctx.strokeStyle = color + (a * 0.9).toFixed(2) + ')';
                ctx.lineWidth = 1.5;
                ctx.lineCap = 'round';
                ctx.stroke();
            }

            // Head dot glow
            const head = pts[pts.length - 1];
            const grad = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, 6);
            grad.addColorStop(0, color + '1)');
            grad.addColorStop(1, color + '0)');
            ctx.beginPath();
            ctx.arc(head.x, head.y, 6, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();
        }

        // ── Animation loop ───────────────────────────────────────────────
        function tick() {
            ctx.clearRect(0, 0, width, height);

            const currentPhi = phiRef.current + pointerDelta.current;
            const theta = 0.3;

            // Update and draw arcs
            const arcs = arcsRef.current;
            arcs.forEach(arc => {
                arc.progress += arc.speed;
                if (arc.progress > 1.3) {
                    // reset arc with new random pair
                    const src = CITIES[Math.floor(Math.random() * CITIES.length)];
                    let tgt = CITIES[Math.floor(Math.random() * CITIES.length)];
                    while (tgt === src) tgt = CITIES[Math.floor(Math.random() * CITIES.length)];
                    arc.src = src;
                    arc.tgt = tgt;
                    arc.progress = 0;
                    arc.speed = 0.002 + Math.random() * 0.003;
                    arc.color = [
                        `rgba(96, 165, 250,`,
                        `rgba(167, 139, 250,`,
                        `rgba(52, 211, 153,`,
                        `rgba(249, 115, 22,`,
                        `rgba(236, 72, 153,`,
                    ][Math.floor(Math.random() * 5)];
                }

                const p1 = project(arc.src.lat, arc.src.lng, currentPhi, theta);
                const p2 = project(arc.tgt.lat, arc.tgt.lng, currentPhi, theta);
                drawArc(ctx, p1, p2, arc.color, Math.min(arc.progress, 1), 3);
            });

            // Pulse rings on city markers
            CITIES.slice(0, 8).forEach((city, i) => {
                const p = project(city.lat, city.lng, currentPhi, theta);
                if (!p.visible) return;
                const pulse = (Date.now() * 0.001 + i * 0.7) % 1;
                const r = 4 + pulse * 12;
                const a = (1 - pulse) * 0.35;
                ctx.beginPath();
                ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(96, 200, 255, ${a})`;
                ctx.lineWidth = 1;
                ctx.stroke();
            });

            animRef.current = requestAnimationFrame(tick);
        }

        animRef.current = requestAnimationFrame(tick);

        // ── Pointer events ───────────────────────────────────────────────
        const onDown = (e) => {
            pointerInteracting.current = e.clientX;
            canvas.style.cursor = 'grabbing';
            overlay.style.cursor = 'grabbing';
        };
        const onUp = () => {
            pointerInteracting.current = null;
            canvas.style.cursor = 'grab';
            overlay.style.cursor = 'grab';
        };
        const onMove = (e) => {
            if (pointerInteracting.current !== null) {
                const delta = e.clientX - pointerInteracting.current;
                pointerDelta.current = delta * 0.005;
            }
        };

        overlay.addEventListener('pointerdown', onDown);
        window.addEventListener('pointerup', onUp);
        overlay.addEventListener('pointermove', onMove);

        return () => {
            globe.destroy();
            cancelAnimationFrame(animRef.current);
            overlay.removeEventListener('pointerdown', onDown);
            window.removeEventListener('pointerup', onUp);
            overlay.removeEventListener('pointermove', onMove);
        };
    }, [width, height]);

    return (
        <div style={{ position: 'relative', width, height }}>
            {/* cobe WebGL globe */}
            <canvas
                ref={canvasRef}
                style={{ position: 'absolute', inset: 0, width, height, display: 'block' }}
            />
            {/* Arc overlay canvas */}
            <canvas
                ref={overlayRef}
                style={{ position: 'absolute', inset: 0, width, height, display: 'block', cursor: 'grab' }}
            />
        </div>
    );
};

export default GlobeCanvas;
