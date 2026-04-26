// 💡 본인의 API 정보로 반드시 교체하세요!
const SUPABASE_URL = 'https://kzrlzkmpcfqtwfwkbdbm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6cmx6a21wY2ZxdHdmd2tiZGJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0NzU4MzAsImV4cCI6MjA5MjA1MTgzMH0.lf5haWoI9S3mpf1cYfvNsP1U0IuxEp7JBw5hnFUWZF4';

// 🔒 비밀 키들은 모두 별표(*) 처리! (중요)
const OPENAI_API_KEY = '*';
const DISCORD_WEBHOOK_URL = '*'; 

// 🌐 금고(Worker) 주소는 당당하게 공개!
const WORKER_URL = "https://office-ai-bridge.rnentkdals.workers.dev";



// Supabase 초기화
window.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 💡 디스코드 알림 전송용 공통 함수
const sendDiscord = async (message) => {
  try {
    await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      // 디스코드는 'content'라는 키값으로 텍스트를 받습니다!
      body: JSON.stringify({
        content: message
      })
    });
  } catch (e) {
    console.error('디스코드 알림 전송 실패', e);
  }
};


window.api = {
  // 1. 전체 좌석 데이터 가져오기
  fetchSeats: async () => {
    const {
      data,
      error
    } = await window.supabase.from('employee_seats').select('*');
    if (error) throw error;
    return data;
  },

  // 2. 좌석 상태(근무중/휴가 등) 업데이트
  updateStatus: async (id, newStatus) => {
    const {
      error
    } = await window.supabase.from('employee_seats').update({
      status: newStatus
    }).eq('id', id);
    if (error) throw error;
  },

  // 3. AI 담당자 검색 (RAG)
  searchEmployee: async (searchQuery) => {
    const embeddingRes = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: searchQuery
      })
    });
    const embeddingData = await embeddingRes.json();

    const {
      data,
      error
    } = await window.supabase.rpc('match_employees', {
      query_embedding: embeddingData.data[0].embedding,
      match_threshold: 0.2,
      match_count: 1
    });
    if (error) throw error;
    return data;
  },

  // 4. AI 빈자리 추천 (LLM)
  recommendSeats: async (searchQuery, mapState) => {
    const systemPrompt = `당신은 천재적인 오피스 공간 매니저입니다.
현재 50석의 좌석 배치도 JSON: ${JSON.stringify(mapState)}
[공간 규칙] 좌석은 A~E열과 1~10번의 격자 구조입니다. 특정 인물 근처를 원하면 알파벳/숫자가 인접한 공석을 찾으세요.
[지시사항]
1. 조건에 부합하는 '공석'만 찾으세요. (전체 추천 금지)
2. 무조건 최대 3개까지만 추천하세요.
3. 오직 좌석 ID 문자열의 JSON 배열로만 응답하세요. 예시: ["C4", "C5"]`;

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{
          role: 'system',
          content: systemPrompt
        }, {
          role: 'user',
          content: searchQuery
        }],
        temperature: 0.1
      })
    });
    const json = await res.json();
    let content = json.choices[0].message.content.trim();
    if (content.startsWith('```')) content = content.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(content);
  },

  // 5. 자리 이동 요청 로직 (api.js 내부)
  createRequest: async (seatId, requesterName) => {
    await window.supabase.from('seat_requests').update({
      status: 'rejected'
    }).eq('seat_id', seatId).eq('status', 'pending');
    const {
      data,
      error
    } = await window.supabase.from('seat_requests').insert([{
      seat_id: seatId,
      requester_name: requesterName,
      status: 'pending'
    }]);

    if (!error) {
      // 💡 본인의 Cloudflare Worker 주소로 변경하세요!
      const WORKER_URL = 'https://office-api-worker.rnentkdals.workers.dev';

      // 변수를 URL에 탑재하여 링크로 만듭니다. (띄어쓰기 인코딩 처리)
      const encodedName = encodeURIComponent(requesterName);
      const approveLink = `${WORKER_URL}/?action=approve&seatId=${seatId}&name=${encodedName}`;

      // 마크다운 형식 [보이는 텍스트](실제 링크) 적용
      await sendDiscord(`🚨 **[새로운 좌석 이동 요청]**\n👤 신청자: **${requesterName}**\n🪑 희망 좌석: **${seatId}석**\n\n👉 [✅ 여기서 1초 만에 즉시 승인하기](${approveLink})`);
    }

    if (error) throw error;
    return data;
  },

  // 6. 모든 요청 내역 가져오기 (관리자)
  fetchRequests: async () => {
    const {
      data,
      error
    } = await window.supabase.from('seat_requests').select('*').order('created_at', {
      ascending: false
    });
    if (error) throw error;
    return data;
  },

  // 7번 함수(승인 처리) 수정
  processRequest: async (requestId, seatId, requesterName, isApproved) => {
    const status = isApproved ? 'approved' : 'rejected';
    await window.supabase.from('seat_requests').update({
      status
    }).eq('id', requestId);

    if (isApproved) {
      await window.supabase.from('employee_seats').upsert({
        id: seatId,
        name: requesterName,
        status: '근무중'
      });
      // 💡 승인 완료 알림
      await sendDiscord(`✅ **[요청 승인 완료]**\n**${requesterName}**님의 **${seatId}석** 이동이 최종 승인되었습니다! 🎉`);
    } else {
      // 💡 반려 알림
      await sendDiscord(`❌ **[요청 반려 알림]**\n**${requesterName}**님의 **${seatId}석** 이동이 반려되었습니다.`);
    }
  },

  // 8. 회원가입
  signUp: async (employeeData) => {
    const {
      data,
      error
    } = await window.supabase.from('employees').insert([employeeData]);
    if (error) throw error;
    return data;
  },

  // 9. 로그인
  signIn: async (userId, password) => {
    const {
      data,
      error
    } = await window.supabase
      .from('employees')
      .select('*')
      .eq('user_id', userId)
      .eq('password', password)
      .single();
    if (error) throw new Error('아이디 또는 비밀번호가 일치하지 않습니다.');
    return data;
  },

  // 💡 기존 10번 함수를 세컨드 브레인 데이터도 받도록 수정합니다.
  updateStatusWithMessage: async (id, newStatus, message, secondBrainData) => {
    const {
      error
    } = await window.supabase
      .from('employee_seats')
      .update({
        status: newStatus,
        status_message: message,
        second_brain: secondBrainData // 새로 추가된 컬럼
      })
      .eq('id', id);
    if (error) throw error;
  },

  // 11. 실시간 데이터 감지 (1번 기능 - Realtime)
  subscribeToSeats: (callback) => {
    return window.supabase.channel('custom-all-channel')
      .on(
        'postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'employee_seats'
        },
        (payload) => {
          console.log('데이터 변경 감지됨!', payload);
          callback(payload.new); // 변경된 최신 데이터를 리액트로 전달
        }
      )
      .subscribe();
  },

 // 12. 🍱 AI 맛집 탐험대 랜덤 매칭하기 (디스코드 전송)
  triggerLunchMatch: async (seatsArray) => {
    try {
      // 1. 현재 근무중인 인원만 필터링 (기존 로직 유지)
      const activeMembers = seatsArray.filter(seat => seat.status === '근무중' && seat.name);
      
      if (activeMembers.length < 2) {
        alert("점심 매칭을 하려면 근무중인 인원이 최소 2명 이상이어야 합니다!");
        return;
      }

      // 2. 랜덤으로 인원 섞기 및 팀 구성 (예시 로직 - 기존에 쓰시던 매칭 로직을 그대로 쓰셔도 됩니다)
      const shuffled = [...activeMembers].sort(() => 0.5 - Math.random());
      const team1 = shuffled.slice(0, Math.ceil(shuffled.length / 2)).map(m => m.name).join(', ');
      const team2 = shuffled.slice(Math.ceil(shuffled.length / 2)).map(m => m.name).join(', ');

      const matchMessage = `🍱 **오늘의 AI 맛집 탐험대 매칭 결과!** 🍱\n\n🍕 A팀: ${team1}\n🍔 B팀: ${team2}\n\n즐거운 점심시간 되세요! 🚀`;

      // 3. 🚨 대망의 안전한 디스코드 전송! (프론트엔드 -> 금고(Worker) -> 디스코드)
      const res = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'discord',
          payload: {
            content: matchMessage // 여기에 구성된 점심 매칭 결과 텍스트를 넣습니다.
          }
        })
      });

      if (!res.ok) throw new Error("디스코드 전송에 실패했습니다.");
      
      alert("디스코드로 점심 매칭 결과가 전송되었습니다! 🚀");

    } catch (error) {
      console.error("점심 매칭 오류:", error);
      alert("점심 매칭 중 오류가 발생했습니다.");
    }
  },

  // 13. AI 오늘의 오피스 사주/운세 보기
  getTodaySaju: async (name, birthDate) => {
    const prompt = `내 이름은 ${name}이고, 생년월일은 ${birthDate}야.
    이 정보를 바탕으로 동양의 사주명리와 오피스 라이프를 결합한 '오늘의 직장 운세'를 봐줘.
    유쾌하고 센스있는 사주 도사 컨셉으로 아래 3가지를 알려줘.
    1. 🔮 오늘의 총운
    2. 💻 업무 & 귀인운
    3. 🍀 럭키 아이템`;

    // ❌ 이제 여기에 API 키가 없습니다! 보안 완벽!
    const res = await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'saju',
        payload: {
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: '너는 IT 회사의 사내 전속 용한 도사(사주 전문가)야.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.9
        }
      })
    });
    
    if (!res.ok) throw new Error("운세를 불러오는 중 신기가 떨어졌습니다.");
    const json = await res.json();
    return json.choices[0].message.content;
  },

  // 14. 🤝 AI 동료와의 업무 궁합 보기
  getOfficeChemistry: async (myName, myBirth, partnerName, partnerBirth) => {
    const prompt = `나의 이름은 ${myName}(생년월일: ${myBirth})이고, 직장 동료의 이름은 ${partnerName}(생년월일: ${partnerBirth})야.
    우리의 사주와 명리학을 바탕으로 '직장 동료로서의 업무 궁합'을 유쾌한 도사 컨셉으로 봐줘.
    1. 📊 전반적인 업무 호흡
    2. ⚠️ 주의할 점
    3. 💡 시너지 팁`;

    const res = await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'chemistry',
        payload: {
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: '너는 IT 회사의 사내 전속 용한 도사(사주 전문가)야.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.9
        }
      })
    });
    
    if (!res.ok) throw new Error("궁합을 분석하는 중 에러가 발생했습니다.");
    const json = await res.json();
    return json.choices[0].message.content;
  },

  // 15. 🏢 팀 전체 궁합 보기
  getTeamChemistry: async (members) => {
    const membersText = members.map(m => `${m.name}(${m.birth})`).join(', ');
    const prompt = `우리 팀원들의 이름과 생년월일은 다음과 같아: [${membersText}].
    이 사주와 명리학 데이터를 바탕으로 '팀 전체의 업무 궁합과 시너지'를 유쾌한 사내 도사 컨셉으로 분석해줘.
    1. 🌟 팀 종합 케미
    2. ⚖️ 밸런스와 역할
    3. 🚀 도사의 조언`;

    const res = await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'team',
        payload: {
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: '너는 IT 회사의 사내 전속 용한 도사(사주 전문가)야.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.9
        }
      })
    });
    
    if (!res.ok) throw new Error("팀 궁합을 분석하는 중 에러가 발생했습니다.");
    const json = await res.json();
    return json.choices[0].message.content;
  }

};