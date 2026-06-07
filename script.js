const toggleButton = document.querySelector("[data-toggle]");
const collapsible = document.querySelector("[data-collapsible]");
const shareMenu = document.querySelector(".share-menu");
const shareButton = document.querySelector(".share-button");
const shareTargets = document.querySelectorAll("[data-share-target]");
const emailButton = document.querySelector("[data-email-button]");
const emailLabel = document.querySelector("[data-email-label]");
const productHero = document.querySelector(".product-hero");
const heroDescriptionText = document.querySelector(".hero-subline span");
const githubCommitValue = document.querySelector("[data-github-commits]");
const githubCommitLabel = document.querySelector("[data-github-commit-label]");
const eventRail = document.querySelector(".event-grid");
const updateDateLabel = document.querySelector("[data-update-date]");
const contactEmailButton = document.querySelector("[data-contact-email]");
const publicationSearch = document.querySelector("[data-publication-search]");
const publicationList = document.querySelector("[data-publication-list]");

const githubUsername = "barrydoooit";
const githubStatsPath = "data/github-stats.json";
const scholarProfileUrl = "https://scholar.google.com/citations?user=_ucq1RcAAAAJ";
const scholarCitationBase = "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=_ucq1RcAAAAJ&citation_for_view=";
const emailChars = [66, 46, 89, 46, 68, 105, 110, 103, 64, 116, 117, 100, 101, 108, 102, 116, 46, 110, 108];
let emailCopiedTimer;

function getEmailAddress() {
  return String.fromCharCode(...emailChars);
}

function getDisplayEmail() {
  return getEmailAddress();
}

function updateHeroGradientStops() {
  if (!productHero || !heroDescriptionText) return;

  const heroRect = productHero.getBoundingClientRect();
  const textRect = heroDescriptionText.getBoundingClientRect();

  if (heroRect.width <= 0 || textRect.width <= 0) return;

  const hold = Math.min(Math.max(textRect.right - heroRect.left + 28, heroRect.width * 0.42), heroRect.width * 0.92);
  const fade1 = Math.min(hold + 140, heroRect.width * 0.98);
  const fade2 = Math.min(hold + 320, heroRect.width * 1.08);
  const fade3 = Math.min(hold + 540, heroRect.width * 1.2);
  const end = Math.min(hold + 780, heroRect.width * 1.34);

  productHero.style.setProperty("--hero-gradient-hold", `${hold}px`);
  productHero.style.setProperty("--hero-gradient-fade-1", `${fade1}px`);
  productHero.style.setProperty("--hero-gradient-fade-2", `${fade2}px`);
  productHero.style.setProperty("--hero-gradient-fade-3", `${fade3}px`);
  productHero.style.setProperty("--hero-gradient-end", `${end}px`);
}

