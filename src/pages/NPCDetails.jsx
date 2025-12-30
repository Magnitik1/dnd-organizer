import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import npcs from '../data/npcs.json'; // Import full NPC data
import GroupManager from '../components/GroupManager'; // Assuming new component path
import CustomNPCCreator from '../components/CustomNPCCreator';
import Select from 'react-select';

export default function NPCDetail() {
  const { name } = useParams();
  const navigate = useNavigate();
  const [allNPCs, setAllNPCs] = useState(npcs);
  const [customNPCs, setCustomNPCs] = useState({});
  const [isCustom, setIsCustom] = useState(false);
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('customNPCs') || '{}');
    setCustomNPCs(stored);
    setAllNPCs({ ...npcs, ...stored });
  }, []);

  useEffect(() => {
    if (allNPCs[name]) {
      setIsCustom(!!customNPCs[name]);
    }
  }, [allNPCs, name, customNPCs]);

  const npc = allNPCs[name];

  const [groupName, setGroupName] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [count, setCount] = useState(1);
  const [groups, setGroups] = useState({});

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('npcGroups') || '{}');
    // Adjust if old format
    Object.entries(stored).forEach(([key, val]) => {
      if (Array.isArray(val)) {
        stored[key] = { members: val, isHeroes: false };
      }
    });
    setGroups(stored);
    localStorage.setItem('npcGroups', JSON.stringify(stored));
  }, []);

  const addToGroup = () => {
    const targetGroup = selectedGroup || groupName.trim();
    if (!targetGroup || count < 1) return;
    const updated = { ...groups };
    let isNew = false;
    if (!updated[targetGroup]) {
      updated[targetGroup] = { members: [], isHeroes: false };
      isNew = true;
    }
    for (let i = 0; i < count; i++) {
      updated[targetGroup].members.push(name);
    }
    setGroups(updated);
    localStorage.setItem('npcGroups', JSON.stringify(updated));
    if (isNew) {
      window.alert(`Group "${targetGroup}" created and ${count} ${name}(s) added.`);
    } else {
      window.alert(`${count} ${name}(s) added to group "${targetGroup}".`);
    }
    setCount(1);
    setGroupName('');
    setSelectedGroup('');
  };

  const handleEdit = (editedNPC) => {
    const updatedCustom = { ...customNPCs };
    if (editedNPC.name !== name) {
      delete updatedCustom[name];
      navigate(`/npc/${editedNPC.name}`);
    }
    updatedCustom[editedNPC.name] = editedNPC;
    setCustomNPCs(updatedCustom);
    localStorage.setItem('customNPCs', JSON.stringify(updatedCustom));
    setAllNPCs({ ...npcs, ...updatedCustom });
    setShowEditor(false);
  };

  if (!npc) {
    return <div style={{ padding: '20px' }}>NPC not found</div>;
  }

  // Function to parse D&D-style markdown (bold, italic, bold-italic)
  const parseText = (text) => {
    // *.*Action*.*
    text = text.replace(/(\*\.\*)(.+?)(\*\.\*)/g,'<br /><span class="npc-section"><strong><em>$2:</em></strong></span>');
    // Handle bold-italic with period (e.g., ***Name.***)
    text = text.replace(/(\*{3})(.+?)\.(\*{3})/g, '<strong><em>$2</em></strong>.');
    // Handle bold-italic without period (e.g., ***Actions***)
    text = text.replace(/(\*{3})(.+?)(\*{3})/g, '<strong><em>$2</em></strong>');
    // Handle bold (e.g., **Armor Class**)
    text = text.replace(/(\*{2})(.+?)(\*{2})/g, '<strong>$2</strong>');
    // Handle italic (e.g., *Hit:*)
    text = text.replace(/(\*)(.+?)(\*)/g, '<em>$2</em>');
    return text;
  };

  // Compute image slug (lowercase, spaces to hyphens)
  const slug = name.toLowerCase().replace(/ /g, '-');
  const imageUrl = npc.imageUrl || `https://www.dnd5eapi.co/api/images/monsters/${slug}.png`;

  return (
    <div className="npc-detail">
      <h1>{name}</h1>
      {isCustom && <button onClick={() => setShowEditor(true)}>Edit</button>}
      {showEditor ? (
        <CustomNPCCreator npc={npc} onSave={handleEdit} onCancel={() => setShowEditor(false)} />
      ) : (
        <div className="stat-block">
          {npc.content.map((item, index) => {
            if (typeof item === 'string') {
              return (
                <div key={index} dangerouslySetInnerHTML={{ __html: parseText(item) }} />
              );
            } else if (item.table) {
              return (
                <table key={index} className="ability-table">
                  <thead>
                    <tr>
                      {Object.keys(item.table).map((key) => (
                        <th key={key}>{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {Object.values(item.table).map((val, i) => (
                        <td key={i}>{val[0]}</td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              );
            }
            return null;
          })}
        </div>
      )}
      <img src={imageUrl} alt={name} className="npc-image" />

      <div className="group-add" style={{ marginTop: '2vw', display: 'flex', gap: '1vw' }}>
        <Select
  value={Object.keys(groups).map(g => ({ value: g, label: g })).find(opt => opt.value === selectedGroup) || null}
  onChange={selected => setSelectedGroup(selected ? selected.value : '')}
  options={[
    { value: '', label: 'Select Existing Group' },
    ...Object.keys(groups).map(g => ({ value: g, label: g }))
  ]}
  classNamePrefix="custom-react-select"
  className="filters-select"  // Reuse if it fits, or remove if not needed
  placeholder="Select Existing Group"
  isSearchable={true}  // Enable search if groups are many
  styles={{
    container: (base) => ({
      ...base,
      flex: 1,
      minWidth: '180px',
    }),
    control: (base) => ({
      ...base,
      padding: '1vw',
      backgroundColor: 'var(--bg-sidebar)',
      color: 'var(--text)',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      fontSize: '1.6vmin',
    }),
  }}
/>
        <input
          type="text"
          placeholder="Or New Group Name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          style={{
            flex: 1,
            padding: '1vw',
            backgroundColor: 'var(--bg-sidebar)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            fontSize: '1.6vmin',
          }}
        />
        <input
          type="number"
          min="1"
          value={count}
          onChange={(e) => setCount(Math.max(1, +e.target.value))}
          style={{
            width: '5vw',
            padding: '1vw',
            backgroundColor: 'var(--bg-sidebar)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            fontSize: '1.6vmin',
          }}
        />
        <button
          onClick={addToGroup}
          style={{
            padding: '1vw 2vw',
            backgroundColor: 'var(--accent)',
            color: 'var(--text)',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1.6vmin',
          }}
        >
          Add to Group
        </button>
      </div>
      <br/>
      <GroupManager groups={groups} setGroups={setGroups} />
    </div>
  );
}