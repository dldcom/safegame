import { create } from 'zustand';

const useGameStore = create((set) => ({
    hearts: 3,
    inventory: [],
    dialogue: {
        isOpen: false,
        text: '',
        name: ''
    },
    quiz: {
        isOpen: false,
        data: null
    },
    inventoryModal: {
        isOpen: false,
        items: [],
        title: '',
        callbackEvent: null
    },
    lobby: {
        isOpen: false, // Don't show until LobbyScene tells us to
        players: []
    },
    gameStarted: false,
    stage: 1,
    oxygen: 100,
    userStats: {
        id: '',
        username: '',
        points: 0,
        exp: 0,
        level: 1,
        totalExp: 0,
        collection: [],
        clearedStages: [],
        quizProgress: 0,
        equippedSkin: 'skin_default',
        equippedTitle: '초보 구조대',
        customCharacter: null // 커스텀 캐릭터 정보 저장용
    },
    customMaps: {},
    gameResult: {
        isOpen: false,
        startTime: 0,
        endTime: 0,
        score: 0,
        rankings: [] // [{ username, score, time }]
    },

    setGameResult: (result) => set((state) => ({
        gameResult: { ...state.gameResult, ...result }
    })),

    setUserStats: (stats) => set((state) => ({
        userStats: { ...state.userStats, ...stats }
    })),
    setCustomMap: (stageId, data) => set((state) => ({
        customMaps: { ...state.customMaps, [stageId]: data }
    })),

    setStage: (stage) => set({ stage }),
    setOxygen: (val) => set({ oxygen: val }),
    setHearts: (count) => set({ hearts: count }),
    setInventory: (items) => set({ inventory: [...items] }),
    showDialogue: (text, name = '') => set({
        dialogue: { isOpen: true, text, name }
    }),
    hideDialogue: () => set((state) => ({
        dialogue: { ...state.dialogue, isOpen: false }
    })),
    openQuiz: (quizData) => set({
        quiz: { isOpen: true, data: quizData }
    }),
    closeQuiz: () => set((state) => ({
        quiz: { ...state.quiz, isOpen: false }
    })),
    openInventoryModal: (items, title = '아이템 선택', callbackEvent = null) => set({
        inventoryModal: { isOpen: true, items, title, callbackEvent }
    }),
    closeInventoryModal: () => set((state) => ({
        inventoryModal: { ...state.inventoryModal, isOpen: false }
    })),
    setLobbyPlayers: (players) => set((state) => ({
        lobby: { ...state.lobby, players }
    })),
    setLobbyOpen: (isOpen) => set((state) => ({
        lobby: { ...state.lobby, isOpen }
    })),
    setGameStarted: (started) => set({ gameStarted: started })
}));

// Helper to check if any UI is blocking the game
export const isUIOpen = (state) =>
    state.dialogue.isOpen ||
    state.quiz.isOpen ||
    state.inventoryModal.isOpen;

export default useGameStore;
