// src/components/CustomNPCCreator.js (обновлённый с поддержкой редактирования)

import React, { useState, useEffect } from 'react';

export default function CustomNPCCreator({ npc = null, onSave, onCancel }) {
  const isEdit = !!npc;

  const [name, setName] = useState(npc?.name || '');
  const [size, setSize] = useState(npc?.size || 'Medium');
  const [type, setType] = useState(npc?.type || 'humanoid');
  const [alignment, setAlignment] = useState(npc?.alignment || 'neutral');
  const [ac, setAC] = useState(npc?.ac || '10');
  const [hp, setHP] = useState(npc?.hp || '10');
  const [speed, setSpeed] = useState(npc?.speed || '30 ft.');
  const [str, setStr] = useState(npc?.str || 10);
  const [dex, setDex] = useState(npc?.dex || 10);
  const [con, setCon] = useState(npc?.con || 10);
  const [int, setInt] = useState(npc?.int || 10);
  const [wis, setWis] = useState(npc?.wis || 10);
  const [cha, setCha] = useState(npc?.cha || 10);
  const [savingThrows, setSavingThrows] = useState(npc?.savingThrows || '');
  const [skills, setSkills] = useState(npc?.skills || '');
  const [senses, setSenses] = useState(npc?.senses || 'passive Perception 10');
  const [languages, setLanguages] = useState(npc?.languages || 'Common');
  const [cr, setCR] = useState(npc?.cr || '0');
  const [traits, setTraits] = useState(npc?.traits || '');
  const [actions, setActions] = useState(npc?.actions || '');
  const [legendaryActions, setLegendaryActions] = useState(npc?.legendaryActions || '');
  const [imageUrl, setImageUrl] = useState(npc?.imageUrl || '');

  const handleFileDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setImageUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setImageUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const save = () => {
    const content = [
      `*${size} ${type}, ${alignment}*`,
      `**Armor Class** ${ac}`,
      `**Hit Points** ${hp}`,
      `**Speed** ${speed}`,
      {
        table: {
          STR: [`${str} (${Math.floor((str - 10)/2)})`],
          DEX: [`${dex} (${Math.floor((dex - 10)/2)})`],
          CON: [`${con} (${Math.floor((con - 10)/2)})`],
          INT: [`${int} (${Math.floor((int - 10)/2)})`],
          WIS: [`${wis} (${Math.floor((wis - 10)/2)})`],
          CHA: [`${cha} (${Math.floor((cha - 10)/2)})`],
        }
      },
      `**Saving Throws** ${savingThrows}`,
      `**Skills** ${skills}`,
      `**Senses** ${senses}`,
      `**Languages** ${languages}`,
      `**Challenge** ${cr}`,
      traits.split('\n').filter(line => line.trim()).join('\n'),
      '***Actions***',
      actions.split('\n').filter(line => line.trim()).join('\n'),
      legendaryActions ? '***Legendary Actions***' : '',
      legendaryActions.split('\n').filter(line => line.trim()).join('\n'),
    ].filter(item => item !== '');

    const newNPC = { 
      name, 
      size, 
      type, 
      cr, 
      ac, 
      hp, 
      speed, 
      str, 
      dex, 
      con, 
      int, 
      wis, 
      cha, 
      savingThrows, 
      skills, 
      senses, 
      languages, 
      traits, 
      actions, 
      legendaryActions, 
      imageUrl,
      content 
    };

    console.log('Saving NPC:', newNPC);
    onSave(newNPC);
  };

  return (
    <div className="custom-creator">
      <h2>{isEdit ? 'Edit Custom NPC' : 'Create Custom NPC'}</h2>
      
      <label>Name:</label>
      <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Aboleth" />

      <label>Size:</label>
      <select value={size} onChange={e => setSize(e.target.value)}>
        <option value="Tiny">Tiny</option>
        <option value="Small">Small</option>
        <option value="Medium">Medium</option>
        <option value="Large">Large</option>
        <option value="Huge">Huge</option>
        <option value="Gargantuan">Gargantuan</option>
      </select>

      <label>Type:</label>
      <input type="text" value={type} onChange={e => setType(e.target.value)} placeholder="e.g., aberration" />

      <label>Alignment:</label>
      <select value={alignment} onChange={e => setAlignment(e.target.value)}>
        <option value="lawful good">Lawful Good</option>
        <option value="neutral good">Neutral Good</option>
        <option value="chaotic good">Chaotic Good</option>
        <option value="lawful neutral">Lawful Neutral</option>
        <option value="neutral">Neutral</option>
        <option value="chaotic neutral">Chaotic Neutral</option>
        <option value="lawful evil">Lawful Evil</option>
        <option value="neutral evil">Neutral Evil</option>
        <option value="chaotic evil">Chaotic Evil</option>
      </select>

      <label>Armor Class:</label>
      <input type="text" value={ac} onChange={e => setAC(e.target.value)} placeholder="e.g., 17 (natural armor)" />

      <label>Hit Points:</label>
      <input type="text" value={hp} onChange={e => setHP(e.target.value)} placeholder="e.g., 135 (18d10 + 36)" />

      <label>Speed:</label>
      <input type="text" value={speed} onChange={e => setSpeed(e.target.value)} placeholder="e.g., 10 ft., swim 40 ft." />

      <div className="ability-scores">
        <div className="ability">
          <label>STR:</label>
          <input type="number" value={str} onChange={e => setStr(+e.target.value)} />
        </div>
        <div className="ability">
          <label>DEX:</label>
          <input type="number" value={dex} onChange={e => setDex(+e.target.value)} />
        </div>
        <div className="ability">
          <label>CON:</label>
          <input type="number" value={con} onChange={e => setCon(+e.target.value)} />
        </div>
        <div className="ability">
          <label>INT:</label>
          <input type="number" value={int} onChange={e => setInt(+e.target.value)} />
        </div>
        <div className="ability">
          <label>WIS:</label>
          <input type="number" value={wis} onChange={e => setWis(+e.target.value)} />
        </div>
        <div className="ability">
          <label>CHA:</label>
          <input type="number" value={cha} onChange={e => setCha(+e.target.value)} />
        </div>
      </div>

      <label>Saving Throws:</label>
      <input type="text" value={savingThrows} onChange={e => setSavingThrows(e.target.value)} placeholder="e.g., Con +6, Int +8, Wis +6" />

      <label>Skills:</label>
      <input type="text" value={skills} onChange={e => setSkills(e.target.value)} placeholder="e.g., History +12, Perception +10" />

      <label>Senses:</label>
      <input type="text" value={senses} onChange={e => setSenses(e.target.value)} placeholder="e.g., darkvision 120 ft., passive Perception 20" />

      <label>Languages:</label>
      <input type="text" value={languages} onChange={e => setLanguages(e.target.value)} placeholder="e.g., Deep Speech, telepathy 120 ft." />

      <label>Challenge Rating:</label>
      <input type="text" value={cr} onChange={e => setCR(e.target.value)} placeholder="e.g., 10 (5,900 XP)" />

      <label>Traits/Features (markdown, each on new line):</label>
      <textarea value={traits} onChange={e => setTraits(e.target.value)} placeholder="e.g., ***Amphibious.*** The aboleth can breathe air and water..." />

      <label>Actions (markdown, each on new line):</label>
      <textarea value={actions} onChange={e => setActions(e.target.value)} placeholder="e.g., ***Multiattack.*** The aboleth makes three tentacle attacks..." />

      <label>Legendary Actions (optional, markdown, each on new line):</label>
      <textarea value={legendaryActions} onChange={e => setLegendaryActions(e.target.value)} placeholder="e.g., The aboleth can take 3 legendary actions..." />

      <label>Image (drag & drop or URL):</label>
      <div
        className="image-drop"
        onDrop={handleFileDrop}
        onDragOver={e => e.preventDefault()}
        style={{ border: '2px dashed var(--border)', padding: '1vw', borderRadius: '4px', minHeight: '10vh' }}
      >
        {imageUrl ? <img src={imageUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '20vh' }} /> : 'Drop image here or '}
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <input type="text" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="Or paste URL" />
      </div>

      <div className="creator-buttons">
        <button onClick={save} className="save-btn">
          {isEdit ? 'Save Changes' : 'Save NPC'}
        </button>
        <button onClick={onCancel} className="cancel-btn">Cancel</button>
      </div>
    </div>
  );
}