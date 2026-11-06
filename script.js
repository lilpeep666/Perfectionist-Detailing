(function(){
  'use strict';

  const $ = (s,c=document) => c.querySelector(s);
  const $$ = (s,c=document) => Array.from(c.querySelectorAll(s));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* YEAR */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* HERO VIDEO */
  const heroVideo = $('.hero-video');
  if (heroVideo){
    heroVideo.addEventListener('error', () => { heroVideo.style.display = 'none'; });
    heroVideo.querySelector('source')?.addEventListener('error', () => {
      heroVideo.style.display = 'none';
    });
    const tryPlay = () => {
      const p = heroVideo.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    };
    tryPlay();
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) heroVideo.pause();
      else tryPlay();
    });
  }

  /* SCROLL PROGRESS + HEADER */
  const progress = $('#scrollProgress');
  const header = $('#header');
  let scrollTicking = false;

  function onScroll(){
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
      if (progress){
        const h = document.documentElement.scrollHeight - innerHeight;
        progress.style.width = (h > 0 ? (scrollY / h * 100) : 0) + '%';
      }
      if (header) header.classList.toggle('scrolled', scrollY > 60);
      scrollTicking = false;
    });
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  /* MOBILE MENU */
  const burger = $('#burger');
  const menu = $('#menu');

  function closeMenu(){
    if (!burger || !menu) return;
    burger.classList.remove('open');
    menu.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
  }
  function openMenu(){
    if (!burger || !menu) return;
    burger.classList.add('open');
    menu.classList.add('open');
    burger.setAttribute('aria-expanded', 'true');
  }

  if (burger && menu){
    burger.addEventListener('click', () => {
      if (menu.classList.contains('open')){
        closeMenu();
        document.body.style.overflow = '';
      } else {
        openMenu();
        document.body.style.overflow = 'hidden';
      }
    });
    menu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        closeMenu();
        document.body.style.overflow = '';
      });
    });
  }

  /* HERO PARALLAX */
  if (!reduceMotion && heroVideo){
    let heroTick = false;
    window.addEventListener('scroll', () => {
      if (heroTick) return;
      heroTick = true;
      requestAnimationFrame(() => {
        const y = scrollY;
        if (y < innerHeight){
          heroVideo.style.transform = `translateY(${y * 0.15}px) scale(1.02)`;
        }
        heroTick = false;
      });
    }, {passive:true});
  }

  /* REVEAL */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting){
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, {threshold:0.1, rootMargin:'0px 0px -80px 0px'});
  $$('.reveal').forEach(el => io.observe(el));

  /* COUNTERS */
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting){
        const el = e.target;
        const target = parseInt(el.dataset.count, 10);
        if (isNaN(target)){ countIO.unobserve(el); return; }
        const dur = 2000;
        const start = performance.now();
        function tick(now){
          const p = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased).toLocaleString('ru-RU');
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        countIO.unobserve(el);
      }
    });
  }, {threshold:0.5});
  $$('[data-count]').forEach(el => countIO.observe(el));

  /* GALLERY FILTER */
  const filterBtns = $$('.filter-btn');
  const galleryItems = $$('.g-item');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.filter;
      galleryItems.forEach(item => {
        const match = cat === 'all' || item.dataset.cat === cat;
        item.classList.toggle('hide', !match);
      });
    });
  });

  /* LIGHTBOX */
  const lightbox = $('#lightbox');
  const lightboxImg = $('#lightboxImg');

  function openLightbox(src, alt){
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    lightboxImg.alt = alt || '';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox(){
    if (!lightbox) return;
    lightbox.classList.remove('open');
    if (!modal || !modal.classList.contains('open')){
      document.body.style.overflow = '';
    }
  }

  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      if (img) openLightbox(img.src, img.alt);
    });
  });

  $('#lightboxClose')?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });

  /* MODAL */
  const modal = $('#modal');
  const formWrap = $('#formWrap');
  const formSuccess = $('#formSuccess');
  const bookingForm = $('#bookingForm');

  function openModal(){
    if (!modal) return;
    closeMenu();
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    if (formWrap) formWrap.style.display = '';
    if (formSuccess) formSuccess.classList.remove('show');
  }
  function closeModal(){
    if (!modal) return;
    modal.classList.remove('open');
    if (!lightbox || !lightbox.classList.contains('open')){
      document.body.style.overflow = '';
    }
  }

  $$('[data-open-modal]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      openModal();
    });
  });

  $('#modalClose')?.addEventListener('click', closeModal);
  modal?.addEventListener('click', e => {
    if (e.target === modal) closeModal();
  });

  /* KEYBOARD: ESC */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape'){
      closeLightbox();
      closeModal();
      if (menu && menu.classList.contains('open')){
        closeMenu();
        document.body.style.overflow = '';
      }
    }
  });

  /* ============================================================
     ФОРМА + ОТПРАВКА В TELEGRAM
  ============================================================ */
  
  function setError(field, on){
    if (field) field.classList.toggle('error', on);
  }

  // Маска телефона
  const phoneInput = document.getElementById('phone');
  if (phoneInput){
    function formatPhone(value){
      let v = String(value).replace(/\D/g, '');
      if (v.startsWith('8')) v = '7' + v.slice(1);
      if (!v.startsWith('7')) v = '7' + v;
      v = v.slice(0, 11);
      let f = '+7';
      if (v.length > 1) f += ' (' + v.slice(1, 4);
      if (v.length > 4) f += ') ' + v.slice(4, 7);
      if (v.length > 7) f += '-' + v.slice(7, 9);
      if (v.length > 9) f += '-' + v.slice(9, 11);
      return f;
    }
    phoneInput.addEventListener('input', e => { e.target.value = formatPhone(e.target.value); });
    phoneInput.addEventListener('focus', e => { if (!e.target.value) e.target.value = '+7 ('; });
    phoneInput.addEventListener('blur', e => { if (e.target.value === '+7 (' || e.target.value === '+7') e.target.value = ''; });
  }

  if (bookingForm){
    bookingForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      let valid = true;

      // Валидация полей
      $$('[data-field]', bookingForm).forEach(field => {
        const input = field.querySelector('input, select, textarea');
        if (!input) return;
        let bad = false;
        const val = input.value.trim();

        if (input.hasAttribute('required') && !val) bad = true;
        if (input.type === 'tel' && val && val.replace(/\D/g,'').length < 11) bad = true;
        if (input.type === 'date' && val){
          const today = new Date(); today.setHours(0,0,0,0);
          if (new Date(val) < today) bad = true;
        }
        setError(field, bad);
        if (bad) valid = false;
      });

      if (!valid) return;

      // Данные из формы
      const data = Object.fromEntries(new FormData(bookingForm).entries());
      
      // Меняем кнопку на "Отправка..."
      const submitBtn = document.getElementById('submitBtn');
      const submitText = document.getElementById('submitText');
      const submitIcon = document.getElementById('submitIcon');
      
      const originalText = submitText ? submitText.textContent : 'Отправить';
      if(submitBtn) submitBtn.disabled = true;
      if(submitText) submitText.textContent = 'Отправка...';
      if(submitIcon) submitIcon.style.display = 'none';

      // ============================================================
      // ВСТАВЬ СВОИ ДАННЫЕ СЮДА (между кавычками)
      const TELEGRAM_TOKEN = '9183864459:AAGDr8X3LYB945-lKrabGkdjr1f36ZiehKg';
      const TELEGRAM_CHAT_ID = '7841518777';
      // ============================================================

      // Формируем красивое сообщение для Телеграма
      const message = `
🔥 <b>Новая заявка!</b>

👤 <b>Имя:</b> ${data.name}
📞 <b>Телефон:</b> ${data.phone}
🚗 <b>Авто:</b> ${data.car}
🛠 <b>Услуга:</b> ${data.service}
📅 <b>Дата:</b> ${data.date}
💬 <b>Комментарий:</b> ${data.comment || 'Нет'}
      `;

      try {
        // Отправляем запрос в Telegram
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: 'HTML'
          })
        });

        if (!response.ok) throw new Error('Ошибка сети Telegram');

        // Успех
        if (formWrap) formWrap.style.display = 'none';
        if (formSuccess) formSuccess.classList.add('show');
        bookingForm.reset();

      } catch (error) {
        console.error('Ошибка отправки:', error);
        alert('Ошибка при отправке. Возможно, Telegram блокирует браузер (CORS). Напишите нам напрямую в Telegram!');
        
        // Возвращаем кнопку
        if(submitBtn) submitBtn.disabled = false;
        if(submitText) submitText.textContent = originalText;
        if(submitIcon) submitIcon.style.display = 'block';
      }
    });

    // Очистка ошибок
    bookingForm.querySelectorAll('input, select, textarea').forEach(input => {
      input.addEventListener('input', () => {
        const field = input.closest('[data-field]');
        if (field) field.classList.remove('error');
      });
    });
  }

  /* FLOATING ACTIONS */
  const scrollTopBtn = document.getElementById('scrollTop');
  const telegramFab = document.querySelector('.fab-telegram');
  const mobileCta = document.getElementById('mobileCta');
  const ctaTrigger = document.getElementById('services');

  let floatTicking = false;
  function handleFloating(){
    if (floatTicking) return;
    floatTicking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      if (y > 400){
        scrollTopBtn?.classList.add('visible');
        telegramFab?.classList.add('visible');
      } else {
        scrollTopBtn?.classList.remove('visible');
        telegramFab?.classList.remove('visible');
      }
      if (mobileCta && ctaTrigger){
        const ctaBottom = ctaTrigger.getBoundingClientRect().bottom + window.scrollY;
        if (y > ctaBottom - 300) mobileCta.classList.add('show');
        else mobileCta.classList.remove('show');
      }
      floatTicking = false;
    });
  }
  window.addEventListener('scroll', handleFloating, {passive:true});
  handleFloating();

  scrollTopBtn?.addEventListener('click', () => {
    window.scrollTo({top:0, behavior:'smooth'});
  });

  /* SMOOTH ANCHOR SCROLL */
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href');
      if (!id || id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.scrollY - 60;
      window.scrollTo({top:y, behavior:'smooth'});
    });
  });

})();