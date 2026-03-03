import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useGameStore from '../../store/gameStore';
import { storage } from '../../firebase';
import { ref, getDownloadURL } from 'firebase/storage';

/* ─────────────────────────────────────────────────────
   SVG Soccer Ball
   ───────────────────────────────────────────────────── */
const SoccerBall = ({ size = 50 }) => (
    <svg width={size} height={size} viewBox="0 0 100 100">
        <defs>
            <radialGradient id="bGrad" cx="38%" cy="32%" r="62%">
                <stop offset="0%" stopColor="#fff" />
                <stop offset="100%" stopColor="#bbb" />
            </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="47" fill="url(#bGrad)" stroke="#444" strokeWidth="2.5" />
        <polygon points="50,12 61,24 56,38 44,38 39,24" fill="#222" stroke="#444" strokeWidth="0.8" />
        <polygon points="23,40 13,54 20,68 35,66 35,48" fill="#222" stroke="#444" strokeWidth="0.8" />
        <polygon points="77,40 87,54 80,68 65,66 65,48" fill="#222" stroke="#444" strokeWidth="0.8" />
        <polygon points="33,78 42,91 58,91 67,78 50,69" fill="#222" stroke="#444" strokeWidth="0.8" />
        <line x1="50" y1="12" x2="50" y2="3" stroke="#999" strokeWidth="0.6" />
        <line x1="61" y1="24" x2="77" y2="40" stroke="#999" strokeWidth="0.6" />
        <line x1="39" y1="24" x2="23" y2="40" stroke="#999" strokeWidth="0.6" />
        <line x1="56" y1="38" x2="65" y2="48" stroke="#999" strokeWidth="0.6" />
        <line x1="44" y1="38" x2="35" y2="48" stroke="#999" strokeWidth="0.6" />
        <line x1="35" y1="66" x2="33" y2="78" stroke="#999" strokeWidth="0.6" />
        <line x1="65" y1="66" x2="67" y2="78" stroke="#999" strokeWidth="0.6" />
    </svg>
);

/* ─────────────────────────────────────────────────────
   Goalkeeper CSS Sprite (Large, Animated)
   ───────────────────────────────────────────────────── */
