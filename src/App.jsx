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
  
  // Rescheduling/Editing Mode Tracking States
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [targetRescheduleBookingId, setTargetRescheduleBookingId] = useState(null);

  // 💬 Live Support Widget Injection (Tawk.to)
  useEffect(() => {
    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();
    
    const s1 = document.createElement("script");
    const s0 = document.getElementsByTagName("script")[0];
    
    s1.async = true;
    s1.src = 'https://embed.tawk.to/6a2eaa41ccc4ac1d4891bb53/1jr34i4ss';
    s1.charset = 'UTF-8';
    s1.setAttribute('crossorigin', '*');
    
    if (s0 && s0.parentNode) {
      s0.parentNode.insertBefore(s1, s0);
    } else {
      document.head.appendChild(s1);
    }

    // Optional: Clean up widget footprint if the parent logs out or the component unmounts
    return () => {
      if (window.Tawk_API && typeof window.Tawk_API.hideWidget === 'function') {
        try {
          window.Tawk_API.hideWidget();
        } catch (e) {
          console.log("Widget cleanup skipped.");
        }
      }
    };
  }, []);

  // Fetch slot matrix on authentication
  useEffect(() => {
    if (user) {
      apiService.getSlots()
        .then(data => setSlots(data))
        .catch(err => setErrorMessage('Could not load scheduling calendar matrix.'));
    }
  }, [user]);

  // Helper to format timestamps into clean, authoritative institutional reference codes
  const generateTicketSerial = (bookingId, examId) => {
    if (!bookingId) return `API-SUP-26-UNKNOWN`;
    const cleanStamp = bookingId.split('-').pop() || Date.now().toString();
    const shortHash = cleanStamp.slice(-5);
    return `API-${examId}-${shortHash}`.toUpperCase();
  };

  const handleConfirmBooking = async () => {
    if (!selectedExam || !selectedDate || !selectedTime) {
      setErrorMessage('Please select a module, date, and time slot.');
      return;
    }

    setErrorMessage('');
    setBookingMessage('');
    setLoading(true);

    try {
      const examPayloadId = selectedExam.examId || selectedExam.id;

      const result = await apiService.reserveSlot({
        studentNo: user.studentNo,
        examId: examPayloadId,
        date: selectedDate,
        time: selectedTime
      });

      // Update user state with fresh payload containing full history array from server
      setUser(result.updatedStudent);
      setBookingMessage(isRescheduling ? 'Evaluation timeline shifted successfully!' : result.message);
      
      // Auto-focus the latest booking voucher invoice
      const updatedBookings = result.updatedStudent.bookings;
      const matchingBooking = updatedBookings.find(b => b.examId === examPayloadId) || updatedBookings[updatedBookings.length - 1];
      setActiveInvoice(matchingBooking);

      // Clean up workflow state loops
      setSelectedExam(null);
      setSelectedDate('');
      setSelectedTime('');
      setIsRescheduling(false);
      setTargetRescheduleBookingId(null);
    } catch (err) {
      setErrorMessage(err.message || 'System failed to commit allocation changes.');
    } finally {
      setLoading(false);
    }
  };

  const initiateReschedule = (booking) => {
    setSelectedExam({
      id: booking.examId,
      examId: booking.examId,
      name: booking.examName,
      fee: booking.fee
    });
    setSelectedDate(booking.date);
    setSelectedTime(booking.time);
    setIsRescheduling(true);
    setTargetRescheduleBookingId(booking.id);
    setActiveInvoice(booking); 
    
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const cancelRescheduleWorkflow = () => {
    setSelectedExam(null);
    setSelectedDate('');
    setSelectedTime('');
    setIsRescheduling(false);
    setTargetRescheduleBookingId(null);
  };

  if (!user) {
    return <Login onAuthSuccess={(studentData) => setUser(studentData)} />;
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      backgroundImage: 'radial-gradient(#cbd5e1 1.2px, transparent 1.2px), radial-gradient(#cbd5e1 1.2px, #f8fafc 1.2px)',
      backgroundSize: '24px 24px',
      backgroundPosition: '0 0, 12px 12px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#0f172a',
      paddingBottom: '64px',
      boxSizing: 'border-box'
    }}>
      
      {/* 🏛️ Executive Brand Navigation Header */}
      <header style={{
        backgroundColor: '#0f172a',
        color: '#ffffff',
        padding: '18px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.05)',
        borderBottom: '4px solid #d97706'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '900', letterSpacing: '0.05em', color: '#f59e0b' }}>
            AZANIA PARAGON INSTITUTE
          </h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '10px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
            Official Supplementary Allocation Desk • 2026
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ textAlign: 'right', borderRight: '2px solid #334155', paddingRight: '16px' }}>
            <p style={{ margin: 0, fontWeight: '700', fontSize: '14px', color: '#f8fafc' }}>{user.name}</p>
            <p style={{ margin: '2px 0 0 0', fontSize: '11px', fontFamily: 'monospace', color: '#fbbf24', fontWeight: '700' }}>{user.studentNo}</p>
          </div>
          <button 
            onClick={() => setUser(null)}
            style={{
              padding: '8px 14px',
              backgroundColor: 'transparent',
              color: '#94a3b8',
              border: '1px solid #334155',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
          >
            Exit Hub
          </button>
        </div>
      </header>

      {/* 🎛️ Primary Portal Dashboard Split-Grid Workspace */}
      <main style={{
        maxWidth: '1280px',
        margin: '32px auto 0 auto',
        padding: '0 24px',
        display: 'grid',
        gridTemplateColumns: '1.1fr 1.9fr',
        gap: '32px',
        boxSizing: 'border-box'
      }}>
        
        {/* ======================================================================= */}
        {/* LEFT COLUMN PANEL: Paper Inventories & Operational Controls */}
        {/* ======================================================================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Component Card: Available Roster Modules */}
          <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(15,23,42,0.04)', border: '1px solid #e2e8f0' }}>
            <h2 style={{ margin: '0 0 14px 0', fontSize: '13px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
              Pending Supplementary Invoices
            </h2>
            
            {user.missedExams.length === 0 ? (
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '18px' }}>✓</span>
                <p style={{ margin: 0, fontSize: '12.5px', color: '#166534', fontWeight: '600', lineHeight: '1.5' }}>
                  All cohort modules cleared. No pending outstanding registrations remaining for this profile template.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {user.missedExams.map((exam) => {
                  const isSelected = selectedExam?.id === exam.id && !isRescheduling;
                  return (
                    <button
                      key={exam.id}
                      onClick={() => { 
                        cancelRescheduleWorkflow();
                        setSelectedExam(exam); 
                        setBookingMessage(''); 
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '14px',
                        borderRadius: '12px',
                        border: isSelected ? '2px solid #d97706' : '1px solid #e2e8f0',
                        backgroundColor: isSelected ? '#fffbeb' : '#ffffff',
                        cursor: 'pointer',
                        boxShadow: isSelected ? '0 4px 12px rgba(217,119,6,0.06)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span style={{ display: 'block', fontSize: '10px', fontFamily: 'monospace', color: '#94a3b8', fontWeight: '600', marginBottom: '4px' }}>{exam.id}</span>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                          {exam.name.replace(/SDG P\d - /, '')}
                        </span>
                        <span style={{ fontSize: '12px', backgroundColor: '#0f172a', color: '#fbbf24', padding: '3px 8px', borderRadius: '6px', fontFamily: 'monospace', fontWeight: '800' }}>
                          R{exam.fee}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Component Card: Institutional Entry Voucher Grid (Dynamic Ticket Stack) */}
          <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(15,23,42,0.04)', border: '1px solid #e2e8f0' }}>
            <h2 style={{ margin: '0 0 14px 0', fontSize: '13px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
              Issued Entry Slips ({user.bookings.length})
            </h2>
            
            {user.bookings.length === 0 ? (
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b', fontStyle: 'italic', padding: '12px 0', textAlign: 'center' }}>
                No active session parameters found on roster database.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {user.bookings.map((booking) => {
                  const ticketCode = generateTicketSerial(booking.id, booking.examId);
                  
                  return (
                    <div 
                      key={booking.id} 
                      style={{ 
                        border: activeInvoice?.id === booking.id ? '2px solid #0f172a' : '1px solid #e2e8f0', 
                        borderRadius: '14px', 
                        backgroundColor: '#ffffff', 
                        overflow: 'hidden',
                        boxShadow: '0 4px 10px -1px rgba(0,0,0,0.02)'
                      }}
                    >
                      {/* Ticket Stub Header */}
                      <div style={{ backgroundColor: '#f8fafc', padding: '12px 14px', borderBottom: '1px dashed #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>VOUCHER REFERENCE</span>
                          <p style={{ margin: 0, fontSize: '13px', fontFamily: 'monospace', fontWeight: '900', color: '#d97706' }}>{ticketCode}</p>
                        </div>
                        <span style={{ fontSize: '10px', color: '#047857', backgroundColor: '#d1fae5', padding: '2px 8px', borderRadius: '20px', fontWeight: '700' }}>
                          ISSUED
                        </span>
                      </div>

                      {/* Ticket Main Details */}
                      <div style={{ padding: '14px' }}>
                        <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>{booking.examName}</h4>
                        <p style={{ margin: '0 0 10px 0', fontSize: '12.5px', color: '#475569' }}>
                          📅 <strong>{booking.date}</strong> &nbsp;|&nbsp; ⏰ <strong>{booking.time}</strong>
                        </p>
                        
                        {/* Interactive Edit Actions Block */}
                        <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '10px', marginTop: '6px' }}>
                          <button
                            onClick={() => setActiveInvoice(booking)}
                            style={{ flex: 1, padding: '6px', fontSize: '11px', fontWeight: '700', borderRadius: '6px', backgroundColor: '#f1f5f9', border: 'none', color: '#1e293b', cursor: 'pointer' }}
                          >
                            View Receipt Info
                          </button>
                          <button
                            onClick={() => initiateReschedule(booking)}
                            style={{ padding: '6px 12px', fontSize: '11px', fontWeight: '700', borderRadius: '6px', backgroundColor: '#fffbeb', border: '1px solid #fef08a', color: '#b45309', cursor: 'pointer' }}
                          >
                            ✏️ Shift Date
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ======================================================================= */}
        {/* RIGHT COLUMN PANEL: Active Desk Matrix & Real-time EFT Assurances */}
        {/* ======================================================================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Toast Messaging Banners */}
          {bookingMessage && (
            <div style={{ backgroundColor: '#ecfdf5', borderLeft: '5px solid #10b981', padding: '16px', fontSize: '13px', color: '#065f46', borderRadius: '8px', fontWeight: '600', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
              🎉 System Note: {bookingMessage}
            </div>
          )}
          {errorMessage && (
            <div style={{ backgroundColor: '#fef2f2', borderLeft: '5px solid #ef4444', padding: '16px', fontSize: '13px', color: '#991b1b', borderRadius: '8px', fontWeight: '600', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
              ⚠️ Operational Error: {errorMessage}
            </div>
          )}

          {/* Core Widget: Mandated EFT Information Frame */}
          {activeInvoice && (
            <div style={{ 
              backgroundColor: '#fffbeb', 
              border: '2px dashed #f59e0b', 
              padding: '24px', 
              borderRadius: '16px', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '14px', 
              boxShadow: '0 10px 15px -3px rgba(217,119,6,0.04)' 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #fde68a', paddingBottom: '12px' }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '10px', color: '#b45309', fontWeight: '800', letterSpacing: '0.05em' }}>OFFICIAL VERIFICATION GATEWAY</span>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '900', color: '#78350f', textTransform: 'uppercase' }}>Direct Banking Directive</h3>
                </div>
                <button 
                  onClick={() => setActiveInvoice(null)} 
                  style={{ fontSize: '11px', backgroundColor: '#fde68a', border: 'none', color: '#78350f', padding: '6px 12px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}
                >
                  Dismiss Overlay
                </button>
              </div>
              
              <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: '1.6' }}>
                A conditional seat has been logged under profile assignment for <strong style={{ color: '#0f172a' }}>{activeInvoice.examName}</strong>. 
                Learners must bring an electronic or physical copy of this mandate along with bank-issued proof of transaction reference:
              </p>

              {/* Secure Banking Parameters Display Card */}
              <div style={{ backgroundColor: '#ffffff', padding: '18px', borderRadius: '12px', border: '1px solid #fde68a', fontFamily: 'monospace', fontSize: '12.5px', display: 'flex', flexDirection: 'column', gap: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <p style={{ margin: 0 }}><span style={{ color: '#94a3b8' }}>BANK ENTITY:</span> <span style={{ fontWeight: '700', color: '#334155' }}>GoTyme (formerly TymeBank)</span></p>
                <p style={{ margin: 0 }}><span style={{ color: '#94a3b8' }}>ACCOUNT NO:</span> <span style={{ fontWeight: '800', color: '#0f172a', fontSize: '14px' }}>53000601847</span></p>
                <p style={{ margin: 0 }}><span style={{ color: '#94a3b8' }}>HOLDER NAME:</span> <span style={{ fontWeight: '700', color: '#334155' }}>AZANIA PARAGON INSTITUTE</span></p>
                <p style={{ margin: 0 }}><span style={{ color: '#94a3b8' }}>ROUTING CODE:</span> <span style={{ fontWeight: '700', color: '#334155' }}>678910</span></p>
                
                <div style={{ margin: '8px 0 4px 0', paddingTop: '10px', borderTop: '1px dashed #e2e8f0' }}>
                  <span style={{ color: '#b45309', fontWeight: '800', fontSize: '11px' }}>REQUIRED STATEMENT REFERENCE MASK:</span> <br />
                  <span style={{ display: 'inline-block', marginTop: '6px', backgroundColor: '#0f172a', color: '#fbbf24', padding: '6px 12px', borderRadius: '6px', fontWeight: '900', fontSize: '13px', letterSpacing: '0.05em' }}>
                    SUPP EXAM {user.studentNo}
                  </span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '12px' }}>
                  <p style={{ margin: 0 }}><span style={{ color: '#94a3b8' }}>AMOUNT DUE:</span> <strong style={{ color: '#0f172a' }}>R{activeInvoice.fee}.00</strong></p>
                  <p style={{ margin: 0 }}><span style={{ color: '#b91c1c' }}>VALID UNTIL:</span> <strong style={{ color: '#b91c1c' }}>{activeInvoice.expiresAt}</strong></p>
                </div>
              </div>
            </div>
          )}

          {/* Master Operations Control Room Widget */}
          <div style={{ backgroundColor: '#ffffff', padding: '28px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(15,23,42,0.04)', border: '1px solid #e2e8f0' }}>
            
            {/* Header Tracking Content Status Toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '18px', marginBottom: '24px' }}>
              <div>
                <span style={{ display: 'inline-block', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '800', backgroundColor: isRescheduling ? '#fffbeb' : '#f1f5f9', color: isRescheduling ? '#b45309' : '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>
                  {isRescheduling ? '⚙️ Rescheduling Configuration Panel' : '⚡ Direct Scheduling Engine'}
                </span>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#0f172a' }}>
                  {selectedExam ? `Parameters for: ${selectedExam.name.replace(/SDG P\d - /, '')}` : 'Select a Paper Component to Begin'}
                </h2>
              </div>
              
              {isRescheduling && (
                <button 
                  onClick={cancelRescheduleWorkflow}
                  style={{ fontSize: '11px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#64748b', padding: '6px 10px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}
                >
                  Cancel Shift
                </button>
              )}
            </div>

            {selectedExam ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Steps Navigation Form Box: Select Evaluation Date */}
                <div>
                  <p style={{ margin: '0 0 10px 0', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569' }}>
                    Step 1: Assign Evaluation Calendar Date
                  </p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    
                    {/* Week 1 Block Row */}
                    <div>
                      <span style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>Block Week 1 (13 July - 16 July)</span>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                        {slots.slice(0, 4).map((slot) => {
                          const match = selectedDate === slot.date;
                          return (
                            <button
                              key={slot.date} type="button"
                              onClick={() => { setSelectedDate(slot.date); setSelectedTime(''); }}
                              style={{ padding: '12px 4px', borderRadius: '8px', border: match ? '1px solid #0f172a' : '1px solid #e2e8f0', textAlign: 'center', cursor: 'pointer', backgroundColor: match ? '#0f172a' : '#f8fafc', color: match ? '#ffffff' : '#334155', fontWeight: match ? '700' : '600', fontSize: '12px', fontFamily: 'monospace' }}
                            >
                              {slot.date.substring(5)}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Week 2 Block Row */}
                    <div>
                      <span style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>Block Week 2 (20 July - 23 July)</span>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                        {slots.slice(4, 8).map((slot) => {
                          const match = selectedDate === slot.date;
                          return (
                            <button
                              key={slot.date} type="button"
                              onClick={() => { setSelectedDate(slot.date); setSelectedTime(''); }}
                              style={{ padding: '12px 4px', borderRadius: '8px', border: match ? '1px solid #0f172a' : '1px solid #e2e8f0', textAlign: 'center', cursor: 'pointer', backgroundColor: match ? '#0f172a' : '#f8fafc', color: match ? '#ffffff' : '#334155', fontWeight: match ? '700' : '600', fontSize: '12px', fontFamily: 'monospace' }}
                            >
                              {slot.date.substring(5)}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Week 3 Block Row */}
                    <div>
                      <span style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>Block Week 3 (27 July - 30 July)</span>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                        {slots.slice(8, 12).map((slot) => {
                          const match = selectedDate === slot.date;
                          return (
                            <button
                              key={slot.date} type="button"
                              onClick={() => { setSelectedDate(slot.date); setSelectedTime(''); }}
                              style={{ padding: '12px 4px', borderRadius: '8px', border: match ? '1px solid #0f172a' : '1px solid #e2e8f0', textAlign: 'center', cursor: 'pointer', backgroundColor: match ? '#0f172a' : '#f8fafc', color: match ? '#ffffff' : '#334155', fontWeight: match ? '700' : '600', fontSize: '12px', fontFamily: 'monospace' }}
                            >
                              {slot.date.substring(5)}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                </div>

                {/* Steps Navigation Form Box: Pick Hourly Segments */}
                {selectedDate && (
                  <div style={{ marginTop: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '18px' }}>
                    <p style={{ margin: '0 0 10px 0', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569' }}>
                      Step 2: Assign Session Work-Hour Segment
                    </p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      {slots.find(s => s.date === selectedDate)?.times.map((time) => {
                        const match = selectedTime === time;
                        return (
                          <button
                            key={time} type="button"
                            onClick={() => setSelectedTime(time)}
                            style={{
                              padding: '10px 18px', fontSize: '12px', borderRadius: '8px', cursor: 'pointer',
                              border: match ? '1px solid #d97706' : '1px solid #e2e8f0',
                              backgroundColor: match ? '#d97706' : '#ffffff',
                              color: match ? '#ffffff' : '#475569',
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

                {/* Workflow Execution Gate Layout */}
                {selectedDate && selectedTime && (
                  <div style={{
                    marginTop: '16px', paddingTop: '20px', borderTop: '1px dashed #cbd5e1',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px dashed #cbd5e1'
                  }}>
                    <div style={{ fontSize: '12.5px', color: '#334155' }}>
                      <p style={{ margin: 0, color: '#64748b' }}>Staging target configuration:</p>
                      <p style={{ margin: '3px 0 0 0', fontWeight: '700', color: '#0f172a' }}>
                        📅 {selectedDate} @ {selectedTime}
                      </p>
                    </div>
                    <button
                      onClick={handleConfirmBooking} disabled={loading}
                      style={{
                        padding: '12px 24px', backgroundColor: '#d97706', color: '#ffffff',
                        fontWeight: '800', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em',
                        border: 'none', borderRadius: '8px', cursor: 'pointer',
                        boxShadow: '0 4px 10px rgba(217,119,6,0.2)', opacity: loading ? 0.6 : 1
                      }}
                    >
                      {loading ? 'Processing Transaction...' : isRescheduling ? 'Authorize Shift Change' : 'Confirm Allocation Seat'}
                    </button>
                  </div>
                )}

              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px', border: '2px dashed #cbd5e1', borderRadius: '12px', backgroundColor: '#fafafa' }}>
                <p style={{ margin: 0, fontSize: '13.5px', color: '#64748b', fontWeight: '500' }}>
                  Please interact with the outstanding list or select an active entry voucher ticket stub on the left column to modify details.
                </p>
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}