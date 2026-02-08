
import React, { useState } from 'react';
import { User, Lock, ArrowRight } from 'lucide-react';

interface AuthPageProps {
    onLogin: (username: string) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
    const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'change'>('login');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState(''); // Used for Login, Register (as new), Change (as old)
    const [newPassword, setNewPassword] = useState(''); // Used for Change, Forgot
    const [securityQuestion, setSecurityQuestion] = useState('您的第一所國小是？'); // Default or custom
    const [securityAnswer, setSecurityAnswer] = useState('');
    const [retrievedQuestion, setRetrievedQuestion] = useState<string | null>(null); // For Forgot Password
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const QUESTIONS = [
        '您的第一所國小是？',
        '您母親的娘家在哪裡？',
        '您最喜歡的食物是？',
        '您的第一隻寵物名字是？',
        '您最喜歡的歌手是？'
    ];

    const resetState = (newMode: 'login' | 'register' | 'forgot' | 'change') => {
        setMode(newMode);
        setPassword('');
        setNewPassword('');
        setSecurityAnswer('');
        setError('');
        setSuccessMsg('');
        setRetrievedQuestion(null);
        // Keep username for convenience if switching modes
    };

    const handleForgotCheckUser = () => {
        const users = JSON.parse(localStorage.getItem('voyage_users') || '{}');
        const user = users[username];
        if (!user) {
            setError('找不到此帳號');
            return;
        }
        if (typeof user === 'string' || !user.question) {
            setError('此帳號未設定安全問題，無法重設密碼');
            return;
        }
        setRetrievedQuestion(user.question);
        setError('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');

        const users = JSON.parse(localStorage.getItem('voyage_users') || '{}');

        // Check Lockout (Only for Login)
        if (mode === 'login') {
            const attemptsStr = localStorage.getItem('login_attempts');
            const attempts = attemptsStr ? JSON.parse(attemptsStr) : { count: 0, lockUntil: 0 };
            if (attempts.lockUntil > Date.now()) {
                const waitMinutes = Math.ceil((attempts.lockUntil - Date.now()) / 60000);
                setError(`嘗試次數過多，請於 ${waitMinutes} 分鐘後再試。`);
                return;
            }
        }

        if (mode === 'login') {
            if (!username || !password) { setError('請輸入帳號和密碼'); return; }

            const userData = users[username];
            // Backward compatibility: userData might be string (old) or object (new)
            const storedPass = typeof userData === 'string' ? userData : userData?.password;

            if (storedPass && storedPass === password) {
                localStorage.removeItem('login_attempts');
                // Migrate old user to new format if needed? Maybe later.
                onLogin(username);
            } else {
                // Fail logic
                const attemptsStr = localStorage.getItem('login_attempts');
                const attempts = attemptsStr ? JSON.parse(attemptsStr) : { count: 0, lockUntil: 0 };
                const newCount = (attempts.count || 0) + 1;
                if (newCount >= 5) {
                    const lockTime = Date.now() + 5 * 60 * 1000;
                    localStorage.setItem('login_attempts', JSON.stringify({ count: newCount, lockUntil: lockTime }));
                    setError('登入失敗次數過多，帳號已暫時鎖定 5 分鐘。');
                } else {
                    localStorage.setItem('login_attempts', JSON.stringify({ count: newCount, lockUntil: 0 }));
                    setError(`帳號或密碼錯誤 (剩餘嘗試次數: ${5 - newCount})`);
                }
            }
        } else if (mode === 'register') {
            if (!username || !password || !securityAnswer) { setError('請填寫所有欄位'); return; }
            if (users[username]) { setError('此帳號已被註冊'); return; }

            users[username] = {
                password: password,
                question: securityQuestion,
                answer: securityAnswer
            };
            localStorage.setItem('voyage_users', JSON.stringify(users));
            onLogin(username);
        } else if (mode === 'change') {
            if (!username || !password || !newPassword) { setError('請填寫所有欄位'); return; }
            const user = users[username];
            if (!user) { setError('找不到此帳號'); return; }

            const storedPass = typeof user === 'string' ? user : user.password;
            if (storedPass !== password) { setError('舊密碼錯誤'); return; }

            // Update password, keep other info if object
            if (typeof user === 'string') {
                users[username] = { password: newPassword, question: '', answer: '' }; // Partial migration
            } else {
                users[username] = { ...user, password: newPassword };
            }
            localStorage.setItem('voyage_users', JSON.stringify(users));
            setSuccessMsg('密碼修改成功！請重新登入');
            setTimeout(() => resetState('login'), 2000);
        } else if (mode === 'forgot') {
            if (!username || !securityAnswer || !newPassword) { setError('請填寫所有欄位'); return; }
            const user = users[username];
            // Should have been checked by handleForgotCheckUser, but check again
            if (!user || typeof user === 'string' || user.answer !== securityAnswer) {
                setError('安全問題回答錯誤');
                return;
            }
            users[username] = { ...user, password: newPassword };
            localStorage.setItem('voyage_users', JSON.stringify(users));
            setSuccessMsg('密碼重設成功！請使用新密碼登入');
            setTimeout(() => resetState('login'), 2000);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-white mb-2">Voyage Genie</h1>
                    <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">
                        {mode === 'login' && 'Welcome Back'}
                        {mode === 'register' && 'Create Account'}
                        {mode === 'forgot' && 'Reset Password'}
                        {mode === 'change' && 'Change Password'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase ml-1">Username</label>
                        <div className="relative">
                            <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type="text"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-6 py-4 font-bold text-white outline-none focus:border-indigo-500 transition-all"
                                placeholder="輸入帳號"
                                disabled={mode === 'forgot' && retrievedQuestion !== null} // Lock username after finding question
                            />
                        </div>
                    </div>

                    {mode === 'login' && (
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase ml-1">Password</label>
                            <div className="relative">
                                <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-6 py-4 font-bold text-white outline-none focus:border-indigo-500 transition-all"
                                    placeholder="輸入密碼"
                                />
                            </div>
                        </div>
                    )}

                    {mode === 'change' && (
                        <>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase ml-1">Old Password</label>
                                <div className="relative">
                                    <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-6 py-4 font-bold text-white outline-none focus:border-indigo-500 transition-all"
                                        placeholder="輸入舊密碼"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase ml-1">New Password</label>
                                <div className="relative">
                                    <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-6 py-4 font-bold text-white outline-none focus:border-indigo-500 transition-all"
                                        placeholder="輸入新密碼"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {mode === 'register' && (
                        <>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase ml-1">Password</label>
                                <div className="relative">
                                    <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-6 py-4 font-bold text-white outline-none focus:border-indigo-500 transition-all"
                                        placeholder="設定密碼"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase ml-1">Security Question</label>
                                <select
                                    value={securityQuestion}
                                    onChange={e => setSecurityQuestion(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 font-bold text-white outline-none focus:border-indigo-500 transition-all appearance-none"
                                >
                                    {QUESTIONS.map(q => <option key={q} value={q}>{q}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase ml-1">Security Answer</label>
                                <input
                                    type="text"
                                    value={securityAnswer}
                                    onChange={e => setSecurityAnswer(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 font-bold text-white outline-none focus:border-indigo-500 transition-all"
                                    placeholder="輸入答案"
                                />
                            </div>
                        </>
                    )}

                    {mode === 'forgot' && (
                        <>
                            {!retrievedQuestion ? (
                                <button type="button" onClick={handleForgotCheckUser} className="w-full py-4 bg-slate-800 text-slate-300 font-bold rounded-2xl hover:bg-slate-700 transition-all">
                                    查找帳號安全問題
                                </button>
                            ) : (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-500 uppercase ml-1">Security Question</label>
                                        <div className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-6 py-4 font-bold text-indigo-400">
                                            {retrievedQuestion}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-500 uppercase ml-1">Answer</label>
                                        <input
                                            type="text"
                                            value={securityAnswer}
                                            onChange={e => setSecurityAnswer(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 font-bold text-white outline-none focus:border-indigo-500 transition-all"
                                            placeholder="輸入答案"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-500 uppercase ml-1">New Password</label>
                                        <div className="relative">
                                            <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                            <input
                                                type="password"
                                                value={newPassword}
                                                onChange={e => setNewPassword(e.target.value)}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-6 py-4 font-bold text-white outline-none focus:border-indigo-500 transition-all"
                                                placeholder="輸入新密碼"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                        </>
                    )}

                    {error && <p className="text-red-500 text-sm font-bold text-center bg-red-500/10 py-2 rounded-xl">{error}</p>}
                    {successMsg && <p className="text-green-500 text-sm font-bold text-center bg-green-500/10 py-2 rounded-xl">{successMsg}</p>}

                    {(!retrievedQuestion || mode !== 'forgot') && (
                        <button className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/20 hover:bg-indigo-500 transition-all flex items-center justify-center gap-2 group">
                            {mode === 'login' && '登入'}
                            {mode === 'register' && '註冊'}
                            {mode === 'change' && '修改密碼'}
                            {mode === 'forgot' && '重設密碼'}
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    )}
                </form>

                <div className="mt-6 flex flex-col gap-2 text-center">
                    {mode === 'login' && (
                        <>
                            <button onClick={() => resetState('register')} className="text-slate-500 font-bold text-xs hover:text-white transition-colors">
                                沒有帳號？ 建立新帳號
                            </button>
                            <button onClick={() => resetState('forgot')} className="text-slate-500 font-bold text-xs hover:text-indigo-400 transition-colors">
                                忘記密碼？
                            </button>
                            <button onClick={() => resetState('change')} className="text-slate-500 font-bold text-xs hover:text-indigo-400 transition-colors">
                                修改密碼
                            </button>
                        </>
                    )}
                    {(mode === 'register' || mode === 'forgot' || mode === 'change') && (
                        <button onClick={() => resetState('login')} className="text-slate-500 font-bold text-xs hover:text-white transition-colors">
                            回登入頁面
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
