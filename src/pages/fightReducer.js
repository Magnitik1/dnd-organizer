// fightReducer.js

export const initialFightState = {
  participants: [],
  defeated: [],
  activeIndex: 0,
  round: 1,
  log: [],
  history: [] // хранит предыдущие состояния (participants, defeated, activeIndex, round)
};

export function fightReducer(state, action) {
  switch (action.type) {
    case 'LOAD_STATE':
      return action.payload;

    case 'PUSH_HISTORY': {
      return {
        ...state,
        history: [
          ...state.history,
          {
            participants: JSON.parse(JSON.stringify(state.participants)), // deep copy
            defeated: [...state.defeated],
            activeIndex: state.activeIndex,
            round: state.round
          }
        ]
      };
    }

    case 'UNDO': {
      if (state.history.length === 0) return state;

      const prev = state.history[state.history.length - 1];

      return {
        ...state,
        participants: prev.participants,
        defeated: prev.defeated,
        activeIndex: prev.activeIndex,
        round: prev.round,
        history: state.history.slice(0, -1),
        log: [`${new Date().toLocaleTimeString()} — Undo last action`, ...state.log]
      };
    }

    case 'SET_STATE':
      return {
        ...state,
        ...action.payload
      };

    case 'ADD_LOG':
      return {
        ...state,
        log: [
          `${new Date().toLocaleTimeString()} — ${action.payload}`,
          ...state.log
        ]
      };

    case 'UPDATE_PARTICIPANT': {
      // Используется для temp HP и других точечных обновлений
      const { id, updates } = action.payload;
      const updatedParticipants = state.participants.map(p =>
        p.id === id ? { ...p, ...updates } : p
      );

      return {
        ...state,
        participants: updatedParticipants
      };
    }

    case 'DEATH_SAVE': {
      const { id, type } = action.payload; // type: 'success' | 'fail' | 'crit_success' | 'crit_fail'

      let newlyDefeated = [];
      const updatedParticipants = state.participants.map(p => {
        if (p.id !== id || !p.downed) return p;

        let { deathSuccess, deathFail } = p;
        let logMsg = '';

        if (type === 'success') {
          deathSuccess += 1;
          logMsg = `${p.name} death save success (${deathSuccess}/3)`;
        } else if (type === 'fail') {
          deathFail += 1;
          logMsg = `${p.name} death save fail (${deathFail}/3)`;
        } else if (type === 'crit_success') {
          logMsg = `${p.name} critical death save success! Regains 1 HP.`;
          return {
            ...p,
            hp: 1,
            downed: false,
            deathSuccess: 0,
            deathFail: 0
          };
        } else if (type === 'crit_fail') {
          deathFail += 2;
          logMsg = `${p.name} critical death save fail (${deathFail}/3)`;
        }

        // Проверка на смерть
        if (deathFail >= 3) {
          logMsg = `${p.name} dies!`;
          newlyDefeated.push({ ...p, hp: 0 });
          return null; // будет отфильтрован
        }

        // Проверка на стабилизацию
        if (deathSuccess >= 3) {
          logMsg = `${p.name} stabilizes!`;
          return {
            ...p,
            hp: 1,
            downed: false,
            deathSuccess: 0,
            deathFail: 0
          };
        }

        // Добавляем лог перед возвратом
        if (logMsg) {
          // лог добавляется в компоненте, но можно и здесь
        }

        return { ...p, deathSuccess, deathFail };
      }).filter(Boolean);

      const alive = updatedParticipants.filter(p => p.hp > 0 || p.isHero);

      return {
        ...state,
        participants: alive,
        defeated: [...state.defeated, ...newlyDefeated]
      };
    }

    case 'ADD_CONDITION': {
      const { id, condition } = action.payload;
      const updated = state.participants.map(p =>
        p.id === id && !p.conditions.includes(condition)
          ? { ...p, conditions: [...p.conditions, condition] }
          : p
      );

      return { ...state, participants: updated };
    }

    case 'REMOVE_CONDITION': {
      const { id, condition } = action.payload;
      const updated = state.participants.map(p =>
        p.id === id
          ? { ...p, conditions: p.conditions.filter(c => c !== condition) }
          : p
      );

      return { ...state, participants: updated };
    }

    case 'UPDATE_INITIATIVE': {
      const { id, initiative } = action.payload;

      const updated = state.participants.map(p =>
        p.id === id ? { ...p, initiative } : p
      );

      // Пересортировка по инициативе
      const sorted = [...updated].sort((a, b) => b.initiative - a.initiative);

      // Определяем новый activeIndex (если порядок изменился)
      const newActiveIndex = sorted.findIndex(p => p.id === state.participants[state.activeIndex]?.id);
      const safeActiveIndex = newActiveIndex === -1 ? 0 : newActiveIndex;

      return {
        ...state,
        participants: sorted,
        activeIndex: safeActiveIndex
      };
    }

    case 'REMOVE_DEFEATED': {
      const id = action.payload;
      return {
        ...state,
        defeated: state.defeated.filter(d => d.id !== id)
      };
    }
    
    case 'RESET':
      return initialFightState;

    default:
      return state;
  }
}