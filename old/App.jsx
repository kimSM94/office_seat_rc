const { useState, useEffect, useRef } = React;

const rows = ['A', 'B', 'C', 'D', 'E'];
const cols = Array.from({ length: 10 }, (_, i) => i + 1);
const zones = ['개발팀', '디자인팀', '기획팀', '프리랜서존'];

const SEAT_DATA = [
  // ==========================================
  // [왼쪽 별도 구역] 본부장 / Test실 (1열 바로 왼쪽 부착)
  // ==========================================
  {id: "Test", name: "Test실", team: "공용", x: 30, y: 700},
  {id: "1475", name: "서강석", team: "본부장", x: 30, y: 790},

  // ==========================================
  // [그룹 1] 1열 & 2열
  // ==========================================
  // 1열
  {id: "1224", name: "박준형", team: "상담", x: 100, y: 250}, {id: "1609", name: "김동혁", team: "상담", x: 100, y: 340}, {id: "1255", name: "김성훈", team: "운영혁신", x: 100, y: 430}, {id: "1413", name: "신규", team: "빈자리", x: 100, y: 520}, {id: "9901", name: "김범", team: "운영혁신", x: 100, y: 610}, {id: "1479", name: "이동은", team: "기획", x: 100, y: 700}, {id: "1401", name: "서성훈", team: "팀장", x: 100, y: 790},
  // 2열
  {id: "1483", name: "김기훈", team: "상담", x: 170, y: 250}, {id: "1285", name: "이소연", team: "상담", x: 170, y: 340}, {id: "1788", name: "장병용", team: "상담", x: 170, y: 430}, {id: "1712", name: "장성호", team: "솔포인트", x: 170, y: 520}, {id: "1137", name: "박남호", team: "솔포인트", x: 170, y: 610}, {id: "1369", name: "강선희", team: "솔포인트", x: 170, y: 700},

  // ==========================================
  // [그룹 2] 3열 & 4열
  // ==========================================
  // 3열
  {id: "1485", name: "이장규", team: "상담", x: 260, y: 250}, {id: "1797", name: "김지연", team: "상담", x: 260, y: 340}, {id: "9903", name: "김상민", team: "상담", x: 260, y: 430}, {id: "1364", name: "김윤호", team: "상담", x: 260, y: 520}, {id: "8625", name: "김지영", team: "상담", x: 260, y: 610}, {id: "1280", name: "조경훈", team: "상담", x: 260, y: 700},
  // 4열
  {id: "1437", name: "김영필", team: "오토", x: 330, y: 250}, {id: "1448", name: "김세희", team: "오토", x: 330, y: 340}, {id: "1978", name: "홍영기", team: "오토", x: 330, y: 430}, {id: "1880", name: "박지건", team: "오토", x: 330, y: 520}, {id: "1489", name: "남진아", team: "오토", x: 330, y: 610}, {id: "1461", name: "조용진", team: "오토", x: 330, y: 700}, {id: "1979", name: "김종현", team: "오토", x: 330, y: 790},

  // ==========================================
  // [그룹 3] 5열 & 6열
  // ==========================================
  // 5열
  {id: "1814", name: "윤호영", team: "오토", x: 420, y: 250}, {id: "1741", name: "김선혜", team: "오토", x: 420, y: 340}, {id: "1642", name: "김준석", team: "오토", x: 420, y: 430}, {id: "1464", name: "이성학", team: "오토", x: 420, y: 520}, {id: "1288", name: "김보령", team: "오토", x: 420, y: 610}, {id: "1442", name: "박용탁", team: "오토", x: 420, y: 700}, {id: "1753", name: "김원규", team: "재무", x: 420, y: 790},
  // 6열
  {id: "1480", name: "조성인", team: "오토", x: 490, y: 250}, {id: "8680", name: "표동수", team: "오토", x: 490, y: 340}, {id: "1465", name: "김현석", team: "오토", x: 490, y: 430}, {id: "1317", name: "김예린", team: "오토", x: 490, y: 520}, {id: "1825", name: "박대윤", team: "오토", x: 490, y: 610}, {id: "1537", name: "김현우", team: "오토", x: 490, y: 700}, {id: "1477", name: "정재문", team: "재무", x: 490, y: 790},

  // ==========================================
  // [그룹 4] 7열 & 8열
  // ==========================================
  // 7열
  {id: "1351", name: "이하나", team: "재무", x: 580, y: 250}, {id: "1803", name: "심혜진", team: "재무", x: 580, y: 340}, {id: "1414", name: "유미숙", team: "재무", x: 580, y: 430}, {id: "1375", name: "김우철", team: "재무", x: 580, y: 520}, {id: "8892", name: "김연섭", team: "통합메시지", x: 580, y: 610}, {id: "1380", name: "이현지", team: "발급", x: 580, y: 700}, {id: "OA", name: "기동OA", team: "공용", x: 580, y: 790},
  // 8열
  {id: "1866", name: "이승인", team: "개발전담", x: 650, y: 250}, {id: "1188", name: "방성원", team: "개발전담", x: 650, y: 340}, {id: "1861", name: "시일교", team: "통합메시지", x: 650, y: 430}, {id: "1290", name: "박재훈", team: "통합메세지", x: 650, y: 520}, {id: "1292", name: "강윤지", team: "통합메세지", x: 650, y: 610}, {id: "1310", name: "임태욱", team: "통합메세지", x: 650, y: 700}, {id: "1293", name: "홍성민", team: "통합메세지", x: 650, y: 790},

  // ==========================================
  // [그룹 5] 9열 & 10열
  // ==========================================
  // 9열
  {id: "1331", name: "황병용", team: "개발전담", x: 740, y: 250}, {id: "1332", name: "이준상", team: "개발전담", x: 740, y: 340}, {id: "1268", name: "정강호", team: "마이카", x: 740, y: 430}, {id: "1446", name: "김지민", team: "마이카", x: 740, y: 520}, {id: "1942", name: "변상현", team: "마이카", x: 740, y: 610}, {id: "1878", name: "임형진", team: "마이카", x: 740, y: 700}, {id: "1726", name: "김경원", team: "발급", x: 740, y: 790},
  // 10열
  {id: "1946", name: "조성훈", team: "개발전담", x: 810, y: 250}, {id: "8884", name: "박은혜", team: "올댓", x: 810, y: 340}, {id: "8885", name: "강용선", team: "올댓", x: 810, y: 430}, {id: "8886", name: "이민호", team: "올댓", x: 810, y: 520}, {id: "8658", name: "함덕훈", team: "홈페이지", x: 810, y: 610}, {id: "8687", name: "이선아", team: "홈페이지", x: 810, y: 700}, {id: "1778", name: "이현경", team: "홈페이지", x: 810, y: 790},

  // ==========================================
  // [그룹 6] 11열 & 12열
  // ==========================================
  // 11열
  {id: "1943", name: "김찬수", team: "개발전담", x: 900, y: 250}, {id: "1865", name: "김규동", team: "개발전담", x: 900, y: 340}, {id: "1258", name: "이나현", team: "홈페이지", x: 900, y: 430}, {id: "1945", name: "박종원", team: "홈페이지", x: 900, y: 520}, {id: "1478", name: "용원중", team: "홈페이지", x: 900, y: 610}, {id: "8686", name: "김성우", team: "홈페이지", x: 900, y: 700}, {id: "1266", name: "명보민", team: "홈페이지", x: 900, y: 790},
  // 12열
  {id: "1870", name: "최승아", team: "개발전담", x: 970, y: 250}, {id: "1947", name: "유현규", team: "개발전담", x: 970, y: 340}, {id: "1842", name: "박재환", team: "홈페이지", x: 970, y: 430}, {id: "1394", name: "김혜경", team: "홈페이지", x: 970, y: 520}, {id: "1443", name: "이영주", team: "홈페이지", x: 970, y: 610}, {id: "7499", name: "최호영", team: "홈페이지", x: 970, y: 700}, {id: "1333", name: "신정은", team: "홈페이지", x: 970, y: 790},

  // ==========================================
  // [그룹 7] 13열 & 14열
  // ==========================================
  // 13열
  {id: "1734", name: "최현철", team: "데이타비즈", x: 1060, y: 250}, {id: "1730", name: "유지은", team: "데이타비즈", x: 1060, y: 340}, {id: "1863", name: "박다은", team: "개발전담", x: 1060, y: 430}, {id: "1934", name: "오선영", team: "홈페이지", x: 1060, y: 520}, {id: "1138", name: "임진철", team: "홈페이지", x: 1060, y: 610}, {id: "1875", name: "홍지연", team: "홈페이지", x: 1060, y: 700}, {id: "8048", name: "이시원", team: "홈페이지", x: 1060, y: 790},
  // 14열
  {id: "", name: "공석", team: "공석", x: 1130, y: 250}, {id: "1735", name: "박선용", team: "데이타비즈", x: 1130, y: 340}, {id: "1366", name: "조철현", team: "전자문서", x: 1130, y: 430}, {id: "1773", name: "정종규", team: "전자문서", x: 1130, y: 520}, {id: "8181", name: "김종오", team: "홈페이지", x: 1130, y: 610}, {id: "8180", name: "박동영", team: "홈페이지", x: 1130, y: 700}, {id: "8627", name: "김홍섭", team: "홈페이지", x: 1130, y: 790},

  // ==========================================
  // [그룹 8] 15열 & 16열
  // ==========================================
  // 15열
  {id: "1896", name: "민광진", team: "모바일(PLCC)", x: 1220, y: 250}, {id: "1897", name: "이봉원", team: "모바일(PLCC)", x: 1220, y: 340}, {id: "1476", name: "임영우", team: "모바일", x: 1220, y: 430}, {id: "1131", name: "진은성", team: "모바일", x: 1220, y: 520}, {id: "1869", name: "김도현", team: "모바일", x: 1220, y: 610}, {id: "8144", name: "박증원", team: "모바일", x: 1220, y: 700}, {id: "1132", name: "임지우", team: "모바일", x: 1220, y: 790},
  // 16열
  {id: "1607", name: "윤학민", team: "모바일", x: 1290, y: 250}, {id: "7547", name: "송효범", team: "모바일", x: 1290, y: 340}, {id: "1955", name: "김은정", team: "모바일", x: 1290, y: 430}, {id: "8016", name: "서은빈", team: "모바일", x: 1290, y: 520}, {id: "8159", name: "김성민", team: "모바일", x: 1290, y: 610}, {id: "8191", name: "김지수", team: "모바일", x: 1290, y: 700}, {id: "1841", name: "권예림", team: "모바일", x: 1290, y: 790},

  // ==========================================
  // [그룹 9] 17열 (마지막 홀수열)
  // ==========================================
  {id: "1316", name: "한민지", team: "모바일", x: 1380, y: 250}, {id: "1315", name: "김지해", team: "모바일", x: 1380, y: 340}, {id: "1811", name: "유지원", team: "모바일", x: 1380, y: 430}, {id: "1294", name: "조호영", team: "모바일", x: 1380, y: 520}, {id: "8182", name: "임종완", team: "모바일", x: 1380, y: 610}, {id: "8353", name: "승무준", team: "모바일", x: 1380, y: 700}, {id: "8183", name: "이종민", team: "모바일", x: 1380, y: 790},

  // ==========================================
  // 디스커버 존 (우측 상단 독립구역)
  // ==========================================
  {id: "8727", name: "김재용", team: "디스커버", x: 1060, y: 20}, {id: "8729", name: "정상은", team: "디스커버", x: 1140, y: 20}, {id: "8712", name: "김찬연", team: "디스커버", x: 1220, y: 20}, {id: "7167", name: "남주석", team: "디스커버", x: 1300, y: 20},
  {id: "8782", name: "김현진", team: "디스커버", x: 1060, y: 110}, {id: "1793", name: "전진", team: "디스커버", x: 1140, y: 110}, {id: "8713", name: "이동표", team: "디스커버", x: 1220, y: 110}, {id: "8190", name: "장진역", team: "디스커버", x: 1300, y: 110}, {id: "8168", name: "신재준", team: "디스커버", x: 1380, y: 110}
];

