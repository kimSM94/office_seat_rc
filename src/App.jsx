const { useState, useEffect, useRef } = React;

function App() {
  const [user, setUser] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const empId = params.get('id');
    return { id: empId }; // URL에 파라미터가 없으면 undefined 상태
  });
  
  // 👑 관리자 권한 및 로딩 상태 추가
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [view, setView] = useState('home'); 
  const [seats, setSeats] = useState({});
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [highlightedSeatId, setHighlightedSeatId] = useState(null);
  
  const [customMessage, setCustomMessage] = useState('');
  const [secondBrainData, setSecondBrainData] = useState({});

  // 1️⃣ [NEW] 앱 실행 시 DB에서 좌석 데이터 불러오기
  useEffect(() => {
    const loadSeats = async () => {
      try {
        setIsLoading(true);
        const dataArray = await window.api.fetchSeats();
        
        // 배열 데이터를 기존 프론트엔드 구조인 객체(Dictionary) 형태로 변환
        const seatsObj = {};
        dataArray.forEach(seat => {
          seatsObj[seat.id] = seat;
        });
        
        setSeats(seatsObj);
      } catch (error) {
        console.error("좌석 데이터를 불러오는데 실패했습니다:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSeats();
  }, []);

  useEffect(() => {
    if (selectedSeat) {
      setCustomMessage(seats[selectedSeat.id]?.status_message || '');
    } else {
      setCustomMessage('');
    }
  }, [selectedSeat?.id, seats]);

  // 2️⃣ [NEW] 관리자 로그인 처리 로직
  const handleAdminLogin = (e) => {
    e.preventDefault();
    const id = e.target.adminId.value;
    const pw = e.target.adminPw.value;

    // TODO: 실제 서비스 시 DB 검증으로 변경하거나 비밀번호를 복잡하게 설정하세요.
    if (id === 'admin' && pw === 'admin1234') { 
      setIsAdmin(true);
      setShowAdminModal(false);
      alert('관리자 모드가 활성화되었습니다. 좌석 배치를 수정할 수 있습니다.');
    } else {
      alert('관리자 정보가 일치하지 않습니다.');
    }
  };

  const handleStatusChange = (id, newStatus) => {
    setSeats(prev => ({ ...prev, [id]: { ...(prev[id] || {}), status: newStatus, status_message: customMessage } }));
  };

  // 👑 관리자이거나 본인 자리일 때만 수정 가능하도록 조건 업데이트
  const isMySeat = selectedSeat?.id === user?.id || user?.id === 'admin' || isAdmin;

  return (
    <div className="h-full flex flex-col relative bg-gray-900 text-white min-h-screen">
      
      {/* 👑 우측 상단 숨겨진 관리자 진입 버튼 (다크 테마에 맞게 흐리게 배치) */}
      <button 
        onClick={() => setShowAdminModal(true)}
        className="absolute top-4 right-4 text-xs text-gray-600 hover:text-gray-400 z-40 transition-colors"
      >
        {isAdmin ? '👑 관리자 켜짐' : '⚙️ 관리자'}
      </button>

      {/* 로딩 중일 때 표시할 UI */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-400 animate-pulse font-bold">오피스 데이터를 불러오는 중입니다...</div>
        </div>
      ) : (
        <>
          {view === 'home' && <Home setView={setView} user={user} />}
          {/* Admin 권한을 자식 컴포넌트에 넘겨줍니다 */}
          {view === 'map' && <MapView setView={setView} seats={seats} setSelectedSeat={setSelectedSeat} highlightedSeatId={highlightedSeatId} isAdmin={isAdmin} />}
          {view === 'admin' && <AdminView setView={setView} seats={seats} setSeats={setSeats} isAdmin={isAdmin} />}
          {view === 'zone' && <ZoneView setView={setView} seats={seats} setHighlightedSeatId={setHighlightedSeatId} />}
        </>
      )}

      {/* 좌석 상세 정보 모달 (기존 코드와 동일) */}
      {selectedSeat && view === 'map' && (
        <div className="absolute inset-0 bg-black/80 flex items-end z-50 animate-in fade-in">
          <div className="w-full bg-gray-900 border-t border-gray-700 p-6 rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-black flex items-center gap-2">
                  {selectedSeat.name || '공석'} 
                  {selectedSeat.status && selectedSeat.status !== '공석' && (
                    <span className="text-xs bg-gray-800 px-2 py-1 rounded-full text-blue-400 font-normal border border-gray-700">{selectedSeat.status}</span>
                  )}
                </h3>
                <p className="text-gray-500 mt-1">{selectedSeat.id}석 · {selectedSeat.team}</p>
              </div>
              <button onClick={() => { setSelectedSeat(null); setHighlightedSeatId(null); }} className="text-2xl text-gray-500 hover:text-white p-2 bg-gray-800 rounded-full w-10 h-10 flex items-center justify-center">✕</button>
            </div>
            
            <div className="space-y-4">
              {(() => {
                const currentBrain = secondBrainData[selectedSeat.id] || { focus: '', todos: '', links: '' };
                const updateBrain = (field, value) => setSecondBrainData(prev => ({ ...prev, [selectedSeat.id]: { ...currentBrain, [field]: value } }));

                return (
                  <div className="bg-gray-800/60 p-5 rounded-2xl border border-gray-700 mb-6 shadow-inner">
                    <h4 className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-4 flex items-center gap-2">🧠 {selectedSeat.name}의 Second Brain</h4>
                    {isMySeat ? (
                      <div className="space-y-4">
                        <div><label className="text-xs font-bold text-gray-400 mb-1 block">🎯 오늘의 핵심 포커스</label><input type="text" className="w-full p-3 bg-gray-900 rounded-xl border border-gray-700 text-sm text-white focus:border-blue-500 outline-none" value={currentBrain.focus} onChange={(e) => updateBrain('focus', e.target.value)} /></div>
                        <div><label className="text-xs font-bold text-gray-400 mb-1 block">✅ 투두 리스트</label><input type="text" className="w-full p-3 bg-gray-900 rounded-xl border border-gray-700 text-sm text-white focus:border-blue-500 outline-none" value={currentBrain.todos} onChange={(e) => updateBrain('todos', e.target.value)} /></div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {currentBrain.focus && (<div><span className="text-xs text-gray-500 font-bold block mb-1">🎯 오늘의 포커스</span><p className="text-sm text-white bg-gray-900 p-3 rounded-xl border border-gray-700">{currentBrain.focus}</p></div>)}
                        {!currentBrain.focus && !currentBrain.todos && (<p className="text-sm text-gray-500 text-center py-4">아직 등록된 업무 정보가 없습니다.</p>)}
                      </div>
                    )}
                  </div>
                );
              })()}

              {isMySeat ? (
                <>
                  <div className="mb-4">
                    <input 
                      type="text" 
                      placeholder="현재 상태 메시지를 입력하세요" 
                      className="w-full p-3 bg-gray-800 rounded-xl border border-gray-700 text-sm focus:border-blue-500 focus:outline-none" 
                      value={customMessage} 
                      onChange={(e) => setCustomMessage(e.target.value)} 
                    />
                  </div>
                  
                  {(() => {
                    const currentStatus = seats[selectedSeat.id]?.status;

                    return (
                      <div className="grid grid-cols-3 gap-2 pb-4">
                        <button 
                          onClick={() => handleStatusChange(selectedSeat.id, '근무중')} 
                          className={`p-3 rounded-xl font-bold text-sm transition-all border ${
                            currentStatus === '근무중' 
                              ? 'bg-green-900/40 border-green-500 text-green-400 ring-2 ring-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.2)]' 
                              : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-green-500/50 hover:text-gray-200'
                          }`}
                        >
                          🟢 근무중
                        </button>
                        <button 
                          onClick={() => handleStatusChange(selectedSeat.id, '자리비움')} 
                          className={`p-3 rounded-xl font-bold text-sm transition-all border ${
                            currentStatus === '자리비움' 
                              ? 'bg-yellow-900/40 border-yellow-500 text-yellow-400 ring-2 ring-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.2)]' 
                              : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-yellow-500/50 hover:text-gray-200'
                          }`}
                        >
                          🟡 자리비움
                        </button>
                        <button 
                          onClick={() => handleStatusChange(selectedSeat.id, '휴가')} 
                          className={`p-3 rounded-xl font-bold text-sm transition-all border ${
                            currentStatus === '휴가' 
                              ? 'bg-red-900/40 border-red-500 text-red-400 ring-2 ring-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
                              : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-red-500/50 hover:text-gray-200'
                          }`}
                        >
                          🔴 휴가
                        </button>
                      </div>
                    );
                  })()}
                </>
              ) : (
                <div className="mt-2 p-4 bg-gray-800/30 rounded-xl border border-gray-700 text-center">
                  <p className="text-gray-400 text-sm">
                    {seats[selectedSeat.id]?.status_message 
                      ? `💬 ${seats[selectedSeat.id].status_message}` 
                      : "상태 메시지가 없습니다."}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">※ 본인의 좌석만 상태를 변경할 수 있습니다.</p>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* 3️⃣ [NEW] 관리자 로그인 모달 UI (다크 테마 적용) */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] animate-in fade-in">
          <form onSubmit={handleAdminLogin} className="bg-gray-800 border border-gray-700 p-8 rounded-3xl shadow-2xl w-80">
            <h2 className="text-xl font-bold mb-6 text-white text-center">⚙️ 관리자 로그인</h2>
            <input 
              type="text" 
              name="adminId" 
              placeholder="아이디" 
              className="w-full bg-gray-900 border border-gray-700 p-3 rounded-xl mb-3 text-white focus:border-blue-500 outline-none"
              required
            />
            <input 
              type="password" 
              name="adminPw" 
              placeholder="비밀번호" 
              className="w-full bg-gray-900 border border-gray-700 p-3 rounded-xl mb-6 text-white focus:border-blue-500 outline-none"
              required
            />
            <div className="flex gap-3">
              <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold transition-colors">로그인</button>
              <button type="button" onClick={() => setShowAdminModal(false)} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl transition-colors">취소</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);