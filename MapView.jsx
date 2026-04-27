const { useState } = React;
const { TransformWrapper, TransformComponent } = window.ReactZoomPanPinch;

export default function MapView({ seatsData, setSelectedSeat }) {
  // SVG 전체 캔버스 크기
  const MAP_WIDTH = 1000;
  const MAP_HEIGHT = 1000;

  // 팀별 고유 색상 매핑
  const getTeamColor = (team) => {
    if (team === '상담') return '#FEF08A'; // 노란색
    if (team === '오토') return '#D9F99D'; // 연두색
    if (team === '재무') return '#BBF7D0'; // 민트색
    if (team === '모바일') return '#FDE047'; // 짙은 노란색
    if (team === '솔포인트') return '#A7F3D0';
    return '#E5E7EB'; // 기본 회색 (공석 등)
  };

  return (
    <div className="w-full h-full bg-gray-900 overflow-hidden relative">
      
      {/* 범례 (안내바) */}
      <div className="absolute top-4 left-4 z-10 bg-gray-800/80 p-4 rounded-xl border border-gray-700 backdrop-blur">
        <h3 className="text-white font-bold mb-2">💡 스마트 좌석배치도</h3>
        <p className="text-sm text-gray-400">마우스 휠로 확대/축소가 가능합니다.</p>
        <p className="text-sm text-gray-400">확대하면 내선번호와 세부 정보가 보입니다.</p>
      </div>

      {/* 부드러운 Zoom & Pan 구현 */}
      <TransformWrapper
        initialScale={0.8}
        minScale={0.3}
        maxScale={3}
        centerOnInit={true}
      >
        {({ zoomIn, zoomOut, resetTransform, state }) => (
          <React.Fragment>
            
            {/* 확대/축소 컨트롤러 */}
            <div className="absolute bottom-6 right-6 z-10 flex gap-2">
              <button onClick={() => zoomIn()} className="p-3 bg-gray-800 rounded-full text-white hover:bg-gray-700">+</button>
              <button onClick={() => zoomOut()} className="p-3 bg-gray-800 rounded-full text-white hover:bg-gray-700">-</button>
              <button onClick={() => resetTransform()} className="p-3 bg-purple-600 rounded-full text-white hover:bg-purple-500">초기화</button>
            </div>

            <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }}>
              
              {/* SVG로 도면 그리기 */}
              <svg width={MAP_WIDTH} height={MAP_HEIGHT} className="bg-gray-800 rounded-3xl m-8">
                
                {/* 배경 (E/V 및 기본 구조) */}
                <rect x="50" y="50" width="900" height="100" fill="#374151" rx="10" />
                <text x="500" y="105" fill="#9CA3AF" fontSize="24" fontWeight="bold" textAnchor="middle">
                  E/V 및 엘리베이터 홀
                </text>

                {/* 데이터 기반 좌석 렌더링 */}
                {seatsData.map((seat) => (
                  <g 
                    key={seat.id} 
                    transform={`translate(${seat.x}, ${seat.y})`}
                    onClick={() => setSelectedSeat(seat)}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    {/* 좌석 박스 */}
                    <rect 
                      width="45" 
                      height="65" 
                      fill={getTeamColor(seat.team)} 
                      rx="4" 
                      stroke="#4B5563" 
                      strokeWidth="1"
                    />
                    
                    {/* 팀명 (항상 보임) */}
                    <text x="22.5" y="15" fill="#1F2937" fontSize="10" fontWeight="bold" textAnchor="middle">
                      {seat.team}
                    </text>
                    
                    {/* 이름 (항상 보임) */}
                    <text x="22.5" y="32" fill="#111827" fontSize="12" fontWeight="900" textAnchor="middle">
                      {seat.name}
                    </text>

                    {/* 내선번호 (✨ 줌을 1.5배 이상 당겼을 때만 스르륵 나타남!) */}
                    {state.scale > 1.5 && (
                      <text x="22.5" y="50" fill="#4B5563" fontSize="11" fontWeight="bold" textAnchor="middle" style={{ animation: 'fadeIn 0.3s ease-in' }}>
                        {seat.id}
                      </text>
                    )}
                  </g>
                ))}
              </svg>

            </TransformComponent>
          </React.Fragment>
        )}
      </TransformWrapper>
    </div>
  );
}

window.MapView = MapView;