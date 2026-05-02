const { useState, useEffect, useRef } = React;

const rows = ['A', 'B', 'C', 'D', 'E'];
const cols = Array.from({ length: 10 }, (_, i) => i + 1);
const zones = ['개발팀', '디자인팀', '기획팀', '프리랜서존'];

const SEAT_DATA = [
  {id: "1224", name: "강수정", team: "상담", x: 50, y: 250}, {id: "1609", name: "김동혁", team: "상담", x: 50, y: 340}, {id: "1369", name: "강선희", team: "운영혁신", x: 50, y: 430}, {id: "1413", name: "김범", team: "운영혁신", x: 50, y: 520}, {id: "1479", name: "이동은", team: "기획", x: 50, y: 680}, {id: "1401", name: "서성훈", team: "팀장", x: 50, y: 770},
  {id: "Test", name: "Test실", team: "공용", x: -20, y: 680}, {id: "1475", name: "서강석", team: "본부장", x: -20, y: 770},
  {id: "1483", name: "김기훈", team: "상담", x: 120, y: 250}, {id: "1285", name: "이소연", team: "상담", x: 120, y: 340}, {id: "1788", name: "장병용", team: "상담", x: 120, y: 430}, {id: "1712", name: "장성호", team: "솔포인트", x: 120, y: 520}, {id: "1137", name: "박남호", team: "솔포인트", x: 120, y: 610}, {id: "8892", name: "김연섭", team: "솔포인트", x: 120, y: 700},
  {id: "1485", name: "이장규", team: "상담", x: 190, y: 250}, {id: "1797", name: "김지연", team: "상담", x: 190, y: 340}, {id: "1364", name: "김윤호", team: "상담", x: 190, y: 520}, {id: "8625", name: "이채연", team: "상담", x: 190, y: 610}, {id: "1280", name: "조경훈", team: "상담", x: 190, y: 700},
  {id: "1437", name: "김영필", team: "오토", x: 280, y: 250}, {id: "1448", name: "김세희", team: "오토", x: 280, y: 340}, {id: "1978", name: "김예련", team: "오토", x: 280, y: 430}, {id: "1880", name: "박지건", team: "오토", x: 280, y: 520}, {id: "1489", name: "남진아", team: "오토", x: 280, y: 610}, {id: "1461", name: "조용진", team: "오토", x: 280, y: 700}, {id: "1979", name: "정진삼", team: "오토", x: 280, y: 790},
  {id: "1814", name: "윤호영", team: "오토", x: 350, y: 250}, {id: "1741", name: "김선혜", team: "오토", x: 350, y: 340}, {id: "1642", name: "김준석", team: "오토", x: 350, y: 430}, {id: "1464", name: "이성학", team: "오토", x: 350, y: 520}, {id: "1288", name: "김보령", team: "오토", x: 350, y: 610}, {id: "1442", name: "박용탁", team: "오토", x: 350, y: 700}, {id: "1753", name: "김종현", team: "오토", x: 350, y: 790},
  {id: "1480", name: "조성민", team: "오토", x: 420, y: 250}, {id: "8680", name: "표동수", team: "오토", x: 420, y: 340}, {id: "1465", name: "김연석", team: "오토", x: 420, y: 430}, {id: "1317", name: "박대윤", team: "오토", x: 420, y: 520}, {id: "1825", name: "정보람", team: "오토", x: 420, y: 610}, {id: "1537", name: "길연우", team: "오토", x: 420, y: 700}, {id: "1255", name: "김성훈", team: "SSO", x: 420, y: 790},
  {id: "1351", name: "이하나", team: "재무", x: 490, y: 250}, {id: "1803", name: "심혜진", team: "재무", x: 490, y: 340}, {id: "1414", name: "김동주", team: "재무", x: 490, y: 430}, {id: "1375", name: "김우철", team: "재무", x: 490, y: 520}, {id: "1726", name: "김경원", team: "발급", x: 490, y: 610}, {id: "1139", name: "권두연", team: "발급", x: 490, y: 700}, {id: "OA", name: "기동OA", team: "공용", x: 490, y: 790},
  {id: "1669", name: "길원규", team: "재무", x: 580, y: 250}, {id: "1380", name: "이현지", team: "재무", x: 580, y: 340}, {id: "1417", name: "정재은", team: "재무", x: 580, y: 430}, {id: "1446", name: "박미연", team: "마이카", x: 580, y: 610}, {id: "1266", name: "김연하", team: "마이카", x: 580, y: 700}, {id: "1331", name: "노지은", team: "개발전담", x: 580, y: 790},
  {id: "1258", name: "신동엽", team: "홈페이지", x: 650, y: 250}, {id: "8686", name: "김성우", team: "홈페이지", x: 650, y: 340}, {id: "8048", name: "유명석", team: "홈페이지", x: 650, y: 430}, {id: "1188", name: "방성원", team: "개발전담", x: 650, y: 520}, {id: "1942", name: "변상현", team: "마이카", x: 650, y: 610}, {id: "1878", name: "임형진", team: "마이카", x: 650, y: 700}, {id: "1988", name: "임영정", team: "마이카", x: 650, y: 790},
  {id: "1268", name: "정강호", team: "홈페이지", x: 740, y: 250}, {id: "1945", name: "박종원", team: "홈페이지", x: 740, y: 340}, {id: "1366", name: "이동현", team: "전자문서", x: 740, y: 430}, {id: "1773", name: "정희종", team: "전자문서", x: 740, y: 520}, {id: "8658", name: "함덕훈", team: "홈페이지", x: 740, y: 610}, {id: "8687", name: "이선아", team: "홈페이지", x: 740, y: 700}, {id: "1778", name: "이연경", team: "홈페이지", x: 740, y: 790},
  {id: "1943", name: "김찬수", team: "개발전담", x: 810, y: 250}, {id: "1865", name: "강규동", team: "개발전담", x: 810, y: 340}, {id: "8886", name: "이민호", team: "올댓", x: 810, y: 430}, {id: "8885", name: "강용선", team: "올댓", x: 810, y: 520}, {id: "8884", name: "박은혜", team: "올댓", x: 810, y: 610}, {id: "1138", name: "임진철", team: "홈페이지", x: 810, y: 700}, {id: "8883", name: "명보민", team: "올댓", x: 810, y: 790},
  {id: "1870", name: "최민선", team: "개발전담", x: 900, y: 250}, {id: "1947", name: "유현규", team: "개발전담", x: 900, y: 340}, {id: "1842", name: "박재환", team: "홈페이지", x: 900, y: 430}, {id: "1394", name: "김혜경", team: "홈페이지", x: 900, y: 520}, {id: "1443", name: "이영주", team: "홈페이지", x: 900, y: 610}, {id: "7499", name: "최호영", team: "홈페이지", x: 900, y: 700}, {id: "1333", name: "신정은", team: "홈페이지", x: 900, y: 790},
  {id: "1001", name: "최현철", team: "데이타비즈", x: 970, y: 290}, {id: "1863", name: "박다은", team: "개발전담", x: 970, y: 430}, {id: "1946", name: "이샛별", team: "개발전담", x: 970, y: 520}, {id: "8681", name: "이면정", team: "홈페이지", x: 970, y: 610}, {id: "1875", name: "홍지연", team: "홈페이지", x: 970, y: 700}, {id: "1478", name: "배경보", team: "홈페이지", x: 970, y: 790},
  {id: "1332", name: "이준상", team: "개발전담", x: 1060, y: 430}, {id: "1866", name: "이승민", team: "개발전담", x: 1060, y: 520}, {id: "8181", name: "김용오", team: "홈페이지", x: 1060, y: 610}, {id: "8180", name: "박동영", team: "홈페이지", x: 1060, y: 700}, {id: "8183", name: "이용민", team: "모바일", x: 1060, y: 790},
  {id: "1955", name: "김은정", team: "모바일", x: 1130, y: 340}, {id: "1131", name: "진은성", team: "모바일", x: 1130, y: 430}, {id: "1869", name: "김도현", team: "모바일", x: 1130, y: 520}, {id: "1476", name: "임영우", team: "모바일", x: 1130, y: 610}, {id: "8144", name: "박증환", team: "모바일", x: 1130, y: 700}, {id: "1132", name: "임지우", team: "모바일", x: 1130, y: 790},
  {id: "1607", name: "윤학민", team: "모바일", x: 1220, y: 250}, {id: "1841", name: "권예림", team: "모바일", x: 1220, y: 430}, {id: "8016", name: "서은빈", team: "모바일", x: 1220, y: 520}, {id: "8159", name: "김성민", team: "모바일", x: 1220, y: 610}, {id: "8191", name: "김지수", team: "모바일", x: 1220, y: 700}, {id: "8182", name: "임종완", team: "모바일", x: 1220, y: 790},
  {id: "1316", name: "한민지", team: "모바일", x: 1290, y: 250}, {id: "1315", name: "김지해", team: "모바일", x: 1290, y: 340}, {id: "1811", name: "유지원", team: "모바일", x: 1290, y: 430}, {id: "7547", name: "송효범", team: "모바일", x: 1290, y: 520}, {id: "1810", name: "박재욱", team: "모바일", x: 1290, y: 610}, {id: "8353", name: "승무준", team: "모바일", x: 1290, y: 700}, {id: "8627", name: "김용섭", team: "팀장", x: 1290, y: 790},
  {id: "8727", name: "김재용", team: "디스커버", x: 1060, y: 20}, {id: "8729", name: "정상은", team: "디스커버", x: 1130, y: 20}, {id: "8712", name: "김찬연", team: "디스커버", x: 1220, y: 20}, {id: "7167", name: "남주석", team: "디스커버", x: 1290, y: 20},
  {id: "8782", name: "김현진", team: "디스커버", x: 1060, y: 110}, {id: "1793", name: "전진", team: "디스커버", x: 1130, y: 110}, {id: "8713", name: "이동표", team: "디스커버", x: 1220, y: 110}, {id: "8190", name: "장진역", team: "디스커버", x: 1290, y: 110}, {id: "8168", name: "신재준", team: "디스커버", x: 1360, y: 110},
  {id: "9901", name: "이주원", team: "운영혁신", x: 50, y: 610}, {id: "9902", name: "김태형", team: "솔포인트", x: 120, y: 790}, {id: "9903", name: "김상민", team: "상담", x: 190, y: 430}, {id: "9904", name: "최정우", team: "상담", x: 190, y: 790}, {id: "9905", name: "송지아", team: "재무", x: 580, y: 520}, {id: "9906", name: "한동훈", team: "개발전담", x: 1060, y: 250}, {id: "9907", name: "윤지호", team: "개발전담", x: 1060, y: 340}, {id: "9908", name: "강태오", team: "모바일", x: 1130, y: 250}, {id: "9909", name: "배수지", team: "모바일", x: 1220, y: 340}
];

