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

// 💡 디스코드 알림 전송용 공통 함수 (Worker로 이관)
const sendDiscord = async (message) => {
  try {
    await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'discord',
        payload: { content: message }
      })
    });
  } catch (e) {
    console.error('디스코드 알림 전송 실패', e);
  }
};

window.api = {
  // 1. 전체 좌석 데이터 가져오기
  fetchSeats: async () => {
    const { data, error } = await window.supabase.from('employee_seats').select('*');
    if (error) throw error;
    return data;
  },

  // 2. 좌석 상태(근무중/휴가 등) 업데이트
  updateStatus: async (id, newStatus) => {
    const { error } = await window.supabase.from('employee_seats').update({ status: newStatus }).eq('id', id);
    if (error) throw error;
  },

  // 3. AI 담당자 검색 (RAG) - Worker로 이관
  searchEmployee: async (searchQuery) => {
    const embeddingRes = await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'embedding',
        payload: { model: 'text-embedding-3-small', input: searchQuery }
      })
    });
    const embeddingData = await embeddingRes.json();

    const { data, error } = await window.supabase.rpc('match_employees', {
      query_embedding: embeddingData.data[0].embedding,
      match_threshold: 0.2,
      match_count: 1
    });
    if (error) throw error;
    return data;
  },

  // 4. AI 빈자리 추천 (LLM) - Worker로 이관
  recommendSeats: async (searchQuery, mapState) => {
    const systemPrompt = `당신은 천재적인 오피스 공간 매니저입니다.
현재 50석의 좌석 배치도 JSON: ${JSON.stringify(mapState)}
[공간 규칙] 좌석은 A~E열과 1~10번의 격자 구조입니다. 특정 인물 근처를 원하면 알파벳/숫자가 인접한 공석을 찾으세요.
[지시사항]
1. 조건에 부합하는 '공석'만 찾으세요. (전체 추천 금지)
2. 무조건 최대 3개까지만 추천하세요.
3. 오직 좌석 ID 문자열의 JSON 배열로만 응답하세요. 예시: ["C4", "C5"]`;

    const res = await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'chat',
        payload: {
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: searchQuery }
          ],
          temperature: 0.1
        }
      })
    });
    const json = await res.json();
    let content = json.choices[0].message.content.trim();
    if (content.startsWith('```')) content = content.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(content);
  },

  // 5. 자리 이동 요청 로직 (중복된 Worker URL 변수 제거)
  createRequest: async (seatId, requesterName) => {
    await window.supabase.from('seat_requests').update({ status: 'rejected' }).eq('seat_id', seatId).eq('status', 'pending');
    const { data, error } = await window.supabase.from('seat_requests').insert([{
      seat_id: seatId,
      requester_name: requesterName,
      status: 'pending'
    }]);

    if (!error) {
      const encodedName = encodeURIComponent(requesterName);
      const approveLink = `${WORKER_URL}/?action=approve&seatId=${seatId}&name=${encodedName}`;
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

// 12. 🍱 AI 맛집 탐험대 (카카오 API '진짜 맛집' 기반 추천)
  triggerLunchMatch: async () => {
    if (!navigator.geolocation) {
      throw new Error("이 브라우저에서는 GPS 위치 정보를 지원하지 않습니다.");
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        try {
          // 1. 카카오 API로 현재 위치 반경 2km 이내의 '진짜' 식당 데이터 긁어오기
          const kakaoRes = await fetch(WORKER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'kakao', payload: { lat, lon } })
          });
          
          const kakaoData = await kakaoRes.json();
          
          if (!kakaoData.documents || kakaoData.documents.length === 0) {
            throw new Error("주변에 검색되는 카카오맵 맛집이 없습니다!");
          }

          // 2. 카카오에서 받은 정보 중 상위 5개를 깔끔한 텍스트로 정리
          const realPlaces = kakaoData.documents.slice(0, 5).map(place => 
            `- 식당명: ${place.place_name} (종류: ${place.category_name.split('>').pop().trim()}) / 거리: ${place.distance}m / 주소: ${place.road_address_name || place.address_name}`
          ).join('\n');

          // 3. AI에게 "이 진짜 리스트 중에서만 골라서 추천해!" 라고 멱살 잡기
          const prompt = `내 주변에 실제로 있는 카카오맵 맛집 리스트 5개야.\n\n${realPlaces}\n\n반드시 이 진짜 리스트 안에 있는 식당 중에서만 3곳을 골라줘. 직장인 점심 식사로 왜 좋은지, 식당 이름과 거리를 포함해서 아주 유쾌하고 침 고이게 설명해줘. 절대로 목록에 없는 가상의 식당을 지어내면 안 돼!`;

          // 4. OpenAI에 요청 전송
          const res = await fetch(WORKER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'chat',
              payload: {
                model: 'gpt-4o-mini',
                messages: [
                  { role: 'system', content: '너는 팩트(Fact) 기반으로 점심 메뉴를 기가 막히게 추천해주는 사내 맛집 탐험대장이야.' },
                  { role: 'user', content: prompt }
                ],
                temperature: 0.5 // 창의성을 확 낮춰서 헛소리(환각) 차단
              }
            })
          });

          if (!res.ok) throw new Error("맛집 정보를 분석하는 중 에러가 발생했습니다.");
          const json = await res.json();
          
          // 최종 결과 화면으로 쏘기!
          resolve(json.choices[0].message.content);

        } catch (error) {
          reject(new Error(error.message || "AI가 진짜 맛집을 찾는 데 실패했습니다."));
        }
      }, (error) => {
        reject(new Error("GPS 위치 정보 접근 권한을 허용해 주셔야 진짜 맛집을 찾을 수 있습니다!"));
      });
    });
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
    
    // 💡 범인을 잡기 위해 콘솔창에 찍어보는 코드를 추가합니다!
    console.log("🚨 Worker에서 온 데이터 확인:", json); 

    // 에러가 있다면 화면에 띄워줍니다.
    if (json.error) {
      alert("API 에러 발생: " + (json.error.message || json.error));
      return;
    }

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
    
    // 💡 범인을 잡기 위해 콘솔창에 찍어보는 코드를 추가합니다!
    console.log("🚨 Worker에서 온 데이터 확인:", json); 

    // 에러가 있다면 화면에 띄워줍니다.
    if (json.error) {
      alert("API 에러 발생: " + (json.error.message || json.error));
      return;
    }

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