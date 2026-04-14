// Stage 3: 사회 4-1 1단원 - 지도와 우리 지역 (호곡초등학교 주변)
// 1-1 다양한 정보가 담긴 지도 + 1-2 우리 지역의 위치와 특성
//
// 핵심개념 (14개):
//   [1-1] 지도의 의미 / 방위 / 기호 / 범례 / 등고선 / 축척 / 일상생활의 지도
//   [1-2] 주소로 위치 파악 / 지형 / 면적·모양 / 인구 / 기온 / 강수량 / 지리 정보

export const STAGE_3_ITEMS = {
    compass: {
        id: 'compass',
        name: '나침반',
        type: 'tool',
        isValid: true,
        description: '방위를 알려주는 나침반이야. 동서남북 방향으로 위치를 나타내는 것이 바로 "방위"란다.'
    },
    magnifying_glass: {
        id: 'magnifying_glass',
        name: '돋보기',
        type: 'tool',
        isValid: true,
        description: '지도의 작은 기호도 자세히 볼 수 있는 돋보기야.'
    },
    torn_map_1: {
        id: 'torn_map_1',
        name: '지도 조각 (북)',
        type: 'map_piece',
        isValid: true,
        description: '탄현동성당 쪽, 호곡초 북쪽 지역이 그려진 지도 조각이야.'
    },
    torn_map_2: {
        id: 'torn_map_2',
        name: '지도 조각 (북서)',
        type: 'map_piece',
        isValid: true,
        description: '큰마을아파트 주변, 호곡초 북서쪽이 그려진 지도 조각이야.'
    },
    torn_map_3: {
        id: 'torn_map_3',
        name: '지도 조각 (동)',
        type: 'map_piece',
        isValid: true,
        description: '탄현근린공원 주변, 호곡초 동쪽이 그려진 지도 조각이야.'
    },
    torn_map_4: {
        id: 'torn_map_4',
        name: '지도 조각 (남)',
        type: 'map_piece',
        isValid: true,
        description: '탄현역 주변, 호곡초 남쪽이 그려진 지도 조각이야.'
    },
    legned_card_icon: {
        id: 'legned_card_icon',
        name: '범례 카드',
        type: 'tool',
        isValid: true,
        description: '지도에 쓰인 기호와 그 뜻을 한곳에 모아 나타낸 것이 "범례"란다.'
    },
    ruler: {
        id: 'ruler',
        name: '축척 막대자',
        type: 'tool',
        isValid: true,
        description: '두 지점 사이의 실제 거리를 알 수 있는 축척 막대자야.'
    }
};

