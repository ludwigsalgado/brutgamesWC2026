import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, RotateCcw, Target } from 'lucide-react';

// Game Constants
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const GOAL_WIDTH = 250; // Adjusted for new background
const GOAL_HEIGHT = 125; // Adjusted for new background
const BALL_RADIUS = 16;
const KEEPER_WIDTH = 40;
const KEEPER_HEIGHT = 65;
const TOTAL_SHOTS = 5;
const GOAL_Z = 600;
const HORIZON_Y = 380; // Adjusted to match the goal line in the new image
const WALL_Z = 200; // Position of the wall
const WALL_PLAYER_WIDTH = 35;
const WALL_PLAYER_HEIGHT = 80;
const WALL_GAP = 4; // Tight gap between wall players


// Physics Constants
const GRAVITY = 0.4;

type GameState = 'AIMING' | 'KICKING' | 'RESULT' | 'GAMEOVER';
type ResultType = 'GOAL' | 'SAVED' | 'MISS' | null;

interface Ball {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  rotation: number;
}

interface Keeper {
  x: number;
  y: number;
  width: number;
  height: number;
  targetX: number;
  speed: number;
  diveAngle: number;
  state: 'IDLE' | 'DIVING_LEFT' | 'DIVING_RIGHT';
}

// Preload images
const loadImg = (src: string) => {
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
  defender: loadImg('/sprites/defender.png'),
};

const AdBanner: React.FC<{ imageUrl: string }> = ({ imageUrl }) => (
  <div
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '60px',
      backgroundColor: '#333',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
      zIndex: 40,
    }}
  >
    <img src={imageUrl} alt="Advertisement" style={{ height: '100%', width: 'auto', objectFit: 'contain' }} />
  </div>
);

