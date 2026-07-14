const { useState, useEffect, useRef } = React;

function App() {
  const [user, setUser] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const empId = params.get('id');
    return { id: empId }; 
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

  // 👑 [NEW] 관리자 팝업창 내 이름/팀 수정용 상태
  const [editName, setEditName] = useState('');
  const [editTeam, setEditTeam] = useState('');
  const [isSavingInfo, setIsSavingInfo] = useState(false);

  useEffect(() => {
    const loadSeats = async () => {
      try {
        setIsLoading(true);
        const rawData = await window.api.fetchSeats();
        console.log("✅ DB에서 가져온 원본 데이터:", rawData); 
        
        let finalSeats = {};
        if (Array.isArray(rawData)) {
          rawData.forEach(seat => {
            finalSeats[seat.id] = { ...seat, x: Number(seat.x), y: Number(seat.y) };
          });
        } else {
          finalSeats = rawData;
        }
        setSeats(finalSeats);
      } catch (error) {
        console.error("좌석 데이터를 불러오는데 실패했습니다:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadSeats();
  }, []);

  // 팝업창 열릴 때 수정 폼 초기화
  useEffect(() => {
    if (selectedSeat) {
      setCustomMessage(seats[selectedSeat.id]?.status_message || '');
      setEditName(selectedSeat.name || '');
      setEditTeam(selectedSeat.team || '');
    } else {
      setCustomMessage('');
    }
  }, [selectedSeat?.id]); // 좌석이 바뀔 때만 실행되도록 수정

  const handleAdminLogin = (e) => {
    e.preventDefault();
    const id = e.target.adminId.value;
    const pw = e.target.adminPw.value;

    if (id === 'admin' && pw === 'admin1234') { 
      setIsAdmin(true);
      setShowAdminModal(false);
      alert('관리자 모드가 활성화되었습니다.');
    } else {
      alert('관리자 정보가 일치하지 않습니다.');
    }
  };

  const handleStatusChange = (id, newStatus) => {
    setSeats(prev => ({ ...prev, [id]: { ...(prev[id] || {}), status: newStatus, status_message: customMessage } }));
  };

  // 👑 [NEW] 팝업창에서 이름/팀 수정 후 DB에 저장하는 함수
  const handleUpdateSeatInfo = async () => {
    if (!selectedSeat) return;
    setIsSavingInfo(true);
    try {
      await window.api.updateSeatData(selectedSeat.id, { name: editName, team: editTeam });
      
      // 화면 즉시 반영
      setSeats(prev => ({
        ...prev,
        [selectedSeat.id]: { ...(prev[selectedSeat.id] || {}), name: editName, team: editTeam }
      }));
      setSelectedSeat(prev => ({ ...prev, name: editName, team: editTeam }));
      
      alert('이름과 팀 정보가 성공적으로 수정되었습니다!');
    } catch (error) {
      alert('수정 실패: ' + error.message);
    } finally {
      setIsSavingInfo(false);
    }
  };

  const isMySeat = selectedSeat?.id === user?.id || user?.id === 'admin' || isAdmin;

  return (
    <div className="h-full flex flex-col relative bg-gray-900 text-white min-h-screen">
      
      <button 
        onClick={() => {
          if (isAdmin) {
            setIsAdmin(false); // 켜져 있으면 끄기
            alert('관리자 모드가 종료되었습니다.');
          } else {
            setShowAdminModal(true); // 꺼져 있으면 로그인 창 띄우기
          }
        }}
        className={`absolute top-4 right-4 text-xs z-40 transition-colors px-3 py-1.5 rounded-lg border ${
          isAdmin 
            ? 'bg-gray-800 border-yellow-600/50 text-yellow-500 hover:bg-gray-700' 
            : 'border-transparent text-gray-500 hover:text-gray-300'
        }`}
      >
        {isAdmin ? '👑 관리자 끄기' : '⚙️ 관리자 로그인'}
      </button>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-400 animate-pulse font-bold">오피스 데이터를 불러오는 중입니다...</div>
        </div>
      ) : (
        <>
          {view === 'home' && <Home setView={setView} user={user} />}
          {view === 'map' && <MapView setView={setView} seats={seats} setSelectedSeat={setSelectedSeat} highlightedSeatId={highlightedSeatId} isAdmin={isAdmin} />}
          {view === 'admin' && <AdminView setView={setView} seats={seats} setSeats={setSeats} isAdmin={isAdmin} />}
          {view === 'zone' && <ZoneView setView={setView} seats={seats} setHighlightedSeatId={setHighlightedSeatId} />}
        </>
      )}

      {selectedSeat && view === 'map' && (
        <div className="absolute inset-0 bg-black/80 flex items-end z-50 animate-in fade-in">
          <div className="w-full bg-gray-900 border-t border-gray-700 p-6 rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto">
            
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1 mr-4">
                {/* 👑 [NEW] 관리자 권한에 따른 헤더 UI 분기 처리 */}
                {isAdmin ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <input 
                        type="text" 
                        value={editName} 
                        onChange={(e) => setEditName(e.target.value)} 
                        placeholder="이름"
                        className="text-2xl font-black bg-gray-800 border border-gray-600 rounded-lg px-3 py-1 text-white w-40 focus:border-blue-500 outline-none"
                      />
                      {selectedSeat.status && selectedSeat.status !== '공석' && (
                        <span className="text-xs bg-gray-800 px-2 py-1 rounded-full text-blue-400 font-normal border border-gray-700">{selectedSeat.status}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-gray-500 font-bold">{selectedSeat.id}석 · </span>
                      <input 
                        type="text" 
                        value={editTeam} 
                        onChange={(e) => setEditTeam(e.target.value)} 
                        placeholder="소속 팀"
                        className="text-sm bg-gray-800 border border-gray-600 rounded-lg px-2 py-1 text-white w-32 focus:border-blue-500 outline-none"
                      />
                      {/* 변경사항이 있을 때만 활성화되는 저장 버튼 */}
                      <button 
                        onClick={handleUpdateSeatInfo}
                        disabled={isSavingInfo || (editName === selectedSeat.name && editTeam === selectedSeat.team)}
                        className="ml-2 bg-blue-600 disabled:bg-gray-700 text-white text-xs px-3 py-1.5 rounded-lg font-bold shadow-md active:bg-blue-500 transition-colors"
                      >
                        {isSavingInfo ? '⏳ 저장중' : '💾 정보 저장'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-2xl font-black flex items-center gap-2">
                      {selectedSeat.name || '공석'} 
                      {selectedSeat.status && selectedSeat.status !== '공석' && (
                        <span className="text-xs bg-gray-800 px-2 py-1 rounded-full text-blue-400 font-normal border border-gray-700">{selectedSeat.status}</span>
                      )}
                    </h3>
                    <p className="text-gray-500 mt-1">{selectedSeat.id}석 · {selectedSeat.team}</p>
                  </div>
                )}
              </div>
              <button onClick={() => { setSelectedSeat(null); setHighlightedSeatId(null); }} className="text-2xl text-gray-500 hover:text-white p-2 bg-gray-800 rounded-full w-10 h-10 flex flex-shrink-0 items-center justify-center transition-colors">✕</button>
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