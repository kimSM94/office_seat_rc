const { useState, useEffect } = React;

const rows = ['A', 'B', 'C', 'D', 'E'];
const cols = Array.from({ length: 10 }, (_, i) => i + 1);
const zones = ['개발팀', '디자인팀', '기획팀', '프리랜서존'];

// =====================================================================
// 🎯 [데이터] RAG 및 화면 렌더링용 좌석 데이터 (JSON 파일 내용 직접 삽입)
// =====================================================================
const SEAT_DATA = [
  {"id": "1224", "name": "강수정", "team": "상담", "x": 10, "y": 300},
  {"id": "1609", "name": "김동혁", "team": "상담", "x": 10, "y": 400},
  {"id": "1369", "name": "강선희", "team": "운영혁신", "x": 10, "y": 500},
  {"id": "1413", "name": "김범", "team": "운영혁신", "x": 10, "y": 600},
  {"id": "1479", "name": "이동은", "team": "기획", "x": 10, "y": 750},
  {"id": "1401", "name": "서성훈", "team": "팀장", "x": 10, "y": 850},
  {"id": "1475", "name": "서강석", "team": "본부장", "x": -50, "y": 850},
  {"id": "1483", "name": "김기훈", "team": "상담", "x": 60, "y": 300},
  {"id": "1285", "name": "이소연", "team": "상담", "x": 60, "y": 400},
  {"id": "1788", "name": "장병용", "team": "상담", "x": 60, "y": 500},
  {"id": "1712", "name": "장성호", "team": "솔포인트", "x": 60, "y": 600},
  {"id": "1137", "name": "박남호", "team": "솔포인트", "x": 60, "y": 700},
  {"id": "8892", "name": "김연섭", "team": "솔포인트", "x": 60, "y": 800},
  {"id": "1437", "name": "김영필", "team": "오토", "x": 180, "y": 300},
  {"id": "1448", "name": "김세희", "team": "오토", "x": 180, "y": 400},
  {"id": "1814", "name": "윤호영", "team": "오토", "x": 230, "y": 300},
  {"id": "1741", "name": "김선혜", "team": "오토", "x": 230, "y": 400},
  {"id": "1642", "name": "김준석", "team": "오토", "x": 230, "y": 500},
  {"id": "1669", "name": "길원규", "team": "재무", "x": 380, "y": 300},
  {"id": "1380", "name": "이현지", "team": "재무", "x": 380, "y": 400},
  {"id": "1258", "name": "신동엽", "team": "홈페이지", "x": 430, "y": 300},
  {"id": "8686", "name": "김성우", "team": "홈페이지", "x": 430, "y": 400},
  {"id": "1607", "name": "윤학민", "team": "모바일", "x": 800, "y": 300},
  {"id": "1315", "name": "김지해", "team": "모바일", "x": 800, "y": 400},
  {"id": "1316", "name": "한민지", "team": "모바일", "x": 850, "y": 300},
  {"id": "1811", "name": "유지원", "team": "모바일", "x": 850, "y": 400}
];

