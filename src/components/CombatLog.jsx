import { useRef, useEffect } from 'react';

export default function CombatLog({ log }) {
  const logRef = useRef(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [log]); // Срабатывает при изменении log

  return (
    <div className="combat-log">
      <h2>Combat Log</h2>

      <div className="log-entries" ref={logRef}>
        {log.map((entry, i) => (
          <div key={i} className="log-entry">
            {entry}
          </div>
        ))}
      </div>
    </div>
  );
}