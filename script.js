// ======================================
// Часы
// ======================================

const clock = document.getElementById("clock");

if (clock) {
  function updateClock() {
    const now = new Date();

    clock.textContent = now.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }

  updateClock();
  setInterval(updateClock, 1000);
}

// ======================================
// Слайдер
// ======================================

document.querySelectorAll(".slider").forEach((slider) => {
  const slides = slider.querySelector(".slides");
  const slideItems = slider.querySelectorAll(".slide");
  const dots = slider.querySelectorAll(".dot");
  const next = slider.querySelector(".slider__btn--next");
  const prev = slider.querySelector(".slider__btn--prev");

  if (!slides || !next || !prev) return;

  let current = 0;
  let interval;

  const totalSlides = slideItems.length;
  const AUTO_PLAY_DELAY = 4000;

  function updateSlider() {
    slides.style.transform = `translateX(-${current * 100}%)`;

    dots.forEach((dot) => dot.classList.remove("active"));

    if (dots[current]) {
      dots[current].classList.add("active");
    }
  }

  function nextSlide() {
    current = (current + 1) % totalSlides;
    updateSlider();
  }

  function prevSlide() {
    current = (current - 1 + totalSlides) % totalSlides;
    updateSlider();
  }

  function stopAutoplay() {
    clearInterval(interval);
  }

  function startAutoplay() {
    stopAutoplay();
    interval = setInterval(nextSlide, AUTO_PLAY_DELAY);
  }

  next.addEventListener("click", () => {
    nextSlide();
    startAutoplay();
  });

  prev.addEventListener("click", () => {
    prevSlide();
    startAutoplay();
  });

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      current = index;

      updateSlider();

      startAutoplay();
    });
  });

  if (!window.matchMedia("(pointer: coarse)").matches) {
    slider.addEventListener("mouseenter", stopAutoplay);

    slider.addEventListener("mouseleave", startAutoplay);
  }

  updateSlider();

  startAutoplay();
});

// ======================================
// Курсор "Изучить кейс"
// ======================================

const project = document.getElementById("ling-case");

if (project) {

    const cursorLabel = document.createElement("div");

    cursorLabel.className = "cursor-label";
    cursorLabel.textContent = "Изучить кейс";

    document.body.appendChild(cursorLabel);

    let mouseX = 0;
    let mouseY = 0;

    let x = 0;
    let y = 0;

    let isHover = false;

    function animateCursor() {

        if (isHover) {

            x += (mouseX - x) * 0.18;
            y += (mouseY - y) * 0.18;

            cursorLabel.style.left = x + "px";
            cursorLabel.style.top = y + "px";
        }

        requestAnimationFrame(animateCursor);
    }

    animateCursor();

    project.addEventListener("mouseenter", (e) => {

        isHover = true;

        mouseX = x = e.clientX;
        mouseY = y = e.clientY;

        cursorLabel.classList.add("active");

    });

    project.addEventListener("mousemove", (e) => {

        mouseX = e.clientX + 24;
        mouseY = e.clientY + 24;

    });

    project.addEventListener("mouseleave", () => {

        isHover = false;
        cursorLabel.classList.remove("active");

    });

}