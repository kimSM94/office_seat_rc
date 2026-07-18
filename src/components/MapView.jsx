function MapView({ 
  setView, seats, setSelectedSeat, 
  searchQuery, setSearchQuery, 
  highlightedSeatId, isAdmin, vacations 
}) {
  const { useState, useEffect, useRef } = React;
  const [viewState, setViewState] = useState({ x: 0, y: 0, scale: 1 });
  const [center, setCenter] = useState({ x: 0, y: 0 }); 
  const minScaleRef = useRef(0.1); 

  const [localQuery, setLocalQuery] = useState("");
  const [searchedSeatIds, setSearchedSeatIds] = useState([]);

  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [pinchStart, setPinchStart] = useState({ dist: 0, scale: 1 });

  const containerRef = useRef(null);
  const seatArray = Object.values(seats || {});

  const getTodayString = () => {
    const today = new Date();
    const offset = today.getTimezoneOffset() * 60000;
    return new Date(today.getTime() - offset).toISOString().split('T')[0];
  };
  const todayStr = getTodayString();

  const clampView = (newX, newY, newScale) => {
    const mapW = 1650; 
    const mapH = 900;  
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;

    const currentMapW = mapW * newScale;
    const currentMapH = mapH * newScale;

    const limitX = Math.max(0, (currentMapW - screenW) / 2);
    const limitY = Math.max(0, (currentMapH - screenH) / 2);

    return {
      x: Math.max(-limitX, Math.min(newX, limitX)),
      y: Math.max(-limitY, Math.min(newY, limitY)),
      scale: newScale
    };
  };

  useEffect(() => {
    const fitMap = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      const mapW = 1650;
      const mapH = 900;
      const scaleX = w / mapW;
      const scaleY = h / mapH;
      
      const initialScale = Math.min(scaleX, scaleY) * 0.9;
      minScaleRef.current = initialScale;

      // 💡 지도를 화면 정중앙(h/2)이 아니라 위쪽으로 끌어올림! (검색창 아래 100px 여백)
      const topOffset = (mapH * initialScale) / 2 + 100;
      setCenter({ x: w / 2, y: topOffset }); 
      setViewState({ x: 0, y: 0, scale: initialScale });
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
      setViewState(prev => {
        const newScale = Math.min(Math.max(minScaleRef.current, prev.scale + scaleAdjust), 4);
        return clampView(prev.x, prev.y, newScale);
      });
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
    let clientX, clientY;
    if (e.type === 'touchmove') {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
      if (e.touches.length === 2 && pinchStart.dist > 0) {
        const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        const newScale = Math.min(Math.max(minScaleRef.current, pinchStart.scale * (dist / pinchStart.dist)), 4);
        setViewState(prev => clampView(prev.x, prev.y, newScale));
        return;
      }
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    if (!isDragging) return;
    const newX = clientX - startPos.x;
    const newY = clientY - startPos.y;
    setViewState(prev => clampView(newX, newY, prev.scale));
  };
  
  const handleEnd = () => setIsDragging(false);

  const executeLocalSearch = () => {
    const query = (searchQuery !== undefined ? searchQuery : localQuery || '').trim().toLowerCase();
    if (!query) return setSearchedSeatIds([]);
    const matches = seatArray.filter(s => {
      const safeName = String(s.name || '').toLowerCase();
      const safeTeam = String(s.team || '').toLowerCase();
      const safeId = String(s.id || '').toLowerCase();
      return safeName.includes(query) || safeTeam.includes(query) || safeId.includes(query);
    });
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
      <div className="fixed top-4 left-4 z-[60] flex flex-col gap-2 pointer-events-none w-full max-w-md">
        <div className="flex flex-row items-center gap-2 pointer-events-auto">
          <button onClick={() => setView('home')} className="bg-[#374151] text-white w-11 h-11 rounded-lg font-black text-xl border border-gray-500 shadow-md flex items-center justify-center flex-shrink-0 active:bg-gray-600">🔙</button>
          <input type="text" value={actualQuery} onChange={(e) => updateQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && executeLocalSearch()} placeholder="이름/팀 검색" className="w-32 sm:w-48 px-3 py-2 h-11 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:border-blue-500 font-bold text-sm shadow-md" />
          <button onClick={executeLocalSearch} className="bg-blue-600 text-white font-bold px-4 h-11 rounded-lg text-sm shadow-md whitespace-nowrap active:bg-blue-500">검색</button>
        </div>
      </div>

      <svg className="w-full h-full absolute inset-0 touch-none" style={{ cursor: isDragging ? 'grabbing' : 'grab' }}>
        <g transform={`translate(${center.x + viewState.x}, ${center.y + viewState.y}) scale(${viewState.scale})`}>
          <g transform="translate(-830, -405)">
            <rect x="50" y="100" width="1000" height="80" fill="#374151" rx="8" />
            <text x="550" y="145" fill="#9CA3AF" fontSize="28" fontWeight="900" textAnchor="middle">E/V (엘리베이터)</text>
            
            {seatArray.map((seat) => {
              const seatX = seat.x;
              const seatY = seat.y;
              if (!seatX || !seatY) return null; 
              
              const isOnVacation = (vacations || []).some(v => v.emp_id === seat.id && v.start_date <= todayStr && v.end_date >= todayStr);
              const currentStatus = isOnVacation ? '휴가' : seat.status;
              const isHighlighted = (highlightedSeatId === seat.id) || (Array.isArray(searchedSeatIds) && searchedSeatIds.includes(seat.id));
              const isPartLeader = Array.isArray(window.PART_LEADERS) && seat.name ? window.PART_LEADERS.includes(seat.name) : false;
              const theme = typeof window.getTeamTheme === 'function' ? window.getTeamTheme(seat.team) : { hex: '#4B5563', tw: 'bg-gray-500 text-white' };
              
              const strokeColor = isHighlighted ? '#EF4444' : (isPartLeader ? '#F59E0B' : '#111827');
              const strokeWidth = isHighlighted ? '6' : (isPartLeader ? '3' : '1.5'); 

              return (
                <g key={seat.id} transform={`translate(${seatX}, ${seatY})`} 
                  style={{ cursor: 'pointer' }}
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setSelectedSeat(seat); 
                  }}
                >
                  {isPartLeader && <rect x="-4" y="-4" width="68" height="88" fill="none" stroke="#FBBF24" strokeWidth="4" rx="6" className="animate-pulse" />}
                  <rect width="60" height="80" fill={theme.hex} rx="4" stroke={strokeColor} strokeWidth={strokeWidth} />
                  {isPartLeader && <text x="12" y="18" fontSize="12" textAnchor="middle">👑</text>}
                  <text x="30" y="22" fill="#111827" fontSize="12" fontWeight="900" textAnchor="middle">{seat.team || ''}</text>
                  <text x="30" y="45" fill="#000" fontSize="16" fontWeight="900" textAnchor="middle">{seat.name || ''}</text>
                  <text x="30" y="68" fill="#4B5563" fontSize="14" fontWeight="900" textAnchor="middle">{seat.id || ''}</text>
                  
                  {isHighlighted && <circle cx="30" cy="-10" r="12" fill="#EF4444" className="animate-ping" />}
                  
                  {currentStatus && currentStatus !== '공석' && (
                    <g transform="translate(50, 10)">
                      <circle r="8" fill="#111827" />
                      <circle r="6" fill={
                        currentStatus === '근무중' ? '#22C55E' :  
                        currentStatus === '자리비움' ? '#EAB308' : 
                        currentStatus === '휴가' ? '#EF4444' : '#6B7280'
                      } className={currentStatus === '근무중' ? 'animate-pulse' : ''} />
                    </g>
                  )}
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