export const STAGE_1_ITEMS = {
    // 1. 올바른 처치 아이템
    water_bottle: {
        id: 'water_bottle',
        name: '생수병',
        type: 'cool',
        isValid: true,
        description: '깨끗한 물이야. 화상 부위를 식힐 때 사용할 수 있어.'
    },
    gauze: {
        id: 'gauze',
        name: '멸균 거즈',
        type: 'protect',
        isValid: true,
        description: '상처를 감싸서 세균 감염을 막아주는 깨끗한 거즈야.'
    },
    sink: {
        id: 'sink',
        name: '수돗물',
        type: 'cool',
        isValid: true,
        description: '흐르는 차가운 수돗물이야. 화상 부위의 열기를 식히기에 가장 좋아.'
    },

    // 2. 잘못된 처치 아이템 (함정)
    ice_pack: {
        id: 'ice_pack',
        name: '얼음팩',
        type: 'bad',
        isValid: false,
        penaltyMsg: '얼음을 직접 대면 동상 위험이 있고 혈관이 수축해 회복을 늦춰!',
        description: '차가운 얼음팩. 하지만 상처에 직접 대면 위험할 수도 있어.'
    },
    toothpaste: {
        id: 'toothpaste',
        name: '치약',
        type: 'bad',
        isValid: false,
        penaltyMsg: '치약의 성분이 상처를 자극하고 감염을 일으킬 수 있어!',
        description: '상쾌한 치약. 화상 부위의 열기를 식혀줄 것 같지만...'
    },
    doenjang: {
        id: 'doenjang',
        name: '된장',
        type: 'bad',
        isValid: false,
        penaltyMsg: '된장을 바르면 세균 감염 위험이 있어! 절대 바르면 안 돼.',
        description: '구수한 된장. 요리할 때는 좋지만 상처에 발라도 될까?'
    },
    needle: {
        id: 'needle',
        name: '바늘',
        type: 'bad',
        isValid: false,
        penaltyMsg: '물집을 터뜨리면 2차 감염의 위험이 높아져! 터뜨리지 마.',
        description: '날카로운 바늘. 물집이 생겼을 때 터뜨려야 할까?'
    }
};

