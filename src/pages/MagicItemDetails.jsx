import React from 'react';
import { useParams } from 'react-router-dom';
import magicItems from '../data/magic_items_index.json'; // Import full magic items data

export default function MagicItemDetails() {
  const { name } = useParams();
  const item = magicItems.find(i => i.name === name);

  if (!item) {
    return <div style={{ padding: '20px' }}>Magic Item not found</div>;
  }

  // Function to parse D&D-style markdown (bold, italic, bold-italic)
  const parseText = (text) => {
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

  return (
    <div className="npc-detail"> {/* Reuse NPC styles for consistency */}
      <h1>{name}</h1>
      {/* No image for magic items, omit */}
      <div className="stat-block">
        {item.text && (
          <div dangerouslySetInnerHTML={{ __html: parseText(item.text) }} />
        )}
        {item.structures.map((structure, index) => {
          if (structure.table) {
            const columns = Object.keys(structure.table);
            const rowCount = structure.table[columns[0]].length;
            return (
              <table key={index} className="ability-table">
                <thead>
                  <tr>
                    {columns.map((col) => (
                      <th key={col}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: rowCount }).map((_, rowIdx) => (
                    <tr key={rowIdx}>
                      {columns.map((col) => (
                        <td key={col}>{structure.table[col][rowIdx]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}