// 25문항 — 6명의 NPC에게 4~5문제씩 분배
// Q0-3 : 지도 박사 / Q4-7 : 큰마을 주민 / Q8-11 : 성당 관리인
// Q12-15 : 공원 관리인 / Q16-19 : 역무원 / Q20-24 : 산지기
export const STAGE_3_QUIZ = [
    // === 지도 박사 (Q0-3): 지도의 의미 & 방위 ===
    {
        question: "지도란 하늘에서 내려다본 (        )의 모습을 일정하게 줄여 약속에 따라 나타낸 그림입니다.",
        options: ["하늘", "땅", "바다", "구름"],
        answerIndex: 1,
        explanation: "지도는 '하늘에서 내려다본 땅의 모습'을 줄여 약속에 따라 나타낸 그림이에요."
    },
    {
        question: "지도에 나타난 선, 색, 숫자, 모양은 모두 무엇에 따라 표현한 것일까요?",
        options: ["기분", "약속", "시간", "자연"],
        answerIndex: 1,
        explanation: "지도의 모든 표시는 사람들이 정한 '약속'에 따라 표현해요."
    },
    {
        question: "지도에서 동서남북 방향으로 위치를 나타내는 것을 무엇이라 할까요?",
        options: ["축척", "방위", "범례", "기호"],
        answerIndex: 1,
        explanation: "동서남북 방향으로 위치를 나타내는 것을 '방위'라고 해요."
    },
    {
        question: "지도에 방위표가 없을 때 아래쪽은 어느 방향일까요?",
        options: ["북쪽", "남쪽", "동쪽", "서쪽"],
        answerIndex: 1,
        explanation: "방위표가 없으면 위=북, 아래=남, 오른쪽=동, 왼쪽=서로 약속해요."
    },

    // === 큰마을 주민 (Q4-7): 인구 & 면적·모양 ===
    {
        question: "일정한 지역에 사는 사람의 수를 무엇이라 할까요?",
        options: ["인구", "면적", "지형", "기후"],
        answerIndex: 0,
        explanation: "일정한 지역에 사는 사람의 수를 '인구'라고 해요."
    },
    {
        question: "산이 많은 지역의 인구는 면적에 비해 어떤 편일까요?",
        options: ["많습니다", "적습니다", "똑같습니다", "매년 변합니다"],
        answerIndex: 1,
        explanation: "산이 많은 지역은 면적에 비해 인구가 적어요."
    },
    {
        question: "지역의 면적과 모양은 어떻다고 할 수 있을까요?",
        options: ["모두 똑같다", "다양하다", "모두 네모 모양이다", "변하지 않는다"],
        answerIndex: 1,
        explanation: "지역의 면적과 모양은 지역마다 다양해요."
    },
    {
        question: "지역의 면적에 대한 설명으로 알맞은 것은?",
        options: ["모든 지역의 면적이 같다", "면적이 넓은 지역도 있고 좁은 지역도 있다", "면적은 날씨에 따라 변한다", "면적은 사람이 직접 정한다"],
        answerIndex: 1,
        explanation: "지역마다 면적이 다양해서 넓은 지역도 있고 좁은 지역도 있어요."
    },

    // === 성당 관리인 (Q8-11): 주소로 위치 파악 & 기호·범례 ===
    {
        question: "우리 지역의 위치를 파악하려면 주로 무엇을 보면 될까요?",
        options: ["거울", "지도", "사진", "달력"],
        answerIndex: 1,
        explanation: "지도를 보면 우리 지역의 위치를 파악할 수 있어요."
    },
    {
        question: "우리 지역의 위치를 쉽게 찾기 위해 (        )에 나타난 지역의 이름을 지도에서 찾습니다.",
        options: ["전화번호", "주소", "별명", "생일"],
        answerIndex: 1,
        explanation: "주소에 나타난 지역의 이름을 지도에서 찾으면 위치를 쉽게 찾을 수 있어요."
    },
    {
        question: "장소의 생김새나 특징을 본떠서 만든 약속 표시를 무엇이라 할까요?",
        options: ["기호", "범례", "축척", "등고선"],
        answerIndex: 0,
        explanation: "'기호'는 장소의 생김새나 특징을 본떠서 만든 약속이에요."
    },
    {
        question: "지도에 쓰인 기호와 그 뜻을 한곳에 모아 나타낸 것을 무엇이라 할까요?",
        options: ["축척", "방위", "범례", "등고선"],
        answerIndex: 2,
        explanation: "'범례'는 지도에 쓰인 기호와 그 뜻을 한곳에 모아 나타낸 거예요."
    },

    // === 공원 관리인 (Q12-15): 기온 & 강수량 ===
    {
        question: "공기의 온도를 무엇이라 할까요?",
        options: ["기압", "기온", "강수량", "습도"],
        answerIndex: 1,
        explanation: "공기의 온도를 '기온'이라 해요."
    },
    {
        question: "비, 눈 등 일정 기간 지역에 내린 물의 총량을 무엇이라 할까요?",
        options: ["기온", "강수량", "기후", "풍속"],
        answerIndex: 1,
        explanation: "비·눈 등 내린 물의 총량을 '강수량'이라 해요."
    },
    {
        question: "우리나라는 대체로 어느 계절에 기온이 높고 강수량이 많을까요?",
        options: ["봄", "여름", "가을", "겨울"],
        answerIndex: 1,
        explanation: "우리나라는 대체로 여름에 기온이 높고 강수량이 많아요."
    },
    {
        question: "같은 계절이라도 지역마다 기온과 강수량은 어떨까요?",
        options: ["언제나 똑같다", "지역마다 차이가 난다", "예측이 불가능하다", "여름에만 달라진다"],
        answerIndex: 1,
        explanation: "같은 계절이라도 지역마다 기온과 강수량의 차이가 있어요."
    },

    // === 역무원 (Q16-19): 축척 & 일상생활의 지도 ===
    {
        question: "지도에서 실제 거리를 줄여 나타낸 정도를 무엇이라 할까요?",
        options: ["방위", "범례", "축척", "등고선"],
        answerIndex: 2,
        explanation: "실제 거리를 줄여 나타낸 정도를 '축척'이라 해요."
    },
    {
        question: "축척에 따라 지도에 나타나는 지역의 무엇이 달라질까요?",
        options: ["색깔", "범위와 자세한 정도", "계절", "사람 수"],
        answerIndex: 1,
        explanation: "축척에 따라 지도에 나타나는 지역의 범위와 자세한 정도가 달라져요."
    },
    {
        question: "두 지점 사이의 실제 거리를 알려주는 도구는 무엇일까요?",
        options: ["나침반", "방위표", "축척 막대자", "돋보기"],
        answerIndex: 2,
        explanation: "축척 막대자를 이용하면 두 지점 사이의 실제 거리를 알 수 있어요."
    },
    {
        question: "다음 중 일상생활에서 활용하는 '지도'가 아닌 것은?",
        options: ["관광 안내도", "지하철 노선도", "버스 노선도", "일기 예보 방송"],
        answerIndex: 3,
        explanation: "일상생활의 지도에는 관광 안내도, 약도, 지하철·버스 노선도, 길 도우미 지도 등이 있어요."
    },

    // === 산지기 (Q20-24): 지형·등고선 & 지리 정보 ===
    {
        question: "산, 평야, 강, 섬, 호수, 바다처럼 땅의 생김새를 무엇이라 할까요?",
        options: ["지형", "지리", "지도", "지역"],
        answerIndex: 0,
        explanation: "여러 가지 땅의 생김새를 '지형'이라 해요."
    },
    {
        question: "지도에서 땅의 높낮이를 나타내는 선은 무엇일까요?",
        options: ["방위선", "축척선", "등고선", "경계선"],
        answerIndex: 2,
        explanation: "땅의 높낮이는 '등고선'으로 나타내요."
    },
    {
        question: "등고선은 무엇이 같은 곳을 연결한 선일까요?",
        options: ["기온", "높이", "나무 종류", "흙의 색깔"],
        answerIndex: 1,
        explanation: "등고선은 높이가 같은 곳을 연결한 선이에요."
    },
    {
        question: "위치, 지형, 인구, 면적, 기온과 강수량처럼 지역의 특징을 나타내는 모든 정보를 무엇이라 할까요?",
        options: ["지도", "지리 정보", "지역 통계", "기상 정보"],
        answerIndex: 1,
        explanation: "지역의 특징을 나타내는 모든 정보를 '지리 정보'라 해요."
    },
    {
        question: "우리 지역만의 특징을 어떻게 알아볼 수 있을까요?",
        options: ["한 가지 정보만 본다", "지리 정보를 다른 지역과 비교한다", "모두 똑같다고 본다", "정보를 모으지 않는다"],
        answerIndex: 1,
        explanation: "지리 정보를 다른 지역과 비교해 보면 우리 지역의 특징을 파악할 수 있어요."
    }
];

