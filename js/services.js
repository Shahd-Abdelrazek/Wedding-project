
"use strict";

const HERO = {
  halls: { img: "images/halls/garden.jpg", script: "Say yes here", title: "Wedding venues", text: "Gardens, sea terraces and ballrooms — see capacity, prices and free dates." },
  photographers: { img: "images/portfolio/w4.jpg", script: "Every moment", title: "Photographers", text: "Browse portfolios, pick a package and check if they're free on your day." },
  catering: { img: "images/food/buffet.jpg", script: "Feed the love", title: "Food menus", text: "Buffets, grills and plated dinners. Prices are per guest — set your guest count when you order." },
  makeup: { img: "images/makeup/looks/m5-1.jpg", script: "Your glow", title: "Makeup artists", text: "Soft glam, full glam or natural, with hair and hijab styling." },
  cakes: { img: "images/cakes/rose-garden.jpg", script: "Something sweet", title: "Wedding cakes", text: "Choose the design, size and flavour. We deliver to your venue on the day." },
};

const filters = { search: "", sort: "rating", onlyFree: false, onlyFavs: false };

function currentCat() {
  const id = location.hash.slice(1);
  return catById(id) ? id : CATEGORIES[0].id;
}

document.addEventListener("DOMContentLoaded", () => {
  $("#filter-date").min = todayIso();
  $("#filter-date").value = state.settings.weddingDate || "";
  $("#search").addEventListener("input", (event) => { filters.search = event.target.value.trim().toLowerCase(); renderVendors(); });
  $("#sort").addEventListener("change", (event) => { filters.sort = event.target.value; renderVendors(); });
  $("#only-free").addEventListener("change", (event) => { filters.onlyFree = event.target.checked; renderVendors(); });
  $("#only-favs").addEventListener("change", (event) => { filters.onlyFavs = event.target.checked; renderVendors(); });
  $("#filter-date").addEventListener("change", (event) => saveSettings({ weddingDate: event.target.value }));

  window.addEventListener("hashchange", renderPage);
  document.addEventListener("settings:change", renderVendors);
  document.addEventListener("plan:change", renderVendors);
  document.addEventListener("favs:change", () => { if (filters.onlyFavs) renderVendors(); });
  renderPage();
});

function renderPage() {
  const cat = currentCat();
  const hero = HERO[cat];
  $("#page-hero").style.backgroundImage = `url(${hero.img})`;
  $("#hero-script").textContent = t(hero.script);
  $("#hero-title").textContent = t(hero.title);
  $("#hero-text").textContent = t(hero.text);
  document.title = `${t(hero.title)} — ${SITE.brand}`;

  $("#cat-tabs").innerHTML = CATEGORIES.map((c) => `
    <a class="tab ${c.id === cat ? "active" : ""}" role="tab" aria-selected="${c.id === cat}" href="#${c.id}">
      <i class="fas ${c.icon}"></i> ${t(c.name)}
    </a>`).join("");

  // Food menus have no date limits, so the "free on my day" switch is hidden there.
  $("#only-free").closest(".switch").hidden = cat === "catering";
  renderVendors();
}

// Search looks at the English text and the translated text, so both work.
function searchText(v) {
  const parts = [v.name, v.style, v.place, v.about, ...(v.menu || []), ...(v.features || [])].filter(Boolean);
  return parts.concat(parts.map((p) => t(p))).join(" ").toLowerCase();
}

function renderVendors() {
  const cat = currentCat();
  const date = state.settings.weddingDate;
  if ($("#filter-date").value !== date) $("#filter-date").value = date || "";

  let list = VENDORS.filter((v) => v.cat === cat);
  if (filters.search) list = list.filter((v) => searchText(v).includes(filters.search));
  if (filters.onlyFree && date && cat !== "catering") list = list.filter((v) => !isBooked(v, date));
  if (filters.onlyFavs) list = list.filter((v) => isFav(v.id));

  const sorters = {
    rating: (a, b) => b.rating - a.rating || b.reviews - a.reviews,
    "price-asc": (a, b) => lowestPrice(a) - lowestPrice(b),
    "price-desc": (a, b) => lowestPrice(b) - lowestPrice(a),
    reviews: (a, b) => b.reviews - a.reviews,
  };
  list.sort(sorters[filters.sort]);

  const total = VENDORS.filter((v) => v.cat === cat).length;
  const freeCount = date && cat !== "catering" ? VENDORS.filter((v) => v.cat === cat && !isBooked(v, date)).length : null;
  $("#results").innerHTML = t("Showing {n} of {total}", { n: list.length, total }) +
    (freeCount !== null ? ` · <strong>${t("{n} free on {date}", { n: freeCount, date: prettyDate(date) })}</strong>` : "") +
    (filters.onlyFree && !date ? ` · <em>${t("Pick your day to use “Free on my day”.")}</em>` : "");

  $("#vendors").innerHTML = list.length ? list.map(vendorCard).join("") : `
    <div class="empty wide">
      <i class="fas fa-search"></i>
      <p>${t("Nothing matches these filters.")}</p>
      <button class="btn btn-ghost" type="button" id="clear-filters">${t("Clear filters")}</button>
    </div>`;
  const clear = $("#clear-filters");
  if (clear) clear.addEventListener("click", () => {
    Object.assign(filters, { search: "", onlyFree: false, onlyFavs: false });
    $("#search").value = "";
    $("#only-free").checked = false;
    $("#only-favs").checked = false;
    renderVendors();
  });
  watchReveals($("#vendors"));
}
