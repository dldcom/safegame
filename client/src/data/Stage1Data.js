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
        name: '세면대',
        type: 'cool',
        isValid: true,
        description: '흐르는 물로 화상 부위를 충분히 식혀야 해.'
    },

    // 2. 잘못된 처치 아이템 (함정)
    ice_pack: {
        id: 'ice_pack',
        name: '얼음팩',
        type: 'cool',
        isValid: false,
        penaltyMsg: '얼음을 직접대면 혈관이 수축해서 상처가 더 깊어질 수 있어! 흐르는 물이 좋아.'
    },
    toothpaste: {
        id: 'toothpaste',
        name: '치약',
        type: 'bad',
        isValid: false,
        penaltyMsg: '치약을 바르면 감염될 수 있고, 상처 상태를 확인하기 어려워져!'
    },
    doenjang: {
        id: 'doenjang',
        name: '된장',
        type: 'bad',
        isValid: false,
        penaltyMsg: '된장을 바르는 건 미신이야! 세균 감염 위험이 매우 커.'
    },
    needle: {
        id: 'needle',
        name: '바늘',
        type: 'bad',
        isValid: false,
        penaltyMsg: '물집을 터뜨리면 안 돼! 물집은 상처를 보호하는 보호막 역할을 해.'
    }
};

export const STAGE_1_QUIZ = [
    {
        question: "화상 부위를 식힐 때 가장 적절한 시간은?",
        options: ["1분 이내", "5분 정도", "15분 이상", "1시간 이상"],
        answerIndex: 2, // 15분 이상
        explanation: "화기는 피부 깊숙이 남아있을 수 있어. 15분 이상 충분히 흐르는 물에 식혀야 해."
    },
    {
        question: "화상 부위에 옷이 달라붙었을 때 올바른 행동은?",
        options: ["억지로 떼어낸다", "옷 위로 물을 뿌린다", "기름을 발라 떼낸다", "그대로 둔다"],
        answerIndex: 1, // 옷 위로 물을 뿌린다
        explanation: "억지로 옷을 벗기면 피부가 같이 벗겨질 수 있어. 옷 위로 찬물을 부어 식히고 병원으로 가야 해."
    },
    {
        question: "다음 중 화상 상처에 절대 하면 안 되는 행동은?",
        options: ["흐르는 물에 씻기", "깨끗한 천으로 감싸기", "된장 바르기", "장신구 제거하기"],
        answerIndex: 2, // 된장 바르기
        explanation: "치약, 된장, 소주 등 민간요법은 감염의 원인이 되니 절대 금물이야!"
    }
];

export const MISSION_STEPS = {
    STEP_0_START: 0,        // 사고 발생
    STEP_1_COOLED: 1,       // 열기 식힘 완료 (물/세면대)
    STEP_2_PROTECTED: 2,    // 환부 보호 완료 (거즈)
    STEP_3_REPORTED: 3      // 신고/탈출 (퀴즈)
};
