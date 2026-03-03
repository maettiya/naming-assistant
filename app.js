/* ============================================
   TRACKLIB NAMING ASSISTANT — app.js
   Four modes: Single Builder, File Drop,
   Bulk Renamer, Validator
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

const ONESHOT_WORDS = ['kick', 'snare', 'hat', 'clap', 'rim', 'tom', 'crash', 'ride', 'cymbal', 'snap', 'cowbell', 'shaker'];

const VALID_INSTRUMENTS_LOWER = VALID_INSTRUMENTS.map(i => i.toLowerCase());

// ---- SHARED UTILITIES ----

function sanitize(str) {
  return str.replace(/\s+/g, '-').replace(/[^A-Za-z0-9!\-_.'()#]/g, '');
}

function parseFilename(filename) {
  const name = filename.replace(/\.wav$/i, '');
  const parts = name.toLowerCase().replace(/[-_]/g, ' ').split(/\s+/);

  let bpm = '';
  let key = '';
  let instrument = '';
  let category = '';

  // BPM
  const bpmMatch = name.match(/\b(\d{2,3})\s*bpm\b/i) || name.match(/\b(1[0-2]\d|1[3-9]\d|2\d{2}|[4-9]\d)\b/);
  if (bpmMatch) {
    const n = parseInt(bpmMatch[1], 10);
    if (n >= 40 && n <= 300) bpm = String(n);
  }

  // Key
  const keyPattern = /\b([A-G][b#]?m?)\b/g;
  let keyMatch;
  while ((keyMatch = keyPattern.exec(name)) !== null) {
    const candidate = keyMatch[1];
    const normalized = candidate.charAt(0).toUpperCase() + candidate.slice(1);
    if (VALID_KEYS.includes(normalized)) {
      const idx = keyMatch.index;
      const before = idx > 0 ? name[idx - 1] : ' ';
      const after = idx + candidate.length < name.length ? name[idx + candidate.length] : ' ';
      if ((/[\s_\-.,()]/.test(before) || idx === 0) &&
          (/[\s_\-.,()]/.test(after) || idx + candidate.length === name.length)) {
        key = normalized;
        break;
      }
    }
  }

  // Instrument
  for (const part of parts) {
    if (INSTRUMENT_MAP[part]) {
      instrument = INSTRUMENT_MAP[part];
      break;
    }
  }

  // Category
  const lowerName = name.toLowerCase();
  if (/\bloop\b/.test(lowerName)) {
    category = 'Loop';
  } else if (/\bone[\s-]?shot\b/.test(lowerName) || /\bshot\b/.test(lowerName)) {
    category = 'One-Shot';
  } else {
    for (const part of parts) {
      if (ONESHOT_WORDS.includes(part)) {
        category = 'One-Shot';
        break;
      }
    }
  }

  return { bpm, key, instrument, category };
}


// ============================================================
// MODE SWITCHING
// ============================================================

const modeTabs = document.getElementById('mode-tabs');
const modes = ['builder', 'filedrop', 'bulk', 'validate'];

modeTabs.addEventListener('click', e => {
  const tab = e.target.closest('.tab');
  if (!tab) return;
  const mode = tab.dataset.mode;
  modeTabs.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  tab.classList.add('active');
  modes.forEach(m => {
    document.getElementById('mode-' + m).style.display = m === mode ? 'block' : 'none';
  });
  // Show compliance bar only in filedrop mode with files
  if (mode === 'filedrop' && fdFiles.length > 0) {
    complianceBar.hidden = false;
  } else {
    complianceBar.hidden = true;
  }
});


// ============================================================
// SINGLE BUILDER
// ============================================================

let builderDescriptors = [];

const bPackName = document.getElementById('b-pack-name');
const bOrigin = document.getElementById('b-origin');
const bInstrument = document.getElementById('b-instrument');
const bCategory = document.getElementById('b-category');
const bBpm = document.getElementById('b-bpm');
const bKey = document.getElementById('b-key');
const bCustomDesc = document.getElementById('b-custom-desc');
const bOutput = document.getElementById('b-output');
const bCopyBtn = document.getElementById('b-copy-btn');
const bCopyLarge = document.getElementById('b-copy-large');
const bReset = document.getElementById('b-reset');
const bValidation = document.getElementById('b-validation');
const bSelectedTags = document.getElementById('b-selected-tags');
const bDescriptorCloud = document.getElementById('b-descriptor-cloud');

function builderBuildFilename() {
  const pack = sanitize(bPackName.value.trim());
  const origin = sanitize(bOrigin.value.trim());
  const bpm = bBpm.value.trim();
  const instrument = bInstrument.value;
  const category = bCategory.value;
  const key = bKey.value;
  const customDesc = bCustomDesc.value.trim();

  if (!pack || !origin || !instrument || !category) return null;

  const parts = [pack, origin];

  if (bpm) parts.push(bpm);
  else if (category === 'loop') parts.push('___BPM_REQUIRED___');

  parts.push(instrument.toLowerCase());
  parts.push(category);

  if (key) parts.push(key);

  const allDescs = [...builderDescriptors];
  if (customDesc) {
    customDesc.split(/[_\s]+/).filter(Boolean).forEach(d => {
      const clean = sanitize(d);
      if (clean && !allDescs.includes(clean)) allDescs.push(clean);
    });
  }
  if (allDescs.length) parts.push(allDescs.join('-'));

  return parts.join('_') + '.wav';
}

function builderUpdateOutput() {
  const filename = builderBuildFilename();

  if (!filename) {
    bOutput.textContent = 'Fill in the fields above to generate your filename...';
    bOutput.classList.add('empty');
    bValidation.innerHTML = '';
    return;
  }

  bOutput.textContent = filename.replace('___BPM_REQUIRED___', '[BPM MISSING]');
  bOutput.classList.remove('empty');
  builderShowValidation(filename);
}

function builderShowValidation(filename) {
  const pack = bPackName.value.trim();
  const origin = bOrigin.value.trim();
  const bpm = bBpm.value.trim();
  const instrument = bInstrument.value;
  const category = bCategory.value;
  const key = bKey.value;

  const checks = [];
  checks.push({ ok: !!pack, msg: pack ? `Pack name set: "${pack}"` : 'Pack name is required' });
  checks.push({ ok: !!origin, msg: origin ? `Origin set: "${origin}"` : 'Origin is required' });
  checks.push({ ok: !!instrument, msg: instrument ? `Instrument: ${instrument}` : 'Instrument is required' });
  checks.push({ ok: !!category, msg: category ? `Category: ${category}` : 'Sound category is required' });

  if (category === 'loop' && !bpm) {
    checks.push({ ok: false, msg: 'BPM is required for loop files' });
  } else if (bpm) {
    const n = parseInt(bpm);
    checks.push({ ok: n >= 40 && n <= 300, msg: n >= 40 && n <= 300 ? `BPM: ${bpm}` : 'BPM seems out of range (40-300)' });
  }

  const isDrum = ['drums', 'cymbals', 'percussion'].includes(instrument.toLowerCase());
  if (!key && !isDrum && instrument) {
    checks.push({ warn: true, msg: 'Key not set — recommended for melodic sounds' });
  } else if (key) {
    checks.push({ ok: true, msg: `Key: ${key}` });
  }

  if (builderDescriptors.length === 0) {
    checks.push({ warn: true, msg: 'No descriptors selected — at least 1 recommended' });
  } else {
    checks.push({ ok: true, msg: `${builderDescriptors.length} descriptor(s): ${builderDescriptors.join(', ')}` });
  }

  if (filename.includes('__')) {
    checks.push({ ok: false, msg: 'Filename contains double underscores — check for empty fields' });
  }

  bValidation.innerHTML = checks.map(c => {
    if (c.warn) return `<div class="validation-item warn"><span class="icon">⚠</span>${c.msg}</div>`;
    return `<div class="validation-item ${c.ok ? 'ok' : 'err'}"><span class="icon">${c.ok ? '✓' : '✗'}</span>${c.msg}</div>`;
  }).join('');
}

function builderUpdateDescriptors() {
  builderDescriptors = [];
  builderUpdateSelectedTagsUI();

  const instrument = bInstrument.value;
  bDescriptorCloud.innerHTML = '';

  const instrDescs = DESCRIPTOR_DATA[instrument] || [];

  if (instrDescs.length > 0) {
    const label = document.createElement('div');
    label.className = 'chip-group-label';
    label.textContent = instrument;
    bDescriptorCloud.appendChild(label);

    instrDescs.forEach(tag => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chip';
      chip.textContent = tag;
      chip.addEventListener('click', () => builderToggleDescriptor(tag, chip));
      bDescriptorCloud.appendChild(chip);
    });
  }

  // Universal (skip duplicates)
  const uniLabel = document.createElement('div');
  uniLabel.className = 'chip-group-label';
  uniLabel.textContent = 'Universal';
  bDescriptorCloud.appendChild(uniLabel);

  UNIVERSAL_DESCRIPTORS.forEach(tag => {
    if (instrDescs.includes(tag)) return;
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip';
    chip.textContent = tag;
    chip.addEventListener('click', () => builderToggleDescriptor(tag, chip));
    bDescriptorCloud.appendChild(chip);
  });

  builderUpdateOutput();
}

function builderToggleDescriptor(tag, chip) {
  const idx = builderDescriptors.indexOf(tag);
  if (idx === -1) {
    builderDescriptors.push(tag);
    chip.classList.add('selected');
  } else {
    builderDescriptors.splice(idx, 1);
    chip.classList.remove('selected');
  }
  builderUpdateSelectedTagsUI();
  builderUpdateOutput();
}

function builderUpdateSelectedTagsUI() {
  if (builderDescriptors.length === 0) {
    bSelectedTags.innerHTML = '<span class="empty-hint">No descriptors selected yet...</span>';
    return;
  }
  bSelectedTags.innerHTML = builderDescriptors.map(tag =>
    `<span class="selected-pill">${tag}<span class="remove-tag" data-tag="${tag}">×</span></span>`
  ).join('');
}

function builderRemoveDescriptor(tag) {
  builderDescriptors = builderDescriptors.filter(d => d !== tag);
  bDescriptorCloud.querySelectorAll('.chip').forEach(el => {
    if (el.textContent === tag) el.classList.remove('selected');
  });
  builderUpdateSelectedTagsUI();
  builderUpdateOutput();
}

function builderCopy() {
  const filename = builderBuildFilename();
  if (!filename || filename.includes('___BPM_REQUIRED___')) return;
  const nameWithoutExt = filename.replace(/\.wav$/, '');
  navigator.clipboard.writeText(nameWithoutExt).then(() => {
    bCopyBtn.textContent = 'COPIED';
    bCopyBtn.classList.add('copied');
    setTimeout(() => { bCopyBtn.textContent = 'COPY'; bCopyBtn.classList.remove('copied'); }, 1500);
  });
}

function builderReset() {
  bPackName.value = '';
  bOrigin.value = '';
  bInstrument.value = '';
  bCategory.value = '';
  bBpm.value = '';
  bKey.value = '';
  bCustomDesc.value = '';
  builderDescriptors = [];
  bDescriptorCloud.innerHTML = '';
  builderUpdateSelectedTagsUI();
  bOutput.textContent = 'Fill in the fields above to generate your filename...';
  bOutput.classList.add('empty');
  bValidation.innerHTML = '';
}

// Builder events
bPackName.addEventListener('input', builderUpdateOutput);
bOrigin.addEventListener('input', builderUpdateOutput);
bInstrument.addEventListener('change', () => { builderUpdateDescriptors(); builderUpdateOutput(); });
bCategory.addEventListener('change', builderUpdateOutput);
bBpm.addEventListener('input', builderUpdateOutput);
bKey.addEventListener('change', builderUpdateOutput);
bCustomDesc.addEventListener('input', builderUpdateOutput);
bCopyBtn.addEventListener('click', builderCopy);
bCopyLarge.addEventListener('click', builderCopy);
bReset.addEventListener('click', builderReset);

bSelectedTags.addEventListener('click', e => {
  const removeBtn = e.target.closest('.remove-tag');
  if (removeBtn) builderRemoveDescriptor(removeBtn.dataset.tag);
});

// Init builder descriptors
builderUpdateDescriptors();


// ============================================================
// FILE DROP MODE
// ============================================================

let fdFiles = [];
let fdIdCounter = 0;

const fdPackName = document.getElementById('fd-pack-name');
const fdOrigin = document.getElementById('fd-origin');
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const browseBtn = document.getElementById('browse-btn');
const fdFilesSection = document.getElementById('fd-files-section');
const fdFileRows = document.getElementById('fd-file-rows');
const fdClearAll = document.getElementById('fd-clear-all');
const complianceBar = document.getElementById('compliance-bar');
const statReady = document.getElementById('stat-ready');
const statErrors = document.getElementById('stat-errors');
const statDuplicates = document.getElementById('stat-duplicates');

function fdGenerateFilename(fileState) {
  const packName = sanitize(fdPackName.value.trim());
  const origin = sanitize(fdOrigin.value.trim());
  const bpm = fileState.bpm || '';
  const instrument = fileState.instrument || '';
  const category = fileState.category || '';
  const key = fileState.key || '';
  const descriptors = (fileState.descriptors || []).join('-');

  return [packName, origin, bpm, instrument, category, key, descriptors]
    .filter(s => s.length > 0)
    .join('_') + '.wav';
}

function fdValidateFile(fileState) {
  const errors = [];
  if (!fdPackName.value.trim()) errors.push('Pack Name');
  if (!fdOrigin.value.trim()) errors.push('Origin');
  if (!fileState.instrument) errors.push('Instrument');
  if (!fileState.category) errors.push('Category');
  if (fileState.category === 'Loop' && !fileState.bpm) errors.push('BPM (required for loops)');
  return errors;
}

function fdCheckDuplicates() {
  const nameCount = {};
  for (const f of fdFiles) {
    const name = fdGenerateFilename(f);
    nameCount[name] = (nameCount[name] || 0) + 1;
  }
  const dupes = new Set();
  for (const [name, count] of Object.entries(nameCount)) {
    if (count > 1) dupes.add(name);
  }
  return dupes;
}

function fdRenderAll() {
  const duplicates = fdCheckDuplicates();

  for (const f of fdFiles) {
    const row = document.getElementById(`row-${f.id}`);
    if (!row) continue;

    const filename = fdGenerateFilename(f);
    const errors = fdValidateFile(f);
    const warnings = (f.descriptors || []).length === 0 ? ['No descriptors selected'] : [];
    const isDuplicate = duplicates.has(filename);

    const outputEl = row.querySelector('.file-row-output');
    const filenameEl = row.querySelector('.output-filename');
    const validationEl = row.querySelector('.validation-msg');
    const warningEl = row.querySelector('.warning-msg');
    const copyBtn = row.querySelector('.btn-copy');

    filenameEl.textContent = filename;
    outputEl.classList.toggle('has-duplicate', isDuplicate);

    if (errors.length > 0) {
      validationEl.textContent = 'Missing: ' + errors.join(', ');
      copyBtn.disabled = true;
    } else {
      validationEl.textContent = '';
      copyBtn.disabled = false;
    }

    warningEl.textContent = warnings.length > 0 ? warnings.join(', ') : '';
  }

  fdUpdateCompliance(duplicates);
}

function fdUpdateCompliance(duplicates) {
  if (fdFiles.length === 0) {
    complianceBar.hidden = true;
    return;
  }
  complianceBar.hidden = false;

  let ready = 0;
  let errored = 0;
  const dupSet = new Set();

  for (const f of fdFiles) {
    const errors = fdValidateFile(f);
    const filename = fdGenerateFilename(f);
    if (errors.length > 0) errored++;
    else ready++;
    if (duplicates.has(filename)) dupSet.add(f.id);
  }
  const dupeCount = dupSet.size;

  statReady.textContent = `${ready} file${ready !== 1 ? 's' : ''} ready`;
  statErrors.textContent = `${errored} missing fields`;
  statDuplicates.textContent = `${dupeCount} duplicate${dupeCount !== 1 ? 's' : ''}`;

  statReady.classList.toggle('hidden', ready === 0);
  statErrors.classList.toggle('hidden', errored === 0);
  statDuplicates.classList.toggle('hidden', dupeCount === 0);

  if (errored === 0 && dupeCount === 0 && ready > 0) {
    statReady.textContent = `All ${ready} file${ready !== 1 ? 's' : ''} ready`;
  }
}

function fdBuildDescriptorChips(fileState, container) {
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
        const idx = fileState.descriptors.indexOf(tag);
        if (idx === -1) fileState.descriptors.push(tag);
        else fileState.descriptors.splice(idx, 1);
        chip.classList.toggle('selected');
        fdRenderAll();
      });
      container.appendChild(chip);
    }
  }

  const uniLabel = document.createElement('div');
  uniLabel.className = 'chip-group-label';
  uniLabel.textContent = 'Universal';
  container.appendChild(uniLabel);

  for (const tag of UNIVERSAL_DESCRIPTORS) {
    if (instrumentTags.includes(tag)) continue;
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip';
    chip.textContent = tag;
    if (fileState.descriptors.includes(tag)) chip.classList.add('selected');
    chip.addEventListener('click', () => {
      const idx = fileState.descriptors.indexOf(tag);
      if (idx === -1) fileState.descriptors.push(tag);
      else fileState.descriptors.splice(idx, 1);
      chip.classList.toggle('selected');
      fdRenderAll();
    });
    container.appendChild(chip);
  }
}

function fdCreateFileRow(fileState) {
  const row = document.createElement('div');
  row.className = 'file-row';
  row.id = `row-${fileState.id}`;

  const instrumentOptions = VALID_INSTRUMENTS.map(i =>
    `<option value="${i}" ${fileState.instrument === i ? 'selected' : ''}>${i}</option>`
  ).join('');

  const keyOptions = VALID_KEYS.map(k =>
    `<option value="${k}" ${fileState.key === k ? 'selected' : ''}>${k}</option>`
  ).join('');

  row.innerHTML = `
    <div class="file-row-top">
      <div class="file-row-original">${fileState.originalName}</div>
      <button type="button" class="btn-remove" title="Remove file">×</button>
    </div>
    <div class="file-row-fields">
      <div class="field">
        <label>INSTRUMENT</label>
        <select class="input-instrument">
          <option value="">—</option>
          ${instrumentOptions}
        </select>
      </div>
      <div class="field">
        <label>CATEGORY</label>
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
        <label>KEY</label>
        <select class="input-key">
          <option value="">—</option>
          ${keyOptions}
        </select>
      </div>
      <div class="field"></div>
    </div>
    <div class="descriptors-area">
      <div class="field">
        <label>DESCRIPTORS</label>
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

  const instrumentSelect = row.querySelector('.input-instrument');
  const categorySelect = row.querySelector('.input-category');
  const bpmInput = row.querySelector('.input-bpm');
  const keySelect = row.querySelector('.input-key');
  const copyBtn = row.querySelector('.btn-copy');
  const removeBtn = row.querySelector('.btn-remove');
  const chipsContainer = row.querySelector(`#chips-${fileState.id}`);

  instrumentSelect.addEventListener('change', () => {
    fileState.instrument = instrumentSelect.value;
    const validTags = getValidDescriptors(fileState.instrument);
    fileState.descriptors = fileState.descriptors.filter(d => validTags.includes(d));
    fdBuildDescriptorChips(fileState, chipsContainer);
    fdRenderAll();
  });

  categorySelect.addEventListener('change', () => {
    fileState.category = categorySelect.value;
    fdRenderAll();
  });

  bpmInput.addEventListener('input', () => {
    fileState.bpm = bpmInput.value;
    fdRenderAll();
  });

  keySelect.addEventListener('change', () => {
    fileState.key = keySelect.value;
    fdRenderAll();
  });

  copyBtn.addEventListener('click', () => {
    const filename = fdGenerateFilename(fileState);
    navigator.clipboard.writeText(filename.replace(/\.wav$/, '')).then(() => {
      copyBtn.textContent = 'COPIED';
      copyBtn.classList.add('copied');
      setTimeout(() => { copyBtn.textContent = 'COPY'; copyBtn.classList.remove('copied'); }, 1500);
    });
  });

  removeBtn.addEventListener('click', () => {
    fdFiles = fdFiles.filter(f => f.id !== fileState.id);
    row.remove();
    if (fdFiles.length === 0) fdFilesSection.hidden = true;
    fdRenderAll();
  });

  fdBuildDescriptorChips(fileState, chipsContainer);
  return row;
}

function getValidDescriptors(instrument) {
  const instrumentTags = instrument && DESCRIPTOR_DATA[instrument] ? DESCRIPTOR_DATA[instrument] : [];
  return [...instrumentTags, ...UNIVERSAL_DESCRIPTORS];
}

function fdHandleFiles(fileList) {
  const wavFiles = Array.from(fileList).filter(f => f.name.toLowerCase().endsWith('.wav'));
  if (wavFiles.length === 0) return;

  for (const file of wavFiles) {
    const parsed = parseFilename(file.name);
    const fileState = {
      id: fdIdCounter++,
      originalName: file.name,
      instrument: parsed.instrument,
      category: parsed.category,
      bpm: parsed.bpm,
      key: parsed.key,
      descriptors: []
    };
    fdFiles.push(fileState);
    fdFileRows.appendChild(fdCreateFileRow(fileState));
  }

  fdFilesSection.hidden = false;
  fdRenderAll();
}

// File drop events
dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
dropZone.addEventListener('dragleave', e => { e.preventDefault(); dropZone.classList.remove('drag-over'); });
dropZone.addEventListener('drop', e => { e.preventDefault(); dropZone.classList.remove('drag-over'); fdHandleFiles(e.dataTransfer.files); });
dropZone.addEventListener('click', () => fileInput.click());
browseBtn.addEventListener('click', e => { e.stopPropagation(); fileInput.click(); });
fileInput.addEventListener('change', () => { fdHandleFiles(fileInput.files); fileInput.value = ''; });
fdPackName.addEventListener('input', fdRenderAll);
fdOrigin.addEventListener('input', fdRenderAll);
fdClearAll.addEventListener('click', () => {
  fdFiles = [];
  fdIdCounter = 0;
  fdFileRows.innerHTML = '';
  fdFilesSection.hidden = true;
  complianceBar.hidden = true;
});


// ============================================================
// BULK RENAMER
// ============================================================

const bulkPack = document.getElementById('bulk-pack');
const bulkOrigin = document.getElementById('bulk-origin');
const bulkInput = document.getElementById('bulk-input');
const bulkResults = document.getElementById('bulk-results');
const bulkCopy = document.getElementById('bulk-copy');
const bulkClear = document.getElementById('bulk-clear');

function runBulk() {
  const lines = bulkInput.value.trim().split('\n').filter(Boolean);
  const pack = bulkPack.value.trim();
  const origin = bulkOrigin.value.trim();

  if (!lines.length) { bulkResults.innerHTML = ''; return; }

  bulkResults.innerHTML = lines.map(line => {
    const original = line.trim();
    const renamed = bulkAttemptRename(original, pack, origin);
    const hasError = renamed.startsWith('⚠');
    return `<div class="bulk-row ${hasError ? 'has-error' : ''}">
      <div class="original">${original}</div>
      <div class="arrow">→</div>
      <div class="renamed ${hasError ? 'error' : ''}">${renamed}</div>
    </div>`;
  }).join('');
}

function bulkAttemptRename(filename, pack, origin) {
  if (!pack || !origin) return '⚠ Set pack name and origin above';

  const base = filename.replace(/\.wav$/i, '');
  const tokens = base.split(/[\s_]+/).map(t => t.toLowerCase().trim()).filter(Boolean);

  // Category
  let category = '';
  if (tokens.some(t => t.includes('loop'))) category = 'loop';
  else if (tokens.some(t => ['one-shot', 'oneshot', 'shot'].includes(t))) category = 'one-shot';
  else if (tokens.some(t => ONESHOT_WORDS.includes(t))) category = 'one-shot';

  // BPM
  let bpm = '';
  const bpmMatch = base.match(/\b(\d{2,3})(?:bpm)?\b/i);
  if (bpmMatch) {
    const n = parseInt(bpmMatch[1]);
    if (n >= 40 && n <= 300) bpm = String(n);
  }

  // Instrument
  let instrument = '';
  for (const token of tokens) {
    if (INSTRUMENT_MAP[token]) { instrument = INSTRUMENT_MAP[token].toLowerCase(); break; }
  }
  if (!instrument) return '⚠ Could not detect instrument — rename manually';
  if (!category) return '⚠ Could not detect category (loop/one-shot) — rename manually';

  // Key
  let key = '';
  const keyMatch = base.match(/\b([A-Ga-g][#b]?m?)\b/);
  if (keyMatch) {
    const candidate = keyMatch[1].charAt(0).toUpperCase() + keyMatch[1].slice(1);
    if (VALID_KEYS.includes(candidate)) key = candidate;
  }

  const parts = [sanitize(pack), sanitize(origin)];
  if (bpm) parts.push(bpm);
  parts.push(instrument);
  parts.push(category);
  if (key) parts.push(key);

  return parts.join('_') + '.wav';
}

bulkPack.addEventListener('input', runBulk);
bulkOrigin.addEventListener('input', runBulk);
bulkInput.addEventListener('input', runBulk);
bulkClear.addEventListener('click', () => { bulkInput.value = ''; bulkResults.innerHTML = ''; });
bulkCopy.addEventListener('click', () => {
  const rows = bulkResults.querySelectorAll('.renamed:not(.error)');
  const lines = [...rows].map(r => r.textContent).join('\n');
  if (lines) navigator.clipboard.writeText(lines);
});


// ============================================================
// VALIDATOR
// ============================================================

const validateInput = document.getElementById('validate-input');
const validateResults = document.getElementById('validate-results');

function runValidation() {
  const input = validateInput.value.trim();
  if (!input) { validateResults.innerHTML = ''; return; }

  const filename = input;
  const base = filename.replace(/\.wav$/i, '');
  const parts = base.split('_');
  const checks = [];

  checks.push({ ok: filename.toLowerCase().endsWith('.wav'), msg: '.wav extension present' });
  checks.push({ ok: parts.length >= 4, msg: parts.length >= 4 ? `Has ${parts.length} segments` : 'Too few segments — need at least: pack_origin_instrument_category' });
  checks.push({ ok: !filename.includes('__'), msg: filename.includes('__') ? 'Double underscores found' : 'No double underscores' });
  checks.push({ ok: !filename.includes(' '), msg: filename.includes(' ') ? 'Spaces found in filename' : 'No spaces in filename' });

  const invalidChars = filename.replace('.wav', '').match(/[^A-Za-z0-9!\-_.'()#]/g);
  checks.push({ ok: !invalidChars, msg: invalidChars ? `Invalid characters: ${[...new Set(invalidChars)].join(' ')}` : 'All characters valid' });

  let hasValidInstrument = false;
  parts.forEach(p => {
    if (VALID_INSTRUMENTS_LOWER.includes(p.toLowerCase())) hasValidInstrument = true;
  });
  checks.push({ ok: hasValidInstrument, msg: hasValidInstrument ? 'Valid instrument tag found' : `No valid instrument tag. Expected: ${VALID_INSTRUMENTS.join(', ')}` });

  const hasCategory = parts.some(p => ['loop', 'one-shot'].includes(p.toLowerCase()));
  checks.push({ ok: hasCategory, msg: hasCategory ? 'Category (loop/one-shot) present' : 'Missing category — must include "loop" or "one-shot"' });

  const isLoop = parts.some(p => p.toLowerCase() === 'loop');
  const hasBpm = parts.some(p => /^\d{2,3}$/.test(p) && parseInt(p) >= 40 && parseInt(p) <= 300);
  if (isLoop) {
    checks.push({ ok: hasBpm, msg: hasBpm ? 'BPM found for loop' : 'Loop files require a BPM value' });
  }

  validateResults.innerHTML = checks.map(c =>
    `<div class="validation-item ${c.ok ? 'ok' : 'err'}"><span class="icon">${c.ok ? '✓' : '✗'}</span>${c.msg}</div>`
  ).join('');
}

validateInput.addEventListener('input', runValidation);
