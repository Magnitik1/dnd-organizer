import { useState } from 'react';

const predefinedConditions = [
  'Blinded', 'Charmed', 'Deafened', 'Frightened', 'Grappled', 'Incapacitated', 
  'Invisible', 'Paralyzed', 'Petrified', 'Poisoned', 'Prone', 'Restrained', 
  'Stunned', 'Unconscious'
];

export default function FightParticipant({
  entity,
  onHpChange,
  onTempHp,
  onRemove,
  onDeathSuccess,
  onDeathFail,
  onCritSuccess,
  onCritFail,
  onUpdateInitiative,
  onRerollInitiative,
  onAddCondition,
  onRemoveCondition
}) {
  const [value, setValue] = useState(0);
  const [showInitOptions, setShowInitOptions] = useState(false);
  const [newInit, setNewInit] = useState(entity.initiative);
  const [newCondition, setNewCondition] = useState('');
  const [showConditionSelect, setShowConditionSelect] = useState(false);

  const addNewCondition = () => {
    setShowConditionSelect(!showConditionSelect)
    if (newCondition.trim()) {
      onAddCondition(entity.id, newCondition.trim());
      setNewCondition('');
    }
  };

  const naturalRoll = entity.initiative - entity.dexMod;
  const initDisplay = (naturalRoll === 1 || naturalRoll === 20)
    ? `(crit ${naturalRoll}) ${entity.initiative}`
    : entity.initiative;

  return (
    <div className="fight-participant">
      <div className="fp-header">
        <strong>{entity.name}</strong>
        <span onClick={() => setShowInitOptions(!showInitOptions)} style={{ cursor: 'pointer' }}>
          Init {initDisplay}
        </span>
      </div>

      {showInitOptions && (
        <div className="init-options">
          <input
            className='initiative-input'
            type="number"
            value={newInit}
            onChange={e => setNewInit(+e.target.value)}
            style={{ width: '4vw', height: '3vh', marginRight: '5px' }}
          />
          <button className='small-btn' onClick={() => { onUpdateInitiative(entity.id, newInit); setShowInitOptions(false); }}>Save</button>
          <button className='small-btn' onClick={() => {onRerollInitiative(entity.id, 'normal'); setShowInitOptions(false); }}>Reroll</button>
          <button className='small-btn' onClick={() => {onRerollInitiative(entity.id, 'advantage'); setShowInitOptions(false); }}>Adv</button>
          <button className='small-btn' onClick={() => {onRerollInitiative(entity.id, 'disadvantage'); setShowInitOptions(false); }}>Dis</button>
        </div>
      )}

      <div className="fp-hp">
        <span>
          HP: {entity.hp}/{entity.maxHp}
          {entity.tempHp > 0 && ` (+${entity.tempHp})`}
          {entity.downed && ` (Downed: Success ${entity.deathSuccess}/3, Fail ${entity.deathFail}/3)`}
        </span>

        <div className="hp-controls">
          <input
            type="number"
            value={value}
            onChange={e => setValue(+e.target.value)}
            min="0"
          />

          <button onClick={() => onHpChange(entity.id, -value)}>
            Damage
          </button>

          <button onClick={() => onHpChange(entity.id, value)}>
            Heal
          </button>

          <button onClick={() => onTempHp(entity.id, value)}>
            Temp HP
          </button>
        </div>

        {entity.downed && (
          <div className="death-saves">
            <button className="btn-action" onClick={onCritSuccess}>Crit Success (20)</button>
            <button className="btn-action" onClick={onDeathSuccess}>Success (10-19)</button>
            <button className="btn-action" onClick={onDeathFail}>Fail (2-9)</button>
            <button className="btn-action" onClick={onCritFail}>Crit Fail (1)</button>
          </div>
        )}

        <div className="conditions">
          Conditions: {entity.conditions.join(', ')+" " || ' '}
          <button className="btn-action" style={{borderRadius:"100px", padding:"5px 10px"}} onClick={() => setShowConditionSelect(!showConditionSelect)}>{showConditionSelect ? "Cancel" : "+"}</button>
        </div>

        {showConditionSelect && (
          <div className="condition-select">
            <select
              value={newCondition}
              onChange={e => setNewCondition(e.target.value)}
            >
              <option value="">Select Predefined</option>
              {predefinedConditions.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Custom Condition"
              value={newCondition}
              onChange={e => setNewCondition(e.target.value)}
            />
            <button onClick={addNewCondition}>Add</button>
          </div>
        )}

        {entity.conditions.map(c => (
          <div key={c} className="condition-item">
            {c}
            <button className='small-btn' style={{background:"rgba(94, 0, 0, 1)"}} onClick={() => onRemoveCondition(entity.id, c)}>Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
}