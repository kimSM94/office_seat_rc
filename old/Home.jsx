// 💡 기존 function Home() { ... } 부분을 지우고 아래 코드로 교체하세요!

function Home({ setView, user, seats }) {
  const [isSajuInputOpen, setIsSajuInputOpen] = React.useState(false); 
  const [sajuTargetName, setSajuTargetName] = React.useState(user?.name || ''); 
  const [sajuTargetBirth, setSajuTargetBirth] = React.useState(''); 
  const [sajuResult, setSajuResult] = React.useState(''); 
  const [isSajuLoading, setIsSajuLoading] = React.useState(false);

  const handleSajuSubmit = async () => {
    if (!sajuTargetName || !sajuTargetBirth) {
      alert("이름과 생년월일을 모두 입력해주세요!");
      return;
    }
    try {
      setIsSajuInputOpen(false); 
      setIsSajuLoading(true);    
      const result = await window.api.getTodaySaju(sajuTargetName, sajuTargetBirth);
      setSajuResult(result);
    } catch (error) {
      alert(error.message);
    } finally {
      setIsSajuLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 bg-gray-900 text-white animate-in fade-in relative overflow-hidden">
      
      <div className="text-center mb-10 z-10">
        <h1 className="text-4xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
          Smart Office
        </h1>
        <p className="text-gray-400">환영합니다, <span className="font-bold text-white">{user?.name}</span>님!</p>
      </div>

      <div className="w-full max-w-md space-y-4 z-10">
        
        {/* 🔮 사주 보기 버튼 (보라색!) */}
        <button 
          onClick={() => setIsSajuInputOpen(true)}
          disabled={isSajuLoading}
          className="w-full p-5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 rounded-2xl font-black text-lg text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all active:scale-95 flex flex-col items-center gap-1 disabled:opacity-50"
        >
          <span>{isSajuLoading ? '🔮 우주의 기운을 모으는 중...' : '🔮 오늘의 오피스 운세 & 사주 보기'}</span>
        </button>

        {/* 🍱 맛집 랜덤 매칭 버튼 (오렌지색!) */}
        <button 
          onClick={() => window.api.triggerLunchMatch(Object.values(seats || {}))} 
          className="w-full p-5 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-400 hover:to-pink-400 rounded-2xl font-black text-lg text-white shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-all active:scale-95 flex flex-col items-center gap-1"
        >
          <span>🍱 AI 맛집 탐험대 랜덤 매칭하기</span>
        </button>
        
        <button onClick={() => setView('map')} className="w-full p-5 bg-gray-800 hover:bg-gray-700 rounded-2xl font-bold text-lg border border-gray-700 transition-all flex items-center justify-center gap-2">🗺️ 오피스 전체 지도 보기</button>
        <button onClick={() => setView('zone')} className="w-full p-5 bg-gray-800 hover:bg-gray-700 rounded-2xl font-bold text-lg border border-gray-700 transition-all flex items-center justify-center gap-2">🏢 부서별/구역별 현황</button>
        <button onClick={() => setView('admin')} className="w-full p-5 bg-gray-800 hover:bg-gray-700 rounded-2xl font-bold text-lg border border-gray-700 transition-all flex items-center justify-center gap-2">⚙️ 관리자 대시보드</button>
      </div>

      {/* 🔮 입력 모달창 */}
      {isSajuInputOpen && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 p-6 rounded-3xl max-w-sm w-full border border-gray-700 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">🔮 운세 정보 입력</h3>
              <button onClick={() => setIsSajuInputOpen(false)} className="text-gray-500 hover:text-white">✕</button>
            </div>
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-sm text-gray-400 block mb-1">이름 (본인 또는 동료)</label>
                <input type="text" value={sajuTargetName} onChange={(e) => setSajuTargetName(e.target.value)} className="w-full p-3 bg-gray-900 rounded-xl border border-gray-700 text-white focus:border-purple-500 focus:outline-none" />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">생년월일</label>
                <input type="date" value={sajuTargetBirth} onChange={(e) => setSajuTargetBirth(e.target.value)} className="w-full p-3 bg-gray-900 rounded-xl border border-gray-700 text-white focus:border-purple-500 focus:outline-none" />
              </div>
            </div>
            <button onClick={handleSajuSubmit} className="w-full p-4 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold text-white transition-colors">
              운세 확인하기 ✨
            </button>
          </div>
        </div>
      )}

      {/* 🔮 결과 모달창 */}
      {sajuResult && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 p-6 rounded-3xl max-w-md w-full border border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.3)]">
            <h3 className="text-2xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              📜 {sajuTargetName}님의 오늘 운세
            </h3>
            <div className="bg-gray-900 p-4 rounded-xl text-gray-300 text-sm whitespace-pre-wrap leading-relaxed max-h-[50vh] overflow-y-auto mb-6">
              {sajuResult}
            </div>
            <button onClick={() => setSajuResult('')} className="w-full p-4 bg-gray-700 hover:bg-gray-600 rounded-xl font-bold text-white transition-colors">
              부적 챙겨서 업무 복귀하기 🚀
            </button>
          </div>
        </div>
      )}
    </div>
  );
}