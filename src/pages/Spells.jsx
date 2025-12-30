import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';

// Импортируем данные (положи файлы в src/data/)
import spellList from '../data/spell_list.json'; // Список спеллов по классам и уровням
import spellDetailsData from '../data/spellcasting.json'; // Детали спеллов

export default function Spells() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [selectedSchools, setSelectedSchools] = useState([]);
  const [filteredSpells, setFilteredSpells] = useState([]);
  const [groupedSpells, setGroupedSpells] = useState({});
  const [columns, setColumns] = useState(1);

  const spellsData = spellDetailsData["Spellcasting"];

  // Функция для парсинга заголовка спелла (уровень и школа)
  const parseSpellHeader = (header) => {
    header = header.replace(/\*/g, '').trim();
    let school, level;
    if (header.includes('cantrip')) {
      level = 0;
      school = header.replace(' cantrip', '');
    } else {
      const match = header.match(/(\d+)(st|nd|rd|th)-level (\w+)/);
      if (match) {
        level = parseInt(match[1]);
        school = match[3];
      }
    }
    return { level, school };
  };

  // Построение индекса спеллов
  const spellIndex = useMemo(() => {
    const allSpellNames = new Set();
    for (const levelSpells of Object.values(spellList["Spell Lists"])) {
      for (const spells of Object.values(levelSpells)) {
        spells.forEach(name => allSpellNames.add(name));
      }
    }

    return Array.from(allSpellNames).map(name => {
      const details = spellsData[name];
      if (!details) return null;
      const { level, school } = parseSpellHeader(details.content[0]);
      const classes = [];
      for (const [classFull, levels] of Object.entries(spellList["Spell Lists"])) {
        const className = classFull.split(" ")[0];
        for (const spells of Object.values(levels)) {
          if (spells.includes(name)) {
            classes.push(className);
            break;
          }
        }
      }
      return { name, level, school, classes };
    }).filter(Boolean).sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  // Опции для dropdowns
  const classOptions = useMemo(() => {
    const classesSet = new Set(Object.keys(spellList["Spell Lists"]).map(k => k.split(" ")[0]));
    return [...classesSet].sort().map(c => ({ value: c, label: c }));
  }, []);

  const levelOptions = useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => ({
      value: i.toString(),
      label: i === 0 ? 'Cantrip (0)' : `${i}`
    }));
  }, []);

  const schoolOptions = useMemo(() => {
    const schoolsSet = new Set(spellIndex.map(s => s.school));
    return [...schoolsSet].sort().map(s => ({
      value: s,
      label: s.charAt(0).toUpperCase() + s.slice(1)
    }));
  }, [spellIndex]);

  // Фильтрация и группировка
  useEffect(() => {
    const filtered = spellIndex.filter((spell) => {
      const matchesSearch = !searchQuery || spell.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesClass = selectedClasses.length === 0 || selectedClasses.some(c => spell.classes.includes(c));
      const matchesLevel = selectedLevels.length === 0 || selectedLevels.includes(spell.level.toString());
      const matchesSchool = selectedSchools.length === 0 || selectedSchools.includes(spell.school);
      return matchesSearch && matchesClass && matchesLevel && matchesSchool;
    });

    setFilteredSpells(filtered);

    // Группировка по первой букве
    const groups = filtered.reduce((acc, spell) => {
      const firstLetter = spell.name[0].toUpperCase();
      if (!acc[firstLetter]) {
        acc[firstLetter] = [];
      }
      acc[firstLetter].push(spell);
      return acc;
    }, {});

    // Сортировка групп по алфавиту
    const sortedGroups = Object.keys(groups)
      .sort()
      .reduce((acc, key) => {
        acc[key] = groups[key].sort((a, b) => a.name.localeCompare(b.name));
        return acc;
      }, {});

    setGroupedSpells(sortedGroups);
  }, [searchQuery, selectedClasses, selectedLevels, selectedSchools, spellIndex]);

  // Вычисление колонок по ширине экрана
  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      setColumns(Math.min(Math.floor(width / 220), 5));
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  // Очистка фильтров
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedClasses([]);
    setSelectedLevels([]);
    setSelectedSchools([]);
  };

  const navigate = useNavigate();

  const showSpellInfo = (spell) => {
    console.log('Show details for Spell:', spell.name);
    navigate(`/spell/${spell.name}`);
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
    options={classOptions}
    placeholder="Class"
    value={classOptions.filter(opt => selectedClasses.includes(opt.value))}
    onChange={selected => setSelectedClasses(selected ? selected.map(opt => opt.value) : [])}
    className="filters-select"
    classNamePrefix="custom-react-select"
    styles={{ control: base => ({ ...base, backgroundColor: 'var(--bg-main)', color: 'var(--text)', borderColor: 'var(--border)' }) }}
  />
  <Select
    isMulti
    options={levelOptions}
    placeholder="Level"
    value={levelOptions.filter(opt => selectedLevels.includes(opt.value))}
    onChange={selected => setSelectedLevels(selected ? selected.map(opt => opt.value) : [])}
    className="filters-select"
    classNamePrefix="custom-react-select"
    styles={{ control: base => ({ ...base, backgroundColor: 'var(--bg-main)', color: 'var(--text)', borderColor: 'var(--border)' }) }}
  />
  <Select
    isMulti
    options={schoolOptions}
    placeholder="School"
    value={schoolOptions.filter(opt => selectedSchools.includes(opt.value))}
    onChange={selected => setSelectedSchools(selected ? selected.map(opt => opt.value) : [])}
    className="filters-select"
    classNamePrefix="custom-react-select"
    styles={{ control: base => ({ ...base, backgroundColor: 'var(--bg-main)', color: 'var(--text)', borderColor: 'var(--border)' }) }}
  />
  <button onClick={clearFilters} className="clear-filters-btn">
    Clear Filters
  </button>
</div>

{/* Spell List */}
<div>
  {Object.keys(groupedSpells).length === 0 ? (
    <p className="no-results">No spells found</p>
  ) : (
    Object.keys(groupedSpells).map(letter => (
      <div key={letter}>
        <div className="letter-header">{letter}</div>
        <div className="items-grid">
          {groupedSpells[letter].map(spell => (
            <div
              key={spell.name}
              className="item-card"
              onClick={() => showSpellInfo(spell)}
            >
              [{spell.level === 0 ? 'Cantrip' : spell.level}] {spell.name}
            </div>
          ))}
        </div>
      </div>
    ))
  )}
</div>   
    </div>
  );
}