export const STAGE_3_MISSION_STEPS = {
    STEP_0_START: 0,           // 미션 시작
    STEP_1_COMPASS: 1,         // 나침반 획득
    STEP_2_MAP_PIECES: 2,      // 지도 조각 4개 수집 완료
    STEP_3_QUIZ_COMPLETE: 3,   // NPC 6명 퀴즈 모두 통과
    STEP_4_MAP_COMPLETE: 4     // 지도 완성 - 스테이지 클리어
};

// NPC별 담당 퀴즈 범위 (STAGE_3_QUIZ 배열 인덱스 기준)
export const STAGE_3_NPC_QUIZ_RANGES = {
    'map_scholar':       { start: 0,  end: 4,  topic: '지도의 의미와 방위' },
    'Village_Resident':  { start: 4,  end: 8,  topic: '인구와 면적' },
    'Church_Caretaker':  { start: 8,  end: 12, topic: '주소와 기호·범례' },
    'Park_Ranger':       { start: 12, end: 16, topic: '기온과 강수량' },
    'Station_Attendant': { start: 16, end: 20, topic: '축척과 일상생활의 지도' },
    'Mountain_Keeper':   { start: 20, end: 25, topic: '지형·등고선과 지리 정보' }
};

// NPC별 대사 (greeting: 첫 인사, pass: 통과 후, before_pieces: 조각 부족 시)
export const STAGE_3_NPC_DIALOGUES = {
    'map_scholar': {
        greeting: "호곡에 오길 잘했구나! 나는 지도 박사. 지도는 '약속'에 따라 그려진 그림이란다. 네가 얼마나 알고 있는지 볼까?",
        pass: "잘했다. 너는 이미 지도의 기본 약속을 이해하고 있구나.",
        before_pieces: "먼저 마을을 돌며 흩어진 지도 조각을 모두 모아오렴."
    },
    'Village_Resident': {
        greeting: "안녕! 나는 이 아파트에서 오래 살고 있단다. 우리 동네의 '인구'와 '면적'에 대해 물어보마.",
        pass: "역시! 우리 마을의 사람과 땅을 잘 이해하고 있구나.",
        before_pieces: "지도 조각을 다 모아오렴. 그래야 대답해 줄 수 있어."
    },
    'Church_Caretaker': {
        greeting: "반갑구나. '주소'로 위치를 찾는 법과 '기호·범례'에 대해 알아볼까?",
        pass: "훌륭해! 이제 지도를 제대로 읽을 수 있겠구나.",
        before_pieces: "조각부터 모두 모아서 다시 오너라."
    },
    'Park_Ranger': {
        greeting: "공원에 온 걸 환영해! 오늘 날씨가 좋지? '기온'과 '강수량' 이야기를 해보자꾸나.",
        pass: "대단해! 우리 지역의 날씨를 잘 알고 있구나.",
        before_pieces: "먼저 지도 조각을 모두 모아야 해."
    },
    'Station_Attendant': {
        greeting: "어서 오세요! 지하철 노선도도 지도 중 하나랍니다. '축척'과 '일상생활의 지도'에 대해 물어볼게요.",
        pass: "완벽해요! 축척의 원리를 잘 이해했군요.",
        before_pieces: "지도 조각을 모두 모으면 다시 찾아오세요."
    },
    'Mountain_Keeper': {
        greeting: "산에서 왔구나. '지형'과 '등고선', 그리고 '지리 정보'에 대해 물어보마.",
        pass: "훌륭하다! 이제 너는 우리 지역을 '지리 정보'로 이해하게 되었구나.",
        before_pieces: "조각을 다 모으고 다시 오너라."
    }
};

