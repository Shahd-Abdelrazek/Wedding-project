
"use strict";

// A typical share of the budget for each category (%), shown as a guide.
const BUDGET_GUIDE = { halls: 40, catering: 30, photographers: 15, makeup: 8, cakes: 7 };

const checklist = loadChecklist();

function loadChecklist() {
  const saved = readJson(STORAGE.checklist, null);
  if (saved && Array.isArray(saved.items)) return saved;
  return { items: DEFAULT_CHECKLIST.map((task) => ({ ...task, done: false })) };
}

function saveChecklist() {
  writeJson(STORAGE.checklist, checklist);
  renderChecklist();
}

document.addEventListener("DOMContentLoaded", () => {
  $$("[data-currency]").forEach((el) => { el.textContent = t(SITE.currency); });
  fillDetails();
  $("#details-form").addEventListener("input", () => {
    saveSettings({
      names: $("#p-names").value.trim(),
      weddingDate: $("#p-date").value,
      guests: Math.max(0, parseInt($("#p-guests").value, 10) || 0),
      budget: Math.max(0, parseInt($("#p-budget").value, 10) || 0),
    });
  });
  $("#details-form").addEventListener("submit", (event) => event.preventDefault());
  $("#send-plan-2").addEventListener("click", sendPlan);
  $("#print-plan").addEventListener("click", () => window.print());
  $("#add-task").addEventListener("submit", (event) => {
    event.preventDefault();
    const text = $("#new-task").value.trim();
    if (!text) return;
    checklist.items.push({ id: `c${Date.now()}`, text, when: "My task", done: false, custom: true });
    $("#new-task").value = "";
    saveChecklist();
  });

  document.addEventListener("settings:change", renderAll);
  document.addEventListener("plan:change", renderAll);
  renderAll();
  renderChecklist();
  setInterval(renderTimer, 60000);
});

function fillDetails() {
  const s = state.settings;
  $("#p-names").value = s.names || "";
  $("#p-date").value = s.weddingDate || "";
  $("#p-date").min = todayIso();
  $("#p-guests").value = s.guests || "";
  $("#p-budget").value = s.budget || "";
}

function renderAll() {
  const { names } = state.settings;
  $("#planner-title").textContent = names ? names : t("Let's plan your day");
  renderTimer();
  renderBudget();
  renderSlots();
}

function renderTimer() {
  const date = state.settings.weddingDate;
  const box = $("#mini-timer");
  if (!date) { box.innerHTML = `<p class="muted"><i class="fas fa-calendar-alt"></i> ${t("Add your wedding day to start the countdown.")}</p>`; return; }
  const days = Math.ceil((parseIso(date) - parseIso(todayIso())) / 864e5);
  if (days > 0) {
    box.innerHTML = `<strong>${days}</strong><span>${days === 1 ? t("day to go") : t("days to go")} · ${prettyDate(date)}</span>`;
  } else if (days === 0) {
    box.innerHTML = `<strong><i class="fas fa-heart"></i></strong><span>${t("Today is the day!")}</span>`;
  } else {
    box.innerHTML = `<span class="muted">${t("Your wedding date has passed — congratulations!")}</span>`;
  }
}

function renderBudget() {
  const budget = Number(state.settings.budget) || 0;
  const total = planTotal();
  const left = budget - total;
  $("#budget-summary").innerHTML = `
    <div><span class="muted">${t("Budget")}</span><strong>${budget ? money(budget) : "—"}</strong></div>
    <div><span class="muted">${t("Planned")}</span><strong>${money(total)}</strong></div>
    <div class="${left < 0 ? "over-text" : "ok-text"}"><span class="muted">${left < 0 ? t("Over") : t("Left")}</span><strong>${budget ? money(Math.abs(left)) : "—"}</strong></div>`;

  $("#cat-bars").innerHTML = CATEGORIES.map((cat) => {
    const spent = state.plan.filter((item) => vendorById(item.vendorId).cat === cat.id).reduce((sum, item) => sum + itemTotal(item), 0);
    const guide = budget ? (budget * BUDGET_GUIDE[cat.id]) / 100 : 0;
    const scale = Math.max(guide, spent, 1);
    const over = guide && spent > guide;
    return `
      <div class="cat-bar">
        <div class="cat-bar-label"><span><i class="fas ${cat.icon}"></i> ${t(cat.name)}</span><span>${money(spent)}${guide ? ` <small class="muted">/ ~${money(guide)}</small>` : ""}</span></div>
        <div class="bar-track">
          ${guide ? `<span class="bar-guide" style="width:${(guide / scale) * 100}%"></span>` : ""}
          <span class="bar-fill ${over ? "over" : ""}" style="width:${(spent / scale) * 100}%"></span>
        </div>
      </div>`;
  }).join("");
}

