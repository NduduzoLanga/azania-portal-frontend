import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import { apiService } from './services/api';

export default function App() {
  const [user, setUser] = useState(null);
  const [roleMode, setRoleMode] = useState('STUDENT'); // STUDENT or ADMIN mode matrix toggle
  const [slots, setSlots] = useState([]);
  
  // Student Context States
  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [bookingMessage, setBookingMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState(null);
  const [isRescheduling, setIsRescheduling] = useState(false);

  // Administrative Dashboard Context States
  const [allStudents, setAllStudents] = useState([]);
  const [editingAdminBooking, setEditingAdminBooking] = useState(null);
  const [adminSelectedStudent, setAdminSelectedStudent] = useState(null);
  const [adminNewDate, setAdminNewDate] = useState('');
  const [adminNewTime, setAdminNewTime] = useState('');
  const [adminStatusFilter, setAdminStatusFilter] = useState('ALL');

  // 💬 Live Chat Widget Initialization (Tawk.to)
  useEffect(() => {
    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();
    const s1 = document.createElement("script");
    const s0 = document.getElementsByTagName("script")[0];
    s1.async = true;
    s1.src = 'https://embed.tawk.to/6a2eaa41ccc4ac1d4891bb53/1jr34i4ss';
    s1.charset = 'UTF-8';
    s1.setAttribute('crossorigin', '*');
    if (s0 && s0.parentNode) s0.parentNode.insertBefore(s1, s0);
    else document.head.appendChild(s1);
  }, []);

  // Sync Global System Resource Calendars
  useEffect(() => {
    apiService.getSlots()
      .then(data => setSlots(data))
      .catch(() => setErrorMessage('Global time slots unreachable.'));
  }, [user]);

  // Sync Administrative Cross-Section Matrices
  const loadAdminMetrics = () => {
    fetch('https://azania-portal-backend.vercel.app/api/admin/students')
      .then(res => res.json())
      .then(data => setAllStudents(data))
      .catch(() => setErrorMessage('Failed to compile administrative cohort lists.'));
  };

  useEffect(() => {
    if (roleMode === 'ADMIN') {
      loadAdminMetrics();
    }
  }, [roleMode]);

  // Helper Authoritative Slip Generator
  const generateTicketSerial = (bookingId, examId) => {
    if (!bookingId) return `API-SUP-26`;
    const shortHash = bookingId.split('-').pop().slice(-5);
    return `API-${examId}-${shortHash}`.toUpperCase();
  };

  // Student Core Reservation Submissions
  const handleConfirmBooking = async () => {
    if (!selectedExam || !selectedDate || !selectedTime) return;
    setErrorMessage(''); setBookingMessage(''); setLoading(true);
    try {
      const examPayloadId = selectedExam.examId || selectedExam.id;
      const result = await apiService.reserveSlot({
        studentNo: user.studentNo,
        examId: examPayloadId,
        date: selectedDate,
        time: selectedTime
      });
      setUser(result.updatedStudent);
      setBookingMessage(result.message);
      const freshBooking = result.updatedStudent.bookings.find(b => b.examId === examPayloadId) || result.updatedStudent.bookings.pop();
      setActiveInvoice(freshBooking);
      setSelectedExam(null); setSelectedDate(''); setSelectedTime(''); setIsRescheduling(false);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Administrative Control Operations
  const handleAdminUpdateBooking = async (studentNo, bookingId, structuralStatusUpdate) => {
    setLoading(true);
    try {
      const response = await fetch('https://azania-portal-backend.vercel.app/api/admin/bookings/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentNo,
          bookingId,
          status: structuralStatusUpdate,
          date: adminNewDate || undefined,
          time: adminNewTime || undefined
        })
      });
      const data = await response.json();
      setAllStudents(data.students);
      setBookingMessage(data.message);
      setEditingAdminBooking(null);
      setAdminNewDate('');
      setAdminNewTime('');
    } catch (err) {
      setErrorMessage('Failed to push administrative adjustments.');
    } finally {
      setLoading(false);
    }
  };

  // Extrapolate Financial & Volume Roster KPI Indicators
  const computeAdminMetrics = () => {
    let total = 0; let pending = 0; let approved = 0; let revenue = 0;
    allStudents.forEach(s => {
      s.bookings.forEach(b => {
        total++;
        if (b.status.includes('Pending') || b.status.includes('Conditional')) { pending++; revenue += Number(b.fee); }
        if (b.status === 'Approved') { approved++; revenue += Number(b.fee); }
      });
    });
    return { total, pending, approved, revenue };
  };

  const metrics = computeAdminMetrics();

  if (!user && roleMode === 'STUDENT') {
    return (
      <div>
        {/* Development Gateway Overlay Toggle */}
        <div style={{ position: 'fixed', top: 12, right: 12, zIndex: 100000 }}>
          <button onClick={() => setRoleMode('ADMIN')} style={{ padding: '6px 12px', backgroundColor: '#fbbf24', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer' }}>
            Switch to Admin View Console
          </button>
        </div>
        <Login onAuthSuccess={(studentData) => setUser(studentData)} />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      backgroundImage: 'radial-gradient(#cbd5e1 1.2px, transparent 1.2px), radial-gradient(#cbd5e1 1.2px, #f8fafc 1.2px)',
      backgroundSize: '24px 24px',
      backgroundPosition: '0 0, 12px 12px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
      color: '#0f172a',
      paddingBottom: '80px',
      boxSizing: 'border-box'
    }}>
      
      {/* 🏛️ System Branding Core Navigation Header */}
      <header style={{
        backgroundColor: '#0f172a',
        color: '#ffffff',
        padding: '16px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: `4px solid ${roleMode === 'ADMIN' ? '#0284c7' : '#d97706'}`,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '900', color: roleMode === 'ADMIN' ? '#0ea5e9' : '#f59e0b' }}>
            AZANIA PARAGON INSTITUTE
          </h1>
          <p style={{ margin: '2px 0 0 0', fontSize: '10px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            {roleMode === 'ADMIN' ? 'Central Control Command Center • Master Allocation' : 'Official Supplementary Allocation Desk'}
          </p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button 
            onClick={() => {
              cancelRescheduleWorkflow();
              setRoleMode(roleMode === 'ADMIN' ? 'STUDENT' : 'ADMIN');
            }}
            style={{ padding: '8px 14px', backgroundColor: roleMode === 'ADMIN' ? '#d97706' : '#0284c7', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', cursor: 'pointer' }}
          >
            {roleMode === 'ADMIN' ? 'View Student Dashboard' : 'View Admin Dashboard'}
          </button>
          
          <button onClick={() => { setUser(null); setRoleMode('STUDENT'); }} style={{ padding: '6px 12px', backgroundColor: 'transparent', color: '#94a3b8', border: '1px solid #334155', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>
            Sign Out
          </button>
        </div>
      </header>

      {/* ======================================================================= */}
      {/* ROLE CONTROLLER BLOCK: ADMIN INTERFACE MANAGEMENT CONSOLE */}
      {/* ======================================================================= */}
      {roleMode === 'ADMIN' ? (
        <main style={{ maxWidth: '1400px', margin: '32px auto 0 auto', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '24px', boxSizing: 'border-box' }}>
          
          {/* Section: Live Analytics Status Readouts */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.01)' }}>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Gross System Seats</span>
              <p style={{ margin: '4px 0 0 0', fontSize: '28px', fontWeight: '900', color: '#0f172a' }}>{metrics.total}</p>
            </div>
            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.01)' }}>
              <span style={{ fontSize: '11px', color: '#b45309', fontWeight: '700', textTransform: 'uppercase' }}>Awaiting EFT Wire</span>
              <p style={{ margin: '4px 0 0 0', fontSize: '28px', fontWeight: '900', color: '#d97706' }}>{metrics.pending}</p>
            </div>
            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.01)' }}>
              <span style={{ fontSize: '11px', color: '#047857', fontWeight: '700', textTransform: 'uppercase' }}>Confirmed Seating Allotments</span>
              <p style={{ margin: '4px 0 0 0', fontSize: '28px', fontWeight: '900', color: '#10b981' }}>{metrics.approved}</p>
            </div>
            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.01)' }}>
              <span style={{ fontSize: '11px', color: '#4338ca', fontWeight: '700', textTransform: 'uppercase' }}>Consolidated Revenue Statement</span>
              <p style={{ margin: '4px 0 0 0', fontSize: '28px', fontWeight: '900', color: '#6366f1' }}>R{metrics.revenue}.00</p>
            </div>
          </div>

          {/* Core Master Registry Controls Container Split Layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', alignItems: 'start' }}>
            
            {/* Left Box: Filterable Cohort Booking Data Table */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>Consolidated Seating Ledger</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['ALL', 'Conditional (Pending EFT)', 'Approved', 'Declined'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setAdminStatusFilter(filter)}
                      style={{
                        padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11px', fontWeight: '700', cursor: 'pointer',
                        backgroundColor: adminStatusFilter === filter ? '#0f172a' : '#ffffff', color: adminStatusFilter === filter ? '#ffffff' : '#475569'
                      }}
                    >
                      {filter === 'ALL' ? 'Show All' : filter.replace('Conditional ', '')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Functional Data Table View Wrapper */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ padding: '12px' }}>Student Profile</th>
                      <th style={{ padding: '12px' }}>Voucher Component</th>
                      <th style={{ padding: '12px' }}>Allocated Block Timeline</th>
                      <th style={{ padding: '12px' }}>Current State</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allStudents.map(student => (
                      student.bookings.map(booking => {
                        if (adminStatusFilter !== 'ALL' && booking.status !== adminStatusFilter) return null;
                        return (
                          <tr key={booking.id} style={{ borderBottom: '1px solid #f1f5f9', verticalAlign: 'middle' }}>
                            <td style={{ padding: '14px 12px' }}>
                              <strong style={{ display: 'block', color: '#0f172a' }}>{student.name}</strong>
                              <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#64748b' }}>{student.studentNo}</span>
                            </td>
                            <td style={{ padding: '14px 12px' }}>
                              <span style={{ fontWeight: '600', color: '#334155' }}>{booking.examName}</span><br />
                              <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#d97706' }}>{generateTicketSerial(booking.id, booking.examId)}</span>
                            </td>
                            <td style={{ padding: '14px 12px' }}>
                              <strong>{booking.date}</strong><br />
                              <span style={{ fontSize: '12px', color: '#475569' }}>{booking.time}</span>
                            </td>
                            <td style={{ padding: '14px 12px' }}>
                              <span style={{
                                padding: '4px 10px', borderRadius: '12px', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase',
                                backgroundColor: booking.status === 'Approved' ? '#d1fae5' : booking.status.includes('Pending') ? '#fffbeb' : '#fee2e2',
                                color: booking.status === 'Approved' ? '#065f46' : booking.status.includes('Pending') ? '#b45309' : '#991b1b'
                              }}>
                                {booking.status.replace('Conditional ', '')}
                              </span>
                            </td>
                            <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                              <button
                                onClick={() => { setEditingAdminBooking(booking); setAdminSelectedStudent(student); }}
                                style={{ padding: '6px 12px', backgroundColor: '#0284c7', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '11px', cursor: 'pointer' }}
                              >
                                Manage / Reschedule
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Box: Absolute Override Action Workstation Drawer */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
              <h3 style={{ margin: '0 0 14px 0', fontSize: '14px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                Operational Override Deck
              </h3>

              {editingAdminBooking ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '10px', fontSize: '12.5px', border: '1px solid #e2e8f0' }}>
                    <span style={{ color: '#64748b', fontSize: '11px', fontWeight: '700' }}>TARGET ENROLLEE:</span>
                    <p style={{ margin: '2px 0 6px 0', fontWeight: '700' }}>{adminSelectedStudent.name} ({adminSelectedStudent.studentNo})</p>
                    <span style={{ color: '#64748b', fontSize: '11px', fontWeight: '700' }}>STAGED MODULE:</span>
                    <p style={{ margin: '2px 0 0 0', fontWeight: '700', color: '#0284c7' }}>{editingAdminBooking.examName}</p>
                  </div>

                  {/* Immediate State Status Override Controls */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '6px', color: '#475569' }}>Authorize Direct State Transition</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <button
                        onClick={() => handleAdminUpdateBooking(adminSelectedStudent.studentNo, editingAdminBooking.id, 'Approved')}
                        style={{ padding: '10px', backgroundColor: '#10b981', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}
                      >
                        ✓ Approve Seat
                      </button>
                      <button
                        onClick={() => handleAdminUpdateBooking(adminSelectedStudent.studentNo, editingAdminBooking.id, 'Declined')}
                        style={{ padding: '10px', backgroundColor: '#ef4444', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}
                      >
                        ✕ Decline / Revoke
                      </button>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '6px', color: '#475569' }}>Shift Calendar Date Allotment</label>
                    <select
                      value={adminNewDate}
                      onChange={(e) => { setAdminNewDate(e.target.value); setAdminNewTime(''); }}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    >
                      <option value="">-- Click to choose global date override --</option>
                      {slots.map(s => <option key={s.date} value={s.date}>{s.date}</option>)}
                    </select>
                  </div>

                  {adminNewDate && (
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '6px', color: '#475569' }}>Shift Time Block Segment</label>
                      <select
                        value={adminNewTime}
                        onChange={(e) => setAdminNewTime(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                      >
                        <option value="">-- Choose time override --</option>
                        {slots.find(s => s.date === adminNewDate)?.times.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  )}

                  {adminNewDate && adminNewTime && (
                    <button
                      onClick={() => handleAdminUpdateBooking(adminSelectedStudent.studentNo, editingAdminBooking.id, null)}
                      style={{ padding: '12px', backgroundColor: '#0f172a', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '12px', cursor: 'pointer', marginTop: '6px' }}
                    >
                      ⚠️ Execute Schedule Shift Override
                    </button>
                  )}

                  <button
                    onClick={() => { setEditingAdminBooking(null); setAdminSelectedStudent(null); }}
                    style={{ padding: '8px', backgroundColor: 'transparent', color: '#64748b', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '11px', cursor: 'pointer', marginTop: '12px' }}
                  >
                    Cancel Operations
                  </button>
                </div>
              ) : (
                <p style={{ margin: 0, color: '#64748b', fontSize: '12.5px', textAlign: 'center', padding: '24px 0', fontStyle: 'italic' }}>
                  No target context loaded. Click "Manage / Reschedule" on any ledger asset row to modify variables.
                </p>
              )}
            </div>

          </div>
        </main>
      ) : (
        /* ======================================================================= */
        /* STANDARD ROLE CONTROLLER BLOCK: AUTHENTICATED LEARNER ENVIRONMENT */
        /* ======================================================================= */
        <main style={{ maxWidth: '1280px', margin: '32px auto 0 auto', padding: '0 24px', display: 'grid', gridTemplateColumns: '1.1fr 1.9fr', gap: '32px', boxSizing: 'border-box' }}>
          
          {/* Left Navigation Panels: Roster Component Lists */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(15,23,42,0.04)', border: '1px solid #e2e8f0' }}>
              <h2 style={{ margin: '0 0 14px 0', fontSize: '13px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                Pending Supplementary Invoices
              </h2>
              {user.missedExams.length === 0 ? (
                <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '16px', display: 'flex', gap: '12px' }}>
                  <span style={{ fontSize: '18px' }}>✓</span>
                  <p style={{ margin: 0, fontSize: '12.5px', color: '#166534', fontWeight: '600' }}>All cohort modules cleared.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {user.missedExams.map((exam) => {
                    const isSelected = selectedExam?.id === exam.id && !isRescheduling;
                    return (
                      <button
                        key={exam.id}
                        onClick={() => { setSelectedExam(exam); setBookingMessage(''); setIsRescheduling(false); }}
                        style={{ width: '100%', textAlign: 'left', padding: '14px', borderRadius: '12px', border: isSelected ? '2px solid #d97706' : '1px solid #e2e8f0', backgroundColor: isSelected ? '#fffbeb' : '#ffffff', cursor: 'pointer' }}
                      >
                        <span style={{ display: 'block', fontSize: '10px', fontFamily: 'monospace', color: '#94a3b8' }}>{exam.id}</span>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>{exam.name.replace(/SDG P\d - /, '')}</span>
                          <span style={{ fontSize: '12px', backgroundColor: '#0f172a', color: '#fbbf24', padding: '3px 8px', borderRadius: '6px', fontFamily: 'monospace', fontWeight: '800' }}>R{exam.fee}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(15,23,42,0.04)', border: '1px solid #e2e8f0' }}>
              <h2 style={{ margin: '0 0 14px 0', fontSize: '13px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                Issued Entry Slips ({user.bookings.length})
              </h2>
              {user.bookings.length === 0 ? (
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b', fontStyle: 'italic', textAlign: 'center' }}>No active session parameters found.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {user.bookings.map((booking) => (
                    <div key={booking.id} style={{ border: activeInvoice?.id === booking.id ? '2px solid #0f172a' : '1px solid #e2e8f0', borderRadius: '14px', backgroundColor: '#ffffff', overflow: 'hidden' }}>
                      <div style={{ backgroundColor: '#f8fafc', padding: '12px 14px', borderBottom: '1px dashed #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '700' }}>VOUCHER SERIAL</span>
                          <p style={{ margin: 0, fontSize: '13px', fontFamily: 'monospace', fontWeight: '900', color: '#d97706' }}>{generateTicketSerial(booking.id, booking.examId)}</p>
                        </div>
                        <span style={{
                          fontSize: '10px', padding: '2px 8px', borderRadius: '20px', fontWeight: '700',
                          backgroundColor: booking.status === 'Approved' ? '#d1fae5' : '#fffbeb',
                          color: booking.status === 'Approved' ? '#047857' : '#b45309'
                        }}>{booking.status.replace('Conditional ', '')}</span>
                      </div>
                      <div style={{ padding: '14px' }}>
                        <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', fontWeight: '800' }}>{booking.examName}</h4>
                        <p style={{ margin: '0 0 10px 0', fontSize: '12.5px', color: '#475569' }}>📅 <strong>{booking.date}</strong> &nbsp;|&nbsp; ⏰ <strong>{booking.time}</strong></p>
                        <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                          <button onClick={() => setActiveInvoice(booking)} style={{ flex: 1, padding: '6px', fontSize: '11px', fontWeight: '700', borderRadius: '6px', backgroundColor: '#f1f5f9', border: 'none', cursor: 'pointer' }}>View Parameters</button>
                          <button onClick={() => { setSelectedExam({ id: booking.examId, examId: booking.examId, name: booking.examName, fee: booking.fee }); setSelectedDate(booking.date); setSelectedTime(booking.time); setIsRescheduling(true); setActiveInvoice(booking); }} style={{ padding: '6px 12px', fontSize: '11px', fontWeight: '700', borderRadius: '6px', backgroundColor: '#fffbeb', border: '1px solid #fef08a', color: '#b45309', cursor: 'pointer' }}>✏️ Shift Date</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Layout Workspace Column: Active Forms & Receipts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {bookingMessage && <div style={{ backgroundColor: '#ecfdf5', borderLeft: '5px solid #10b981', padding: '16px', fontSize: '13px', color: '#065f46', borderRadius: '8px', fontWeight: '600' }}>🎉 {bookingMessage}</div>}
            {errorMessage && <div style={{ backgroundColor: '#fef2f2', borderLeft: '5px solid #ef4444', padding: '16px', fontSize: '13px', color: '#991b1b', borderRadius: '8px', fontWeight: '600' }}>⚠️ {errorMessage}</div>}

            {activeInvoice && (
              <div style={{ backgroundColor: '#fffbeb', border: '2px dashed #f59e0b', padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #fde68a', paddingBottom: '12px' }}>
                  <div>
                    <span style={{ fontSize: '10px', color: '#b45309', fontWeight: '800' }}>FINANCIAL PAYMENT PORTAL</span>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '900', color: '#78350f', textTransform: 'uppercase' }}>Direct Banking Directive</h3>
                  </div>
                  <button onClick={() => setActiveInvoice(null)} style={{ fontSize: '11px', backgroundColor: '#fde68a', border: 'none', color: '#78350f', padding: '6px 12px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>Dismiss Overlay</button>
                </div>
                <div style={{ backgroundColor: '#ffffff', padding: '18px', borderRadius: '12px', border: '1px solid #fde68a', fontFamily: 'monospace', fontSize: '12.5px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <p style={{ margin: 0 }}><span style={{ color: '#94a3b8' }}>BANK ENTITY:</span> <span style={{ fontWeight: '700' }}>GoTyme (formerly TymeBank)</span></p>
                  <p style={{ margin: 0 }}><span style={{ color: '#94a3b8' }}>ACCOUNT NO:</span> <span style={{ fontWeight: '800', fontSize: '14px', color: '#0f172a' }}>53000601847</span></p>
                  <p style={{ margin: 0 }}><span style={{ color: '#94a3b8' }}>ROUTING CODE:</span> <span style={{ fontWeight: '700' }}>678910</span></p>
                  <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '8px', marginTop: '4px' }}>
                    <span style={{ color: '#b45309', fontWeight: '800', fontSize: '11px' }}>REQUIRED EFT REFERENCE:</span> <br />
                    <span style={{ display: 'inline-block', marginTop: '4px', backgroundColor: '#0f172a', color: '#fbbf24', padding: '6px 12px', borderRadius: '6px', fontWeight: '900', fontSize: '13px' }}>SUPP EXAM {user.studentNo}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                    <span>AMOUNT DUE: <strong>R{activeInvoice.fee}.00</strong></span>
                    <span style={{ color: '#b91c1c' }}>CUTOFF TIME: <strong>{activeInvoice.expiresAt}</strong></span>
                  </div>
                </div>
              </div>
            )}

            <div style={{ backgroundColor: '#ffffff', padding: '28px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '18px', marginBottom: '24px' }}>
                <div>
                  <span style={{ display: 'inline-block', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '800', backgroundColor: isRescheduling ? '#fffbeb' : '#f1f5f9', color: isRescheduling ? '#b45309' : '#475569', marginBottom: '6px' }}>
                    {isRescheduling ? '⚙️ Rescheduling Configuration Panel' : '⚡ Direct Scheduling Engine'}
                  </span>
                  <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '900' }}>{selectedExam ? `Parameters for: ${selectedExam.name.replace(/SDG P\d - /, '')}` : 'Select a Paper Component to Begin'}</h2>
                </div>
                {isRescheduling && <button onClick={() => { setSelectedExam(null); setIsRescheduling(false); setSelectedDate(''); setSelectedTime(''); }} style={{ fontSize: '11px', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer' }}>Cancel Shift</button>}
              </div>

              {selectedExam && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <p style={{ margin: '0 0 10px 0', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#475569' }}>Step 1: Assign Evaluation Calendar Date</p>
                    {/* Simplified Block Weeks Rendering */}
                    {[0, 4, 8].map((wIdx, rowNum) => (
                      <div key={wIdx} style={{ marginBottom: '12px' }}>
                        <span style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: '#94a3b8', marginBottom: '4px' }}>Block Week {rowNum + 1}</span>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                          {slots.slice(wIdx, wIdx + 4).map(slot => (
                            <button key={slot.date} onClick={() => { setSelectedDate(slot.date); setSelectedTime(''); }} style={{ padding: '10px 4px', borderRadius: '8px', cursor: 'pointer', border: selectedDate === slot.date ? '1px solid #0f172a' : '1px solid #e2e8f0', backgroundColor: selectedDate === slot.date ? '#0f172a' : '#f8fafc', color: selectedDate === slot.date ? '#ffffff' : '#334155', fontSize: '12px', fontFamily: 'monospace', fontWeight: '700' }}>{slot.date.substring(5)}</button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedDate && (
                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
                      <p style={{ margin: '0 0 10px 0', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#475569' }}>Step 2: Assign Work-Hour Segment</p>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        {slots.find(s => s.date === selectedDate)?.times.map(t => (
                          <button key={t} onClick={() => setSelectedTime(t)} style={{ padding: '10px 18px', fontSize: '12px', borderRadius: '8px', cursor: 'pointer', border: selectedTime === t ? '1px solid #d97706' : '1px solid #e2e8f0', backgroundColor: selectedTime === t ? '#d97706' : '#ffffff', color: selectedTime === t ? '#ffffff' : '#475569', fontFamily: 'monospace', fontWeight: '700' }}>{t}</button>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedDate && selectedTime && (
                    <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                      <p style={{ margin: 0, fontSize: '13px' }}>Staging: <strong>{selectedDate} @ {selectedTime}</strong></p>
                      <button onClick={handleConfirmBooking} style={{ padding: '12px 24px', backgroundColor: '#d97706', color: '#ffffff', fontWeight: '800', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                        {isRescheduling ? 'Authorize Shift Change' : 'Confirm Allocation Seat'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      )}

    </div>
  );
}