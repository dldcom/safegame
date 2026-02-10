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
        question: "화상 부위에 생기는 물집에 대한 올바른 대처법은?",
        options: ["바늘로 터뜨린다", "손대지 않고 그대로 둔다", "눌러서 짠다", "손톱으로 긁는다"],
        answerIndex: 1,
        explanation: "물집을 터뜨리면 세균에 감염될 위험이 높으므로 절대 건드리지 말아야 합니다."
    },
    {
        question: "옷 위로 뜨거운 물을 엎질렀을 때 어떻게 해야 할까요?",
        options: ["옷을 가위로 조심스럽게 자른다", "억지로 옷을 벗겨낸다", "그냥 놔둔다", "옷 위에 찬물을 뿌린 후 천천히 벗는다"],
        answerIndex: 3,
        explanation: "피부가 옷에 달라붙었을 수 있으므로 찬물로 식힌 후 조심스럽게 벗거나 잘라내야 합니다."
    },
    {
        question: "열기를 충분히 식힌 후 화상 부위에 무엇을 발라야 할까요?",
        options: ["된장", "치약", "감자 간 것", "화상 연고(또는 깨끗한 거즈)"],
        answerIndex: 3,
        explanation: "된장이나 치약 같은 민간요법은 상처를 오염시켜 흉터를 더 크게 만들 수 있습니다."
    },
    {
        question: "화상을 입었을 때 얼음을 직접 피부에 대면 왜 안 될까요?",
        options: ["너무 시원해서", "상처가 잘 안 보여서", "동상을 입어 상처가 깊어질 수 있어서", "얼음이 녹기 때문에"],
        answerIndex: 2,
        explanation: "너무 차가운 얼음은 혈관을 수축시켜 오히려 피부 재생을 방해하고 동상을 일으킬 수 있습니다."
    },
    {
        question: "화상 부위에 반지를 끼고 있다면 어떻게 해야 할까요?",
        options: ["나중에 뺀다", "부어오르기 전에 즉시 뺀다", "절대 빼지 않는다", "다른 손가락으로 옮긴다"],
        answerIndex: 1,
        explanation: "부어오르면 액세서리를 빼기 힘들어져 혈액 순환을 방해할 수 있으므로 빨리 빼야 합니다."
    },
    {
        question: "햇볕에 오랫동안 놀아 피부가 빨개지고 아플 때(일광화상) 대처법은?",
        options: ["오이팩을 하거나 수분을 공급한다", "계속 햇볕 아래 있는다", "비누로 세게 문지른다", "때밀이 타월로 민다"],
        answerIndex: 0,
        explanation: "피부를 식히고 알로에나 오이팩으로 진정시켜주는 것이 좋습니다."
    },
    {
        question: "화상을 입었을 때 가장 무서운 '2차 피해'는 무엇일까요?",
        options: ["세균 감염", "배고픔", "감기", "졸음"],
        answerIndex: 0,
        explanation: "상처 사이로 세균이 침투하는 감염을 막는 것이 치료의 핵심입니다."
    },
    {
        question: "뜨거운 국을 먹으려다 혀를 데었을 때는 어떻게 하나요?",
        options: ["매운 음식을 먹는다", "찬물을 머금어 온도를 낮춘다", "뜨거운 차를 마신다", "껌을 씹는다"],
        answerIndex: 1,
        explanation: "입안 화상도 찬 물이나 우유로 온도를 낮추는 것이 최선입니다."
    },
    {
        question: "전기 콘센트에 젓가락을 넣어 화상을 입었다면(전기화상)?",
        options: ["물건을 먼저 치운다", "즉시 병원에 가야 한다", "반창고만 붙인다", "그냥 기다린다"],
        answerIndex: 1,
        explanation: "전기 화상은 겉보다 속이 더 심하게 다칠 수 있어 반드시 의사의 진료가 필요합니다."
    },
    {
        question: "정수기의 빨간색 버튼을 눌렀을 때 나오는 물은 어떤 위험이 있나요?",
        options: ["매우 전기가 강함", "매우 뜨거워 화상 위험", "얼음처럼 차가움", "매우 달콤함"],
        answerIndex: 1,
        explanation: "정수기 온수는 아이들에게 가장 흔한 화상 원인 중 하나이므로 주의해야 합니다."
    },
    {
        question: "화상을 입은 뒤 나타나는 증상 중 '병원에 꼭 가야 하는' 상황은?",
        options: ["피부가 살짝 붉어짐", "물집이 크게 생김", "상처 부위가 간지러움", "배가 아픔"],
        answerIndex: 1,
        explanation: "물집이 생겼다면 2도 화상 이상이므로 전문가의 치료를 받는 것이 안전합니다."
    },
    {
        question: "컵라면 물을 붓다가 손에 쏟았다면 가장 먼저 뺴야 하는 것은?",
        options: ["양말", "시계나 팔찌", "안경", "모자"],
        answerIndex: 1,
        explanation: "금속 소재의 시계나 팔찌는 열을 오래 머금고 있어 화상을 심하게 만듭니다."
    },
    {
        question: "화상 상처를 식힐 때 수압(물세기)은 어느 정도가 좋을까요?",
        options: ["가장 강하게", "졸졸졸 약하게", "폭포처럼", "전혀 안 나오게"],
        answerIndex: 1,
        explanation: "수압이 너무 강하면 화상 입은 피부가 벗겨질 수 있으므로 약하게 흘려보내야 합니다."
    },
    {
        question: "겨울철 전기장판이나 핫팩 때문에 발생하는 '저온화상'의 특징은?",
        options: ["즉시 매우 뜨거움", "낮은 온도에 오래 노출되어 서서히 다침", "겨울엔 안 생김", "한 번에 나음"],
        answerIndex: 1,
        explanation: "뜨겁지 않다고 느껴도 긴 시간 닿아 있으면 피부 깊숙이 화상을 입을 수 있습니다."
    },
    {
        question: "화상 부위를 붕대로 감을 때 주의할 점은?",
        options: ["피가 안 통하게 아주 세게 감는다", "바람이 통하게 느슨하게 감는다", "종이테이프를 다 붙인다", "풀로 고정한다"],
        answerIndex: 1,
        explanation: "너무 세게 감으면 통증이 심해지고 혈액 순환이 안 되므로 청결한 거즈로 가볍게 보호합니다."
    },
    {
        question: "화상 연고는 언제 바르는 것이 가장 효과적인가요?",
        options: ["화상 직후 뜨거울 때", "열기를 충분히 식힌 후", "병원 다녀온 지 일주일 뒤", "안 발라도 됨"],
        answerIndex: 1,
        explanation: "뜨거운 상태에서 연고를 바르면 열기가 빠져나가지 못하므로 식힌 뒤 발라야 합니다."
    },
    {
        question: "화재 현장에서 탈출할 때 불이 몸에 붙었다면?",
        options: ["계속 뛴다", "멈추고, 엎드리고, 굴러라(Stop-Drop-Roll)", "소리를 지른다", "손으로 불을 끈다"],
        answerIndex: 1,
        explanation: "뛰면 불이 더 잘 붙으므로 바닥에 굴러서 불을 꺼야 합니다."
    },
    {
        question: "화상 상처가 다 나은 뒤에 '햇빛'을 조심해야 하는 이유는?",
        options: ["피부가 더 예뻐지려고", "색소 침착(흉터 착색)을 막기 위해", "다시 화상을 입으려고", "눈이 부셔서"],
        answerIndex: 1,
        explanation: "새살이 돋은 자리는 약해서 햇빛에 금방 검게 변할 수 있어 자외선 차단이 중요합니다."
    }
];

export const MISSION_STEPS = {
    STEP_0_START: 0,        // 사고 발생
    STEP_1_COOLED: 1,       // 열기 식힘 완료 (물/세면대)
    STEP_2_PROTECTED: 2,    // 환부 보호 완료 (거즈)
    STEP_3_REPORTED: 3      // 신고/탈출 (퀴즈)
};
