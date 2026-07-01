import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import { apiService } from './services/api';

export default function App() {
  const [user, setUser] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [bookingMessage, setBookingMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState(null);

  useEffect(() => {
    if (user) {
      apiService.getSlots()
        .then(data => setSlots(data))
        .catch(err => setErrorMessage('Could not load scheduling calendar matrix.'));
    }
  }, [user]);

  const handleConfirmBooking = async () => {
    if (!selectedExam || !selectedDate || !selectedTime) {
      setErrorMessage('Please select a module, date, and time slot.');
      return;
    }

    setErrorMessage('');
    setBookingMessage('');
    setLoading(true);

    try {
      const result = await apiService.reserveSlot({
        studentNo: user.studentNo,
        examId: selectedExam.id,
        date: selectedDate,
        time: selectedTime
      });

      setUser(result.updatedStudent);
      setBookingMessage(result.message);
      
      // Select newly added booking to trigger EFT invoice display wrapper
      const freshBooking = result.updatedStudent.bookings[result.updatedStudent.bookings.length - 1];
      setActiveInvoice(freshBooking);

      setSelectedExam(null);
      setSelectedDate('');
      setSelectedTime('');
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <Login onAuthSuccess={(studentData) => setUser(studentData)} />;
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f1f5f9',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#1e293b',
      paddingBottom: '48px',
      boxSizing: 'border-box'
    }}>
      
      {/* 🏛️ Top Navigation Frame */}
      <header style={{
        backgroundColor: '#0f172a',
        color: '#ffffff',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
        borderBottom: '4px solid #f59e0b'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '900', letterSpacing: '0.05em', color: '#f59e0b' }}>
            AZANIA PARAGON INSTITUTE
          </h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '10px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Cohort Sup-Registration System v2.6
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: 0, fontWeight: '700', fontSize: '14px', color: '#f8fafc' }}>{user.name}</p>
          <p style={{ margin: '2px 0 0 0', fontSize: '12px', fontFamily: 'monospace', color: '#fbbf24', fontWeight: '700' }}>{user.studentNo}</p>
        </div>
      </header>

      {/* 🎛️ Workspace Layout Content Container */}
      <main style={{
        maxWidth: '1200px',
        margin: '32px auto 0 auto',
        padding: '0 16px',
        display: 'grid',
        gridTemplateColumns: '1fr 2fr',
        gap: '24px',
        boxSizing: 'border-box'
      }}>
        
        {/* LEFT COLUMN: Roster Management Panels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Box 1: Unscheduled Papers */}
          <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
            <h2 style={{ margin: '0 0 12px 0', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
              Unscheduled Papers
            </h2>
            
            {user.missedExams.length === 0 ? (
              <p style={{ margin: 0, fontSize: '12px', color: '#15803d', backgroundColor: '#f0fdf4', padding: '12px', borderRadius: '8px', border: '1px solid #bbf7d0', fontWeight: '500' }}>
                ✓ All cohort supplementary modules have been allocated time slots.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {user.missedExams.map((exam) => {
                  const isSelected = selectedExam?.id === exam.id;
                  return (
                    <button
                      key={exam.id}
                      onClick={() => { setSelectedExam(exam); setBookingMessage(''); }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '12px',
                        borderRadius: '8px',
                        border: isSelected ? '2px solid #f59e0b' : '1px solid #e2e8f0',
                        backgroundColor: isSelected ? '#fef9c3' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s ease'
                      }}
                    >
                      <p style={{ margin: '0 0 4px 0', fontSize: '11px', fontFamily: 'monospace', color: '#94a3b8' }}>{exam.id}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', fontWeight: isSelected ? '700' : '500', color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '170px' }}>
                          {exam.name.replace(/SDG P\d - /, '')}
                        </span>
                        <span style={{ fontSize: '11px', backgroundColor: '#1e293b', color: '#fbbf24', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace', fontWeight: '700' }}>
                          R{exam.fee}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Box 2: Roster Seating Status */}
          <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
            <h2 style={{ margin: '0 0 12px 0', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
              Roster Seating Status
            </h2>
            {user.bookings.length === 0 ? (
              <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', fontStyle: 'italic', padding: '8px 0' }}>
                No active pending or paid allocations on file.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {user.bookings.map((booking) => (
                  <div key={booking.id} style={{ padding: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>
                        {booking.examName}
                      </span>
                      <button 
                        onClick={() => setActiveInvoice(booking)}
                        style={{
                          fontSize: '10px',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          backgroundColor: '#fef3c7',
                          border: '1px solid #fde68a',
                          color: '#78350f',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        View EFT Info
                      </button>
                    </div>
                    <p style={{ margin: 0, fontSize: '12px', color: '#475569', fontWeight: '500' }}>
                      📅 {booking.date} | ⏰ {booking.time}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed #e2e8f0', paddingTop: '6px', marginTop: '4px' }}>
                      <span style={{ fontSize: '9px', color: '#94a3b8', fontFamily: 'monospace' }}>Expires: {booking.expiresAt}</span>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: '#ea580c', fontFamily: 'monospace' }}>R{booking.fee}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Scheduling Desk & Invoices */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {bookingMessage && (
            <div style={{ backgroundColor: '#ecfdf5', borderLeft: '4px solid #10b981', padding: '12px', fontSize: '12px', color: '#065f46', borderRadius: '4px' }}>
              🎉 {bookingMessage}
            </div>
          )}
          {errorMessage && (
            <div style={{ backgroundColor: '#fef2f2', borderLeft: '4px solid #ef4444', padding: '12px', fontSize: '12px', color: '#991b1b', borderRadius: '4px' }}>
              ⚠️ {errorMessage}
            </div>
          )}

          {/* EFT Payment Mandate Invoice Display */}
          {activeInvoice && (
            <div style={{ backgroundColor: '#fffbeb', border: '2px solid #f59e0b', padding: '20px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: 'inset 0 2px 4px 0 rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #fde68a', paddingBottom: '8px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '900', color: '#78350f', textTransform: 'uppercase', letterSpacing: '0.025em' }}>Direct EFT Payment Mandate</h3>
                  <p style={{ margin: 0, fontSize: '10px', fontFamily: 'monospace', color: '#b45309' }}>Invoice ID: {activeInvoice.id}</p>
                </div>
                <button 
                  onClick={() => setActiveInvoice(null)} 
                  style={{ fontSize: '11px', backgroundColor: '#fde68a', border: 'none', color: '#78350f', padding: '6px 10px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}
                >
                  Hide Directive
                </button>
              </div>
              
              <p style={{ margin: 0, fontSize: '12px', color: '#334155', lineHeight: '1.6' }}>
                A conditional seat has been reserved for <strong style={{ color: '#0f172a' }}>{activeInvoice.examName}</strong> on <span style={{ fontWeight: '700', color: '#0f172a' }}>{activeInvoice.date} ({activeInvoice.time})</span>. To secure this seat, make an EFT payment before the 7-day expiry deadline (<strong style={{ color: '#b91c1c' }}>{activeInvoice.expiresAt}</strong>).
              </p>

              <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '8px', border: '1px solid #fde68a', fontFamily: 'monospace', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}>
                <p style={{ margin: 0 }}><span style={{ color: '#94a3b8' }}>BANK NAME:</span> <span style={{ fontWeight: '700', color: '#334155' }}>GoTyme (formerly TymeBank)</span></p>
                <p style={{ margin: 0 }}><span style={{ color: '#94a3b8' }}>ACCOUNT NO:</span> <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '13px' }}>53000601847</span></p>
                <p style={{ margin: 0 }}><span style={{ color: '#94a3b8' }}>ACCOUNT NAME:</span> <span style={{ fontWeight: '700', color: '#334155' }}>AZANIA PARAGON INSTITUTE</span></p>
                <p style={{ margin: 0 }}><span style={{ color: '#94a3b8' }}>BRANCH CODE:</span> <span style={{ fontWeight: '700', color: '#334155' }}>678910</span></p>
                <p style={{ margin: '6px 0 0 0', paddingTop: '8px', borderTop: '1px dashed #e2e8f0' }}>
                  <span style={{ color: '#d97706', fontWeight: '700' }}>REQUIRED REFERENCE:</span> <br />
                  <span style={{ display: 'inline-block', marginTop: '4px', backgroundColor: '#0f172a', color: '#fbbf24', padding: '4px 8px', borderRadius: '4px', fontWeight: '900', fontSize: '13px', letterSpacing: '0.05em' }}>SUPP EXAM {user.studentNo}</span>
                </p>
                <p style={{ margin: 0 }}><span style={{ color: '#94a3b8' }}>AMOUNT DUE:</span> <span style={{ fontWeight: '700', color: '#0f172a' }}>R{activeInvoice.fee}.00</span></p>
              </div>
              <p style={{ margin: 0, fontSize: '10px', color: '#64748b', fontStyle: 'italic' }}>⚠️ Note: Email confirmation copy with these banking parameters has been transmitted to parent inbox address on file.</p>
            </div>
          )}

          {/* Calendar Block Container */}
          <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '20px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '900', color: '#1e293b' }}>July 2026 Supplementary Calendar Blocks</h2>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Select from active daily evaluation timelines below.</p>
              </div>
              <div style={{ backgroundColor: '#f8fafc', textAlign: 'right', padding: '6px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <p style={{ margin: 0, fontSize: '9px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>Registration Window</p>
                <p style={{ margin: 0, fontSize: '10px', fontFamily: 'monospace', color: '#334155', fontWeight: '700' }}>03 July – 10 July 2026</p>
              </div>
            </div>

            {/* Timetable Grids Divided by Weeks */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Week 1 */}
              <div>
                <p style={{ margin: '0 0 8px 0', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8' }}>Block Week 1 (13 July - 16 July)</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  {slots.slice(0, 4).map((slot) => {
                    const isSelected = selectedDate === slot.date;
                    return (
                      <button
                        key={slot.date} type="button"
                        onClick={() => { setSelectedDate(slot.date); setSelectedTime(''); }}
                        style={{
                          padding: '12px 6px', borderRadius: '8px', border: isSelected ? '1px solid #0f172a' : '1px solid #e2e8f0',
                          textAlign: 'center', cursor: 'pointer', backgroundColor: isSelected ? '#0f172a' : '#f8fafc',
                          color: isSelected ? '#ffffff' : '#334155', fontWeight: isSelected ? '700' : '600'
                        }}
                      >
                        <p style={{ margin: 0, fontSize: '11px', fontFamily: 'monospace' }}>{slot.date.substring(5)}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Week 2 */}
              <div>
                <p style={{ margin: '0 0 8px 0', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8' }}>Block Week 2 (20 July - 23 July)</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  {slots.slice(4, 8).map((slot) => {
                    const isSelected = selectedDate === slot.date;
                    return (
                      <button
                        key={slot.date} type="button"
                        onClick={() => { setSelectedDate(slot.date); setSelectedTime(''); }}
                        style={{
                          padding: '12px 6px', borderRadius: '8px', border: isSelected ? '1px solid #0f172a' : '1px solid #e2e8f0',
                          textAlign: 'center', cursor: 'pointer', backgroundColor: isSelected ? '#0f172a' : '#f8fafc',
                          color: isSelected ? '#ffffff' : '#334155', fontWeight: isSelected ? '700' : '600'
                        }}
                      >
                        <p style={{ margin: 0, fontSize: '11px', fontFamily: 'monospace' }}>{slot.date.substring(5)}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Week 3 */}
              <div>
                <p style={{ margin: '0 0 8px 0', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8' }}>Block Week 3 (27 July - 30 July)</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  {slots.slice(8, 12).map((slot) => {
                    const isSelected = selectedDate === slot.date;
                    return (
                      <button
                        key={slot.date} type="button"
                        onClick={() => { setSelectedDate(slot.date); setSelectedTime(''); }}
                        style={{
                          padding: '12px 6px', borderRadius: '8px', border: isSelected ? '1px solid #0f172a' : '1px solid #e2e8f0',
                          textAlign: 'center', cursor: 'pointer', backgroundColor: isSelected ? '#0f172a' : '#f8fafc',
                          color: isSelected ? '#ffffff' : '#334155', fontWeight: isSelected ? '700' : '600'
                        }}
                      >
                        <p style={{ margin: 0, fontSize: '11px', fontFamily: 'monospace' }}>{slot.date.substring(5)}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Time Segments */}
            {selectedDate && (
              <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #f1f5f9' }}>
                <p style={{ margin: '0 0 8px 0', fontSize: '10px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Available Daily Work-Hour Segments:</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {slots.find(s => s.date === selectedDate)?.times.map((time) => {
                    const isSelected = selectedTime === time;
                    return (
                      <button
                        key={time} type="button"
                        onClick={() => setSelectedTime(time)}
                        style={{
                          padding: '8px 16px', fontSize: '12px', borderRadius: '8px', cursor: 'pointer',
                          border: isSelected ? '1px solid #f59e0b' : '1px solid #e2e8f0',
                          backgroundColor: isSelected ? '#f59e0b' : '#ffffff',
                          color: isSelected ? '#ffffff' : '#475569',
                          fontWeight: '700', fontFamily: 'monospace'
                        }}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Workflow Confirmation Drawer */}
            {selectedExam && selectedDate && selectedTime && (
              <div style={{
                marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e2e8f0',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px dashed #cbd5e1'
              }}>
                <div style={{ fontSize: '12px', color: '#334155' }}>
                  <p style={{ margin: 0 }}>Staging: <strong style={{ color: '#0f172a' }}>{selectedExam.name}</strong></p>
                  <p style={{ margin: '2px 0 0 0' }}>Target: <span style={{ fontFamily: 'monospace', fontWeight: '700', color: '#0f172a' }}>{selectedDate}</span> at <span style={{ fontFamily: 'monospace', fontWeight: '700', color: '#0f172a' }}>{selectedTime}</span></p>
                </div>
                <button
                  onClick={handleConfirmBooking} disabled={loading}
                  style={{
                    padding: '10px 20px', backgroundColor: '#f59e0b', color: '#0f172a',
                    fontWeight: '900', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em',
                    border: 'none', borderRadius: '8px', shadow: '0 2px 4px rgba(0,0,0,0.1)',
                    cursor: 'pointer', opacity: loading ? 0.6 : 1
                  }}
                >
                  {loading ? 'Routing Parameters...' : 'Issue Conditional Seat'}
                </button>
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}