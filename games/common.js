/* Shared helpers for the CRUMB & CREMA mini-games: Telegram setup, haptics,
   confetti, the prize sheet and the once-a-day limit. */
window.GAME = (() => {
  // initData is empty when opened from a keyboard button, so detect Telegram by platform
  const W = window.Telegram && Telegram.WebApp;
  const tg = W && W.platform && W.platform !== 'unknown' ? W : null;
  const params = new URLSearchParams(location.search);

  if (tg) {
    document.documentElement.classList.add('tg');
    tg.ready();
    tg.expand();
    try { tg.setHeaderColor('#f6f0e6'); tg.setBackgroundColor('#f6f0e6'); } catch (e) {}
    if (tg.isVersionAtLeast && tg.isVersionAtLeast('7.7')) tg.disableVerticalSwipes();
  }

  // keep the query (name etc.) when moving between the hub and a game
  const link = path => path + location.search;
  function setupBack(toHub) {
    const back = document.querySelector('.g-back');
    if (back) back.href = link('index.html');
    if (tg && toHub) {
      tg.BackButton.show();
      tg.BackButton.onClick(() => { location.href = link('index.html'); });
    }
  }

  const haptic = (type, v) => {
    try {
      if (!tg) return;
      if (type === 'n') tg.HapticFeedback.notificationOccurred(v);
      else if (type === 's') tg.HapticFeedback.selectionChanged();
      else tg.HapticFeedback.impactOccurred(v || 'light');
    } catch (e) {}
  };

  function confetti(n = 70) {
    const box = document.createElement('div');
    box.className = 'conf';
    const colors = ['#c4512f', '#e7a36b', '#7f8f5a', '#2b1d14', '#f6dfd4'];
    for (let k = 0; k < n; k++) {
      const i = document.createElement('i');
      i.style.left = Math.random() * 100 + '%';
      i.style.background = colors[k % colors.length];
      i.style.animationDuration = 1.6 + Math.random() * 1.8 + 's';
      i.style.animationDelay = Math.random() * .5 + 's';
      box.appendChild(i);
    }
    document.body.appendChild(box);
    setTimeout(() => box.remove(), 4200);
  }

  // one prize per day inside Telegram; the bot enforces it again on its side
  const today = () => new Date().toISOString().slice(0, 10);
  const storeGet = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const storeSet = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  const playedToday = game => !!tg && storeGet(`cc-played-${game}`) === today();
  const markPlayed = game => storeSet(`cc-played-${game}`, today());

  const demoCode = () => 'CRUMB-' + Math.random().toString(36).slice(2, 6).toUpperCase();

  /* flat illustrations in the cafe palette, used instead of emoji */
  const ART = {
    gift: '<rect x="12" y="26" width="40" height="30" rx="4" fill="#c4512f"/><rect x="9" y="18" width="46" height="11" rx="3" fill="#a63e20"/><rect x="29" y="18" width="6" height="38" fill="#fffaf2"/><path d="M32 18c-5-9-15-10-15-4 0 4 8 4 15 4Zm0 0c5-9 15-10 15-4 0 4-8 4-15 4Z" fill="none" stroke="#fffaf2" stroke-width="3" stroke-linejoin="round"/>',
    cup: '<path d="M18 24h28l-3 24a8 8 0 0 1-8 7h-6a8 8 0 0 1-8-7l-3-24Z" fill="#fffaf2" stroke="#2b1d14" stroke-width="3" stroke-linejoin="round"/><path d="M19.5 34h25l-.9 7H20.4Z" fill="#c4512f"/><ellipse cx="32" cy="24" rx="14" ry="3.5" fill="#6b3a1f" stroke="#2b1d14" stroke-width="3"/><path d="M46 30h3a5 5 0 0 1 0 10h-4" fill="none" stroke="#2b1d14" stroke-width="3"/><path d="M27 15c-2-3 2-4 0-7M36 15c-2-3 2-4 0-7" stroke="#c4512f" stroke-width="2.5" stroke-linecap="round" fill="none"/>',
    croissant: '<path d="M8 40c3-14 14-22 24-22s21 8 24 22c-4-3-8-2-11 1-4-5-9-6-13-6s-9 1-13 6c-3-3-7-4-11-1Z" fill="#e0a052" stroke="#a8682a" stroke-width="2.5" stroke-linejoin="round"/><path d="M21 22l3 15M32 18v17M43 22l-3 15" stroke="#a8682a" stroke-width="2.5" stroke-linecap="round"/>',
    percent: '<path d="M10 30 30 10h20v20L30 50Z" fill="#7f8f5a"/><circle cx="43" cy="17" r="3.5" fill="#f6f0e6"/><path d="M24 38l10-12" stroke="#fffaf2" stroke-width="3" stroke-linecap="round"/><circle cx="25" cy="28" r="3" fill="#fffaf2"/><circle cx="33" cy="37" r="3" fill="#fffaf2"/>',
    swirl: '<circle cx="32" cy="32" r="22" fill="#e9b77a" stroke="#b07434" stroke-width="2.5"/><path d="M32 32c0-3 4-3 4 0 0 5-8 5-8 0 0-8 12-8 12 0 0 10-16 10-16 0 0-12 20-12 20 0" fill="none" stroke="#9a5f28" stroke-width="2.5" stroke-linecap="round"/><path d="M20 22c4-5 10-7 16-6" stroke="#fffaf2" stroke-width="3" stroke-linecap="round" fill="none" opacity=".8"/>',
    moon: '<path d="M44 44A18 18 0 0 1 24 14a18 18 0 1 0 20 30Z" fill="#2b1d14"/><circle cx="46" cy="18" r="2" fill="#e7a36b"/><circle cx="52" cy="28" r="1.5" fill="#e7a36b"/>',
    basket: '<path d="M18 26c0-12 28-12 28 0" fill="none" stroke="#8a5528" stroke-width="4" stroke-linecap="round"/><path d="M8 26h48l-6 26a5 5 0 0 1-5 4H19a5 5 0 0 1-5-4L8 26Z" fill="#c98a4b" stroke="#8a5528" stroke-width="2.5" stroke-linejoin="round"/><path d="M11 34h42M13 42h38M15 50h34M20 26l3 30M32 26v30M44 26l-3 30" stroke="#8a5528" stroke-width="2" opacity=".55"/><rect x="6" y="23" width="52" height="6" rx="3" fill="#a96e36"/>',
    bee: '<ellipse cx="32" cy="36" rx="16" ry="12" fill="#f2c230" stroke="#2b1d14" stroke-width="2.5"/><path d="M28 25v22M36 25v22" stroke="#2b1d14" stroke-width="4"/><ellipse cx="26" cy="20" rx="7" ry="9" fill="#cfe3f0" stroke="#2b1d14" stroke-width="2" opacity=".9"/><ellipse cx="38" cy="20" rx="7" ry="9" fill="#cfe3f0" stroke="#2b1d14" stroke-width="2" opacity=".9"/><circle cx="44" cy="34" r="1.8" fill="#2b1d14"/>'
  };
  const art = (name, size = 64) => `<svg width="${size}" height="${size}" viewBox="0 0 64 64" aria-hidden="true">${ART[name] || ART.gift}</svg>`;
  // the same artwork as an <img> for drawing on a canvas
  const artImage = name => {
    const img = new Image();
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 64 64">${ART[name]}</svg>`);
    return img;
  };

  function ensureSheet() {
    if (document.getElementById('pSheet')) return;
    document.body.insertAdjacentHTML('beforeend', `
      <div class="p-shade" id="pShade"></div>
      <div class="p-sheet" id="pSheet">
        <span class="p-emoji" id="pEmoji"></span>
        <h3 id="pTitle"></h3>
        <p id="pText"></p>
        <div id="pCodeWrap"></div>
        <div class="p-actions" id="pActions"></div>
        <p class="p-note" id="pNote"></p>
      </div>`);
  }
  function closeSheet() {
    document.getElementById('pShade').classList.remove('on');
    document.getElementById('pSheet').classList.remove('on');
  }

  /* show the result; icon is one of the ART names */
  function showResult({ game, prize, icon, title, text, win, onAgain }) {
    ensureSheet();
    const $ = id => document.getElementById(id);
    $('pEmoji').innerHTML = art(icon || (win ? 'gift' : 'moon'), 76);
    $('pTitle').textContent = title || (win ? 'Поздравляем!' : 'В этот раз мимо');
    $('pText').textContent = text || (win ? `Ваш приз: ${prize}` : 'Загляните завтра — будет ещё попытка');
    $('pCodeWrap').innerHTML = '';
    $('pNote').textContent = '';
    const actions = $('pActions');
    actions.innerHTML = '';
    markPlayed(game); // a finished game uses today's attempt, win or not
    if (win) {
      confetti();
      haptic('n', 'success');
      if (tg) {
        const b = document.createElement('button');
        b.className = 'btn wide';
        b.textContent = 'Забрать подарок в чат';
        b.onclick = () => {
          // sendData closes the app and the bot replies with a real promo code
          try { tg.sendData(JSON.stringify({ type: 'prize', game, prize })); }
          catch (e) { $('pNote').textContent = 'Откройте игры кнопкой «Игры и подарки» в чате с ботом'; }
        };
        actions.appendChild(b);
        $('pNote').textContent = 'Промокод придёт в чат — покажите его на кассе';
      } else {
        $('pCodeWrap').innerHTML = `<span class="p-code">${demoCode()}</span>`;
        $('pNote').textContent = 'Демо: в Telegram код придёт в чат с ботом';
      }
    } else {
      haptic('n', 'warning');
    }
    if (onAgain && (!tg || !win)) {
      const again = document.createElement('button');
      again.className = 'btn ghost wide';
      again.textContent = tg ? 'Сыграть ещё' : 'Сыграть ещё (демо)';
      again.onclick = () => { closeSheet(); onAgain(); };
      actions.appendChild(again);
    }
    const hub = document.createElement('a');
    hub.className = 'btn ghost wide';
    hub.href = link('index.html');
    hub.textContent = 'Другие игры';
    actions.appendChild(hub);
    setTimeout(() => { $('pShade').classList.add('on'); $('pSheet').classList.add('on'); }, 60);
  }

  /* weighted random pick: items = [{w, ...}] */
  function pick(items) {
    const total = items.reduce((s, i) => s + i.w, 0);
    let r = Math.random() * total;
    for (const i of items) { if ((r -= i.w) < 0) return i; }
    return items[items.length - 1];
  }

  if (!tg) document.addEventListener('DOMContentLoaded', () => {
    if (!document.querySelector('.demo-tag')) document.body.insertAdjacentHTML('beforeend', '<span class="demo-tag">Демо-режим · без ограничений</span>');
  });

  return { tg, params, link, setupBack, haptic, confetti, showResult, playedToday, pick, closeSheet, art, artImage };
})();
