
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  heroSlider();
  dateCheck();
  renderCategories();
  renderCountdown();
  featured();
  renderGallery();
  renderQuotes();
  renderFaq();
  countUp();
  contactForm();
  watchReveals();

  document.addEventListener("settings:change", renderCountdown);
  document.addEventListener("plan:change", () => featured());
});

function heroSlider() {
  const slides = $$(".hero-slide");
  const dots = $("#hero-dots");
  let index = 0;
  dots.innerHTML = slides.map((_, i) => `<button type="button" aria-label="${t("Photo {n}", { n: i + 1 })}" class="${i === 0 ? "active" : ""}"></button>`).join("");
  const go = (i) => {
    index = i;
    slides.forEach((slide, n) => slide.classList.toggle("active", n === i));
    $$("button", dots).forEach((dot, n) => dot.classList.toggle("active", n === i));
  };
  $$("button", dots).forEach((dot, i) => dot.addEventListener("click", () => go(i)));
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) setInterval(() => go((index + 1) % slides.length), 6000);
}

function dateCheck() {
  const date = $("#check-date");
  const select = $("#check-cat");
  date.min = todayIso();
  date.value = state.settings.weddingDate || "";
  select.innerHTML = CATEGORIES.map((cat) => `<option value="${cat.id}">${t(cat.name)}</option>`).join("");
  $("#date-check").addEventListener("submit", (event) => {
    event.preventDefault();
    saveSettings({ weddingDate: date.value });
    location.href = `services.html#${select.value}`;
  });
}

function renderCategories() {
  const covers = { halls: "images/halls/grand.jpg", photographers: "images/portfolio/w6.jpg", catering: "images/food/grill.jpg", makeup: "images/makeup/looks/m1-1.jpg", cakes: "images/cakes/pink-floral.jpg" };
  $("#cat-grid").innerHTML = CATEGORIES.map((cat) => {
    const count = VENDORS.filter((v) => v.cat === cat.id).length;
    return `
      <a class="cat-tile reveal" href="services.html#${cat.id}">
        <img src="${covers[cat.id]}" alt="" loading="lazy">
        <div class="cat-text">
          <i class="fas ${cat.icon}"></i>
          <h3>${t(cat.name)}</h3>
          <p>${t(cat.blurb)}</p>
          <span>${t("{n} options", { n: count })} <i class="fas fa-arrow-right flip-rtl"></i></span>
        </div>
      </a>`;
  }).join("");
}

let countdownTimer;
function renderCountdown() {
  const box = $("#countdown");
  clearInterval(countdownTimer);
  const { weddingDate, names } = state.settings;

  if (!weddingDate || weddingDate < todayIso()) {
    box.innerHTML = `
      <div>
        <p class="script">${t("Save the date")}</p>
        <h2>${t("When is your wedding?")}</h2>
        <p>${t("Set your date once — every vendor will show if they are free on your day.")}</p>
      </div>
      <form class="inline-form" id="set-date">
        <input type="date" class="input" id="band-date" min="${todayIso()}" required aria-label="${t("Wedding day")}">
        <button class="btn btn-light" type="submit">${t("Save my date")}</button>
      </form>`;
    $("#set-date").addEventListener("submit", (event) => {
      event.preventDefault();
      saveSettings({ weddingDate: $("#band-date").value });
      $("#check-date").value = $("#band-date").value;
      featured();
      toast(t("Your wedding date is saved"));
    });
    return;
  }

  box.innerHTML = `
    <div>
      <p class="script">${names ? escapeHtml(names) : t("Your big day")}</p>
      <h2>${prettyDate(weddingDate)}</h2>
      <a class="link-light" href="planner.html">${t("Open your planner")} <i class="fas fa-arrow-right flip-rtl"></i></a>
    </div>
    <div class="timer" id="timer"></div>`;
  const tick = () => {
    const diff = Math.max(0, parseIso(weddingDate) - new Date());
    const parts = [["Days", Math.floor(diff / 864e5)], ["Hours", Math.floor(diff / 36e5) % 24], ["Minutes", Math.floor(diff / 6e4) % 60], ["Seconds", Math.floor(diff / 1e3) % 60]];
    $("#timer").innerHTML = parts.map(([label, n]) => `<div><strong>${String(n).padStart(2, "0")}</strong><span>${t(label)}</span></div>`).join("");
  };
  tick();
  countdownTimer = setInterval(tick, 1000);
}