const getTeamColor = (team) => {
  if (!team) return '#E5E7EB';
  if (team === '상담' || team === '팀장') return '#FDE047'; 
  if (team.includes('오토') || team === 'SSO') return '#D9F99D'; 
  if (team === '솔포인트' || team === '발급') return '#86EFAC'; 
  if (team === '재무') return '#BEF264'; 
  if (team === '홈페이지' || team.includes('개발전담') || team === '올댓' || team === '전자문서') return '#A3E635'; 
  if (team.includes('마이카') || team === '데이타비즈') return '#84CC16'; 
  if (team.includes('모바일') || team.includes('디스커버')) return '#FCD34D'; 
  return '#E5E7EB'; 
};

// ==========================================
// 1. 지도 화면 (MapView) 컴포넌트
// ==========================================
function MapView({ 
  setView, seats, setSelectedSeat, 
  searchQuery, setSearchQuery, 
  highlightedSeatId 
}) {
  const [viewState, setViewState] = useState({ x: 0, y: 0, scale: 1 });
  const [center, setCenter] = useState({ x: 0, y: 0 }); 
  const [isPhone, setIsPhone] = useState(false);
  const minScaleRef = useRef(0.1); 

  const [localQuery, setLocalQuery] = useState("");
  const [searchedSeatIds, setSearchedSeatIds] = useState([]);

  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [pinchStart, setPinchStart] = useState({ dist: 0, scale: 1 });
  
  const containerRef = useRef(null);
  
  const seatArray = SEAT_DATA.map(seat => ({ ...seat, ...(seats[seat.id] || {}) }));

  useEffect(() => {
    const fitMap = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setCenter({ x: w / 2, y: h / 2 }); 
      const phone = h > w;
      setIsPhone(phone);

      const mapW = 1500;
      const mapH = 900;
      const scaleX = w / (phone ? mapH : mapW);
      const scaleY = h / (phone ? mapW : mapH);
      
      const initialScale = Math.min(scaleX, scaleY) * 0.9;
      minScaleRef.current = initialScale;

      setViewState({ x: 0, y: phone ? 40 : 0, scale: initialScale });
    };

    fitMap(); 
    window.addEventListener('resize', fitMap); 
    return () => window.removeEventListener('resize', fitMap);
  }, []);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const handleWheel = (e) => {
      e.preventDefault(); 
      const scaleAdjust = e.deltaY * -0.001;
      setViewState(prev => ({
        ...prev,
        scale: Math.min(Math.max(minScaleRef.current, prev.scale + scaleAdjust), 4)
      }));
    };
    element.addEventListener('wheel', handleWheel, { passive: false });
    return () => element.removeEventListener('wheel', handleWheel);
  }, []);

  const handleStart = (e) => {
    if (e.target.tagName.toLowerCase() === 'input' || e.target.tagName.toLowerCase() === 'button') return;
    
    if (e.type === 'touchstart') {
      if (e.touches.length === 2) {
        const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        setPinchStart({ dist, scale: viewState.scale });
        setIsDragging(false);
        return;
      }
      setIsDragging(true);
      setStartPos({ x: e.touches[0].clientX - viewState.x, y: e.touches[0].clientY - viewState.y });
    } else {
      setIsDragging(true);
      setStartPos({ x: e.clientX - viewState.x, y: e.clientY - viewState.y });
    }
  };
  
  const handleMove = (e) => {
    if (e.type === 'touchmove') {
      if (e.touches.length === 2 && pinchStart.dist > 0) {
        const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        const newScale = Math.min(Math.max(minScaleRef.current, pinchStart.scale * (dist / pinchStart.dist)), 4);
        setViewState(prev => ({ ...prev, scale: newScale }));
        return;
      }
      if (!isDragging) return;
      setViewState(prev => ({ ...prev, x: e.touches[0].clientX - startPos.x, y: e.touches[0].clientY - startPos.y }));
    } else {
      if (!isDragging) return;
      setViewState(prev => ({ ...prev, x: e.clientX - startPos.x, y: e.clientY - startPos.y }));
    }
  };
  
  const handleEnd = () => setIsDragging(false);

  const executeLocalSearch = () => {
    const query = (searchQuery !== undefined ? searchQuery : localQuery).trim().toLowerCase();
    if (!query) return setSearchedSeatIds([]);
    const matches = seatArray.filter(s => (s.name||'').toLowerCase().includes(query) || (s.team||'').toLowerCase().includes(query) || (s.id||'').toLowerCase().includes(query));
    setSearchedSeatIds(matches.map(m => m.id));
  };

  const actualQuery = searchQuery !== undefined ? searchQuery : localQuery;
  const updateQuery = (val) => {
    if (typeof setSearchQuery === 'function') setSearchQuery(val);
    setLocalQuery(val);
  };

  return (
    <div 
      ref={containerRef} className="fixed inset-0 bg-[#1A202C] overflow-hidden" style={{ touchAction: 'none' }}
      onMouseDown={handleStart} onMouseMove={handleMove} onMouseUp={handleEnd} onMouseLeave={handleEnd}
      onTouchStart={handleStart} onTouchMove={handleMove} onTouchEnd={handleEnd}
    >
      <div className="absolute top-4 left-4 z-50 flex flex-col gap-2 pointer-events-none w-full max-w-md">
        <div className="flex flex-row items-center gap-2 pointer-events-auto">
          <button onClick={() => setView('home')} className="bg-[#374151] text-white w-11 h-11 rounded-lg font-black text-xl border border-gray-500 shadow-md flex items-center justify-center flex-shrink-0 active:bg-gray-600">🔙</button>
          <input type="text" value={actualQuery} onChange={(e) => updateQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && executeLocalSearch()} placeholder="이름/팀 검색" className="w-32 sm:w-48 px-3 py-2 h-11 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:border-blue-500 font-bold text-sm shadow-md" />
          <button onClick={executeLocalSearch} className="bg-blue-600 text-white font-bold px-4 h-11 rounded-lg text-sm shadow-md whitespace-nowrap active:bg-blue-500">검색</button>
        </div>
      </div>

      <svg className="w-full h-full absolute inset-0 touch-none" style={{ cursor: isDragging ? 'grabbing' : 'grab' }}>
        <g transform={`translate(${center.x + viewState.x}, ${center.y + viewState.y}) scale(${viewState.scale}) ${isPhone ? 'rotate(90)' : ''}`}>
          <g transform="translate(-670, -405)">
            <rect x="50" y="100" width="900" height="80" fill="#374151" rx="8" />
            <text x="500" y="145" fill="#9CA3AF" fontSize="28" fontWeight="900" textAnchor="middle">E/V (엘리베이터)</text>
            
            {seatArray.map((seat) => {
              if (!seat.x || !seat.y) return null; 
              
              const isHighlighted = (highlightedSeatId === seat.id) || searchedSeatIds.includes(seat.id);
              const strokeColor = isHighlighted ? '#EF4444' : '#111827';
              const strokeWidth = isHighlighted ? '6' : '1.5'; 

              return (
                <g key={seat.id} transform={`translate(${seat.x}, ${seat.y})`} style={{ cursor: 'pointer' }}
                  onClick={(e) => { e.stopPropagation(); setSelectedSeat(seat); }}>
                  <rect width="60" height="80" fill={getTeamColor(seat.team)} rx="4" stroke={strokeColor} strokeWidth={strokeWidth} />
                  <text x="30" y="22" fill="#111827" fontSize="12" fontWeight="900" textAnchor="middle">{seat.team}</text>
                  <text x="30" y="45" fill="#000" fontSize="16" fontWeight="900" textAnchor="middle">{seat.name}</text>
                  <text x="30" y="68" fill="#4B5563" fontSize="14" fontWeight="900" textAnchor="middle">{seat.id}</text>
                  {isHighlighted && <circle cx="30" cy="-10" r="12" fill="#EF4444" className="animate-ping" />}
                </g>
              );
            })}
          </g>
        </g>
      </svg>
    </div>
  );
}

