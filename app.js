const seeds=[{id:'earth',title:'A little greener, together',headline:'THERE IS NO PLANET B.',category:'Environment',color:'#cce784',symbol:'✿',desc:'Stand with a greener future. Every small action adds up.'},{id:'community',title:'Better when we belong',headline:'YOU BELONG HERE.',category:'Community',color:'#c3b3ed',symbol:'☺',desc:'Celebrate the people who make your community feel like home.'},{id:'learning',title:'Every mind deserves a chance',headline:'LET CURIOSITY GROW.',category:'Education',color:'#f1bb79',symbol:'✹',desc:'Show your support for learning opportunities for everyone.'},{id:'kindness',title:'Make kindness your thing',headline:'A LITTLE KINDNESS GOES FAR.',category:'Health',color:'#efb7c5',symbol:'♡',desc:'Start a conversation about care, compassion, and wellbeing.'},{id:'celebrate',title:'Here’s to all of us',headline:'GOOD TIMES. GREAT PEOPLE.',category:'Celebrations',color:'#abd9ed',symbol:'✦',desc:'Celebrate your milestones with the people who got you here.'},{id:'ocean',title:'Keep our oceans blue',headline:'MAKE WAVES FOR GOOD.',category:'Environment',color:'#83cec1',symbol:'≈',desc:'Put ocean conservation in the picture and show your support.'},{id:'read',title:'Open a book, open a world',headline:'BIG DREAMS START HERE.',category:'Education',color:'#e2cba1',symbol:'✳',desc:'Support literacy and a world full of possibility.'},{id:'together',title:'Stronger side by side',headline:'MORE US. MORE POSSIBLE.',category:'Community',color:'#d0dfb1',symbol:'☻',desc:'Bring your team together around something that matters.'}];
seeds.unshift({
  id: 'jashn-e-rang-2026',
  title: 'ജഷ്ൻ എ രംഗ് 2026',
  headline: 'JASHN-E RANG 2026',
  category: 'Celebrations',
  color: '#ff006e',
  symbol: '✦',
  desc: 'ജഷ്ൻ എ രംഗ് 2026 · നവംബർ 4, 5, 6, 7. നിങ്ങളുടെ ഫോട്ടോ ചേർത്ത് ക്യാമ്പെയ്‌നിന്റെ ഭാഗമാകൂ.',
  frame: 'assets/jashn-e-rang-2026-v2.png'
});
const $ = selector => document.querySelector(selector);
const editor = $('#editor'), creator = $('#creator'), canvas = $('#canvas');
const ctx = canvas.getContext('2d'), SIZE = canvas.width;
const categories = ['All campaigns', 'Environment', 'Community', 'Education', 'Celebrations', 'Health'];
const STORAGE_KEY = 'framefolk-campaigns';
let saved = [], category = 'All campaigns', selected, photoImage = null, frameImage = null;
let editorVersion = 0, photoVersion = 0, frameLoading = false, creating = false, exporting = false;
let drag = null;

const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[char]));
const validFrame = value => typeof value === 'string' && /^data:image\/(png|webp);base64,[A-Za-z0-9+/=\s]+$/.test(value);

function restoreCampaigns() {
  try {
    const items = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (!Array.isArray(items)) return [];
    const ids = new Set(seeds.map(c => c.id));
    return items.filter(c => {
      if (!c || typeof c.id !== 'string' || ids.has(c.id) || !c.id.startsWith('custom-') ||
          typeof c.title !== 'string' || typeof c.desc !== 'string' ||
          !categories.slice(1).includes(c.category) || !/^#[0-9a-f]{6}$/i.test(c.color) ||
          (c.frame && !validFrame(c.frame))) return false;
      ids.add(c.id);
      return true;
    }).map(c => ({...c, title: c.title.slice(0, 42), desc: c.desc.slice(0, 220),
      headline: c.title.slice(0, 42).toUpperCase(), symbol: '✦'}));
  } catch { return []; }
}
saved = restoreCampaigns();
let campaigns = [...saved, ...seeds];

function selectCategory(value) {
  category = value;
  document.querySelectorAll('#filters button').forEach(b => {
    const active = b.textContent === value;
    b.classList.toggle('active', active);
    b.setAttribute('aria-pressed', String(active));
  });
}
categories.forEach(value => {
  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = value;
  b.onclick = () => { selectCategory(value); render(); };
  $('#filters').append(b);
});
selectCategory(category);