let featuredCat = "photographers";
function featured() {
  $("#featured-tabs").innerHTML = CATEGORIES.map((cat) => `
    <button type="button" role="tab" class="tab ${cat.id === featuredCat ? "active" : ""}" data-tab="${cat.id}" aria-selected="${cat.id === featuredCat}">
      <i class="fas ${cat.icon}"></i> ${t(cat.name)}
    </button>`).join("");
  $$("[data-tab]").forEach((btn) => btn.addEventListener("click", () => { featuredCat = btn.dataset.tab; featured(); }));
  const top = VENDORS.filter((v) => v.cat === featuredCat).sort((a, b) => b.rating - a.rating || b.reviews - a.reviews).slice(0, 3);
  $("#featured").innerHTML = top.map(vendorCard).join("");
  $("#featured-more").href = `services.html#${featuredCat}`;
  $("#featured-more").innerHTML = `${t("See all")}: ${t(catById(featuredCat).name)} <i class="fas fa-arrow-right flip-rtl"></i>`;
  watchReveals($("#featured"));
}

function renderGallery() {
  const photos = ["w6", "w2", "w13", "w4", "w11", "w7", "w3", "w14", "w10", "w5"].map((n) => `images/portfolio/${n}.jpg`);
  $("#gallery").innerHTML = photos.map((src, i) => `<button type="button" class="gallery-item reveal" data-i="${i}"><img src="${src}" alt="${t("Wedding photo {n}", { n: i + 1 })}" loading="lazy"></button>`).join("");
  $$("#gallery [data-i]").forEach((btn) => btn.addEventListener("click", () => openLightbox(photos, Number(btn.dataset.i))));
}

function renderQuotes() {
  $("#quotes").innerHTML = TESTIMONIALS.map((q) => `
    <figure class="quote card reveal">
      <i class="fas fa-quote-left"></i>
      <blockquote>${escapeHtml(t(q.text))}</blockquote>
      <figcaption><span class="avatar">${escapeHtml(t(q.name)[0])}</span><span><strong>${escapeHtml(t(q.name))}</strong><small class="muted">${escapeHtml(t(q.date))}</small></span></figcaption>
    </figure>`).join("");
}

function renderFaq() {
  $("#faq-list").innerHTML = FAQ.map((f, i) => `
    <details ${i === 0 ? "open" : ""}>
      <summary>${escapeHtml(t(f.q))}<i class="fas fa-plus"></i></summary>
      <p>${escapeHtml(t(f.a))}</p>
    </details>`).join("");
}

function countUp() {
  const items = $$("[data-count]");
  const run = (el) => {
    const end = Number(el.dataset.count);
    const decimals = Number(el.dataset.decimals || 0);
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min(1, (now - start) / 1400);
      const value = end * (1 - Math.pow(1 - progress, 3));
      el.textContent = decimals
        ? value.toLocaleString(localeTag(), { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
        : Math.round(value).toLocaleString(localeTag()) + (progress === 1 && end > 100 ? "+" : "");
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if (!("IntersectionObserver" in window)) { items.forEach(run); return; }
  const io = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (entry.isIntersecting) { run(entry.target); io.unobserve(entry.target); }
  }), { threshold: 0.5 });
  items.forEach((el) => io.observe(el));
}

function contactForm() {
  $("#c-date").value = state.settings.weddingDate || "";
  $("#contact-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const date = $("#c-date").value;
    const intro = t("Hello {brand}! My name is {name}.", { brand: SITE.brand, name: $("#c-name").value.trim() });
    const when = date ? ` ${t("Our wedding is on {date}.", { date: prettyDate(date) })}` : "";
    const text = `${intro}${when}\n\n${$("#c-msg").value.trim()}`;
    window.open(`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  });
}
