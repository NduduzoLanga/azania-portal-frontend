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
    <div className="min-h-screen bg-slate-100 font-sans pb-12">
      {/* Top Navigation Frame */}
      <header className="bg-slate-900 text-white shadow-lg px-6 py-4 flex justify-between items-center border-b-2 border-amber-500">
        <div>
          <h1 className="text-xl font-black tracking-tight tracking-wider text-amber-500">AZANIA PARAGON INSTITUTE</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cohort Sup-Registration System v2.6</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-sm text-slate-100">{user.name}</p>
          <p className="text-xs font-mono text-amber-400 font-bold">{user.studentNo}</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto mt-8 px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Hand Roster Panel */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-5 rounded-xl shadow-md border border-slate-200">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 border-b pb-2 text-slate-500">Unscheduled Papers</h2>
            
            {user.missedExams.length === 0 ? (
              <p className="text-xs text-emerald-700 bg-emerald-50 p-3 rounded-lg border border-emerald-200 font-medium">
                ✓ All cohort supplementary modules have been allocated time slots.
              </p>
            ) : (
              <div className="space-y-2">
                {user.missedExams.map((exam) => (
                  <button
                    key={exam.id}
                    onClick={() => { setSelectedExam(exam); setBookingMessage(''); }}
                    className={`w-full text-left p-3 rounded-lg border transition duration-150 cursor-pointer ${
                      selectedExam?.id === exam.id
                        ? 'border-amber-500 bg-amber-50/70 text-slate-900 font-bold shadow-sm'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <p className="text-xs font-mono text-slate-400 mb-0.5">{exam.id}</p>
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium truncate max-w-[180px]">{exam.name.replace(/SDG P\d - /, '')}</span>
                      <span className="text-xs bg-slate-800 text-amber-400 px-2 py-0.5 rounded font-mono font-bold">R{exam.fee}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Active Allocated Trackers */}
          <div className="bg-white p-5 rounded-xl shadow-md border border-slate-200">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 border-b pb-2 text-slate-500">Roster Seating Status</h2>
            {user.bookings.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">No active pending or paid allocations on file.</p>
            ) : (
              <div className="space-y-2">
                {user.bookings.map((booking) => (
                  <div key={booking.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1 hover:border-slate-300 transition">
                    <div className="flex justify-between font-bold text-slate-800">
                      <span className="truncate max-w-[150px]">{booking.examName}</span>
                      <button 
                        onClick={() => setActiveInvoice(booking)}
                        className="text-[10px] px-2 py-0.5 rounded bg-amber-100 border border-amber-200 text-amber-900 font-bold hover:bg-amber-200 transition cursor-pointer"
                      >
                        View EFT Info
                      </button>
                    </div>
                    <p className="text-slate-600 font-medium">📅 {booking.date} | ⏰ {booking.time}</p>
                    <div className="pt-1 flex justify-between items-center border-t border-dashed border-slate-200 mt-1">
                      <span className="text-[9px] text-slate-400 font-mono">Expires: {booking.expiresAt}</span>
                      <span className="font-bold text-amber-600 font-mono text-[10px]">R{booking.fee}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Hand Scheduling Core Matrix */}
        <div className="md:col-span-2 space-y-4">
          {bookingMessage && (
            <div className="bg-emerald-50 border-l-4 border-emerald-500 p-3 text-xs text-emerald-800 rounded shadow-sm">
              {bookingMessage}
            </div>
          )}
          {errorMessage && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 text-xs text-red-800 rounded shadow-sm">
              {errorMessage}
            </div>
          )}

          {/* Invoice Overlay Drawer if active */}
          {activeInvoice && (
            <div className="bg-amber-50 border-2 border-amber-400 p-5 rounded-xl shadow-inner space-y-3">
              <div className="flex justify-between items-center border-b border-amber-200 pb-2">
                <div>
                  <h3 className="text-sm font-black text-amber-900 uppercase tracking-wide">Direct EFT Payment Mandate</h3>
                  <p className="text-[10px] text-amber-800 font-mono">Invoice ID: {activeInvoice.id}</p>
                </div>
                <button onClick={() => setActiveInvoice(null)} className="text-xs bg-amber-200 hover:bg-amber-300 text-amber-900 px-2 py-1 rounded font-bold cursor-pointer">Hide Directive</button>
              </div>
              
              <p className="text-xs text-slate-700 leading-relaxed">
                A conditional seat has been reserved for <strong className="text-slate-900">{activeInvoice.examName}</strong> on <span className="font-bold text-slate-900">{activeInvoice.date} ({activeInvoice.time})</span>. To secure this seat, make an EFT payment before the 7-day expiry deadline (<strong className="text-red-700">{activeInvoice.expiresAt}</strong>).
              </p>

              <div className="bg-white p-4 rounded-lg border border-amber-200 font-mono text-xs space-y-1 shadow-sm">
                <p><span className="text-slate-400">BANK NAME:</span> <span className="font-bold text-slate-800">GoTyme (formerly TymeBank)</span></p>
                <p><span className="text-slate-400">ACCOUNT NO:</span> <span className="font-bold text-slate-800 text-sm">53000601847</span></p>
                <p><span className="text-slate-400">ACCOUNT NAME:</span> <span className="font-bold text-slate-800">AZANIA PARAGON INSTITUTE</span></p>
                <p><span className="text-slate-400">BRANCH CODE:</span> <span className="font-bold text-slate-800">678910</span></p>
                <p className="pt-2 border-t border-dashed mt-2"><span className="text-amber-600 font-bold">REQUIRED REFERENCE:</span> <span className="bg-slate-900 text-amber-400 px-2 py-1 rounded font-black text-sm tracking-wider">SUPP EXAM {user.studentNo}</span></p>
                <p><span className="text-slate-400">AMOUNT DUE:</span> <span className="font-bold text-slate-900">R{activeInvoice.fee}.00</span></p>
              </div>
              <p className="text-[10px] text-slate-500 italic">⚠️ Note: Email confirmation copy with these banking parameters has been transmitted to parent inbox address on file.</p>
            </div>
          )}

          <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
            <div className="flex justify-between items-start border-b pb-4 mb-6">
              <div>
                <h2 className="text-base font-black text-slate-800">July 2026 Supplementary Calendar Blocks</h2>
                <p className="text-xs text-slate-500 mt-0.5">Select from active daily evaluation timelines below.</p>
              </div>
              <div className="bg-slate-100 text-right px-3 py-1.5 rounded-lg border">
                <p className="text-[9px] font-bold text-slate-400 uppercase">Registration Window</p>
                <p className="text-[10px] font-mono text-slate-700 font-bold">03 July – 10 July 2026</p>
              </div>
            </div>

            {/* Timetable Grids Divided by Calendar Weeks */}
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Block Week 1 (13 July - 16 July)</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {slots.slice(0, 4).map((slot) => (
                    <button
                      key={slot.date} type="button"
                      onClick={() => { setSelectedDate(slot.date); setSelectedTime(''); }}
                      className={`p-3 rounded-lg border text-center transition cursor-pointer ${
                        selectedDate === slot.date ? 'border-slate-900 bg-slate-900 text-white font-bold shadow-sm' : 'border-slate-200 hover:bg-slate-50 text-slate-700 bg-slate-50/50'
                      }`}
                    >
                      <p className="text-[11px] font-mono font-semibold">{slot.date.substring(5)}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Block Week 2 (20 July - 23 July)</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {slots.slice(4, 8).map((slot) => (
                    <button
                      key={slot.date} type="button"
                      onClick={() => { setSelectedDate(slot.date); setSelectedTime(''); }}
                      className={`p-3 rounded-lg border text-center transition cursor-pointer ${
                        selectedDate === slot.date ? 'border-slate-900 bg-slate-900 text-white font-bold shadow-sm' : 'border-slate-200 hover:bg-slate-50 text-slate-700 bg-slate-50/50'
                      }`}
                    >
                      <p className="text-[11px] font-mono font-semibold">{slot.date.substring(5)}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Block Week 3 (27 July - 30 July)</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {slots.slice(8, 12).map((slot) => (
                    <button
                      key={slot.date} type="button"
                      onClick={() => { setSelectedDate(slot.date); setSelectedTime(''); }}
                      className={`p-3 rounded-lg border text-center transition cursor-pointer ${
                        selectedDate === slot.date ? 'border-slate-900 bg-slate-900 text-white font-bold shadow-sm' : 'border-slate-200 hover:bg-slate-50 text-slate-700 bg-slate-50/50'
                      }`}
                    >
                      <p className="text-[11px] font-mono font-semibold">{slot.date.substring(5)}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Time Window Selections */}
            {selectedDate && (
              <div className="mt-6 pt-6 border-t border-slate-100 space-y-2 animate-fadeIn">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Available Daily Work-Hour Segments:</p>
                <div className="flex gap-2">
                  {slots.find(s => s.date === selectedDate)?.times.map((time) => (
                    <button
                      key={time} type="button"
                      onClick={() => setSelectedTime(time)}
                      className={`px-4 py-2 text-xs rounded-lg border transition font-mono cursor-pointer ${
                        selectedTime === time ? 'border-amber-500 bg-amber-500 text-white font-bold shadow-sm' : 'border-slate-200 hover:bg-slate-100 bg-white text-slate-700'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Workflow Execution Bar */}
            {selectedExam && selectedDate && selectedTime && (
              <div className="mt-6 pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50 p-4 rounded-xl border border-dashed">
                <div className="text-xs text-slate-700 space-y-0.5 mb-3 sm:mb-0">
                  <p>Staging: <strong className="text-slate-900">{selectedExam.name}</strong></p>
                  <p>Target: <span className="font-mono text-slate-900 font-bold">{selectedDate}</span> at <span className="font-mono text-slate-900 font-bold">{selectedTime}</span></p>
                </div>
                <button
                  onClick={handleConfirmBooking} disabled={loading}
                  className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-lg shadow-md transition disabled:opacity-50 cursor-pointer"
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