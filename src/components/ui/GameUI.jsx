import React, { useState, useEffect } from 'react';
import { auth, db } from '../../config/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut, updateProfile } from 'firebase/auth';
import { collection, addDoc, query, orderBy, limit, getDocs, serverTimestamp } from 'firebase/firestore';

export default function GameUI({ gameState, setGameState, score, lives, resetGame }) {
    const [user, setUser] = useState(null);
    const [showAuth, setShowAuth] = useState(false);
    const [isLoginView, setIsLoginView] = useState(true);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [authError, setAuthError] = useState('');

    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [savedRecord, setSavedRecord] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            const q = query(collection(db, 'leaderboard'), orderBy('score', 'desc'), limit(10));
            const querySnapshot = await getDocs(q);
            const data = [];
            querySnapshot.forEach((doc) => {
                data.push({ id: doc.id, ...doc.data() });
            });
            setLeaderboardData(data);
        } catch (error) {
            console.error("Error al obtener la tabla de clasificación", error);
        }
    };

    const handleAuth = async (e) => {
        e.preventDefault();
        setAuthError('');
        try {
            if (isLoginView) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(userCredential.user, { displayName: username });
            }
            setShowAuth(false);
            if (gameState === 'gameover' && !savedRecord) {
                await saveRecord(auth.currentUser);
            }
        } catch (error) {
            setAuthError(error.message);
        }
    };

    const saveRecord = async (currentUser) => {
        if (!currentUser) return;
        try {
            await addDoc(collection(db, 'leaderboard'), {
                uid: currentUser.uid,
                username: currentUser.displayName || email.split('@')[0],
                score,
                date: serverTimestamp()
            });
            setSavedRecord(true);
        } catch (error) {
            console.error("Error guardando el récord:", error);
        }
    };

    const handleSaveClick = () => {
        if (user) {
            saveRecord(user);
        } else {
            setShowAuth(true);
        }
    };

    const handleQuitAuth = () => {
        setShowAuth(false);
    };

    const renderAuthModal = () => (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <div className="glass-panel p-6 max-w-sm w-full relative">
                <button className="absolute top-2 right-4 text-white font-bold" onClick={handleQuitAuth}>X</button>
                <h2 className="title-text text-2xl mb-4">{isLoginView ? 'INICIAR SESIÓN' : 'REGISTRARSE'}</h2>
                {authError && <p className="text-red-500 text-xs mb-2">{authError}</p>}
                <form onSubmit={handleAuth} className="flex flex-col gap-3">
                    {!isLoginView && (
                        <input type="text" placeholder="Nombre de usuario" className="p-2 rounded bg-white/10 text-white outline-none" value={username} onChange={e => setUsername(e.target.value)} required />
                    )}
                    <input type="email" placeholder="Correo" className="p-2 rounded bg-white/10 text-white outline-none" value={email} onChange={e => setEmail(e.target.value)} required />
                    <input type="password" placeholder="Contraseña" className="p-2 rounded bg-white/10 text-white outline-none" value={password} onChange={e => setPassword(e.target.value)} required />
                    <button type="submit" className="btn btn-primary mt-2">{isLoginView ? 'ENTRAR' : 'CREAR CUENTA'}</button>
                </form>
                <p className="text-xs text-gray-400 mt-4 text-center cursor-pointer hover:text-white" onClick={() => setIsLoginView(!isLoginView)}>
                    {isLoginView ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión'}
                </p>
            </div>
        </div>
    );

    const renderLeaderboard = () => (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="glass-panel p-6 max-w-sm w-full relative border-[var(--color-secondary)]">
                <button className="absolute top-2 right-4 text-white font-bold" onClick={() => setShowLeaderboard(false)}>X</button>
                <h2 className="title-text text-2xl mb-4 text-[var(--color-secondary)] text-center shadow-none">RANKING MUNDIAL</h2>
                <div className="flex flex-col gap-2 mb-4">
                    {leaderboardData.length === 0 && <p className="text-gray-400 text-center text-sm">No hay récords aún.</p>}
                    {leaderboardData.map((entry, index) => (
                        <div key={entry.id} className="flex justify-between items-center bg-white/5 p-2 rounded">
                            <span className="font-bold text-gray-200">#{index + 1} {entry.username}</span>
                            <span className="text-[var(--color-accent)] font-black">{entry.score}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    if (showAuth) return renderAuthModal();
    if (showLeaderboard) return renderLeaderboard();

    if (gameState === 'playing' || gameState === 'playing_reset') {
        return (
            <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start pointer-events-none z-40">
                <div className="glass-panel px-4 py-2 flex flex-col items-start border-none !rounded-full bg-black/40 shadow-none">
                    <span className="text-2xl font-black text-[var(--color-accent)]">{score} PTS</span>
                    <span className="text-sm font-bold text-gray-300 tracking-wider">⚽ x {lives}</span>
                </div>
            </div>
        );
    }

    if (gameState === 'menu') {
        return (
            <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="absolute top-4 right-4 flex gap-2 pointer-events-auto">
                    {user ? (
                        <button className="btn btn-secondary !py-1 !px-3 text-xs" onClick={() => signOut(auth)}>SALIR</button>
                    ) : (
                        <button className="btn btn-primary !py-1 !px-3 text-xs" onClick={() => setShowAuth(true)}>LOGIN</button>
                    )}
                    <button className="btn btn-accent !py-1 !px-3 text-xs text-black" onClick={() => { fetchLeaderboard(); setShowLeaderboard(true); }}>RANKING</button>
                </div>

                <div className="glass-panel p-8 max-w-sm w-full text-center flex flex-col items-center pointer-events-auto">
                    <h1 className="title-text text-5xl mb-2">UNITED 26</h1>
                    <p className="text-gray-300 font-bold mb-6 tracking-widest text-sm">POCKET STADIUM 3D</p>

                    {user && <p className="text-xs text-[var(--color-primary)] mb-4">Hola, {user.displayName || user.email}</p>}

                    <button className="btn btn-primary w-full text-lg py-4 mb-3" onClick={resetGame}>JUGAR AHORA</button>
                </div>
            </div>
        );
    }

    if (gameState === 'gameover') {
        return (
            <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="glass-panel p-8 max-w-sm w-full text-center flex flex-col items-center pointer-events-auto border-[var(--color-accent)] shadow-[0_0_50px_rgba(255,215,64,0.15)] bg-[#14141e]/95">
                    <h1 className="title-text text-4xl mb-1 text-red-500" style={{ WebkitTextFillColor: '#FF5252', backgroundImage: 'none' }}>FIN DEL JUEGO</h1>
                    <p className="text-gray-300 text-sm mb-4">Puntaje Final: <span className="text-[var(--color-accent)] font-bold">{score}</span></p>

                    <div className="w-full h-32 bg-black/50 rounded-xl my-4 flex items-center justify-center border border-white/10 relative overflow-hidden">
                        <span className="absolute top-1 right-2 text-[9px] bg-white/20 px-1 rounded text-white/70">SPONSOR</span>
                        <span className="text-xs text-gray-500 tracking-widest">ESPACIO PUBLICITARIO</span>
                    </div>

                    {!savedRecord && (
                        <>
                            <p className="text-[var(--color-primary)] font-bold text-sm mb-2 mt-2">¿QUIERES PREMIOS?</p>
                            <button className="btn btn-accent !mt-2 border-none text-black w-full" onClick={handleSaveClick}>GUARDAR RÉCORD 🏆</button>
                        </>
                    )}
                    {savedRecord && (
                        <p className="text-[var(--color-accent)] font-bold text-sm my-4">¡Récord guardado correctamente!</p>
                    )}

                    <button className="btn btn-secondary !mt-3 text-xs !py-3 w-full" onClick={resetGame}>VOLVER AL MENÚ / JUGAR OTRA VEZ</button>
                    <button className="text-[var(--color-accent)] text-xs mt-4 underline" onClick={() => { fetchLeaderboard(); setShowLeaderboard(true); }}>VER RANKING MUNDIAL</button>
                </div>
            </div>
        );
    }

    return null;
}
