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

  /* show the result; win = {game, prize, emoji} or null for "no luck" */
  function showResult({ game, prize, emoji, title, text, win, onAgain }) {
    ensureSheet();
    const $ = id => document.getElementById(id);
    $('pEmoji').textContent = emoji || (win ? '🎁' : '☕');
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
        b.textContent = '🎁 Забрать подарок в чат';
        b.onclick = () => {
          // sendData closes the app and the bot replies with a real promo code
          try { tg.sendData(JSON.stringify({ type: 'prize', game, prize })); }
          catch (e) { $('pNote').textContent = 'Откройте игры кнопкой «🎁 Игры и подарки» в чате с ботом'; }
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

  return { tg, params, link, setupBack, haptic, confetti, showResult, playedToday, pick, closeSheet };
})();
