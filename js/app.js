
"use strict";

const STORAGE = {
  plan: "fd-plan",
  favs: "fd-favs",
  settings: "fd-settings",
  checklist: "fd-checklist",
  theme: "fd-theme",
};

// Month and weekday names in the current language.
const MONTHS = Array.from({ length: 12 }, (_, m) => new Date(2026, m, 1).toLocaleDateString(localeTag(), { month: "long" }));
const WEEKDAYS = Array.from({ length: 7 }, (_, d) => new Date(2026, 1, 1 + d).toLocaleDateString(localeTag(), { weekday: "short" }));

// ---------- Small helpers ----------
function $(selector, root = document) { return root.querySelector(selector); }
function $$(selector, root = document) { return [...root.querySelectorAll(selector)]; }

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
}

function money(amount) {
  return `${Math.round(amount).toLocaleString(localeTag())} ${t(SITE.currency)}`;
}

function readJson(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch (error) {
    return fallback;
  }
}

function writeJson(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (error) { /* private mode: keep it in memory only */ }
}

// Dates are handled as "YYYY-MM-DD" strings so they never shift with time zones.
function isoDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function todayIso() { return isoDate(new Date()); }

function parseIso(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function prettyDate(iso) {
  if (!iso) return "";
  return parseIso(iso).toLocaleDateString(localeTag(), { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

function catById(id) { return CATEGORIES.find((cat) => cat.id === id); }
function vendorById(id) { return VENDORS.find((vendor) => vendor.id === id); }
function packageOf(vendor, pkgId) { return vendor.packages.find((pkg) => pkg.id === pkgId) || vendor.packages[0]; }
function lowestPrice(vendor) { return Math.min(...vendor.packages.map((pkg) => pkg.price)); }

function isBooked(vendor, iso) { return Boolean(iso) && vendor.booked.includes(iso); }

// The next few free days on or after a date (used to suggest other days).
function nextFreeDates(vendor, fromIso, count = 3) {
  const result = [];
  const day = parseIso(fromIso < todayIso() ? todayIso() : fromIso);
  for (let i = 0; i < 120 && result.length < count; i++) {
    const iso = isoDate(day);
    if (!isBooked(vendor, iso)) result.push(iso);
    day.setDate(day.getDate() + 1);
  }
  return result;
}

function stars(rating) {
  const full = Math.round(rating);
  return `<span class="stars" aria-label="${escapeHtml(t("{r} out of 5", { r: rating }))}">${"<i class='fas fa-star'></i>".repeat(full)}${"<i class='far fa-star'></i>".repeat(5 - full)}</span>`;
}

// ---------- Saved state ----------
const state = {
  plan: Array.isArray(readJson(STORAGE.plan, [])) ? readJson(STORAGE.plan, []).filter((item) => vendorById(item.vendorId)) : [],
  favs: Array.isArray(readJson(STORAGE.favs, [])) ? readJson(STORAGE.favs, []) : [],
  settings: { names: "", weddingDate: "", budget: 0, guests: 0, ...readJson(STORAGE.settings, {}) },
};

function saveSettings(changes) {
  Object.assign(state.settings, changes);
  writeJson(STORAGE.settings, state.settings);
  document.dispatchEvent(new CustomEvent("settings:change"));
}

function itemTotal(item) {
  const vendor = vendorById(item.vendorId);
  const price = packageOf(vendor, item.pkgId).price;
  return catById(vendor.cat).unit === "guest" ? price * (item.guests || 0) : price;
}

function planTotal() { return state.plan.reduce((sum, item) => sum + itemTotal(item), 0); }

function savePlan() {
  writeJson(STORAGE.plan, state.plan);
  renderPlan();
  document.dispatchEvent(new CustomEvent("plan:change"));
}

function addToPlan(item) {
  const index = state.plan.findIndex((line) => line.vendorId === item.vendorId);
  if (index >= 0) state.plan[index] = item; else state.plan.push(item);
  savePlan();
}

function removeFromPlan(vendorId) {
  state.plan = state.plan.filter((item) => item.vendorId !== vendorId);
  savePlan();
}

function inPlan(vendorId) { return state.plan.some((item) => item.vendorId === vendorId); }

function isFav(vendorId) { return state.favs.includes(vendorId); }

function toggleFav(vendorId) {
  state.favs = isFav(vendorId) ? state.favs.filter((id) => id !== vendorId) : [...state.favs, vendorId];
  writeJson(STORAGE.favs, state.favs);
  $$(`[data-fav="${vendorId}"]`).forEach((btn) => {
    btn.classList.toggle("on", isFav(vendorId));
    btn.setAttribute("aria-pressed", isFav(vendorId));
  });
  toast(isFav(vendorId) ? t("Saved to your favourites") : t("Removed from favourites"));
  document.dispatchEvent(new CustomEvent("favs:change"));
}

// ---------- Header & footer ----------
const NAV = [
  { href: "index.html", label: "Home", page: "home" },
  { href: "services.html#halls", label: "Venues", page: "halls" },
  { href: "services.html#photographers", label: "Photographers", page: "photographers" },
  { href: "services.html#catering", label: "Food", page: "catering" },
  { href: "services.html#makeup", label: "Makeup", page: "makeup" },
  { href: "services.html#cakes", label: "Cakes", page: "cakes" },
  { href: "planner.html", label: "Planner", page: "planner" },
];

function renderHeader() {
  const header = $("#site-header");
  if (!header) return;
  header.className = "site-header";
  header.innerHTML = `
    <div class="nav-inner">
      <a class="brand" href="index.html"><i class="fas fa-ring"></i><span>${escapeHtml(SITE.brand)}</span></a>
      <nav class="nav-links" id="nav-links" aria-label="${t("Main menu")}">
        ${NAV.map((link) => `<a href="${link.href}" data-nav="${link.page}">${t(link.label)}</a>`).join("")}
      </nav>
      <div class="nav-actions">
        <div class="lang">
          <button class="icon-btn lang-btn" id="lang-toggle" type="button" aria-haspopup="true" aria-expanded="false" aria-label="${t("Language")}">
            <i class="fas fa-globe"></i><span>${LANGS[LANG].short}</span>
          </button>
          <div class="lang-menu" id="lang-menu" hidden>
            ${Object.entries(LANGS).map(([code, lang]) => `<button type="button" lang="${code}" data-lang="${code}" class="${code === LANG ? "active" : ""}">${lang.name}</button>`).join("")}
          </div>
        </div>
        <button class="icon-btn" id="theme-toggle" type="button" aria-label="${t("Switch light / dark")}"><i class="fas fa-moon"></i></button>
        <button class="plan-btn" id="plan-open" type="button" aria-label="${t("Open my wedding plan")}">
          <i class="fas fa-clipboard-list"></i><span class="plan-label">${t("My plan")}</span><span class="badge" id="plan-count">0</span>
        </button>
        <button class="icon-btn menu-btn" id="menu-toggle" type="button" aria-label="${t("Menu")}" aria-expanded="false"><i class="fas fa-bars"></i></button>
      </div>
    </div>`;

  $("#menu-toggle").addEventListener("click", () => {
    const open = header.classList.toggle("menu-open");
    $("#menu-toggle").setAttribute("aria-expanded", open);
  });
  $$("#nav-links a").forEach((a) => a.addEventListener("click", () => header.classList.remove("menu-open")));
  $("#plan-open").addEventListener("click", openPlan);
  $("#theme-toggle").addEventListener("click", () => setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"));
  setTheme(document.documentElement.dataset.theme || "light", false);

  const langMenu = $("#lang-menu");
  $("#lang-toggle").addEventListener("click", (event) => {
    event.stopPropagation();
    langMenu.hidden = !langMenu.hidden;
    $("#lang-toggle").setAttribute("aria-expanded", !langMenu.hidden);
  });
  $$("[data-lang]", langMenu).forEach((btn) => btn.addEventListener("click", () => setLang(btn.dataset.lang)));
  document.addEventListener("click", () => { langMenu.hidden = true; });

  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 20);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  markActiveNav();
  window.addEventListener("hashchange", markActiveNav);
}

function markActiveNav() {
  const page = document.body.dataset.page === "services" ? (location.hash.slice(1) || "halls") : document.body.dataset.page;
  $$("[data-nav]").forEach((a) => a.classList.toggle("active", a.dataset.nav === page));
}

function setTheme(theme, save = true) {
  document.documentElement.dataset.theme = theme;
  const icon = $("#theme-toggle i");
  if (icon) icon.className = theme === "dark" ? "fas fa-sun" : "fas fa-moon";
  if (save) { try { localStorage.setItem(STORAGE.theme, theme); } catch (error) { /* ignore */ } }
}

function renderFooter() {
  const footer = $("#site-footer");
  if (!footer) return;
  footer.className = "site-footer";
  footer.innerHTML = `
    <div class="container footer-grid">
      <div>
        <a class="brand" href="index.html"><i class="fas fa-ring"></i><span>${escapeHtml(SITE.brand)}</span></a>
        <p class="muted">${t("Everything for your wedding day in one place — venues, photographers, food, makeup and cakes.")}</p>
        <div class="socials">
          <a href="#" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
          <a href="#" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
          <a href="#" aria-label="TikTok"><i class="fab fa-tiktok"></i></a>
          <a href="https://wa.me/${SITE.whatsapp}" target="_blank" rel="noopener" aria-label="WhatsApp"><i class="fab fa-whatsapp"></i></a>
        </div>
      </div>
      <div>
        <h4>${t("Services")}</h4>
        ${CATEGORIES.map((cat) => `<a href="services.html#${cat.id}">${t(cat.name)}</a>`).join("")}
      </div>
      <div>
        <h4>${t("Plan")}</h4>
        <a href="planner.html">${t("Wedding planner")}</a>
        <a href="planner.html#checklist">${t("Checklist")}</a>
        <a href="planner.html#budget">${t("Budget")}</a>
        <a href="index.html#faq">${t("Questions")}</a>
      </div>
      <div>
        <h4>${t("Contact")}</h4>
        <p><i class="fas fa-map-marker-alt"></i> ${escapeHtml(t(SITE.address))}</p>
        <p><i class="fas fa-phone"></i> <span dir="ltr">${escapeHtml(SITE.phone)}</span></p>
        <p><i class="fas fa-envelope"></i> ${escapeHtml(SITE.email)}</p>
      </div>
    </div>
    <p class="copyright">© ${new Date().getFullYear()} ${escapeHtml(SITE.brand)} — ${t("Made with love for brides.")} <i class="fas fa-heart"></i></p>`;
}

// ---------- Wedding plan drawer ----------
function renderShell() {
  document.body.insertAdjacentHTML("beforeend", `
    <div class="backdrop" id="backdrop" hidden></div>
    <aside class="drawer" id="plan-drawer" aria-label="${t("My wedding plan")}" aria-hidden="true">
      <div class="drawer-head">
        <h3><i class="fas fa-clipboard-list"></i> ${t("My wedding plan")}</h3>
        <button class="icon-btn" type="button" data-close aria-label="${t("Close")}"><i class="fas fa-times"></i></button>
      </div>
      <div class="drawer-body" id="plan-body"></div>
      <div class="drawer-foot" id="plan-foot"></div>
    </aside>
    <div class="modal" id="modal" role="dialog" aria-modal="true" hidden>
      <div class="modal-card" id="modal-card"></div>
    </div>
    <div class="lightbox" id="lightbox" hidden>
      <button class="lb-btn lb-close" type="button" aria-label="${t("Close")}"><i class="fas fa-times"></i></button>
      <button class="lb-btn lb-prev" type="button" aria-label="${t("Previous")}"><i class="fas fa-chevron-left"></i></button>
      <img alt="">
      <button class="lb-btn lb-next" type="button" aria-label="${t("Next")}"><i class="fas fa-chevron-right"></i></button>
    </div>
    <div class="toast" id="toast" role="status" aria-live="polite"></div>
    <a class="wa-float" href="https://wa.me/${SITE.whatsapp}" target="_blank" rel="noopener" aria-label="${t("Chat on WhatsApp")}"><i class="fab fa-whatsapp"></i></a>`);

  $("#backdrop").addEventListener("click", closeAll);
  $("#plan-drawer [data-close]").addEventListener("click", closeAll);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeAll();
    const forward = LANGS[LANG].dir === "rtl" ? "ArrowLeft" : "ArrowRight";
    const back = LANGS[LANG].dir === "rtl" ? "ArrowRight" : "ArrowLeft";
    if (!$("#lightbox").hidden && event.key === forward) stepLightbox(1);
    if (!$("#lightbox").hidden && event.key === back) stepLightbox(-1);
  });
  $("#modal").addEventListener("click", (event) => { if (event.target.id === "modal") closeAll(); });
  $(".lb-close").addEventListener("click", closeLightbox);
  $(".lb-prev").addEventListener("click", () => stepLightbox(-1));
  $(".lb-next").addEventListener("click", () => stepLightbox(1));
  $("#lightbox").addEventListener("click", (event) => { if (event.target.id === "lightbox") closeLightbox(); });
}

function openPlan() {
  renderPlan();
  $("#plan-drawer").classList.add("open");
  $("#plan-drawer").setAttribute("aria-hidden", "false");
  $("#backdrop").hidden = false;
  document.body.classList.add("no-scroll");
}

function closeAll() {
  if (!$("#lightbox").hidden) { closeLightbox(); return; }
  $("#plan-drawer").classList.remove("open");
  $("#plan-drawer").setAttribute("aria-hidden", "true");
  $("#modal").hidden = true;
  $("#backdrop").hidden = true;
  document.body.classList.remove("no-scroll");
}

function renderPlan() {
  const count = $("#plan-count");
  if (count) {
    count.textContent = state.plan.length;
    count.classList.toggle("show", state.plan.length > 0);
  }
  const body = $("#plan-body");
  if (!body) return;

  if (!state.plan.length) {
    body.innerHTML = `
      <div class="empty">
        <i class="fas fa-heart"></i>
        <p>${t("Your plan is empty.")}</p>
        <p class="muted">${t("Pick a venue, a photographer, a menu… and they will show up here with the total price.")}</p>
        <a class="btn btn-primary" href="services.html#halls">${t("Start with a venue")}</a>
      </div>`;
    $("#plan-foot").innerHTML = "";
    return;
  }

  const ordered = CATEGORIES.flatMap((cat) => state.plan.filter((item) => vendorById(item.vendorId).cat === cat.id));
  body.innerHTML = ordered.map((item) => {
    const vendor = vendorById(item.vendorId);
    const cat = catById(vendor.cat);
    const pkg = packageOf(vendor, item.pkgId);
    const details = [
      t(pkg.name),
      item.date ? prettyDate(item.date) : "",
      cat.unit === "guest" ? t("{n} guests × {price}", { n: item.guests, price: money(pkg.price) }) : "",
      item.flavor ? t(item.flavor) : "",
    ].filter(Boolean);
    return `
      <div class="plan-line">
        <img src="${vendor.img}" alt="">
        <div class="plan-info">
          <span class="chip"><i class="fas ${cat.icon}"></i> ${t(cat.name)}</span>
          <strong>${escapeHtml(t(vendor.name))}</strong>
          <small>${details.map(escapeHtml).join(" · ")}</small>
          <div class="plan-line-actions">
            <button type="button" class="link-btn" data-edit="${vendor.id}">${t("Change")}</button>
            <button type="button" class="link-btn danger" data-remove="${vendor.id}">${t("Remove")}</button>
          </div>
        </div>
        <span class="plan-price">${money(itemTotal(item))}</span>
      </div>`;
  }).join("");

  const missing = CATEGORIES.filter((cat) => !state.plan.some((item) => vendorById(item.vendorId).cat === cat.id));
  if (missing.length) {
    body.insertAdjacentHTML("beforeend", `
      <div class="missing">
        <p class="muted">${t("Still missing:")}</p>
        ${missing.map((cat) => `<a class="chip chip-link" href="services.html#${cat.id}"><i class="fas ${cat.icon}"></i> ${t(cat.name)}</a>`).join("")}
      </div>`);
  }

  const total = planTotal();
  const budget = Number(state.settings.budget) || 0;
  const left = budget - total;
  $("#plan-foot").innerHTML = `
    <div class="total-row"><span>${t("Total")}</span><strong>${money(total)}</strong></div>
    ${budget ? `
      <div class="budget-bar ${left < 0 ? "over" : ""}"><span style="width:${Math.min(100, (total / budget) * 100)}%"></span></div>
      <p class="muted small">${left >= 0 ? t("{left} left of your {budget} budget", { left: money(left), budget: money(budget) }) : t("{over} over your budget", { over: money(-left) })}</p>` :
      `<p class="muted small"><a href="planner.html#budget">${t("Set a budget in the planner to see how much is left.")}</a></p>`}
    <button class="btn btn-whatsapp btn-block" type="button" id="send-plan"><i class="fab fa-whatsapp"></i> ${t("Send my plan to book")}</button>
    <a class="btn btn-ghost btn-block" href="planner.html">${t("Open the planner")}</a>`;

  $$("[data-remove]", body).forEach((btn) => btn.addEventListener("click", () => {
    removeFromPlan(btn.dataset.remove);
    toast(t("Removed from your plan"));
  }));
  $$("[data-edit]", body).forEach((btn) => btn.addEventListener("click", () => openBooking(btn.dataset.edit)));
  $("#send-plan").addEventListener("click", sendPlan);
}

function planMessage() {
  const s = state.settings;
  const lines = [t("Hello {brand}! I'd like to book my wedding:", { brand: SITE.brand })];
  if (s.names) lines.push(t("Couple: {names}", { names: s.names }));
  if (s.weddingDate) lines.push(t("Wedding date: {date}", { date: prettyDate(s.weddingDate) }));
  if (s.guests) lines.push(t("Guests: {n}", { n: s.guests }));
  lines.push("");
  state.plan.forEach((item) => {
    const vendor = vendorById(item.vendorId);
    const cat = catById(vendor.cat);
    const pkg = packageOf(vendor, item.pkgId);
    let line = `• ${t(cat.name)}: ${t(vendor.name)} — ${t(pkg.name)}`;
    if (item.date) line += ` — ${prettyDate(item.date)}`;
    if (cat.unit === "guest") line += ` — ${t("{n} guests", { n: item.guests })}`;
    if (item.flavor) line += ` — ${t(item.flavor)}`;
    line += ` — ${money(itemTotal(item))}`;
    lines.push(line);
    if (item.note) lines.push(`   ${t("Note: {note}", { note: item.note })}`);
  });
  lines.push("", t("Total: {total}", { total: money(planTotal()) }));
  return lines.join("\n");
}

function sendPlan() {
  if (!state.plan.length) { toast(t("Your plan is empty.")); return; }
  window.open(`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(planMessage())}`, "_blank", "noopener");
}

// ---------- Modal ----------
function openModal(html, wide = false) {
  const card = $("#modal-card");
  card.className = `modal-card${wide ? " wide" : ""}`;
  card.innerHTML = `<button class="icon-btn modal-close" type="button" aria-label="${t("Close")}"><i class="fas fa-times"></i></button>${html}`;
  $(".modal-close", card).addEventListener("click", closeAll);
  $("#plan-drawer").classList.remove("open");
  $("#modal").hidden = false;
  $("#backdrop").hidden = false;
  document.body.classList.add("no-scroll");
  card.scrollTop = 0;
  return card;
}

// Food and cakes are ordered; venues, photographers and makeup artists are booked.
function isOrdered(cat) { return cat.id === "catering" || cat.id === "cakes"; }
function bookLabel(cat) { return isOrdered(cat) ? t("Order") : t("Book"); }

// Vendor details: photos, what's included, packages.
function openDetails(vendorId) {
  const vendor = vendorById(vendorId);
  const cat = catById(vendor.cat);
  const list = vendor.menu || vendor.features || [];
  const brides = cat.id === "makeup" && vendor.gallery;
  const photos = brides ? [...vendor.gallery, vendor.img] : [vendor.img, ...(vendor.gallery || [])];
  const meta = [
    vendor.place && `<span><i class="fas fa-map-marker-alt"></i> ${escapeHtml(t(vendor.place))}</span>`,
    vendor.capacity && `<span><i class="fas fa-users"></i> ${t("Up to {n} guests", { n: vendor.capacity })}</span>`,
    vendor.style && `<span><i class="fas fa-magic"></i> ${escapeHtml(t(vendor.style))}</span>`,
    vendor.minGuests && `<span><i class="fas fa-users"></i> ${t("From {n} guests", { n: vendor.minGuests })}</span>`,
    vendor.servings && `<span><i class="fas fa-birthday-cake"></i> ${t("{n} servings", { n: vendor.servings })}</span>`,
  ].filter(Boolean).join("");

  const card = openModal(`
    <div class="details">
      <div class="details-media">
        <div class="details-main-wrap ${brides ? "portrait" : ""}">
          <img src="${photos[0]}" alt="${escapeHtml(t(vendor.name))}" class="details-main" data-photo="0">
          ${brides ? `<span class="photo-tag"><i class="fas fa-heart"></i> ${t("Real brides by {name}", { name: escapeHtml(t(vendor.name)) })}</span>` : ""}
        </div>
        ${photos.length > 1 ? `<div class="thumbs">${photos.map((src, i) => `<img src="${src}" alt="" data-photo="${i}" loading="lazy">`).join("")}</div>` : ""}
      </div>
      <div class="details-text">
        <span class="chip"><i class="fas ${cat.icon}"></i> ${t(cat.name)}</span>
        <h2>${escapeHtml(t(vendor.name))}</h2>
        <p class="rating">${stars(vendor.rating)} <strong>${vendor.rating}</strong> <span class="muted">${t("({n} reviews)", { n: vendor.reviews })}</span></p>
        <div class="meta">${meta}</div>
        <p>${escapeHtml(t(vendor.about))}</p>
        ${list.length ? `<h4>${vendor.menu ? t("On the menu") : t("Included")}</h4><ul class="ticks">${list.map((x) => `<li><i class="fas fa-check"></i> ${escapeHtml(t(x))}</li>`).join("")}</ul>` : ""}
        ${vendor.flavors ? `<h4>${t("Flavours")}</h4><p class="muted">${vendor.flavors.map((f) => escapeHtml(t(f))).join(" · ")}</p>` : ""}
        <h4>${t("Packages")}</h4>
        <ul class="pkg-list">${vendor.packages.map((pkg) => `<li><span>${escapeHtml(t(pkg.name))}</span><strong>${money(pkg.price)}${cat.unit === "guest" ? ` <small>${t("/ guest")}</small>` : ""}</strong></li>`).join("")}</ul>
        <div class="details-actions">
          <button class="btn btn-primary" type="button" data-book="${vendor.id}"><i class="fas fa-calendar-check"></i> ${isOrdered(cat) ? t("Order") : t("Check dates & book")}</button>
          <button class="icon-btn fav ${isFav(vendor.id) ? "on" : ""}" type="button" data-fav="${vendor.id}" aria-pressed="${isFav(vendor.id)}" aria-label="${t("Save to favourites")}"><i class="fas fa-heart"></i></button>
        </div>
      </div>
    </div>`, true);

  // Thumbnails swap the big photo; the big photo opens the full-screen viewer.
  const main = $(".details-main", card);
  $$(".thumbs [data-photo]", card).forEach((img) => img.addEventListener("click", () => {
    main.src = photos[Number(img.dataset.photo)];
    main.dataset.photo = img.dataset.photo;
    $$(".thumbs img", card).forEach((x) => x.classList.toggle("active", x === img));
  }));
  const firstThumb = $(".thumbs img", card);
  if (firstThumb) firstThumb.classList.add("active");
  main.addEventListener("click", () => openLightbox(photos, Number(main.dataset.photo)));
  $("[data-book]", card).addEventListener("click", () => openBooking(vendor.id));
  $("[data-fav]", card).addEventListener("click", () => toggleFav(vendor.id));
}

// Booking: calendar with booked days, package, guests / flavour, note, live total.
function openBooking(vendorId) {
  const vendor = vendorById(vendorId);
  const cat = catById(vendor.cat);
  const existing = state.plan.find((item) => item.vendorId === vendorId);
  const perGuest = cat.unit === "guest";
  const minGuests = vendor.minGuests || 1;
  const form = {
    date: existing?.date || state.settings.weddingDate || "",
    pkgId: existing?.pkgId || vendor.packages[0].id,
    guests: existing?.guests || Math.max(minGuests, Number(state.settings.guests) || 0),
    flavor: existing?.flavor || (vendor.flavors ? vendor.flavors[0] : ""),
    note: existing?.note || "",
  };
  const start = form.date ? parseIso(form.date) : new Date();
  let view = { y: start.getFullYear(), m: start.getMonth() };
  const dateLabel = cat.id === "cakes" ? t("Delivery day") : cat.id === "catering" ? t("Event day") : t("Your wedding day");

  const card = openModal(`
    <div class="booking">
      <div class="booking-head">
        <img src="${vendor.img}" alt="">
        <div>
          <span class="chip"><i class="fas ${cat.icon}"></i> ${t(cat.name)}</span>
          <h2>${escapeHtml(t(vendor.name))}</h2>
          <p class="muted">${stars(vendor.rating)} ${vendor.rating} · ${escapeHtml(t(vendor.place || ""))}</p>
        </div>
      </div>
      <div class="booking-grid">
        <div>
          <h4>${dateLabel}</h4>
          <div class="calendar" id="calendar"></div>
          <div class="legend"><span><i class="dot free"></i> ${t("Free")}</span><span><i class="dot busy"></i> ${t("Booked")}</span><span><i class="dot picked"></i> ${t("Your pick")}</span></div>
          <p class="availability" id="availability"></p>
        </div>
        <div>
          <h4>${t("Package")}</h4>
          <div class="pkg-options">
            ${vendor.packages.map((pkg) => `
              <label class="pkg-option">
                <input type="radio" name="pkg" value="${pkg.id}" ${pkg.id === form.pkgId ? "checked" : ""}>
                <span><span>${escapeHtml(t(pkg.name))}</span><strong>${money(pkg.price)}${perGuest ? ` <small>${t("/ guest")}</small>` : ""}</strong></span>
              </label>`).join("")}
          </div>
          ${perGuest ? `
            <h4>${t("Guests")} <small class="muted">${t("(at least {n})", { n: minGuests })}</small></h4>
            <div class="stepper">
              <button type="button" data-step="-10" aria-label="${t("10 less")}"><i class="fas fa-minus"></i></button>
              <input type="number" id="guests" min="${minGuests}" step="1" value="${form.guests}" inputmode="numeric" aria-label="${t("Number of guests")}">
              <button type="button" data-step="10" aria-label="${t("10 more")}"><i class="fas fa-plus"></i></button>
            </div>` : ""}
          ${vendor.flavors ? `
            <h4>${t("Flavour")}</h4>
            <select id="flavor" class="input">${vendor.flavors.map((f) => `<option value="${escapeHtml(f)}" ${f === form.flavor ? "selected" : ""}>${escapeHtml(t(f))}</option>`).join("")}</select>` : ""}
          <h4>${t("Notes")} <small class="muted">${t("(optional)")}</small></h4>
          <textarea id="note" class="input" rows="2" placeholder="${cat.id === "cakes" ? t("Names on the cake, colours…") : t("Anything we should know…")}">${escapeHtml(form.note)}</textarea>
          <div class="booking-total"><span>${t("Total")}</span><strong id="booking-total"></strong></div>
          <button class="btn btn-primary btn-block" type="button" id="add-plan"><i class="fas fa-plus"></i> ${existing ? t("Update my plan") : t("Add to my plan")}</button>
        </div>
      </div>
    </div>`, true);

  function drawCalendar() {
    const first = new Date(view.y, view.m, 1);
    const days = new Date(view.y, view.m + 1, 0).getDate();
    const today = todayIso();
    const now = new Date();
    const canGoBack = view.y > now.getFullYear() || (view.y === now.getFullYear() && view.m > now.getMonth());
    let cells = "";
    for (let i = 0; i < first.getDay(); i++) cells += "<span></span>";
    for (let d = 1; d <= days; d++) {
      const iso = isoDate(new Date(view.y, view.m, d));
      const past = iso < today;
      const busy = isBooked(vendor, iso);
      const cls = [past ? "past" : "", busy ? "busy" : "", iso === form.date ? "picked" : "", iso === state.settings.weddingDate ? "wedding" : ""].join(" ");
      cells += `<button type="button" class="day ${cls}" data-day="${iso}" ${past || busy ? "disabled" : ""} aria-label="${prettyDate(iso)}${busy ? ` — ${t("Booked")}` : ""}">${d}</button>`;
    }
    $("#calendar", card).innerHTML = `
      <div class="cal-head">
        <button type="button" class="icon-btn" data-month="-1" ${canGoBack ? "" : "disabled"} aria-label="${t("Previous month")}"><i class="fas fa-chevron-left flip-rtl"></i></button>
        <strong>${MONTHS[view.m]} ${view.y}</strong>
        <button type="button" class="icon-btn" data-month="1" aria-label="${t("Next month")}"><i class="fas fa-chevron-right flip-rtl"></i></button>
      </div>
      <div class="cal-grid">${WEEKDAYS.map((w) => `<span class="wd">${w}</span>`).join("")}${cells}</div>`;
    $$("[data-month]", card).forEach((btn) => btn.addEventListener("click", () => {
      const m = view.m + Number(btn.dataset.month);
      view = { y: view.y + Math.floor(m / 12), m: (m + 12) % 12 };
      drawCalendar();
    }));
    $$("[data-day]", card).forEach((btn) => btn.addEventListener("click", () => { form.date = btn.dataset.day; update(); }));
  }

  function update() {
    drawCalendar();
    const pkg = packageOf(vendor, form.pkgId);
    const total = perGuest ? pkg.price * form.guests : pkg.price;
    $("#booking-total", card).textContent = money(total);
    const note = $("#availability", card);
    const addBtn = $("#add-plan", card);
    const tooFew = perGuest && form.guests < minGuests;
    if (!form.date) {
      note.className = "availability";
      note.innerHTML = `<i class="fas fa-hand-pointer"></i> ${t("Pick a day on the calendar.")}`;
    } else if (isBooked(vendor, form.date)) {
      const free = nextFreeDates(vendor, form.date);
      note.className = "availability bad";
      note.innerHTML = `<i class="fas fa-times-circle"></i> ${t("Booked on {date}. Free days nearby:", { date: prettyDate(form.date) })} ${free.map((d) => `<button type="button" class="link-btn" data-free="${d}">${prettyDate(d)}</button>`).join(LANG === "ar" ? "، " : ", ")}`;
      $$("[data-free]", note).forEach((btn) => btn.addEventListener("click", () => { form.date = btn.dataset.free; update(); }));
    } else {
      note.className = "availability ok";
      note.innerHTML = `<i class="fas fa-check-circle"></i> ${t("Available on {date}", { date: prettyDate(form.date) })}`;
    }
    addBtn.disabled = !form.date || isBooked(vendor, form.date) || tooFew;
    if (tooFew) addBtn.title = t("This menu needs at least {n} guests", { n: minGuests });
    else addBtn.removeAttribute("title");
  }

  $$("input[name=pkg]", card).forEach((input) => input.addEventListener("change", () => { form.pkgId = input.value; update(); }));
  if (perGuest) {
    const guests = $("#guests", card);
    guests.addEventListener("input", () => { form.guests = Math.max(0, parseInt(guests.value, 10) || 0); update(); });
    $$("[data-step]", card).forEach((btn) => btn.addEventListener("click", () => {
      form.guests = Math.max(minGuests, form.guests + Number(btn.dataset.step));
      guests.value = form.guests;
      update();
    }));
  }
  if (vendor.flavors) $("#flavor", card).addEventListener("change", (event) => { form.flavor = event.target.value; });
  $("#note", card).addEventListener("input", (event) => { form.note = event.target.value; });
  $("#add-plan", card).addEventListener("click", () => {
    addToPlan({ vendorId: vendor.id, pkgId: form.pkgId, date: form.date, guests: perGuest ? form.guests : 0, flavor: vendor.flavors ? form.flavor : "", note: form.note.trim() });
    if (!state.settings.weddingDate && cat.id !== "cakes") saveSettings({ weddingDate: form.date });
    if (perGuest && !state.settings.guests) saveSettings({ guests: form.guests });
    toast(t("{name} added to your plan", { name: t(vendor.name) }));
    closeAll();
    openPlan();
  });
  update();
}

// ---------- Photo viewer ----------
const lightbox = { photos: [], index: 0 };

function openLightbox(photos, index = 0) {
  lightbox.photos = photos;
  lightbox.index = index;
  $("#lightbox").hidden = false;
  $("#lightbox").classList.toggle("single", photos.length < 2);
  showLightbox();
}

function showLightbox() { $("#lightbox img").src = lightbox.photos[lightbox.index]; }

function stepLightbox(step) {
  lightbox.index = (lightbox.index + step + lightbox.photos.length) % lightbox.photos.length;
  showLightbox();
}

function closeLightbox() { $("#lightbox").hidden = true; }

// ---------- Vendor card (used on home and services pages) ----------
function vendorCard(vendor) {
  const cat = catById(vendor.cat);
  const date = state.settings.weddingDate;
  const showDate = date && cat.id !== "catering";
  const busy = showDate && isBooked(vendor, date);
  const sub = [
    escapeHtml(t(vendor.style || vendor.place)),
    vendor.capacity ? t("up to {n} guests", { n: vendor.capacity }) : "",
    vendor.servings ? t("{n} servings", { n: vendor.servings }) : "",
  ].filter(Boolean).join(" · ");
  return `
    <article class="card vendor-card reveal" data-id="${vendor.id}">
      <div class="card-media">
        <img src="${vendor.img}" alt="${escapeHtml(t(vendor.name))}" loading="lazy">
        <button class="icon-btn fav ${isFav(vendor.id) ? "on" : ""}" type="button" data-fav="${vendor.id}" aria-pressed="${isFav(vendor.id)}" aria-label="${t("Save to favourites")}"><i class="fas fa-heart"></i></button>
        ${showDate ? `<span class="avail ${busy ? "bad" : "ok"}"><i class="fas ${busy ? "fa-times-circle" : "fa-check-circle"}"></i> ${busy ? t("Booked on your day") : t("Free on your day")}</span>` : ""}
        ${inPlan(vendor.id) ? `<span class="in-plan"><i class="fas fa-check"></i> ${t("In your plan")}</span>` : ""}
      </div>
      <div class="card-body">
        <div class="card-top">
          <h3>${escapeHtml(t(vendor.name))}</h3>
          <span class="rating-sm"><i class="fas fa-star"></i> ${vendor.rating}</span>
        </div>
        <p class="muted small">${sub}</p>
        <p class="card-about">${escapeHtml(t(vendor.about))}</p>
        <div class="card-foot">
          <span class="price"><small>${t("from")}</small> ${money(lowestPrice(vendor))}${cat.unit === "guest" ? `<small> ${t("/ guest")}</small>` : ""}</span>
          <div class="card-btns">
            <button class="btn btn-ghost btn-sm" type="button" data-details="${vendor.id}">${t("Details")}</button>
            <button class="btn btn-primary btn-sm" type="button" data-book="${vendor.id}">${bookLabel(cat)}</button>
          </div>
        </div>
      </div>
    </article>`;
}

// One click handler for every vendor card on the page.
document.addEventListener("click", (event) => {
  const target = event.target.closest("[data-fav], [data-details], [data-book]");
  if (!target || target.closest("#modal")) return;
  if (target.dataset.fav) toggleFav(target.dataset.fav);
  else if (target.dataset.details) openDetails(target.dataset.details);
  else if (target.dataset.book) openBooking(target.dataset.book);
});

// ---------- Toast & reveal-on-scroll ----------
let toastTimer;
function toast(message) {
  const box = $("#toast");
  if (!box) return;
  box.textContent = message;
  box.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => box.classList.remove("show"), 2600);
}

const revealer = "IntersectionObserver" in window ? new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("in");
      revealer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 }) : null;

function watchReveals(root = document) {
  $$(".reveal:not(.in)", root).forEach((el) => (revealer ? revealer.observe(el) : el.classList.add("in")));
}

// ---------- Start ----------
document.addEventListener("DOMContentLoaded", () => {
  applyI18n();
  renderHeader();
  renderFooter();
  renderShell();
  renderPlan();
  watchReveals();
});