// 인트로 시퀀스 (STEP_0_START)
export const STAGE_3_INTRO = [
    { text: "앗! 바람에 낡은 지도 조각이 날아왔어.", name: "나" },
    { text: "그리고... 학교 앞에 낯선 할아버지가 서 있어. 이상한 모자를 쓰고 있어...", name: "나" },
    { text: "드디어 왔구나! 나는 50년 전 이 마을을 지도로 그린 '지도 박사'란다.", name: "지도 박사" },
    { text: "오늘 아침 내 마법의 지도가 살아나 조각이 마을 곳곳으로 흩어져 버렸어.", name: "지도 박사" },
    { text: "지도는 하늘에서 내려다본 '땅의 모습'을 줄여 '약속에 따라' 나타낸 그림이란다.", name: "지도 박사" },
    { text: "네가 진짜 이 마을을 사랑한다면, 조각을 모을 수 있을 거야.", name: "지도 박사" },
    { text: "자, 이 '나침반'을 받으렴. '방위'를 알려줄 길잡이란다.", name: "지도 박사" },
    { text: "동서남북 방향으로 위치를 나타내는 것이 '방위'야. 방위표가 없으면 위가 북, 아래가 남이지.", name: "지도 박사" },
    { text: "마을 곳곳에 있는 '수호자'들을 만나 보렴. 그들이 지키는 조각을 얻으려면 그들의 질문에 답해야 해.", name: "지도 박사" },
    { text: "나침반과 지도 조각을 모으고, 수호자들을 만나세요.", name: "System" }
];

// ========== 미션 1: 방위 보물 찾기 ==========
// 나침반 획득 직후, 첫 번째 지도 조각 방향 힌트
export const STAGE_3_COMPASS_HINT = {
    targetItem: 'torn_map_1', // 호곡초 북쪽 탄현동성당 방향
    direction: '북',           // HUD에 표시할 방향
    dialogue: "나침반이 '북'을 가리키고 있어! 호곡초 북쪽으로 가서 첫 조각을 찾아보자."
};

// ========== 미션 2: 등고선 길찾기 퍼즐 ==========
// 산지기 접근 시 출제. 정답을 맞춰야 산지기와 대화 가능
export const STAGE_3_CONTOUR_PUZZLE = {
    intro: "등고선이 촘촘한 길은 경사가 급해서 지나갈 수 없어. 올바른 길을 골라 산지기에게 가자!",
    question: "산지기의 집으로 가려면 어떤 길을 선택해야 할까요?",
    options: [
        {
            label: "A",
            description: "등고선이 매우 촘촘한 가파른 절벽길",
            isCorrect: false,
            feedback: "앗! 등고선이 촘촘한 곳은 경사가 급해서 올라갈 수 없어."
        },
        {
            label: "B",
            description: "등고선 간격이 넓은 완만한 언덕길",
            isCorrect: true,
            feedback: "정답! 등고선 간격이 넓을수록 경사가 완만해서 올라가기 쉬워."
        },
        {
            label: "C",
            description: "등고선이 전혀 없는 평평한 길 (바다 쪽)",
            isCorrect: false,
            feedback: "등고선이 없는 곳은 바다나 호수야. 산이 아니란다."
        }
    ]
};