function MapView({ seatsData, setSelectedSeat }) {
  const MAP_WIDTH = 1000;
  const MAP_HEIGHT = 1000;
  const [scale, setScale] = useState(0.8);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const handleWheel = (e) => {
    e.preventDefault(); 
    const scaleAdjust = e.deltaY * -0.001;
    const newScale = Math.min(Math.max(0.3, scale + scaleAdjust), 3);
    setScale(newScale);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartPos({ x: e.clientX - pos.x, y: e.clientY - pos.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPos({ x: e.clientX - startPos.x, y: e.clientY - startPos.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  const getTeamColor = (team) => {
    if (team === '상담') return '#FEF08A';
    if (team === '오토') return '#D9F99D';
    if (team === '재무') return '#BBF7D0';
    if (team === '모바일') return '#FDE047';
    if (team === '솔포인트') return '#A7F3D0';
    return '#E5E7EB'; 
  };

  return (
    <div className="w-full h-[80vh] bg-gray-900 overflow-hidden relative rounded-xl border border-gray-700"
         onWheel={handleWheel} onMouseDown={handleMouseDown}
         onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}
         onMouseLeave={handleMouseUp} style={{ cursor: isDragging ? 'grabbing' : 'grab' }}>
      
      <div className="absolute top-4 left-4 z-10 bg-gray-800/80 p-4 rounded-xl border border-gray-700 backdrop-blur">
        <h3 className="text-white font-bold mb-2">💡 스마트 좌석배치도</h3>
        <p className="text-sm text-gray-400">마우스 휠: 확대/축소</p>
        <p className="text-sm text-gray-400">드래그: 화면 이동</p>
      </div>

      <div className="absolute bottom-6 right-6 z-10 flex gap-2">
        <button onClick={() => setScale(s => Math.min(s + 0.2, 3))} className="p-3 bg-gray-800 rounded-full text-white hover:bg-gray-700">+</button>
        <button onClick={() => setScale(s => Math.max(s - 0.2, 0.3))} className="p-3 bg-gray-800 rounded-full text-white hover:bg-gray-700">-</button>
        <button onClick={() => { setScale(0.8); setPos({x: 0, y: 0}); }} className="p-3 bg-purple-600 rounded-full text-white hover:bg-purple-500">초기화</button>
      </div>

      <div className="w-full h-full flex items-center justify-center"
           style={{ transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`, transition: isDragging ? 'none' : 'transform 0.1s ease-out' }}>
        <svg width={MAP_WIDTH} height={MAP_HEIGHT} className="bg-gray-800 rounded-3xl shadow-2xl">
          <rect x="50" y="50" width="900" height="100" fill="#374151" rx="10" />
          <text x="500" y="105" fill="#9CA3AF" fontSize="24" fontWeight="bold" textAnchor="middle">E/V 및 엘리베이터 홀</text>
          
          {seatsData.map((seat) => (
            <g key={seat.id} transform={`translate(${seat.x}, ${seat.y})`}
               onClick={(e) => { e.stopPropagation(); setSelectedSeat(seat); }}
               className="cursor-pointer hover:opacity-80 transition-opacity">
              <rect width="45" height="65" fill={getTeamColor(seat.team)} rx="4" stroke="#4B5563" />
              <text x="22.5" y="15" fill="#1F2937" fontSize="10" fontWeight="bold" textAnchor="middle">{seat.team}</text>
              <text x="22.5" y="32" fill="#111827" fontSize="12" fontWeight="900" textAnchor="middle">{seat.name}</text>
              {scale > 1.2 && <text x="22.5" y="50" fill="#4B5563" fontSize="11" fontWeight="bold" textAnchor="middle">{seat.id}</text>}
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

// ==========================================
// 1. 메인 App 컴포넌트
// ==========================================
function App() {
  // 상태 관리
  const [user, setUser] = useState(null); 
  const [view, setView] = useState('home'); 
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1시간 로그인 유지 로직 (이전에 만드신 코드!)
  useEffect(() => {
    const savedSession = localStorage.getItem('office_user_session');
    if (savedSession) {
      const { userData, expiry } = JSON.parse(savedSession);
      if (Date.now() < expiry) {
        setUser(userData);
      } else {
        localStorage.removeItem('office_user_session');
      }
    }
    setIsLoading(false);
  }, []);

  // 로그인 성공 처리 함수
  const handleLoginSuccess = (userData) => {
    const ONE_HOUR = 60 * 60 * 1000;
    const sessionData = { userData, expiry: Date.now() + ONE_HOUR };
    localStorage.setItem('office_user_session', JSON.stringify(sessionData));
    setUser(userData);
  };

  // 로딩 중이거나 로그인이 안 되어있을 때
  if (isLoading) return <div className="text-white text-center p-10">로딩중...</div>;
  
  // 💡 기존에 만드신 AuthView 컴포넌트가 있다면 아래에 연결됩니다.
  // (임시 로그인 화면 처리)
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="bg-gray-800 p-8 rounded-xl text-center">
          <h2 className="text-2xl font-bold mb-4">신한DS 스마트오피스</h2>
          <button 
            onClick={() => handleLoginSuccess({ name: '관리자', id: 'admin' })}
            className="bg-blue-600 px-6 py-2 rounded-lg font-bold hover:bg-blue-500"
          >
            임시 테스트 로그인
          </button>
        </div>
      </div>
    );
  }

  // 로그인 완료 후 메인 화면
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* 상단 네비게이션 바 */}
      <header className="bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          신한DS 스마트오피스 🚀
        </h1>
        <div className="flex gap-4 items-center">
          <button onClick={() => setView('home')} className={`px-4 py-2 rounded-lg font-bold ${view === 'home' ? 'bg-gray-700' : 'text-gray-400'}`}>홈</button>
          <button onClick={() => setView('map')} className={`px-4 py-2 rounded-lg font-bold ${view === 'map' ? 'bg-purple-600' : 'text-gray-400'}`}>지도 보기</button>
          <span className="ml-4 text-sm bg-gray-700 px-3 py-1 rounded-full">{user.name}님 환영합니다</span>
          <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="text-sm text-red-400 hover:text-red-300">로그아웃</button>
        </div>
      </header>

      {/* 메인 콘텐츠 영역 */}
      <main className="flex-1 p-6 flex flex-col">
        {view === 'home' && (
          <div className="flex flex-col items-center justify-center h-full">
            <h2 className="text-3xl font-bold mb-6">스마트 오피스에 오신 것을 환영합니다!</h2>
            <div className="flex gap-6">
              <button onClick={() => setView('map')} className="bg-gradient-to-r from-purple-600 to-blue-500 p-8 rounded-2xl shadow-lg hover:scale-105 transition-transform">
                <span className="text-4xl block mb-4">🗺️</span>
                <h3 className="text-xl font-bold">좌석 배치도 보기</h3>
              </button>
              
              {/* 💡 여기에 기존에 만드신 맛집 탐험대(Kakao API) 버튼을 넣으시면 됩니다! */}
              <button className="bg-gradient-to-r from-orange-500 to-yellow-500 p-8 rounded-2xl shadow-lg hover:scale-105 transition-transform"
                      onClick={() => alert("맛집 추천 기능은 기존 코드를 연동해주세요!")}>
                <span className="text-4xl block mb-4">🍱</span>
                <h3 className="text-xl font-bold">AI 맛집 탐험대</h3>
              </button>
            </div>
          </div>
        )}

        {view === 'map' && (
          <div className="flex gap-6 h-full">
            {/* 좌석배치도 렌더링 (데이터 전달) */}
            <div className="flex-1">
              <MapView seatsData={SEAT_DATA} setSelectedSeat={setSelectedSeat} />
            </div>

            {/* 우측 사이드바: 선택된 좌석 정보 */}
            <div className="w-80 bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-bold mb-4 border-b border-gray-700 pb-2">좌석 정보</h3>
              {selectedSeat ? (
                <div>
                  <div className="flex items-center justify-center w-20 h-20 bg-gray-700 rounded-full mb-4 mx-auto text-3xl">🧑‍💻</div>
                  <p className="text-center text-xl font-bold mb-1">{selectedSeat.name}</p>
                  <p className="text-center text-blue-400 font-bold mb-6">{selectedSeat.team} 파트</p>
                  
                  <div className="bg-gray-900 rounded-lg p-4 space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-gray-400">내선번호</span><span>{selectedSeat.id}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">현재 상태</span><span className="text-green-400">● 근무중</span></div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 mt-10">지도를 클릭하여<br/>좌석 정보를 확인하세요.</div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ==========================================
// 2. 홈 화면 (Home) 컴포넌트 (오타 수정본!)
// ==========================================
// ==========================================
// 2. 홈 화면 (Home) 컴포넌트 (맛집 탐험대 완벽 적용본!)
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

  // 🚨 [새로 추가됨] 맛집 탐험대 전용 상태 변수!
  const [lunchResult, setLunchResult] = React.useState(''); 
  const [isLunchLoading, setIsLunchLoading] = React.useState(false);

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

  // 🚨 [새로 추가됨] 맛집 탐험대 실행 함수!
  const handleLunchMatchClick = async () => {
    setIsLunchLoading(true); // 오렌지색 로딩창 켜기
    try {
      const resultText = await window.api.triggerLunchMatch(); // api.js 호출
      setLunchResult(resultText); // 결과값을 저장
    } catch (error) {
      alert(error.message); // 권한 거부 등 에러 발생 시
    } finally {
      setIsLunchLoading(false); // 로딩창 끄기
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

        {/* 🚨 버튼에 handleLunchMatchClick 함수를 연결했습니다! */}
        <button onClick={handleLunchMatchClick} className="w-full p-5 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-400 hover:to-pink-400 rounded-2xl font-black text-lg text-white shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-all active:scale-95 flex flex-col items-center gap-1">
          <span>🍱 AI 맛집 탐험대 (주변 맛집 찾기)</span>
        </button>
        
        <button onClick={() => setView('map')} className="w-full p-5 bg-gray-800 hover:bg-gray-700 rounded-2xl font-bold text-lg border border-gray-700 transition-all flex items-center justify-center gap-2">🗺️ 오피스 전체 지도 보기</button>
        <button onClick={() => setView('zone')} className="w-full p-5 bg-gray-800 hover:bg-gray-700 rounded-2xl font-bold text-lg border border-gray-700 transition-all flex items-center justify-center gap-2">🏢 부서별/구역별 현황</button>
      </div>

      {/* 🌟 1-A. 사주 전용 화려한 로딩 오버레이 */}
      {isSajuLoading && (
        <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-md flex flex-col items-center justify-center z-[100] animate-in fade-in duration-300">
          <div className="text-7xl animate-bounce mb-6">🔮</div>
          <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 animate-pulse text-center">
            우주의 기운을<br/>모으고 있습니다...
          </h3>
          <p className="text-gray-400 mt-4 text-sm font-medium">도사님이 오피스 명리학 데이터를 분석 중입니다 📜</p>
        </div>
      )}

      {/* 🌟 1-B. 맛집 전용 화려한 로딩 오버레이 */}
      {isLunchLoading && (
        <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-md flex flex-col items-center justify-center z-[100] animate-in fade-in duration-300">
          <div className="text-7xl animate-bounce mb-6">🍱</div>
          <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-400 animate-pulse text-center">
            주변 맛집을<br/>탐색하고 있습니다...
          </h3>
          <p className="text-gray-400 mt-4 text-sm font-medium">AI가 GPS 반경 2km 이내의 핫플을 스캔 중입니다 📡</p>
        </div>
      )}

      {/* 🔮 2. 사주 입력 모달창 (기존 코드와 동일) */}
      {isSajuInputOpen && !isSajuLoading && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-gray-800 p-6 rounded-3xl max-w-sm w-full border border-gray-700 shadow-2xl max-h-[85vh] overflow-y-auto">
            
            <div className="flex bg-gray-900 rounded-xl mb-6 p-1 border border-gray-700">
              <button onClick={() => setSajuMode('individual')} className={`flex-1 p-2 text-xs font-bold rounded-lg transition-colors ${sajuMode === 'individual' ? 'bg-purple-600 text-white' : 'text-gray-400'}`}>1인 운세</button>
              <button onClick={() => setSajuMode('chemistry')} className={`flex-1 p-2 text-xs font-bold rounded-lg transition-colors ${sajuMode === 'chemistry' ? 'bg-purple-600 text-white' : 'text-gray-400'}`}>1:1 궁합</button>
              <button onClick={() => setSajuMode('team')} className={`flex-1 p-2 text-xs font-bold rounded-lg transition-colors ${sajuMode === 'team' ? 'bg-purple-600 text-white' : 'text-gray-400'}`}>🏢 팀 궁합</button>
            </div>

            {sajuMode !== 'team' && (
              <>
                <div className="space-y-4 mb-6">
                  <h4 className="text-sm font-black text-purple-400 border-b border-gray-700 pb-2">👤 나의 정보</h4>
                  <div>
                    <input type="text" placeholder="이름" value={myName} onChange={(e) => setMyName(e.target.value)} className="w-full p-3 bg-gray-900 rounded-xl border border-gray-700 text-white mb-2" />
                    <div className="flex gap-2">
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

      {/* 🔮 3-A. 사주 결과 모달창 */}
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

      {/* 🍱 3-B. 맛집 결과 모달창 (오렌지 테마!) */}
      {lunchResult && !isLunchLoading && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-in fade-in slide-in-from-bottom-10">
          <div className="bg-gray-800 p-6 rounded-3xl max-w-md w-full border border-orange-500/50 shadow-[0_0_40px_rgba(249,115,22,0.4)]">
            <h3 className="text-2xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-400">
              🍱 AI 맛집 탐험대 결과
            </h3>
            <div className="bg-gray-900 p-5 rounded-2xl text-gray-200 text-sm whitespace-pre-wrap leading-relaxed max-h-[50vh] overflow-y-auto border border-gray-700">
              {lunchResult}
            </div>
            <button onClick={() => setLunchResult('')} className="w-full p-4 mt-6 bg-gray-700 hover:bg-gray-600 rounded-xl font-bold text-white transition-colors">
              맛집 확인 완료! 🚀
            </button>
          </div>
        </div>
      )}
    </div>
  );
}



// 렌더링
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);