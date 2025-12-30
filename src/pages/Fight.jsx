import { useReducer, useEffect, useState } from 'react';
import Select from 'react-select';
import DiceRoller from '../components/DiceRoller';
import FightParticipant from '../components/FightParticipant';
import InitiativeTracker from '../components/InitiativeTracker';
import CombatLog from '../components/CombatLog';
import GroupManager from '../components/GroupManager';
import npcs from '../data/npcs.json';
import './Fight.css';
import { fightReducer, initialFightState } from './fightReducer';
import { loadFightState, useFightStorage } from './useFightStorage';

export default function Fight() {
  const [state, dispatch] = useReducer(
    fightReducer,
    initialFightState,
    loadFightState
  );
  useFightStorage(state);

  const {
    participants,
    defeated,
    activeIndex,
    round,
    log,
    history
  } = state;

  const [allNPCs, setAllNPCs] = useState(npcs);
  const [groups, setGroups] = useState({});
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedNPC, setSelectedNPC] = useState('');
  const [npcCount, setNpcCount] = useState(1);

  useEffect(() => {
    const storedCustom = JSON.parse(localStorage.getItem('customNPCs') || '{}');
    setAllNPCs({ ...npcs, ...storedCustom });
  }, []);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('npcGroups') || '{}');
    Object.entries(stored).forEach(([k, v]) => {
      if (Array.isArray(v)) {
        stored[k] = { members: v, isHeroes: false };
      }
    });
    setGroups(stored);
    localStorage.setItem('npcGroups', JSON.stringify(stored));
  }, []);

  const pushHistory = () => dispatch({ type: 'PUSH_HISTORY' });
  const addLog = (text) => dispatch({ type: 'ADD_LOG', payload: text });

  const rollInitiative = (dexMod, advantage = 'normal') => {
    const roll1 = Math.floor(Math.random() * 20) + 1;
    const roll2 = Math.floor(Math.random() * 20) + 1;
    let roll;
    if (advantage === 'advantage') roll = Math.max(roll1, roll2);
    else if (advantage === 'disadvantage') roll = Math.min(roll1, roll2);
    else roll = roll1;
    return roll + dexMod;
  };

  const parseDexMod = (content) => {
    for (const item of content) {
      if (item.table?.DEX) {
        const dexStr = item.table.DEX[0];
        const dex = parseInt(dexStr.split(' ')[0], 10);
        return Math.floor((dex - 10) / 2);
      }
    }
    return 0;
  };

  const parseHp = (content) => {
    for (const item of content) {
      if (typeof item === 'string' && item.includes('Hit Points')) {
        const m = item.match(/\*\*Hit Points\*\*\s*(\d+)/i);
        if (m) return +m[1];
      }
    }
    return 10;
  };

  /* ===================== ACTIONS ===================== */
  const nextTurn = () => {
    if (!participants.length) return;
    pushHistory();

    const next = (activeIndex + 1) % participants.length;
    const newRound = next === 0 ? round + 1 : round;

    dispatch({
      type: 'SET_STATE',
      payload: { activeIndex: next, round: newRound }
    });

    addLog(`${participants[next].name}'s turn`);
    if (next === 0) addLog(`=== New Round: ${newRound} ===`);
  };

  const changeHp = (id, amount) => {
    if (!amount) return;
    pushHistory();

    let newlyDefeated = [];

    const updated = participants.map(p => {
      if (p.id !== id) return p;

      let { hp, tempHp } = p;
      if (amount < 0 && tempHp > 0) {
        const absorbed = Math.min(tempHp, -amount);
        tempHp -= absorbed;
        amount += absorbed;
      }

      hp = Math.max(0, Math.min(p.maxHp, hp + amount));

      const logText = amount > 0
        ? `${p.name} heals ${amount} HP`
        : `${p.name} takes ${-amount} damage`;
      addLog(logText);

      if (hp === 0) {
        if (p.isHero) addLog(`${p.name} is downed!`);
        else {
          addLog(`${p.name} is defeated!`);
          newlyDefeated.push({ ...p, hp: 0 });
        }
      }

      return { ...p, hp, tempHp, downed: hp === 0 && p.isHero };
    });

    const alive = updated.filter(p => p.hp > 0 || p.isHero);

    let newActive = activeIndex;
    if (newActive >= alive.length) newActive = 0;

    dispatch({
      type: 'SET_STATE',
      payload: {
        participants: alive,
        defeated: [...defeated, ...newlyDefeated],
        activeIndex: newActive
      }
    });
  };

  const addTempHp = (id, amount) => {
    if (amount <= 0) return;
    pushHistory();
    dispatch({
      type: 'UPDATE_PARTICIPANT',
      payload: { id, updates: { tempHp: amount } } // temp HP берёт максимум от текущего
    });
    const name = participants.find(p => p.id === id)?.name;
    addLog(`${name} gains ${amount} temporary HP`);
  };

  const removeParticipant = (id) => {
    pushHistory();
    const removed = participants.find(p => p.id === id);
    if (removed) {
      addLog(`${removed.name} removed from initiative`);
      dispatch({
        type: 'SET_STATE',
        payload: {
          participants: participants.filter(p => p.id !== id),
          activeIndex: activeIndex >= participants.filter(p => p.id !== id).length ? 0 : activeIndex
        }
      });
    }
  };

  const onDeathSuccess = (id) => {
    pushHistory();
    dispatch({
      type: 'DEATH_SAVE',
      payload: { id, type: 'success' }
    });
  };

  const onDeathFail = (id) => {
    pushHistory();
    dispatch({
      type: 'DEATH_SAVE',
      payload: { id, type: 'fail' }
    });
  };

  const onCritSuccess = (id) => {
    pushHistory();
    dispatch({
      type: 'DEATH_SAVE',
      payload: { id, type: 'crit_success' }
    });
  };

  const onCritFail = (id) => {
    pushHistory();
    dispatch({
      type: 'DEATH_SAVE',
      payload: { id, type: 'crit_fail' }
    });
  };

  const addCondition = (id, condition) => {
    pushHistory();
    dispatch({
      type: 'ADD_CONDITION',
      payload: { id, condition }
    });
  };

  const removeCondition = (id, condition) => {
    pushHistory();
    dispatch({
      type: 'REMOVE_CONDITION',
      payload: { id, condition }
    });
  };

  const updateInitiative = (id, newInit) => {
    pushHistory();
    dispatch({
      type: 'UPDATE_INITIATIVE',
      payload: { id, initiative: newInit }
    });
  };

  const rerollInitiative = (id, advantage = 'normal') => {
    const p = participants.find(p => p.id === id);
    if (!p) return;
    pushHistory();
    const newInit = rollInitiative(p.dexMod, advantage);
    updateInitiative(id, newInit);
  };

  const undo = () => {
    if (!history.length) return;
    dispatch({ type: 'UNDO' });
    addLog('Undo last action');
  };

  const resetFight = () => {
    if (window.confirm('Are you sure you want to reset the fight? This will clear all participants, defeated, logs, and history.')) {
      dispatch({ type: 'RESET' });
    }
  };

  const addGroupToFight = () => {
    if (!selectedGroup || !groups[selectedGroup]) return;
    pushHistory();

    const group = groups[selectedGroup];
    const newParts = group.members.map(name => {
      const npc = allNPCs[name];
      if (!npc) return null;
      const dexMod = parseDexMod(npc.content);
      const hp = parseHp(npc.content);
      const tempinitiative = rollInitiative(dexMod);
      return {
        id: Date.now() + Math.random(),
        name,
        hp, maxHp: hp, tempHp: 0,
        initiative: tempinitiative-dexMod==(1||20)?`(crit ${tempinitiative-dexMod}) `+tempinitiative:tempinitiative,
        isHero: group.isHeroes,
        downed: false,
        deathSuccess: 0, deathFail: 0,
        dexMod,
        conditions: []
      };
    }).filter(Boolean);

    const combined = [...participants, ...newParts].sort((a, b) => b.initiative - a.initiative);

    dispatch({
      type: 'SET_STATE',
      payload: { participants: combined, activeIndex: 0 }
    });
    addLog(`Added group: ${selectedGroup}`);
  };

  const addNPCToFight = () => {
    if (!selectedNPC || npcCount < 1) return;
    pushHistory();

    const npc = allNPCs[selectedNPC];
    if (!npc) return;

    const dexMod = parseDexMod(npc.content);
    const hp = parseHp(npc.content);

    const newParts = Array.from({ length: npcCount }, (_, i) => ({
      id: Date.now() + Math.random(),
      name: npcCount > 1 ? `${selectedNPC} #${i + 1}` : selectedNPC,
      hp, maxHp: hp, tempHp: 0,
      initiative: rollInitiative(dexMod),
      isHero: false,
      downed: false,
      deathSuccess: 0, deathFail: 0,
      dexMod,
      conditions: []
    }));

    const combined = [...participants, ...newParts].sort((a, b) => b.initiative - a.initiative);

    dispatch({
      type: 'SET_STATE',
      payload: { participants: combined, activeIndex: 0 }
    });
    addLog(`Added ${npcCount} × ${selectedNPC}`);
    setNpcCount(1);
    setSelectedNPC('');
  };

  return (
    <div className="fight-page">
      <h1>Combat</h1>
      <div className="fight-layout">
        <div className="initiative-column">
          <InitiativeTracker
            participants={participants}
            activeIndex={activeIndex}
            round={round}
            turn={activeIndex + 1}
            nextTurn={nextTurn}
          />

          {participants.map(p => (
            <div key={p.id} className="participant-wrapper">
              <FightParticipant
                entity={p}
                onHpChange={changeHp}
                onTempHp={addTempHp}
                onRemove={() => removeParticipant(p.id)}
                onDeathSuccess={() => onDeathSuccess(p.id)}
                onDeathFail={() => onDeathFail(p.id)}
                onCritSuccess={() => onCritSuccess(p.id)}
                onCritFail={() => onCritFail(p.id)}
                onUpdateInitiative={updateInitiative}
                onRerollInitiative={rerollInitiative}
                onAddCondition={addCondition}
                onRemoveCondition={removeCondition}
              />
              <button
                className="delete-participant-btn"
                onClick={() => removeParticipant(p.id)}
                title="Remove Participant"
              >
                ×
              </button>
            </div>
          ))}

          <div className="add-group">
            <Select
              options={Object.keys(groups).map(g => ({ value: g, label: g }))}
              onChange={v => setSelectedGroup(v?.value || '')}
              value={selectedGroup ? { value: selectedGroup, label: selectedGroup } : null}
              placeholder="Select Group"
              classNamePrefix="custom-react-select"
            />
            <button onClick={addGroupToFight}>Add Group</button>
          </div>

          <div className="add-npc">
            <Select
              options={Object.keys(allNPCs).map(n => ({ value: n, label: n }))}
              onChange={v => setSelectedNPC(v?.value || '')}
              value={selectedNPC ? { value: selectedNPC, label: selectedNPC } : null}
              placeholder="Select NPC"
              classNamePrefix="custom-react-select"
            />
            <input
              className='initiative-input'
              type="number"
              min="1"
              value={npcCount}
              onChange={e => setNpcCount(Math.max(1, +e.target.value || 1))}
            />
            <button onClick={addNPCToFight}>Add NPC</button>
          </div>

          <GroupManager groups={groups} setGroups={setGroups} />

          <div className="defeated-section">
            <h3 style={{color: "rgba(100, 1, 1, 1)"}}>Defeated</h3>
            {defeated.map(d => (
              <div key={d.id} className="defeated-participant">
                {d.name} (HP: 0)
                <button className="btn-action" style={{background: "rgba(100, 1, 1, 1)", color: "rgba(255, 255, 255, 1)"}} onClick={() => dispatch({ type: 'REMOVE_DEFEATED', payload: d.id })}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="tools-column">
          <DiceRoller addLog={addLog} />
          <button className="btn-action" onClick={undo} disabled={!history.length}>Undo</button>
          <button className="btn-action" onClick={resetFight}>Reset Fight</button>
          <CombatLog log={log} />
        </div>
      </div>
    </div>
  );
}