function getLocalDateOnly(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatUpdateDate(dateValue) {
  const [year, month, day] = dateValue.split("-").map(Number);

  if (!year || !month || !day) {
    return "";
  }

  const updateDate = new Date(year, month - 1, day);
  const today = getLocalDateOnly(new Date());
  const elapsedDays = Math.floor((today - updateDate) / 86400000);

  if (elapsedDays === 0) return "Today";
  if (elapsedDays === 1) return "Yesterday";
  if (elapsedDays > 1 && elapsedDays <= 7) return `${elapsedDays} days ago`;

  return updateDate.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const venueAbbreviations = [
  { match: "International Conference on Pervasive Computing and Communications", abbr: "PerCom" },
  { match: "IEEE Transactions on Mobile Computing", abbr: "TMC" },
  { match: "International Symposium on Quality of Service", abbr: "IWQoS" },
  { match: "Conference on Computer Communications Workshops", abbr: "INFOCOM WKSHPS" },
  { match: "Conference on Computer Communications", abbr: "INFOCOM" },
  { match: "Modeling, Analysis and Simulation of Wireless and Mobile Systems", abbr: "MSWiM" },
  { match: "Modeling Analysis", abbr: "MSWiM" },
];

const publications = [
  {
    title: "Towards Device-Free Gaming with mmWave Radar",
    authors: "Y Ding, H Martinez, G Vaidya, K Langendoen, MZ Zamalloa",
    venue: "2026 IEEE International Conference on Pervasive Computing and Communications",
    year: 2026,
    citationId: "_ucq1RcAAAAJ:UeHWp8X0CEIC",
    citations: 0,
  },
  {
    title: "Toward Optimal Broadcast Mode in Offline Finding Network",
    authors: "T Li, Y Ding, J Liang, K Zheng, X Zhang, T Pan, D Wang, K Xu",
    venue: "IEEE Transactions on Mobile Computing",
    year: 2025,
    citationId: "_ucq1RcAAAAJ:2osOgNQ5qMEC",
    citations: 3,
  },
  {
    title: "ReND: Toward Reasoning-Based BLE Neighbor Discovery by Integrating with Wi-Fi Fingerprints",
    authors: "Z Li, Z Yang, B Hu, T Li, B Wu, Y Ding, D Xu, K Xu",
    venue: "2024 IEEE/ACM 32nd International Symposium on Quality of Service",
    year: 2024,
    citationId: "_ucq1RcAAAAJ:u-x6o8ySG0sC",
    citations: 0,
  },
  {
    title: "On Design and Performance of Offline Finding Network",
    authors: "T Li, J Liang, Y Ding, K Zheng, X Zhang, K Xu",
    venue: "IEEE INFOCOM 2023 - IEEE Conference on Computer Communications",
    year: 2023,
    citationId: "_ucq1RcAAAAJ:d1gkVwhDpl0C",
    citations: 10,
  },
  {
    title: "Accelerating BLE Neighbor Discovery via Wi-Fi Fingerprints",
    authors: "T Li, B Hu, G Tu, J Shuai, J Liang, Y Ding, Z Li, K Xu",
    venue: "IEEE INFOCOM 2023 - IEEE Conference on Computer Communications Workshops",
    year: 2023,
    citationId: "_ucq1RcAAAAJ:qjMakFHDy7sC",
    citations: 0,
  },
  {
    title: "Blender: Toward Practical Simulation Framework for BLE Neighbor Discovery",
    authors: "Y Ding, T Li, J Liang, D Wang",
    venue: "Proceedings of the 25th International ACM Conference on Modeling, Analysis and Simulation of Wireless and Mobile Systems",
    year: 2022,
    citationId: "_ucq1RcAAAAJ:9yKSN-GCB0IC",
    citations: 7,
  },
];

function getVenueLabel(publication) {
  const venue = publication.venue.toLowerCase();
  const match = venueAbbreviations.find((entry) => venue.includes(entry.match.toLowerCase()));
  const abbr = match ? match.abbr : "PUB";
  return `${abbr}'${String(publication.year).slice(-2)}`;
}

function createPublicationItem(publication) {
  const item = document.createElement("article");
  item.className = "publication-item";
  item.dataset.title = `${publication.title} ${publication.venue} ${publication.year}`;

  const body = document.createElement("div");
  body.className = "publication-body";

  const topline = document.createElement("div");
  topline.className = "publication-topline";

  const badge = document.createElement("span");
  badge.className = "pub-badge";
  badge.textContent = getVenueLabel(publication);

  const title = document.createElement("h3");
  const titleLink = document.createElement("a");
  titleLink.className = "publication-title-link";
  titleLink.href = `${scholarCitationBase}${encodeURIComponent(publication.citationId)}`;
  titleLink.target = "_blank";
  titleLink.rel = "noopener noreferrer";
  titleLink.textContent = publication.title;
  title.append(titleLink);

  const authors = document.createElement("p");
  authors.className = "publication-meta";
  authors.textContent = publication.authors;

  const venue = document.createElement("p");
  venue.className = "publication-venue";
  venue.textContent = publication.venue;

  const footer = document.createElement("div");
  footer.className = "publication-footer";

  if (publication.citations > 0) {
    const citations = document.createElement("span");
    citations.textContent = `${publication.citations} citations`;
    footer.append(citations);
  }

  topline.append(badge, title);
  body.append(topline, authors, venue);

  if (footer.children.length > 0) {
    body.append(footer);
  }

  item.append(body);
  return item;
}

function renderPublications(items) {
  if (!publicationList) return;
  publicationList.replaceChildren(...items.map(createPublicationItem));
}

async function loadGithubCommitCount() {
  if (!githubCommitValue || !githubCommitLabel) return;

  const generatedStats = await loadGeneratedGithubStats();

  if (generatedStats) {
    applyGithubCommitCount(generatedStats.commitCountLast30Days, "commits / 1m");
    return;
  }

  showGithubStatsPending();
}

async function loadGeneratedGithubStats() {
  try {
    const response = await fetch(`${githubStatsPath}?v=${Date.now()}`);

    if (!response.ok) {
      throw new Error(`Stats JSON responded with ${response.status}`);
    }

    const stats = await response.json();

    if (stats.username !== githubUsername || !Number.isFinite(stats.commitCountLast30Days)) {
      return null;
    }

    return stats;
  } catch {
    return null;
  }
}

function applyGithubCommitCount(count, label) {
  githubCommitValue.textContent = String(count);
  githubCommitLabel.textContent = label;
}

function showGithubStatsPending() {
  githubCommitValue.textContent = "--";
  githubCommitLabel.textContent = "commits / 1m";
}

function revealEmailButton() {
  if (!emailButton || !emailLabel) return;

  window.clearTimeout(emailCopiedTimer);
  emailButton.dataset.emailState = "revealed";
  emailButton.setAttribute("aria-label", "Copy email address");
  emailLabel.textContent = getDisplayEmail();
}

function playEmailJumpAnimation() {
  if (!emailButton) return;

  emailButton.classList.remove("is-jumping");
  void emailButton.offsetWidth;
  emailButton.classList.add("is-jumping");
}

function playEmailJumpAfterTopScroll() {
  const startedAt = performance.now();

  function waitForTop() {
    if (window.scrollY <= 20 || performance.now() - startedAt > 1000) {
      playEmailJumpAnimation();
      return;
    }

    window.requestAnimationFrame(waitForTop);
  }

  window.requestAnimationFrame(waitForTop);
}

function enableDragScroll(rail) {
  let isPointerDown = false;
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let startScrollLeft = 0;
  let activePointerId = null;
  let suppressNextClick = false;

  function endDrag() {
    if (!isPointerDown) return;

    if (activePointerId !== null && rail.hasPointerCapture?.(activePointerId)) {
      rail.releasePointerCapture(activePointerId);
    }

    if (isDragging) {
      suppressNextClick = true;
      window.setTimeout(() => {
        suppressNextClick = false;
      }, 120);
    }

    isPointerDown = false;
    isDragging = false;
    activePointerId = null;
    rail.classList.remove("is-pointer-down", "is-dragging");
  }

  rail.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;

    isPointerDown = true;
    isDragging = false;
    activePointerId = event.pointerId;
    startX = event.clientX;
    startY = event.clientY;
    startScrollLeft = rail.scrollLeft;
    rail.classList.add("is-pointer-down");
  });

  rail.addEventListener("pointermove", (event) => {
    if (!isPointerDown) return;

    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;

    if (!isDragging) {
      if (Math.abs(deltaX) < 7) return;
      if (Math.abs(deltaX) <= Math.abs(deltaY)) return;

      isDragging = true;
      rail.setPointerCapture?.(event.pointerId);
      rail.classList.add("is-dragging");
    }

    rail.scrollLeft = startScrollLeft - deltaX;
    event.preventDefault();
  });

  rail.addEventListener("pointerup", endDrag);
  rail.addEventListener("pointercancel", endDrag);
  rail.addEventListener("pointerleave", endDrag);

  rail.addEventListener(
    "click",
    (event) => {
      if (!suppressNextClick) return;

      event.preventDefault();
      event.stopPropagation();
      suppressNextClick = false;
    },
    true
  );
}

