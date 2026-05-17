const navLinks = [...document.querySelectorAll("[data-day-link]")];
const dayTabs = [...document.querySelectorAll("[data-day-tab]")];
const dayPages = [...document.querySelectorAll("[data-day-page]")];
const map = document.querySelector(".flipbook-map");
const mapStage = document.querySelector(".map-image-stage");
const editToggle = document.querySelector(".map-edit-toggle");
const draggableNodes = [...document.querySelectorAll("[data-node]")];
const routePaths = {
  1: ["cdg", "home", "eiffel", "crazy"],
  2: ["home", "notre", "orsay"],
  3: ["home", "roland"],
  4: ["home", "louvre", "cdg"],
};
const storageKey = "paris-trip-node-positions-v1";

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

function getStoredPositions() {
  try {
    return JSON.parse(localStorage.getItem(storageKey) || "{}");
  } catch {
    return {};
  }
}

function savePositions() {
  const positions = {};
  draggableNodes.forEach((node) => {
    positions[node.dataset.node] = {
      x: node.style.getPropertyValue("--x") || getComputedStyle(node).getPropertyValue("--x"),
      y: node.style.getPropertyValue("--y") || getComputedStyle(node).getPropertyValue("--y"),
    };
  });
  localStorage.setItem(storageKey, JSON.stringify(positions));
}

function applyStoredPositions() {
  const positions = getStoredPositions();
  draggableNodes.forEach((node) => {
    const position = positions[node.dataset.node];
    if (!position) return;
    node.style.setProperty("--x", position.x);
    node.style.setProperty("--y", position.y);
  });
}

function nodeCenter(nodeName) {
  const node = document.querySelector(`[data-node="${nodeName}"]`);
  if (!node || !mapStage) return { x: 0, y: 0 };

  const nodeRect = node.getBoundingClientRect();
  const stageRect = mapStage.getBoundingClientRect();

  return {
    x: ((nodeRect.left + nodeRect.width / 2 - stageRect.left) / stageRect.width) * 1000,
    y: ((nodeRect.top + nodeRect.height / 2 - stageRect.top) / stageRect.height) * 700,
  };
}

function routePath(points) {
  if (!points.length) return "";

  const [start, ...rest] = points;
  let d = `M${start.x.toFixed(1)} ${start.y.toFixed(1)}`;

  rest.forEach((point, index) => {
    const previous = points[index] || start;
    const dx = point.x - previous.x;
    const curve = Math.max(40, Math.min(120, Math.abs(dx) * 0.25));
    d += ` C${(previous.x + curve).toFixed(1)} ${previous.y.toFixed(1)} ${(point.x - curve).toFixed(1)} ${point.y.toFixed(1)} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
  });

  return d;
}

function updateRoutes() {
  Object.entries(routePaths).forEach(([day, nodes]) => {
    const points = nodes.map(nodeCenter);
    const path = document.querySelector(`[data-route="${day}"]`);
    const badge = document.querySelector(`[data-badge="${day}"]`);

    if (path) path.setAttribute("d", routePath(points));
    if (badge && points.length > 1) {
      const mid = points[Math.floor(points.length / 2)];
      badge.setAttribute("transform", `translate(${mid.x.toFixed(1)} ${mid.y.toFixed(1)})`);
    }
  });
}

function setEditing(isEditing) {
  map?.classList.toggle("is-editing", isEditing);
  editToggle?.setAttribute("aria-pressed", String(isEditing));
  if (editToggle) editToggle.textContent = isEditing ? "锁定位置" : "调整位置";
  if (!isEditing) savePositions();
}

editToggle?.addEventListener("click", () => {
  setEditing(!map?.classList.contains("is-editing"));
});

draggableNodes.forEach((node) => {
  node.addEventListener("pointerdown", (event) => {
    if (!map?.classList.contains("is-editing") || !mapStage) return;

    event.preventDefault();
    node.setPointerCapture(event.pointerId);
    node.classList.add("dragging");

    const move = (moveEvent) => {
      const stageRect = mapStage.getBoundingClientRect();
      const x = ((moveEvent.clientX - stageRect.left) / stageRect.width) * 100;
      const y = ((moveEvent.clientY - stageRect.top) / stageRect.height) * 100;
      node.style.setProperty("--x", `${Math.max(6, Math.min(94, x)).toFixed(2)}%`);
      node.style.setProperty("--y", `${Math.max(8, Math.min(92, y)).toFixed(2)}%`);
      updateRoutes();
    };

    const up = () => {
      node.classList.remove("dragging");
      node.removeEventListener("pointermove", move);
      node.removeEventListener("pointerup", up);
      node.removeEventListener("pointercancel", up);
      savePositions();
    };

    node.addEventListener("pointermove", move);
    node.addEventListener("pointerup", up);
    node.addEventListener("pointercancel", up);
  });
});

applyStoredPositions();
requestAnimationFrame(updateRoutes);
window.addEventListener("resize", updateRoutes);
