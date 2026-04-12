// =================== Helper Functions ===================
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function animateCards(cards) {
  cards.forEach((card, index) => {
    card.style.display = "flex";
    card.style.animation = `fadeInCard 0.5s forwards`;
    card.style.animationDelay = `${index * 0.1}s`;
  });
}

// Reusable function to create cards in a grid
function createCards(grid, items, hrefCallback, textCallback, imgCallback) {
  if (!grid || !items) return;
  grid.innerHTML = "";
  
  const cards = items.map((item, i) => {
    const card = document.createElement("a");
    card.className = "state-card";
    card.href = hrefCallback(item);

    if (imgCallback) {
      const img = document.createElement("img");
      img.src = imgCallback(item);
      img.alt = textCallback(item);
      card.appendChild(img);
    }

    const name = document.createElement("span");
    name.textContent = textCallback(item);
    card.appendChild(name);

    card.style.animation = `fadeInCard 0.5s forwards`;
    card.style.animationDelay = `${i * 0.1}s`;

    grid.appendChild(card);
    return card;
  });

  animateCards(cards);
}


// =================== CATEGORY LABELS ===================
const categoryLabels = {
  education: "Education",
  healthcare: "Healthcare",
  publictransportation: "Public Transportation",
  employment: "Employment",
  government: "Government Resources",
  community: "Community Resources"
};


