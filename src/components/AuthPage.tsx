
import React, { useState } from 'react';
import { User, Lock, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AuthPageProps {
    onLogin: (username: string) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
    const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'change'>('login');
    const [email, setEmail] = useState(''); // Supabase uses Email
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [securityQuestion, setSecurityQuestion] = useState('您的第一所國小是？');
    const [securityAnswer, setSecurityAnswer] = useState('');
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(false);

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
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setLoading(true);

        try {
            if (mode === 'login') {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: email,
                    password: password,
                });
                if (error) throw error;
                if (data.user) {
                    onLogin(data.user.id);
                }
            } else if (mode === 'register') {
                const { data, error: signUpError } = await supabase.auth.signUp({
                    email: email,
                    password: password,
                });
                if (signUpError) throw signUpError;

                if (data.user) {
                    const { error: profileError } = await supabase
                        .from('profiles')
                        .insert([
                            {
                                id: data.user.id,
                                username: email.split('@')[0],
                                security_question: securityQuestion,
                                security_answer: securityAnswer
                            }
                        ]);

                    if (profileError) {
                        console.error('Profile creation failed:', profileError);
                    }

                    if (!data.session) {
                        setSuccessMsg('註冊成功！請檢查信箱驗證連結，然後登入。');
                        setTimeout(() => resetState('login'), 3000);
                    } else {
                        onLogin(data.user.id);
                    }
                }
            } else if (mode === 'change') {
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email: email,
                    password: password
                });
                if (signInError) throw new Error('舊密碼錯誤或帳號不存在');

                const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
                if (updateError) throw updateError;

                setSuccessMsg('密碼修改成功！請重新登入');
                setTimeout(() => resetState('login'), 2000);

            } else if (mode === 'forgot') {
                const { error } = await supabase.auth.resetPasswordForEmail(email);
                if (error) throw error;
                setSuccessMsg('重設密碼信件已發送，請檢查您的信箱。');
            }
        } catch (err: any) {
            setError(err.message || '發生錯誤');
        } finally {
            setLoading(false);
        }
    };

    // Forced cleanup removed after execution.
    // Manual cleanup button remains available.

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 relative">
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
                        <label className="text-xs font-black text-slate-500 uppercase ml-1">Email</label>
                        <div className="relative">
                            <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-6 py-4 font-bold text-white outline-none focus:border-indigo-500 transition-all"
                                placeholder="輸入 Email"
                                required
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
                                    required
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
                                        required
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
                                        required
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
                                        required
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
                                    required
                                />
                            </div>
                        </>
                    )}

                    {mode === 'forgot' && (
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
                    )}

                    {error && <p className="text-red-500 text-sm font-bold text-center bg-red-500/10 py-2 rounded-xl">{error}</p>}
                    {successMsg && <p className="text-green-500 text-sm font-bold text-center bg-green-500/10 py-2 rounded-xl">{successMsg}</p>}

                    <button disabled={loading} className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/20 hover:bg-indigo-500 transition-all flex items-center justify-center gap-2 group disabled:opacity-50">
                        {loading ? 'Processing...' : (
                            <>
                                {mode === 'login' && '登入'}
                                {mode === 'register' && '註冊'}
                                {mode === 'change' && '修改密碼'}
                                {mode === 'forgot' && '發送重設信'}
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 flex flex-col gap-2 text-center">
                    {mode === 'login' && (
                        <>
                            <button onClick={() => resetState('register')} className="text-slate-500 font-bold text-xs hover:text-white transition-colors">
                                沒有帳號？ 建立新帳號
                            </button>
                            <button onClick={() => resetState('forgot')} className="text-slate-500 font-bold text-xs hover:text-indigo-400 transition-colors">
                                忘記密碼？ (Email)
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

                    <button
                        onClick={() => {
                            if (confirm('確定要清除所有舊版(單機)的帳號與資料嗎？此動作無法還原。')) {
                                localStorage.clear();
                                alert('舊版資料已清除');
                                window.location.reload();
                            }
                        }}
                        className="mt-8 mx-auto block text-slate-600 font-bold text-xs uppercase hover:text-red-500 transition-colors border border-slate-800 rounded-full px-4 py-2"
                    >
                        清除舊版資料 (Clear Legacy Data)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
