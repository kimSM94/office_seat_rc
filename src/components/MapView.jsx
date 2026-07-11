function MapView({ 
  setView, seats, setSelectedSeat, 
  searchQuery, setSearchQuery, 
  highlightedSeatId, isAdmin // 👑 App.jsx에서 넘겨준 isAdmin 권한 추가
}) {
  const { useState, useEffect, useRef } = React;
  const [viewState, setViewState] = useState({ x: 0, y: 0, scale: 1 });
  const [center, setCenter] = useState({ x: 0, y: 0 }); 
  const [isPhone, setIsPhone] = useState(false);
  const minScaleRef = useRef(0.1); 

  const [localQuery, setLocalQuery] = useState("");
  const [searchedSeatIds, setSearchedSeatIds] = useState([]);

  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [pinchStart, setPinchStart] = useState({ dist: 0, scale: 1 });
  
  // 👑 [NEW] 관리자 좌석 드래그 편집용 상태
  const [seatDrag, setSeatDrag] = useState({ id: null, startX: 0, startY: 0, initialSeatX: 0, initialSeatY: 0, hasMoved: false });
  const [editedPositions, setEditedPositions] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const containerRef = useRef(null);

  // DB에서 받아온 객체 형태의 seats를 배열로 변환하여 사용
  const seatArray = Object.values(seats);

  useEffect(() => {
    const fitMap = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setCenter({ x: w / 2, y: h / 2 }); 
      const phone = h > w;
      setIsPhone(phone);

      const mapW = 1650;
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

  // 👑 [NEW] 좌석 터치/클릭 시작 핸들러
  const handleSeatStart = (e, seat, currentX, currentY) => {
    if (!isAdmin) return;
    e.stopPropagation(); // 좌석을 잡았을 땐 지도 이동 이벤트 방지
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    
    setSeatDrag({
      id: seat.id,
      startX: clientX,
      startY: clientY,
      initialSeatX: currentX,
      initialSeatY: currentY,
      hasMoved: false
    });
  };

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
        setViewState(prev => ({ ...prev, scale: newScale }));
        return;
      }
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    // 👑 [NEW] 관리자가 좌석을 드래그 중인 경우 (좌표 변환 로직)
    if (seatDrag.id) {
      const dx = clientX - seatDrag.startX;
      const dy = clientY - seatDrag.startY;
      
      // 조금이라도 움직였다면 클릭(상세보기) 방지
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
        setSeatDrag(prev => ({ ...prev, hasMoved: true }));
      }

      let newX, newY;
      if (isPhone) {
        newX = seatDrag.initialSeatX + (dy / viewState.scale);
        newY = seatDrag.initialSeatY - (dx / viewState.scale);
      } else {
        newX = seatDrag.initialSeatX + (dx / viewState.scale);
        newY = seatDrag.initialSeatY + (dy / viewState.scale);
      }

      setEditedPositions(prev => ({ ...prev, [seatDrag.id]: { x: newX, y: newY } }));
      return; // 맵 이동 로직은 실행하지 않음
    }

    // 기존 지도 이동 로직
    if (!isDragging) return;
    const newX = clientX - startPos.x;
    const newY = clientY - startPos.y;

    const mapW = 1650;
    const mapH = 900;
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;

    const currentMapW = (isPhone ? mapH : mapW) * viewState.scale;
    const currentMapH = (isPhone ? mapW : mapH) * viewState.scale;
    const margin = 100;

    const limitX = Math.max(0, (currentMapW - screenW) / 2) + margin;
    const limitY = Math.max(0, (currentMapH - screenH) / 2) + margin;

    const clampedX = Math.max(-limitX, Math.min(newX, limitX));
    const clampedY = Math.max(-limitY, Math.min(newY, limitY));

    setViewState(prev => ({ ...prev, x: clampedX, y: clampedY }));
  };
  
  const handleEnd = () => {
    if (seatDrag.id) {
      setSeatDrag({ id: null, startX: 0, startY: 0, initialSeatX: 0, initialSeatY: 0, hasMoved: false });
    }
    setIsDragging(false);
  };

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

  // 👑 [NEW] 변경된 좌석 DB에 저장
  const handleSavePositions = async () => {
    setIsSaving(true);
    try {
      const updates = Object.entries(editedPositions).map(([id, pos]) => 
        window.api.updateSeatData(id, { x: pos.x, y: pos.y })
      );
      await Promise.all(updates);
      
      alert('좌석 배치가 성공적으로 저장되었습니다!');
      setEditedPositions({});
      window.location.reload(); // 저장 후 변경된 데이터를 다시 불러오기 위해 새로고침
    } catch (error) {
      alert('저장 중 오류가 발생했습니다: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const hasEdits = Object.keys(editedPositions).length > 0;

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

      {/* 👑 [NEW] 관리자 전용 저장 버튼 */}
      {isAdmin && hasEdits && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom flex gap-3 pointer-events-auto">
          <button 
            onClick={handleSavePositions} 
            disabled={isSaving}
            className="bg-green-500 hover:bg-green-400 text-white px-6 py-3 rounded-2xl font-black shadow-[0_0_20px_rgba(34,197,94,0.4)] flex items-center gap-2 transition-all"
          >
            {isSaving ? '⏳ 저장 중...' : '💾 변경된 자리 저장'}
          </button>
          <button 
            onClick={() => setEditedPositions({})} 
            className="bg-gray-600 hover:bg-gray-500 text-white px-5 py-3 rounded-2xl font-bold shadow-lg transition-all"
          >
            취소
          </button>
        </div>
      )}

      <svg className="w-full h-full absolute inset-0 touch-none" style={{ cursor: isDragging ? 'grabbing' : (seatDrag.id ? 'grabbing' : 'grab') }}>
        <g transform={`translate(${center.x + viewState.x}, ${center.y + viewState.y}) scale(${viewState.scale}) ${isPhone ? 'rotate(90)' : ''}`}>
          <g transform="translate(-830, -405)">
            <rect x="50" y="100" width="1000" height="80" fill="#374151" rx="8" />
            <text x="550" y="145" fill="#9CA3AF" fontSize="28" fontWeight="900" textAnchor="middle">E/V (엘리베이터)</text>
            
            {seatArray.map((seat) => {
              // DB에서 받아온 x, y 좌표에 편집 중인 오프셋을 덮어씌움
              const seatX = editedPositions[seat.id]?.x ?? seat.x;
              const seatY = editedPositions[seat.id]?.y ?? seat.y;
              
              if (!seatX || !seatY) return null; 
              
              const isHighlighted = (highlightedSeatId === seat.id) || searchedSeatIds.includes(seat.id);
              const isPartLeader = window.PART_LEADERS.includes(seat.name); 
              
              const strokeColor = isHighlighted ? '#EF4444' : (isPartLeader ? '#F59E0B' : '#111827');
              const strokeWidth = isHighlighted ? '6' : (isPartLeader ? '3' : '1.5'); 

              return (
                <g key={seat.id} transform={`translate(${seatX}, ${seatY})`} 
                  style={{ cursor: isAdmin ? 'move' : 'pointer' }}
                  onMouseDown={(e) => handleSeatStart(e, seat, seatX, seatY)}
                  onTouchStart={(e) => handleSeatStart(e, seat, seatX, seatY)}
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    // 드래그를 한 경우엔 모달이 열리지 않도록 차단
                    if (seatDrag.id === seat.id && seatDrag.hasMoved) return;
                    setSelectedSeat(seat); 
                  }}
                >
                  
                  {isPartLeader && (
                    <rect x="-4" y="-4" width="68" height="88" fill="none" stroke="#FBBF24" strokeWidth="4" rx="6" className="animate-pulse" />
                  )}

                  <rect width="60" height="80" fill={window.getTeamTheme(seat.team).hex} rx="4" stroke={strokeColor} strokeWidth={strokeWidth} />
                  
                  {isPartLeader && <text x="12" y="18" fontSize="12" textAnchor="middle">👑</text>}

                  <text x="30" y="22" fill="#111827" fontSize="12" fontWeight="900" textAnchor="middle">{seat.team}</text>
                  <text x="30" y="45" fill="#000" fontSize="16" fontWeight="900" textAnchor="middle">{seat.name}</text>
                  <text x="30" y="68" fill="#4B5563" fontSize="14" fontWeight="900" textAnchor="middle">{seat.id}</text>
                  
                  {isHighlighted && <circle cx="30" cy="-10" r="12" fill="#EF4444" className="animate-ping" />}

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