const navLinks = [...document.querySelectorAll("[data-day-link]")];
const mapCard = document.querySelector(".flipbook-map");
const mapButtons = [...document.querySelectorAll("[data-map-day]")];
const dayTabs = [...document.querySelectorAll("[data-day-tab]")];
const dayPages = [...document.querySelectorAll("[data-day-page]")];
const branchPreview = document.querySelector(".flip-detail");

const previewCopy = {
  1: {
    title: "5/26 夜游",
    text: "先把行李放回住处，再从铁塔河岸一路切到疯马秀。",
  },
  2: {
    title: "5/27 艺术",
    text: "圣母院和奥赛连成左岸艺术线，节奏适合慢走。",
  },
  3: {
    title: "5/28 法网",
    text: "这一天留给 Roland-Garros，分支直接落到球场。",
  },
  4: {
    title: "5/29 返程",
    text: "卢浮宫之后回收行李，最后接到 CDG 返程。",
  },
};

function setActiveDay(day, options = {}) {
  const activeDay = String(day);

  navLinks.forEach((link) => {
    link.classList.toggle("active", link.dataset.dayLink === activeDay);
  });

  mapButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.mapDay === activeDay);
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

  if (mapCard) {
    mapCard.dataset.activeDay = activeDay;
  }

  if (branchPreview && previewCopy[activeDay]) {
    branchPreview.querySelector("strong").textContent = previewCopy[activeDay].title;
    branchPreview.querySelector("p").textContent = previewCopy[activeDay].text;
  }

  if (options.scrollToPlan) {
    document.querySelector("#timeline")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

setActiveDay(1);

[...navLinks, ...mapButtons, ...dayTabs].forEach((control) => {
  control.addEventListener("click", (event) => {
    const day = control.dataset.dayLink || control.dataset.mapDay || control.dataset.dayTab;
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
