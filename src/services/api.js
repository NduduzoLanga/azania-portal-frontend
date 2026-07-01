const API_BASE = 'https://azania-portal-backend.vercel.app';

export const apiService = {
  verifyStudent: async (studentNo) => {
    const res = await fetch(`${API_BASE}/auth/verify-step1`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentNo }),
    });
    if (!res.ok) throw new Error((await res.json()).message || 'Verification failed');
    return res.json();
  },
  setupPassword: async (studentNo, password) => {
    const res = await fetch(`${API_BASE}/auth/setup-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentNo, password }),
    });
    if (!res.ok) throw new Error((await res.json()).message || 'Password setup failed');
    return res.json();
  },
  login: async (studentNo, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentNo, password }),
    });
    if (!res.ok) throw new Error((await res.json()).message || 'Invalid credentials');
    return res.json();
  },
  getSlots: async () => {
    const res = await fetch(`${API_BASE}/bookings/slots`);
    if (!res.ok) throw new Error('Failed to load slots');
    return res.json();
  },
  reserveSlot: async (bookingData) => {
    const res = await fetch(`${API_BASE}/bookings/reserve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData),
    });
    if (!res.ok) throw new Error((await res.json()).message || 'Booking failed');
    return res.json();
  }
};