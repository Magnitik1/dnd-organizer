import React from 'react';
import { useParams } from 'react-router-dom';
import spellsData from '../data/spellcasting.json'; // Import full spell data

export default function SpellDetails() {
  const { name } = useParams();
  const spell = spellsData["Spellcasting"][name];

  if (!spell) {
    return <div style={{ padding: '20px' }}>Spell not found</div>;
  }

  // Function to parse D&D-style markdown (bold, italic, bold-italic)
  const parseText = (text) => {
    // Handle bold-italic with period (e.g., ***Name.***)
    text = text.replace(/(\*{3})(.+?)\.(\*{3})/g, '<strong><em>$2</em></strong>.');
    // Handle bold-italic without period (e.g., ***Actions***)
    text = text.replace(/(\*{3})(.+?)(\*{3})/g, '<strong><em>$2</em></strong>');
    // Handle bold (e.g., **Casting Time:**)
    text = text.replace(/(\*{2})(.+?)(\*{2})/g, '<strong>$2</strong>');
    // Handle italic (e.g., *Hit:*)
    text = text.replace(/(\*)(.+?)(\*)/g, '<em>$2</em>');
    return text;
  };

  return (
    <div className="npc-detail"> {/* Reuse NPC styles for consistency */}
      <h1>{name}</h1>
      {/* No image for spells, omit */}
      <div className="stat-block">
        {spell.content.map((item, index) => {
          if (typeof item === 'string') {
            return (
              <div key={index} dangerouslySetInnerHTML={{ __html: parseText(item) }} />
            );
          } else if (item.table) {
            const columns = Object.keys(item.table);
            const rowCount = item.table[columns[0]].length;
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
                        <td key={col}>{item.table[col][rowIdx]}</td>
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