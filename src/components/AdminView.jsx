function AdminView({ setView, seats, setSeats }) {
  const { useState } = React;
  const [searchTerm, setSearchTerm] = useState('');
  
  // 변경된 데이터를 추적하기 위한 상태
  const [editedData, setEditedData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // 💡 window.SEAT_DATA 제거, DB에서 불러온 seats 배열 사용
  const combinedSeats = Object.values(seats).map(s => ({ ...s, ...(editedData[s.id] || {}) }));
  const filtered = combinedSeats.filter(s => (s.name||'').includes(searchTerm) || (s.team||'').includes(searchTerm) || (s.id||'').includes(searchTerm));

  // 입력 변경 시 editedData와 전역 seats 둘 다 업데이트 (실시간 UI 반영을 위해)
  const handleUpdate = (id, field, value) => {
    // 1. 저장용 변경 데이터 기록
    setEditedData(prev => ({
      ...prev,
      [id]: { ...(prev[id] || {}), [field]: value }
    }));
    
    // 2. 화면 즉시 반영을 위한 전역 상태 업데이트
    setSeats(prev => ({
      ...prev,
      [id]: { ...(prev[id] || {}), [field]: value }
    }));
  };

  // 💡 [NEW] 변경된 정보 DB 일괄 저장 로직
  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const updates = Object.entries(editedData).map(([id, data]) => 
        window.api.updateSeatData(id, data) // 이름, 팀 등 변경된 필드만 전송
      );
      
      await Promise.all(updates);
      alert('직원 정보가 성공적으로 업데이트되었습니다.');
      setEditedData({}); // 저장 후 변경 내역 초기화
    } catch (error) {
      alert('저장 중 오류가 발생했습니다: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const hasEdits = Object.keys(editedData).length > 0;

  return (
    <div className="h-full flex flex-col bg-[#1A202C] text-white animate-in fade-in relative">
      <div className="flex items-center gap-4 p-6 bg-gray-900 border-b border-gray-800 shadow-md">
        <button onClick={() => setView('home')} className="bg-gray-700 hover:bg-gray-600 text-white w-12 h-12 rounded-xl font-black text-xl shadow-md flex items-center justify-center">🔙</button>
        <div className="flex-1">
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">⚙️ 오피스 관리자 모드</h2>
          <p className="text-gray-400 text-sm mt-1">이름, 부서를 수정하면 지도에 실시간으로 반영됩니다.</p>
        </div>
      </div>

      <div className="p-4 border-b border-gray-800">
         <input type="text" placeholder="이름/팀/내선번호 검색..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} className="w-full p-4 bg-gray-800 rounded-xl border border-gray-700 focus:outline-none focus:border-orange-500 font-bold"/>
      </div>

      {/* 👑 [NEW] DB 저장 버튼 노출 (수정 사항이 있을 때만) */}
      {hasEdits && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom flex gap-3">
          <button 
            onClick={handleSaveAll}
            disabled={isSaving}
            className="bg-orange-500 hover:bg-orange-400 text-white px-8 py-3 rounded-2xl font-black shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-all"
          >
            {isSaving ? '⏳ DB에 저장 중...' : '💾 변경된 정보 일괄 저장'}
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-24">
         {filtered.map(seat => (
            <div key={seat.id} className={`p-5 rounded-2xl border flex flex-col gap-3 shadow-md transition-all ${editedData[seat.id] ? 'bg-orange-900/20 border-orange-500/50' : 'bg-gray-800 border-gray-700'}`}>
               <div className="flex items-center justify-between border-b border-gray-700 pb-2">
                 <span className="font-bold text-gray-400">내선: {seat.id}</span>
                 <span className="text-xs bg-gray-900 px-2 py-1 rounded text-gray-500">x:{seat.x} y:{seat.y}</span>
               </div>
               <div className="flex gap-3">
                 <div className="flex-1">
                    <label className="text-xs text-gray-400 font-bold mb-1 block">이름</label>
                    <input value={seat.name || ''} onChange={e=>handleUpdate(seat.id, 'name', e.target.value)} className="w-full bg-gray-900 border border-gray-600 focus:border-orange-500 outline-none rounded-lg p-2 text-sm text-white font-bold"/>
                 </div>
                 <div className="flex-1">
                    <label className="text-xs text-gray-400 font-bold mb-1 block">소속 팀</label>
                    <input value={seat.team || ''} onChange={e=>handleUpdate(seat.id, 'team', e.target.value)} className="w-full bg-gray-900 border border-gray-600 focus:border-orange-500 outline-none rounded-lg p-2 text-sm text-white font-bold"/>
                 </div>
               </div>
            </div>
         ))}
      </div>
    </div>
  );
}