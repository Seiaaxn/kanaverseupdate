import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import { getUser, getStoredUsers, initAdminAccount } from '../utils/userSystem';

const AUTH_KEY = 'animeplay_auth';
const USERS_KEY = 'animeplay_users';

const LoginPage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('login');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ username:'', email:'', password:'', confirm:'' });

  useEffect(()=>{
    initAdminAccount();
    if (getUser()) navigate('/',{replace:true});
  },[]);
  useEffect(()=>{setError('');},[tab]);

  const set=(k,v)=>{setForm(f=>({...f,[k]:v}));setError('');};

  const handleLogin=async(e)=>{
    e.preventDefault();
    if (!form.email||!form.password){setError('Email dan password wajib diisi.');return;}
    setLoading(true);
    await new Promise(r=>setTimeout(r,400));
    const users=getStoredUsers();
    // Check by email or username
    const found=users.find(u=>(u.email===form.email||u.username===form.email)&&u.password===form.password);
    if (!found){setError('Email/username atau password salah.');setLoading(false);return;}
    const session={id:found.id,username:found.username,email:found.email,joinedAt:found.joinedAt,
      role:found.role||'user',xp:found.xp||0,avatar:found.avatar||null,avatarIsFile:found.avatarIsFile||false};
    localStorage.setItem(AUTH_KEY,JSON.stringify(session));
    setLoading(false);navigate('/',{replace:true});
  };

  const handleRegister=async(e)=>{
    e.preventDefault();
    if (!form.username||!form.email||!form.password){setError('Semua field wajib diisi.');return;}
    if (form.password.length<6){setError('Password minimal 6 karakter.');return;}
    if (form.password!==form.confirm){setError('Password tidak cocok.');return;}
    setLoading(true);
    await new Promise(r=>setTimeout(r,400));
    const users=getStoredUsers();
    if (users.find(u=>u.email===form.email)){setError('Email sudah terdaftar.');setLoading(false);return;}
    if (users.find(u=>u.username===form.username)){setError('Username sudah digunakan.');setLoading(false);return;}
    const isFirst=users.length===0||!users.find(u=>u.role==='admin'&&u.id!=='admin_super');
    const newUser={id:Date.now().toString(),username:form.username,email:form.email,password:form.password,
      joinedAt:new Date().toISOString(),role:'user',xp:0,avatar:null,avatarIsFile:false};
    localStorage.setItem(USERS_KEY,JSON.stringify([...users,newUser]));
    const session={id:newUser.id,username:newUser.username,email:newUser.email,joinedAt:newUser.joinedAt,role:newUser.role,xp:0,avatar:null,avatarIsFile:false};
    localStorage.setItem(AUTH_KEY,JSON.stringify(session));
    setLoading(false);navigate('/',{replace:true});
  };

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-15 pointer-events-none" style={{background:'radial-gradient(circle,#7c6dfa,transparent)'}}/>
      <div className="absolute bottom-20 left-0 w-48 h-48 rounded-full blur-3xl opacity-10 pointer-events-none" style={{background:'radial-gradient(circle,#fa6d9a,transparent)'}}/>

      <div className="relative z-10 px-4 pt-4" style={{height:'56px',display:'flex',alignItems:'center'}}>
        <button onClick={()=>navigate(-1)} className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{background:'rgba(255,255,255,0.06)'}}>
          <ArrowLeft size={18} className="text-white"/>
        </button>
      </div>

      <div className="relative z-10 flex-1 px-5 py-2 flex flex-col max-w-sm mx-auto w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl mb-4 shadow-2xl" style={{background:'linear-gradient(135deg,#7c6dfa,#fa6d9a)'}}>
            <span className="text-2xl">🎌</span>
          </div>
          <h1 className="text-3xl font-black mb-1">
            <span className="gradient-text">Kan4</span><span className="text-white">verse</span>
          </h1>
          <p className="text-sm" style={{color:'var(--muted)'}}>
            {tab==='login'?'Selamat datang kembali, Nakama! 👋':'Bergabunglah dengan komunitas! 🎉'}
          </p>
        </div>

        <div className="flex p-1 mb-4 rounded-2xl" style={{background:'var(--card)',border:'1px solid var(--border)'}}>
          {[['login','Masuk'],['register','Daftar']].map(([t,label])=>(
            <button key={t} onClick={()=>setTab(t)} className="flex-1 py-3 text-sm font-bold rounded-xl transition-all"
              style={tab===t?{background:'linear-gradient(135deg,#7c6dfa,#fa6d9a)',color:'white'}:{color:'var(--muted)'}}>
              {label}
            </button>
          ))}
        </div>


        {error&&(
          <div className="flex items-center gap-2.5 px-4 py-3 mb-4 rounded-2xl" style={{background:'rgba(250,109,154,0.1)',border:'1px solid rgba(250,109,154,0.2)'}}>
            <AlertCircle size={14} style={{color:'#fa6d9a',flexShrink:0}}/>
            <p className="text-xs font-medium" style={{color:'#fa6d9a'}}>{error}</p>
          </div>
        )}

        <form onSubmit={tab==='login'?handleLogin:handleRegister} className="space-y-3">
          {tab==='register'&&(
            <div className="relative">
              <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{color:'var(--muted)'}}/>
              <input value={form.username} onChange={e=>set('username',e.target.value)} placeholder="Username" maxLength={20}
                className="w-full pl-11 pr-4 py-4 rounded-2xl text-sm text-white outline-none" style={{background:'var(--card)',border:'1px solid var(--border)'}}/>
            </div>
          )}
          <div className="relative">
            <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{color:'var(--muted)'}}/>
            <input type="text" value={form.email} onChange={e=>set('email',e.target.value)} placeholder="Email atau Username"
              className="w-full pl-11 pr-4 py-4 rounded-2xl text-sm text-white outline-none" style={{background:'var(--card)',border:'1px solid var(--border)'}}/>
          </div>
          <div className="relative">
            <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{color:'var(--muted)'}}/>
            <input type={showPass?'text':'password'} value={form.password} onChange={e=>set('password',e.target.value)} placeholder="Password"
              className="w-full pl-11 pr-12 py-4 rounded-2xl text-sm text-white outline-none" style={{background:'var(--card)',border:'1px solid var(--border)'}}/>
            <button type="button" onClick={()=>setShowPass(v=>!v)} className="absolute right-4 top-1/2 -translate-y-1/2" style={{color:'var(--muted)'}}>
              {showPass?<EyeOff size={16}/>:<Eye size={16}/>}
            </button>
          </div>
          {tab==='register'&&(
            <div className="relative">
              <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{color:'var(--muted)'}}/>
              <input type={showConfirm?'text':'password'} value={form.confirm} onChange={e=>set('confirm',e.target.value)} placeholder="Konfirmasi Password"
                className="w-full pl-11 pr-12 py-4 rounded-2xl text-sm text-white outline-none" style={{background:'var(--card)',border:'1px solid var(--border)'}}/>
              <button type="button" onClick={()=>setShowConfirm(v=>!v)} className="absolute right-4 top-1/2 -translate-y-1/2" style={{color:'var(--muted)'}}>
                {showConfirm?<EyeOff size={16}/>:<Eye size={16}/>}
              </button>
            </div>
          )}
          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm text-white mt-2 transition-all active:scale-95"
            style={{background:'linear-gradient(135deg,#7c6dfa,#fa6d9a)',boxShadow:'0 8px 24px rgba(124,109,250,0.3)'}}>
            {loading&&<Loader2 size={16} className="animate-spin"/>}
            {loading?'Mohon tunggu...':tab==='login'?'Masuk 🚀':'Buat Akun 🎌'}
          </button>
        </form>

        <button onClick={()=>setTab(tab==='login'?'register':'login')} className="text-xs text-center mt-5 w-full" style={{color:'var(--muted)'}}>
          {tab==='login'?'Belum punya akun? ':'Sudah punya akun? '}
          <span style={{color:'#7c6dfa',fontWeight:700}}>{tab==='login'?'Daftar sekarang':'Masuk'}</span>
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
                                                
