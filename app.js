/* ============================================
   TRACKLIB NAMING ASSISTANT — app.js
   ============================================ */

// ---- DATA ----

const VALID_INSTRUMENTS = [
  'Drums', 'Cymbals', 'Percussion', 'Bass', 'Synth', 'Keys',
  'Guitar', 'Strings', 'Brass', 'FX', 'Vocals', 'Woodwinds'
];

const VALID_KEYS = [
  'A', 'Am', 'A#', 'A#m', 'Bb', 'Bbm', 'B', 'Bm',
  'C', 'Cm', 'C#', 'C#m', 'Db', 'Dbm', 'D', 'Dm',
  'D#', 'D#m', 'Eb', 'Ebm', 'E', 'Em', 'F', 'Fm',
  'F#', 'F#m', 'Gb', 'Gbm', 'G', 'Gm', 'G#', 'G#m', 'Ab', 'Abm'
];

const DESCRIPTOR_DATA = {
  Drums: ['707', '808', '909', 'acoustic', 'break', 'clap', 'electric', 'fill', 'hi-hat', 'kick', 'linn', 'rim', 'roll', 'sidestick', 'snare', 'tom', 'top'],
  Cymbals: ['china', 'crash', 'gong', 'hi-hat', 'ride', 'splash'],
  Percussion: ['agogo', 'bell', 'block', 'bongo', 'cabasa', 'cajon', 'castanet', 'chime', 'clap', 'clave', 'conga', 'cowbell', 'cuica', 'darbuka', 'doumbek', 'glockenspiel', 'gong', 'guiro', 'hangdrum', 'mallet', 'maraca', 'marimba', 'rainstick', 'shaker', 'snap', 'tabla', 'tambourine', 'timbale', 'timpani', 'triangle', 'vibraphone', 'woodblock', 'xylophone'],
  Bass: ['808', 'acoustic', 'electric', 'fretless', 'growl', 'hoover', 'reese', 'sub', 'synth', 'wobble'],
  Synth: ['additive', 'analog', 'arp', 'chord', 'hoover', 'juno', 'korg', 'lead', 'moog', 'pad', 'plucks', 'saw', 'sine', 'square', 'stabs', 'vocoder', 'wobble'],
  Keys: ['celeste', 'clavinet', 'electric-piano', 'hammond', 'harpsichord', 'mbira', 'melodica', 'organ', 'piano', 'rhodes', 'wurlitzer'],
  Guitar: ['acoustic', 'clean', 'distorted', 'electric', 'fuzz', 'lead', 'rhythm', 'sitar', 'slide', 'ukulele', 'wah'],
  Strings: ['cello', 'erhu', 'harp', 'koto', 'sitar', 'viola', 'violin', 'zither'],
  Brass: ['horns', 'saxophone', 'trombone', 'trumpet'],
  FX: ['animal', 'atmosphere', 'downer', 'drone', 'electronic', 'field-recording', 'filtered', 'foley', 'impact', 'laser', 'mechanical', 'metallic', 'noise', 'reverse', 'riser', 'siren', 'soundscape', 'sweep', 'texture', 'transition', 'vinyl', 'water', 'wooden'],
  Vocals: ['acapella', 'breath', 'chant', 'choir', 'female', 'male', 'pitched', 'shout', 'spoken-word'],
  Woodwinds: ['bassoon', 'clarinet', 'flugelhorn', 'flute', 'oboe', 'saxophone', 'shakuhachi']
};

const UNIVERSAL_DESCRIPTORS = [
  '8bit', 'analog', 'baritone', 'bitcrushed', 'bright', 'buildup', 'chord',
  'clean', 'closed', 'dark', 'deep', 'dissonant', 'distorted', 'dry',
  'ensemble', 'filtered', 'hard', 'high', 'hook', 'layered', 'lead', 'low',
  'melody', 'mid', 'open', 'orchestral', 'organic', 'pluck', 'rhythm',
  'riff', 'sidechained', 'soft', 'solo', 'soprano', 'stab', 'tonal', 'wet'
];

