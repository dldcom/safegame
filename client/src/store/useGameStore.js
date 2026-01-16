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
    closeQuiz: () => set({
        quiz: { isOpen: false, data: null }
    }),
    openInventoryModal: (items, title = '아이템 선택', callbackEvent = null) => set({
        inventoryModal: { isOpen: true, items, title, callbackEvent }
    }),
    closeInventoryModal: () => set({
        inventoryModal: { isOpen: false, items: [], title: '', callbackEvent: null }
    }),
}));

// Helper to check if any UI is blocking the game
export const isUIOpen = (state) =>
    state.dialogue.isOpen ||
    state.quiz.isOpen ||
    state.inventoryModal.isOpen;

export default useGameStore;
