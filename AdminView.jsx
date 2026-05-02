// AdminView.jsx 전체 코드

function AdminView({ setView, seats }) {
  const [requests, setRequests] = React.useState([]);

  const loadRequests = async () => {
    const data = await window.api.fetchRequests();
    setRequests(data);
  };

  React.useEffect(() => { loadRequests(); }, []);

  const handleAction = async (req, isApproved) => {
    if(!confirm(`${req.requester_name}님의 요청을 ${isApproved ? '승인' : '반려'}하시겠습니까?`)) return;
    await window.api.processRequest(req.id, req.seat_id, req.requester_name, isApproved);
    alert('처리되었습니다.');
    loadRequests();
  };

  // 💡 4번 기능: 통계 대시보드 계산 로직
  const totalSeats = 50;
  const seatsArray = Object.values(seats || {});
  const occupiedCount = seatsArray.filter(s => s.status === '근무중').length;
  const awayCount = seatsArray.filter(s => s.status === '자리비움').length;
  const vacationCount = seatsArray.filter(s => s.status === '휴가').length;
  const emptyCount = totalSeats - (occupiedCount + awayCount + vacationCount);

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white">
      <header className="p-4 border-b border-gray-800 flex justify-between items-center">
        <button onClick={() => setView('home')} className="p-2 text-gray-400 hover:text-white">← 뒤로</button>
        <h2 className="text-lg font-bold">오피스 관리자 센터</h2>
        <div className="w-8"></div>
      </header>
      
      <main className="flex-1 overflow-y-auto p-4 space-y-6">
        
        
        {/* 📊 4번 기능: 실시간 통계 대시보드 */}
        <section className="bg-gray-800 p-5 rounded-2xl border border-gray-700 shadow-lg">
          <h3 className="text-sm font-bold text-gray-400 mb-4">현재 오피스 현황 (총 {totalSeats}석)</h3>
          <div className="grid grid-cols-4 gap-2 mb-4">
            <div className="bg-gray-900 p-3 rounded-xl text-center border-b-2 border-green-500"><div className="text-2xl font-black text-green-500">{occupiedCount}</div><div className="text-[10px] text-gray-500 mt-1">근무중</div></div>
            <div className="bg-gray-900 p-3 rounded-xl text-center border-b-2 border-yellow-500"><div className="text-2xl font-black text-yellow-500">{awayCount}</div><div className="text-[10px] text-gray-500 mt-1">자리비움</div></div>
            <div className="bg-gray-900 p-3 rounded-xl text-center border-b-2 border-red-500"><div className="text-2xl font-black text-red-500">{vacationCount}</div><div className="text-[10px] text-gray-500 mt-1">휴가</div></div>
            <div className="bg-gray-900 p-3 rounded-xl text-center border-b-2 border-gray-500"><div className="text-2xl font-black text-gray-400">{emptyCount}</div><div className="text-[10px] text-gray-500 mt-1">공석</div></div>
          </div>
        </section>

        {/* 결재 요청 리스트 */}
        <section>
          <h3 className="text-sm font-bold text-gray-400 mb-4 flex justify-between">
            <span>자리 이동 요청 내역</span>
            <button onClick={loadRequests} className="text-xs bg-gray-700 px-2 py-1 rounded">새로고침</button>
          </h3>
          <div className="space-y-3">
            {requests.length === 0 && <p className="text-center text-gray-500 py-6 bg-gray-800/30 rounded-xl">대기 중인 요청이 없습니다.</p>}
            {requests.map(req => (
              <div key={req.id} className={`p-4 rounded-xl border ${req.status === 'pending' ? 'border-blue-500 bg-blue-500/10' : 'border-gray-800 bg-gray-800/50'}`}>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm font-bold">{req.requester_name} <span className="text-xs text-gray-400 font-normal">님의 요청</span></div>
                    <div className="text-blue-400 font-black mt-1">{req.seat_id}석으로 이동</div>
                  </div>
                  {req.status === 'pending' ? (
                    <div className="flex gap-2">
                      <button onClick={() => handleAction(req, true)} className="bg-green-600 px-3 py-2 rounded-lg text-xs font-bold shadow-lg">승인</button>
                      <button onClick={() => handleAction(req, false)} className="bg-gray-700 px-3 py-2 rounded-lg text-xs font-bold">반려</button>
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-gray-500">{req.status === 'approved' ? '승인됨' : '반려됨'}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}