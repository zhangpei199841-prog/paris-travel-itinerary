const navLinks = [...document.querySelectorAll(".topbar a")];
const mapCard = document.querySelector(".flipbook-map");
const mapButtons = [...document.querySelectorAll("[data-map-day]")];
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
const dayCards = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

function setActiveDay(day) {
  navLinks.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#day-${day}`);
  });

  mapButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.mapDay === String(day));
  });

  if (mapCard) {
    mapCard.dataset.activeDay = day;
  }

  if (branchPreview && previewCopy[day]) {
    branchPreview.querySelector("strong").textContent = previewCopy[day].title;
    branchPreview.querySelector("p").textContent = previewCopy[day].text;
  }
}

setActiveDay(1);

const observer = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;

    setActiveDay(visible.target.id.replace("day-", ""));
  },
  {
    rootMargin: "-20% 0px -58% 0px",
    threshold: [0.15, 0.35, 0.55],
  },
);

dayCards.forEach((card) => observer.observe(card));

mapButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const target = document.querySelector(`#day-${button.dataset.mapDay}`);
    setActiveDay(button.dataset.mapDay);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});
