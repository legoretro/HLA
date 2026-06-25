import './author.css';
import sourceChapters from '../content/chapters.json';

let chapters = structuredClone(sourceChapters);
let currentIndex = 0;

const $ = id => document.getElementById(id);
const base = import.meta.env.BASE_URL || './';
const presenters = ['team', 'scientist-1', 'scientist-2', 'scientist-3', 'scientist-4'];
const popupSpeakers = ['scientist-1', 'scientist-2', 'scientist-3', 'scientist-4'];
const backgrounds = [
  'bg-pixel-lab',
  'bg-room-shell',
  'bg-main-lab',
  'bg-hospital',
  'bg-immune-system',
  'bg-chromosome-6',
  'bg-organ-case',
  'bg-molecular-lab'
];
const icons = [
  'icon-welcome',
  'icon-cell-id',
  'icon-chromosome',
  'icon-class-i',
  'icon-class-ii',
  'icon-family',
  'icon-kidney',
  'icon-dna-tube',
  'icon-pcr',
  'icon-analyzer',
  'icon-match',
  'icon-rejection'
];
const propAssets = [
  'lab-bench',
  'pcr-machine',
  'hla-analyzer',
  'sample-tubes',
  'microscope',
  'chromosome-6',
  'class-i-cell',
  'class-ii-apc',
  'family-map',
  'kidney-cooler',
  'dna-helix',
  'allele-report',
  'report-printer'
];
const actions = ['idle', 'walk', 'talk', 'point', 'celebrate'];
const interactionTypes = ['', 'progress', 'compare', 'final', 'reveal'];