function render() {
  const q = $('#search').value.trim().toLowerCase();
  const list = campaigns.filter(c => (category === 'All campaigns' || c.category === category) &&
    (c.title + ' ' + c.desc + ' ' + c.category).toLowerCase().includes(q));
  if ($('#sort').value === 'az') list.sort((a, b) => a.title.localeCompare(b.title));
  if ($('#sort').value === 'newest') list.sort((a, b) =>
    (Number(b.createdAt) || Number(b.id.replace('custom-', '')) || 0) -
    (Number(a.createdAt) || Number(a.id.replace('custom-', '')) || 0));
  if ($('#sort').value === 'trending') list.sort((a, b) =>
    seeds.findIndex(x => x.id === a.id) - seeds.findIndex(x => x.id === b.id));
  $('#cards').replaceChildren();
  list.forEach(c => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'card';
    b.setAttribute('aria-label', 'Use frame: ' + c.title);
    b.innerHTML = `<div class="art" style="background:${c.color}"><h3>${escapeHTML(c.headline)}</h3><div class="face">${escapeHTML(c.symbol)}</div><small>FRAMEFOLK / SHOW UP FOR GOOD ↗</small>${c.frame ? '<img alt="Custom campaign frame" src="' + c.frame + '">' : ''}</div><div class="cardmeta"><span>${escapeHTML(c.category.toUpperCase())}</span><span>↗ Join campaign</span></div><h3>${escapeHTML(c.title)}</h3><p>${seeds.some(x => x.id === c.id) ? (c.frame ? 'Public campaign · Share with your community' : 'Framefolk collection') : 'Your campaign · Saved on this device'}</p>`;
    b.onclick = () => openEditor(c);
    $('#cards').append(b);
  });
  $('#empty').hidden = list.length !== 0;
}
$('#search').oninput = render;
$('#sort').onchange = render;
render();

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Image could not be decoded.'));
    image.src = src;
  });
}
function openCreate() { $('#createstatus').textContent = ''; creator.showModal(); }
function updateDownload() { $('#download').disabled = !photoImage || frameLoading || exporting; }
function resetCrop() {
  $('#zoom').value = 1;
  $('#posx').value = 0;
  $('#posy').value = 0;
  draw();
}
async function openEditor(c) {
  const version = ++editorVersion;
  ++photoVersion;
  selected = c;
  photoImage = frameImage = drag = null;
  frameLoading = Boolean(c.frame);
  $('#editTitle').textContent = c.title;
  $('#editDesc').textContent = c.desc;
  $('#photo').value = '';
  $('#photostatus').textContent = 'Choose a photo to get started.';
  $('#editorstatus').textContent = '';
  resetCrop();
  updateDownload();
  if (!editor.open) editor.showModal();
  if (c.frame) {
    try {
      const image = await loadImage(c.frame);
      if (version !== editorVersion) return;
      frameImage = image;
      frameLoading = false;
      updateDownload();
      draw();
    } catch {
      if (version === editorVersion) {
        // Keep export disabled rather than silently replacing a failed custom frame.
        $('#editorstatus').textContent = 'The custom frame could not be loaded. Reopen the campaign or choose another frame.';
      }
    }
  }
}
editor.addEventListener('close', () => {
  ++editorVersion;
  ++photoVersion;
  drag = null;
});

