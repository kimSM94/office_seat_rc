// ==========================================
// 3. 부서별/구역별 현황 (ZoneView) 컴포넌트
// ==========================================
function ZoneView({ setView, seats, setSelectedSeat }) {
  // MapView와 동일한 SEAT_DATA를 사용하여 부서별로 그룹화합니다.
  const SEAT_DATA = [
    {id: "1224", name: "강수정", team: "상담", x: 50, y: 250}, {id: "1609", name: "김동혁", team: "상담", x: 50, y: 340}, {id: "1369", name: "강선희", team: "운영혁신", x: 50, y: 430}, {id: "1413", name: "김범", team: "운영혁신", x: 50, y: 520}, {id: "1479", name: "이동은", team: "기획", x: 50, y: 680}, {id: "1401", name: "서성훈", team: "팀장", x: 50, y: 770},
    {id: "Test", name: "Test실", team: "공용", x: -20, y: 680}, {id: "1475", name: "서강석", team: "본부장", x: -20, y: 770},
    {id: "1483", name: "김기훈", team: "상담", x: 120, y: 250}, {id: "1285", name: "이소연", team: "상담", x: 120, y: 340}, {id: "1788", name: "장병용", team: "상담", x: 120, y: 430}, {id: "1712", name: "장성호", team: "솔포인트", x: 120, y: 520}, {id: "1137", name: "박남호", team: "솔포인트", x: 120, y: 610}, {id: "8892", name: "김연섭", team: "솔포인트", x: 120, y: 700},
    {id: "1485", name: "이장규", team: "상담", x: 190, y: 250}, {id: "1797", name: "김지연", team: "상담", x: 190, y: 340}, {id: "1364", name: "김윤호", team: "상담", x: 190, y: 520}, {id: "8625", name: "이채연", team: "상담", x: 190, y: 610}, {id: "1280", name: "조경훈", team: "상담", x: 190, y: 700},
    {id: "1437", name: "김영필", team: "오토", x: 280, y: 250}, {id: "1448", name: "김세희", team: "오토", x: 280, y: 340}, {id: "1978", name: "김예련", team: "오토", x: 280, y: 430}, {id: "1880", name: "박지건", team: "오토", x: 280, y: 520}, {id: "1489", name: "남진아", team: "오토", x: 280, y: 610}, {id: "1461", name: "조용진", team: "오토", x: 280, y: 700}, {id: "1979", name: "정진삼", team: "오토", x: 280, y: 790},
    {id: "1814", name: "윤호영", team: "오토", x: 350, y: 250}, {id: "1741", name: "김선혜", team: "오토", x: 350, y: 340}, {id: "1642", name: "김준석", team: "오토", x: 350, y: 430}, {id: "1464", name: "이성학", team: "오토", x: 350, y: 520}, {id: "1288", name: "김보령", team: "오토", x: 350, y: 610}, {id: "1442", name: "박용탁", team: "오토", x: 350, y: 700}, {id: "1753", name: "김종현", team: "오토", x: 350, y: 790},
    {id: "1480", name: "조성민", team: "오토", x: 420, y: 250}, {id: "8680", name: "표동수", team: "오토", x: 420, y: 340}, {id: "1465", name: "김연석", team: "오토", x: 420, y: 430}, {id: "1317", name: "박대윤", team: "오토", x: 420, y: 520}, {id: "1825", name: "정보람", team: "오토", x: 420, y: 610}, {id: "1537", name: "길연우", team: "오토", x: 420, y: 700}, {id: "1255", name: "김성훈", team: "SSO", x: 420, y: 790},
    {id: "1351", name: "이하나", team: "재무", x: 490, y: 250}, {id: "1803", name: "심혜진", team: "재무", x: 490, y: 340}, {id: "1414", name: "김동주", team: "재무", x: 490, y: 430}, {id: "1375", name: "김우철", team: "재무", x: 490, y: 520}, {id: "1726", name: "김경원", team: "발급", x: 490, y: 610}, {id: "1139", name: "권두연", team: "발급", x: 490, y: 700}, {id: "OA", name: "기동OA", team: "공용", x: 490, y: 790},
    {id: "1669", name: "길원규", team: "재무", x: 580, y: 250}, {id: "1380", name: "이현지", team: "재무", x: 580, y: 340}, {id: "1417", name: "정재은", team: "재무", x: 580, y: 430}, {id: "1446", name: "박미연", team: "마이카", x: 580, y: 610}, {id: "1266", name: "김연하", team: "마이카", x: 580, y: 700}, {id: "1331", name: "노지은", team: "개발전담", x: 580, y: 790},
    {id: "1258", name: "신동엽", team: "홈페이지", x: 650, y: 250}, {id: "8686", name: "김성우", team: "홈페이지", x: 650, y: 340}, {id: "8048", name: "유명석", team: "홈페이지", x: 650, y: 430}, {id: "1188", name: "방성원", team: "개발전담", x: 650, y: 520}, {id: "1942", name: "변상현", team: "마이카", x: 650, y: 610}, {id: "1878", name: "임형진", team: "마이카", x: 650, y: 700}, {id: "1988", name: "임영정", team: "마이카", x: 650, y: 790},
    {id: "1268", name: "정강호", team: "홈페이지", x: 740, y: 250}, {id: "1945", name: "박종원", team: "홈페이지", x: 740, y: 340}, {id: "1366", name: "이동현", team: "전자문서", x: 740, y: 430}, {id: "1773", name: "정희종", team: "전자문서", x: 740, y: 520}, {id: "8658", name: "함덕훈", team: "홈페이지", x: 740, y: 610}, {id: "8687", name: "이선아", team: "홈페이지", x: 740, y: 700}, {id: "1778", name: "이연경", team: "홈페이지", x: 740, y: 790},
    {id: "1943", name: "김찬수", team: "개발전담", x: 810, y: 250}, {id: "1865", name: "강규동", team: "개발전담", x: 810, y: 340}, {id: "8886", name: "이민호", team: "올댓", x: 810, y: 430}, {id: "8885", name: "강용선", team: "올댓", x: 810, y: 520}, {id: "8884", name: "박은혜", team: "올댓", x: 810, y: 610}, {id: "1138", name: "임진철", team: "홈페이지", x: 810, y: 700}, {id: "8883", name: "명보민", team: "올댓", x: 810, y: 790},
    {id: "1870", name: "최민선", team: "개발전담", x: 900, y: 250}, {id: "1947", name: "유현규", team: "개발전담", x: 900, y: 340}, {id: "1842", name: "박재환", team: "홈페이지", x: 900, y: 430}, {id: "1394", name: "김혜경", team: "홈페이지", x: 900, y: 520}, {id: "1443", name: "이영주", team: "홈페이지", x: 900, y: 610}, {id: "7499", name: "최호영", team: "홈페이지", x: 900, y: 700}, {id: "1333", name: "신정은", team: "홈페이지", x: 900, y: 790},
    {id: "1001", name: "최현철", team: "데이타비즈", x: 970, y: 290}, {id: "1863", name: "박다은", team: "개발전담", x: 970, y: 430}, {id: "1946", name: "이샛별", team: "개발전담", x: 970, y: 520}, {id: "8681", name: "이면정", team: "홈페이지", x: 970, y: 610}, {id: "1875", name: "홍지연", team: "홈페이지", x: 970, y: 700}, {id: "1478", name: "배경보", team: "홈페이지", x: 970, y: 790},
    {id: "1332", name: "이준상", team: "개발전담", x: 1060, y: 430}, {id: "1866", name: "이승민", team: "개발전담", x: 1060, y: 520}, {id: "8181", name: "김용오", team: "홈페이지", x: 1060, y: 610}, {id: "8180", name: "박동영", team: "홈페이지", x: 1060, y: 700}, {id: "8183", name: "이용민", team: "모바일", x: 1060, y: 790},
    {id: "1955", name: "김은정", team: "모바일", x: 1130, y: 340}, {id: "1131", name: "진은성", team: "모바일", x: 1130, y: 430}, {id: "1869", name: "김도현", team: "모바일", x: 1130, y: 520}, {id: "1476", name: "임영우", team: "모바일", x: 1130, y: 610}, {id: "8144", name: "박증환", team: "모바일", x: 1130, y: 700}, {id: "1132", name: "임지우", team: "모바일", x: 1130, y: 790},
    {id: "1607", name: "윤학민", team: "모바일", x: 1220, y: 250}, {id: "1841", name: "권예림", team: "모바일", x: 1220, y: 430}, {id: "8016", name: "서은빈", team: "모바일", x: 1220, y: 520}, {id: "8159", name: "김성민", team: "모바일", x: 1220, y: 610}, {id: "8191", name: "김지수", team: "모바일", x: 1220, y: 700}, {id: "8182", name: "임종완", team: "모바일", x: 1220, y: 790},
    {id: "1316", name: "한민지", team: "모바일", x: 1290, y: 250}, {id: "1315", name: "김지해", team: "모바일", x: 1290, y: 340}, {id: "1811", name: "유지원", team: "모바일", x: 1290, y: 430}, {id: "7547", name: "송효범", team: "모바일", x: 1290, y: 520}, {id: "1810", name: "박재욱", team: "모바일", x: 1290, y: 610}, {id: "8353", name: "승무준", team: "모바일", x: 1290, y: 700}, {id: "8627", name: "김용섭", team: "팀장", x: 1290, y: 790},
    {id: "8727", name: "김재용", team: "디스커버", x: 1060, y: 20}, {id: "8729", name: "정상은", team: "디스커버", x: 1130, y: 20}, {id: "8712", name: "김찬연", team: "디스커버", x: 1220, y: 20}, {id: "7167", name: "남주석", team: "디스커버", x: 1290, y: 20},
    {id: "8782", name: "김현진", team: "디스커버", x: 1060, y: 110}, {id: "1793", name: "전진", team: "디스커버", x: 1130, y: 110}, {id: "8713", name: "이동표", team: "디스커버", x: 1220, y: 110}, {id: "8190", name: "장진역", team: "디스커버", x: 1290, y: 110}, {id: "8168", name: "신재준", team: "디스커버", x: 1360, y: 110},
    {id: "9901", name: "이주원", team: "운영혁신", x: 50, y: 610}, {id: "9902", name: "김태형", team: "솔포인트", x: 120, y: 790}, {id: "9903", name: "김상민", team: "상담", x: 190, y: 430}, {id: "9904", name: "최정우", team: "상담", x: 190, y: 790}, {id: "9905", name: "송지아", team: "재무", x: 580, y: 520}, {id: "9906", name: "한동훈", team: "개발전담", x: 1060, y: 250}, {id: "9907", name: "윤지호", team: "개발전담", x: 1060, y: 340}, {id: "9908", name: "강태오", team: "모바일", x: 1130, y: 250}, {id: "9909", name: "배수지", team: "모바일", x: 1220, y: 340}
  ];

  // 💡 데이터 가공: 팀별로 묶어주기
  const groupedByTeam = SEAT_DATA.reduce((acc, seat) => {
    // DB의 동적 상태(근무중, 자리비움 등)가 있으면 병합
    const dynamicSeatInfo = (seats && seats[seat.id]) ? { ...seat, ...seats[seat.id] } : seat;
    
    if (!acc[seat.team]) {
      acc[seat.team] = [];
    }
    acc[seat.team].push(dynamicSeatInfo);
    return acc;
  }, {});

  // 팀 인원수가 많은 순서대로 정렬
  const sortedTeams = Object.keys(groupedByTeam).sort((a, b) => groupedByTeam[b].length - groupedByTeam[a].length);

  // 팀별 고유 색상 매칭
  const getTeamColorClass = (team) => {
    if (team === '상담' || team === '팀장') return 'bg-yellow-400 text-yellow-900 border-yellow-500'; 
    if (team.includes('오토') || team === 'SSO') return 'bg-lime-300 text-lime-900 border-lime-400'; 
    if (team === '솔포인트' || team === '발급') return 'bg-green-300 text-green-900 border-green-400'; 
    if (team === '재무') return 'bg-green-400 text-green-900 border-green-500'; 
    if (team === '홈페이지' || team.includes('개발전담') || team === '올댓' || team === '전자문서') return 'bg-emerald-400 text-emerald-900 border-emerald-500'; 
    if (team.includes('마이카') || team === '데이타비즈') return 'bg-teal-400 text-teal-900 border-teal-500'; 
    if (team.includes('모바일') || team.includes('디스커버')) return 'bg-amber-300 text-amber-900 border-amber-400'; 
    return 'bg-gray-300 text-gray-800 border-gray-400'; 
  };

  return (
    <div className="h-full flex flex-col bg-[#1A202C] text-white overflow-hidden animate-in fade-in">
      {/* 🚀 상단 헤더 영역 */}
      <div className="flex items-center gap-4 p-6 bg-gray-900 border-b border-gray-800 shadow-md">
        <button 
          onClick={() => setView('home')}
          className="bg-gray-700 hover:bg-gray-600 text-white w-12 h-12 rounded-xl font-black text-xl shadow-md flex items-center justify-center transition-colors"
        >
          🔙
        </button>
        <div>
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
            🏢 부서별/구역별 현황
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            총 <span className="font-bold text-white">{sortedTeams.length}</span>개 부서 · <span className="font-bold text-white">{SEAT_DATA.length}</span>명의 오피스 멤버
          </p>
        </div>
      </div>

      {/* 📊 부서별 대시보드 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
          
          {sortedTeams.map((teamName) => {
            const members = groupedByTeam[teamName];
            const colorClass = getTeamColorClass(teamName);

            return (
              <div key={teamName} className="bg-gray-800 border border-gray-700 rounded-2xl p-5 shadow-lg flex flex-col">
                
                {/* 카드 헤더 */}
                <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-3">
                  <h3 className="text-xl font-black text-gray-100 flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${colorClass.split(' ')[0]}`}></span>
                    {teamName}
                  </h3>
                  <span className="bg-gray-900 text-gray-300 font-bold px-3 py-1 rounded-lg text-sm border border-gray-700">
                    {members.length}명
                  </span>
                </div>

                {/* 팀원 리스트 (클릭 시 지도로 이동!) */}
                <div className="flex flex-wrap gap-2">
                  {members.map((member) => (
                    <button
                      key={member.id}
                      onClick={() => {
                        setSelectedSeat(member); // 모달창 바로 띄워주기 위해 정보 셋팅
                        setView('map'); // 지도로 즉시 이동!
                      }}
                      className={`px-3 py-2 rounded-lg text-sm font-bold border transition-transform hover:scale-105 active:scale-95 flex items-center gap-1 shadow-sm ${colorClass}`}
                    >
                      {/* 상태가 있다면 아이콘으로 표시 */}
                      {member.status === '휴가' ? '🌴' : member.status === '자리비움' ? '☕' : '💻'}
                      {member.name}
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