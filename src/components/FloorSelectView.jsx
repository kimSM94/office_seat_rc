function FloorSelectView({ setView, setSelectedFloor }) {
  // 15층부터 24층까지 배열 생성
  const floors = Array.from({ length: 10 }, (_, i) => 15 + i);

  return (
    <div className="absolute inset-0 bg-[#121212] overflow-y-auto z-50 flex flex-col animate-in fade-in text-gray-100 font-sans">
      
      {/* 상단 헤더 */}
      <div className="sticky top-0 z-10 bg-[#121212]/95 backdrop-blur-md flex items-center justify-center p-4 border-b border-gray-800 shadow-sm">
        <button 
          onClick={() => setView('home')} 
          className="absolute left-4 p-2 text-2xl text-gray-400 hover:text-white transition-colors"
        >
          ‹
        </button>
        <h2 className="text-lg font-bold tracking-wide">층수 선택</h2>
      </div>

      <div className="max-w-2xl mx-auto w-full flex flex-col flex-1 p-6">
        <div className="mb-6">
          <h3 className="text-2xl font-black text-white mb-2">오피스 배치도</h3>
          <p className="text-gray-400 text-sm">확인하실 층수를 선택해 주세요.</p>
        </div>

        {/* 층수 리스트 그리드 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {floors.map(floor => (
            <button
              key={floor}
              onClick={() => {
                setSelectedFloor(floor);
                setView('map'); // 층수를 선택하면 해당 층의 지도로 이동!
              }}
              className="bg-[#1C1C1E] border border-gray-800 hover:border-blue-500 hover:bg-gray-800 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 transition-all group active:scale-95 shadow-md"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">🏢</span>
              <span className="text-xl font-black text-white">{floor}F</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}