export default function InitiativeTracker({
  participants,
  activeIndex,
  round,
  turn,
  nextTurn
}) {
  return (
    <div className="initiative-tracker">
      <h2>Initiative</h2>

      <div className="turn-info">
        Round {round} · Turn {turn}
      </div>

      {participants.map((p, i) => (
        <div
          key={p.id}
          className={`initiative-row ${i === activeIndex ? 'active' : ''}`}
        >
          <span>{p.name}</span>
          <span>{p.initiative}</span>
        </div>
      ))}

      <button onClick={nextTurn} className="next-turn" style={{marginTop:"5px"}}>
        ▶ Next Turn
      </button>
    </div>
  );
}