const Goalkeeper = ({ diveState }) => {
    // diveState: 'idle' | 'dive-left' | 'dive-right' | 'dive-center'
    const isDiving = diveState !== 'idle';
    const isLeft = diveState === 'dive-left';
    const isRight = diveState === 'dive-right';
    const isCenter = diveState === 'dive-center';

    return (
        <div style={{
            position: 'relative', width: 80, height: 130,
            transition: 'transform 0.35s cubic-bezier(.17,.67,.4,1.2)',
            transform: isLeft
                ? 'translateX(-65px) rotate(-25deg)'
                : isRight
                    ? 'translateX(65px) rotate(25deg)'
                    : isCenter
                        ? 'translateY(10px) scaleY(0.85)'
                        : 'none',
            animation: !isDiving ? 'keeperBounce 1.2s ease-in-out infinite' : 'none',
        }}>
            {/* Head */}
            <div style={{
                position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                width: 28, height: 28, borderRadius: '50%',
                background: 'linear-gradient(150deg, #f5c89a 0%, #d4a06a 100%)',
                border: '2px solid #b8845a', zIndex: 5,
            }}>
                <div style={{
                    position: 'absolute', top: -4, left: -2, right: -2, height: 16,
                    borderRadius: '50% 50% 0 0', background: '#2a2a2a',
                }} />
            </div>

            {/* Jersey */}
            <div style={{
                position: 'absolute', top: 26, left: '50%', transform: 'translateX(-50%)',
                width: 48, height: 44, borderRadius: '8px 8px 4px 4px',
                background: 'linear-gradient(180deg, #FFD700 0%, #FFA500 100%)',
                border: '2px solid #cc8500', zIndex: 3,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: 'inset 0 -10px 15px rgba(0,0,0,0.15)',
            }}>
                <span style={{
                    color: '#111', fontWeight: 900, fontSize: 22, fontFamily: 'Montserrat',
                    textShadow: '0 1px 0 rgba(255,255,255,0.3)',
                }}>1</span>
            </div>

            {/* Left Arm */}
            <div style={{
                position: 'absolute', top: 28, left: -8, width: 16, height: 40,
                borderRadius: '8px 8px 10px 10px', zIndex: 2,
                background: 'linear-gradient(180deg, #FFD700 0%, #FFA500 65%, #00AA44 65%)',
                border: '2px solid #cc8500',
                transformOrigin: 'top center',
                transition: 'transform 0.35s cubic-bezier(.17,.67,.4,1.2)',
                transform: isLeft ? 'rotate(-60deg) scaleY(1.2)' : isRight ? 'rotate(20deg)' : isCenter ? 'rotate(-40deg)' : 'rotate(-8deg)',
            }} />

            {/* Right Arm */}
            <div style={{
                position: 'absolute', top: 28, right: -8, width: 16, height: 40,
                borderRadius: '8px 8px 10px 10px', zIndex: 2,
                background: 'linear-gradient(180deg, #FFD700 0%, #FFA500 65%, #00AA44 65%)',
                border: '2px solid #cc8500',
                transformOrigin: 'top center',
                transition: 'transform 0.35s cubic-bezier(.17,.67,.4,1.2)',
                transform: isRight ? 'rotate(60deg) scaleY(1.2)' : isLeft ? 'rotate(-20deg)' : isCenter ? 'rotate(40deg)' : 'rotate(8deg)',
            }} />

            {/* Shorts */}
            <div style={{
                position: 'absolute', top: 68, left: '50%', transform: 'translateX(-50%)',
                width: 46, height: 18, background: '#111',
                borderRadius: '0 0 6px 6px', zIndex: 3,
            }} />

            {/* Left Leg */}
            <div style={{
                position: 'absolute', top: 84, left: 14, width: 14, height: 36,
                borderRadius: '3px 3px 6px 6px', zIndex: 1,
                background: 'linear-gradient(180deg, #FFD700 0%, #FFA500 70%, #222 70%)',
                border: '1px solid #cc8500',
                transition: 'transform 0.35s ease',
                transform: isLeft ? 'rotate(-15deg) translateX(-8px)' : isRight ? 'rotate(5deg)' : 'rotate(-3deg)',
            }} />

            {/* Right Leg */}
            <div style={{
                position: 'absolute', top: 84, right: 14, width: 14, height: 36,
                borderRadius: '3px 3px 6px 6px', zIndex: 1,
                background: 'linear-gradient(180deg, #FFD700 0%, #FFA500 70%, #222 70%)',
                border: '1px solid #cc8500',
                transition: 'transform 0.35s ease',
                transform: isRight ? 'rotate(15deg) translateX(8px)' : isLeft ? 'rotate(-5deg)' : 'rotate(3deg)',
            }} />
        </div>
    );
};

/* ─────────────────────────────────────────────────────
   Crosshair / Aim Cursor
   ───────────────────────────────────────────────────── */
const Crosshair = ({ x, y }) => (
    <svg
        width="44" height="44"
        viewBox="0 0 44 44"
        style={{
            position: 'absolute',
            left: x - 22, top: y - 22,
            pointerEvents: 'none', zIndex: 30,
            filter: 'drop-shadow(0 0 6px rgba(227,24,55,0.7))',
        }}
    >
        <circle cx="22" cy="22" r="16" fill="none" stroke="#E31837" strokeWidth="2.5" />
        <circle cx="22" cy="22" r="4" fill="#E31837" />
        <line x1="22" y1="2" x2="22" y2="10" stroke="#E31837" strokeWidth="2" />
        <line x1="22" y1="34" x2="22" y2="42" stroke="#E31837" strokeWidth="2" />
        <line x1="2" y1="22" x2="10" y2="22" stroke="#E31837" strokeWidth="2" />
        <line x1="34" y1="22" x2="42" y2="22" stroke="#E31837" strokeWidth="2" />
    </svg>
);

