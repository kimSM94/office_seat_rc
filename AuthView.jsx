function AuthView({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = React.useState(true);
  
  // 💡 confirmPassword (비밀번호 확인) 상태를 추가했습니다.
  const [formData, setFormData] = React.useState({
    employee_id: '', name: '', gender: '남', team_name: '', user_id: '', password: '', confirmPassword: ''
  });

  // 비밀번호 유효성 체크
  const checkPassword = (pw) => ({
    hasUpper: /[A-Z]/.test(pw),
    hasLower: /[a-z]/.test(pw),
    hasNumber: /[0-9]/.test(pw),
    isLong: pw.length >= 8
  });

  const pwStatus = checkPassword(formData.password);
  
  // 💡 두 비밀번호가 일치하는지 실시간으로 확인하는 변수
  const isMatch = formData.password && formData.password === formData.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const user = await window.api.signIn(formData.user_id, formData.password);
        onLoginSuccess(user);
      } else {
        // 1. 비밀번호 조건 검사
        if (!pwStatus.hasUpper || !pwStatus.hasLower || !pwStatus.hasNumber) {
          alert('비밀번호 조건을 확인해주세요. (대/소문자, 숫자 포함)'); 
          return;
        }
        
        // 2. 💡 비밀번호 일치 검사 (다르면 여기서 막힙니다!)
        if (!isMatch) {
          alert('비밀번호가 일치하지 않습니다. 다시 확인해주세요.'); 
          return;
        }

        // DB에 보낼 때는 confirmPassword는 빼고 보냅니다.
        const { confirmPassword, ...submitData } = formData;
        await window.api.signUp(submitData);
        alert('회원가입 성공! 로그인해주세요.');
        setIsLogin(true);
      }
    } catch (err) { 
      alert(err.message); 
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white p-8 justify-center overflow-y-auto">
      <div className="max-w-md w-full mx-auto">
        <h2 className="text-3xl font-black mb-8 text-center bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
          {isLogin ? 'WELCOME BACK' : 'CREATE ACCOUNT'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <input type="text" placeholder="사번" className="w-full p-4 bg-gray-800 rounded-xl border border-gray-700 focus:border-blue-500 focus:outline-none" onChange={e => setFormData({...formData, employee_id: e.target.value})} required />
              <input type="text" placeholder="이름" className="w-full p-4 bg-gray-800 rounded-xl border border-gray-700 focus:border-blue-500 focus:outline-none" onChange={e => setFormData({...formData, name: e.target.value})} required />
              <select className="w-full p-4 bg-gray-800 rounded-xl border border-gray-700 focus:border-blue-500 focus:outline-none" onChange={e => setFormData({...formData, gender: e.target.value})}>
                <option value="남">남성</option>
                <option value="여">여성</option>
              </select>
              <input type="text" placeholder="팀이름" className="w-full p-4 bg-gray-800 rounded-xl border border-gray-700 focus:border-blue-500 focus:outline-none" onChange={e => setFormData({...formData, team_name: e.target.value})} required />
            </>
          )}
          
          <input type="text" placeholder="아이디" className="w-full p-4 bg-gray-800 rounded-xl border border-gray-700 focus:border-blue-500 focus:outline-none" onChange={e => setFormData({...formData, user_id: e.target.value})} required />
          <input type="password" placeholder="비밀번호" className="w-full p-4 bg-gray-800 rounded-xl border border-gray-700 focus:border-blue-500 focus:outline-none" onChange={e => setFormData({...formData, password: e.target.value})} required />
          
          {/* 회원가입 시에만 나타나는 비밀번호 검증 UI */}
          {!isLogin && (
            <div className="space-y-3">
              <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700 text-xs space-y-1">
                <p className={pwStatus.hasUpper ? 'text-green-400 font-bold' : 'text-gray-500'}>✓ 대문자 포함</p>
                <p className={pwStatus.hasLower ? 'text-green-400 font-bold' : 'text-gray-500'}>✓ 소문자 포함</p>
                <p className={pwStatus.hasNumber ? 'text-green-400 font-bold' : 'text-gray-500'}>✓ 숫자 포함</p>
              </div>

              {/* 💡 비밀번호 재입력 칸 */}
              <input 
                type="password" 
                placeholder="비밀번호 재입력" 
                className={`w-full p-4 bg-gray-800 rounded-xl border focus:outline-none transition-colors ${
                  formData.confirmPassword 
                    ? (isMatch ? 'border-green-500 focus:border-green-500' : 'border-red-500 focus:border-red-500') 
                    : 'border-gray-700 focus:border-blue-500'
                }`} 
                onChange={e => setFormData({...formData, confirmPassword: e.target.value})} 
                required 
              />
              
              {/* 💡 실시간 일치 여부 메시지 */}
              {formData.confirmPassword && (
                <p className={`text-sm px-2 ${isMatch ? 'text-green-400' : 'text-red-400 font-bold'}`}>
                  {isMatch ? '✓ 비밀번호가 일치합니다.' : '✗ 비밀번호가 일치하지 않습니다.'}
                </p>
              )}
            </div>
          )}

          <button type="submit" className="w-full p-4 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold text-lg mt-6 shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-colors">
            {isLogin ? '로그인' : '회원가입 완료'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-gray-400 hover:text-white underline transition-colors">
            {isLogin ? '계정이 없으신가요? 회원가입' : '이미 계정이 있나요? 로그인'}
          </button>
        </div>
      </div>
    </div>
  );
}