// Stage 3: 사회 4-1 1단원 - 지도와 우리 지역 (호곡초등학교 주변)
// 1-1 다양한 정보가 담긴 지도 + 1-2 우리 지역의 위치와 특성

export const STAGE_3_ITEMS = {
    compass: {
        id: 'compass',
        name: '나침반',
        type: 'tool',
        isValid: true,
        description: '방위를 알려주는 나침반이야. 동서남북을 정확히 알 수 있어!'
    },
    magnifier: {
        id: 'magnifier',
        name: '돋보기',
        type: 'tool',
        isValid: true,
        description: '지도의 작은 기호도 크게 볼 수 있는 돋보기야.'
    },
    map_piece_1: {
        id: 'map_piece_1',
        name: '지도 조각 (학교)',
        type: 'map_piece',
        isValid: true,
        description: '호곡초등학교가 그려진 지도 조각이야!'
    },
    map_piece_2: {
        id: 'map_piece_2',
        name: '지도 조각 (아파트)',
        type: 'map_piece',
        isValid: true,
        description: '큰마을아파트와 에듀포레푸르지오가 그려진 지도 조각이야!'
    },
    map_piece_3: {
        id: 'map_piece_3',
        name: '지도 조각 (공원)',
        type: 'map_piece',
        isValid: true,
        description: '탄현근린공원이 그려진 지도 조각이야!'
    },
    map_piece_4: {
        id: 'map_piece_4',
        name: '지도 조각 (역)',
        type: 'map_piece',
        isValid: true,
        description: '탄현역이 그려진 지도 조각이야!'
    },
    legend_card: {
        id: 'legend_card',
        name: '범례 카드',
        type: 'tool',
        isValid: true,
        description: '지도 기호의 뜻을 알려주는 범례 카드야.'
    },
    scale_ruler: {
        id: 'scale_ruler',
        name: '축척 자',
        type: 'tool',
        isValid: true,
        description: '지도 위 거리를 실제 거리로 계산할 수 있는 축척 자야.'
    }
};