// Instrument detection map
const INSTRUMENT_MAP = {
  'drum': 'Drums', 'drums': 'Drums', 'kick': 'Drums', 'snare': 'Drums',
  'hat': 'Drums', 'clap': 'Drums', 'top': 'Drums', '808': 'Drums',
  'bass': 'Bass', 'sub': 'Bass', '808bass': 'Bass',
  'synth': 'Synth', 'lead': 'Synth', 'pad': 'Synth', 'arp': 'Synth',
  'keys': 'Keys', 'piano': 'Keys', 'rhodes': 'Keys', 'organ': 'Keys',
  'gtr': 'Guitar', 'guitar': 'Guitar',
  'strings': 'Strings', 'violin': 'Strings', 'cello': 'Strings',
  'brass': 'Brass', 'trumpet': 'Brass', 'sax': 'Brass',
  'vox': 'Vocals', 'vocal': 'Vocals', 'vocals': 'Vocals', 'voc': 'Vocals',
  'fx': 'FX', 'sfx': 'FX', 'effect': 'FX',
  'perc': 'Percussion', 'percussion': 'Percussion', 'ride': 'Percussion',
  'cymbal': 'Percussion', 'crash': 'Percussion'
};

// One-shot indicator words
const ONESHOT_WORDS = ['kick', 'snare', 'hat', 'clap', 'rim', 'tom', 'crash', 'ride', 'cymbal', 'snap', 'cowbell', 'shaker'];

// ---- STATE ----

let files = []; // Array of file state objects
let fileIdCounter = 0;

// ---- DOM ----

const packNameInput = document.getElementById('pack-name');
const originInput = document.getElementById('origin');
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const browseBtn = document.getElementById('browse-btn');
const filesSection = document.getElementById('files-section');
const fileRowsContainer = document.getElementById('file-rows');
const clearAllBtn = document.getElementById('clear-all-btn');
const complianceBar = document.getElementById('compliance-bar');
const statReady = document.getElementById('stat-ready');
const statErrors = document.getElementById('stat-errors');
const statDuplicates = document.getElementById('stat-duplicates');

// ---- FILENAME PARSING ----