// 파트장 명단 선언 (오타 대비 기존 데이터 이름도 포함)
const PART_LEADERS = ['조경훈', '김종현', '김종오', '김흥섭', '김홍섭', '강선희', '김연섭', '이종민', '이종인', '정재문'];

// 🎨 확실하게 구분되는 무지개 파스텔톤 팀 컬러 매핑 (세분화 완료)
const getTeamTheme = (team) => {
  if (!team) return { hex: '#E5E7EB', tw: 'bg-gray-300 text-gray-800 border-gray-400' };
  
  if (team === '상담' || team === '팀장') return { hex: '#FDE047', tw: 'bg-yellow-300 text-yellow-900 border-yellow-400' }; 
  if (team === '운영혁신' || team === '기획') return { hex: '#FCA5A5', tw: 'bg-red-300 text-red-900 border-red-400' };
  if (team.includes('오토') || team === 'SSO') return { hex: '#D9F99D', tw: 'bg-lime-300 text-lime-900 border-lime-400' }; 
  if (team === '솔포인트' || team === '발급') return { hex: '#6EE7B7', tw: 'bg-emerald-300 text-emerald-900 border-emerald-400' }; 
  if (team === '재무') return { hex: '#67E8F9', tw: 'bg-cyan-300 text-cyan-900 border-cyan-400' }; 
  
  // 파란색 계열 분리
  if (team.includes('개발전담')) return { hex: '#818CF8', tw: 'bg-indigo-300 text-indigo-900 border-indigo-400' }; 
  if (team === '홈페이지' || team === '전자문서') return { hex: '#93C5FD', tw: 'bg-blue-300 text-blue-900 border-blue-400' }; 
  if (team === '올댓') return { hex: '#7DD3FC', tw: 'bg-sky-300 text-sky-900 border-sky-400' }; 
  
  // 보라/핑크 계열 분리
  if (team.includes('마이카')) return { hex: '#C4B5FD', tw: 'bg-violet-300 text-violet-900 border-violet-400' }; 
  if (team === '데이타비즈') return { hex: '#E879F9', tw: 'bg-fuchsia-300 text-fuchsia-900 border-fuchsia-400' }; 
  if (team.includes('모바일')) return { hex: '#F9A8D4', tw: 'bg-pink-300 text-pink-900 border-pink-400' }; 
  if (team.includes('디스커버')) return { hex: '#FDA4AF', tw: 'bg-rose-300 text-rose-900 border-rose-400' }; 
  
  if (team === '본부장' || team === '공용') return { hex: '#D1D5DB', tw: 'bg-gray-300 text-gray-900 border-gray-400 font-bold' };

  return { hex: '#E5E7EB', tw: 'bg-gray-200 text-gray-800 border-gray-400' }; 
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

      const mapW = 1650; // 맵 너비 확장
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
    let newX, newY;

    if (e.type === 'touchmove') {
      if (e.touches.length === 2 && pinchStart.dist > 0) {
        const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        const newScale = Math.min(Math.max(minScaleRef.current, pinchStart.scale * (dist / pinchStart.dist)), 4);
        setViewState(prev => ({ ...prev, scale: newScale }));
        return;
      }
      if (!isDragging) return;
      newX = e.touches[0].clientX - startPos.x;
      newY = e.touches[0].clientY - startPos.y;
    } else {
      if (!isDragging) return;
      newX = e.clientX - startPos.x;
      newY = e.clientY - startPos.y;
    }

    // 🛑 맵 전체 크기 (기존에 설정한 1650 x 900 기준)
    const mapW = 1650;
    const mapH = 900;
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;

    // 📱 모바일(isPhone)일 때는 가로세로가 90도 뒤집힌 상태이므로 반대로 계산!
    const currentMapW = (isPhone ? mapH : mapW) * viewState.scale;
    const currentMapH = (isPhone ? mapW : mapH) * viewState.scale;

    // 🧱 여유 공간 (화면 가장자리에서 빈 공간이 보일 수 있는 최대치)
    const margin = 100;

    // 📐 지도가 화면보다 크면 남는 공간만큼만 이동 허용, 화면보다 작으면 100px 밖으로 못 나가게 가둠
    const limitX = Math.max(0, (currentMapW - screenW) / 2) + margin;
    const limitY = Math.max(0, (currentMapH - screenH) / 2) + margin;

    // 최종 좌표를 한계치(limit) 안으로 강제 고정 (Clamp)
    const clampedX = Math.max(-limitX, Math.min(newX, limitX));
    const clampedY = Math.max(-limitY, Math.min(newY, limitY));

    setViewState(prev => ({ ...prev, x: clampedX, y: clampedY }));
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
          {/* 전체 맵 가운데 정렬을 위해 X축 translate값 소폭 조정 (-830) */}
          <g transform="translate(-830, -405)">
            {/* E/V 박스 가로 넓이 및 텍스트 위치 재조정 */}
            <rect x="50" y="100" width="1000" height="80" fill="#374151" rx="8" />
            <text x="550" y="145" fill="#9CA3AF" fontSize="28" fontWeight="900" textAnchor="middle">E/V (엘리베이터)</text>
            
            {seatArray.map((seat) => {
              if (!seat.x || !seat.y) return null; 
              
              const isHighlighted = (highlightedSeatId === seat.id) || searchedSeatIds.includes(seat.id);
              const isPartLeader = PART_LEADERS.includes(seat.name); // 파트장 여부 확인
              
              const strokeColor = isHighlighted ? '#EF4444' : (isPartLeader ? '#F59E0B' : '#111827');
              const strokeWidth = isHighlighted ? '6' : (isPartLeader ? '3' : '1.5'); 

              return (
                <g key={seat.id} transform={`translate(${seat.x}, ${seat.y})`} style={{ cursor: 'pointer' }}
                  onClick={(e) => { e.stopPropagation(); setSelectedSeat(seat); }}>
                  
                  {/* ✨ 파트장 전용 빛나는(pulse) 아우라 이펙트 */}
                  {isPartLeader && (
                    <rect x="-4" y="-4" width="68" height="88" fill="none" stroke="#FBBF24" strokeWidth="4" rx="6" className="animate-pulse" />
                  )}

                  <rect width="60" height="80" fill={getTeamTheme(seat.team).hex} rx="4" stroke={strokeColor} strokeWidth={strokeWidth} />
                  
                  {/* 👑 파트장 왕관 아이콘 */}
                  {isPartLeader && <text x="12" y="18" fontSize="12" textAnchor="middle">👑</text>}

                  <text x="30" y="22" fill="#111827" fontSize="12" fontWeight="900" textAnchor="middle">{seat.team}</text>
                  <text x="30" y="45" fill="#000" fontSize="16" fontWeight="900" textAnchor="middle">{seat.name}</text>
                  <text x="30" y="68" fill="#4B5563" fontSize="14" fontWeight="900" textAnchor="middle">{seat.id}</text>
                  
                  {isHighlighted && <circle cx="30" cy="-10" r="12" fill="#EF4444" className="animate-ping" />}

                  {/* 🔴🟡🟢 상태 뱃지 표시 */}
                  {seat.status && seat.status !== '공석' && (
                    <g transform="translate(50, 10)">
                      <circle r="8" fill="#111827" />
                      <circle r="6" fill={
                        seat.status === '근무중' ? '#22C55E' :  
                        seat.status === '자리비움' ? '#EAB308' : 
                        seat.status === '휴가' ? '#EF4444' : '#6B7280'
                      } className={seat.status === '근무중' ? 'animate-pulse' : ''} />
                    </g>
                  )}

                  {/* 💬 상태 메시지 표시 */}
                  {seat.status_message && (
                    <text x="30" y="95" fill="#D1D5DB" fontSize="12" fontWeight="bold" textAnchor="middle">
                      💬 {seat.status_message.length > 7 ? seat.status_message.slice(0, 7) + '..' : seat.status_message}
                    </text>
                  )}
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
// 2. 홈 화면 (Home) 컴포넌트 🌟
// ==========================================
function Home({ setView, user }) {
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
        result = window.api ? await window.api.getTeamChemistry(mappedMembers) : "팀 궁합 결과입니다. 환상의 케미를 자랑하네요!";
      } else {
        const formattedMyBirth = `${myYear}-${String(myMonth).padStart(2, '0')}-${String(myDay).padStart(2, '0')}`;
        if (!myName) throw new Error("본인 이름을 입력해주세요!");
        
        if (sajuMode === 'individual') {
          result = window.api ? await window.api.getTodaySaju(myName, formattedMyBirth) : "오늘의 운세입니다. 모든 일이 술술 풀릴 것입니다!";
        } else {
          const formattedPartnerBirth = `${partnerYear}-${String(partnerMonth).padStart(2, '0')}-${String(partnerDay).padStart(2, '0')}`;
          if (!partnerName) throw new Error("동료의 이름을 입력해주세요!");
          result = window.api ? await window.api.getOfficeChemistry(myName, formattedMyBirth, partnerName, formattedPartnerBirth) : "1:1 궁합 결과입니다. 서로 부족한 점을 채워주는 좋은 관계입니다!";
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
      const resultText = window.api ? await window.api.triggerLunchMatch() : "AI 맛집 추천: 오늘은 근처 든든한 국밥집을 추천합니다!"; 
      setLunchResult(resultText); 
    } catch (error) {
      alert(error.message); 
    } finally {
      setIsLunchLoading(false); 
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 bg-gray-900 text-white animate-in fade-in relative overflow-hidden">
      
      <button onClick={() => setView('admin')} className="absolute top-6 right-6 text-xs text-gray-400 hover:text-white font-bold bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-xl border border-gray-700 transition-colors flex items-center gap-1 shadow-md z-50">
        ⚙️ 관리자 모드
      </button>

      <div className="text-center mb-10 z-10">
        <h1 className="text-4xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
          Smart Office
        </h1>
        <p className="text-gray-400">환영합니다, <span className="font-bold text-white">{user?.id || '게스트'}</span>님!</p>
      </div>

      <div className="w-full max-w-md space-y-4 z-10">
        <button onClick={() => setIsSajuInputOpen(true)} className="w-full p-5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 rounded-2xl font-black text-lg text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all active:scale-95 flex justify-center">
          🔮 오늘의 오피스 운세 & 직장 궁합
        </button>

        <button onClick={handleLunchMatchClick} className="w-full p-5 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-400 hover:to-pink-400 rounded-2xl font-black text-lg text-white shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-all active:scale-95 flex justify-center">
          🍱 AI 맛집 탐험대
        </button>
        
        <button onClick={() => setView('map')} className="w-full p-5 bg-gray-800 hover:bg-gray-700 rounded-2xl font-bold text-lg border border-gray-700 transition-all flex items-center justify-center gap-2">🗺️ 오피스 전체 지도 보기</button>
        <button onClick={() => setView('zone')} className="w-full p-5 bg-gray-800 hover:bg-gray-700 rounded-2xl font-bold text-lg border border-gray-700 transition-all flex items-center justify-center gap-2">🏢 부서별/구역별 현황</button>
      </div>

      {isSajuLoading && (
        <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-md flex flex-col items-center justify-center z-[100] animate-in fade-in duration-300">
          <div className="text-7xl animate-bounce mb-6">🔮</div>
          <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 animate-pulse text-center">우주의 기운을<br/>모으고 있습니다...</h3>
          <p className="text-gray-400 mt-4 text-sm font-medium">도사님이 오피스 명리학 데이터를 분석 중입니다 📜</p>
        </div>
      )}

      {isLunchLoading && (
        <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-md flex flex-col items-center justify-center z-[100] animate-in fade-in duration-300">
          <div className="text-7xl animate-bounce mb-6">🍱</div>
          <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-400 animate-pulse text-center">주변 맛집을<br/>탐색하고 있습니다...</h3>
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
                      {idx >= 2 && <button onClick={() => handleRemoveMember(member.id)} className="absolute top-2 right-2 text-gray-500 hover:text-red-400 text-xs">✕</button>}
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

      <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
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
function ZoneView({ setView, seats, setHighlightedSeatId }) {
  const combinedSeats = SEAT_DATA.map(seat => ({ ...seat, ...(seats[seat.id] || {}) }));
  const groupedByTeam = combinedSeats.reduce((acc, seat) => {
    if (!acc[seat.team]) acc[seat.team] = [];
    acc[seat.team].push(seat);
    return acc;
  }, {});

  const sortedTeams = Object.keys(groupedByTeam).sort((a, b) => groupedByTeam[b].length - groupedByTeam[a].length);

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
            const theme = getTeamTheme(teamName);
            const colorClass = theme.tw;

            return (
              <div key={teamName} className="bg-gray-800 border border-gray-700 rounded-2xl p-5 shadow-lg flex flex-col">
                <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-3">
                  <h3 className="text-xl font-black text-gray-100 flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${colorClass.split(' ')[0]}`}></span>{teamName}
                  </h3>
                  <span className="bg-gray-900 text-gray-300 font-bold px-3 py-1 rounded-lg text-sm border border-gray-700">{members.length}명</span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {members.map((member) => (
                    <button key={member.id}
                      onClick={() => {
                        setHighlightedSeatId(member.id);
                        setView('map');
                      }}
                      className={`py-1.5 px-1 rounded-lg text-sm font-bold border transition-transform hover:scale-105 active:scale-95 shadow-sm truncate text-center ${colorClass} ${PART_LEADERS.includes(member.name) ? 'ring-2 ring-yellow-400' : ''}`}
                    >
                      {PART_LEADERS.includes(member.name) ? '👑 ' : ''}{member.name}
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
  const [user, setUser] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const empId = params.get('id');
    return { id: empId }; // URL에 파라미터가 없으면 undefined 상태
  });
  const [view, setView] = useState('home'); 
  const [seats, setSeats] = useState({});
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [highlightedSeatId, setHighlightedSeatId] = useState(null);
  
  const [customMessage, setCustomMessage] = useState('');
  const [secondBrainData, setSecondBrainData] = useState({});

  useEffect(() => {
    if (selectedSeat) {
      setCustomMessage(seats[selectedSeat.id]?.status_message || '');
    } else {
      setCustomMessage('');
    }
  }, [selectedSeat?.id, seats]);

  const handleStatusChange = (id, newStatus) => {
    setSeats(prev => ({ ...prev, [id]: { ...(prev[id] || {}), status: newStatus, status_message: customMessage } }));
  };

  // 🔒 권한 체크: URL 파라미터로 받은 사번(id)과 선택한 좌석의 id가 일치하는지 확인 (관리자는 예외)
  const isMySeat = selectedSeat?.id === user?.id || user?.id === 'admin';

  return (
    <div className="h-full flex flex-col relative bg-gray-900 text-white">
      {view === 'home' && <Home setView={setView} user={user} />}
      {view === 'map' && <MapView setView={setView} seats={seats} setSelectedSeat={setSelectedSeat} highlightedSeatId={highlightedSeatId} />}
      {view === 'admin' && <AdminView setView={setView} seats={seats} setSeats={setSeats} />}
      {view === 'zone' && <ZoneView setView={setView} seats={seats} setHighlightedSeatId={setHighlightedSeatId} />}

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

              {/* === 권한에 따른 상태 변경 UI 노출 === */}
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
                /* 내 자리가 아닐 때는 수정 불가, 보기 모드만 제공 */
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
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);