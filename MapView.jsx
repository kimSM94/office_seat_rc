function MapView({ setSelectedSeat }) {
  const { useState, useRef, useEffect } = React;
  // 💡 가로형 지도에 맞게 도화지 사이즈를 1600으로 대폭 확대!
  const MAP_WIDTH = 1600;
  const MAP_HEIGHT = 900;
  
  // 처음 켰을 때 한눈에 보이도록 축소
  const [scale, setScale] = useState(0.25);
  const [pos, setPos] = useState({ x: 0, y: 0 }); 
  const [isLandscape, setIsLandscape] = useState(false); 
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const mapRef = useRef(null);

  useEffect(() => {
    const element = mapRef.current;
    if (!element) return;
    const handleWheel = (e) => {
      e.preventDefault(); 
      const scaleAdjust = e.deltaY * -0.001;
      setScale(prev => Math.min(Math.max(0.15, prev + scaleAdjust), 2));
    };
    element.addEventListener('wheel', handleWheel, { passive: false });
    return () => element.removeEventListener('wheel', handleWheel);
  }, []);

  const startDrag = (e) => {
    setIsDragging(true);
    const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
    setStartPos({ x: clientX - pos.x, y: clientY - pos.y });
  };

  const onDrag = (e) => {
    if (!isDragging) return;
    const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
    setPos({ x: clientX - startPos.x, y: clientY - startPos.y });
  };

  const endDrag = () => setIsDragging(false);

  // 팀별 고유 색상 매핑 (사진과 비슷하게)
  const getTeamColor = (team) => {
    if (team === '상담' || team === '팀장') return '#FDE047'; // 노란색
    if (team.includes('오토') || team === 'SSO') return '#D9F99D'; // 연두색
    if (team === '솔포인트' || team === '발급') return '#86EFAC'; // 밝은 녹색
    if (team === '재무') return '#BEF264'; // 연두빛
    if (team === '홈페이지' || team.includes('개발전담') || team === '올댓' || team === '전자문서') return '#A3E635'; // 진녹색
    if (team.includes('마이카') || team === '데이타비즈') return '#84CC16'; 
    if (team.includes('모바일') || team.includes('디스커버')) return '#FCD34D'; // 주황/노랑
    return '#E5E7EB'; // 기본 회색 (본부장, Test실, 공용 등)
  };

  return (
    <div 
      ref={mapRef}
      className="w-full h-[75vh] bg-gray-900 relative overflow-hidden rounded-xl border border-gray-700"
      onMouseDown={startDrag} onMouseMove={onDrag} onMouseUp={endDrag} onMouseLeave={endDrag}
      onTouchStart={startDrag} onTouchMove={onDrag} onTouchEnd={endDrag}
      style={{ cursor: isDragging ? 'grabbing' : 'grab', touchAction: 'none' }}
    >
      
      {/* 가로/세로 전환 버튼 */}
      <div className="absolute top-4 right-4 z-20">
        <button 
          onClick={() => setIsLandscape(!isLandscape)}
          className="bg-purple-600 px-4 py-2 rounded-lg font-bold text-white shadow-lg border border-purple-400 hover:bg-purple-500 transition-colors"
        >
          {isLandscape ? "세로로 보기 📱" : "넓게 눕혀 보기 📺"}
        </button>
      </div>

      <div className="absolute top-4 left-4 z-10 bg-gray-800/80 p-3 rounded-lg border border-gray-700">
        <p className="text-xs text-gray-400 font-bold">15층 신한DS개발팀 전체 도면</p>
        <p className="text-[10px] text-gray-500 mt-1">드래그로 이동, 휠/핀치로 확대</p>
      </div>

      {/* 도화지 중앙 고정 영역 */}
      <div 
        className="absolute top-1/2 left-1/2"
        style={{ 
          width: MAP_WIDTH, height: MAP_HEIGHT,
          marginLeft: -MAP_WIDTH / 2, marginTop: -MAP_HEIGHT / 2,
          transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale}) ${isLandscape ? 'rotate(90deg)' : ''}`, 
          transition: isDragging ? 'none' : 'transform 0.1s ease-out' 
        }}
      >
        <svg viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} width="100%" height="100%" className="bg-[#2D3748] rounded-[40px] shadow-2xl border-4 border-gray-700">
          
          {/* 엘리베이터(E/V) 구역 (넓게) */}
          <rect x="50" y="100" width="900" height="80" fill="#4A5568" rx="8" />
          <text x="500" y="145" fill="#A0AEC0" fontSize="28" fontWeight="900" textAnchor="middle">
            E/V (엘리베이터)
          </text>
          
          {/* 전체 좌석 렌더링 */}
          {SEAT_DATA.map((seat) => (
            <g 
              key={seat.id} 
              transform={`translate(${seat.x}, ${seat.y})`} 
              style={{ cursor: 'pointer' }}
              onClick={(e) => { 
                e.stopPropagation(); 
                setSelectedSeat(seat);
                alert(`[${seat.team}] ${seat.name} - 내선번호: ${seat.id}`);
              }}
            >
              <rect width="60" height="80" fill={getTeamColor(seat.team)} rx="4" stroke="#1A202C" strokeWidth="1.5" />
              <text x="30" y="22" fill="#1A202C" fontSize="12" fontWeight="800" textAnchor="middle">{seat.team}</text>
              <text x="30" y="45" fill="#000" fontSize="16" fontWeight="900" textAnchor="middle">{seat.name}</text>
              
              {/* 확대 배율이 0.4 이상일 때 내선번호 스르륵 등장 */}
              {scale > 0.4 && (
                <text x="30" y="68" fill="#4A5568" fontSize="13" fontWeight="900" textAnchor="middle">{seat.id}</text>
              )}
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}