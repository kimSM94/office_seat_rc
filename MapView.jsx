function MapView({ 
  setView, seats, setSelectedSeat, 
  searchQuery, setSearchQuery, handleAISearch, handleAIRecommend, 
  isSearching, aiMessage, highlightedSeatId, recommendedSeats 
}) {
  const { useState, useRef, useEffect } = React;
  
  // 💡 도화지를 광활하게 늘려서 Test실(-50)이 절대 짤리지 않습니다!
  const VIEW_X = -150; 
  const VIEW_Y = -100;
  const VIEW_W = 1800; 
  const VIEW_H = 1100;
  
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 }); 
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [isPhone, setIsPhone] = useState(false);
  const containerRef = useRef(null);

  const seatArray = Array.isArray(seats) ? seats : Object.values(seats || {});

  useEffect(() => {
    const fitMap = () => {
      const screenW = window.innerWidth;
      const screenH = window.innerHeight;
      const isPortrait = screenH > screenW;
      setIsPhone(isPortrait);

      const mapW = isPortrait ? VIEW_H : VIEW_W;
      const mapH = isPortrait ? VIEW_W : VIEW_H;

      const scaleX = screenW / mapW; 
      const scaleY = screenH / mapH; 
      setScale(Math.min(scaleX, scaleY) * 0.95);
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
      
      {/* 🚀 이 버튼이 보이면 캐시가 정상적으로 뚫린 겁니다! */}
      <button 
        onClick={() => {
          if (typeof setView === 'function') setView('home');
          else window.location.reload(); 
        }}
        className="absolute z-[99999] bg-gray-800 text-white px-5 py-3 rounded-xl font-bold border-2 border-gray-600 shadow-2xl"
        style={{ top: '30px', left: '20px' }}
      >
        🔙 홈으로 돌아가기
      </button>

      {/* 🤖 AI 검색창 */}
      <div 
        className="absolute z-[99999] flex flex-col items-end gap-2"
        style={{ top: '30px', right: '20px' }}
      >
        <div className="flex gap-2">
          <input 
            type="text" 
            value={searchQuery || ''} 
            onChange={(e) => typeof setSearchQuery === 'function' && setSearchQuery(e.target.value)} 
            placeholder="이름/팀 검색"
            className="px-4 py-3 rounded-xl bg-gray-800 text-white border-2 border-gray-600 focus:outline-none focus:border-blue-500 w-[180px] sm:w-[250px]"
          />
          <button onClick={handleAISearch} className="bg-blue-600 text-white font-bold px-4 py-3 rounded-xl shadow-lg">검색</button>
          <button onClick={handleAIRecommend} className="bg-purple-600 text-white font-bold px-4 py-3 rounded-xl shadow-lg">AI 추천</button>
        </div>
        
        {aiMessage && (
          <div className="bg-blue-900/90 border border-blue-400 text-blue-100 px-4 py-3 rounded-xl max-w-[300px] text-sm shadow-xl">
            {isSearching ? "⏳ AI가 분석 중입니다..." : aiMessage}
          </div>
        )}
      </div>

      <div 
        className="absolute top-1/2 left-1/2 flex items-center justify-center"
        style={{
          width: VIEW_W, height: VIEW_H,
          marginLeft: -VIEW_W / 2, marginTop: -VIEW_H / 2,
          transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale}) ${isPhone ? 'rotate(90deg)' : ''}`, 
          transition: isDragging ? 'none' : 'transform 0.1s ease-out'
        }}
      >
        <svg viewBox={`${VIEW_X} ${VIEW_Y} ${VIEW_W} ${VIEW_H}`} width="100%" height="100%">
          
          <rect x="50" y="100" width="900" height="80" fill="#374151" rx="8" />
          <text x="500" y="145" fill="#9CA3AF" fontSize="28" fontWeight="900" textAnchor="middle">E/V (엘리베이터)</text>
          
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
                  if(typeof setSelectedSeat === 'function') setSelectedSeat(seat);
                  alert(`[${seat.team}] ${seat.name} - 내선: ${seat.id}`);
                }}
              >
                <rect width="60" height="80" fill={getTeamColor(seat.team)} rx="4" stroke={strokeColor} strokeWidth={strokeWidth} />
                <text x="30" y="22" fill="#111827" fontSize="12" fontWeight="800" textAnchor="middle">{seat.team}</text>
                <text x="30" y="45" fill="#000" fontSize="16" fontWeight="900" textAnchor="middle">{seat.name}</text>
                
                {scale > 0.15 && <text x="30" y="68" fill="#4B5563" fontSize="13" fontWeight="900" textAnchor="middle">{seat.id}</text>}
                
                {isHighlighted && (
                  <circle cx="30" cy="-10" r="10" fill="#EF4444" className="animate-ping" />
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}