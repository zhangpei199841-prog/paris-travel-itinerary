const navLinks = [...document.querySelectorAll("[data-day-link]")];
const dayTabs = [...document.querySelectorAll("[data-day-tab]")];
const dayPages = [...document.querySelectorAll("[data-day-page]")];

function setActiveDay(day, options = {}) {
  const activeDay = String(day);

  navLinks.forEach((link) => {
    link.classList.toggle("active", link.dataset.dayLink === activeDay);
  });

  dayTabs.forEach((tab) => {
    const isActive = tab.dataset.dayTab === activeDay;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });

  dayPages.forEach((page) => {
    const isActive = page.dataset.dayPage === activeDay;
    page.classList.toggle("active-page", isActive);
    page.hidden = !isActive;
  });

  if (options.scrollToPlan) {
    document.querySelector("#timeline")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

setActiveDay(1);

[...navLinks, ...dayTabs].forEach((control) => {
  control.addEventListener("click", (event) => {
    const day = control.dataset.dayLink || control.dataset.dayTab;
    if (!day) return;

    event.preventDefault();
    setActiveDay(day, { scrollToPlan: control.dataset.mapDay || control.dataset.dayLink });
  });
});

document.querySelectorAll('a[href^="#"]:not([data-day-link])').forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});