// ==========================================
// 2. 홈 화면 (Home) 컴포넌트
// ==========================================
function Home({ setView, user }) {
  return (
    <div className="h-full flex flex-col items-center justify-center p-6 bg-gray-900 text-white animate-in fade-in relative overflow-hidden">
      
      {/* 🚀 우측 상단 관리자 모드 진입 버튼 */}
      <button onClick={() => setView('admin')} className="absolute top-6 right-6 text-xs text-gray-400 hover:text-white font-bold bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-xl border border-gray-700 transition-colors flex items-center gap-1 shadow-md z-50">
        ⚙️ 관리자 모드
      </button>

      <div className="text-center mb-10 z-10">
        <h1 className="text-4xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
          Smart Office
        </h1>
        <p className="text-gray-400">환영합니다, <span className="font-bold text-white">{user?.name}</span>님!</p>
      </div>

      <div className="w-full max-w-md space-y-4 z-10">
        <button onClick={() => alert("사주 기능 준비중!")} className="w-full p-5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 rounded-2xl font-black text-lg text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all flex justify-center">
          🔮 오늘의 오피스 운세 & 직장 궁합
        </button>
        <button onClick={() => alert("맛집 기능 준비중!")} className="w-full p-5 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-400 hover:to-pink-400 rounded-2xl font-black text-lg text-white shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-all flex justify-center">
          🍱 AI 맛집 탐험대
        </button>
        
        <button onClick={() => setView('map')} className="w-full p-5 bg-gray-800 hover:bg-gray-700 rounded-2xl font-bold text-lg border border-gray-700 transition-all flex items-center justify-center gap-2">🗺️ 오피스 전체 지도 보기</button>
        <button onClick={() => setView('zone')} className="w-full p-5 bg-gray-800 hover:bg-gray-700 rounded-2xl font-bold text-lg border border-gray-700 transition-all flex items-center justify-center gap-2">🏢 부서별/구역별 현황</button>
      </div>
    </div>
  );
}

