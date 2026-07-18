function CalendarView({ setView, vacations, setVacations, seats, isAdmin, user }) {
  const { useState } = React;
  const [currentDate, setCurrentDate] = useState(new Date());

  // 💡 못생긴 알림창 대신 띄울 "예쁜 커스텀 모달" 상태 추가!
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, date: '' });
  const [modalEmp, setModalEmp] = useState('');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // 🖱️ 달력 날짜 클릭 시 실행 (커스텀 팝업 띄우기)
  const handleDateClick = (dateStr) => {
    if (!isAdmin && !user?.id) {
      return alert('사원번호로 접속하거나 관리자로 로그인해야 휴가를 등록할 수 있습니다.');
    }
    
    // 팝업 열기
    setConfirmModal({ isOpen: true, date: dateStr });
    // 일반 직원이면 본인 아이디 고정, 관리자면 선택할 수 있게 빈값
    setModalEmp(isAdmin ? '' : user?.id); 
  };

  // ✅ 팝업에서 [등록하기] 눌렀을 때 실제 DB에 저장하는 함수
  const executeAdd = async () => {
    const targetEmp = isAdmin ? modalEmp : user?.id;
    
    if (!targetEmp) return alert('등록할 대상자를 선택해주세요.');

    try {
      // 🚀 클릭한 날짜 하루를 바로 시작/종료일로 지정해서 초고속 등록
      await window.api.addVacation(targetEmp, confirmModal.date, confirmModal.date);
      const newData = await window.api.fetchVacations();
      setVacations(newData);
      
      // 모달 닫기
      setConfirmModal({ isOpen: false, date: '' });
    } catch (e) {
      alert('휴가 등록 실패: ' + e.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('이 휴가 일정을 삭제하시겠습니까?')) return;
    try {
      await window.api.deleteVacation(id);
      setVacations(prev => prev.filter(v => v.id !== id));
    } catch (e) {
      alert('삭제 오류: ' + e.message);
    }
  };

  return (
    <div className="absolute inset-0 bg-gray-900 overflow-y-auto p-4 z-50 animate-in fade-in">
      <div className="max-w-6xl mx-auto flex flex-col gap-6 mt-4 pb-10">
        
        <div className="flex items-center gap-4">
          <button onClick={() => setView('home')} className="bg-gray-700 text-white w-12 h-12 rounded-full font-bold text-xl flex items-center justify-center hover:bg-gray-600 transition-colors shadow-lg">🔙</button>
          <h2 className="text-3xl font-black text-white tracking-tight">📅 휴가 및 일정 관리표</h2>
          <p className="text-gray-400 text-sm ml-2 mt-2">※ 달력의 날짜를 클릭하면 휴가를 즉시 등록할 수 있습니다.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 bg-gray-800 p-6 rounded-3xl border border-gray-700 h-fit shadow-xl">
            <h3 className="text-lg font-bold mb-4 text-blue-400">📝 휴가 리스트</h3>
            <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-2">
              {vacations.length > 0 ? vacations.sort((a,b) => a.start_date.localeCompare(b.start_date)).map(vac => {
                const canDelete = isAdmin || vac.emp_id === user?.id;
                if (!isAdmin && vac.emp_id !== user?.id) return null;

                return (
                  <div key={vac.id} className="bg-gray-900 p-3.5 rounded-xl border border-gray-700 flex justify-between items-center group transition-colors hover:border-gray-500">
                    <div>
                      <p className="font-black text-sm text-white">{seats[vac.emp_id]?.name || vac.emp_id}</p>
                      <p className="text-xs text-blue-400 mt-1">{vac.start_date}</p>
                    </div>
                    {canDelete && (
                      <button onClick={() => handleDelete(vac.id)} className="text-red-400 bg-red-900/30 px-3 py-1.5 rounded-lg hover:bg-red-500 hover:text-white transition-all font-bold text-xs">삭제</button>
                    )}
                  </div>
                );
              }) : (
                <p className="text-xs text-gray-500 text-center py-4">등록된 일정이 없습니다.</p>
              )}
            </div>
          </div>

          <div className="lg:col-span-3 bg-gray-800 p-6 rounded-3xl border border-gray-700 shadow-xl">
            <div className="flex justify-between items-center mb-8">
              <button onClick={prevMonth} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-xl text-white font-bold transition-colors">◀ 이전달</button>
              <h3 className="text-2xl font-black text-white tracking-widest">{year}년 {month + 1}월</h3>
              <button onClick={nextMonth} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-xl text-white font-bold transition-colors">다음달 ▶</button>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-3">
              {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => (
                <div key={d} className={`text-center font-black text-sm pb-2 border-b border-gray-700 ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'}`}>{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="bg-gray-900/30 rounded-xl min-h-[100px]"></div>
              ))}
              
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const d = i + 1;
                const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
                const dayVacations = vacations.filter(v => v.start_date <= dateStr && v.end_date >= dateStr);
                const dayOfWeek = new Date(year, month, d).getDay();

                return (
                  <div 
                    key={d} 
                    onClick={() => handleDateClick(dateStr)}
                    className="bg-gray-900 rounded-xl border border-gray-700 min-h-[100px] p-2 flex flex-col gap-1.5 cursor-pointer hover:bg-gray-700 hover:scale-[1.02] hover:shadow-lg active:scale-95 transition-all"
                  >
                    <span className={`text-xs font-bold px-1 ${dayOfWeek === 0 ? 'text-red-400' : dayOfWeek === 6 ? 'text-blue-400' : 'text-gray-200'}`}>{d}</span>
                    <div className="flex flex-col gap-1 overflow-y-auto flex-1 pointer-events-none">
                      {dayVacations.map(v => (
                        <div key={v.id} className="bg-red-500/20 text-red-300 text-[10px] px-2 py-1 rounded-md border border-red-500/30 truncate font-bold">
                          🌴 {seats[v.emp_id]?.name || v.emp_id}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 🚀 예쁜 커스텀 휴가 등록 팝업창 */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[200] animate-in fade-in zoom-in duration-200 p-4">
          <div className="bg-gray-800 p-8 rounded-3xl border border-gray-700 shadow-2xl max-w-sm w-full flex flex-col items-center text-center">
            
            <div className="w-16 h-16 bg-blue-900/30 text-blue-400 rounded-full flex items-center justify-center text-3xl mb-4 shadow-inner">
              🌴
            </div>
            
            <h3 className="text-2xl font-black text-white mb-2">{confirmModal.date}</h3>
            
            {isAdmin ? (
              <p className="text-gray-400 mb-6 text-sm">해당 날짜에 휴가를 등록할<br/>직원이나 프리랜서를 선택하세요.</p>
            ) : (
              <p className="text-gray-400 mb-8 font-bold">해당 날짜에 휴가를 등록하시겠습니까?</p>
            )}

            {isAdmin && (
              <div className="w-full mb-8 text-left">
                <select value={modalEmp} onChange={e => setModalEmp(e.target.value)} className="w-full bg-gray-900 border border-gray-700 p-3.5 rounded-xl text-white outline-none focus:border-blue-500 text-sm font-bold shadow-inner">
                  <option value="">-- 대상자 선택 --</option>
                  {Object.values(seats).map(s => <option key={s.id} value={s.id}>{s.name} ({s.team})</option>)}
                </select>
              </div>
            )}

            <div className="flex gap-3 w-full">
              <button 
                onClick={() => setConfirmModal({isOpen: false, date: ''})} 
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3.5 rounded-xl transition-colors"
              >
                취소
              </button>
              <button 
                onClick={executeAdd} 
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-blue-900/50"
              >
                등록하기
              </button>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}