export const STAGE_2_ITEMS = {
    handkerchief: {
        id: 'handkerchief',
        name: '손수건',
        type: 'material',
        description: '평범한 손수건이야. 물에 적셔서 입과 코를 막으면 좋을 것 같아.'
    },
    water_bottle: {
        id: 'water_bottle',
        name: '생수병',
        type: 'material',
        description: '깨끗한 물이 들어있어.'
    },
    wet_handkerchief: {
        id: 'wet_handkerchief',
        name: '젖은 손수건',
        type: 'protect',
        description: '물에 적신 손수건이야! 이제 유독가스를 어느 정도 막을 수 있어.'
    },
    extinguisher: {
        id: 'extinguisher',
        name: '소화기',
        type: 'tool',
        description: '불을 끌 수 있는 소화기야. PASS 요령을 기억하자!'
    }
};

export const STAGE_2_QUIZ = [
    {
        question: "화재 발생 시 가장 먼저 해야 할 행동은?",
        options: ["불이야! 라고 외치며 주변에 알린다", "엘리베이터를 탄다", "귀중품을 챙긴다", "창문 밖으로 뛰어내린다"],
        answerIndex: 0,
        explanation: "화재를 발견하면 즉시 큰 소리로 주변에 알리고 대피를 시작해야 해."
    },
    {
        question: "연기가 자욱한 복도를 탈출할 때 올바른 자세는?",
        options: ["손으로 입을 막고 서서 달린다", "젖은 수건으로 입을 막고 낮은 자세로 이동한다", "숨을 참고 빠르게 걸어간다", "바닥에 엎드려서 기어간다"],
        answerIndex: 1,
        explanation: "연기는 위로 올라가므로 바닥 근처의 맑은 공기를 마시며 낮은 자세로 이동해야 해."
    },
    {
        question: "내 몸에 불이 붙었을 때 대처 방법은?",
        options: ["바람을 맞으며 달린다", "손으로 불을 끈다", "멈추고, 엎드리고, 구른다(Stop, Drop, Roll)", "물을 찾아 뛰어간다"],
        answerIndex: 2,
        explanation: "달리면 산소 공급이 많아져 불이 더 잘 붙어! 멈춰서 엎드린 뒤 데굴데굴 굴러야 해."
    }
];

export const STAGE_2_MISSION_STEPS = {
    STEP_0_START: 0,
    STEP_1_ITEMS_COLLECTED: 1, // 손수건, 물 획득
    STEP_2_CRAFTED: 2,         // 젖은 손수건 조합 완료
    STEP_3_EXTINGUISHED: 3,    // 불 진압 완료
    STEP_4_ESCAPED: 4          // 탈출 완료
};
