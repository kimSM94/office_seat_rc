function CalendarView({ setView, vacations, setVacations, seats, isAdmin, user }) {
  const { useState } = React;
  const [currentDate, setCurrentDate] = useState(new Date());

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, date: '' });
  const [modalEmp, setModalEmp] = useState('');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const todayObj = new Date();
  const todayYear = todayObj.getFullYear();
  const todayMonth = todayObj.getMonth();
  const todayDate = todayObj.getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // 💡 [NEW] DB에 저장된 사번(또는 ID)으로 좌석 정보를 찾아오는 헬퍼 함수
  const getEmpInfo = (targetId) => {
    const seat = Object.values(seats).find(s => s.emp_id === targetId || s.id === targetId);
    return seat || { name: targetId, team: '팀 정보 없음' };
  };

  const handleDateClick = (dateStr) => {
    if (!isAdmin && !user?.id) {
      return alert('사원번호로 접속하거나 관리자로 로그인해야 휴가를 등록할 수 있습니다.');
    }
    setConfirmModal({ isOpen: true, date: dateStr });
    setModalEmp(isAdmin ? '' : user?.id); 
  };

  const executeAdd = async () => {
    const targetEmp = isAdmin ? modalEmp : user?.id;
    if (!targetEmp) return alert('등록할 대상자를 선택해주세요.');

    try {
      await window.api.addVacation(targetEmp, confirmModal.date, confirmModal.date);
      const newData = await window.api.fetchVacations();
      setVacations(newData);
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

  const currentMonthVacations = vacations.filter(v => {
    const vStart = new Date(v.start_date);
    const vEnd = new Date(v.end_date);
    const viewStart = new Date(year, month, 1);
    const viewEnd = new Date(year, month + 1, 0);
    return vStart <= viewEnd && vEnd >= viewStart;
  }).sort((a,b) => a.start_date.localeCompare(b.start_date));

  const getDayName = (dateStr) => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return days[new Date(dateStr).getDay()];
  };

  return (
    <div className="absolute inset-0 bg-[#121212] overflow-y-auto z-50 flex flex-col animate-in fade-in text-gray-100 font-sans">
      
      <div className="sticky top-0 z-10 bg-[#121212]/95 backdrop-blur-md flex items-center justify-center p-4 border-b border-gray-800">
        <button onClick={() => setView('home')} className="absolute left-4 p-2 text-2xl text-gray-400 hover:text-white transition-colors">‹</button>
        <h2 className="text-lg font-bold">휴가 및 일정</h2>
      </div>

      <div className="max-w-4xl mx-auto w-full flex flex-col flex-1 pb-10">
        <div className="flex items-center justify-center gap-12 py-6">
          <button onClick={prevMonth} className="text-blue-500 p-2 text-xl hover:bg-gray-800 rounded-full transition-colors">‹</button>
          <h3 className="text-[17px] text-blue-500 font-medium tracking-wide">{month + 1}월 {year}</h3>
          <button onClick={nextMonth} className="text-blue-500 p-2 text-xl hover:bg-gray-800 rounded-full transition-colors">›</button>
        </div>

        <div className="px-2">
          <div className="grid grid-cols-7 text-center text-xs font-medium text-gray-400 mb-4">
            <div className="text-red-400">일</div><div>월</div><div>화</div><div>수</div><div>목</div><div>금</div><div>토</div>
          </div>

          <div className="grid grid-cols-7 gap-y-6 mb-8">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[80px]"></div>
            ))}
            
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const d = i + 1;
              const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
              const dayVacations = vacations.filter(v => v.start_date <= dateStr && v.end_date >= dateStr);
              const dayOfWeek = new Date(year, month, d).getDay();
              const isToday = (year === todayYear && month === todayMonth && d === todayDate);

              return (
                <div key={d} onClick={() => handleDateClick(dateStr)} className="flex flex-col items-center min-h-[80px] cursor-pointer group">
                  <div className={`w-8 h-8 flex items-center justify-center text-[15px] rounded-full mb-1 transition-all ${
                    isToday ? 'bg-blue-600 text-white font-bold' : (dayOfWeek === 0 ? 'text-red-400' : 'text-gray-200 group-hover:bg-gray-800')
                  }`}>
                    {d}
                  </div>
                  
                  <div className="flex flex-col gap-[3px] w-full px-1 items-center pointer-events-none">
                    {dayVacations.slice(0, 4).map(v => {
                      const isMyVacation = v.emp_id === user?.id;
                      const empInfo = getEmpInfo(v.emp_id); // 💡 이름 매핑
                      return (
                        <div key={v.id} className={`w-full max-w-[50px] text-[9.5px] px-1 py-[3px] rounded-[4px] truncate text-center leading-none font-bold ${
                          isMyVacation ? 'bg-green-700 text-green-50' : 'bg-gray-700 text-gray-200'
                        }`}>
                          {empInfo.name}
                        </div>
                      )
                    })}
                    {dayVacations.length > 4 && <div className="text-[9px] text-gray-500 font-bold">+{dayVacations.length - 4}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex-1 bg-[#1A1A1A] border-t border-gray-800">
          {currentMonthVacations.length > 0 ? (
            <div className="flex flex-col">
              {currentMonthVacations.map(vac => {
                const canDelete = isAdmin || vac.emp_id === user?.id;
                const isMyVacation = vac.emp_id === user?.id;
                const dateArr = vac.start_date.split('-');
                const empInfo = getEmpInfo(vac.emp_id); // 💡 이름과 팀 매핑
                
                return (
                  <div key={vac.id} className="flex flex-col">
                    <div className="px-5 py-3 text-[13px] font-bold text-gray-400 bg-[#121212]">
                      {dateArr[1]}월 {dateArr[2]}일, {getDayName(vac.start_date)}
                    </div>
                    <div className="flex items-center px-5 py-4 bg-[#1A1A1A] group">
                      <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 text-lg mr-4 shrink-0">✈️</div>
                      <div className="flex-1">
                        <h4 className="text-[15px] text-gray-100 font-bold mb-0.5 flex items-center gap-2">
                          {empInfo.name}
                          {isMyVacation && <span className="text-[10px] bg-green-900/50 text-green-400 px-1.5 py-0.5 rounded">MY</span>}
                        </h4>
                        <p className="text-[13px] text-gray-400">{empInfo.team} / 휴가</p>
                      </div>
                      {canDelete && (
                        <button onClick={() => handleDelete(vac.id)} className="text-red-400 bg-red-900/20 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-900/40 transition-colors">삭제</button>
                      )}
                    </div>
                    <div className="ml-[72px] border-b border-gray-800"></div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500"><span className="text-4xl mb-3">📭</span><p className="text-sm">이번 달 등록된 휴가 일정이 없습니다.</p></div>
          )}
        </div>
      </div>

      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[200] animate-in fade-in zoom-in duration-200 p-4">
          <div className="bg-[#1C1C1E] p-8 rounded-[24px] border border-gray-800 shadow-2xl max-w-sm w-full flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-blue-900/20 text-blue-400 rounded-full flex items-center justify-center text-3xl mb-4">🗓️</div>
            <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">{confirmModal.date}</h3>
            {isAdmin ? (
              <p className="text-gray-400 mb-6 text-[13px]">해당 날짜에 휴가를 등록할<br/>직원이나 프리랜서를 선택하세요.</p>
            ) : (
              <p className="text-gray-300 mb-8 font-medium">이 날짜에 휴가를 등록하시겠습니까?</p>
            )}

            {isAdmin && (
              <div className="w-full mb-8 text-left">
                <select value={modalEmp} onChange={e => setModalEmp(e.target.value)} className="w-full bg-[#2C2C2E] border-none p-3.5 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium">
                  <option value="">-- 대상자 선택 --</option>
                  {/* 💡 [수정] 관리자가 등록할 때도 진짜 사번(emp_id)이 값으로 들어가게 수정 */}
                  {Object.values(seats).map(s => <option key={s.id} value={s.emp_id || s.id}>{s.name} ({s.team})</option>)}
                </select>
              </div>
            )}

            <div className="flex gap-3 w-full">
              <button onClick={() => setConfirmModal({isOpen: false, date: ''})} className="flex-1 bg-[#2C2C2E] hover:bg-[#3A3A3C] text-white font-bold py-3.5 rounded-xl transition-colors text-[15px]">취소</button>
              <button onClick={executeAdd} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-colors text-[15px]">등록하기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}