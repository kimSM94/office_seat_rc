const { useState, useEffect } = React;

const rows = ['A', 'B', 'C', 'D', 'E'];
const cols = Array.from({ length: 10 }, (_, i) => i + 1);
const zones = ['개발팀', '디자인팀', '기획팀', '프리랜서존'];

// ==========================================
// 1. 메인 App 컴포넌트
// ==========================================
function App() {
  const [user, setUser] = useState(null); 
  const [view, setView] = useState('home'); 
  const [seats, setSeats] = useState({});
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [customMessage, setCustomMessage] = useState('');
  const [secondBrainData, setSecondBrainData] = useState({ focus: '', todos: '', links: '' });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [highlightedSeatId, setHighlightedSeatId] = useState(null);
  const [recommendedSeats, setRecommendedSeats] = useState([]); 
  const [aiMessage, setAiMessage] = useState('궁금한 담당자를 찾거나, 빈자리 배치를 요청해보세요!');

  useEffect(() => {
    if (!user) return; 

    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        const data = await window.api.fetchSeats();
        const seatsObj = {};
        data.forEach(seat => { seatsObj[seat.id] = seat; });
        setSeats(seatsObj);
      } catch (error) {
        console.error('데이터 로드 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();

    const subscription = window.api.subscribeToSeats((newSeatData) => {
      setSeats(prev => ({ ...prev, [newSeatData.id]: newSeatData }));
    });

    return () => { 
      if (window.supabase && subscription) {
        window.supabase.removeChannel(subscription); 
      }
    };
  }, [user]); 

  useEffect(() => {
    if (selectedSeat) {
      setCustomMessage(selectedSeat.status_message || '');
      try {
        const parsed = JSON.parse(selectedSeat.second_brain);
        setSecondBrainData(parsed || { focus: '', todos: '', links: '' });
      } catch (e) {
        setSecondBrainData({ focus: selectedSeat.second_brain || '', todos: '', links: '' });
      }
    }
  }, [selectedSeat]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const stringifiedBrain = JSON.stringify(secondBrainData);
      await window.api.updateStatusWithMessage(id, newStatus, customMessage, stringifiedBrain);
      setSelectedSeat(null);
    } catch (error) {
      alert('상태 업데이트에 실패했습니다.');
    }
  };

  const handleAISearch = async () => { /* 기존 로직 동일 */ };
  const handleAIRecommend = async () => { /* 기존 로직 동일 */ };

  if (!user) return <AuthView onLoginSuccess={(userData) => setUser(userData)} />;
  if (isLoading) return <div className="h-screen w-full bg-gray-900 flex items-center justify-center text-white font-bold">오피스 데이터 동기화 중...</div>;

  const isMySeat = selectedSeat?.name === user.name;

  return (
    <div className="h-full flex flex-col relative bg-gray-900 text-white">
      {view === 'home' && <Home setView={setView} user={user} seats={seats} />}
      {view === 'map' && <MapView setView={setView} rows={rows} cols={cols} seats={seats} setSelectedSeat={setSelectedSeat} searchQuery={searchQuery} setSearchQuery={setSearchQuery} handleAISearch={handleAISearch} handleAIRecommend={handleAIRecommend} isSearching={isSearching} aiMessage={aiMessage} highlightedSeatId={highlightedSeatId} recommendedSeats={recommendedSeats} />}
      {view === 'admin' && <AdminView setView={setView} seats={seats} />}
      {view === 'zone' && <ZoneView setView={setView} seats={seats} setSelectedSeat={setSelectedSeat} zones={zones} />}

      {/* 🪑 좌석 상세 및 세컨드 브레인 모달 */}
      {selectedSeat && (
        <div className="absolute inset-0 bg-black/80 flex items-end z-50 animate-in fade-in">
          <div className="w-full bg-gray-900 border-t border-gray-700 p-6 rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-black flex items-center gap-2">
                  {selectedSeat.name || '공석'} 
                  {selectedSeat.status && selectedSeat.status !== '공석' && (
                    <span className="text-xs bg-gray-800 px-2 py-1 rounded-full text-blue-400 font-normal border border-gray-700">
                      {selectedSeat.status}
                    </span>
                  )}
                </h3>
                <p className="text-gray-500 mt-1">{selectedSeat.id}석 · {selectedSeat.zone || '미지정 구역'}</p>
                {selectedSeat.status_message && (
                  <p className="text-sm font-bold text-yellow-400 mt-2 p-3 bg-yellow-400/10 rounded-xl inline-block border border-yellow-400/20">
                    💬 {selectedSeat.status_message}
                  </p>
                )}
              </div>
              <button onClick={() => setSelectedSeat(null)} className="text-2xl text-gray-500 hover:text-white p-2 bg-gray-800 rounded-full w-10 h-10 flex items-center justify-center">✕</button>
            </div>
            
            <div className="space-y-4">
              {selectedSeat.status === '공석' && (
                <button onClick={async () => { await window.api.createRequest(selectedSeat.id, user.name); alert(`이동 요청 전송 완료!`); setSelectedSeat(null); }} className="w-full p-4 bg-purple-600 hover:bg-purple-700 rounded-xl font-bold text-lg shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all mb-4">
                  📬 이 자리로 이동 요청하기 ({user.name})
                </button>
              )}

              {selectedSeat.status !== '공석' && (
                <div className="bg-gray-800/60 p-5 rounded-2xl border border-gray-700 mb-6 shadow-inner">
                  <h4 className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-4 flex items-center gap-2">
                    🧠 {selectedSeat.name}의 Second Brain
                  </h4>
                  {isMySeat ? (
                    <div className="space-y-4">
                      <div><label className="text-xs font-bold text-gray-400 mb-1 block">🎯 오늘의 핵심 포커스</label><input type="text" className="w-full p-3 bg-gray-900 rounded-xl border border-gray-700 text-sm text-white focus:border-blue-500 focus:outline-none placeholder-gray-600" value={secondBrainData.focus} onChange={(e) => setSecondBrainData({...secondBrainData, focus: e.target.value})} /></div>
                      <div><label className="text-xs font-bold text-gray-400 mb-1 block">✅ 투두 리스트 (쉼표로 구분)</label><input type="text" className="w-full p-3 bg-gray-900 rounded-xl border border-gray-700 text-sm text-white focus:border-blue-500 focus:outline-none placeholder-gray-600" value={secondBrainData.todos} onChange={(e) => setSecondBrainData({...secondBrainData, todos: e.target.value})} /></div>
                      <div><label className="text-xs font-bold text-gray-400 mb-1 block">🔗 주요 프로젝트 링크</label><input type="text" className="w-full p-3 bg-gray-900 rounded-xl border border-gray-700 text-sm text-blue-400 focus:border-blue-500 focus:outline-none placeholder-gray-600" value={secondBrainData.links} onChange={(e) => setSecondBrainData({...secondBrainData, links: e.target.value})} /></div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {secondBrainData.focus && (<div><span className="text-xs text-gray-500 font-bold block mb-1">🎯 오늘의 포커스</span><p className="text-sm text-white font-medium bg-gray-900 p-3 rounded-xl border border-gray-700">{secondBrainData.focus}</p></div>)}
                      {secondBrainData.todos && (<div><span className="text-xs text-gray-500 font-bold block mb-2">✅ 투두 리스트</span><div className="space-y-2 bg-gray-900 p-3 rounded-xl border border-gray-700">{secondBrainData.todos.split(',').map((todo, idx) => (<div key={idx} className="flex items-center gap-2 text-sm text-gray-300"><div className="w-4 h-4 rounded border border-gray-600 flex-shrink-0"></div><span>{todo.trim()}</span></div>))}</div></div>)}
                      {secondBrainData.links && (<div><span className="text-xs text-gray-500 font-bold block mb-1">🔗 프로젝트 링크</span><a href={secondBrainData.links.startsWith('http') ? secondBrainData.links : `https://${secondBrainData.links}`} target="_blank" rel="noreferrer" className="text-sm text-blue-400 hover:text-blue-300 underline block bg-gray-900 p-3 rounded-xl border border-gray-700 break-all">{secondBrainData.links}</a></div>)}
                      {!secondBrainData.focus && !secondBrainData.todos && !secondBrainData.links && (<p className="text-sm text-gray-500 text-center py-4">아직 등록된 업무 정보가 없습니다.</p>)}
                    </div>
                  )}
                </div>
              )}

              {selectedSeat.status !== '공석' && (
                <>
                  <div className="mb-4"><input type="text" placeholder="현재 상태 메시지 (예: 15시까지 미팅)" className="w-full p-3 bg-gray-800 rounded-xl border border-gray-700 text-sm focus:border-blue-500 focus:outline-none" value={customMessage} onChange={(e) => setCustomMessage(e.target.value)} /></div>
                  <div className="grid grid-cols-3 gap-2 pb-4">
                    <button onClick={() => handleStatusChange(selectedSeat.id, '근무중')} className="p-3 bg-gray-800 rounded-xl font-bold text-sm hover:border-green-500 border border-gray-700 transition-colors">🟢 근무중</button>
                    <button onClick={() => handleStatusChange(selectedSeat.id, '자리비움')} className="p-3 bg-gray-800 rounded-xl font-bold text-sm hover:border-yellow-500 border border-gray-700 transition-colors">🟡 자리비움</button>
                    <button onClick={() => handleStatusChange(selectedSeat.id, '휴가')} className="p-3 bg-gray-800 rounded-xl font-bold text-sm hover:border-red-500 border border-gray-700 transition-colors">🔴 휴가</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 2. 홈 화면 (Home) 컴포넌트 (오타 수정본!)
// ==========================================
function Home({ setView, user, seats }) {
  const [isSajuInputOpen, setIsSajuInputOpen] = React.useState(false); 
  const [sajuMode, setSajuMode] = React.useState('individual'); 
  
  const [myName, setMyName] = React.useState(user?.name || ''); 
  const [myYear, setMyYear] = React.useState('1994');
  const [myMonth, setMyMonth] = React.useState('1');
  const [myDay, setMyDay] = React.useState('1');

  const [partnerName, setPartnerName] = React.useState('');
  const [partnerYear, setPartnerYear] = React.useState('1995');
  const [partnerMonth, setPartnerMonth] = React.useState('1');
  const [partnerDay, setPartnerDay] = React.useState('1');

  const [teamMembers, setTeamMembers] = React.useState([
    { id: 1, name: user?.name || '', year: '1994', month: '1', day: '1' },
    { id: 2, name: '', year: '1995', month: '1', day: '1' }
  ]);

  const [sajuResult, setSajuResult] = React.useState(''); 
  const [isSajuLoading, setIsSajuLoading] = React.useState(false);

  const years = Array.from({ length: 56 }, (_, i) => 2005 - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const handleAddMember = () => {
    if (teamMembers.length >= 6) return alert("도사님의 기력이 달립니다. 팀원은 6명까지만!");
    setTeamMembers([...teamMembers, { id: Date.now(), name: '', year: '1995', month: '1', day: '1' }]);
  };

  const handleRemoveMember = (id) => {
    if (teamMembers.length <= 2) return alert("팀 궁합은 최소 2명 이상이어야 합니다!");
    setTeamMembers(teamMembers.filter(m => m.id !== id));
  };

  const handleMemberChange = (id, field, value) => {
    setTeamMembers(teamMembers.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const handleSajuSubmit = async () => {
    try {
      setIsSajuLoading(true); 
      let result = '';

      if (sajuMode === 'team') {
        if (teamMembers.some(m => !m.name)) throw new Error("모든 팀원의 이름을 입력해주세요!");
        const mappedMembers = teamMembers.map(m => ({
          name: m.name,
          birth: `${m.year}-${String(m.month).padStart(2, '0')}-${String(m.day).padStart(2, '0')}`
        }));
        result = await window.api.getTeamChemistry(mappedMembers);
      } else {
        const formattedMyBirth = `${myYear}-${String(myMonth).padStart(2, '0')}-${String(myDay).padStart(2, '0')}`;
        if (!myName) throw new Error("본인 이름을 입력해주세요!");
        
        if (sajuMode === 'individual') {
          result = await window.api.getTodaySaju(myName, formattedMyBirth);
        } else {
          const formattedPartnerBirth = `${partnerYear}-${String(partnerMonth).padStart(2, '0')}-${String(partnerDay).padStart(2, '0')}`;
          if (!partnerName) throw new Error("동료의 이름을 입력해주세요!");
          result = await window.api.getOfficeChemistry(myName, formattedMyBirth, partnerName, formattedPartnerBirth);
        }
      }
      
      setSajuResult(result);
      setIsSajuInputOpen(false); 
    } catch (error) {
      alert(error.message);
    } finally {
      setIsSajuLoading(false); 
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 bg-gray-900 text-white animate-in fade-in relative overflow-hidden">
      
      <div className="text-center mb-10 z-10">
        <h1 className="text-4xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
          Smart Office
        </h1>
        <p className="text-gray-400">환영합니다, <span className="font-bold text-white">{user?.name}</span>님!</p>
      </div>

      <div className="w-full max-w-md space-y-4 z-10">
        <button onClick={() => setIsSajuInputOpen(true)} className="w-full p-5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 rounded-2xl font-black text-lg text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all active:scale-95 flex flex-col items-center gap-1">
          <span>🔮 오늘의 오피스 운세 & 직장 궁합</span>
        </button>

        <button onClick={handleLunchMatchClick} className="w-full p-5 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-400 hover:to-pink-400 rounded-2xl font-black text-lg text-white shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-all active:scale-95 flex flex-col items-center gap-1">
          <span>🍱 AI 맛집 탐험대 랜덤 매칭하기</span>
        </button>
        <button onClick={() => setView('map')} className="w-full p-5 bg-gray-800 hover:bg-gray-700 rounded-2xl font-bold text-lg border border-gray-700 transition-all flex items-center justify-center gap-2">🗺️ 오피스 전체 지도 보기</button>
        <button onClick={() => setView('zone')} className="w-full p-5 bg-gray-800 hover:bg-gray-700 rounded-2xl font-bold text-lg border border-gray-700 transition-all flex items-center justify-center gap-2">🏢 부서별/구역별 현황</button>
      </div>

      {/* 🌟 1. 화려한 로딩 오버레이 */}
      {isSajuLoading && (
        <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-md flex flex-col items-center justify-center z-[100] animate-in fade-in duration-300">
          <div className="text-7xl animate-bounce mb-6">🔮</div>
          <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 animate-pulse text-center">
            우주의 기운을<br/>모으고 있습니다...
          </h3>
          <p className="text-gray-400 mt-4 text-sm font-medium">도사님이 오피스 명리학 데이터를 분석 중입니다 📜</p>
        </div>
      )}

      {/* 🔮 2. 입력 모달창 */}
      {isSajuInputOpen && !isSajuLoading && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-gray-800 p-6 rounded-3xl max-w-sm w-full border border-gray-700 shadow-2xl max-h-[85vh] overflow-y-auto">
            
            <div className="flex bg-gray-900 rounded-xl mb-6 p-1 border border-gray-700">
              <button onClick={() => setSajuMode('individual')} className={`flex-1 p-2 text-xs font-bold rounded-lg transition-colors ${sajuMode === 'individual' ? 'bg-purple-600 text-white' : 'text-gray-400'}`}>1인 운세</button>
              <button onClick={() => setSajuMode('chemistry')} className={`flex-1 p-2 text-xs font-bold rounded-lg transition-colors ${sajuMode === 'chemistry' ? 'bg-purple-600 text-white' : 'text-gray-400'}`}>1:1 궁합</button>
              <button onClick={() => setSajuMode('team')} className={`flex-1 p-2 text-xs font-bold rounded-lg transition-colors ${sajuMode === 'team' ? 'bg-purple-600 text-white' : 'text-gray-400'}`}>🏢 팀 궁합</button>
            </div>

            {/* A. 개인 및 1:1 궁합 UI */}
            {sajuMode !== 'team' && (
              <>
                <div className="space-y-4 mb-6">
                  <h4 className="text-sm font-black text-purple-400 border-b border-gray-700 pb-2">👤 나의 정보</h4>
                  <div>
                    <input type="text" placeholder="이름" value={myName} onChange={(e) => setMyName(e.target.value)} className="w-full p-3 bg-gray-900 rounded-xl border border-gray-700 text-white mb-2" />
                    <div className="flex gap-2">
                      {/* 💡 문제의 < 기호를 모두 지웠습니다! */}
                      <select value={myYear} onChange={(e) => setMyYear(e.target.value)} className="w-1/3 p-3 bg-gray-900 rounded-xl border border-gray-700 text-white">{years.map(y => <option key={y} value={y}>{y}</option>)}</select>
                      <select value={myMonth} onChange={(e) => setMyMonth(e.target.value)} className="w-1/3 p-3 bg-gray-900 rounded-xl border border-gray-700 text-white">{months.map(m => <option key={m} value={m}>{m}</option>)}</select>
                      <select value={myDay} onChange={(e) => setMyDay(e.target.value)} className="w-1/3 p-3 bg-gray-900 rounded-xl border border-gray-700 text-white">{days.map(d => <option key={d} value={d}>{d}</option>)}</select>
                    </div>
                  </div>
                </div>
                {sajuMode === 'chemistry' && (
                  <div className="space-y-4 mb-6 animate-in slide-in-from-top-4">
                    <h4 className="text-sm font-black text-blue-400 border-b border-gray-700 pb-2">🤝 동료의 정보</h4>
                    <div>
                      <input type="text" placeholder="동료 이름" value={partnerName} onChange={(e) => setPartnerName(e.target.value)} className="w-full p-3 bg-gray-900 rounded-xl border border-gray-700 text-white mb-2" />
                      <div className="flex gap-2">
                        <select value={partnerYear} onChange={(e) => setPartnerYear(e.target.value)} className="w-1/3 p-3 bg-gray-900 rounded-xl border border-gray-700 text-white">{years.map(y => <option key={y} value={y}>{y}</option>)}</select>
                        <select value={partnerMonth} onChange={(e) => setPartnerMonth(e.target.value)} className="w-1/3 p-3 bg-gray-900 rounded-xl border border-gray-700 text-white">{months.map(m => <option key={m} value={m}>{m}</option>)}</select>
                        <select value={partnerDay} onChange={(e) => setPartnerDay(e.target.value)} className="w-1/3 p-3 bg-gray-900 rounded-xl border border-gray-700 text-white">{days.map(d => <option key={d} value={d}>{d}</option>)}</select>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* B. 팀 전체 궁합 UI (동적 배열) */}
            {sajuMode === 'team' && (
              <div className="space-y-4 mb-6 animate-in fade-in">
                <div className="flex justify-between items-end border-b border-gray-700 pb-2">
                  <h4 className="text-sm font-black text-green-400">🏢 팀원 정보 ({teamMembers.length}명)</h4>
                  <button onClick={handleAddMember} className="text-xs bg-gray-700 px-2 py-1 rounded text-white hover:bg-gray-600">+ 인원 추가</button>
                </div>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {teamMembers.map((member, idx) => (
                    <div key={member.id} className="bg-gray-900 p-3 rounded-xl border border-gray-700 relative">
                      {idx >= 2 && (
                        <button onClick={() => handleRemoveMember(member.id)} className="absolute top-2 right-2 text-gray-500 hover:text-red-400 text-xs">✕</button>
                      )}
                      <input type="text" placeholder={`팀원 ${idx + 1} 이름`} value={member.name} onChange={(e) => handleMemberChange(member.id, 'name', e.target.value)} className="w-full p-2 bg-transparent border-b border-gray-700 text-white mb-2 text-sm focus:outline-none focus:border-green-400" />
                      <div className="flex gap-1">
                        <select value={member.year} onChange={(e) => handleMemberChange(member.id, 'year', e.target.value)} className="w-1/3 p-1 bg-gray-800 rounded text-xs text-white">{years.map(y => <option key={y} value={y}>{y}</option>)}</select>
                        <select value={member.month} onChange={(e) => handleMemberChange(member.id, 'month', e.target.value)} className="w-1/3 p-1 bg-gray-800 rounded text-xs text-white">{months.map(m => <option key={m} value={m}>{m}</option>)}</select>
                        <select value={member.day} onChange={(e) => handleMemberChange(member.id, 'day', e.target.value)} className="w-1/3 p-1 bg-gray-800 rounded text-xs text-white">{days.map(d => <option key={d} value={d}>{d}</option>)}</select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 mt-4">
              <button onClick={() => setIsSajuInputOpen(false)} className="w-1/3 p-4 bg-gray-700 hover:bg-gray-600 rounded-xl font-bold text-white transition-colors">취소</button>
              <button onClick={handleSajuSubmit} className="w-2/3 p-4 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold text-white transition-colors">
                {sajuMode === 'individual' ? '운세 확인 ✨' : sajuMode === 'chemistry' ? '궁합 분석 🤝' : '팀 케미 폭발 🚀'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔮 3. 결과 모달창 */}
      {sajuResult && !isSajuLoading && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-in fade-in slide-in-from-bottom-10">
          <div className="bg-gray-800 p-6 rounded-3xl max-w-md w-full border border-purple-500/50 shadow-[0_0_40px_rgba(168,85,247,0.4)]">
            <h3 className="text-2xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              📜 {sajuMode === 'individual' ? `${myName}님의 운세` : sajuMode === 'chemistry' ? '1:1 직장 궁합' : '🏢 우리 팀의 케미'}
            </h3>
            <div className="bg-gray-900 p-5 rounded-2xl text-gray-200 text-sm whitespace-pre-wrap leading-relaxed max-h-[50vh] overflow-y-auto border border-gray-700">
              {sajuResult}
            </div>
            <button onClick={() => setSajuResult('')} className="w-full p-4 mt-6 bg-gray-700 hover:bg-gray-600 rounded-xl font-bold text-white transition-colors">
              결과 닫고 업무 복귀하기 🚀
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const handleLunchMatchClick = async () => {
  // 1. 로딩 스피너 켜기 (궁합/사주 볼 때와 똑같이!)
  setIsLoading(true); 
  
  try {
    // 2. api.js의 맛집 함수 실행 (GPS 동의 알림이 뜨고, 로딩이 돕니다)
    const resultText = await window.api.triggerLunchMatch();
    
    // 3. 결과를 모달창 내용에 집어넣고, 모달창 띄우기!
    setResultModalContent(resultText); 
    setIsResultModalOpen(true); 

  } catch (error) {
    // 에러가 나면 경고창 띄우기
    alert(error.message);
  } finally {
    // 4. 로딩 스피너 끄기
    setIsLoading(false); 
  }
};

// 렌더링
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);