function renderSlots() {
  $("#vendor-slots").innerHTML = CATEGORIES.map((cat) => {
    const items = state.plan.filter((item) => vendorById(item.vendorId).cat === cat.id);
    if (!items.length) {
      return `
        <a class="slot empty-slot" href="services.html#${cat.id}">
          <i class="fas ${cat.icon}"></i>
          <span><strong>${t(cat.name)}</strong><small class="muted">${t("Not chosen yet")}</small></span>
          <span class="slot-add"><i class="fas fa-plus"></i> ${t("Choose")}</span>
        </a>`;
    }
    return items.map((item) => {
      const vendor = vendorById(item.vendorId);
      const pkg = packageOf(vendor, item.pkgId);
      const bits = [t(pkg.name), item.date && prettyDate(item.date), cat.unit === "guest" && t("{n} guests", { n: item.guests }), item.flavor && t(item.flavor)].filter(Boolean);
      const clash = item.date && state.settings.weddingDate && item.date !== state.settings.weddingDate && cat.id !== "cakes";
      return `
        <div class="slot">
          <img src="${vendor.img}" alt="">
          <span>
            <small class="chip"><i class="fas ${cat.icon}"></i> ${t(cat.name)}</small>
            <strong>${escapeHtml(t(vendor.name))}</strong>
            <small class="muted">${bits.map(escapeHtml).join(" · ")}</small>
            ${clash ? `<small class="warn-text"><i class="fas fa-exclamation-triangle"></i> ${t("Booked for a different day than your wedding")}</small>` : ""}
          </span>
          <span class="slot-end">
            <strong>${money(itemTotal(item))}</strong>
            <span>
              <button class="link-btn" type="button" data-edit-slot="${vendor.id}">${t("Change")}</button>
              <button class="link-btn danger" type="button" data-remove-slot="${vendor.id}">${t("Remove")}</button>
            </span>
          </span>
        </div>`;
    }).join("");
  }).join("");
  $$("[data-edit-slot]").forEach((btn) => btn.addEventListener("click", () => openBooking(btn.dataset.editSlot)));
  $$("[data-remove-slot]").forEach((btn) => btn.addEventListener("click", () => { removeFromPlan(btn.dataset.removeSlot); toast(t("Removed from your plan")); }));
}

function renderChecklist() {
  const done = checklist.items.filter((task) => task.done).length;
  const total = checklist.items.length;
  $("#check-progress").style.width = `${total ? (done / total) * 100 : 0}%`;
  $("#check-progress-text").textContent = t("{done} of {total} done", { done, total });
  // Built-in tasks are translated; tasks the couple typed are shown as written.
  $("#check-list").innerHTML = checklist.items.map((task) => `
    <li class="${task.done ? "done" : ""}">
      <label>
        <input type="checkbox" data-task="${task.id}" ${task.done ? "checked" : ""}>
        <span class="tick"><i class="fas fa-check"></i></span>
        <span class="task-text">${escapeHtml(task.custom ? task.text : t(task.text))}<small class="muted">${escapeHtml(t(task.when))}</small></span>
      </label>
      ${task.custom ? `<button class="icon-btn small" type="button" data-del-task="${task.id}" aria-label="${t("Delete task")}"><i class="fas fa-trash-alt"></i></button>` : ""}
    </li>`).join("");
  $$("[data-task]").forEach((box) => box.addEventListener("change", () => {
    const task = checklist.items.find((x) => x.id === box.dataset.task);
    task.done = box.checked;
    saveChecklist();
    if (checklist.items.every((x) => x.done)) toast(t("Everything is done — enjoy your day!"));
  }));
  $$("[data-del-task]").forEach((btn) => btn.addEventListener("click", () => {
    checklist.items = checklist.items.filter((x) => x.id !== btn.dataset.delTask);
    saveChecklist();
  }));
}