// ==========================================
// 3. 관리자 화면 (AdminView) 컴포넌트
// ==========================================
function AdminView({ setView, seats, setSeats }) {
  const [searchTerm, setSearchTerm] = useState('');

  const combinedSeats = SEAT_DATA.map(s => ({ ...s, ...(seats[s.id] || {}) }));
  const filtered = combinedSeats.filter(s => (s.name||'').includes(searchTerm) || (s.team||'').includes(searchTerm) || (s.id||'').includes(searchTerm));

  const handleUpdate = (id, field, value) => {
    setSeats(prev => ({
      ...prev,
      [id]: { ...(prev[id] || {}), [field]: value }
    }));
  };

  return (
    <div className="h-full flex flex-col bg-[#1A202C] text-white animate-in fade-in">
      <div className="flex items-center gap-4 p-6 bg-gray-900 border-b border-gray-800 shadow-md">
        <button onClick={() => setView('home')} className="bg-gray-700 hover:bg-gray-600 text-white w-12 h-12 rounded-xl font-black text-xl shadow-md flex items-center justify-center">🔙</button>
        <div>
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">⚙️ 오피스 관리자 모드</h2>
          <p className="text-gray-400 text-sm mt-1">이름, 부서를 수정하면 지도에 실시간으로 반영됩니다.</p>
        </div>
      </div>

      <div className="p-4 border-b border-gray-800">
         <input type="text" placeholder="이름/팀/내선번호 검색..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} className="w-full p-4 bg-gray-800 rounded-xl border border-gray-700 focus:outline-none focus:border-orange-500 font-bold"/>
      </div>

      <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
         {filtered.map(seat => (
            <div key={seat.id} className="bg-gray-800 p-5 rounded-2xl border border-gray-700 flex flex-col gap-3 shadow-md">
               <div className="flex items-center justify-between border-b border-gray-700 pb-2">
                 <span className="font-bold text-gray-400">내선: {seat.id}</span>
                 <span className="text-xs bg-gray-900 px-2 py-1 rounded text-gray-500">x:{seat.x} y:{seat.y}</span>
               </div>
               <div className="flex gap-3">
                 <div className="flex-1">
                    <label className="text-xs text-gray-400 font-bold mb-1 block">이름</label>
                    <input value={seat.name} onChange={e=>handleUpdate(seat.id, 'name', e.target.value)} className="w-full bg-gray-900 border border-gray-600 focus:border-orange-500 outline-none rounded-lg p-2 text-sm text-white font-bold"/>
                 </div>
                 <div className="flex-1">
                    <label className="text-xs text-gray-400 font-bold mb-1 block">소속 팀</label>
                    <input value={seat.team} onChange={e=>handleUpdate(seat.id, 'team', e.target.value)} className="w-full bg-gray-900 border border-gray-600 focus:border-orange-500 outline-none rounded-lg p-2 text-sm text-white font-bold"/>
                 </div>
               </div>
            </div>
         ))}
      </div>
    </div>
  );
}