/* ─────────────────────────────────────────────────────
   Main Game Component
   ───────────────────────────────────────────────────── */
const Game2D = () => {
    const { recordShot, attempts, maxAttempts, score } = useGameStore();
    const [phase, setPhase] = useState('aiming');   // 'aiming' | 'shooting' | 'result'
    const [shotResult, setShotResult] = useState(null);
    const [aimPos, setAimPos] = useState(null);     // { x, y } relative to goal area
    const [ballAnim, setBallAnim] = useState({ x: 0, y: 0, scale: 1, rotate: 0 });
    const [keeperDive, setKeeperDive] = useState('idle');
    const [netBulge, setNetBulge] = useState(false);
    const [bannerLeft, setBannerLeft] = useState(null);
    const [bannerRight, setBannerRight] = useState(null);

    const goalRef = useRef(null);

    // Load banners from Firebase Storage
    useEffect(() => {
        (async () => {
            try {
                setBannerLeft(await getDownloadURL(ref(storage, 'banner_left.png')));
            } catch { /* default */ }
            try {
                setBannerRight(await getDownloadURL(ref(storage, 'banner_right.png')));
            } catch { /* default */ }
        })();
    }, []);

    // Inject keeper bounce keyframes once
    useEffect(() => {
        const id = 'keeper-bounce-style';
        if (!document.getElementById(id)) {
            const style = document.createElement('style');
            style.id = id;
            style.textContent = `
                @keyframes keeperBounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-6px); }
                }
            `;
            document.head.appendChild(style);
        }
    }, []);

    /* ── Aim handler (mousemove / touchmove inside goal area) ── */
    const handlePointerMove = useCallback((e) => {
        if (phase !== 'aiming' || !goalRef.current) return;
        const rect = goalRef.current.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
        const y = Math.max(0, Math.min(rect.height, clientY - rect.top));
        setAimPos({ x, y });
    }, [phase]);

    /* ── Shoot handler (mouseup / touchend) ─────────────────── */
    const handleShoot = useCallback(() => {
        if (phase !== 'aiming' || !aimPos || !goalRef.current) return;
        setPhase('shooting');

        const rect = goalRef.current.getBoundingClientRect();
        const normX = aimPos.x / rect.width;  // 0..1

        // Keeper random dive
        const keeperZones = ['dive-left', 'dive-center', 'dive-right'];
        const keeperChoice = keeperZones[Math.floor(Math.random() * 3)];
        setKeeperDive(keeperChoice);

        // Ball flies from bottom-center of screen to aim position inside goal
        const targetX = aimPos.x - rect.width / 2;
        const targetY = -(rect.height + 50);
        setBallAnim({ x: targetX, y: targetY, scale: 0.4, rotate: 720 });

        // Determine result
        const shootZone = normX < 0.33 ? 'left' : normX > 0.66 ? 'right' : 'center';
        const keeperZone = keeperChoice.replace('dive-', '');
        const isGoal = shootZone !== keeperZone;

        setTimeout(() => {
            setShotResult(isGoal ? 'goal' : 'save');
            setPhase('result');
            recordShot(isGoal);

            if (isGoal) {
                setNetBulge(true);
                setTimeout(() => setNetBulge(false), 600);
            }

            // Reset for next shot
            setTimeout(() => {
                if (attempts + 1 < maxAttempts) {
                    setPhase('aiming');
                    setShotResult(null);
                    setAimPos(null);
                    setBallAnim({ x: 0, y: 0, scale: 1, rotate: 0 });
                    setKeeperDive('idle');
                }
            }, 2000);
        }, 700);
    }, [phase, aimPos, attempts, maxAttempts, recordShot]);

    const ballStartBottom = 60; // px from bottom of pitch container

    return (
        <div
            style={{
                width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden',
                background: 'linear-gradient(180deg, #145a24 0%, #1d7a34 35%, #25943f 70%, #2da84a 100%)',
                fontFamily: "'Montserrat', sans-serif", cursor: phase === 'aiming' ? 'none' : 'default',
                touchAction: 'none',
            }}
            onMouseMove={handlePointerMove}
            onTouchMove={handlePointerMove}
            onMouseUp={handleShoot}
            onTouchEnd={handleShoot}
        >
            {/* ── Grass Stripes ───────────────────────── */}
            <div style={{
                position: 'absolute', inset: 0, zIndex: 0, opacity: 0.12,
                background: 'repeating-linear-gradient(180deg, transparent, transparent 50px, rgba(0,0,0,0.2) 50px, rgba(0,0,0,0.2) 100px)',
            }} />

            {/* ── HUD ─────────────────────────────────── */}
            <div style={{
                position: 'absolute', top: 10, left: 10, right: 10,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 60,
            }}>
                <div style={{
                    background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)',
                    borderRadius: 30, padding: '8px 22px',
                    border: '2px solid #E31837', boxShadow: '0 4px 20px rgba(227,24,55,0.35)',
                }}>
                    <span style={{ color: '#E31837', fontWeight: 900, fontSize: 20, letterSpacing: 2 }}>
                        GOLES: {score}
                    </span>
                </div>
                <div style={{ display: 'flex', gap: 7 }}>
                    {Array.from({ length: maxAttempts }).map((_, i) => {
                        const used = i < attempts;
                        return (
                            <div key={i} style={{
                                width: 24, height: 24, borderRadius: '50%',
                                border: `2.5px solid ${used ? '#555' : '#0033A0'}`,
                                background: used ? '#444' : '#fff',
                                boxShadow: used ? 'none' : '0 0 10px rgba(0,51,160,0.5)',
                                transition: 'all 0.3s',
                            }} />
                        );
                    })}
                </div>
            </div>

            {/* ── Ad Banners ──────────────────────────── */}
            <div style={{
                position: 'absolute', top: 55, left: '50%', transform: 'translateX(-50%)',
                width: '90%', maxWidth: 720, display: 'flex', justifyContent: 'space-between', zIndex: 10,
            }}>
                {[{ img: bannerLeft, label: 'BANNER BRUT 1' }, { img: bannerRight, label: 'BANNER BRUT 2' }].map((b, i) => (
                    <div key={i} style={{
                        width: '48%', height: 48,
                        background: b.img ? `url(${b.img}) center/cover no-repeat` : 'linear-gradient(135deg, rgba(0,51,160,0.85) 0%, rgba(0,20,80,0.95) 100%)',
                        borderRadius: 8, border: '2px solid rgba(255,255,255,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                        fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 700, letterSpacing: 2,
                    }}>
                        {!b.img && b.label}
                    </div>
                ))}
            </div>

            {/* ───────────────────────────────────────────
                 2.5D PITCH PERSPECTIVE CONTAINER
                 ─────────────────────────────────────────── */}
            <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: '76%',
                perspective: '700px', perspectiveOrigin: '50% 20%',
                display: 'flex', justifyContent: 'center', zIndex: 2,
            }}>
                <div style={{
                    position: 'relative', width: '100%', maxWidth: 820, height: '100%',
                    transformStyle: 'preserve-3d',
                }}>
                    {/* ── Pitch Floor (3D rotated plane) ─── */}
                    <div style={{
                        position: 'absolute', bottom: 0, left: '5%', right: '5%', height: '85%',
                        background: 'linear-gradient(180deg, #1a6e2e 0%, #2d8c47 40%, #35a050 100%)',
                        transform: 'rotateX(25deg)',
                        transformOrigin: 'bottom center',
                        borderTop: '4px solid rgba(255,255,255,0.35)',
                        zIndex: 1,
                    }}>
                        {/* Penalty Area (large box) */}
                        <div style={{
                            position: 'absolute', bottom: 0, left: '15%', right: '15%', height: '60%',
                            border: '3px solid rgba(255,255,255,0.5)',
                            borderBottom: 'none',
                        }} />
                        {/* Goal Area (6-yard box) */}
                        <div style={{
                            position: 'absolute', bottom: 0, left: '30%', right: '30%', height: '28%',
                            border: '3px solid rgba(255,255,255,0.5)',
                            borderBottom: 'none',
                        }} />
                        {/* Penalty Spot */}
                        <div style={{
                            position: 'absolute', bottom: '42%', left: '50%', transform: 'translateX(-50%)',
                            width: 11, height: 11, borderRadius: '50%',
                            background: 'rgba(255,255,255,0.75)',
                            boxShadow: '0 0 8px rgba(255,255,255,0.5)',
                        }} />
                        {/* Penalty Arc */}
                        <div style={{
                            position: 'absolute', bottom: '56%', left: '50%', transform: 'translateX(-50%)',
                            width: 130, height: 55,
                            borderRadius: '0 0 65px 65px',
                            border: '3px solid rgba(255,255,255,0.3)',
                            borderTop: 'none',
                        }} />
                    </div>

                    {/* ── Goal Frame ─────────────────────── */}
                    <div
                        ref={goalRef}
                        style={{
                            position: 'absolute',
                            bottom: '14%', left: '50%', transform: 'translateX(-50%)',
                            width: 300, height: 150,
                            zIndex: 8,
                        }}
                    >
                        {/* Crossbar */}
                        <div style={{
                            position: 'absolute', top: -5, left: -8, right: -8, height: 10,
                            background: 'linear-gradient(180deg, #fff 0%, #e0e0e0 40%, #bbb 100%)',
                            borderRadius: 5, boxShadow: '0 3px 12px rgba(0,0,0,0.5)',
                            zIndex: 12,
                        }} />
                        {/* Left Post */}
                        <div style={{
                            position: 'absolute', top: -5, left: -8, width: 10, height: 'calc(100% + 5px)',
                            background: 'linear-gradient(90deg, #bbb, #fff 45%, #ccc)',
                            borderRadius: '5px 5px 0 0',
                            boxShadow: '-3px 0 10px rgba(0,0,0,0.3)', zIndex: 12,
                        }} />
                        {/* Right Post */}
                        <div style={{
                            position: 'absolute', top: -5, right: -8, width: 10, height: 'calc(100% + 5px)',
                            background: 'linear-gradient(90deg, #ccc, #fff 55%, #bbb)',
                            borderRadius: '5px 5px 0 0',
                            boxShadow: '3px 0 10px rgba(0,0,0,0.3)', zIndex: 12,
                        }} />

                        {/* Net */}
                        <div style={{
                            position: 'absolute', top: 5, left: 2, right: 2, bottom: 0,
                            backgroundColor: 'rgba(0,0,0,0.3)',
                            background: `
                                repeating-linear-gradient(0deg, transparent, transparent 9px, rgba(255,255,255,0.15) 9px, rgba(255,255,255,0.15) 10px),
                                repeating-linear-gradient(90deg, transparent, transparent 9px, rgba(255,255,255,0.15) 9px, rgba(255,255,255,0.15) 10px)
                            `,
                            transition: 'transform 0.15s ease-out',
                            transform: netBulge ? 'scaleX(1.06) scaleY(1.04) translateZ(8px)' : 'none',
                            zIndex: 1,
                        }} />

                        {/* Aim Crosshair */}
                        {phase === 'aiming' && aimPos && (
                            <Crosshair x={aimPos.x} y={aimPos.y} />
                        )}

                        {/* Goalkeeper */}
                        <motion.div
                            style={{
                                position: 'absolute', bottom: 0, left: '50%',
                                marginLeft: -40, zIndex: 14,
                            }}
                        >
                            <Goalkeeper diveState={keeperDive} />
                        </motion.div>
                    </div>

                    {/* ── Ball Shadow ─────────────────────── */}
                    <motion.div
                        animate={{
                            x: ballAnim.x,
                            scale: phase === 'shooting' ? 0.3 : 0.8,
                            opacity: phase === 'shooting' ? 0.3 : 0.6,
                        }}
                        transition={{ duration: 0.65, ease: 'easeOut' }}
                        style={{
                            position: 'absolute', bottom: ballStartBottom - 8,
                            left: '50%', marginLeft: -20,
                            width: 40, height: 12, borderRadius: '50%',
                            background: 'radial-gradient(ellipse, rgba(0,0,0,0.5) 0%, transparent 70%)',
                            zIndex: 5,
                        }}
                    />

                    {/* ── Soccer Ball ─────────────────────── */}
                    <motion.div
                        initial={{ x: 0, y: 0, scale: 1, rotate: 0 }}
                        animate={{
                            x: ballAnim.x,
                            y: ballAnim.y,
                            scale: ballAnim.scale,
                            rotate: ballAnim.rotate,
                        }}
                        transition={{
                            duration: 0.65, ease: 'easeOut',
                            rotate: { duration: 0.65, ease: 'linear' },
                        }}
                        style={{
                            position: 'absolute',
                            bottom: ballStartBottom,
                            left: '50%', marginLeft: -25,
                            zIndex: 25,
                            filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.5))',
                        }}
                    >
                        <SoccerBall size={50} />
                    </motion.div>

                    {/* ── Instruction ─────────────────────── */}
                    {phase === 'aiming' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{
                                position: 'absolute', bottom: 10, left: 0, right: 0,
                                textAlign: 'center', zIndex: 35,
                                color: 'rgba(255,255,255,0.85)', fontSize: 14,
                                letterSpacing: 3, textTransform: 'uppercase', fontWeight: 700,
                                textShadow: '0 2px 8px rgba(0,0,0,0.9)',
                            }}
                        >
                            {aimPos ? '¡Suelta para disparar! 🎯' : 'Apunta dentro de la portería y suelta ⚽'}
                        </motion.div>
                    )}
                </div>
            </div>

            {/* ── RESULT OVERLAY ──────────────────────── */}
            <AnimatePresence>
                {phase === 'result' && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                        style={{
                            position: 'absolute', inset: 0, zIndex: 100,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            pointerEvents: 'none',
                        }}
                    >
                        <div style={{
                            padding: '20px 60px', borderRadius: 24,
                            background: shotResult === 'goal'
                                ? 'linear-gradient(135deg, rgba(227,24,55,0.9), rgba(180,10,40,0.95))'
                                : 'linear-gradient(135deg, rgba(0,0,0,0.85), rgba(30,30,30,0.9))',
                            backdropFilter: 'blur(10px)',
                            border: `3px solid ${shotResult === 'goal' ? '#ff6688' : '#555'}`,
                            boxShadow: shotResult === 'goal'
                                ? '0 0 50px rgba(227,24,55,0.5), 0 0 100px rgba(227,24,55,0.2)'
                                : '0 0 40px rgba(0,0,0,0.6)',
                        }}>
                            <h2 style={{
                                fontSize: 56, fontWeight: 900, fontStyle: 'italic',
                                textTransform: 'uppercase', color: '#fff', margin: 0,
                                textShadow: '0 4px 12px rgba(0,0,0,0.6)', letterSpacing: 4,
                            }}>
                                {shotResult === 'goal' ? '¡GOOOL!' : '¡ATAJADA!'}
                            </h2>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Game2D;