export default function PenaltyGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Game State
  const [gameState, setGameState] = useState<GameState>('AIMING');
  const [score, setScore] = useState(0);
  const [shotsTaken, setShotsTaken] = useState(0);
  const [result, setResult] = useState<ResultType>(null);
  const [mousePos, setMousePos] = useState({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 });
  const [netShake, setNetShake] = useState(0);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [isGameStarted, setIsGameStarted] = useState(false);

  // Refs for mutable game objects
  const ballRef = useRef<Ball>({ x: CANVAS_WIDTH / 2, y: 560, z: 0, vx: 0, vy: 0, vz: 0, rotation: 0 });
  const keeperRef = useRef<Keeper>({
    x: CANVAS_WIDTH / 2,
    y: HORIZON_Y,
    width: KEEPER_WIDTH,
    height: KEEPER_HEIGHT,
    targetX: CANVAS_WIDTH / 2,
    speed: 0,
    diveAngle: 0,
    state: 'IDLE'
  });

  const resetBall = () => {
    ballRef.current = {
      x: CANVAS_WIDTH / 2,
      y: 560,
      z: 0,
      vx: 0,
      vy: 0,
      vz: 0,
      rotation: 0
    };
  };

  const resetKeeper = () => {
    keeperRef.current = {
      x: CANVAS_WIDTH / 2,
      y: HORIZON_Y,
      width: KEEPER_WIDTH,
      height: KEEPER_HEIGHT,
      targetX: CANVAS_WIDTH / 2,
      speed: 0,
      diveAngle: 0,
      state: 'IDLE'
    };
    setNetShake(0);
  };

  const handleShoot = () => {
    if (!isGameStarted || gameState !== 'AIMING') return;

    const targetX = mousePos.x;
    const targetY = mousePos.y;
    const framesToGoal = 50;

    ballRef.current.vx = (targetX - CANVAS_WIDTH / 2) / framesToGoal;
    const dy = targetY - ballRef.current.y;
    ballRef.current.vy = (dy - 0.5 * GRAVITY * (framesToGoal * framesToGoal)) / framesToGoal;
    ballRef.current.vz = GOAL_Z / framesToGoal;

    const difficulty = 0.8;
    const error = (Math.random() - 0.5) * 200 * (1 - difficulty);
    keeperRef.current.targetX = targetX + error;

    const distToCover = Math.abs(keeperRef.current.targetX - CANVAS_WIDTH / 2);
    keeperRef.current.speed = distToCover / framesToGoal * 1.15;

    if (keeperRef.current.targetX < CANVAS_WIDTH / 2 - 40) {
      keeperRef.current.state = 'DIVING_LEFT';
    } else if (keeperRef.current.targetX > CANVAS_WIDTH / 2 + 40) {
      keeperRef.current.state = 'DIVING_RIGHT';
    } else {
      keeperRef.current.state = 'IDLE';
    }

    setGameState('KICKING');
  };

  const nextShot = () => {
    if (shotsTaken >= TOTAL_SHOTS) {
      setGameState('GAMEOVER');
    } else {
      setGameState('AIMING');
      setResult(null);
      resetBall();
      resetKeeper();
    }
  };

  const restartGame = () => {
    setScore(0);
    setShotsTaken(0);
    setResult(null);
    setGameState('AIMING');
    resetBall();
    resetKeeper();
  };

  useEffect(() => {
    // Simulated fetch from Firebase Storage
    setBannerUrl('/sprites/banner_final.jpg');
  }, []);

  // Main Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      const ball = ballRef.current;
      const keeper = keeperRef.current;

      // --- 1. Background (Stadium Sprite) ---
      if (SPRITES.bg.complete && SPRITES.bg.naturalWidth > 0) {
        ctx.drawImage(SPRITES.bg, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      } else {
        // Fallback
        ctx.fillStyle = '#166534';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      }

      const horizonY = HORIZON_Y;
      const goalTopY = horizonY - GOAL_HEIGHT;
      const goalBottomY = horizonY;
      const goalLeftX = CANVAS_WIDTH / 2 - GOAL_WIDTH / 2;
      const goalRightX = CANVAS_WIDTH / 2 + GOAL_WIDTH / 2;

      // Paint over distracting white field marks from the background sprite
      ctx.fillStyle = '#3d8b37';
      ctx.beginPath();
      ctx.ellipse(CANVAS_WIDTH / 2, 478, 30, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(CANVAS_WIDTH / 2 + 3, 458, 24, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // --- 2. Physics Update ---
      if (gameState === 'KICKING') {

        ball.x += ball.vx;
        ball.y += ball.vy;
        ball.z += ball.vz;
        ball.vy += GRAVITY;
        ball.rotation += 0.2;

        const keeperMaxX = goalRightX - keeper.width / 2;
        const keeperMinX = goalLeftX + keeper.width / 2;

        let moveDir = 0;
        if (Math.abs(keeper.x - keeper.targetX) > keeper.speed) {
          moveDir = keeper.x < keeper.targetX ? 1 : -1;
        }

        keeper.x += moveDir * keeper.speed;
        if (keeper.x > keeperMaxX) keeper.x = keeperMaxX;
        if (keeper.x < keeperMinX) keeper.x = keeperMinX;

        if (keeper.state === 'DIVING_LEFT') {
          keeper.diveAngle = Math.max(-45, keeper.diveAngle - 5);
        } else if (keeper.state === 'DIVING_RIGHT') {
          keeper.diveAngle = Math.min(45, keeper.diveAngle + 5);
        }

        // (Wall collision removed)

        if (ball.z >= GOAL_Z) {
          const isInsideX = ball.x > goalLeftX + BALL_RADIUS && ball.x < goalRightX - BALL_RADIUS;
          const isInsideY = ball.y > goalTopY + BALL_RADIUS && ball.y < goalBottomY;

          const kLeft = keeper.x - keeper.width / 2 - (Math.abs(keeper.diveAngle) > 20 ? 40 : 0);
          const kRight = keeper.x + keeper.width / 2 + (Math.abs(keeper.diveAngle) > 20 ? 40 : 0);
          const kTop = keeper.y - keeper.height;
          const kBottom = keeper.y;

          const hitKeeper = ball.x > kLeft && ball.x < kRight && ball.y > kTop && ball.y < kBottom;

          let newResult: ResultType = 'MISS';
          if (hitKeeper && isInsideX && isInsideY) newResult = 'SAVED';
          else if (isInsideX && isInsideY) newResult = 'GOAL';

          setResult(newResult);
          setGameState('RESULT');
          setShotsTaken(prev => prev + 1);

          if (newResult === 'GOAL') {
            setScore(prev => prev + 1);
            setNetShake(10);
          }
        }
      }

      // --- 3. Draw Keeper Sprite ---
      let kSprite = SPRITES.keeperIdle;
      if (keeper.state === 'DIVING_LEFT') kSprite = SPRITES.keeperDiveL;
      else if (keeper.state === 'DIVING_RIGHT') kSprite = SPRITES.keeperDiveR;

      if (kSprite.complete && kSprite.naturalWidth > 0) {
        ctx.save();
        ctx.translate(keeper.x, keeper.y);
        const bounceY = (keeper.state === 'IDLE') ? Math.sin(Date.now() / 200) * 3 : 0;
        const aspect = kSprite.naturalWidth / kSprite.naturalHeight;
        const drawH = keeper.height;
        const drawW = drawH * aspect;
        ctx.drawImage(kSprite, -drawW / 2, -drawH + bounceY, drawW, drawH);
        ctx.restore();
      }

      // (Wall rendering removed)

      // --- 4. Draw Shooter (behind the ball - lower y so ball is in front) ---
      if (gameState === 'AIMING' || (gameState === 'KICKING' && ball.z < 100)) {
        const shooter = SPRITES.shooter;
        if (shooter.complete && shooter.naturalWidth > 0) {
          const aspect = shooter.naturalWidth / shooter.naturalHeight;
          const drawH = 250;
          const drawW = drawH * aspect;
          // Shooter's feet at y=540, ball at y=560 (in front)
          ctx.drawImage(shooter, CANVAS_WIDTH / 2 - drawW / 2 - 45, 540 - drawH + 60, drawW, drawH);
        }
      }

      // --- 5. Draw Ball ---
      const scale = Math.max(0.3, 1.1 - (ball.z / 800));
      const currentRadius = BALL_RADIUS * scale;
      const startGroundY = 560 + BALL_RADIUS;
      const endGroundY = HORIZON_Y;
      const currentGroundY = startGroundY - (ball.z / GOAL_Z) * (startGroundY - endGroundY);

      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath();
      const heightFromGround = Math.max(0, currentGroundY - ball.y);
      const shadowScale = Math.max(0.4, 1 - heightFromGround / 150);
      ctx.ellipse(ball.x, currentGroundY, currentRadius * 1.2 * shadowScale, currentRadius * 0.4 * shadowScale, 0, 0, Math.PI * 2);
      ctx.fill();

      // Ball Graphics
      ctx.save();
      ctx.translate(ball.x, ball.y);
      ctx.rotate(ball.rotation);
      ctx.scale(scale, scale);

      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(0, 0, BALL_RADIUS, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(0, -BALL_RADIUS + 4);
      ctx.lineTo(5, -5);
      ctx.lineTo(0, 5);
      ctx.lineTo(-5, -5);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(8, 8, 4, 0, Math.PI * 2);
      ctx.arc(-8, 8, 4, 0, Math.PI * 2);
      ctx.arc(0, -10, 4, 0, Math.PI * 2);
      ctx.fill();

      const gradientBall = ctx.createRadialGradient(-5, -5, 2, 0, 0, BALL_RADIUS);
      gradientBall.addColorStop(0, 'rgba(255,255,255,0.8)');
      gradientBall.addColorStop(1, 'rgba(0,0,0,0.1)');
      ctx.fillStyle = gradientBall;
      ctx.fill();
      ctx.restore();

      // --- 6. Aiming Target ---
      if (gameState === 'AIMING') {
        const pulse = 1 + Math.sin(Date.now() / 200) * 0.1;
        ctx.strokeStyle = '#E31837'; // Brut Red
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(mousePos.x, mousePos.y, 25 * pulse, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(mousePos.x, mousePos.y, 15 * pulse, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(mousePos.x - 30, mousePos.y);
        ctx.lineTo(mousePos.x + 30, mousePos.y);
        ctx.moveTo(mousePos.x, mousePos.y - 30);
        ctx.lineTo(mousePos.x, mousePos.y + 30);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.setLineDash([8, 8]);
        ctx.beginPath();
        ctx.moveTo(ball.x, ball.y);
        ctx.lineTo(mousePos.x, mousePos.y);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [gameState, mousePos, netShake]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // We already handle mouse move, this could be for starting a swipe if needed
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    handleShoot();
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const touch = e.touches[0];
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    setMousePos({
      x: (touch.clientX - rect.left) * scaleX,
      y: (touch.clientY - rect.top) * scaleY
    });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const touch = e.touches[0];
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    setMousePos({
      x: (touch.clientX - rect.left) * scaleX,
      y: (touch.clientY - rect.top) * scaleY
    });
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    handleShoot();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameState !== 'AIMING') return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    setMousePos({
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    });
  };

  // Helper to remove green background from sprites
  const processImage = (img: HTMLImageElement): Promise<string> => {
    return new Promise((resolve) => {
      const runProcess = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(img.src);
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // More robust green removal: check if Green is dominant
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          // Aggressively remove any pixel where green dominates
          if (g > 40 && g > r && g > b) {
            data[i + 3] = 0;
          }
        }
        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL());
      };

      if (img.complete && img.naturalWidth > 0) {
        runProcess();
      } else {
        img.onload = runProcess;
        img.onerror = () => resolve(img.src);
      }
    });
  };

  const [processedSprites, setProcessedSprites] = useState<Record<string, string>>({});

  useEffect(() => {
    const load = async () => {
      const paths = ['/sprites/shooter.png', '/sprites/keeper_idle.png', '/sprites/keeper_dive_left.png', '/sprites/keeper_dive_right.png', '/sprites/defender.png'];
      const newProcessed: Record<string, string> = {};

      for (const path of paths) {
        const img = new Image();
        img.src = path;
        img.crossOrigin = "anonymous";
        newProcessed[path] = await processImage(img);
      }
      setProcessedSprites(newProcessed);
    };
    load();
  }, []);

  // Update SPRITES with processed versions
  useEffect(() => {
    if (processedSprites['/sprites/shooter.png']) SPRITES.shooter.src = processedSprites['/sprites/shooter.png'];
    if (processedSprites['/sprites/keeper_idle.png']) SPRITES.keeperIdle.src = processedSprites['/sprites/keeper_idle.png'];
    if (processedSprites['/sprites/keeper_dive_left.png']) SPRITES.keeperDiveL.src = processedSprites['/sprites/keeper_dive_left.png'];
    if (processedSprites['/sprites/keeper_dive_right.png']) SPRITES.keeperDiveR.src = processedSprites['/sprites/keeper_dive_right.png'];
    if (processedSprites['/sprites/defender.png']) SPRITES.defender.src = processedSprites['/sprites/defender.png'];
  }, [processedSprites]);

  // Main UI
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#001D4A] p-4 font-montserrat select-none touch-none overflow-hidden">
      {/* Branding Header */}
      <div className="w-full max-w-[800px] flex justify-between items-center mb-4 text-white">
        <div className="flex items-center gap-2">
          <Trophy className="text-[#FFD700]" size={24} />
          <span className="font-extrabold text-xl tracking-tighter">BRUT <span className="text-[#E31837]">MUNDIAL EXPERIENCE</span></span>
        </div>
        <div className="text-sm font-medium opacity-80 uppercase tracking-widest text-right">
          Brut Mundial<br />Experience
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative shadow-2xl rounded-2xl overflow-hidden border-4 border-[#0033A0]"
        style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
      >


        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="cursor-crosshair"
          onClick={handleShoot}
        />

        {/* HUD Overlay */}
        <div className="absolute top-[70px] left-0 w-full px-6 flex justify-between items-start pointer-events-none">
          <div className="bg-black/60 backdrop-blur-md p-3 rounded-xl border border-white/20">
            <div className="text-[10px] text-white/60 uppercase font-bold tracking-widest mb-1">Goles</div>
            <div className="text-3xl font-black text-[#E31837] leading-none">{score}</div>
          </div>
          <div className="bg-black/60 backdrop-blur-md p-3 rounded-xl border border-white/20 text-right">
            <div className="text-[10px] text-white/60 uppercase font-bold tracking-widest mb-1">Intentos</div>
            <div className="text-xl font-black text-white leading-none">{shotsTaken} / {TOTAL_SHOTS}</div>
          </div>
        </div>

        {/* Result Overlay */}
        <AnimatePresence>
          {gameState === 'RESULT' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px] z-20"
            >
              <div className="bg-white p-10 rounded-[40px] shadow-2xl text-center min-w-[320px] border-8 border-[#0033A0]">
                <h2 className={`text-6xl font-black mb-2 italic uppercase tracking-tighter ${result === 'GOAL' ? 'text-[#E31837]' :
                  result === 'SAVED' ? 'text-[#0033A0]' : 'text-slate-400'
                  }`}>
                  {result === 'GOAL' ? '¡GOL!' : result === 'SAVED' ? '¡ATAJADA!' : '¡FUERA!'}
                </h2>
                <div className="h-2 w-24 bg-slate-100 mx-auto my-6 rounded-full" />
                <button
                  onClick={nextShot}
                  className="w-full py-5 bg-[#E31837] text-white rounded-2xl font-black uppercase text-xl hover:bg-[#c41530] transition-all active:scale-95 shadow-lg"
                >
                  Siguiente
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game Over Overlay */}
        <AnimatePresence>
          {gameState === 'GAMEOVER' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-[#001D4A]/95 backdrop-blur-xl z-30"
            >
              <div className="text-center max-w-lg w-full p-4 px-6">
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {/* Large sponsor image */}
                  {bannerUrl && (
                    <div className="mb-3 rounded-2xl overflow-hidden border-4 border-white/20 shadow-2xl">
                      <img src={bannerUrl} alt="Patrocinador" className="w-full h-auto object-cover" style={{ maxHeight: '250px' }} />
                    </div>
                  )}

                  <h2 className="text-2xl font-black text-white mb-1 uppercase tracking-tighter italic">Finalizado</h2>
                  <p className="text-white/60 mb-2 text-sm font-bold uppercase tracking-widest">
                    Total Goles: <span className="text-[#E31837] text-xl">{score}</span>
                  </p>

                  {/* Bottom row: message + button side by side */}
                  <div className="flex items-stretch gap-3">
                    {score > 0 ? (
                      <div className="flex-1 p-3 bg-green-500/20 border border-green-500/50 rounded-xl text-green-300 font-bold text-xs flex items-center justify-center">
                        ¡Felicidades! Presenta esta pantalla para reclamar tu premio.
                      </div>
                    ) : (
                      <div className="flex-1 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300 font-bold text-xs flex items-center justify-center">
                        Sigue intentando para ganar premios Brut.
                      </div>
                    )}

                    <button
                      onClick={restartGame}
                      className="flex-shrink-0 px-6 py-3 bg-white text-[#0033A0] rounded-xl font-black text-sm uppercase hover:bg-slate-100 transition-all shadow-xl flex items-center justify-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Jugar de nuevo
                    </button>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Aiming Hint / Start Button */}
        {gameState === 'AIMING' && !isGameStarted && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-40">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                setIsGameStarted(true);
              }}
              className="inline-flex items-center gap-3 bg-white text-[#0033A0] px-10 py-5 rounded-full text-lg font-black uppercase tracking-widest shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-b-8 border-slate-300 pointer-events-auto"
            >
              <Target className="w-6 h-6 text-[#E31837]" />
              Apunta y patea
            </motion.button>
          </div>
        )}
      </div>

      <div className="mt-8 text-white/30 text-[10px] max-w-[600px] text-center uppercase tracking-[3px] font-bold">
        <p>Brut Mundial 2026 • Marketing Experience</p>
      </div>
    </div>
  );
}