// Adapted from Framewell's fit-to-width drawing: fit complete words without truncation.
function fittedHeadline(text, maxWidth, startSize = 49) {
  const words = String(text).toUpperCase().trim().split(/\s+/);
  let lines;
  for (let size = startSize; size >= 16; size--) {
    ctx.font = `bold ${size}px sans-serif`;
    lines = [''];
    for (const word of words) {
      const last = lines.length - 1;
      const candidate = (lines[last] + ' ' + word).trim();
      if (lines[last] && ctx.measureText(candidate).width > maxWidth) lines.push(word);
      else lines[last] = candidate;
    }
    if (lines.length <= 2 && lines.every(line => ctx.measureText(line).width <= maxWidth)) return {lines, size};
  }
  return {lines: [String(text).toUpperCase()], size: 16};
}
function draw() {
  if (!selected) return;
  ctx.clearRect(0, 0, SIZE, SIZE);
  ctx.fillStyle = '#f5f4e9';
  ctx.fillRect(0, 0, SIZE, SIZE);
  if (photoImage) {
    const base = Math.max(SIZE / photoImage.width, SIZE / photoImage.height) * Number($('#zoom').value);
    ctx.drawImage(photoImage, (SIZE - photoImage.width * base) / 2 + Number($('#posx').value),
      (SIZE - photoImage.height * base) / 2 + Number($('#posy').value), photoImage.width * base, photoImage.height * base);
  } else {
    ctx.fillStyle = '#d6e1d3';
    ctx.beginPath(); ctx.arc(540, 420, 180, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(540, 850, 320, 250, 0, 0, Math.PI * 2); ctx.fill();
  }
  if (frameImage) { ctx.drawImage(frameImage, 0, 0, SIZE, SIZE); return; }
  ctx.strokeStyle = selected.color;
  ctx.lineWidth = 65;
  ctx.strokeRect(32, 32, 1016, 1016);
  ctx.fillStyle = selected.color;
  ctx.fillRect(0, 0, SIZE, 180);
  ctx.fillRect(0, 900, SIZE, 180);
  const rgb = selected.color.match(/[0-9a-f]{2}/gi).map(h => parseInt(h, 16));
  ctx.fillStyle = (rgb[0] * .299 + rgb[1] * .587 + rgb[2] * .114) / 255 < .48 ? '#ffffff' : '#17342e';
  ctx.textAlign = 'center';
  const heading = fittedHeadline(selected.headline, 920);
  heading.lines.forEach((line, i) => ctx.fillText(line, 540, 75 + i * 60, 920));
  ctx.font = 'bold 30px sans-serif';
  ctx.fillText('SHOW UP FOR WHAT MATTERS  ✦', 540, 980);
  ctx.font = '22px sans-serif';
  ctx.fillText('framefolk / ' + selected.category.toLowerCase(), 540, 1030);
}
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (editor.open) draw(); });

async function choosePhoto(file) {
  if (!file || !editor.open) return;
  if (!file.type.startsWith('image/')) { $('#photostatus').textContent = 'Choose an image file, such as a JPG or PNG.'; return; }
  if (file.size > 20 * 1024 * 1024) { $('#photostatus').textContent = 'Please choose an image smaller than 20 MB.'; return; }
  const version = editorVersion, request = ++photoVersion;
  const url = URL.createObjectURL(file);
  $('#photostatus').textContent = 'Opening your photo…';
  try {
    const image = await loadImage(url);
    if (version !== editorVersion || request !== photoVersion || !editor.open) return;
    photoImage = image;
    resetCrop();
    updateDownload();
    $('#photostatus').textContent = 'Photo ready. Adjust the sliders for your perfect fit.';
  } catch {
    if (version === editorVersion && request === photoVersion) $('#photostatus').textContent = 'This image could not be opened. Try a PNG or JPEG.';
  } finally { URL.revokeObjectURL(url); }
}
$('#photo').onchange = e => { choosePhoto(e.target.files[0]); e.target.value = ''; };
['zoom', 'posx', 'posy'].forEach(id => $('#' + id).oninput = draw);

