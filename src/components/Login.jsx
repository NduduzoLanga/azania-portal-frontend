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
    setPassword(''); // Clear any lingering browser autofill artifacts
    
    try {
      const data = await apiService.verifyStudent(studentNo);
      setStudentName(data.name);
      if (data.hasPassword === false) {
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
      
      // 🎯 FIX: Forward the entire unified payload wrapper directly to App.jsx
      if (data && data.user) {
        onAuthSuccess(data);
      } else {
        throw new Error("Authentication response payload structure invalid.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.55), rgba(15, 23, 42, 0.75)), url('https://www.dropbox.com/scl/fi/euyohxu41t9kboskuxi69/1000296217.png?rlkey=awaaea9kjnq8tu5xwhz2ozi2i&st=hctsb52n&raw=1')` 
      }}
    >
      <div style={{
        maxWidth: '420px',
        width: '90%',
        backgroundColor: '#ffffff',
        padding: '40px 32px',
        borderRadius: '20px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        border: '1px solid #e2e8f0',
        boxSizing: 'border-box',
        textAlign: 'left'
      }}>
        
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#1e293b', margin: 0, letterSpacing: '-0.025em' }}>
            AZANIA PARAGON
          </h2>
          <p style={{ fontSize: '11px', fontWeight: '800', color: '#d97706', letterSpacing: '0.05em', margin: '6px 0 0 0' }}>
            SUPPLEMENTARY EXAM PORTAL
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            borderLeft: '4px solid #ef4444',
            padding: '12px',
            fontSize: '13px',
            color: '#991b1b',
            borderRadius: '0 8px 8px 0',
            marginBottom: '20px',
            fontWeight: '500'
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Step 1: Verification Form */}
        {step === 'VERIFY' && (
          <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} onSubmit={handleVerify}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#475569', marginBottom: '6px', letterSpacing: '0.025em' }}>
                Identifier ID / Student Number
              </label>
              <input 
                type="text" 
                required 
                autoComplete="username"
                value={studentNo} 
                onChange={(e) => setStudentNo(e.target.value)} 
                placeholder="e.g., SDG1001 or Admin Email" 
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
              />
            </div>
            <button 
              type="submit" 
              disabled={loading} 
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: '#1e293b',
                color: '#ffffff',
                fontWeight: '700',
                fontSize: '13px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? 'Verifying Profile...' : 'Verify Identity'}
            </button>
          </form>
        )}

        {/* Step 2: Password Setup / Login Form */}
        {(step === 'SETUP' || step === 'LOGIN') && (
          <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} onSubmit={handlePasswordSubmit}>
            <div style={{
              backgroundColor: '#f1f5f9',
              padding: '14px',
              borderRadius: '12px',
              fontSize: '13px',
              color: '#334155',
              border: '1px solid #e2e8f0',
              lineHeight: '1.5'
            }}>
              Greetings, <strong style={{ color: '#0f172a' }}>{studentName}</strong>!<br/>
              {step === 'SETUP' 
                ? 'Create a secure password to initialize your supplementary portal account.' 
                : 'Please enter your account password to view your scheduling calendar.'
              }
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#475569', marginBottom: '6px', letterSpacing: '0.025em' }}>
                {step === 'SETUP' ? 'Create Password' : 'Enter Password'}
              </label>
              <input 
                type="password" 
                required 
                autoComplete={step === 'SETUP' ? 'new-password' : 'current-password'}
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••" 
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
              <button 
                type="button" 
                onClick={() => { setStep('VERIFY'); setPassword(''); }} 
                style={{
                  width: '35%',
                  padding: '14px',
                  backgroundColor: '#e2e8f0',
                  color: '#475569',
                  fontWeight: '700',
                  fontSize: '13px',
                  textTransform: 'uppercase',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer'
                }}
              >
                Back
              </button>
              <button 
                type="submit" 
                disabled={loading} 
                style={{
                  width: '65%',
                  padding: '14px',
                  backgroundColor: step === 'SETUP' ? '#d97706' : '#0ea5e9',
                  color: '#ffffff',
                  fontWeight: '700',
                  fontSize: '13px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  opacity: loading ? 0.6 : 1
                }}
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