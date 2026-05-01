function MapView({ 
  setView, rows, cols, seats, setSelectedSeat, 
  searchQuery, setSearchQuery, handleAISearch, handleAIRecommend, 
  isSearching, aiMessage, highlightedSeatId, recommendedSeats 
}) {
  const { useState, useRef, useEffect } = React;
  
  // 💡 핵심 1: 왼쪽이 짤리지 않도록 시작 좌표(VIEW_X)를 -200으로 대폭 후퇴시켜 여백을 엄청나게 줍니다!
  const VIEW_X = -200; 
  const VIEW_Y = -50;
  const VIEW_W = 1800; // 넉넉하게 도화지도 넓힘
  const VIEW_H = 1000;
  
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 }); 
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const seatArray = Array.isArray(seats) ? seats : Object.values(seats || {});

  useEffect(() => {
    const fitMap = () => {
      const screenW = window.innerWidth;
      const screenH = window.innerHeight;
      const scaleX = screenW / VIEW_H; 
      const scaleY = screenH / VIEW_W; 
      // 96% 비율로 꽉 채웁니다.
      setScale(Math.min(scaleX, scaleY) * 0.96);
      setPos({ x: 0, y: 0 }); 
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
      setScale(prev => Math.min(Math.max(0.1, prev + scaleAdjust), 3));
    };
    element.addEventListener('wheel', handleWheel, { passive: false });
    return () => element.removeEventListener('wheel', handleWheel);
  }, []);

  const startDrag = (e) => {
    if (e.target.tagName.toLowerCase() === 'input' || e.target.tagName.toLowerCase() === 'button') return;
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

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 bg-[#1A202C] z-50 overflow-hidden flex items-center justify-center touch-none"
      onMouseDown={startDrag} onMouseMove={onDrag} onMouseUp={endDrag} onMouseLeave={endDrag}
      onTouchStart={startDrag} onTouchMove={onDrag} onTouchEnd={endDrag}
    >
      
      {/* 💡 핵심 2: 뒤로 가기 버튼에 초강력 z-index와 인라인 스타일을 부여해서 무조건 뚫고 나오게 만듭니다! */}
      <button 
        onClick={() => {
          if(setView) setView('home');
          else window.location.reload(); // setView가 끊겨도 새로고침으로 무조건 탈출 가능
        }}
        style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 99999, padding: '12px 20px', backgroundColor: '#1F2937', color: 'white', fontWeight: 'bold', borderRadius: '12px', border: '2px solid #4B5563', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}
      >
        🔙 돌아가기
      </button>

      {/* 💡 핵심 3: AI 검색창도 무조건 화면 맨 위에 고정시킵니다! */}
      <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 99999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input 
            type="text" 
            value={searchQuery || ''} 
            onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)} 
            placeholder="이름/팀 검색"
            style={{ padding: '10px 16px', borderRadius: '8px', backgroundColor: '#1F2937', color: 'white', border: '1px solid #4B5563', outline: 'none' }}
          />
          <button onClick={handleAISearch} style={{ backgroundColor: '#2563EB', color: 'white', fontWeight: 'bold', padding: '10px 16px', borderRadius: '8px' }}>검색</button>
          <button onClick={handleAIRecommend} style={{ backgroundColor: '#9333EA', color: 'white', fontWeight: 'bold', padding: '10px 16px', borderRadius: '8px' }}>AI 추천</button>
        </div>
        
        {aiMessage && (
          <div style={{ backgroundColor: 'rgba(30, 58, 138, 0.9)', border: '1px solid #60A5FA', color: '#DBEAFE', padding: '12px 16px', borderRadius: '8px', maxWidth: '300px', fontSize: '14px', marginTop: '8px' }}>
            {isSearching ? "⏳ AI가 분석 중입니다..." : aiMessage}
          </div>
        )}
      </div>

      <div 
        className="absolute top-1/2 left-1/2 flex items-center justify-center"
        style={{
          width: VIEW_W, height: VIEW_H,
          marginLeft: -VIEW_W / 2, marginTop: -VIEW_H / 2,
          transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale}) rotate(90deg)`, 
          transition: isDragging ? 'none' : 'transform 0.1s ease-out'
        }}
      >
        <svg viewBox={`${VIEW_X} ${VIEW_Y} ${VIEW_W} ${VIEW_H}`} width="100%" height="100%">
          
          {/* 도화지 배경을 명확하게 깔아줍니다 */}
          <rect x={VIEW_X} y={VIEW_Y} width={VIEW_W} height={VIEW_H} fill="#2D3748" rx="40" stroke="#4B5563" strokeWidth="4" />

          <rect x="50" y="100" width="900" height="80" fill="#4A5568" rx="8" />
          <text x="500" y="145" fill="#E2E8F0" fontSize="28" fontWeight="900" textAnchor="middle">E/V (엘리베이터)</text>
          
          {seatArray.map((seat) => {
            if (!seat.x || !seat.y) return null; 

            const isHighlighted = (highlightedSeatId === seat.id) || (recommendedSeats && recommendedSeats.includes(seat.id));
            const strokeColor = isHighlighted ? '#EF4444' : '#111827';
            const strokeWidth = isHighlighted ? '5' : '1.5';

            return (
              <g 
                key={seat.id} transform={`translate(${seat.x}, ${seat.y})`} style={{ cursor: 'pointer' }}
                onClick={(e) => { 
                  e.stopPropagation(); 
                  if(setSelectedSeat) setSelectedSeat(seat);
                  alert(`[${seat.team}] ${seat.name} - 내선: ${seat.id}`);
                }}
              >
                <rect width="60" height="80" fill={getTeamColor(seat.team)} rx="4" stroke={strokeColor} strokeWidth={strokeWidth} />
                <text x="30" y="22" fill="#111827" fontSize="12" fontWeight="800" textAnchor="middle">{seat.team}</text>
                <text x="30" y="45" fill="#000" fontSize="16" fontWeight="900" textAnchor="middle">{seat.name}</text>
                
                {scale > 0.15 && <text x="30" y="68" fill="#4A5568" fontSize="13" fontWeight="900" textAnchor="middle">{seat.id}</text>}
                
                {isHighlighted && (
                  <circle cx="30" cy="-10" r="8" fill="#EF4444" className="animate-ping" />
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}