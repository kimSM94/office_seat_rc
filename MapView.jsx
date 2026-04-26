const { useState } = React;

function MapView({ 
  setView, rows, cols, seats, setSelectedSeat,
  searchQuery, setSearchQuery, 
  handleAISearch, handleAIRecommend, // 검색과 추천 각각 매핑
  isSearching, aiMessage, highlightedSeatId, recommendedSeats 
}) {
  const [scale, setScale] = useState(0.85);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handlePointerDown = (e) => { setIsDragging(true); setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y }); };
  const handlePointerMove = (e) => { if (!isDragging) return; setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }); };
  const handlePointerUp = () => setIsDragging(false);
  
  const handleZoomIn = () => setScale(p => Math.min(p + 0.2, 2.5));
  const handleZoomOut = () => setScale(p => Math.max(p - 0.2, 0.4));
  const handleReset = () => { setScale(0.85); setPosition({ x: 0, y: 0 }); };

  // 개별 좌석 컴포넌트
    const Seat = ({ id, data }) => {
    const isHighlighted = highlightedSeatId === id;
    const recIndex = recommendedSeats.indexOf(id);
    const isRecommended = recIndex !== -1;
    
    // 💡 [추가된 로직] 빈자리(공석)를 클릭했을 때 모달을 띄우기 위한 가짜 데이터 생성
    const handleEmptySeatClick = (e) => {
      e.stopPropagation();
      setSelectedSeat({ 
        id: id, 
        name: '', 
        status: '공석', 
        zone: '미지정 구역', 
        role_description: '현재 비어있는 자리입니다.' 
      });
    };

    if (!data) {
      // 1. 추천된 빈자리인 경우 (클릭 이벤트 추가)
      if (isRecommended) {
        return (
          <div className="flex flex-col items-center z-10 relative cursor-pointer" onClick={handleEmptySeatClick}>
            <div className="w-12 h-12 rounded-t-xl rounded-b-sm border-b-4 border-purple-700 bg-purple-500 flex items-center justify-center text-lg font-black text-white shadow-[0_0_20px_rgba(168,85,247,0.8)] animate-bounce active:scale-95 transition-transform">
              {recIndex + 1}
            </div>
            <span className="text-[11px] text-purple-400 mt-2 font-black">{id}</span>
            <div className="absolute -top-3 bg-purple-900 text-[8px] px-2 py-1 rounded-full text-purple-200 shadow-xl border border-purple-500 whitespace-nowrap">추천 자리</div>
          </div>
        );
      }
      
      // 2. 평범한 빈자리인 경우 (클릭 이벤트 추가)
      return (
        <div className="flex flex-col items-center cursor-pointer" onClick={handleEmptySeatClick}>
          <div className="w-12 h-12 rounded-t-xl rounded-b-sm border-b-4 border-gray-700 bg-gray-800 flex items-center justify-center text-[10px] font-bold text-gray-500 opacity-50 hover:opacity-100 active:scale-95 transition-all">공석</div>
          <span className="text-[10px] text-gray-600 mt-2 font-bold">{id}</span>
        </div>
      );
    }

    // 3. 주인이 있는 자리 (기존 정상 로직)
    return (
      <div className="flex flex-col items-center">
        <button
          onClick={(e) => { e.stopPropagation(); setSelectedSeat(data); }}
          className={`relative w-12 h-12 rounded-t-xl rounded-b-sm border-b-4 transition-all active:scale-95 flex items-center justify-center text-[11px] font-bold text-white shadow-lg
            ${data.status === '근무중' ? 'bg-green-500 border-green-700' : data.status === '휴가' ? 'bg-red-500 border-red-700' : 'bg-yellow-400 border-yellow-600 text-gray-900'}
            ${isHighlighted ? 'ring-4 ring-blue-400 ring-offset-2 ring-offset-gray-900 animate-pulse scale-110 z-10' : ''}`}
        >
          {data.name.substring(1)}
        </button>
        <span className={`text-[10px] mt-2 font-bold ${isHighlighted ? 'text-blue-400' : 'text-gray-500'}`}>{id}</span>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white relative overflow-hidden">
      <header className="p-4 border-b border-gray-800 flex items-center bg-gray-900 z-20">
        <button onClick={() => setView('home')} className="p-2 mr-2 text-gray-400 font-bold">← BACK</button>
        <h2 className="text-lg font-bold text-white">전체 좌석 (도면 뷰)</h2>
      </header>

      {/* 줌 컨트롤 */}
      <div className="absolute right-4 top-20 flex flex-col gap-2 z-20">
        <button onClick={handleZoomIn} className="w-10 h-10 bg-gray-800 border border-gray-600 rounded-full text-xl font-bold hover:bg-gray-700 shadow-lg">+</button>
        <button onClick={handleReset} className="w-10 h-10 bg-gray-800 border border-gray-600 rounded-full text-xs font-bold hover:bg-gray-700 shadow-lg">FIT</button>
        <button onClick={handleZoomOut} className="w-10 h-10 bg-gray-800 border border-gray-600 rounded-full text-xl font-bold hover:bg-gray-700 shadow-lg">-</button>
      </div>

      <main 
        className={`flex-1 relative overflow-hidden touch-none select-none pb-28 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp}
      >
        <div className="w-full h-full flex items-center justify-center">
          <div 
            className="transition-transform duration-75 ease-out flex flex-col items-center bg-gray-800/50 p-10 rounded-3xl border border-gray-700"
            style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`, transformOrigin: 'center center' }}
          >
            <div className="w-64 h-2 bg-gray-700 rounded-full mb-12 relative shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-sm text-gray-400 font-black tracking-widest uppercase">FRONT DOOR</span>
            </div>

            <div className="flex flex-col space-y-8">
              {rows.map(row => (
                <div key={row} className="flex items-center">
                  <span className="w-10 text-lg text-gray-500 font-black mr-4 text-center">{row}</span>
                  <div className="flex">
                    {cols.map(col => (
                      <div key={row + col} className={`${col % 2 === 0 && col !== 10 ? 'mr-16' : 'mr-3'}`}>
                        <Seat id={row + col} data={seats[row + col]} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* 🤖 하단 분리형 AI 검색/추천 바 */}
      <div className="absolute bottom-0 w-full bg-gray-800/95 backdrop-blur-md border-t border-gray-700 p-4 z-30">
        <p className="text-xs text-blue-300 mb-2 font-medium break-keep">{aiMessage}</p>
        <div className="flex flex-col gap-2">
          <input 
            type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="담당자 찾기 또는 빈자리 추천 조건 입력" 
            className="w-full bg-gray-900 border border-gray-600 text-white p-3 rounded-xl text-sm focus:outline-none focus:border-blue-500"
          />
          <div className="flex gap-2">
            <button 
              onClick={handleAISearch} disabled={isSearching} 
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-xl font-bold text-sm transition-colors"
            >
              🔍 사람 찾기
            </button>
            <button 
              onClick={handleAIRecommend} disabled={isSearching} 
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-xl font-bold text-sm transition-colors shadow-[0_0_10px_rgba(168,85,247,0.4)]"
            >
              ✨ 빈자리 추천
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}