// ========== 미션 3: 지형 분류 미니게임 ==========
// 산지기 퀴즈 통과 후 출제
export const STAGE_3_TERRAIN_SORT = {
    intro: "우리 지역에 있는 땅의 생김새를 정리해보자. 각 지형을 올바른 종류로 분류하렴!",
    categories: [
        { id: 'mountain', label: '산', description: '솟아오른 땅' },
        { id: 'water',    label: '물',  description: '강·호수·저수지·바다' },
        { id: 'flat',     label: '평야', description: '평평하게 넓은 땅' }
    ],
    items: [
        { id: 'hogok_mt',     name: '호곡산',        correctCategory: 'mountain' },
        { id: 'reservoir',    name: '탄현 저수지',    correctCategory: 'water' },
        { id: 'han_river',    name: '한강',          correctCategory: 'water' },
        { id: 'gimpo_plain',  name: '김포 평야',      correctCategory: 'flat' },
        { id: 'bukhansan',    name: '북한산',        correctCategory: 'mountain' },
        { id: 'west_sea',     name: '서해 바다',      correctCategory: 'water' }
    ],
    successMessage: "훌륭해! 이 모든 것이 '지형'이야. 우리 지역에도 다양한 지형이 있단다.",
    failMessage: "다시 생각해보자. 산은 솟아오른 땅, 강·호수·바다는 물, 평야는 평평한 땅이야."
};

// ========== 미션 4: 지리 정보 프로필 ==========
// 6명 NPC 퀴즈 모두 통과 후, 엔딩 직전 출제
export const STAGE_3_REGION_PROFILE = {
    intro: "우리가 배운 지리 정보를 모아 '호곡 프로필 카드'를 완성해보자!",
    fields: [
        {
            id: 'location',
            label: '📍 위치',
            question: '호곡초등학교가 위치한 지역은?',
            options: ['경기도 고양시', '서울 강남구', '부산 해운대구', '제주도'],
            correctIndex: 0
        },
        {
            id: 'terrain',
            label: '🏔️ 지형',
            question: '호곡초 서쪽의 대표 지형은?',
            options: ['바다와 섬', '산과 저수지', '넓은 평야', '사막'],
            correctIndex: 1
        },
        {
            id: 'population',
            label: '👥 인구',
            question: '우리 지역의 인구 특성은?',
            options: [
                '아파트 단지가 많아 인구가 많은 편',
                '산만 있어서 인구가 매우 적음',
                '농촌이라 인구가 적음',
                '사람이 거의 살지 않음'
            ],
            correctIndex: 0
        },
        {
            id: 'climate',
            label: '🌤️ 기온과 강수량',
            question: '우리 지역의 계절별 특징은?',
            options: [
                '사계절 내내 똑같음',
                '여름에 기온이 높고 강수량이 많음',
                '겨울에만 비가 많이 옴',
                '기온·강수량의 변화가 없음'
            ],
            correctIndex: 1
        }
    ],
    successMessage: "완벽해! 위치·지형·인구·기온·강수량 — 이 모든 정보가 바로 '지리 정보'란다.",
    failMessage: "다시 생각해보자. 우리가 NPC들에게 배운 내용을 떠올려봐."
};

// 엔딩 시퀀스 (STEP_4_MAP_COMPLETE)
export const STAGE_3_ENDING = [
    { text: "모든 조각이 빛나기 시작했어!", name: "System" },
    { text: "지도 위에 글자가 떠오른다...", name: "System" },
    { text: "위치, 지형, 인구, 면적, 기온과 강수량 — 이 모든 정보가 드러났구나.", name: "지도 박사" },
    { text: "지역의 특징을 나타내는 이 모든 것을 '지리 정보'라 한단다.", name: "지도 박사" },
    { text: "지리 정보를 다른 지역과 비교해 보면, 우리 지역만의 특징이 보이지.", name: "지도 박사" },
    { text: "이제 너는 지도를 읽는 법뿐만 아니라, '지리 정보'로 우리 지역을 이해하는 법을 알게 되었구나.", name: "지도 박사" },
    { text: "호곡은 숫자와 기호, 그리고 그 속에 사는 사람들의 이야기란다.", name: "지도 박사" },
    { text: "이제부터 호곡의 새로운 지도를 그릴 사람은 바로 너다.", name: "지도 박사" },
    { text: "네가 만들 새로운 지도는, 어떤 이야기를 담게 될까?", name: "지도 박사" }
];