export const STAGE_3_QUIZ = [
    // === 1-1 다양한 정보가 담긴 지도 (12문제) ===
    {
        question: "지도에서 방위표의 'N'은 어느 방향을 뜻할까요?",
        options: ["남쪽", "북쪽", "동쪽", "서쪽"],
        answerIndex: 1,
        explanation: "N은 North(북쪽)의 첫 글자예요. 지도에서 위쪽이 보통 북쪽이랍니다."
    },
    {
        question: "지도에서 기호와 그 뜻을 설명해 놓은 것을 무엇이라 할까요?",
        options: ["축척", "방위표", "범례", "등고선"],
        answerIndex: 2,
        explanation: "범례는 지도에 사용된 기호가 무엇을 뜻하는지 알려주는 설명이에요."
    },
    {
        question: "지도의 축척이 1:25,000일 때, 지도에서 1cm는 실제로 몇 m일까요?",
        options: ["25m", "250m", "2,500m", "25,000m"],
        answerIndex: 1,
        explanation: "1:25,000은 지도의 1cm가 실제 25,000cm(=250m)라는 뜻이에요."
    },
    {
        question: "다음 중 지도에서 학교를 나타내는 기호로 알맞은 것은?",
        options: ["十 모양", "◎ 모양", "문(門) 모양", "♨ 모양"],
        answerIndex: 2,
        explanation: "학교는 문(門) 모양의 기호로 나타내요. 학교의 정문을 떠올려 보세요!"
    },
    {
        question: "지도에서 '♨' 기호는 무엇을 나타낼까요?",
        options: ["병원", "온천(목욕탕)", "소방서", "우체국"],
        answerIndex: 1,
        explanation: "♨는 뜨거운 물에서 김이 나는 모양으로, 온천을 나타내는 기호예요."
    },
    {
        question: "지도에서 넓은 범위를 나타낸 지도와 좁은 범위를 나타낸 지도의 차이점은?",
        options: ["색깔이 다르다", "축척이 다르다", "방위가 다르다", "종이 크기가 다르다"],
        answerIndex: 1,
        explanation: "넓은 범위를 나타내면 축척이 작고, 좁은 범위를 나타내면 축척이 크답니다."
    },
    {
        question: "지도를 읽을 때 방위표가 없다면 어느 쪽을 북쪽으로 볼까요?",
        options: ["아래쪽", "왼쪽", "오른쪽", "위쪽"],
        answerIndex: 3,
        explanation: "방위표가 없는 지도에서는 위쪽을 북쪽으로 약속해요."
    },
    {
        question: "지도에서 '우체국'을 나타내는 기호는 무엇일까요?",
        options: ["〒 모양", "十 모양", "☎ 모양", "⊕ 모양"],
        answerIndex: 0,
        explanation: "〒 모양은 우편물을 뜻하는 기호로, 우체국을 나타내요."
    },
    {
        question: "같은 장소를 큰 축척 지도와 작은 축척 지도로 보면 어떤 차이가 있을까요?",
        options: ["큰 축척 지도가 더 자세하다", "작은 축척 지도가 더 자세하다", "둘 다 같다", "축척은 자세함과 관계없다"],
        answerIndex: 0,
        explanation: "큰 축척 지도는 좁은 범위를 자세히 보여주고, 작은 축척 지도는 넓은 범위를 간략히 보여줘요."
    },
    {
        question: "등고선이 촘촘한 곳은 어떤 지형일까요?",
        options: ["평평한 곳", "경사가 급한 곳", "바다", "호수"],
        answerIndex: 1,
        explanation: "등고선 간격이 좁을수록 경사가 급하고, 넓을수록 완만한 지형이에요."
    },
    {
        question: "지도에서 파란색으로 표시하는 것은 주로 무엇일까요?",
        options: ["산", "도로", "강이나 바다", "건물"],
        answerIndex: 2,
        explanation: "지도에서 파란색은 물(강, 호수, 바다)을 나타낼 때 사용해요."
    },
    {
        question: "지도에서 초록색으로 표시하는 것은 주로 무엇일까요?",
        options: ["건물", "도로", "산이나 숲", "강"],
        answerIndex: 2,
        explanation: "초록색은 산, 숲, 공원 같은 녹지를 나타낼 때 사용해요."
    },

    // === 1-2 우리 지역의 위치와 특성 - 호곡초 주변 (13문제) ===
    {
        question: "호곡초등학교에서 북서쪽에 있는 아파트는 무엇일까요?",
        options: ["에듀포레푸르지오", "큰마을아파트", "탄현역", "호곡중학교"],
        answerIndex: 1,
        explanation: "큰마을아파트는 호곡초등학교의 북서쪽에 있어요."
    },
    {
        question: "호곡초등학교에서 북동쪽에 있는 아파트는 무엇일까요?",
        options: ["큰마을아파트", "에듀포레푸르지오", "탄현근린공원", "탄현동성당"],
        answerIndex: 1,
        explanation: "에듀포레푸르지오아파트는 호곡초등학교의 북동쪽에 위치해 있어요."
    },
    {
        question: "호곡초등학교의 북쪽에 있는 건물은 무엇일까요?",
        options: ["탄현역", "호곡중학교", "탄현동성당", "탄현근린공원"],
        answerIndex: 2,
        explanation: "탄현동성당은 호곡초등학교의 북쪽에 있어요."
    },
    {
        question: "호곡초등학교에서 동쪽으로 가면 어떤 학교가 있을까요?",
        options: ["탄현초등학교", "호곡중학교", "호곡고등학교", "탄현중학교"],
        answerIndex: 1,
        explanation: "호곡중학교는 호곡초등학교의 동쪽에 있어요."
    },
    {
        question: "탄현근린공원은 호곡초등학교에서 어느 방향에 있을까요?",
        options: ["서쪽", "남쪽", "동쪽", "북쪽"],
        answerIndex: 2,
        explanation: "탄현근린공원은 호곡중학교 근처, 학교 동쪽에 있어요."
    },
    {
        question: "호곡초등학교에서 남쪽으로 가면 어떤 교통시설이 있을까요?",
        options: ["버스터미널", "탄현역(지하철)", "기차역", "공항"],
        answerIndex: 1,
        explanation: "탄현역(지하철)은 호곡초등학교의 남쪽에 있어요."
    },
    {
        question: "호곡초등학교 서쪽의 자연환경으로 알맞은 것은?",
        options: ["바다", "산과 저수지", "사막", "큰 강"],
        answerIndex: 1,
        explanation: "호곡초등학교 서쪽에는 산과 저수지가 있어요."
    },
    {
        question: "우리 지역의 위치를 설명하는 방법이 아닌 것은?",
        options: ["방위를 사용한다", "주변 건물을 기준으로 설명한다", "맛있는 음식으로 설명한다", "도로를 기준으로 설명한다"],
        answerIndex: 2,
        explanation: "위치를 설명할 때는 방위, 주변 건물, 도로 등을 기준으로 해요."
    },
    {
        question: "아파트 단지가 많은 지역의 토지 이용 방법은 무엇일까요?",
        options: ["농업 지역", "주거 지역", "공업 지역", "상업 지역"],
        answerIndex: 1,
        explanation: "큰마을아파트, 에듀포레푸르지오처럼 아파트가 많은 곳은 주거 지역이에요."
    },
    {
        question: "탄현근린공원 같은 공원은 지역에서 어떤 역할을 할까요?",
        options: ["물건을 만드는 곳", "사람들이 쉬고 운동하는 곳", "농사를 짓는 곳", "물건을 파는 곳"],
        answerIndex: 1,
        explanation: "공원은 주민들이 휴식하고 운동하며 자연을 즐기는 공간이에요."
    },
    {
        question: "탄현역(지하철)은 우리 지역에서 어떤 역할을 할까요?",
        options: ["농사를 짓는다", "사람들이 다른 지역으로 이동한다", "물건을 만든다", "동물을 키운다"],
        answerIndex: 1,
        explanation: "지하철역은 사람들이 편리하게 다른 지역으로 이동할 수 있게 해주는 교통시설이에요."
    },
    {
        question: "호곡초등학교 주변에 산과 저수지가 있는 것은 어떤 특성을 보여줄까요?",
        options: ["도시에서 멀리 떨어져 있다", "자연환경과 주거환경이 함께 있다", "공장이 많다", "바다가 가깝다"],
        answerIndex: 1,
        explanation: "우리 지역은 아파트 같은 주거환경과 산, 저수지 같은 자연환경이 함께 있어요."
    },
    {
        question: "성당, 학교, 공원 같은 시설을 지도에서 무엇이라 부를까요?",
        options: ["자연지물", "인문지물", "등고선", "축척"],
        answerIndex: 1,
        explanation: "사람이 만든 건물이나 시설을 인문지물이라 하고, 산이나 강처럼 자연적인 것은 자연지물이라 해요."
    }
];

export const STAGE_3_MISSION_STEPS = {
    STEP_0_START: 0,           // 미션 시작 - 지도가 찢어진 것을 발견
    STEP_1_COMPASS: 1,         // 나침반 획득
    STEP_2_MAP_PIECES: 2,      // 지도 조각 4개 수집
    STEP_3_QUIZ_COMPLETE: 3,   // NPC 퀴즈 통과
    STEP_4_MAP_COMPLETE: 4     // 지도 완성 - 스테이지 클리어
};
