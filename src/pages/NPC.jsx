// src/pages/NPC.js (обновлённый с сохранением grid в 5 колонок по умолчанию)

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import CustomNPCCreator from '../components/CustomNPCCreator';

// Импортируем данные
import npcIndex from '../data/all_npc_index.json';

export default function NPC() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedCRs, setSelectedCRs] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [showCustomOnly, setShowCustomOnly] = useState(false);
  
  const [filteredNPCs, setFilteredNPCs] = useState([]);
  const [groupedNPCs, setGroupedNPCs] = useState({});
  const [columns, setColumns] = useState(5); // Вернули 5 колонок по умолчанию
  const [showCreator, setShowCreator] = useState(false);
  
  const [customNPCs, setCustomNPCs] = useState(() => {
    const stored = localStorage.getItem('customNPCs');
    return stored ? JSON.parse(stored) : {};
  });

  // Опции для dropdowns (без изменений)
  const sizeOptions = [
    { value: 'Tiny', label: 'Tiny' },
    { value: 'Small', label: 'Small' },
    { value: 'Medium', label: 'Medium' },
    { value: 'Large', label: 'Large' },
    { value: 'Huge', label: 'Huge' },
    { value: 'Gargantuan', label: 'Gargantuan' },
  ];

  const crOptions = [
    { value: '0', label: '0' },
    { value: '1/8', label: '1/8' },
    { value: '1/4', label: '1/4' },
    { value: '1/2', label: '1/2' },
    { value: '1', label: '1' },
    { value: '2', label: '2' },
    { value: '3', label: '3' },
    { value: '4', label: '4' },
    { value: '5', label: '5' },
    { value: '6', label: '6' },
    { value: '7', label: '7' },
    { value: '8', label: '8' },
    { value: '9', label: '9' },
    { value: '10', label: '10' },
    { value: '11', label: '11' },
    { value: '12', label: '12' },
    { value: '13', label: '13' },
    { value: '14', label: '14' },
    { value: '15', label: '15' },
    { value: '16', label: '16' },
    { value: '17', label: '17' },
    { value: '18', label: '18' },
    { value: '19', label: '19' },
    { value: '20', label: '20' },
    { value: '21', label: '21' },
    { value: '22', label: '22' },
    { value: '23', label: '23' },
    { value: '24', label: '24' },
    { value: '25', label: '25' },
    { value: '26', label: '26' },
    { value: '27', label: '27' },
    { value: '28', label: '28' },
    { value: '29', label: '29' },
    { value: '30', label: '30' },
  ];

  const typeOptions = [
    { value: 'dragon', label: 'Dragon' },
    { value: 'beast', label: 'Beast' },
    { value: 'humanoid', label: 'Humanoid' },
    { value: 'fey', label: 'Fey' },
    { value: 'ooze', label: 'Ooze' },
    { value: 'undead', label: 'Undead' },
    { value: 'aberration', label: 'Aberration' },
    { value: 'monstrosity', label: 'Monstrosity' },
    { value: 'fiend', label: 'Fiend' },
    { value: 'construct', label: 'Construct' },
    { value: 'elemental', label: 'Elemental' },
    { value: 'giant', label: 'Giant' },
    { value: 'celestial', label: 'Celestial' },
    { value: 'plant', label: 'Plant' },
    { value: 'swarm of Tiny beasts', label: 'Swarm of Tiny Beasts' },
  ];

  // Фильтрация и группировка
  useEffect(() => {
    let allNPCs = npcIndex.map(npc => ({ ...npc, source: 'official' }));

    const customList = Object.values(customNPCs).map(npc => ({
      name: npc.name,
      cr: npc.cr,
      size: npc.size,
      type: npc.type,
      source: 'custom'
    }));

    if (showCustomOnly) {
      allNPCs = customList;
    } else {
      allNPCs = [...allNPCs, ...customList];
    }

    const filtered = allNPCs.filter((npc) => {
      const matchesSearch = !searchQuery || npc.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSize = selectedSizes.length === 0 || selectedSizes.includes(npc.size);
      const matchesCR = selectedCRs.length === 0 || selectedCRs.includes(npc.cr);
      const matchesType = selectedTypes.length === 0 || selectedTypes.includes(npc.type);
      return matchesSearch && matchesSize && matchesCR && matchesType;
    });

    setFilteredNPCs(filtered);

    const groups = filtered.reduce((acc, npc) => {
      const firstLetter = npc.name[0].toUpperCase();
      if (!acc[firstLetter]) acc[firstLetter] = [];
      acc[firstLetter].push(npc);
      return acc;
    }, {});

    const sortedGroups = Object.keys(groups)
      .sort()
      .reduce((acc, key) => {
        acc[key] = groups[key].sort((a, b) => a.name.localeCompare(b.name));
        return acc;
      }, {});

    setGroupedNPCs(sortedGroups);
  }, [searchQuery, selectedSizes, selectedCRs, selectedTypes, customNPCs, showCustomOnly]);

  // Responsive columns (вернули адаптивность, но максимум 5)
  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      // 220px — примерная ширина карточки NPC
      setColumns(Math.min(Math.floor(width / 220), 5));
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSizes([]);
    setSelectedCRs([]);
    setSelectedTypes([]);
    setShowCustomOnly(false);
  };

  const navigate = useNavigate();

  const showNPCInfo = (npc) => {
    console.log('Show details for NPC:', npc.name);
    navigate(`/npc/${npc.name}`);
  };

  const handleCreate = (newNPC) => {
    const updated = { ...customNPCs, [newNPC.name]: newNPC };
    setCustomNPCs(updated);
    localStorage.setItem('customNPCs', JSON.stringify(updated));
    setShowCreator(false);
  };

  const handleDelete = (name) => {
    if (window.confirm(`Delete custom NPC "${name}"?`)) {
      const updated = { ...customNPCs };
      delete updated[name];
      setCustomNPCs(updated);
      localStorage.setItem('customNPCs', JSON.stringify(updated));
    }
  };

  return (
    <div style={{ padding: '20px', height: '100%', overflowY: 'auto' }}>
      {/* Filters */}
<div className="filters-container">
  <input
    type="text"
    placeholder="Search by name..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="filters-search"
  />
  <Select
    isMulti
    options={sizeOptions}
    placeholder="Size"
    value={sizeOptions.filter(opt => selectedSizes.includes(opt.value))}
    onChange={selected => setSelectedSizes(selected ? selected.map(opt => opt.value) : [])}
    classNamePrefix="custom-react-select"
    className="filters-select"
    styles={{ control: base => ({ ...base, backgroundColor: 'var(--bg-main)', color: 'var(--text)', borderColor: 'var(--border)' }) }}
  />
  <Select
    isMulti
    options={crOptions}
    placeholder="Challenge"
    value={crOptions.filter(opt => selectedCRs.includes(opt.value))}
    onChange={selected => setSelectedCRs(selected ? selected.map(opt => opt.value) : [])}
    className="filters-select"
    classNamePrefix="custom-react-select"
    styles={{ control: base => ({ ...base, backgroundColor: 'var(--bg-main)', color: 'var(--text)', borderColor: 'var(--border)' }) }}
  />
  <Select
    isMulti
    options={typeOptions}
    placeholder="Type"
    value={typeOptions.filter(opt => selectedTypes.includes(opt.value))}
    onChange={selected => setSelectedTypes(selected ? selected.map(opt => opt.value) : [])}
    className="filters-select"
    classNamePrefix="custom-react-select"
    styles={{ control: base => ({ ...base, backgroundColor: 'var(--bg-main)', color: 'var(--text)', borderColor: 'var(--border)' }) }}
  />
  <label className="filters-checkbox">
    <input
      type="checkbox"
      checked={showCustomOnly}
      onChange={e => setShowCustomOnly(e.target.checked)}
    />
    Only Custom
  </label>
  <button onClick={clearFilters} style={{background:"rgb(100, 1, 1, 1)"}} className="clear-filters-btn">
    Clear
  </button>
</div>

{/* NPC List */}
<div>
  {Object.keys(groupedNPCs).length === 0 ? (
    <p className="no-results">No NPCs found</p>
  ) : (
    Object.keys(groupedNPCs).map(letter => (
      <div key={letter}>
        <div className="letter-header">{letter}</div>
        <div className="items-grid">
          {groupedNPCs[letter].map(npc => (
            <div
              key={npc.name}
              className="item-card"
              onClick={() => showNPCInfo(npc)}
            >
              <div>[{npc.cr}] {npc.name}</div>
              {npc.source === 'custom' && (
                <button
                  className="delete-custom-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(npc.name);
                  }}
                  title="Delete custom NPC"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    ))
  )}
</div>

      <button 
        onClick={() => setShowCreator(!showCreator)} 
        className="create-btn"
        style={{ marginTop: '20px' }}
      >
        {showCreator ? 'Cancel' : 'Create Custom NPC'}
      </button>

      {showCreator && (
        <CustomNPCCreator 
          onSave={handleCreate} 
          onCancel={() => setShowCreator(false)} 
        />
      )}
    </div>
  );
}