function publicAsset(path) {
  return `${base}${path.replace(/^\//, '')}`;
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function optionList(values, selected) {
  return values.map(value => `<option value="${escapeHtml(value)}" ${value === selected ? 'selected' : ''}>${escapeHtml(value)}</option>`).join('');
}

function numberValue(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function fitPreview() {
  const shell = $('previewScale');
  const scale = Math.min(shell.clientWidth / 1280, shell.clientHeight / 720 || 1);
  $('previewCanvas').style.transform = `scale(${scale})`;
}

function normalizeNumbers() {
  chapters.forEach((chapter, index) => {
    chapter.number = index + 1;
  });
}

function refreshSelect() {
  $('chapterSelect').innerHTML = chapters.map((chapter, index) =>
    `<option value="${index}">${index + 1}. ${escapeHtml(chapter.title)}</option>`
  ).join('');
  $('chapterSelect').value = String(currentIndex);
}

function fillOptions() {
  $('presenter').innerHTML = optionList(presenters, presenters[0]);
  $('background').innerHTML = optionList(backgrounds, backgrounds[0]);
  $('timelineIcon').innerHTML = optionList(icons, icons[0]);
  $('interactionType').innerHTML = optionList(interactionTypes, '');
}

function chapter() {
  return chapters[currentIndex];
}

function bindFields() {
  const c = chapter();
  $('chapterTitle').value = c.title || '';
  $('shortLabel').value = c.shortLabel || '';
  $('presenter').value = c.presenter || 'scientist-1';
  $('speaker').value = c.dialogue?.speaker || '';
  $('dialogue').value = c.dialogue?.text || '';
  $('background').value = c.background || 'bg-room-shell';
  $('timelineIcon').value = c.timelineIcon || 'icon-welcome';
  $('interactionType').value = c.interaction?.type || '';
  $('interactionButton').value = c.interaction?.button || '';
  $('interactionResult').value = c.interaction?.result || '';
  renderAllControls();
  renderPreview();
}

function updateFromFields() {
  const c = chapter();
  c.title = $('chapterTitle').value;
  c.shortLabel = $('shortLabel').value;
  c.presenter = $('presenter').value;
  c.dialogue ||= {};
  c.dialogue.speaker = $('speaker').value;
  c.dialogue.text = $('dialogue').value;
  c.background = $('background').value;
  c.timelineIcon = $('timelineIcon').value;

  if ($('interactionType').value) {
    c.interaction = {
      type: $('interactionType').value,
      button: $('interactionButton').value,
      result: $('interactionResult').value
    };
  } else {
    delete c.interaction;
  }

  refreshSelect();
  renderPreview();
}

function renderAllControls() {
  renderPopupControls();
  renderCardControls();
  renderPropControls();
  renderCharacterControls();
}

function renderPopupControls() {
  const c = chapter();
  c.infoPopups ||= [];
  $('popupControls').innerHTML = c.infoPopups.map((popup, index) => `
    <div class="control-card" data-popup="${index}">
      <strong>Popup ${index + 1}</strong>
      <label>Title<input data-group="popup" data-i="${index}" data-k="title" value="${escapeHtml(popup.title || '')}"></label>
      <label>Caption<textarea rows="4" data-group="popup" data-i="${index}" data-k="text">${escapeHtml(popup.text || '')}</textarea></label>
      <label>Audio path<input data-group="popup" data-i="${index}" data-k="audio" value="${escapeHtml(popup.audio || '')}"></label>
      <div class="control-grid">
        <label>Speaker<select data-group="popup" data-i="${index}" data-k="speaker">${optionList(popupSpeakers, popup.speaker || (c.presenter === 'team' ? 'scientist-1' : c.presenter))}</select></label>
        <label>X<input type="number" data-group="popup" data-i="${index}" data-k="x" value="${popup.x ?? 1000}"></label>
        <label>Y<input type="number" data-group="popup" data-i="${index}" data-k="y" value="${popup.y ?? 240}"></label>
      </div>
      <button class="danger" data-remove-popup="${index}">Remove Popup</button>
    </div>
  `).join('');

  bindGroupInputs('popup', (index, key, value) => {
    const popup = chapter().infoPopups[index];
    popup[key] = ['x', 'y'].includes(key) ? numberValue(value, popup[key]) : value;
  });
  bindRemoveButtons('removePopup', '[data-remove-popup]', index => {
    chapter().infoPopups.splice(index, 1);
  });
}

function renderCardControls() {
  const c = chapter();
  c.cards ||= [];
  $('cardControls').innerHTML = c.cards.map((card, index) => `
    <div class="control-card" data-card="${index}">
      <strong>Card ${index + 1}</strong>
      <label>Title<input data-group="card" data-i="${index}" data-k="title" value="${escapeHtml(card.title || '')}"></label>
      <label>Text<textarea rows="4" data-group="card" data-i="${index}" data-k="text">${escapeHtml(card.text || '')}</textarea></label>
      <div class="control-grid">
        <label>X<input type="number" data-group="card" data-i="${index}" data-k="x" value="${card.x ?? 640}"></label>
        <label>Y<input type="number" data-group="card" data-i="${index}" data-k="y" value="${card.y ?? 240}"></label>
        <label>Width<input type="number" data-group="card" data-i="${index}" data-k="width" value="${card.width ?? 320}"></label>
        <label>Height<input type="number" data-group="card" data-i="${index}" data-k="height" value="${card.height ?? 110}"></label>
      </div>
      <button class="danger" data-remove-card="${index}">Remove Card</button>
    </div>
  `).join('');

  bindGroupInputs('card', (index, key, value) => {
    const card = chapter().cards[index];
    card[key] = ['x', 'y', 'width', 'height'].includes(key) ? numberValue(value, card[key]) : value;
  });
  bindRemoveButtons('removeCard', '[data-remove-card]', index => {
    chapter().cards.splice(index, 1);
  });
}

function renderPropControls() {
  const c = chapter();
  c.props ||= [];
  $('propControls').innerHTML = c.props.map((prop, index) => `
    <div class="control-card" data-prop="${index}">
      <strong>Prop ${index + 1}</strong>
      <label>Asset<select data-group="prop" data-i="${index}" data-k="asset">${optionList(propAssets, prop.asset || propAssets[0])}</select></label>
      <div class="control-grid">
        <label>X<input type="number" data-group="prop" data-i="${index}" data-k="x" value="${prop.x ?? 640}"></label>
        <label>Y<input type="number" data-group="prop" data-i="${index}" data-k="y" value="${prop.y ?? 300}"></label>
        <label>Scale<input type="number" step="0.05" data-group="prop" data-i="${index}" data-k="scale" value="${prop.scale ?? 1}"></label>
        <label>Depth<input type="number" data-group="prop" data-i="${index}" data-k="depth" value="${prop.depth ?? 3}"></label>
      </div>
      <button class="danger" data-remove-prop="${index}">Remove Prop</button>
    </div>
  `).join('');

  bindGroupInputs('prop', (index, key, value) => {
    const prop = chapter().props[index];
    prop[key] = key === 'asset' ? value : numberValue(value, prop[key]);
  });
  bindRemoveButtons('removeProp', '[data-remove-prop]', index => {
    chapter().props.splice(index, 1);
  });
}

function renderCharacterControls() {
  const c = chapter();
  $('characterControls').innerHTML = (c.characters || []).map((character, index) => `
    <div class="control-card" data-character="${index}">
      <strong>${escapeHtml(character.asset || `scientist-${index + 1}`)}</strong>
      <div class="control-grid">
        <label>X<input type="number" data-group="character" data-i="${index}" data-k="x" value="${character.x ?? 640}"></label>
        <label>Y<input type="number" data-group="character" data-i="${index}" data-k="y" value="${character.y ?? 455}"></label>
        <label>Scale<input type="number" step="0.05" data-group="character" data-i="${index}" data-k="scale" value="${character.scale ?? 0.48}"></label>
        <label>Depth<input type="number" data-group="character" data-i="${index}" data-k="depth" value="${character.depth ?? ''}"></label>
        <label>Action<select data-group="character" data-i="${index}" data-k="action">${optionList(actions, character.action || 'idle')}</select></label>
      </div>
    </div>
  `).join('');

  bindGroupInputs('character', (index, key, value) => {
    const character = chapter().characters[index];
    if (key === 'action') {
      character[key] = value;
    } else if (key === 'depth' && value === '') {
      delete character.depth;
    } else {
      character[key] = numberValue(value, character[key]);
    }
  });
}

function bindGroupInputs(group, updater) {
  document.querySelectorAll(`[data-group="${group}"]`).forEach(input => {
    input.addEventListener('input', event => {
      updater(Number(input.dataset.i), input.dataset.k, event.target.value);
      renderPreview();
    });
  });
}

function bindRemoveButtons(name, selector, remove) {
  document.querySelectorAll(selector).forEach(button => {
    button.addEventListener('click', () => {
      remove(Number(button.dataset[name]));
      renderAllControls();
      renderPreview();
    });
  });
}

function renderPreview() {
  const c = chapter();
  $('previewBackground').src = publicAsset(`assets/backgrounds/${c.background}.png`);
  renderPreviewCards(c);
  renderPreviewProps(c);
  renderPreviewInfo(c);
  renderPreviewCharacters(c);
  renderPreviewDialogue(c);
  renderPreviewInteraction(c);
  renderPreviewPath();
}

function renderPreviewCards(c) {
  const wrap = $('previewCards');
  wrap.innerHTML = '';
  (c.cards || []).forEach((card, index) => {
    const el = document.createElement('div');
    el.className = 'preview-card';
    el.style.left = `${(card.x ?? 640) - (card.width ?? 320) / 2}px`;
    el.style.top = `${(card.y ?? 240) - (card.height ?? 110) / 2}px`;
    el.style.width = `${card.width ?? 320}px`;
    el.style.height = `${card.height ?? 110}px`;
    el.innerHTML = `<strong>${escapeHtml(card.title || '')}</strong><span>${escapeHtml(card.text || '')}</span>`;
    makeDraggable(el, x => {
      card.x = Math.round(x.x);
      card.y = Math.round(x.y);
      el.style.left = `${card.x - (card.width ?? 320) / 2}px`;
      el.style.top = `${card.y - (card.height ?? 110) / 2}px`;
    });
    wrap.appendChild(el);
  });
}

function renderPreviewProps(c) {
  const wrap = $('previewProps');
  wrap.innerHTML = '';
  (c.props || []).forEach(prop => {
    const img = document.createElement('img');
    img.className = 'preview-prop';
    img.src = publicAsset(`assets/props/${prop.asset}.png`);
    img.style.left = `${prop.x ?? 640}px`;
    img.style.top = `${prop.y ?? 300}px`;
    img.style.width = `${Math.max(28, 120 * (prop.scale ?? 1))}px`;
    img.style.transform = 'translate(-50%, -50%)';
    img.style.zIndex = String(prop.depth ?? 3);
    makeDraggable(img, point => {
      prop.x = Math.round(point.x);
      prop.y = Math.round(point.y);
      img.style.left = `${prop.x}px`;
      img.style.top = `${prop.y}px`;
    });
    wrap.appendChild(img);
  });
}

function renderPreviewInfo(c) {
  const wrap = $('previewInfoIcons');
  wrap.innerHTML = '';
  (c.infoPopups || []).forEach((popup, index) => {
    const el = document.createElement('div');
    el.className = 'preview-info';
    el.textContent = index + 1;
    el.style.left = `${popup.x ?? 1000}px`;
    el.style.top = `${popup.y ?? 240}px`;
    el.style.transform = 'translate(-50%, -50%)';
    makeDraggable(el, point => {
      popup.x = Math.round(point.x);
      popup.y = Math.round(point.y);
      el.style.left = `${popup.x}px`;
      el.style.top = `${popup.y}px`;
    });
    wrap.appendChild(el);
  });
}

function renderPreviewCharacters(c) {
  const wrap = $('previewCharacters');
  wrap.innerHTML = '';
  (c.characters || []).forEach(character => {
    const img = document.createElement('img');
    img.className = 'preview-character';
    img.src = publicAsset(`assets/characters/${character.asset}.png`);
    const width = Math.max(46, 128 * (character.scale ?? 0.48));
    img.style.width = `${width}px`;
    img.style.left = `${(character.x ?? 640) - width / 2}px`;
    img.style.top = `${(character.y ?? 455) - width * 1.5}px`;
    img.style.zIndex = String(character.depth ?? (character.asset === c.presenter ? 7 : 5));
    makeDraggable(img, point => {
      character.x = Math.round(point.x);
      character.y = Math.round(point.y);
      img.style.left = `${character.x - width / 2}px`;
      img.style.top = `${character.y - width * 1.5}px`;
    });
    wrap.appendChild(img);
  });
}

function renderPreviewDialogue(c) {
  const portrait = c.presenter === 'team'
    ? ['scientist-1', 'scientist-2', 'scientist-3', 'scientist-4'].map((asset, index) =>
        `<img style="left:${12 + index * 28}px;width:42px;" src="${publicAsset(`assets/characters/${asset}.png`)}" alt="">`
      ).join('')
    : `<img src="${publicAsset(`assets/characters/${c.presenter}.png`)}" alt="">`;
  $('previewDialogue').innerHTML = `
    ${portrait}
    <strong>${escapeHtml(c.dialogue?.speaker || '')}</strong><br>
    ${escapeHtml(c.dialogue?.text || '')}
  `;
}

function renderPreviewInteraction(c) {
  if (!c.interaction) {
    $('previewInteraction').style.display = 'none';
    $('previewInteraction').textContent = '';
    return;
  }
  $('previewInteraction').style.display = 'block';
  $('previewInteraction').innerHTML = `${escapeHtml(c.interaction.button || '')}<br><small>${escapeHtml(c.interaction.result || '')}</small>`;
}

function renderPreviewPath() {
  const path = $('previewPath');
  path.innerHTML = '';
  const gap = chapters.length > 1 ? 1096 / (chapters.length - 1) : 0;
  chapters.forEach((item, index) => {
    const x = 88 + index * gap;
    const node = document.createElement('div');
    node.className = `path-node ${index === currentIndex ? 'current' : ''}`;
    node.style.left = `${x}px`;
    node.innerHTML = `<img src="${publicAsset(`assets/icons/${item.timelineIcon}.png`)}" alt="">`;
    const label = document.createElement('div');
    label.className = 'path-label';
    label.style.left = `${x}px`;
    label.textContent = `${index + 1} ${item.shortLabel || ''}`;
    path.appendChild(node);
    path.appendChild(label);
  });
}

function makeDraggable(el, onMove) {
  let dragging = false;
  el.addEventListener('pointerdown', event => {
    dragging = true;
    el.setPointerCapture(event.pointerId);
  });
  el.addEventListener('pointermove', event => {
    if (!dragging) return;
    const rect = $('previewCanvas').getBoundingClientRect();
    const x = (event.clientX - rect.left) * (1280 / rect.width);
    const y = (event.clientY - rect.top) * (720 / rect.height);
    onMove({ x, y });
  });
  el.addEventListener('pointerup', () => {
    dragging = false;
    renderAllControls();
  });
}

function addDefaultCharacterSet() {
  return presenters.map((asset, index) => ({
    asset,
    sprite: `${asset}-sheet`,
    x: 370 + index * 120,
    y: 452,
    scale: 0.45,
    action: index === 0 ? 'talk' : 'idle'
  }));
}

$('chapterSelect').addEventListener('change', event => {
  currentIndex = Number(event.target.value);
  bindFields();
});

['chapterTitle', 'shortLabel', 'presenter', 'speaker', 'dialogue', 'background', 'timelineIcon', 'interactionType', 'interactionButton', 'interactionResult']
  .forEach(id => $(id).addEventListener('input', updateFromFields));

$('addChapter').addEventListener('click', () => {
  const copy = structuredClone(chapter());
  copy.id = `chapter-${Date.now()}`;
  copy.title = 'New HLA Scene';
  copy.shortLabel = 'NEW';
  copy.characters ||= addDefaultCharacterSet();
  chapters.splice(currentIndex + 1, 0, copy);
  currentIndex += 1;
  normalizeNumbers();
  refreshSelect();
  bindFields();
});

$('duplicateChapter').addEventListener('click', () => {
  const copy = structuredClone(chapter());
  copy.id = `${copy.id || 'chapter'}-copy-${Date.now()}`;
  copy.title = `${copy.title || 'Scene'} Copy`;
  chapters.splice(currentIndex + 1, 0, copy);
  currentIndex += 1;
  normalizeNumbers();
  refreshSelect();
  bindFields();
});

$('deleteChapter').addEventListener('click', () => {
  if (chapters.length <= 1) return;
  chapters.splice(currentIndex, 1);
  currentIndex = Math.max(0, currentIndex - 1);
  normalizeNumbers();
  refreshSelect();
  bindFields();
});

$('moveUp').addEventListener('click', () => {
  if (currentIndex === 0) return;
  [chapters[currentIndex - 1], chapters[currentIndex]] = [chapters[currentIndex], chapters[currentIndex - 1]];
  currentIndex -= 1;
  normalizeNumbers();
  refreshSelect();
  bindFields();
});

$('moveDown').addEventListener('click', () => {
  if (currentIndex >= chapters.length - 1) return;
  [chapters[currentIndex + 1], chapters[currentIndex]] = [chapters[currentIndex], chapters[currentIndex + 1]];
  currentIndex += 1;
  normalizeNumbers();
  refreshSelect();
  bindFields();
});

$('addPopup').addEventListener('click', () => {
  chapter().infoPopups ||= [];
  const speaker = chapter().presenter === 'team' ? 'scientist-1' : (chapter().presenter || 'scientist-1');
  chapter().infoPopups.push({
    speaker,
    title: 'New Info',
    text: 'Caption text stays visible even when audio is missing.',
    audio: `/assets/audio/${speaker}/new-info.mp3`,
    x: 1000,
    y: 240
  });
  renderAllControls();
  renderPreview();
});

$('addCard').addEventListener('click', () => {
  chapter().cards ||= [];
  chapter().cards.push({ title: 'New Card', text: 'Editable card text', x: 640, y: 240, width: 320, height: 110 });
  renderAllControls();
  renderPreview();
});

$('addProp').addEventListener('click', () => {
  chapter().props ||= [];
  chapter().props.push({ asset: 'sample-tubes', x: 640, y: 320, scale: 0.7, depth: 3 });
  renderAllControls();
  renderPreview();
});

$('exportJson').addEventListener('click', () => {
  normalizeNumbers();
  const blob = new Blob([JSON.stringify(chapters, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'chapters.json';
  a.click();
  URL.revokeObjectURL(a.href);
});

fillOptions();
refreshSelect();
bindFields();
fitPreview();
window.addEventListener('resize', fitPreview);
