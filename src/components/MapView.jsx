function MapView({ 
  setView, seats, setSeats, setSelectedSeat, 
  searchQuery, setSearchQuery, 
  highlightedSeatId, isAdmin, vacations, selectedFloor 
}) {
  const { useState, useEffect, useRef } = React;
  const [viewState, setViewState] = useState({ x: 0, y: 0, scale: 1 });
  const [center, setCenter] = useState({ x: 0, y: 0 }); 
  const minScaleRef = useRef(0.1); 

  const [localQuery, setLocalQuery] = useState("");
  const [searchedSeatIds, setSearchedSeatIds] = useState([]);

  const [isDraggingMap, setIsDraggingMap] = useState(false);
  const [mapStartPos, setMapStartPos] = useState({ x: 0, y: 0 });
  const [pinchStart, setPinchStart] = useState({ dist: 0, scale: 1 });

  const [draggingSeatId, setDraggingSeatId] = useState(null);
  const [seatStartPos, setSeatStartPos] = useState({ x: 0, y: 0, origX: 0, origY: 0 });
  const [hasMovedSeat, setHasMovedSeat] = useState(false);

  const containerRef = useRef(null);
  
  const seatArray = Object.values(seats || {}).filter(s => (s.floor || 15) === selectedFloor);

  const getTodayString = () => {
    const today = new Date();
    const offset = today.getTimezoneOffset() * 60000;
    return new Date(today.getTime() - offset).toISOString().split('T')[0];
  };
  const todayStr = getTodayString();

  const clampView = (newX, newY, newScale, currentCenter = center) => {
    const mapW = 1650; const mapH = 900;  
    const screenW = window.innerWidth; const screenH = window.innerHeight;
    const currentMapW = mapW * newScale; const currentMapH = mapH * newScale;
    const limitX = Math.max(0, (currentMapW - screenW) / 2) + 500;
    const headerHeight = 110; 
    const minY = headerHeight + (currentMapH / 2) - currentCenter.y;
    const maxY = Math.max(0, (currentMapH - screenH) / 2) + 800;

    return {
      x: Math.max(-limitX, Math.min(newX, limitX)),
      y: Math.max(minY, Math.min(newY, maxY)), 
      scale: newScale
    };
  };

  useEffect(() => {
    const fitMap = () => {
      const w = window.innerWidth; const h = window.innerHeight;
      const scaleX = w / 1650; const scaleY = h / 900;
      const initialScale = Math.min(scaleX, scaleY) * 0.9;
      minScaleRef.current = initialScale;
      const topOffset = 110; 
      const newCenterY = topOffset + (900 * initialScale) / 2;
      setCenter({ x: w / 2, y: newCenterY }); 
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
        return clampView(prev.x, prev.y, newScale, center);
      });
    };
    element.addEventListener('wheel', handleWheel, { passive: false });
    return () => element.removeEventListener('wheel', handleWheel);
  }, [center]);

  const handleStart = (e) => {
    if (e.target.tagName.toLowerCase() === 'input' || e.target.tagName.toLowerCase() === 'button') return;
    
    let clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    let clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;

    if (e.type === 'touchstart' && e.touches.length === 2) {
      const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      setPinchStart({ dist, scale: viewState.scale });
      setIsDraggingMap(false);
      return;
    }
    
    if (!draggingSeatId) {
      setIsDraggingMap(true);
      setMapStartPos({ x: clientX - viewState.x, y: clientY - viewState.y });
    }
  };
  
  const handleSeatDragStart = (e, seat) => {
    if (!isAdmin) return;
    e.stopPropagation(); 
    setDraggingSeatId(seat.id);
    setHasMovedSeat(false);
    
    let clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    let clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
    
    setSeatStartPos({ x: clientX, y: clientY, origX: seat.x, origY: seat.y });
  };

  const handleMove = (e) => {
    let clientX, clientY;
    if (e.type === 'touchmove') {
      clientX = e.touches[0].clientX; clientY = e.touches[0].clientY;
      if (e.touches.length === 2 && pinchStart.dist > 0) {
        const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        const newScale = Math.min(Math.max(minScaleRef.current, pinchStart.scale * (dist / pinchStart.dist)), 4);
        setViewState(prev => clampView(prev.x, prev.y, newScale, center));
        return;
      }
    } else {
      clientX = e.clientX; clientY = e.clientY;
    }

    if (draggingSeatId) {
      setHasMovedSeat(true);
      const dx = (clientX - seatStartPos.x) / viewState.scale;
      const dy = (clientY - seatStartPos.y) / viewState.scale;
      
      setSeats(prev => ({
        ...prev,
        [draggingSeatId]: {
          ...prev[draggingSeatId],
          x: seatStartPos.origX + dx,
          y: seatStartPos.origY + dy
        }
      }));
      return;
    }

    if (isDraggingMap) {
      const newX = clientX - mapStartPos.x;
      const newY = clientY - mapStartPos.y;
      setViewState(prev => clampView(newX, newY, prev.scale, center));
    }
  };
  
  const handleEnd = async () => {
    if (draggingSeatId) {
      if (hasMovedSeat) {
        const movedSeat = seats[draggingSeatId];
        try {
          await window.api.updateSeatPosition(movedSeat.id, Math.round(movedSeat.x), Math.round(movedSeat.y));
        } catch(err) {
          console.error("좌석 이동 저장 실패:", err);
        }
      }
      setDraggingSeatId(null);
    }
    setIsDraggingMap(false);
  };

  const executeLocalSearch = () => {
    const query = (searchQuery !== undefined ? searchQuery : localQuery || '').trim().toLowerCase();
    if (!query) return setSearchedSeatIds([]);
    const matches = seatArray.filter(s => {
      const safeName = String(s.name || '').toLowerCase();
      const safeTeam = String(s.team || '').toLowerCase();
      return safeName.includes(query) || safeTeam.includes(query);
    });
    setSearchedSeatIds(matches.map(m => m.id));
  };

  const handleAddSeat = async () => {
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    const svgX = (screenW / 2 - center.x - viewState.x) / viewState.scale + 830;
    const svgY = (screenH / 2 - center.y - viewState.y) / viewState.scale + 405;

    const newId = 'S_' + Date.now().toString().slice(-6);
    const newSeat = {
      id: newId,
      name: '새 좌석',
      team: '소속 없음',
      floor: selectedFloor,
      x: Math.round(svgX),
      y: Math.round(svgY),
      status: '공석'
    };

    try {
      const created = await window.api.addSeat(newSeat);
      const savedSeat = created || newSeat; 
      setSeats(prev => ({ ...prev, [savedSeat.id]: savedSeat }));
      alert(`[${selectedFloor}F] 화면 중앙에 새 좌석이 추가되었습니다!\n원하는 곳으로 드래그해서 위치를 맞추고, 클릭하여 이름을 수정하세요.`);
    } catch (e) {
      alert('좌석 생성 실패: ' + e.message);
    }
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
        <div className="flex flex-row items-center gap-2 pointer-events-auto flex-wrap">
          <button onClick={() => setView('floors')} className="bg-[#374151] text-white w-11 h-11 rounded-lg font-black text-xl border border-gray-500 shadow-md flex items-center justify-center flex-shrink-0 active:bg-gray-600">🔙</button>
          
          <div className="flex items-center gap-2 bg-gray-800 p-1.5 rounded-lg border border-gray-600 shadow-md">
            <span className="text-blue-400 font-black px-2">{selectedFloor}F</span>
            <input type="text" value={actualQuery} onChange={(e) => updateQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && executeLocalSearch()} placeholder="이름 검색" className="w-24 sm:w-32 bg-transparent text-white focus:outline-none font-bold text-sm" />
            <button onClick={executeLocalSearch} className="bg-blue-600 text-white font-bold px-3 py-1.5 rounded-md text-sm active:bg-blue-500">검색</button>
          </div>
          
          {isAdmin && (
            <button 
              onClick={handleAddSeat} 
              className="bg-green-600 text-white font-bold px-3 h-11 rounded-lg text-sm shadow-md whitespace-nowrap active:bg-green-500 flex items-center gap-1 border border-green-400/30"
            >
              ➕ 좌석 추가
            </button>
          )}
        </div>
      </div>

      <svg className="w-full h-full absolute inset-0 touch-none" style={{ cursor: isDraggingMap ? 'grabbing' : 'grab' }}>
        <g transform={`translate(${center.x + viewState.x}, ${center.y + viewState.y}) scale(${viewState.scale})`}>
          <g transform="translate(-830, -405)">
            <rect x="50" y="100" width="1000" height="80" fill="#374151" rx="8" />
            <text x="550" y="145" fill="#9CA3AF" fontSize="28" fontWeight="900" textAnchor="middle">E/V (엘리베이터) - {selectedFloor}층</text>

            {seatArray.map((seat) => {
              const seatX = seat.x;
              const seatY = seat.y;
              if (seatX === undefined || seatY === undefined) return null; 
              
              const isOnVacation = (vacations || []).some(v => v.emp_id === seat.id && v.start_date <= todayStr && v.end_date >= todayStr);
              const currentStatus = isOnVacation ? '휴가' : seat.status;
              
              // 💡 검색된 좌석인지 확인
              const isSearched = Array.isArray(searchedSeatIds) && searchedSeatIds.includes(seat.id);
              const isHighlighted = (highlightedSeatId === seat.id) || isSearched;
              
              const isPartLeader = Array.isArray(window.PART_LEADERS) && seat.name ? window.PART_LEADERS.includes(seat.name) : false;
              const theme = typeof window.getTeamTheme === 'function' ? window.getTeamTheme(seat.team) : { hex: '#4B5563', tw: 'bg-gray-500 text-white' };
              
              const strokeColor = isHighlighted ? '#EF4444' : (isPartLeader ? '#F59E0B' : '#111827');
              const strokeWidth = isHighlighted ? '6' : (isPartLeader ? '3' : '1.5'); 

              const isDraggingThis = draggingSeatId === seat.id;

              return (
                <g key={seat.id} transform={`translate(${seatX}, ${seatY})`} 
                  style={{ cursor: isAdmin ? (isDraggingThis ? 'grabbing' : 'grab') : 'pointer' }}
                  onMouseDown={(e) => handleSeatDragStart(e, seat)}
                  onTouchStart={(e) => handleSeatDragStart(e, seat)}
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    if (hasMovedSeat) return; 
                    setSelectedSeat(seat); 
                  }}
                >
                  {isPartLeader && <rect x="-4" y="-4" width="68" height="88" fill="none" stroke="#FBBF24" strokeWidth="4" rx="6" className="animate-pulse" />}
                  <g opacity={isDraggingThis ? 0.7 : 1}>
                    <rect width="60" height="80" fill={theme.hex} rx="4" stroke={strokeColor} strokeWidth={strokeWidth} />
                    {isPartLeader && <text x="12" y="18" fontSize="12" textAnchor="middle">👑</text>}
                    <text x="30" y="22" fill="#111827" fontSize="12" fontWeight="900" textAnchor="middle">{seat.team || ''}</text>
                    <text x="30" y="45" fill="#000" fontSize="16" fontWeight="900" textAnchor="middle">{seat.name || ''}</text>
                    <text x="30" y="68" fill="#4B5563" fontSize="14" fontWeight="900" textAnchor="middle">{seat.id || ''}</text>
                    
                    {/* 기존 빨간 핑 애니메이션 유지 */}
                    {isHighlighted && <circle cx="30" cy="-10" r="12" fill="#EF4444" className="animate-ping" />}
                    
                    {/* 🎯 [NEW] 검색 시 시선을 확 끄는 Bouncing 파란색 화살표 추가! */}
                    {isSearched && (
                      <g className="animate-bounce">
                        {/* 화살표 몸통 (좌석의 최상단(30, -5)을 가리키는 디자인) */}
                        <path d="M 22 -35 L 38 -35 L 38 -20 L 48 -20 L 30 -2 L 12 -20 L 22 -20 Z" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="2" />
                        <text x="30" y="-42" fill="#60A5FA" fontSize="14" fontWeight="900" textAnchor="middle">HERE!</text>
                      </g>
                    )}

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
                  </g>
                </g>
              );
            })}
          </g>
        </g>
      </svg>
    </div>
  );
}