// Use the existing preview and upload area: no additional UI controls are needed.
canvas.style.touchAction = 'none';
canvas.tabIndex = 0;
canvas.setAttribute('aria-label', 'Campaign photo preview. Drag to move your photo; use the sliders to adjust it. Double-click to reset.');
canvas.title = 'Drag to move · Scroll to zoom · Double-click to reset';
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
function setSlider(id, value) {
  const input = $('#' + id);
  input.value = clamp(value, Number(input.min), Number(input.max));
}
canvas.addEventListener('pointerdown', e => {
  if (!photoImage || !e.isPrimary || e.button !== 0) return;
  drag = {id: e.pointerId, x: e.clientX, y: e.clientY};
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', e => {
  if (!drag || drag.id !== e.pointerId || !photoImage) return;
  const rect = canvas.getBoundingClientRect();
  setSlider('posx', Number($('#posx').value) + (e.clientX - drag.x) * SIZE / rect.width);
  setSlider('posy', Number($('#posy').value) + (e.clientY - drag.y) * SIZE / rect.height);
  drag.x = e.clientX; drag.y = e.clientY;
  draw();
});
['pointerup', 'pointercancel', 'lostpointercapture'].forEach(type => canvas.addEventListener(type, () => { drag = null; }));
canvas.addEventListener('wheel', e => {
  if (!photoImage) return;
  e.preventDefault();
  setSlider('zoom', Number($('#zoom').value) * (e.deltaY < 0 ? 1.06 : .94));
  draw();
}, {passive: false});
canvas.addEventListener('dblclick', () => { if (photoImage) resetCrop(); });
canvas.addEventListener('keydown', e => {
  if (!photoImage) return;
  const step = e.shiftKey ? 30 : 10;
  const moves = {ArrowLeft: ['posx', -step], ArrowRight: ['posx', step], ArrowUp: ['posy', -step], ArrowDown: ['posy', step]};
  if (moves[e.key]) { e.preventDefault(); const [id, delta] = moves[e.key]; setSlider(id, Number($('#' + id).value) + delta); draw(); }
  if (e.key === 'Home') { e.preventDefault(); resetCrop(); }
});
editor.addEventListener('dragover', e => { e.preventDefault(); if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy'; });
editor.addEventListener('drop', e => { e.preventDefault(); choosePhoto(e.dataTransfer && e.dataTransfer.files[0]); });

$('#download').onclick = () => {
  if (!photoImage || frameLoading || exporting) return;
  const version = editorVersion, id = selected.id;
  exporting = true;
  updateDownload();
  draw();
  try {
    canvas.toBlob(blob => {
      exporting = false;
      updateDownload();
      if (!blob) { if (version === editorVersion) $('#editorstatus').textContent = 'The image could not be prepared. Please try again.'; return; }
      const a = document.createElement('a'), url = URL.createObjectURL(blob);
      a.href = url;
      a.download = 'framefolk-' + id + '.png';
      document.body.append(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      if (version === editorVersion) $('#editorstatus').textContent = 'Your image is ready. Share it with your community.';
    }, 'image/png');
  } catch {
    exporting = false;
    updateDownload();
    $('#editorstatus').textContent = 'The image could not be prepared. Try another photo.';
  }
};
$('#share').onclick = async () => {
  if (!seeds.some(c => c.id === selected.id)) { $('#editorstatus').textContent = 'This campaign is saved on this device. Download its image to share it.'; return; }
  const version = editorVersion;
  const link = new URL(location.pathname, location.origin);
  link.searchParams.set('campaign', selected.id);
  try {
    await navigator.clipboard.writeText(link.href);
    if (version === editorVersion) $('#editorstatus').textContent = 'Campaign link copied!';
  } catch { if (version === editorVersion) $('#editorstatus').textContent = 'Campaign link: ' + link.href; }
};

async function readFrame(file) {
  if (!['image/png', 'image/webp'].includes(file.type)) throw new Error('Please use a PNG or WebP frame with a transparent center.');
  if (file.size > 3 * 1024 * 1024) throw new Error('Please choose a frame smaller than 3 MB.');
  const data = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('That frame could not be read. Try another PNG.'));
    reader.readAsDataURL(file);
  });
  const image = await loadImage(data);
  if (image.width !== image.height) throw new Error('Please use a square frame image.');
  const sample = document.createElement('canvas');
  sample.width = sample.height = 64;
  const sampleContext = sample.getContext('2d', {willReadFrequently: true});
  sampleContext.drawImage(image, 0, 0, 64, 64);
  const pixels = sampleContext.getImageData(16, 16, 32, 32).data;
  let transparent = false;
  for (let i = 3; i < pixels.length; i += 4) if (pixels[i] < 250) { transparent = true; break; }
  if (!transparent) throw new Error('This frame has an opaque center. Use a frame with a transparent opening so the photo can show through.');
  return data;
}
$('#createform').onsubmit = async e => {
  e.preventDefault();
  if (creating) return;
  const form = e.target, fields = new FormData(form), file = fields.get('frame');
  const c = {id: 'custom-' + Date.now(), createdAt: Date.now(), title: fields.get('title').trim(),
    headline: fields.get('title').trim().toUpperCase(), desc: fields.get('desc').trim(),
    category: fields.get('category'), color: fields.get('color'), symbol: '✦'};
  if (!c.title || !c.desc) { $('#createstatus').textContent = 'Please enter a campaign name and description.'; return; }
  const submit = form.querySelector('button[type="submit"], button:not([type])');
  creating = true;
  submit.disabled = true;
  $('#createstatus').textContent = '';
  try {
    if (file && file.size) c.frame = await readFrame(file);
    if (!creator.open) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify([c, ...saved])); }
    catch { throw new Error('Browser storage is full or unavailable. Try a smaller frame.'); }
    saved.unshift(c); campaigns.unshift(c);
    selectCategory('All campaigns');
    $('#search').value = '';
    render(); creator.close(); form.reset(); openEditor(c);
  } catch (error) { $('#createstatus').textContent = error.message || 'The campaign could not be created. Please try again.'; }
  finally { creating = false; submit.disabled = false; }
};
document.querySelectorAll('dialog').forEach(dialog => dialog.addEventListener('click', e => {
  if (e.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) dialog.close();
}));
const requestedId = new URLSearchParams(location.search).get('campaign');
const initial = campaigns.find(c => c.id === requestedId);
if (initial) openEditor(initial);

