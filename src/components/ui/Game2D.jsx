import React, { useEffect, useRef, useCallback } from 'react';
import useGameStore from '../../store/gameStore';

/* ═══════════════════════════════════════════════════════
   Canvas-based Penalty Kick Game
   • Sprite backgrounds + canvas field lines/ball/physics
   • Swipe-to-shoot mechanic
   • Keeper AI with autonomous movement
   • Ball physics: velocity, scale shrink, rotation
   ═══════════════════════════════════════════════════════ */

// Preload images
const loadImg = (src) => {
    const img = new Image();
    img.src = src;
    return img;
};

const SPRITES = {
    bg: loadImg('/sprites/stadium_bg.png'),
    keeperIdle: loadImg('/sprites/keeper_idle.png'),
    keeperDiveL: loadImg('/sprites/keeper_dive_left.png'),
    keeperDiveR: loadImg('/sprites/keeper_dive_right.png'),
    shooter: loadImg('/sprites/shooter.png'),
};

const Game2D = () => {
    const canvasRef = useRef(null);
    const gameRef = useRef(null);
    const storeRef = useRef(useGameStore.getState());

    // Keep store ref updated
    useEffect(() => {
        const unsub = useGameStore.subscribe((s) => { storeRef.current = s; });
        return unsub;
    }, []);

    // ── Game engine object ──────────────────────────
    const createGame = useCallback((canvas) => {
        const ctx = canvas.getContext('2d');
        let w = 0, h = 0;
        let animId = null;
        let isRunning = false;

        // ─── GAME STATE ─────────────────────────────
        let score = 0, lives = 5, keeperSpeed = 2.5;
        let showModal = false, modalTitle = '', modalColor = '', modalTimeout = null;
        let gameOver = false;

        // ─── GOAL geometry (recalculated on resize) ─
        const goal = { x: 0, y: 0, w: 0, h: 0 };

        // ─── KEEPER ─────────────────────────────────
        const keeper = {
            x: 0, w: 60, h: 80,
            dir: 1, frame: 0,
            state: 'idle', // idle | dive-left | dive-right
            diveTimer: 0,
        };

        // ─── BALL ───────────────────────────────────
        const ball = {
            x: 0, y: 0, r: 18,
            scale: 1, rot: 0,
            state: 'idle', // idle | moving | scored | blocked | miss
            vx: 0, vy: 0,
        };

        // ─── INPUT ───────────────────────────────────
        const input = {
            isDragging: false,
            startX: 0, startY: 0,
            curX: 0, curY: 0,
        };

        // ─── RESIZE ──────────────────────────────────
        function resize() {
            const parent = canvas.parentElement;
            w = parent.clientWidth;
            h = parent.clientHeight;
            canvas.width = w;
            canvas.height = h;

            // Goal: centered, upper portion
            goal.w = Math.min(w * 0.55, 380);
            goal.h = h * 0.20;
            goal.x = (w - goal.w) / 2;
            goal.y = h * 0.24;

            keeper.x = w / 2 - keeper.w / 2;
            if (ball.state === 'idle') resetBall();
        }

        function resetBall() {
            ball.state = 'idle';
            ball.scale = 1;
            ball.rot = 0;
            ball.x = w / 2;
            ball.y = h * 0.72;
            ball.vx = 0;
            ball.vy = 0;
        }

        function resetLevel() {
            showModal = false;
            keeper.state = 'idle';
            keeper.diveTimer = 0;
            resetBall();
        }

        function fullReset() {
            score = 0;
            lives = 5;
            keeperSpeed = 2.5;
            gameOver = false;
            resetLevel();
            updateStore();
        }

        function updateStore() {
            // Sync with Zustand (score = goals count)
            // We handle our own lives system internally
        }

        // ─── HANDLE SHOT RESULT ─────────────────────
        function handleResult(type) {
            if (type === 'goal') {
                score += 100;
                keeperSpeed += 0.4;
                modalTitle = '¡GOLAZO!';
                modalColor = '#00E676';
                storeRef.current.recordShot(true);
            } else {
                lives--;
                modalTitle = type === 'blocked' ? '¡ATAJADA!' : '¡FUERA!';
                modalColor = '#FF5252';
                storeRef.current.recordShot(false);
            }

            if (lives <= 0) {
                gameOver = true;
                modalTitle = 'FIN DEL JUEGO';
            }

            showModal = true;

            // Auto-dismiss after delay
            if (modalTimeout) clearTimeout(modalTimeout);
            modalTimeout = setTimeout(() => {
                if (gameOver) {
                    // Transition to result screen
                    storeRef.current.setView('result');
                } else {
                    resetLevel();
                }
            }, gameOver ? 2500 : 1500);
        }

        // ═══════════════════════════════════
        //  DRAWING
        // ═══════════════════════════════════

        function drawBackground() {
            // Stadium sprite fills background
            if (SPRITES.bg.complete) {
                ctx.drawImage(SPRITES.bg, 0, 0, w, h);
            } else {
                // Fallback grass
                const grad = ctx.createRadialGradient(w / 2, h, h * 0.2, w / 2, h * 0.5, h);
                grad.addColorStop(0, '#2E7D32');
                grad.addColorStop(1, '#1B5E20');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, w, h);
            }
        }

        function drawFieldLines() {
            const g = goal;
            const lineW = 3;

            ctx.strokeStyle = 'rgba(255,255,255,0.85)';
            ctx.lineWidth = lineW;

            // Penalty area (big box)
            const boxW = g.w * 1.7;
            const boxH = g.h * 2.2;
            const boxX = (w - boxW) / 2;
            const boxY = g.y + g.h;
            ctx.beginPath();
            ctx.moveTo(boxX, boxY);
            ctx.lineTo(boxX, boxY + boxH);
            ctx.lineTo(boxX + boxW, boxY + boxH);
            ctx.lineTo(boxX + boxW, boxY);
            ctx.stroke();

            // 6-yard box (small box)
            const sBoxW = g.w * 0.8;
            const sBoxH = g.h * 0.7;
            const sBoxX = (w - sBoxW) / 2;
            ctx.beginPath();
            ctx.moveTo(sBoxX, boxY);
            ctx.lineTo(sBoxX, boxY + sBoxH);
            ctx.lineTo(sBoxX + sBoxW, boxY + sBoxH);
            ctx.lineTo(sBoxX + sBoxW, boxY);
            ctx.stroke();

            // Penalty spot
            const spotY = boxY + boxH * 0.55;
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(w / 2, spotY, 5, 0, Math.PI * 2);
            ctx.fill();

            // Penalty arc
            ctx.beginPath();
            ctx.arc(w / 2, spotY, boxW * 0.18, 0.2 * Math.PI, 0.8 * Math.PI);
            ctx.strokeStyle = 'rgba(255,255,255,0.7)';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        function drawGoalFrame() {
            const g = goal;

            // Back net depth effect
            const depth = g.w * 0.12;
            ctx.strokeStyle = 'rgba(255,255,255,0.25)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.rect(g.x + depth / 2, g.y + depth / 3, g.w - depth, g.h - depth / 3);
            ctx.stroke();

            // Net grid
            ctx.strokeStyle = 'rgba(255,255,255,0.12)';
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            for (let i = 0; i <= 12; i++) {
                const yy = g.y + (g.h * i / 12);
                ctx.moveTo(g.x, yy); ctx.lineTo(g.x + g.w, yy);
                const xx = g.x + (g.w * i / 12);
                ctx.moveTo(xx, g.y); ctx.lineTo(xx, g.y + g.h);
            }
            ctx.stroke();

            // Front posts (thick white)
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 7;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(g.x, g.y + g.h);
            ctx.lineTo(g.x, g.y);
            ctx.lineTo(g.x + g.w, g.y);
            ctx.lineTo(g.x + g.w, g.y + g.h);
            ctx.stroke();

            // Goal line
            ctx.strokeStyle = 'rgba(255,255,255,0.8)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(g.x, g.y + g.h);
            ctx.lineTo(g.x + g.w, g.y + g.h);
            ctx.stroke();

            ctx.lineCap = 'butt';
        }

        function drawKeeper() {
            const g = goal;

            // AI movement (side to side)
            if (keeper.state === 'idle') {
                keeper.x += keeperSpeed * keeper.dir;
                if (keeper.x > g.x + g.w - keeper.w - 5) keeper.dir = -1;
                if (keeper.x < g.x + 5) keeper.dir = 1;
                keeper.frame++;
            } else if (keeper.state === 'dive-left') {
                keeper.x -= 6;
                keeper.diveTimer++;
            } else if (keeper.state === 'dive-right') {
                keeper.x += 6;
                keeper.diveTimer++;
            }

            const baseX = keeper.x + keeper.w / 2;
            const baseY = g.y + g.h;

            // Pick sprite
            let sprite = SPRITES.keeperIdle;
            if (keeper.state === 'dive-left') sprite = SPRITES.keeperDiveL;
            else if (keeper.state === 'dive-right') sprite = SPRITES.keeperDiveR;

            // Draw sprite
            if (sprite.complete && sprite.naturalWidth > 0) {
                const aspect = sprite.naturalWidth / sprite.naturalHeight;
                const drawH = keeper.h;
                const drawW = drawH * aspect;

                ctx.save();
                // Idle bounce animation
                const bounceY = keeper.state === 'idle' ? Math.sin(keeper.frame * 0.12) * 3 : 0;
                ctx.drawImage(
                    sprite,
                    baseX - drawW / 2,
                    baseY - drawH + bounceY,
                    drawW, drawH
                );
                ctx.restore();
            } else {
                // Fallback: canvas keeper
                ctx.save();
                // Shadow
                ctx.fillStyle = 'rgba(0,0,0,0.3)';
                ctx.beginPath();
                ctx.ellipse(baseX, baseY, keeper.w / 2, 6, 0, 0, Math.PI * 2);
                ctx.fill();
                // Body
                ctx.fillStyle = '#FF5252';
                ctx.fillRect(keeper.x, baseY - keeper.h, keeper.w, keeper.h * 0.55);
                // Shorts
                ctx.fillStyle = '#222';
                ctx.fillRect(keeper.x, baseY - keeper.h * 0.45, keeper.w, keeper.h * 0.45);
                // Head
                ctx.fillStyle = '#FFCCBC';
                ctx.beginPath();
                ctx.arc(baseX, baseY - keeper.h - 8, 10, 0, Math.PI * 2);
                ctx.fill();
                // Gloves
                const armY = baseY - keeper.h * 0.5 + Math.sin(keeper.frame * 0.2) * 4;
                ctx.fillStyle = '#FF9100';
                ctx.beginPath();
                ctx.arc(keeper.x - 6, armY, 8, 0, Math.PI * 2);
                ctx.arc(keeper.x + keeper.w + 6, armY, 8, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }

        function drawShooter() {
            const sprite = SPRITES.shooter;
            if (sprite.complete && sprite.naturalWidth > 0) {
                const aspect = sprite.naturalWidth / sprite.naturalHeight;
                const drawH = h * 0.28;
                const drawW = drawH * aspect;
                const shooterX = w * 0.25 - drawW / 2;
                const shooterY = h - drawH - h * 0.02;

                // Subtle idle sway
                const sway = ball.state === 'idle' ? Math.sin(Date.now() * 0.002) * 2 : 0;

                ctx.save();
                ctx.translate(shooterX + drawW / 2, shooterY + drawH);
                ctx.rotate(sway * 0.005);
                ctx.drawImage(sprite, -drawW / 2, -drawH, drawW, drawH);
                ctx.restore();
            }
        }

        function drawBall() {
            if (ball.scale <= 0) return;
            const b = ball;

            ctx.save();
            ctx.translate(b.x, b.y);
            ctx.scale(b.scale, b.scale);
            ctx.rotate(b.rot);

            // Shadow (moves away as ball "flies")
            ctx.fillStyle = 'rgba(0,0,0,0.25)';
            ctx.beginPath();
            ctx.ellipse(0, b.r + (1 - b.scale) * 80, b.r, b.r * 0.3, 0, 0, Math.PI * 2);
            ctx.fill();

            // Main ball
            ctx.beginPath();
            ctx.arc(0, 0, b.r, 0, Math.PI * 2);
            const grad = ctx.createRadialGradient(-b.r * 0.3, -b.r * 0.3, 0, 0, 0, b.r);
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(1, '#cccccc');
            ctx.fillStyle = grad;
            ctx.fill();
            ctx.strokeStyle = '#555';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Pentagon pattern
            const pSize = b.r * 0.42;
            ctx.fillStyle = '#222';
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const a = (Math.PI * 2 / 5) * i - Math.PI / 2;
                const px = Math.cos(a) * pSize;
                const py = Math.sin(a) * pSize;
                i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();

            // Smaller off-center pentagons
            for (let j = 0; j < 5; j++) {
                const a = (Math.PI * 2 / 5) * j;
                const cx = Math.cos(a) * b.r * 0.65;
                const cy = Math.sin(a) * b.r * 0.65;
                ctx.beginPath();
                for (let i = 0; i < 5; i++) {
                    const pa = (Math.PI * 2 / 5) * i - Math.PI / 2;
                    const px = cx + Math.cos(pa) * pSize * 0.45;
                    const py = cy + Math.sin(pa) * pSize * 0.45;
                    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
                }
                ctx.closePath();
                ctx.fill();
            }

            ctx.restore();
        }

        function drawInputGuide() {
            if (input.isDragging && ball.state === 'idle') {
                ctx.save();

                // Dashed yellow line from ball to cursor
                ctx.beginPath();
                ctx.moveTo(ball.x, ball.y);
                // Invert direction: ball goes opposite to drag
                const targetX = ball.x - (input.curX - input.startX) * 0.4;
                const targetY = ball.y - (input.curY - input.startY) * 0.4;
                ctx.lineTo(targetX, targetY);

                const grad = ctx.createLinearGradient(ball.x, ball.y, targetX, targetY);
                grad.addColorStop(0, 'rgba(255, 215, 0, 0.9)');
                grad.addColorStop(1, 'rgba(255, 87, 34, 0)');
                ctx.strokeStyle = grad;
                ctx.lineWidth = 5;
                ctx.setLineDash([8, 8]);
                ctx.stroke();

                // Aim dot
                ctx.beginPath();
                ctx.arc(targetX, targetY, 6, 0, Math.PI * 2);
                ctx.fillStyle = '#FFD740';
                ctx.fill();
                ctx.strokeStyle = '#E31837';
                ctx.lineWidth = 2;
                ctx.setLineDash([]);
                ctx.stroke();

                ctx.restore();
            }
        }

        function drawHUD() {
            // Score pill
            ctx.save();
            ctx.fillStyle = 'rgba(0,0,0,0.65)';
            roundRect(ctx, 14, 14, 130, 52, 16);
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.15)';
            ctx.lineWidth = 1;
            roundRect(ctx, 14, 14, 130, 52, 16);
            ctx.stroke();

            ctx.font = '900 20px Montserrat, sans-serif';
            ctx.fillStyle = '#FFD740';
            ctx.fillText(score + ' PTS', 28, 40);

            ctx.font = '700 14px Montserrat, sans-serif';
            ctx.fillStyle = '#ddd';
            ctx.fillText('⚽ x ' + lives, 28, 58);
            ctx.restore();

            // Lives indicator (right side)
            ctx.save();
            for (let i = 0; i < 5; i++) {
                const used = i >= lives;
                ctx.beginPath();
                ctx.arc(w - 28 - i * 26, 36, 9, 0, Math.PI * 2);
                ctx.fillStyle = used ? 'rgba(100,100,100,0.7)' : 'rgba(255,255,255,0.9)';
                ctx.fill();
                ctx.strokeStyle = used ? '#555' : '#fff';
                ctx.lineWidth = 2;
                ctx.stroke();
            }
            ctx.restore();

            // Instruction text
            if (ball.state === 'idle' && !showModal) {
                ctx.save();
                const txt = '↕ ARRASTRA HACIA LA PORTERÍA ↕';
                ctx.font = '700 12px Montserrat, sans-serif';
                ctx.textAlign = 'center';
                const tw = ctx.measureText(txt).width;

                // Background pill
                ctx.fillStyle = 'rgba(0,0,0,0.65)';
                roundRect(ctx, w / 2 - tw / 2 - 16, h - 50, tw + 32, 30, 15);
                ctx.fill();

                ctx.fillStyle = '#fff';
                ctx.fillText(txt, w / 2, h - 30);
                ctx.restore();
            }
        }

        function drawModal() {
            if (!showModal) return;

            // Overlay
            ctx.save();
            ctx.fillStyle = 'rgba(0,0,0,0.55)';
            ctx.fillRect(0, 0, w, h);

            // Modal card
            const mw = Math.min(w * 0.8, 340);
            const mh = 130;
            const mx = (w - mw) / 2;
            const my = (h - mh) / 2;

            ctx.fillStyle = 'rgba(20,20,35,0.95)';
            roundRect(ctx, mx, my, mw, mh, 20);
            ctx.fill();
            ctx.strokeStyle = modalColor;
            ctx.lineWidth = 3;
            roundRect(ctx, mx, my, mw, mh, 20);
            ctx.stroke();

            // Title
            ctx.font = '900 italic 38px Montserrat, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = modalColor;
            ctx.fillText(modalTitle, w / 2, my + 55);

            // Subtitle
            ctx.font = '600 15px Montserrat, sans-serif';
            ctx.fillStyle = '#aaa';
            const sub = gameOver
                ? `Puntaje final: ${score}`
                : `${score} PTS • ⚽ x ${lives}`;
            ctx.fillText(sub, w / 2, my + 85);

            // Dismiss hint
            ctx.font = '500 11px Montserrat, sans-serif';
            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            ctx.fillText(gameOver ? '' : 'Siguiente tiro...', w / 2, my + 110);

            ctx.restore();
        }

        // Helper: rounded rect
        function roundRect(c, x, y, w, h, r) {
            c.beginPath();
            c.moveTo(x + r, y);
            c.lineTo(x + w - r, y);
            c.quadraticCurveTo(x + w, y, x + w, y + r);
            c.lineTo(x + w, y + h - r);
            c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
            c.lineTo(x + r, y + h);
            c.quadraticCurveTo(x, y + h, x, y + h - r);
            c.lineTo(x, y + r);
            c.quadraticCurveTo(x, y, x + r, y);
            c.closePath();
        }

        // ═══════════════════════════════════
        //  PHYSICS & COLLISION
        // ═══════════════════════════════════
        function updatePhysics() {
            if (ball.state !== 'moving') return;

            ball.x += ball.vx;
            ball.y += ball.vy;
            ball.scale -= 0.014;
            ball.vy += 0.4;
            ball.rot += 0.15;

            // When the ball enters the keeper's "zone" (scale 0.25-0.4)
            if (ball.scale < 0.42 && ball.scale > 0.22) {
                // Keeper decides to dive
                if (keeper.state === 'idle') {
                    const ballSide = ball.x < w / 2 ? 'left' : 'right';
                    // Random choice: correct dive or wrong dive
                    const r = Math.random();
                    if (r < 0.45) {
                        keeper.state = 'dive-' + ballSide; // correct
                    } else if (r < 0.7) {
                        keeper.state = 'dive-' + (ballSide === 'left' ? 'right' : 'left'); // wrong
                    }
                    // else: stays center
                }

                // Check collision with keeper
                const kBaseY = goal.y + goal.h;
                const kTopY = kBaseY - keeper.h;
                if (
                    ball.x > keeper.x - 10 &&
                    ball.x < keeper.x + keeper.w + 10 &&
                    ball.y > kTopY &&
                    ball.y < kBaseY + 10
                ) {
                    ball.state = 'blocked';
                    handleResult('blocked');
                }
            }

            // Final determination: goal or miss (ball is "at the goal depth")
            if (ball.scale <= 0.22 && ball.state === 'moving') {
                if (
                    ball.x > goal.x + 8 &&
                    ball.x < goal.x + goal.w - 8 &&
                    ball.y > goal.y &&
                    ball.y < goal.y + goal.h
                ) {
                    ball.state = 'scored';
                    handleResult('goal');
                } else {
                    ball.state = 'miss';
                    handleResult('miss');
                }
            }
        }

        // ═══════════════════════════════════
        //  GAME LOOP
        // ═══════════════════════════════════
        function loop() {
            if (!isRunning) return;

            ctx.clearRect(0, 0, w, h);

            drawBackground();
            drawFieldLines();
            drawGoalFrame();
            drawKeeper();
            drawShooter();
            updatePhysics();
            drawBall();
            drawInputGuide();
            drawHUD();
            drawModal();

            animId = requestAnimationFrame(loop);
        }

        // ═══════════════════════════════════
        //  INPUT HANDLERS
        // ═══════════════════════════════════
        function onStart(x, y) {
            if (ball.state !== 'idle' || showModal) return;
            input.isDragging = true;
            input.startX = input.curX = x;
            input.startY = input.curY = y;
        }
        function onMove(x, y) {
            if (input.isDragging) {
                input.curX = x;
                input.curY = y;
            }
        }
        function onEnd() {
            if (!input.isDragging) return;
            input.isDragging = false;

            const dx = input.curX - input.startX;
            const dy = input.curY - input.startY;
            const vx = dx * 0.18;
            const vy = dy * 0.18;

            // Only shoot if user swiped upward
            if (vy < -6) {
                ball.state = 'moving';
                ball.vx = vx;
                ball.vy = vy;
            }
        }

        // Mouse events
        canvas.onmousedown = (e) => onStart(e.clientX, e.clientY);
        canvas.onmousemove = (e) => onMove(e.clientX, e.clientY);
        canvas.onmouseup = () => onEnd();

        // Touch events
        canvas.ontouchstart = (e) => { e.preventDefault(); onStart(e.touches[0].clientX, e.touches[0].clientY); };
        canvas.ontouchmove = (e) => { e.preventDefault(); onMove(e.touches[0].clientX, e.touches[0].clientY); };
        canvas.ontouchend = (e) => { e.preventDefault(); onEnd(); };

        // Resize listener
        const onResize = () => resize();
        window.addEventListener('resize', onResize);

        // ── Public API ──────────────────────
        return {
            start() {
                isRunning = true;
                resize();
                fullReset();
                loop();
            },
            stop() {
                isRunning = false;
                if (animId) cancelAnimationFrame(animId);
                window.removeEventListener('resize', onResize);
                canvas.onmousedown = null;
                canvas.onmousemove = null;
                canvas.onmouseup = null;
                canvas.ontouchstart = null;
                canvas.ontouchmove = null;
                canvas.ontouchend = null;
            }
        };
    }, []);

    // ── Mount / Unmount ──────────────────────
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const game = createGame(canvas);
        gameRef.current = game;
        game.start();

        return () => {
            game.stop();
            gameRef.current = null;
        };
    }, [createGame]);

    return (
        <div style={{
            width: '100vw', height: '100vh', position: 'relative',
            overflow: 'hidden', touchAction: 'none',
            background: '#1B5E20',
        }}>
            <canvas
                ref={canvasRef}
                style={{ display: 'block', width: '100%', height: '100%' }}
            />
        </div>
    );
};

export default Game2D;
