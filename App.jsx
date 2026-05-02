const { useState, useEffect, useRef } = React;

const rows = ['A', 'B', 'C', 'D', 'E'];
const cols = Array.from({ length: 10 }, (_, i) => i + 1);
const zones = ['개발팀', '디자인팀', '기획팀', '프리랜서존'];

const SEAT_DATA = [
  // --- 🟢 기존 직원 데이터 ---
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

  // --- 🚨 추가된 가상 데이터 (이빨 빠진 공간 채우기) ---
  {id: "9901", name: "이주원", team: "운영혁신", x: 50, y: 610},
  {id: "9902", name: "김태형", team: "솔포인트", x: 120, y: 790},
  {id: "9903", name: "김상민", team: "상담", x: 190, y: 430},
  {id: "9904", name: "최정우", team: "상담", x: 190, y: 790},
  {id: "9905", name: "송지아", team: "재무", x: 580, y: 520},
  {id: "9906", name: "한동훈", team: "개발전담", x: 1060, y: 250},
  {id: "9907", name: "윤지호", team: "개발전담", x: 1060, y: 340},
  {id: "9908", name: "강태오", team: "모바일", x: 1130, y: 250},
  {id: "9909", name: "배수지", team: "모바일", x: 1220, y: 340}
];

function MapView({ 
  setView, seats, setSelectedSeat, 
  searchQuery, setSearchQuery, 
  highlightedSeatId, recommendedSeats 
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
  const seatArray = Array.isArray(seats) && seats.length > 0 ? seats : SEAT_DATA;

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

      setViewState({
        x: 0, 
        y: phone ? 40 : 0, 
        scale: initialScale 
      });
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
  
  const handleEnd = () => {
    setIsDragging(false);
    setPinchStart({ dist: 0, scale: 1 });
  };

  const executeLocalSearch = () => {
    const query = (searchQuery !== undefined ? searchQuery : localQuery).trim().toLowerCase();
    
    if (!query) {
      setSearchedSeatIds([]);
      return;
    }

    const matches = seatArray.filter(s => 
      (s.name && s.name.toLowerCase().includes(query)) ||
      (s.team && s.team.toLowerCase().includes(query)) ||
      (s.id && s.id.toLowerCase().includes(query))
    );

    setSearchedSeatIds(matches.map(m => m.id));
  };

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

  const actualQuery = searchQuery !== undefined ? searchQuery : localQuery;
  const updateQuery = (val) => {
    if (typeof setSearchQuery === 'function') setSearchQuery(val);
    setLocalQuery(val);
  };

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 bg-[#1A202C] overflow-hidden"
      style={{ touchAction: 'none' }}
      onMouseDown={handleStart} onMouseMove={handleMove} onMouseUp={handleEnd} onMouseLeave={handleEnd}
      onTouchStart={handleStart} onTouchMove={handleMove} onTouchEnd={handleEnd}
    >
      
      <div className="absolute top-4 left-4 z-50 flex flex-col gap-2 pointer-events-none w-full max-w-md">
        <div className="flex flex-row items-center gap-2 pointer-events-auto">
          
          <button 
            onClick={() => {
              if (typeof setView === 'function') setView('home');
              else window.location.reload(); 
            }}
            className="bg-[#374151] text-white w-11 h-11 rounded-lg font-black text-xl border border-gray-500 shadow-md flex items-center justify-center flex-shrink-0 active:bg-gray-600"
          >
            🔙
          </button>

          <input 
            type="text" 
            value={actualQuery} 
            onChange={(e) => updateQuery(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && executeLocalSearch()} 
            placeholder="이름/팀 검색"
            className="w-32 sm:w-48 px-3 py-2 h-11 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:border-blue-500 font-bold text-sm shadow-md"
          />
          
          <button onClick={executeLocalSearch} className="bg-blue-600 text-white font-bold px-4 h-11 rounded-lg text-sm shadow-md whitespace-nowrap active:bg-blue-500">
            검색
          </button>
        </div>
      </div>

      <svg className="w-full h-full absolute inset-0 touch-none" style={{ cursor: isDragging ? 'grabbing' : 'grab' }}>
        <g transform={`translate(${center.x + viewState.x}, ${center.y + viewState.y}) scale(${viewState.scale}) ${isPhone ? 'rotate(90)' : ''}`}>
          <g transform="translate(-670, -405)">
            <rect x="50" y="100" width="900" height="80" fill="#374151" rx="8" />
            <text x="500" y="145" fill="#9CA3AF" fontSize="28" fontWeight="900" textAnchor="middle">E/V (엘리베이터)</text>
            
            {seatArray.map((seat) => {
              if (!seat.x || !seat.y) return null; 
              
              const isHighlighted = (highlightedSeatId === seat.id) || 
                                    (recommendedSeats && recommendedSeats.includes(seat.id)) ||
                                    searchedSeatIds.includes(seat.id);
                                    
              const strokeColor = isHighlighted ? '#EF4444' : '#111827';
              const strokeWidth = isHighlighted ? '6' : '1.5'; 

              return (
                <g 
                  key={seat.id} transform={`translate(${seat.x}, ${seat.y})`} style={{ cursor: 'pointer' }}
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    if(typeof setSelectedSeat === 'function') setSelectedSeat(seat);
                  }}
                >
                  <rect width="60" height="80" fill={getTeamColor(seat.team)} rx="4" stroke={strokeColor} strokeWidth={strokeWidth} />
                  <text x="30" y="22" fill="#111827" fontSize="12" fontWeight="900" textAnchor="middle">{seat.team}</text>
                  <text x="30" y="45" fill="#000" fontSize="16" fontWeight="900" textAnchor="middle">{seat.name}</text>
                  <text x="30" y="68" fill="#4B5563" fontSize="14" fontWeight="900" textAnchor="middle">{seat.id}</text>
                  {isHighlighted && <circle cx="30" cy="-10" r="10" fill="#EF4444" className="animate-ping" />}
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
// 1. 메인 App 컴포넌트
// ==========================================
function App() {
  const [user, setUser] = useState(null); 
  const [view, setView] = useState('home'); 
  const [seats, setSeats] = useState({});
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [customMessage, setCustomMessage] = useState('');
  // 🚨 [수정] 찌꺼기 방지를 위해 초기값을 빈 객체로 설정
  const [secondBrainData, setSecondBrainData] = useState({});
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [highlightedSeatId, setHighlightedSeatId] = useState(null);
  const [recommendedSeats, setRecommendedSeats] = useState([]); 
  const [aiMessage, setAiMessage] = useState('');

  useEffect(() => {
    const savedSession = localStorage.getItem('office_user_session');
    
    if (savedSession) {
      const { userData, expiry } = JSON.parse(savedSession);
      
      if (Date.now() < expiry) {
        setUser(userData);
      } else {
        localStorage.removeItem('office_user_session');
        alert("세션이 만료되어 다시 로그인해주세요.");
      }
    }
    setIsLoading(false); 
  }, []);

  const handleLoginSuccess = (userData) => {
    const ONE_HOUR = 60 * 60 * 1000; 
    const sessionData = {
      userData: userData,
      expiry: Date.now() + ONE_HOUR 
    };
    
    localStorage.setItem('office_user_session', JSON.stringify(sessionData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('office_user_session');
    setUser(null);
    window.location.reload(); 
  };

  useEffect(() => {
    if (!user) return; 

    const loadInitialData = async () => {
      try {
        const data = await window.api.fetchSeats();
        const seatsObj = {};
        data.forEach(seat => { seatsObj[seat.id] = seat; });
        setSeats(seatsObj);
      } catch (error) {
        console.error('데이터 로드 실패:', error);
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

  if (!user) return <AuthView onLoginSuccess={handleLoginSuccess} />;
  if (isLoading) return <div className="h-screen w-full bg-gray-900 flex items-center justify-center text-white font-bold">오피스 데이터 동기화 중...</div>;

  const isMySeat = selectedSeat?.name === user.name;

  return (
    <div className="h-full flex flex-col relative bg-gray-900 text-white">
      {view === 'home' && <Home setView={setView} user={user} seats={seats} />}
      {view === 'map' && <MapView setView={setView} rows={rows} cols={cols} seats={seats} setSelectedSeat={setSelectedSeat} searchQuery={searchQuery} setSearchQuery={setSearchQuery} handleAISearch={handleAISearch} handleAIRecommend={handleAIRecommend} isSearching={isSearching} aiMessage={aiMessage} highlightedSeatId={highlightedSeatId} recommendedSeats={recommendedSeats} />}
      {view === 'admin' && <AdminView setView={setView} seats={seats} />}
      {view === 'zone' && <ZoneView setView={setView} seats={seats} setSelectedSeat={setSelectedSeat} zones={zones} />}

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

              {/* 💡 핵심 수정: 각 자리마다 고유한 데이터를 갖도록 수정 */}
              {selectedSeat.status !== '공석' && (() => {
                
                const currentBrain = secondBrainData[selectedSeat.id] || { focus: '', todos: '', links: '' };
                
                const updateBrain = (field, value) => {
                  setSecondBrainData(prev => ({
                    ...prev,
                    [selectedSeat.id]: { ...currentBrain, [field]: value }
                  }));
                };

                return (
                  <div className="bg-gray-800/60 p-5 rounded-2xl border border-gray-700 mb-6 shadow-inner">
                    <h4 className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-4 flex items-center gap-2">
                      🧠 {selectedSeat.name}의 Second Brain
                    </h4>
                    {isMySeat ? (
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-bold text-gray-400 mb-1 block">🎯 오늘의 핵심 포커스</label>
                          <input type="text" className="w-full p-3 bg-gray-900 rounded-xl border border-gray-700 text-sm text-white focus:border-blue-500 focus:outline-none placeholder-gray-600" 
                            value={currentBrain.focus} 
                            onChange={(e) => updateBrain('focus', e.target.value)} 
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-400 mb-1 block">✅ 투두 리스트 (쉼표로 구분)</label>
                          <input type="text" className="w-full p-3 bg-gray-900 rounded-xl border border-gray-700 text-sm text-white focus:border-blue-500 focus:outline-none placeholder-gray-600" 
                            value={currentBrain.todos} 
                            onChange={(e) => updateBrain('todos', e.target.value)} 
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-400 mb-1 block">🔗 주요 프로젝트 링크</label>
                          <input type="text" className="w-full p-3 bg-gray-900 rounded-xl border border-gray-700 text-sm text-blue-400 focus:border-blue-500 focus:outline-none placeholder-gray-600" 
                            value={currentBrain.links} 
                            onChange={(e) => updateBrain('links', e.target.value)} 
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {currentBrain.focus && (<div><span className="text-xs text-gray-500 font-bold block mb-1">🎯 오늘의 포커스</span><p className="text-sm text-white font-medium bg-gray-900 p-3 rounded-xl border border-gray-700">{currentBrain.focus}</p></div>)}
                        {currentBrain.todos && (<div><span className="text-xs text-gray-500 font-bold block mb-2">✅ 투두 리스트</span><div className="space-y-2 bg-gray-900 p-3 rounded-xl border border-gray-700">{currentBrain.todos.split(',').map((todo, idx) => (<div key={idx} className="flex items-center gap-2 text-sm text-gray-300"><div className="w-4 h-4 rounded border border-gray-600 flex-shrink-0"></div><span>{todo.trim()}</span></div>))}</div></div>)}
                        {currentBrain.links && (<div><span className="text-xs text-gray-500 font-bold block mb-1">🔗 프로젝트 링크</span><a href={currentBrain.links.startsWith('http') ? currentBrain.links : `https://${currentBrain.links}`} target="_blank" rel="noreferrer" className="text-sm text-blue-400 hover:text-blue-300 underline block bg-gray-900 p-3 rounded-xl border border-gray-700 break-all">{currentBrain.links}</a></div>)}
                        {!currentBrain.focus && !currentBrain.todos && !currentBrain.links && (<p className="text-sm text-gray-500 text-center py-4">아직 등록된 업무 정보가 없습니다.</p>)}
                      </div>
                    )}
                  </div>
                );
              })()}

              {selectedSeat.status !== '공석' && (
                <>
                  <div className="mb-4">
                    <input type="text" placeholder="현재 상태 메시지 (예: 15시까지 미팅)" className="w-full p-3 bg-gray-800 rounded-xl border border-gray-700 text-sm focus:border-blue-500 focus:outline-none" 
                      value={customMessage} 
                      onChange={(e) => setCustomMessage(e.target.value)} 
                    />
                  </div>
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
// 2. 홈 화면 (Home) 컴포넌트
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

  const handleLunchMatchClick = async () => {
    setIsLunchLoading(true); 
    try {
      const resultText = await window.api.triggerLunchMatch(); 
      setLunchResult(resultText); 
    } catch (error) {
      alert(error.message); 
    } finally {
      setIsLunchLoading(false); 
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
          <span>🍱 AI 맛집 탐험대 (주변 맛집 찾기)</span>
        </button>
        
        <button onClick={() => setView('map')} className="w-full p-5 bg-gray-800 hover:bg-gray-700 rounded-2xl font-bold text-lg border border-gray-700 transition-all flex items-center justify-center gap-2">🗺️ 오피스 전체 지도 보기</button>
        <button onClick={() => setView('zone')} className="w-full p-5 bg-gray-800 hover:bg-gray-700 rounded-2xl font-bold text-lg border border-gray-700 transition-all flex items-center justify-center gap-2">🏢 부서별/구역별 현황</button>
      </div>

      {isSajuLoading && (
        <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-md flex flex-col items-center justify-center z-[100] animate-in fade-in duration-300">
          <div className="text-7xl animate-bounce mb-6">🔮</div>
          <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 animate-pulse text-center">
            우주의 기운을<br/>모으고 있습니다...
          </h3>
          <p className="text-gray-400 mt-4 text-sm font-medium">도사님이 오피스 명리학 데이터를 분석 중입니다 📜</p>
        </div>
      )}

      {isLunchLoading && (
        <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-md flex flex-col items-center justify-center z-[100] animate-in fade-in duration-300">
          <div className="text-7xl animate-bounce mb-6">🍱</div>
          <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-400 animate-pulse text-center">
            주변 맛집을<br/>탐색하고 있습니다...
          </h3>
          <p className="text-gray-400 mt-4 text-sm font-medium">AI가 GPS 반경 2km 이내의 핫플을 스캔 중입니다 📡</p>
        </div>
      )}

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

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);