function parseFilename(filename) {
  // Strip extension
  const name = filename.replace(/\.wav$/i, '');
  const parts = name.toLowerCase().replace(/[-_]/g, ' ').split(/\s+/);

  let bpm = '';
  let key = '';
  let instrument = '';
  let category = '';

  // Detect BPM: 2-3 digit number between 40-300
  const bpmMatch = name.match(/\b(\d{2,3})\s*bpm\b/i) || name.match(/\b(1[0-2]\d|1[3-9]\d|2\d{2}|[4-9]\d)\b/);
  if (bpmMatch) {
    const n = parseInt(bpmMatch[1], 10);
    if (n >= 40 && n <= 300) bpm = String(n);
  }

  // Detect Key: match note patterns
  const keyPattern = /\b([A-G][b#]?m?)\b/g;
  let keyMatch;
  while ((keyMatch = keyPattern.exec(name)) !== null) {
    const candidate = keyMatch[1];
    // Normalize first letter uppercase, rest as-is
    const normalized = candidate.charAt(0).toUpperCase() + candidate.slice(1);
    if (VALID_KEYS.includes(normalized)) {
      // Make sure it's not just a single letter that's part of a word
      const idx = keyMatch.index;
      const before = idx > 0 ? name[idx - 1] : ' ';
      const after = idx + candidate.length < name.length ? name[idx + candidate.length] : ' ';
      if (/[\s_\-.,()]/.test(before) || idx === 0) {
        if (/[\s_\-.,()]/.test(after) || idx + candidate.length === name.length) {
          key = normalized;
          break;
        }
      }
    }
  }

  // Detect Instrument
  for (const part of parts) {
    if (INSTRUMENT_MAP[part]) {
      instrument = INSTRUMENT_MAP[part];
      break;
    }
  }

  // Detect Category
  const lowerName = name.toLowerCase();
  if (/\bloop\b/.test(lowerName)) {
    category = 'Loop';
  } else if (/\bone[\s-]?shot\b/.test(lowerName) || /\bshot\b/.test(lowerName)) {
    category = 'One-Shot';
  } else {
    // Infer one-shot from instrument words
    for (const part of parts) {
      if (ONESHOT_WORDS.includes(part)) {
        category = 'One-Shot';
        break;
      }
    }
  }

  return { bpm, key, instrument, category };
}

// ---- FILENAME GENERATION ----

function sanitize(str) {
  // Replace spaces with hyphens, remove invalid chars
  return str.replace(/\s+/g, '-').replace(/[^A-Za-z0-9!\-_.'()#]/g, '');
}

function generateFilename(fileState) {
  const packName = sanitize(packNameInput.value.trim());
  const origin = sanitize(originInput.value.trim());
  const bpm = fileState.bpm || '';
  const instrument = fileState.instrument || '';
  const category = fileState.category || '';
  const key = fileState.key || '';
  const descriptors = (fileState.descriptors || []).join('-');

  const segments = [packName, origin, bpm, instrument, category, key, descriptors]
    .filter(s => s.length > 0);

  return segments.join('_') + '.wav';
}

// ---- VALIDATION ----

function validateFile(fileState) {
  const errors = [];
  if (!packNameInput.value.trim()) errors.push('Pack Name');
  if (!originInput.value.trim()) errors.push('Origin');
  if (!fileState.instrument) errors.push('Instrument');
  if (!fileState.category) errors.push('Category');
  if (fileState.category === 'Loop' && !fileState.bpm) errors.push('BPM (required for loops)');
  return errors;
}

function getWarnings(fileState) {
  const warnings = [];
  if ((fileState.descriptors || []).length === 0) {
    warnings.push('No descriptors selected');
  }
  return warnings;
}

// ---- DUPLICATE CHECK ----

function checkDuplicates() {
  const nameCount = {};
  for (const f of files) {
    const name = generateFilename(f);
    nameCount[name] = (nameCount[name] || 0) + 1;
  }

  const duplicateNames = new Set();
  for (const [name, count] of Object.entries(nameCount)) {
    if (count > 1) duplicateNames.add(name);
  }

  return duplicateNames;
}

// ---- RENDER ----

function renderAll() {
  const duplicates = checkDuplicates();

  for (const f of files) {
    const row = document.getElementById(`row-${f.id}`);
    if (!row) continue;

    const filename = generateFilename(f);
    const errors = validateFile(f);
    const warnings = getWarnings(f);
    const isDuplicate = duplicates.has(filename);

    // Output
    const outputEl = row.querySelector('.file-row-output');
    const filenameEl = row.querySelector('.output-filename');
    const validationEl = row.querySelector('.validation-msg');
    const warningEl = row.querySelector('.warning-msg');
    const copyBtn = row.querySelector('.btn-copy');

    filenameEl.textContent = filename;

    if (isDuplicate) {
      outputEl.classList.add('has-duplicate');
    } else {
      outputEl.classList.remove('has-duplicate');
    }

    // Validation
    if (errors.length > 0) {
      validationEl.textContent = 'Missing: ' + errors.join(', ');
      copyBtn.disabled = true;
    } else {
      validationEl.textContent = '';
      copyBtn.disabled = false;
    }

    // Warnings
    warningEl.textContent = warnings.length > 0 ? warnings.join(', ') : '';
  }

  updateCompliance(duplicates);
}

function updateCompliance(duplicates) {
  if (files.length === 0) {
    complianceBar.hidden = true;
    return;
  }
  complianceBar.hidden = false;

  let ready = 0;
  let errored = 0;
  let dupeCount = 0;

  const dupSet = new Set();
  for (const f of files) {
    const errors = validateFile(f);
    const filename = generateFilename(f);
    if (errors.length > 0) {
      errored++;
    } else {
      ready++;
    }
    if (duplicates.has(filename)) {
      dupSet.add(f.id);
    }
  }
  dupeCount = dupSet.size;

  statReady.textContent = `${ready} file${ready !== 1 ? 's' : ''} ready`;
  statErrors.textContent = `${errored} missing fields`;
  statDuplicates.textContent = `${dupeCount} duplicate${dupeCount !== 1 ? 's' : ''}`;

  statReady.classList.toggle('hidden', ready === 0);
  statErrors.classList.toggle('hidden', errored === 0);
  statDuplicates.classList.toggle('hidden', dupeCount === 0);

  // Show "all good" state
  if (errored === 0 && dupeCount === 0 && ready > 0) {
    statReady.textContent = `All ${ready} file${ready !== 1 ? 's' : ''} ready`;
  }
}

// ---- BUILD FILE ROW ----

function buildDescriptorChips(fileState, container) {
  container.innerHTML = '';

  const instrument = fileState.instrument;
  const instrumentTags = instrument && DESCRIPTOR_DATA[instrument] ? DESCRIPTOR_DATA[instrument] : [];

  if (instrumentTags.length > 0) {
    const label = document.createElement('div');
    label.className = 'chip-group-label';
    label.textContent = instrument;
    container.appendChild(label);

    for (const tag of instrumentTags) {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chip';
      chip.textContent = tag;
      if (fileState.descriptors.includes(tag)) chip.classList.add('selected');
      chip.addEventListener('click', () => {
        toggleDescriptor(fileState, tag);
        chip.classList.toggle('selected');
        renderAll();
      });
      container.appendChild(chip);
    }
  }

  // Universal
  const uniLabel = document.createElement('div');
  uniLabel.className = 'chip-group-label';
  uniLabel.textContent = 'Universal';
  container.appendChild(uniLabel);

  for (const tag of UNIVERSAL_DESCRIPTORS) {
    // Skip if already shown in instrument-specific list
    if (instrumentTags.includes(tag)) continue;
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip';
    chip.textContent = tag;
    if (fileState.descriptors.includes(tag)) chip.classList.add('selected');
    chip.addEventListener('click', () => {
      toggleDescriptor(fileState, tag);
      chip.classList.toggle('selected');
      renderAll();
    });
    container.appendChild(chip);
  }
}

function toggleDescriptor(fileState, tag) {
  const idx = fileState.descriptors.indexOf(tag);
  if (idx === -1) {
    fileState.descriptors.push(tag);
  } else {
    fileState.descriptors.splice(idx, 1);
  }
}

function createFileRow(fileState) {
  const row = document.createElement('div');
  row.className = 'file-row';
  row.id = `row-${fileState.id}`;

  // Build instrument options
  const instrumentOptions = VALID_INSTRUMENTS.map(i =>
    `<option value="${i}" ${fileState.instrument === i ? 'selected' : ''}>${i}</option>`
  ).join('');

  // Build key options
  const keyOptions = VALID_KEYS.map(k =>
    `<option value="${k}" ${fileState.key === k ? 'selected' : ''}>${k}</option>`
  ).join('');

  row.innerHTML = `
    <div class="file-row-top">
      <div class="file-row-original">${fileState.originalName}</div>
      <button type="button" class="btn-remove" title="Remove file">&times;</button>
    </div>
    <div class="file-row-fields">
      <div class="field">
        <label>Instrument</label>
        <select class="input-instrument">
          <option value="">—</option>
          ${instrumentOptions}
        </select>
      </div>
      <div class="field">
        <label>Category</label>
        <select class="input-category">
          <option value="" ${!fileState.category ? 'selected' : ''}>—</option>
          <option value="Loop" ${fileState.category === 'Loop' ? 'selected' : ''}>Loop</option>
          <option value="One-Shot" ${fileState.category === 'One-Shot' ? 'selected' : ''}>One-Shot</option>
        </select>
      </div>
      <div class="field">
        <label>BPM</label>
        <input type="number" class="input-bpm" min="40" max="300" value="${fileState.bpm}" placeholder="—">
      </div>
      <div class="field">
        <label>Key</label>
        <select class="input-key">
          <option value="">—</option>
          ${keyOptions}
        </select>
      </div>
      <div class="field">
        <label>&nbsp;</label>
      </div>
    </div>
    <div class="descriptors-area">
      <div class="field">
        <label>Descriptors</label>
        <div class="chip-group" id="chips-${fileState.id}"></div>
      </div>
    </div>
    <div class="file-row-output">
      <span class="output-filename"></span>
      <span class="duplicate-tag">⚠ Duplicate</span>
      <button type="button" class="btn-copy">COPY</button>
    </div>
    <div class="validation-msg"></div>
    <div class="warning-msg"></div>
  `;

  // Bind events
  const instrumentSelect = row.querySelector('.input-instrument');
  const categorySelect = row.querySelector('.input-category');
  const bpmInput = row.querySelector('.input-bpm');
  const keySelect = row.querySelector('.input-key');
  const copyBtn = row.querySelector('.btn-copy');
  const removeBtn = row.querySelector('.btn-remove');
  const chipsContainer = row.querySelector(`#chips-${fileState.id}`);

  instrumentSelect.addEventListener('change', () => {
    fileState.instrument = instrumentSelect.value;
    // Rebuild descriptor chips when instrument changes
    // Keep descriptors that are still valid
    const validTags = getValidDescriptors(fileState.instrument);
    fileState.descriptors = fileState.descriptors.filter(d => validTags.includes(d));
    buildDescriptorChips(fileState, chipsContainer);
    renderAll();
  });

  categorySelect.addEventListener('change', () => {
    fileState.category = categorySelect.value;
    renderAll();
  });

  bpmInput.addEventListener('input', () => {
    fileState.bpm = bpmInput.value;
    renderAll();
  });

  keySelect.addEventListener('change', () => {
    fileState.key = keySelect.value;
    renderAll();
  });

  copyBtn.addEventListener('click', () => {
    const filename = generateFilename(fileState);
    // Copy without .wav
    const nameWithoutExt = filename.replace(/\.wav$/, '');
    navigator.clipboard.writeText(nameWithoutExt).then(() => {
      copyBtn.textContent = 'COPIED';
      copyBtn.classList.add('copied');
      setTimeout(() => {
        copyBtn.textContent = 'COPY';
        copyBtn.classList.remove('copied');
      }, 1500);
    });
  });

  removeBtn.addEventListener('click', () => {
    files = files.filter(f => f.id !== fileState.id);
    row.remove();
    if (files.length === 0) {
      filesSection.hidden = true;
    }
    renderAll();
  });

  // Build initial chips
  buildDescriptorChips(fileState, chipsContainer);

  return row;
}

function getValidDescriptors(instrument) {
  const instrumentTags = instrument && DESCRIPTOR_DATA[instrument] ? DESCRIPTOR_DATA[instrument] : [];
  return [...instrumentTags, ...UNIVERSAL_DESCRIPTORS];
}

// ---- FILE HANDLING ----

function handleFiles(fileList) {
  const wavFiles = Array.from(fileList).filter(f => f.name.toLowerCase().endsWith('.wav'));
  if (wavFiles.length === 0) return;

  for (const file of wavFiles) {
    const parsed = parseFilename(file.name);
    const fileState = {
      id: fileIdCounter++,
      originalName: file.name,
      instrument: parsed.instrument,
      category: parsed.category,
      bpm: parsed.bpm,
      key: parsed.key,
      descriptors: []
    };
    files.push(fileState);

    const row = createFileRow(fileState);
    fileRowsContainer.appendChild(row);
  }

  filesSection.hidden = false;
  renderAll();
}

// ---- EVENTS ----

// Drop zone
dropZone.addEventListener('dragover', e => {
  e.preventDefault();
  dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', e => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  handleFiles(e.dataTransfer.files);
});

dropZone.addEventListener('click', () => {
  fileInput.click();
});

browseBtn.addEventListener('click', e => {
  e.stopPropagation();
  fileInput.click();
});

fileInput.addEventListener('change', () => {
  handleFiles(fileInput.files);
  fileInput.value = '';
});

// Pack settings update all rows
packNameInput.addEventListener('input', renderAll);
originInput.addEventListener('input', renderAll);

// Clear all
clearAllBtn.addEventListener('click', () => {
  files = [];
  fileIdCounter = 0;
  fileRowsContainer.innerHTML = '';
  filesSection.hidden = true;
  complianceBar.hidden = true;
});
