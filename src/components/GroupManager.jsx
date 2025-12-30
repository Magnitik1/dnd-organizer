import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function GroupManager({ groups, setGroups }) {
  const [showGroups, setShowGroups] = useState(false);
  const [renameGroup, setRenameGroup] = useState(null);
  const [newName, setNewName] = useState('');

  const startRename = (g) => {
    setRenameGroup(g);
    setNewName(g);
  };

  const doRename = (oldName) => {
    if (!newName.trim() || newName === oldName) {
      setRenameGroup(null);
      return;
    }
    if (groups[newName]) {
      alert('Group name already exists');
      return;
    }
    const updated = { ...groups };
    updated[newName] = updated[oldName];
    delete updated[oldName];
    setGroups(updated);
    localStorage.setItem('npcGroups', JSON.stringify(updated));
    setRenameGroup(null);
  };

  const toggleHeroes = (g) => {
    const updated = { ...groups };
    updated[g].isHeroes = !updated[g].isHeroes;
    setGroups(updated);
    localStorage.setItem('npcGroups', JSON.stringify(updated));
  };

  const deleteMember = (g, index) => {
    const updated = { ...groups };
    updated[g].members.splice(index, 1);
    if (updated[g].members.length === 0) {
      delete updated[g];
    }
    setGroups(updated);
    localStorage.setItem('npcGroups', JSON.stringify(updated));
  };

  const deleteGroup = (g) => {
    const updated = { ...groups };
    delete updated[g];
    setGroups(updated);
    localStorage.setItem('npcGroups', JSON.stringify(updated));
  };

  const getBreakdown = (members) => {
    const countMap = {};
    members.forEach(m => {
      countMap[m] = (countMap[m] || 0) + 1;
    });
    return Object.entries(countMap).map(([n, c]) => `${n}(${c})`).join(', ');
  };

  return (
    <>
      <button onClick={() => setShowGroups(!showGroups)} className="manage-groups-btn">
        {showGroups ? 'Hide' : 'Manage'} Groups
      </button>

      {showGroups && (
        <div className="groups-management">
          <h3>Groups</h3>
          {Object.entries(groups).map(([g, data]) => {
            const total = data.members.length;
            const breakdown = getBreakdown(data.members);
            return (
              <div key={g} className="group-item">
                <div className="group-header">
                  {renameGroup === g ? (
                    <div>
                      <input
                        type="text"
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                      />
                      <button onClick={() => doRename(g)}>Save</button>
                      <button onClick={() => setRenameGroup(null)}>Cancel</button>
                    </div>
                  ) : (
                    <strong onClick={() => startRename(g)} style={{ cursor: 'pointer' }}>{g} (total {total})</strong>
                  )}
                  <span className="breakdown-tooltip" title={breakdown}> (Heroes: {data.isHeroes ? 'Yes' : 'No'})</span>
                  <button className="btn-action" onClick={() => toggleHeroes(g)}>Toggle Heroes</button>
                  <button className="btn-action" onClick={() => deleteGroup(g)}>Delete Group</button>
                </div>
                <ul>
                  {data.members.map((m, i) => (
                    <li key={i}>
                      <Link to={`/npc/${m}`} style={{color:"var(--text-contrast)"}}>{m}</Link>
                      <button className="btn-action" style={{background:"rgba(100, 1, 1, 1)"}} onClick={() => deleteMember(g, i)}>Delete</button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
          {Object.keys(groups).length === 0 && <p>No groups yet.</p>}
        </div>
      )}
    </>
  );
}