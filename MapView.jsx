// 1. RAG 및 화면 렌더링용 좌석 데이터
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

function MapView({ setSelectedSeat }) {
  const { useState } = React;
  const MAP_WIDTH = 1000;
  const MAP_HEIGHT = 1000;
  
  // 💡 핵심 1: 모바일 화면에 한눈에 보이도록 초기 배율을 0.45로 줄이고 위치를 중앙으로 당깁니다!
  const [scale, setScale] = useState(0.45);
  const [pos, setPos] = useState({ x: -250, y: -200 }); 
  
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  // 마우스 휠 확대/축소
  const handleWheel = (e) => {
    e.preventDefault(); 
    const scaleAdjust = e.deltaY * -0.001;
    setScale(Math.min(Math.max(0.3, scale + scaleAdjust), 2));
  };

  // 💡 핵심 2: 마우스 클릭 및 모바일 터치 이벤트 통합 (화면 이동)
  const startDrag = (e) => {
    setIsDragging(true);
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    setStartPos({ x: clientX - pos.x, y: clientY - pos.y });
  };

  const onDrag = (e) => {
    if (!isDragging) return;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    setPos({ x: clientX - startPos.x, y: clientY - startPos.y });
  };

  const endDrag = () => setIsDragging(false);

  // 팀 색상 지정
  const getTeamColor = (team) => {
    if (team === '상담') return '#FEF08A';
    if (team === '오토') return '#D9F99D';
    if (team === '재무') return '#BBF7D0';
    if (team === '모바일') return '#FDE047';
    if (team === '솔포인트') return '#A7F3D0';
    return '#E5E7EB'; 
  };

  return (
    <div 
      className="w-full h-[600px] bg-gray-900 relative overflow-hidden flex flex-col"
      onWheel={handleWheel} 
      onMouseDown={startDrag} onMouseMove={onDrag} onMouseUp={endDrag} onMouseLeave={endDrag}
      onTouchStart={startDrag} onTouchMove={onDrag} onTouchEnd={endDrag}
      style={{ cursor: isDragging ? 'grabbing' : 'grab', touchAction: 'none' }}
    >
      
      {/* 화면 조작 안내바 */}
      <div className="absolute top-4 left-4 z-10 bg-gray-800/80 p-3 rounded-lg border border-gray-700">
        <h3 className="text-white font-bold text-sm">💡 좌석배치도 조작법</h3>
        <p className="text-xs text-gray-400">휠/핀치: 줌, 드래그: 이동</p>
      </div>

      {/* 우측 하단 컨트롤러 */}
      <div className="absolute bottom-4 right-4 z-10 flex gap-2">
        <button onClick={() => setScale(s => Math.min(s + 0.2, 2))} className="p-3 bg-gray-800 rounded-full text-white text-sm">+</button>
        <button onClick={() => setScale(s => Math.max(s - 0.2, 0.3))} className="p-3 bg-gray-800 rounded-full text-white text-sm">-</button>
      </div>

      {/* 지도 도화지 (Transform 적용 구역) */}
      <div 
        className="w-full h-full flex items-center justify-center absolute"
        style={{ 
          transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`, 
          transformOrigin: 'center center',
          transition: isDragging ? 'none' : 'transform 0.1s ease-out' 
        }}
      >
        {/* SVG 컨테이너 */}
        <svg 
          viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} 
          width={MAP_WIDTH} 
          height={MAP_HEIGHT} 
          className="bg-gray-800 rounded-[40px] shadow-2xl"
        >
          {/* 엘리베이터 공간 */}
          <rect x="50" y="50" width="900" height="100" fill="#4B5563" rx="10" />
          <text x="500" y="105" fill="#9CA3AF" fontSize="24" fontWeight="bold" textAnchor="middle">
            E/V 및 엘리베이터 홀
          </text>
          
          {/* 좌석 데이터 렌더링 */}
          {SEAT_DATA.map((seat) => (
            <g 
              key={seat.id} 
              transform={`translate(${seat.x}, ${seat.y})`} 
              style={{ cursor: 'pointer' }}
              onClick={(e) => { 
                e.stopPropagation(); // 클릭 시 드래그 방지
                setSelectedSeat(seat); 
                // 좌석 클릭 시 alert 대신 우측 사이드바나 모달로 데이터를 넘길 수 있습니다.
                alert(`${seat.name}(${seat.team}) - 내선번호: ${seat.id}`);
              }}
            >
              {/* 좌석 박스 */}
              <rect width="45" height="65" fill={getTeamColor(seat.team)} rx="4" stroke="#111827" />
              <text x="22.5" y="15" fill="#111827" fontSize="10" fontWeight="bold" textAnchor="middle">{seat.team}</text>
              <text x="22.5" y="32" fill="#000" fontSize="12" fontWeight="bold" textAnchor="middle">{seat.name}</text>
              
              {/* 확대 배율이 1.0 이상일 때만 내선번호 스르륵 표시 */}
              {scale > 1.0 && (
                <text x="22.5" y="50" fill="#374151" fontSize="11" fontWeight="bold" textAnchor="middle">{seat.id}</text>
              )}
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}