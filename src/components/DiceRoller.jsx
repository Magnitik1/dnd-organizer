import { useState } from 'react';

const rollDie = (sides) => Math.floor(Math.random() * sides) + 1;

export default function DiceRoller({ addLog }) {
  const [expression, setExpression] = useState(''); // Ввод, типа "3d4 + 2d6 + 3"
  const [results, setResults] = useState(null); // { individual: [[3,5,2], [4,6]], constants: [3], sum: 23 }
  const [rolling, setRolling] = useState(false);

  const parseAndRoll = () => {
    if (rolling || !expression.trim()) return;

    setRolling(true);
    setResults(null);

    // Парсим выражение: разбиваем по + и trim
    const parts = expression.split('+').map(p => p.trim());

    let individual = []; // Массивы роллов для каждого дайса (NdS -> N роллов)
    let constants = []; // Константы (числа без d)
    let sum = 0;

    parts.forEach(part => {
      if (part.includes('d')) {
        // Daiс: NdS, дефолт N=1
        const [nStr, sidesStr] = part.split('d');
        const n = parseInt(nStr || '1', 10);
        const sides = parseInt(sidesStr, 10);
        if (isNaN(n) || isNaN(sides) || n < 1 || sides < 2) return; // Invalid

        const rolls = Array.from({ length: n }, () => rollDie(sides));
        individual.push(rolls);
        sum += rolls.reduce((a, b) => a + b, 0);
      } else {
        // Константа
        const constVal = parseInt(part, 10);
        if (!isNaN(constVal)) {
          constants.push(constVal);
          sum += constVal;
        }
      }
    });

    // Анимация: симулируем несколько тиков
    let ticks = 4;
    const interval = setInterval(() => {
      // В тиках роллим заново для анимации (только визуально)
      let animSum = 0;
      const animIndividual = parts.map(part => {
        if (part.includes('d')) {
          const [nStr, sidesStr] = part.split('d');
          const n = parseInt(nStr || '1', 10);
          const sides = parseInt(sidesStr, 10);
          const rolls = Array.from({ length: n }, () => rollDie(sides));
          animSum += rolls.reduce((a, b) => a + b, 0);
          return rolls;
        } else {
          const val = parseInt(part, 10);
          if (!isNaN(val)) animSum += val;
          return null;
        }
      }).filter(Boolean);

      setResults({ individual: animIndividual, constants, sum: animSum });

      ticks--;
      if (ticks <= 0) {
        clearInterval(interval);
        setResults({ individual, constants, sum });
        setRolling(false);

        // Лог: "Rolled 3d4 + 2d6 + 3: [3,5,2] + [4,6] + 3 = 23"
        const logParts = individual.map(rolls => `[${rolls.join(', ')}]`).join(' + ');
        const logConstants = constants.length ? ` + ${constants.join(' + ')}` : '';
        addLog(`Rolled ${expression}: ${logParts}${logConstants} = ${sum}`);
      }
    }, 60);
  };

  const addDiceToExpression = (sides) => {
    if (rolling) return;

    // Парсим текущее expression
    const parts = expression.split('+').map(p => p.trim()).filter(Boolean);

    const diceMap = {}; // { sides: count }
    const constants = [];

    parts.forEach(part => {
      if (part.includes('d')) {
        const [nStr, sidesStr] = part.split('d');
        const n = parseInt(nStr || '1', 10);
        const s = parseInt(sidesStr, 10);
        if (!isNaN(n) && !isNaN(s)) {
          diceMap[s] = (diceMap[s] || 0) + n;
        }
      } else {
        const val = parseInt(part, 10);
        if (!isNaN(val)) constants.push(val);
      }
    });

    // Добавляем новый 1d{sides}
    diceMap[sides] = (diceMap[sides] || 0) + 1;

    // Перестраиваем expression: сортируем дайсы по sides (от малого к большому)
    const sortedDice = Object.entries(diceMap)
      .sort(([a], [b]) => a - b)
      .map(([s, n]) => (n === 1 ? `1d${s}` : `${n}d${s}`));

    const newExpression = [...sortedDice, ...constants.map(String)].join(' + ');

    setExpression(newExpression);
  };

  return (
    <div className="dice-roller">
      <input
        className='dices-input'
        type="text"
        value={expression}
        onChange={e => setExpression(e.target.value)}
        placeholder="e.g. 2d6 + 1d8 + 3"
        disabled={rolling}
      />
      <button className="btn-action" style={{marginLeft:"3px", height:""}} onClick={parseAndRoll} disabled={rolling}>Roll</button>
      <button className="btn-action" style={{marginLeft:"3px"}} onClick={() => setExpression('')} disabled={rolling}>Clear</button>

      <div className={`dice-result ${rolling ? 'rolling' : ''}`}>
        {results ? (
          <>
            {results.individual.map((rolls, i) => (
              <span key={i}>[{rolls.join(', ')}]{i < results.individual.length - 1 ? ' + ' : ''}</span>
            ))}
            {results.constants.length ? ` + ${results.constants.join(' + ')}` : ''}
            <br />
            Sum: {results.sum}
          </>
        ) : '—'}
      </div>

      <div className="dice-buttons">
        {[4,6,8,10,12,20].map(d =>
          <button key={d} onClick={() => addDiceToExpression(d)} disabled={rolling}>d{d}</button>
        )}
      </div>
    </div>
  );
}