import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';

// Импортируем данные (положи файлы в src/data/)
import magicItems from '../data/magic_items_index.json'; // Список магических предметов

export default function Equipment() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRarities, setSelectedRarities] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedAttunements, setSelectedAttunements] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [groupedItems, setGroupedItems] = useState({});
  const [columns, setColumns] = useState(1);

  // Опции для dropdowns
  const rarityOptions = useMemo(() => {
    const titleCase = (str) => {
      if (!str) return 'Unknown'; // Handle null/undefined rarities
      return str.toLowerCase().split(' ').map(word => {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }).join(' ');
    };

    const rarities = new Set(magicItems.map(item => item.rarity).filter(Boolean)); // Filter out null/undefined
    return [...rarities].sort().map(r => ({ value: r, label: titleCase(r) }));
  }, []);

  const typeOptions = useMemo(() => {
    const types = new Set(magicItems.map(item => item.type).filter(Boolean)); // Filter out null/undefined
    return [...types].sort().map(t => ({ value: t, label: t }));
  }, []);

  const attunementOptions = [
    { value: 'true', label: 'Requires Attunement' },
    { value: 'false', label: 'No Attunement' },
  ];

  // Фильтрация и группировка
  useEffect(() => {
    const filtered = magicItems.filter((item) => {
      const matchesSearch = !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRarity = selectedRarities.length === 0 || selectedRarities.includes(item.rarity);
      const matchesType = selectedTypes.length === 0 || selectedTypes.includes(item.type);
      const matchesAttunement = selectedAttunements.length === 0 || selectedAttunements.includes(item.attunement.toString());
      return matchesSearch && matchesRarity && matchesType && matchesAttunement;
    });

    setFilteredItems(filtered);

    // Группировка по первой букве
    const groups = filtered.reduce((acc, item) => {
      const firstLetter = item.name[0].toUpperCase();
      if (!acc[firstLetter]) {
        acc[firstLetter] = [];
      }
      acc[firstLetter].push(item);
      return acc;
    }, {});

    // Сортировка групп по алфавиту
    const sortedGroups = Object.keys(groups)
      .sort()
      .reduce((acc, key) => {
        acc[key] = groups[key].sort((a, b) => a.name.localeCompare(b.name));
        return acc;
      }, {});

    setGroupedItems(sortedGroups);
  }, [searchQuery, selectedRarities, selectedTypes, selectedAttunements]);

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
    setSelectedRarities([]);
    setSelectedTypes([]);
    setSelectedAttunements([]);
  };

  const navigate = useNavigate();

  const showItemInfo = (item) => {
    console.log('Show details for Magic Item:', item.name);
    navigate(`/equipment/${item.name}`);
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
    options={rarityOptions}
    placeholder="Rarity"
    value={rarityOptions.filter(opt => selectedRarities.includes(opt.value))}
    onChange={selected => setSelectedRarities(selected ? selected.map(opt => opt.value) : [])}
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
  <Select
    isMulti
    options={attunementOptions}
    placeholder="Attunement"
    value={attunementOptions.filter(opt => selectedAttunements.includes(opt.value))}
    onChange={selected => setSelectedAttunements(selected ? selected.map(opt => opt.value) : [])}
    className="filters-select"
    classNamePrefix="custom-react-select"
    styles={{ control: base => ({ ...base, backgroundColor: 'var(--bg-main)', color: 'var(--text)', borderColor: 'var(--border)' }) }}
  />
  <button onClick={clearFilters} className="clear-filters-btn">
    Clear Filters
  </button>
</div>

{/* Item List */}
<div>
  {Object.keys(groupedItems).length === 0 ? (
    <p className="no-results">No items found</p>
  ) : (
    Object.keys(groupedItems).map(letter => (
      <div key={letter}>
        <div className="letter-header">{letter}</div>
        <div className="items-grid">
          {groupedItems[letter].map(item => (
            <div
              key={item.name}
              className="item-card"
              onClick={() => showItemInfo(item)}
            >
              [{item.rarity || '—'}] {item.name}
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