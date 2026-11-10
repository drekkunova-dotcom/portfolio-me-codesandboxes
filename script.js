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
