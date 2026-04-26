// 💡 본인의 API 정보로 반드시 교체하세요!
const SUPABASE_URL = 'https://kzrlzkmpcfqtwfwkbdbm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6cmx6a21wY2ZxdHdmd2tiZGJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0NzU4MzAsImV4cCI6MjA5MjA1MTgzMH0.lf5haWoI9S3mpf1cYfvNsP1U0IuxEp7JBw5hnFUWZF4';
const OPENAI_API_KEY = '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';
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1497799152505983078/nT-PFEA3y4g5NhakXcT6Ihl7mSwGUnCubMHkBKlBGvB4_2QfB0xJD-hSwBvOARMeeDtS';
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

  // 12. AI 맛집 탐험대 점심 랜덤 매칭 (GPS 기반)
  triggerLunchMatch: async (seatsArray) => {
    // 1. 현재 브라우저 위치(GPS) 가져오기
    const getGPS = () => new Promise((res) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => res(`위도 ${pos.coords.latitude}, 경도 ${pos.coords.longitude}`),
        () => res("서울 성수동") // 위치 권한 거부 시 기본값
      );
    });

    const currentLocation = await getGPS();

    // 2. 인원 필터링 및 랜덤 파티 구성 (여기서 partyMembers가 만들어집니다!)
    const activeUsers = seatsArray.filter(s => s.status === '근무중' && s.name);
    if (activeUsers.length < 2) {
      alert('점심 매칭을 하려면 최소 2명 이상이 근무 중이어야 합니다!');
      return;
    }

    const shuffled = activeUsers.sort(() => 0.5 - Math.random());
    const partySize = Math.floor(Math.random() * 3) + 2;
    const partyMembers = shuffled.slice(0, partySize).map(u => u.name);

    alert('AI가 GPS 기반으로 맛집을 찾고 있습니다. 잠시만 기다려주세요... 🍱');

    // 3. AI 프롬프트 세팅
    const prompt = `오늘의 오피스 랜덤 점심 파티원은 [${partyMembers.join(', ')}]야. 
    이 사람들을 위해 현재 내 위치(${currentLocation})에서 "반드시 반경 2km 이내"에 있는 매력적인 로컬 맛집을 딱 하나 추천해줘. 
    조건 1: 무조건 이 좌표 기준 2km 반경 안에 존재하는 실제 식당이어야 해. (먼 곳은 절대 안 됨!)
    조건 2: '일월카츠'처럼 가게 이름의 유래가 뚜렷하거나 요리에 대한 장인정신, 브랜딩 철학이 돋보이는 곳이어야 해.
    식당 이름, 추천 메뉴, 그리고 이 식당만의 특별한 분위기나 네이밍 스토리를 디스코드 알림용으로 신나고 친근하게 작성해줘.`;

    let aiMessage = "";

    // 4. OpenAI 통신
    try {
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
              content: '너는 센스 있는 컬처 매니저야.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.8
        })
      });

      if (!res.ok) throw new Error(`OpenAI 상태 코드 에러: ${res.status}`);

      const json = await res.json();
      aiMessage = json.choices[0].message.content;

    } catch (e) {
      console.error("🚨 OpenAI Fetch 에러 상세:", e);
      alert('OpenAI API 통신 실패!');
      return;
    }

    // 5. 디스코드 전송
    if (aiMessage) {
      try {
        await sendDiscord(`📍 **[GPS 기반 랜덤 점심 탐험대!]**\n\n${aiMessage}`);
        alert('디스코드로 점심 매칭 결과가 전송되었습니다! 🎉');
      } catch (e) {
        console.error("Discord Fetch 에러:", e);
        alert('디스코드 전송 실패!');
      }
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