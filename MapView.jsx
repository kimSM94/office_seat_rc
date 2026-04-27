const { useState } = React;

function MapView({ seatsData = [], setSelectedSeat }) {
  const MAP_WIDTH = 1000;
  const MAP_HEIGHT = 1000;

  // 줌(Scale)과 이동(Position)을 관리하는 상태
  const [scale, setScale] = useState(0.8);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  // 🖱️ 마우스 휠로 확대/축소 (Zoom)
  const handleWheel = (e) => {
    // 부모 창이 스크롤되는 것을 방지
    e.preventDefault(); 
    const scaleAdjust = e.deltaY * -0.001;
    const newScale = Math.min(Math.max(0.3, scale + scaleAdjust), 3);
    setScale(newScale);
  };

  // 🤚 마우스 드래그로 화면 이동 (Pan)
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartPos({ x: e.clientX - pos.x, y: e.clientY - pos.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPos({ x: e.clientX - startPos.x, y: e.clientY - startPos.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  // 팀별 고유 색상
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
      className="w-full h-full bg-gray-900 overflow-hidden relative"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      
      {/* 범례 (안내바) */}
      <div className="absolute top-4 left-4 z-10 bg-gray-800/80 p-4 rounded-xl border border-gray-700 backdrop-blur">
        <h3 className="text-white font-bold mb-2">💡 스마트 좌석배치도</h3>
        <p className="text-sm text-gray-400">마우스 휠: 확대 및 축소</p>
        <p className="text-sm text-gray-400">클릭 후 드래그: 지도 이동</p>
      </div>

      {/* 우측 하단 컨트롤러 */}
      <div className="absolute bottom-6 right-6 z-10 flex gap-2">
        <button onClick={() => setScale(s => Math.min(s + 0.2, 3))} className="p-3 bg-gray-800 rounded-full text-white hover:bg-gray-700">+</button>
        <button onClick={() => setScale(s => Math.max(s - 0.2, 0.3))} className="p-3 bg-gray-800 rounded-full text-white hover:bg-gray-700">-</button>
        <button onClick={() => { setScale(0.8); setPos({x: 0, y: 0}); }} className="p-3 bg-purple-600 rounded-full text-white hover:bg-purple-500">초기화</button>
      </div>

      {/* 지도 캔버스 (Transform 적용) */}
      <div 
        className="w-full h-full flex items-center justify-center"
        style={{ 
          transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`, 
          transition: isDragging ? 'none' : 'transform 0.1s ease-out'
        }}
      >
        <svg width={MAP_WIDTH} height={MAP_HEIGHT} className="bg-gray-800 rounded-3xl shadow-2xl">
          
          {/* 배경 (E/V) */}
          <rect x="50" y="50" width="900" height="100" fill="#374151" rx="10" />
          <text x="500" y="105" fill="#9CA3AF" fontSize="24" fontWeight="bold" textAnchor="middle">
            E/V 및 엘리베이터 홀
          </text>

          {/* 좌석 렌더링 */}
          {seatsData.map((seat) => (
            <g 
              key={seat.id} 
              transform={`translate(${seat.x}, ${seat.y})`}
              onClick={(e) => {
                e.stopPropagation(); // 클릭 시 지도가 드래그되는 현상 방지
                setSelectedSeat(seat);
              }}
              className="cursor-pointer hover:opacity-80 transition-opacity"
            >
              <rect width="45" height="65" fill={getTeamColor(seat.team)} rx="4" stroke="#4B5563" strokeWidth="1" />
              <text x="22.5" y="15" fill="#1F2937" fontSize="10" fontWeight="bold" textAnchor="middle">{seat.team}</text>
              <text x="22.5" y="32" fill="#111827" fontSize="12" fontWeight="900" textAnchor="middle">{seat.name}</text>
              
              {/* ✨ 줌 레벨이 1.2배 이상일 때만 내선번호 표시 */}
              {scale > 1.2 && (
                <text x="22.5" y="50" fill="#4B5563" fontSize="11" fontWeight="bold" textAnchor="middle">
                  {seat.id}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>

    </div>
  );
}

// App.jsx에서 이 컴포넌트를 사용할 수 있도록 전역 객체에 등록!
window.MapView = MapView;