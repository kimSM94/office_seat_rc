function ZoneView({ setView, seats, setHighlightedSeatId }) {
  // 💡 window.SEAT_DATA 대신 DB에서 불러온 seats 객체를 배열로 변환
  const combinedSeats = Object.values(seats);
  
  const groupedByTeam = combinedSeats.reduce((acc, seat) => {
    if (!seat.team) return acc; // 팀이 없는 공석 등은 제외
    if (!acc[seat.team]) acc[seat.team] = [];
    acc[seat.team].push(seat);
    return acc;
  }, {});

  const sortedTeams = Object.keys(groupedByTeam).sort((a, b) => groupedByTeam[b].length - groupedByTeam[a].length);

  return (
    <div className="h-full flex flex-col bg-[#1A202C] text-white overflow-hidden animate-in fade-in">
      <div className="flex items-center gap-4 p-6 bg-gray-900 border-b border-gray-800 shadow-md">
        <button onClick={() => setView('home')} className="bg-gray-700 hover:bg-gray-600 text-white w-12 h-12 rounded-xl font-black text-xl shadow-md flex items-center justify-center transition-colors">🔙</button>
        <div>
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">🏢 부서별/구역별 현황</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
          {sortedTeams.map((teamName) => {
            const members = groupedByTeam[teamName];
            const theme = window.getTeamTheme(teamName);
            const colorClass = theme.tw;

            return (
              <div key={teamName} className="bg-gray-800 border border-gray-700 rounded-2xl p-5 shadow-lg flex flex-col">
                <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-3">
                  <h3 className="text-xl font-black text-gray-100 flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${colorClass.split(' ')[0]}`}></span>{teamName}
                  </h3>
                  <span className="bg-gray-900 text-gray-300 font-bold px-3 py-1 rounded-lg text-sm border border-gray-700">{members.length}명</span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {members.map((member) => (
                    <button key={member.id}
                      onClick={() => {
                        setHighlightedSeatId(member.id);
                        setView('map');
                      }}
                      className={`py-1.5 px-1 rounded-lg text-sm font-bold border transition-transform hover:scale-105 active:scale-95 shadow-sm truncate text-center ${colorClass} ${window.PART_LEADERS && window.PART_LEADERS.includes(member.name) ? 'ring-2 ring-yellow-400' : ''}`}
                    >
                      {window.PART_LEADERS && window.PART_LEADERS.includes(member.name) ? '👑 ' : ''}{member.name}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}