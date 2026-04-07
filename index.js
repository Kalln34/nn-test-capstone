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
  governmentresources: "Government Resources",
  communityresources: "Community Resources"
};


// =================== MAIN SCRIPT ===================
document.addEventListener("DOMContentLoaded", () => {


// =================== EXPLORE PAGE ===================
const searchInput = document.getElementById('stateSearch');

const grid = document.querySelector('.states-grid');

  if (searchInput && grid) {
    const states = Object.values(DATA).map(state => ({
      name: state.name,
      href: `state.html?state=${state.name.toLowerCase()}`
    }));



  // "No results" message
  const noResults = document.createElement('p');
  noResults.textContent = "No states found.";
  noResults.style.textAlign = "center";
  noResults.style.display = "none";
  noResults.style.color = "#a0a64a";
  noResults.style.fontWeight = "600";
  noResults.style.marginTop = "20px";

  grid.parentNode.insertBefore(noResults, grid.nextSibling);

  function filterStates() {
    const filter = searchInput.value.toLowerCase();
      const filtered = states.filter(state => state.name.toLowerCase().includes(filter));
      noResults.style.display = filtered.length === 0 ? 'block' : 'none';

      createCards(
        grid,
        filtered,
        state => state.href,
        state => state.name
      );
    }

    // Render all cards initially
    createCards(grid, states, state => state.href, state => state.name);

  
  // Filter on input
  searchInput.addEventListener('input', filterStates);
}

// =================== STATE PAGE ===================
const stateTitle = document.getElementById("stateTitle");

  if (stateTitle) {
  const params = new URLSearchParams(window.location.search);
    const stateName = params.get("state") || "Explore";
    const stateKey = stateName.toLowerCase();
    const stateData = DATA[stateKey];

  // --- Update title and heading ---
  document.title = `Neighborhood Navigator - ${capitalize(stateName)}`;
  stateTitle.textContent = capitalize(stateName);


  // --- Sidebar ---
  const sidebar = document.getElementById("stateSidebar");
    if (sidebar) {
      sidebar.innerHTML = "";
      Object.values(DATA).forEach(s => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = `state.html?state=${s.name.toLowerCase()}`;
        a.textContent = s.name;
        if (s.name.toLowerCase() === stateName.toLowerCase()) a.classList.add("active");
        li.appendChild(a);
        sidebar.appendChild(li);
      });
    }

  // --- Cities / Neighborhoods ---

  const cities = stateData
      ? Object.values(stateData.cities).map(city => ({ name: city.name, img: city.img }))
      : [];

    const cityGrid = document.getElementById("stateCardsGrid");
    createCards(
      cityGrid,
      cities,
      city => `city.html?state=${stateName.toLowerCase()}&city=${city.name.toLowerCase().replace(/\s+/g,'')}`,
      city => city.name,
      city => city.img
    );

  // --- Breadcrumb ---
  const breadcrumb = document.getElementById("breadcrumbTrail");
    if (breadcrumb) {
      breadcrumb.innerHTML = `<a href="explore.html" style="color:white;text-decoration:underline;">Explore</a> &gt; <span>${capitalize(stateName)}</span>`;
    }
  }



// =================== CITY PAGE ===================
const cityTitle = document.getElementById("cityTitle");
  if (cityTitle) {
    const params = new URLSearchParams(window.location.search);
    const stateName = params.get("state");
    const cityName = params.get("city");
    if (!stateName || !cityName) return;

    const stateData = DATA[stateName.toLowerCase()];
    const cityData = stateData?.cities[cityName.toLowerCase()];
    if (!cityData) return;

    const formattedCity = capitalize(cityName);
    document.title = `Neighborhood Navigator - ${formattedCity}`;
    cityTitle.textContent = formattedCity;

    const categories = Object.keys(cityData.categories || {});
    const grid = document.getElementById("categoryGrid");
    if (grid) {
      createCards(grid, categories, key => `category.html?state=${stateName}&city=${cityName}&category=${key}`, key => categoryLabels[key]);
    }

// --- Breadcrumb ---
    const breadcrumb = document.getElementById("cityBreadcrumb");
    if (breadcrumb) {
      breadcrumb.innerHTML = `
        <a href="explore.html">Explore</a> &gt; 
        <a href="javascript:history.back()">State</a> &gt; 
        <span>${formattedCity}</span>
      `;
    }
  }


// =================== CATEGORY PAGE ===================
const categoryTitle = document.getElementById("categoryTitle");

 if (categoryTitle) {
    const params = new URLSearchParams(window.location.search);
    const stateName = params.get("state");
    const cityName = params.get("city");
    const category = params.get("category");

    const cityData = DATA[stateName.toLowerCase()]?.cities[cityName.toLowerCase()];
    const subcategories = cityData?.categories[category]?.subcategories || [];

    const formattedCity = capitalize(cityName);
    const formattedCategory = categoryLabels[category] || category;
    categoryTitle.textContent = `${formattedCategory} in ${formattedCity}`;

    const grid = document.getElementById("categoryGrid");
    if (grid) {
      const items = Object.entries(subcategories).map(([name, arr]) => ({
        name,
        img: arr[0]?.img || "Images/categories/default.png"
      }));
      createCards(
        grid,
        items,
        item => `subcategory.html?state=${stateName}&city=${cityName}&category=${category}&subcategory=${encodeURIComponent(item.name)}`,
        item => item.name,
        item => item.img
      );
    }

  
  // =================== Breadcrumb ===================
  const breadcrumb = document.getElementById("categoryBreadcrumb");
    if (breadcrumb) {
      breadcrumb.innerHTML = `
        <a href="explore.html">Explore</a> &gt;
        <a href="javascript:history.back()">${formattedCity}</a> &gt;
        <span>${formattedCategory}</span>
      `;
    }
  }


  // =================== SUBCATEGORY PAGE ===================
const subcategoryTitle = document.getElementById("subcategoryTitle");

if (subcategoryTitle) {
  const params = new URLSearchParams(window.location.search);
  const stateName = params.get("state");
  const cityName = params.get("city");
  const category = params.get("category");
  const subcategory = params.get("subcategory");
  

  if (!stateName || !cityName || !category || !subcategory) return;

    const cityData = DATA[stateName.toLowerCase()]?.cities[cityName.toLowerCase()];
    const details = cityData?.categories[category]?.subcategories[subcategory] || [];

    const formattedCity = capitalize(cityName);
    const formattedCategory = categoryLabels[category] || category;

    document.title = `Neighborhood Navigator - ${subcategory} in ${formattedCity}`;
    subcategoryTitle.textContent = `${subcategory} in ${formattedCity}`;

    const content = document.getElementById("subcategoryContent");
    if (content) {
      if (details.length > 0) {
        content.innerHTML = `
          <div class="details-grid">
            ${details.map(place => `
              <div class="detail-card">
                <img src="${place.img}" alt="${place.name}">
                <h3>${place.name}</h3>
                <p>${place.description}</p>
                <p><strong>Address:</strong> ${place.address}</p>
                <a href="${place.link}" target="_blank">Visit Website</a>
              </div>
            `).join("")}
          </div>
        `;
      } else {
        content.innerHTML = `<p>No detailed information available yet for ${subcategory}.</p>`;
      }


  // Breadcrumb
  const breadcrumb = document.getElementById("subcategoryBreadcrumb");
  if (breadcrumb) {
    breadcrumb.innerHTML = `
      <a href="explore.html">Explore</a> &gt;
      <a href="javascript:history.back()">${formattedCity}</a> &gt;
      <a href="javascript:history.back()">${formattedCategory}</a> &gt;
      <span>${subcategory}</span>
    `;
  }
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