if (toggleButton && collapsible) {
  toggleButton.addEventListener("click", () => {
    const isCollapsed = collapsible.classList.toggle("collapsed");
    toggleButton.textContent = isCollapsed ? "more" : "less";
  });
}

if (shareButton) {
  shareButton.addEventListener("click", () => {
    if (!shareMenu) return;
    const isOpen = shareMenu.classList.toggle("is-open");
    shareButton.setAttribute("aria-expanded", String(isOpen));
  });
}

document.addEventListener("click", (event) => {
  if (!shareMenu || shareMenu.contains(event.target)) return;
  shareMenu.classList.remove("is-open");
  shareButton?.setAttribute("aria-expanded", "false");
});

async function copyShareUrl(url) {
  if (!navigator.clipboard) return;

  try {
    await navigator.clipboard.writeText(url);
  } catch {
    // Clipboard access may be blocked for local file previews.
  }
}

function buildShareUrl(target, url, text) {
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(text);
  const encodedTextWithUrl = encodeURIComponent(`${text} ${url}`);

  const destinations = {
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTextWithUrl}`,
    x: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    instagram: "https://www.instagram.com/",
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
  };

  return destinations[target] || url;
}

shareTargets.forEach((button) => {
  button.addEventListener("click", async () => {
    const url = window.location.href.split("#")[0];
    const text = "Barry Y. Ding, PhD Candidate @ TU Delft";
    const destination = buildShareUrl(button.dataset.shareTarget, url, text);

    await copyShareUrl(url);
    window.open(destination, "_blank", "noopener,noreferrer");

    shareMenu?.classList.remove("is-open");
    shareButton?.setAttribute("aria-expanded", "false");
  });
});

if (emailButton && emailLabel) {
  emailButton.addEventListener("click", async () => {
    const currentState = emailButton.dataset.emailState;

    if (currentState === "hidden") {
      revealEmailButton();
      return;
    }

    await copyShareUrl(getEmailAddress());
    window.clearTimeout(emailCopiedTimer);

    emailButton.dataset.emailState = "copied";
    emailButton.setAttribute("aria-label", "Email address copied");

    emailCopiedTimer = window.setTimeout(() => {
      emailButton.dataset.emailState = "revealed";
      emailButton.setAttribute("aria-label", "Copy email address");
      emailLabel.textContent = getDisplayEmail();
    }, 1200);
  });

  emailButton.addEventListener("animationend", () => {
    emailButton.classList.remove("is-jumping");
  });
}

if (contactEmailButton) {
  contactEmailButton.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    revealEmailButton();
    playEmailJumpAfterTopScroll();
  });
}

if (publicationSearch) {
  renderPublications(publications);

  publicationSearch.addEventListener("input", () => {
    const query = publicationSearch.value.trim().toLowerCase();
    const publicationItems = document.querySelectorAll("[data-publication-list] .publication-item");

    publicationItems.forEach((item) => {
      const text = item.textContent.toLowerCase();
      item.hidden = query.length > 0 && !text.includes(query);
    });
  });
} else {
  renderPublications(publications);
}

if (eventRail) {
  enableDragScroll(eventRail);
}

if (updateDateLabel) {
  const formattedDate = formatUpdateDate(updateDateLabel.dataset.updateDate);

  if (formattedDate) {
    updateDateLabel.textContent = formattedDate;
  }
}

updateHeroGradientStops();
window.addEventListener("resize", updateHeroGradientStops);
document.fonts?.ready.then(updateHeroGradientStops);

loadGithubCommitCount();
