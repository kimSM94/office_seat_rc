function MapView({ setSelectedSeat }) {
  const { useState } = React;
  const MAP_WIDTH = 1000;
  const MAP_HEIGHT = 1000;
  
  // 💡 핵심 1: 화면 크기에 맞춰 초기 배율을 0.35(35%)로 파격적으로 줄입니다!
  const [scale, setScale] = useState(0.35);
  // 💡 핵심 2: 시작 좌표를 무조건 (0, 0) 정중앙으로 잡습니다.
  const [pos, setPos] = useState({ x: 0, y: 0 }); 
  // 💡 핵심 3: 질문자님의 아이디어! 가로 모드 상태 추가
  const [isLandscape, setIsLandscape] = useState(false); 
  
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  // 휠로 줌인/줌아웃
  const handleWheel = (e) => {
    e.preventDefault(); 
    const scaleAdjust = e.deltaY * -0.001;
    setScale(Math.min(Math.max(0.2, scale + scaleAdjust), 2)); // 최소 배율을 0.2까지 더 내림
  };

  // 터치 & 마우스 드래그 (화면 이동)
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
      className="w-full h-[70vh] bg-gray-900 relative overflow-hidden"
      onWheel={handleWheel} 
      onMouseDown={startDrag} onMouseMove={onDrag} onMouseUp={endDrag} onMouseLeave={endDrag}
      onTouchStart={startDrag} onTouchMove={onDrag} onTouchEnd={endDrag}
      style={{ cursor: isDragging ? 'grabbing' : 'grab', touchAction: 'none' }}
    >
      
      {/* 🚀 가로/세로 전환 버튼 (질문자님 아이디어!) */}
      <div className="absolute top-4 right-4 z-20">
        <button 
          onClick={() => setIsLandscape(!isLandscape)}
          className="bg-blue-600 px-4 py-2 rounded-lg font-bold text-white shadow-lg border border-blue-400 hover:bg-blue-500 transition-colors"
        >
          {isLandscape ? "세로로 보기 📱" : "가로로 보기 📺"}
        </button>
      </div>

      <div className="absolute top-4 left-4 z-10 bg-gray-800/80 p-3 rounded-lg border border-gray-700">
        <p className="text-xs text-gray-400">마우스 휠/터치: 줌 & 이동</p>
      </div>

      {/* 💡 핵심 4: CSS를 이용해 도화지를 화면 '정중앙'에 완벽하게 못 박아버립니다! */}
      <div 
        className="absolute top-1/2 left-1/2"
        style={{ 
          width: MAP_WIDTH, 
          height: MAP_HEIGHT,
          marginLeft: -MAP_WIDTH / 2, // 가로 중앙 정렬
          marginTop: -MAP_HEIGHT / 2, // 세로 중앙 정렬
          transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale}) ${isLandscape ? 'rotate(90deg)' : ''}`, 
          transition: isDragging ? 'none' : 'transform 0.15s ease-out' 
        }}
      >
        <svg viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} width={MAP_WIDTH} height={MAP_HEIGHT} className="bg-gray-800 rounded-3xl shadow-2xl">
          <rect x="50" y="50" width="900" height="100" fill="#4B5563" rx="10" />
          <text x="500" y="105" fill="#9CA3AF" fontSize="24" fontWeight="bold" textAnchor="middle">
            E/V 및 엘리베이터 홀
          </text>
          
          {SEAT_DATA.map((seat) => (
            <g 
              key={seat.id} 
              transform={`translate(${seat.x}, ${seat.y})`} 
              style={{ cursor: 'pointer' }}
              onClick={(e) => { 
                e.stopPropagation(); 
                setSelectedSeat(seat);
                alert(`${seat.name}(${seat.team}) - 내선번호: ${seat.id}`);
              }}
            >
              <rect width="45" height="65" fill={getTeamColor(seat.team)} rx="4" stroke="#111827" />
              <text x="22.5" y="15" fill="#111827" fontSize="10" fontWeight="bold" textAnchor="middle">{seat.team}</text>
              <text x="22.5" y="32" fill="#000" fontSize="12" fontWeight="bold" textAnchor="middle">{seat.name}</text>
              {scale > 0.6 && (
                <text x="22.5" y="50" fill="#374151" fontSize="11" fontWeight="bold" textAnchor="middle">{seat.id}</text>
              )}
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}