// =================== MAIN SCRIPT ===================
document.addEventListener("DOMContentLoaded", () => {


// =================== EXPLORE PAGE ===================
const exploreGrid = document.querySelector('.states-grid');
const searchInput = document.getElementById('stateSearch');

if (exploreGrid) {

  // =================== BUILD STATES ARRAY ===================
  const states = Object.keys(DATA).map(key => ({
    key,
    name: DATA[key].name,
    img: DATA[key].img,
    href: `state.html?state=${key}`
  }));

  // =================== RENDER FUNCTION ===================
  function renderStates(list) {
    createCards(
      exploreGrid,
      list,
      state => state.href,
      state => state.name,
      state => state.img
    );
  }

  // Initial render
  renderStates(states);

  // =================== SEARCH ===================
  if (searchInput) {
    const noResults = document.createElement('p');
    noResults.textContent = "No states found.";
    noResults.style.textAlign = "center";
    noResults.style.display = "none";
    noResults.style.color = "#a0a64a";
    noResults.style.fontWeight = "600";
    noResults.style.marginTop = "20px";

    exploreGrid.parentNode.insertBefore(noResults, exploreGrid.nextSibling);

    searchInput.addEventListener('input', () => {
      const filter = searchInput.value.toLowerCase();

      const filtered = states.filter(state =>
        state.name.toLowerCase().includes(filter)
      );

      noResults.style.display = filtered.length === 0 ? 'block' : 'none';

      renderStates(filtered);
    });
  }
}


// =================== STATE PAGE ===================
const stateTitle = document.getElementById("stateTitle");
  const stateSidebar = document.getElementById("stateSidebar");
  const stateCardsGrid = document.getElementById("stateCardsGrid");

  const params = new URLSearchParams(window.location.search);
  const stateKey = params.get("state");

  if (stateTitle && stateKey && DATA[stateKey]) {
    const state = DATA[stateKey];
    document.title = `Neighborhood Navigator - ${state.name}`;
    stateTitle.textContent = state.name;


  // --- Sidebar ---
  if (stateSidebar) {
      stateSidebar.innerHTML = "";
      Object.keys(DATA).forEach(key => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = `state.html?state=${key}`;
        a.textContent = DATA[key].name;
        if (key === stateKey) a.classList.add("active");
        li.appendChild(a);
        stateSidebar.appendChild(li);
      });
    }

  // --- Cities / Neighborhoods ---

  if (stateCardsGrid) {
      const cities = Object.keys(state.cities).map(cityKey => ({
        name: state.cities[cityKey].name,
        img: state.cities[cityKey].img,
        href: `city.html?state=${stateKey}&city=${cityKey}`
      }));
      createCards(stateCardsGrid, cities, city => city.href, city => city.name, city => city.img);
    }

  // --- Breadcrumb ---
  const breadcrumb = document.getElementById("breadcrumbTrail");
    if (breadcrumb) {
      breadcrumb.innerHTML = `<a href="explore.html" style="color:white;text-decoration:underline;">Explore</a> &gt; <span>${state.name}</span>`;
    }
  }



// =================== CITY PAGE ===================
const cityTitle = document.getElementById("cityTitle");
  const cityKey = params.get("city");

  if (cityTitle && stateKey && cityKey && DATA[stateKey]?.cities[cityKey]) {
    const city = DATA[stateKey].cities[cityKey];
    const formattedCity = city.name;
    document.title = `Neighborhood Navigator - ${formattedCity}`;
    cityTitle.textContent = formattedCity;

    const categoryGrid = document.getElementById("categoryGrid");
    if (categoryGrid) {
      const categories = Object.keys(city.categories || {});
      createCards(
        categoryGrid,
        categories,
        key => `category.html?state=${stateKey}&city=${cityKey}&category=${key}`,
        key => city.categories[key].label || key
      );
    }


// --- Breadcrumb ---
    const cityBreadcrumb = document.getElementById("cityBreadcrumb");
    if (cityBreadcrumb) {
      cityBreadcrumb.innerHTML = `
        <a href="explore.html">Explore</a> &gt;
        <a href="state.html?state=${stateKey}">${DATA[stateKey].name}</a> &gt; 
        <span>${formattedCity}</span>
      `;
    }
  }


// =================== CATEGORY PAGE ===================
const categoryTitleEl = document.getElementById("categoryTitle");
  const categoryKey = params.get("category");

  if (categoryTitleEl && stateKey && cityKey && categoryKey && DATA[stateKey]?.cities[cityKey]?.categories[categoryKey]) {
    const category = DATA[stateKey].cities[cityKey].categories[categoryKey];
    categoryTitleEl.textContent = `${category.label} in ${DATA[stateKey].cities[cityKey].name}`;

    const subGrid = document.getElementById("categoryGrid");
    if (subGrid) {
      const subcategories = Object.entries(category.subcategories || {});
      createCards(
        subGrid,
        subcategories,
        ([key]) => `subcategory.html?state=${stateKey}&city=${cityKey}&category=${categoryKey}&subcategory=${encodeURIComponent(key)}`,
        ([key, value]) => value.label || key
      );
    }

  
  // =================== Breadcrumb ===================
  const categoryBreadcrumb = document.getElementById("categoryBreadcrumb");
    if (categoryBreadcrumb) {
      categoryBreadcrumb.innerHTML = `
        <a href="explore.html">Explore</a> &gt;
        <a href="state.html?state=${stateKey}">${DATA[stateKey].name}</a> &gt;
        <a href="city.html?state=${stateKey}&city=${cityKey}">${DATA[stateKey].cities[cityKey].name}</a> &gt;
        <span>${category.label}</span>
      `;
    }
  }


  // =================== SUBCATEGORY PAGE ===================
const subcategoryTitleEl = document.getElementById("subcategoryTitle");
  const subcategoryKey = params.get("subcategory");

  if (
    subcategoryTitleEl &&
    stateKey && cityKey && categoryKey && subcategoryKey &&
    DATA[stateKey]?.cities[cityKey]?.categories[categoryKey]?.subcategories[subcategoryKey]
  ) {
    const subcategoryObj = DATA[stateKey].cities[cityKey].categories[categoryKey].subcategories[subcategoryKey];
    const items = subcategoryObj.items || [];

    subcategoryTitleEl.textContent = `${subcategoryObj.label} in ${DATA[stateKey].cities[cityKey].name}`;

  const content = document.getElementById("subcategoryContent");

  if (content) {
    if (items.length) {
      content.innerHTML = items.map(place => `
        <div class="detail-card">
          <img src="${place.img || 'Images/default.jpg'}" alt="${place.name}">
          
          <h3>${place.name}</h3>
          
          ${place.description ? `<p>${place.description}</p>` : ""}
          
          ${place.address ? `<p><strong>Address:</strong> ${place.address}</p>` : ""}
          
          ${place.link && place.link !== "#" 
            ? `<a href="${place.link}" target="_blank">Visit Website</a>` 
            : ""
          }
        </div>
      `).join("");
    } else {
      content.innerHTML = `<p>No details available for ${subcategoryObj.label}.</p>`;
    }
  }



  // Breadcrumb
  const subBreadcrumb = document.getElementById("subcategoryBreadcrumb");
    if (subBreadcrumb) {
      subBreadcrumb.innerHTML = `
        <a href="explore.html">Explore</a> &gt;
        <a href="state.html?state=${stateKey}">${DATA[stateKey].name}</a> &gt;
        <a href="city.html?state=${stateKey}&city=${cityKey}">${DATA[stateKey].cities[cityKey].name}</a> &gt;
        <a href="category.html?state=${stateKey}&city=${cityKey}&category=${categoryKey}">${categoryLabels[categoryKey] || categoryKey}</a> &gt;
        <span>${subcategoryKey}</span>
      `;
    }
  }

// =================== Local Insights Page ===================

(function() {
  const tipForm = document.getElementById("tipForm");
  if (!tipForm) return;

  const userTipInput = document.getElementById("userTip");
  const tipCategory = document.getElementById("tipCategory");
  const tipsList = document.getElementById("tipsList");
  const submitMessage = document.getElementById("submitMessage");
  const filterCategory = document.getElementById("filterCategory");

  // Load saved tips from localStorage
  const savedTips = JSON.parse(localStorage.getItem("communityTips") || "[]");

  function renderTips(filter = "All") {
    tipsList.innerHTML = "";
    savedTips.forEach((tip, index) => {
      if (filter !== "All" && tip.category !== filter) return;

      const li = document.createElement("li");
      li.className = "tip-card";

      li.innerHTML = `
        <strong>${tip.category}</strong><br>
        <p>${tip.text}</p>
        <button class="delete-btn" data-index="${index}">Delete</button>
      `;
      tipsList.appendChild(li);
    });
  }

  // Initial render
  renderTips();

  // Form submission
  tipForm.addEventListener("submit", function(event) {
    event.preventDefault();
    const tipText = userTipInput.value.trim();
    const category = tipCategory.value.toLowerCase();

    if (!tipText) {
      alert("Please enter a tip before submitting");
      return;
    }
    savedTips.push({ text: tipText, category });
      localStorage.setItem("communityTips", JSON.stringify(savedTips));
      renderTips(filterCategory?.value || "All");
      userTipInput.value = "";
      tipCategory.value = "general";
      if (submitMessage) { submitMessage.style.display = "block"; setTimeout(() => { submitMessage.style.display = "none"; }, 2000); }
    });

  // Delete tip
  tipsList.addEventListener("click", function(event) {
    if (event.target.classList.contains("delete-btn")) {
      const index = event.target.dataset.index;
      savedTips.splice(index, 1);
      localStorage.setItem("communityTips", JSON.stringify(savedTips));
      renderTips(filterCategory?.value || "All");
    }
  });

  // Filter tips
  filterCategory?.addEventListener("change", function() {
    renderTips(filterCategory.value);
    });

})();

});