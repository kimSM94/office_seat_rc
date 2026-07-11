// 테마 색상 함수
 window.getTeamTheme = (team) => {
  if (!team) return { hex: '#E5E7EB', tw: 'bg-gray-300 text-gray-800 border-gray-400' };
  
  if (team === '상담' || team === '팀장') return { hex: '#FDE047', tw: 'bg-yellow-300 text-yellow-900 border-yellow-400' }; 
  if (team === '운영혁신' || team === '기획') return { hex: '#FCA5A5', tw: 'bg-red-300 text-red-900 border-red-400' };
  if (team.includes('오토') || team === 'SSO') return { hex: '#D9F99D', tw: 'bg-lime-300 text-lime-900 border-lime-400' }; 
  if (team === '솔포인트' || team === '발급') return { hex: '#6EE7B7', tw: 'bg-emerald-300 text-emerald-900 border-emerald-400' }; 
  if (team === '재무') return { hex: '#67E8F9', tw: 'bg-cyan-300 text-cyan-900 border-cyan-400' }; 
  
  if (team.includes('개발전담')) return { hex: '#818CF8', tw: 'bg-indigo-300 text-indigo-900 border-indigo-400' }; 
  if (team === '홈페이지' || team === '전자문서') return { hex: '#93C5FD', tw: 'bg-blue-300 text-blue-900 border-blue-400' }; 
  if (team === '올댓') return { hex: '#7DD3FC', tw: 'bg-sky-300 text-sky-900 border-sky-400' }; 
  
  if (team.includes('마이카')) return { hex: '#C4B5FD', tw: 'bg-violet-300 text-violet-900 border-violet-400' }; 
  if (team === '데이타비즈') return { hex: '#E879F9', tw: 'bg-fuchsia-300 text-fuchsia-900 border-fuchsia-400' }; 
  if (team.includes('모바일')) return { hex: '#F9A8D4', tw: 'bg-pink-300 text-pink-900 border-pink-400' }; 
  if (team.includes('디스커버')) return { hex: '#FDA4AF', tw: 'bg-rose-300 text-rose-900 border-rose-400' }; 
  
  if (team === '본부장' || team === '공용') return { hex: '#D1D5DB', tw: 'bg-gray-300 text-gray-900 border-gray-400 font-bold' };

  return { hex: '#E5E7EB', tw: 'bg-gray-200 text-gray-800 border-gray-400' }; 
};