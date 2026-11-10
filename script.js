const clock = document.getElementById("clock");
if (clock) {
  const formatter = new Intl.DateTimeFormat("ru-RU", {
    timeZone: "Europe/Volgograd", hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
  const updateClock = () => { clock.textContent = formatter.format(new Date()); };
  updateClock();
  setInterval(() => { if (!document.hidden) updateClock(); }, 1000);
}

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
document.querySelectorAll(".slider").forEach((slider) => {
  const slides = slider.querySelector(".slides");
  const items = slider.querySelectorAll(".slide");
  const dots = slider.querySelectorAll(".dot");
  const next = slider.querySelector(".slider__btn--next");
  const prev = slider.querySelector(".slider__btn--prev");
  if (!slides || !items.length || !next || !prev) return;

  let current = 0;
  let interval;
  let visible = false;
  let hovered = false;
  slider.setAttribute("role", "region");
  slider.setAttribute("aria-label", slider.closest("section").querySelector("h2")?.textContent || "Галерея");
  next.setAttribute("aria-label", "Следующий слайд");
  prev.setAttribute("aria-label", "Предыдущий слайд");
  dots.forEach((dot, index) => dot.setAttribute("aria-label", `Слайд ${index + 1}`));

  function updateSlider() {
    slides.style.transform = `translateX(-${current * 100}%)`;
    // Load the selected image even when the user jumps to a distant slide.
    items[current].loading = "eager";
    dots.forEach((dot, index) => {
      dot.classList.toggle("active", index === current);
      dot.setAttribute("aria-pressed", String(index === current));
    });
  }
  function syncAutoplay() {
    clearInterval(interval);
    if (visible && !document.hidden && !reducedMotion.matches && !hovered && !slider.contains(document.activeElement)) {
      interval = setInterval(() => move(1), 4000);
    }
  }
  function move(direction) {
    current = (current + direction + items.length) % items.length;
    updateSlider();
  }
  next.addEventListener("click", () => { move(1); syncAutoplay(); });
  prev.addEventListener("click", () => { move(-1); syncAutoplay(); });
  dots.forEach((dot, index) => dot.addEventListener("click", () => {
    current = index; updateSlider(); syncAutoplay();
  }));
  slider.addEventListener("mouseenter", () => { hovered = true; syncAutoplay(); });
  slider.addEventListener("mouseleave", () => { hovered = false; syncAutoplay(); });
  slider.addEventListener("focusin", syncAutoplay);
  slider.addEventListener("focusout", () => requestAnimationFrame(syncAutoplay));
  document.addEventListener("visibilitychange", syncAutoplay);
  reducedMotion.addEventListener("change", syncAutoplay);
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) updateSlider();
    syncAutoplay();
  }, { threshold: 0.1 });
  // Do not eagerly request images in galleries below the viewport.
  observer.observe(slider);
});

// Start the film only when visible; keep sound off until explicitly enabled.
document.querySelectorAll('.case-video-frame').forEach((frame) => {
  const video = frame.querySelector('video');
  const sound = frame.querySelector('.video-sound');
  const status = frame.querySelector('.video-status');
  if (!video || !sound || !status) return;
  let visible = false;
  video.muted = true;
  function syncSound() {
    sound.setAttribute('aria-label', video.muted ? 'Включить звук' : 'Выключить звук');
    sound.setAttribute('aria-pressed', String(!video.muted));
  }
  function showError() {
    status.textContent = 'Не удалось воспроизвести видео. Попробуйте обновить страницу.';
    status.hidden = false;
  }
  async function syncPlayback() {
    if (!visible || document.hidden) { video.pause(); return; }
    try {
      await video.play();
      status.hidden = true;
    } catch (error) {
      if (error.name === 'NotAllowedError') {
        // Let the browser provide a play button when device policy blocks autoplay.
        video.controls = true;
      } else if (error.name !== 'AbortError') showError();
    }
  }
  sound.addEventListener('click', () => {
    video.muted = !video.muted;
    syncPlayback();
  });
  video.addEventListener('volumechange', syncSound);
  video.addEventListener('error', showError);
  video.querySelectorAll('source').forEach(source => source.addEventListener('error', showError));
  document.addEventListener('visibilitychange', syncPlayback);
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    syncPlayback();
  }, { threshold: 0.1 });
  syncSound();
  sound.hidden = false;
  video.controls = false;
  observer.observe(frame);
});

const caseDialog = document.getElementById('lingualeo-dialog');
const caseTrigger = document.querySelector('.case-trigger');
if (caseDialog && caseTrigger && typeof caseDialog.showModal === 'function') {
  const body = caseDialog.querySelector('.case-dialog__body');
  const close = caseDialog.querySelector('.case-dialog__close');
  let loaded = false;
  let loading = false;
  async function loadCase() {
    if (loaded || loading) return;
    loading = true;
    body.setAttribute('aria-busy', 'true');
    body.textContent = 'Загрузка кейса…';
    try {
      const response = await fetch(caseTrigger.getAttribute('href'));
      if (!response.ok) throw new Error('Case unavailable');
      const page = new DOMParser().parseFromString(await response.text(), 'text/html');
      const content = page.querySelector('.case-container');
      if (!content) throw new Error('Case content missing');
      // The draft case references artwork absent from the repository.
      // Do not show broken images or empty illustration headings in the popup.
      content.querySelectorAll('img').forEach(img => {
        if (img.previousElementSibling?.matches('h3')) img.previousElementSibling.remove();
        img.remove();
      });
      body.replaceChildren(content);
      loaded = true;
    } catch {
      body.textContent = 'Не удалось загрузить кейс.';
      const retry = document.createElement('button');
      retry.type = 'button';
      retry.className = 'case-dialog__retry';
      retry.textContent = 'Попробовать снова';
      retry.addEventListener('click', loadCase);
      body.append(document.createElement('br'), retry);
    } finally {
      loading = false;
      body.removeAttribute('aria-busy');
    }
  }
  caseTrigger.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button) return;
    event.preventDefault();
    caseDialog.showModal();
    document.documentElement.classList.add('case-open');
    document.querySelectorAll('video').forEach(video => video.pause());
    loadCase();
  });
  close.addEventListener('click', () => caseDialog.close());
  let outsideDown = false;
  caseDialog.addEventListener('pointerdown', event => { outsideDown = event.target === caseDialog; });
  caseDialog.addEventListener('click', event => {
    if (outsideDown && event.target === caseDialog) caseDialog.close();
    outsideDown = false;
  });
  caseDialog.addEventListener('close', () => {
    document.documentElement.classList.remove('case-open');
    caseTrigger.focus({ preventScroll: true });
  });
}