export const STAGE_1_QUIZ = [
    {
        question: "화상을 입었을 때 가장 먼저 해야 할 행동은 무엇인가요?",
        options: ["상처에 약 바르기", "화상 부위 식히기", "물집 터뜨리기", "친구와 놀기"],
        answerIndex: 1,
        explanation: "화상을 입으면 즉시 열기를 식히는 것이 가장 중요합니다."
    },
    {
        question: "화상 부위를 식힐 때 가장 안전한 방법은 무엇인가요?",
        options: ["얼음팩 직접 대기", "흐르는 찬물에 15분 식히기", "따뜻한 물로 씻기", "알코올 소독하기"],
        answerIndex: 1,
        explanation: "흐르는 시원한 물로 충분히 식히는 것이 피부 손상을 줄이는 가장 안전한 방법입니다."
    },
    {
        question: "화상 부위에 옷이 달라붙었을 때 어떻게 해야 할까요?",
        options: ["억지로 떼어낸다", "옷 위로 찬물을 부어 식히며 병원 가기", "가위로 다 잘라낸다", "기름을 발라 떼어낸다"],
        answerIndex: 1,
        explanation: "옷을 억지로 떼면 피부가 같이 벗겨질 수 있으므로, 옷 위로 찬물을 부어 식히며 병원 상담을 받아야 합니다."
    },
    {
        question: "화상 부위에 생기는 물집에 대한 올바른 대처법은?",
        options: ["바늘로 터뜨린다", "손대지 않고 그대로 둔다", "눌러서 짠다", "손톱으로 긁는다"],
        answerIndex: 1,
        explanation: "물집을 터뜨리면 세균에 감염될 위험이 높으므로 절대 건드리지 말아야 합니다."
    },
    {
        question: "화상 상처에 된장이나 치약을 바르면 왜 안 될까요?",
        options: ["맛이 없어서", "상처에 영양을 줘서", "세균 감염 위험이 커지기 때문", "냄새가 나기 때문"],
        answerIndex: 2,
        explanation: "민간요법은 상처를 심각하게 감염시킬 수 있어 절대 금물입니다."
    },
    {
        question: "화상 부위를 식힐 때 수돗물의 수압은?",
        options: ["매우 강하게", "약하게 졸졸졸", "얼어서 안 나올 만큼", "수압은 상관없다"],
        answerIndex: 1,
        explanation: "수압이 너무 강하면 상처 부위에 통증을 유발하고 손상을 줄 수 있습니다."
    },
    {
        question: "상처 부위에 얼음을 직접 대면 안 되는 이유는 무엇인가요?",
        options: ["얼음이 녹아서", "너무 시원해서", "동상 위험 및 회복 지연", "얼음이 딱딱해서"],
        answerIndex: 2,
        explanation: "심한 냉기는 혈관을 수축시켜 회복을 방해하고 동상을 유발할 수 있습니다."
    },
    {
        question: "화상을 입었을 때 반지나 팔찌를 즉시 제거해야 하는 이유는?",
        options: ["잃어버릴까 봐", "장신구가 녹을까 봐", "나중에 부어올라 순환을 방해하므로", "병원이 싫어해서"],
        answerIndex: 2,
        explanation: "화상 부위가 부어오르면 장신구가 혈액 순환을 방해하여 위험해질 수 있습니다."
    },
    {
        question: "화상 부위를 보호할 때 사용하는 가장 적절한 도구는?",
        options: ["멸균 거즈", "일반 휴지", "신문지", "솜뭉치"],
        answerIndex: 0,
        explanation: "세균이 없는 깨끗한 멸균 거즈로 감싸는 것이 가장 안전합니다."
    },
    {
        question: "햇빛에 피부가 붉어진 '1도 화상' 시 대처법은?",
        options: ["찬물로 진정시키고 수분 보충", "뜨거운 수건 찜질", "때 밀기", "그냥 두기"],
        answerIndex: 0,
        explanation: "햇빛 화상도 시원한 물로 진정시키고 충분한 물을 마시는 것이 좋습니다."
    },
    {
        question: "거즈로 상처를 감쌀 때 주의할 점은 무엇인가요?",
        options: ["피가 안 통하게 꽉 조이기", "가볍게 감싸기", "비닐로 밀봉하기", "박스 테이프로 붙이기"],
        answerIndex: 1,
        explanation: "상처를 압박하지 말고 보호한다는 느낌으로 가볍게 감싸야 합니다."
    },
    {
        question: "화상 환자가 반드시 병원에 가야 하는 경우가 아닌 것은?",
        options: ["물집이 생겼을 때", "화상 부위가 넓을 때", "얼굴이나 관절 부위일 때", "피부가 아주 살짝 가렵기만 할 때"],
        answerIndex: 3,
        explanation: "심한 화상은 반드시 전문가의 치료가 필요하지만, 아주 경미한 자극은 병원까지 갈 필요가 없을 수 있습니다."
    },
    {
        question: "눈에 뜨거운 물이나 이물질이 들어갔을 때 대처법은?",
        options: ["눈 비비기", "흐르는 물에 계속 씻어내기", "안대 쓰고 잠자기", "손가락으로 파내기"],
        answerIndex: 1,
        explanation: "눈은 매우 예민하므로 흐르는 깨끗한 물로 충분히 씻어낸 후 즉시 병원에 가야 합니다."
    },
    {
        question: "뜨거운 냄비를 옮길 때 화상을 예방하는 도구는?",
        options: ["두꺼운 주방 장갑", "얇은 비닐 장갑", "맨손", "종이컵"],
        answerIndex: 0,
        explanation: "열을 차단해주는 두꺼운 장갑을 사용하는 습관이 중요합니다."
    },
    {
        question: "화상 부위의 열기를 식히는 가장 안전한 액체는?",
        options: ["흐르는 수돗물 또는 생수", "우유", "주스", "식용유"],
        answerIndex: 0,
        explanation: "깨끗한 물만이 상처를 안전하게 식힐 수 있습니다."
    },
    {
        question: "상처 부위를 입으로 불어주는 것이 좋지 않은 이유는?",
        options: ["침이 튀어서", "입속 세균이 상처로 옮겨갈 수 있어서", "입이 아파서", "아무 효과가 없어서"],
        answerIndex: 1,
        explanation: "입안의 세균이 상처에 닿으면 감염의 위험이 있습니다."
    },
    {
        question: "정수기에서 뜨거운 물을 받을 때 주의할 점은?",
        options: ["컵을 멀리 두기", "정수기 입구에 손을 대지 않기", "빨리 받으려고 흔들기", "눈을 감고 받기"],
        answerIndex: 1,
        explanation: "뜨거운 물은 튀거나 떨어질 때 큰 화상을 입힐 수 있으므로 주의해야 합니다."
    },
    {
        question: "요리할 때 냄비 손잡이의 올바른 위치는?",
        options: ["사람 쪽으로", "바깥쪽으로", "손에 치이지 않게 안쪽으로", "위쪽으로"],
        answerIndex: 2,
        explanation: "손잡이가 사람 쪽으로 있으면 지나가다 쳐서 쏟아질 위험이 있습니다."
    },
    {
        question: "깨끗한 거즈가 없을 때 임시로 쓸 수 있는 깨끗한 것은?",
        options: ["세탁된 깨끗한 손수건", "길에 떨어진 종이", "낙엽", "흙"],
        answerIndex: 0,
        explanation: "먼지가 없고 세탁된 수건이나 손수건으로 임시 보호를 할 수 있습니다."
    },
    {
        question: "화상 사고가 크게 났을 때 도움을 요청해야 하는 번호는?",
        options: ["080", "119", "112", "114"],
        answerIndex: 1,
        explanation: "위급한 화상 사고 시에는 즉시 119에 도움을 요청하여 응급 구호 조치를 받아야 합니다."
    }
];

export const MISSION_STEPS = {
    STEP_0_START: 0,        // 사고 발생
    STEP_1_COOLED: 1,       // 열기 식힘 완료 (물/세면대)
    STEP_2_PROTECTED: 2,    // 환부 보호 완료 (거즈)
    STEP_3_REPORTED: 3      // 신고/탈출 (퀴즈)
};
