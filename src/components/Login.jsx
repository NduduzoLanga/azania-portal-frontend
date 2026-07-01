import React, { useState } from 'react';
import { apiService } from '../services/api';

export default function Login({ onAuthSuccess }) {
  const [step, setStep] = useState('VERIFY');
  const [studentNo, setStudentNo] = useState('');
  const [password, setPassword] = useState('');
  const [studentName, setStudentName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await apiService.verifyStudent(studentNo);
      setStudentName(data.name);
      if (data.hasPassword === false || data.isFirstTime) {
        setStep('SETUP');
      } else {
        setStep('LOGIN');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let data;
      if (step === 'SETUP') {
        data = await apiService.setupPassword(studentNo, password);
      } else {
        data = await apiService.login(studentNo, password);
      }
      onAuthSuccess(data.student); 
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 w-screen h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat px-4 font-sans overflow-y-auto"
      style={{ 
        backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.35), rgba(15, 23, 42, 0.55)), url('https://www.dropbox.com/scl/fi/euyohxu41t9kboskuxi69/1000296217.png?rlkey=awaaea9kjnq8tu5xwhz2ozi2i&st=hctsb52n&raw=1')` 
      }}
    >
      {/* Centered Glassmorphism Card */}
      <div className="max-w-md w-full p-8 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 my-auto">
        
        {/* Portal Branding Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">
            AZANIA PARAGON
          </h2>
          <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mt-1">
            Supplementary Exam Portal
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-3 text-sm text-red-700 rounded-r-lg mb-4 shadow-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Step 1: Verification Interface */}
        {step === 'VERIFY' && (
          <form className="space-y-4" onSubmit={handleVerify}>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 mb-1">
                Student Number
              </label>
              <input 
                type="text" 
                required 
                value={studentNo} 
                onChange={(e) => setStudentNo(e.target.value)} 
                placeholder="e.g., SDG1001" 
                className="block w-full px-4 py-3 border border-slate-200 bg-slate-50/50 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-amber-500 uppercase font-mono text-lg transition"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full py-3.5 px-4 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition shadow-lg disabled:opacity-50 cursor-pointer uppercase tracking-wider text-xs"
            >
              {loading ? 'Searching...' : 'Verify Student Profile'}
            </button>
          </form>
        )}

        {/* Step 2: Password Layout (Setup or Sign In) */}
        {(step === 'SETUP' || step === 'LOGIN') && (
          <form className="space-y-4" onSubmit={handlePasswordSubmit}>
            <div className="bg-slate-50/80 p-4 rounded-xl text-sm text-slate-700 border border-slate-100 shadow-inner">
              Greetings, <strong className="text-slate-900">{studentName}</strong>!<br/>
              {step === 'SETUP' 
                ? 'Create a new secure password to initialize your portal account.' 
                : 'Please enter your password to access your scheduling matrix.'
              }
            </div>
            
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 mb-1">
                {step === 'SETUP' ? 'Create Password' : 'Enter Password'}
              </label>
              <input 
                type="password" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••" 
                className="block w-full px-4 py-3 border border-slate-200 bg-slate-50/50 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
              />
            </div>
            
            <div className="flex space-x-3 pt-1">
              <button 
                type="button" 
                onClick={() => setStep('VERIFY')} 
                className="w-1/3 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition text-xs uppercase tracking-wider cursor-pointer"
              >
                Back
              </button>
              <button 
                type="submit" 
                disabled={loading} 
                className="w-2/3 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition shadow-lg disabled:opacity-50 text-xs uppercase tracking-wider cursor-pointer"
              >
                {loading ? 'Processing...' : step === 'SETUP' ? 'Set Password' : 'Sign In'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}