// ==========================================
// 4. 부서별 현황 (ZoneView) 컴포넌트
// ==========================================
function ZoneView({ setView, seats, setSelectedSeat, setHighlightedSeatId }) {
  const combinedSeats = SEAT_DATA.map(seat => ({ ...seat, ...(seats[seat.id] || {}) }));
  const groupedByTeam = combinedSeats.reduce((acc, seat) => {
    if (!acc[seat.team]) acc[seat.team] = [];
    acc[seat.team].push(seat);
    return acc;
  }, {});

  const sortedTeams = Object.keys(groupedByTeam).sort((a, b) => groupedByTeam[b].length - groupedByTeam[a].length);

  const getTeamColorClass = (team) => {
    if (team === '상담' || team === '팀장') return 'bg-yellow-400 text-yellow-900 border-yellow-500'; 
    if (team.includes('오토') || team === 'SSO') return 'bg-lime-300 text-lime-900 border-lime-400'; 
    if (team === '솔포인트' || team === '발급') return 'bg-green-300 text-green-900 border-green-400'; 
    if (team === '재무') return 'bg-green-400 text-green-900 border-green-500'; 
    if (team === '홈페이지' || team.includes('개발전담') || team === '올댓' || team === '전자문서') return 'bg-emerald-400 text-emerald-900 border-emerald-500'; 
    if (team.includes('마이카') || team === '데이타비즈') return 'bg-teal-400 text-teal-900 border-teal-500'; 
    if (team.includes('모바일') || team.includes('디스커버')) return 'bg-amber-300 text-amber-900 border-amber-400'; 
    return 'bg-gray-300 text-gray-800 border-gray-400'; 
  };

  return (
    <div className="h-full flex flex-col bg-[#1A202C] text-white overflow-hidden animate-in fade-in">
      <div className="flex items-center gap-4 p-6 bg-gray-900 border-b border-gray-800 shadow-md">
        <button onClick={() => setView('home')} className="bg-gray-700 hover:bg-gray-600 text-white w-12 h-12 rounded-xl font-black text-xl shadow-md flex items-center justify-center transition-colors">🔙</button>
        <div>
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">🏢 부서별/구역별 현황</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
          {sortedTeams.map((teamName) => {
            const members = groupedByTeam[teamName];
            const colorClass = getTeamColorClass(teamName);

            return (
              <div key={teamName} className="bg-gray-800 border border-gray-700 rounded-2xl p-5 shadow-lg flex flex-col">
                <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-3">
                  <h3 className="text-xl font-black text-gray-100 flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${colorClass.split(' ')[0]}`}></span>{teamName}
                  </h3>
                  <span className="bg-gray-900 text-gray-300 font-bold px-3 py-1 rounded-lg text-sm border border-gray-700">{members.length}명</span>
                </div>

                {/* 💡 이모지 삭제 및 Grid 3~4열 레이아웃 적용! */}
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {members.map((member) => (
                    <button key={member.id}
                      onClick={() => {
                        setHighlightedSeatId(member.id);
                        if (typeof setSelectedSeat === 'function') setSelectedSeat(null);
                        setView('map');
                      }}
                      className={`py-1.5 px-1 rounded-lg text-sm font-bold border transition-transform hover:scale-105 active:scale-95 shadow-sm truncate text-center ${colorClass}`}
                    >
                      {member.name}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 5. 메인 App 컴포넌트
// ==========================================
function App() {
  const [user, setUser] = useState({ name: '관리자' }); 
  const [view, setView] = useState('home'); 
  const [seats, setSeats] = useState({});
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [highlightedSeatId, setHighlightedSeatId] = useState(null);
  
  const [customMessage, setCustomMessage] = useState('');
  const [secondBrainData, setSecondBrainData] = useState({});

  const handleStatusChange = (id, newStatus) => {
    setSeats(prev => ({ ...prev, [id]: { ...(prev[id] || {}), status: newStatus, status_message: customMessage } }));
    setSelectedSeat(null);
  };

  const isMySeat = selectedSeat?.name === user?.name;

  return (
    <div className="h-full flex flex-col relative bg-gray-900 text-white">
      {view === 'home' && <Home setView={setView} user={user} />}
      {view === 'map' && <MapView setView={setView} seats={seats} setSelectedSeat={setSelectedSeat} highlightedSeatId={highlightedSeatId} />}
      {view === 'admin' && <AdminView setView={setView} seats={seats} setSeats={setSeats} />}
      {view === 'zone' && <ZoneView setView={setView} seats={seats} setSelectedSeat={setSelectedSeat} setHighlightedSeatId={setHighlightedSeatId} />}

      {/* 모달창 */}
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
                        <div><label className="text-xs font-bold text-gray-400 mb-1 block">🎯 오늘의 핵심 포커스</label><input type="text" className="w-full p-3 bg-gray-900 rounded-xl border border-gray-700 text-sm text-white focus:border-blue-500" value={currentBrain.focus} onChange={(e) => updateBrain('focus', e.target.value)} /></div>
                        <div><label className="text-xs font-bold text-gray-400 mb-1 block">✅ 투두 리스트</label><input type="text" className="w-full p-3 bg-gray-900 rounded-xl border border-gray-700 text-sm text-white focus:border-blue-500" value={currentBrain.todos} onChange={(e) => updateBrain('todos', e.target.value)} /></div>
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

              <div className="mb-4"><input type="text" placeholder="현재 상태 메시지" className="w-full p-3 bg-gray-800 rounded-xl border border-gray-700 text-sm focus:border-blue-500 focus:outline-none" value={customMessage} onChange={(e) => setCustomMessage(e.target.value)} /></div>
              <div className="grid grid-cols-3 gap-2 pb-4">
                <button onClick={() => handleStatusChange(selectedSeat.id, '근무중')} className="p-3 bg-gray-800 rounded-xl font-bold text-sm hover:border-green-500 border border-gray-700 transition-colors">🟢 근무중</button>
                <button onClick={() => handleStatusChange(selectedSeat.id, '자리비움')} className="p-3 bg-gray-800 rounded-xl font-bold text-sm hover:border-yellow-500 border border-gray-700 transition-colors">🟡 자리비움</button>
                <button onClick={() => handleStatusChange(selectedSeat.id, '휴가')} className="p-3 bg-gray-800 rounded-xl font-bold text-sm hover:border-red-500 border border-gray-700 transition-colors">🔴 휴가</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);