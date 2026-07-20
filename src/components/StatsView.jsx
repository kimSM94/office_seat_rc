function StatsView({ setView, seats, vacations }) {
  const { useState, useMemo } = React;
  
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedTeams, setExpandedTeams] = useState({});

  const BASE_VACATION_DAYS = 15; 

  const statsData = useMemo(() => {
    return Object.values(seats).map(seat => {
      // 💡 [수정] 내 휴가 찾을 때 진짜 사번(emp_id)과 좌석 ID 모두 검사
      const myVacations = vacations.filter(v => v.emp_id === seat.emp_id || v.emp_id === seat.id);
      
      let usedDays = 0;
      myVacations.forEach(v => {
        const start = new Date(v.start_date);
        const end = new Date(v.end_date);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; 
        usedDays += diffDays;
      });

      return {
        ...seat,
        team: seat.team || '소속 없음', 
        totalDays: BASE_VACATION_DAYS,
        usedDays: usedDays,
        remainingDays: BASE_VACATION_DAYS - usedDays,
        usagePercent: Math.min((usedDays / BASE_VACATION_DAYS) * 100, 100)
      };
    });
  }, [seats, vacations]);

  const groupedData = useMemo(() => {
    const filtered = statsData.filter(stat => 
      (stat.name && stat.name.toLowerCase().includes(searchQuery.toLowerCase())) || 
      (stat.id && stat.id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (stat.emp_id && stat.emp_id.toLowerCase().includes(searchQuery.toLowerCase())) // 사번 검색 대응
    );

    const groups = {};
    filtered.forEach(stat => {
      if (!groups[stat.team]) groups[stat.team] = [];
      groups[stat.team].push(stat);
    });

    for (const team in groups) {
      groups[team].sort((a, b) => a.remainingDays - b.remainingDays);
    }

    return groups;
  }, [statsData, searchQuery]);

  const sortedTeams = Object.keys(groupedData).sort();

  const toggleTeam = (teamName) => {
    setExpandedTeams(prev => ({ ...prev, [teamName]: !prev[teamName] }));
  };

  return (
    <div className="absolute inset-0 bg-[#121212] overflow-y-auto z-50 animate-in fade-in text-gray-100 font-sans">
      <div className="sticky top-0 z-10 bg-[#121212]/95 backdrop-blur-md border-b border-gray-800 shadow-sm flex flex-col">
        <div className="flex items-center p-4">
          <button onClick={() => setView('home')} className="p-2 text-2xl text-gray-400 hover:text-white transition-colors mr-2">‹</button>
          <h2 className="text-xl font-bold tracking-wide">📊 휴가 잔여일수 통계</h2>
        </div>
        
        <div className="px-6 pb-4">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500">🔍</span>
            <input type="text" placeholder="직원 이름이나 사번으로 검색하세요" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-[#1C1C1E] border border-gray-700 text-white text-sm rounded-xl py-3.5 pl-10 pr-4 focus:outline-none focus:border-blue-500 transition-colors shadow-inner" />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full p-6 pb-20 space-y-6">
        {sortedTeams.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <span className="text-4xl mb-3 block">텅</span>
            <p>검색 결과가 없거나 등록된 직원이 없습니다.</p>
          </div>
        ) : (
          sortedTeams.map(team => {
            const members = groupedData[team];
            const isOpen = searchQuery.trim().length > 0 || expandedTeams[team];

            return (
              <div key={team} className="bg-[#1A1A1A] rounded-2xl border border-gray-800 overflow-hidden shadow-md">
                <button onClick={() => toggleTeam(team)} className="w-full flex items-center justify-between p-5 bg-[#252525] hover:bg-[#2C2C2E] transition-colors">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-black text-white">{team}</h3>
                    <span className="bg-blue-900/50 text-blue-400 text-xs font-bold px-2.5 py-1 rounded-full">{members.length}명</span>
                  </div>
                  <div className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>▼</div>
                </button>

                {isOpen && (
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-200">
                    {members.map(stat => (
                      <div key={stat.id} className="bg-[#121212] border border-gray-800 p-5 rounded-2xl shadow-sm hover:border-gray-700 transition-colors">
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-900/30 flex items-center justify-center font-black text-blue-400 text-lg border border-blue-800/50">{stat.name ? stat.name.charAt(0) : '익'}</div>
                            <div>
                              <h4 className="font-bold text-base text-white leading-tight">{stat.name || '공석'}</h4>
                              <p className="text-xs text-gray-500 mt-0.5">사번: {stat.emp_id || stat.id}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-gray-500 font-bold mb-1">남은 연차</p>
                            <p className={`text-2xl font-black ${stat.remainingDays <= 3 ? 'text-red-400' : 'text-green-400'}`}>{stat.remainingDays}<span className="text-xs font-normal text-gray-500 ml-0.5">일</span></p>
                          </div>
                        </div>

                        <div className="mt-2">
                          <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-1.5">
                            <span>사용: {stat.usedDays}일</span>
                            <span>총: {stat.totalDays}일</span>
                          </div>
                          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-1000 ${stat.usagePercent >= 80 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${stat.usagePercent}%` }}></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}