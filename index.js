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

// =================== EXPLORE PAGE ===================
if (document.getElementById('stateSearch')) {
  const searchInput = document.getElementById('stateSearch');
  const cards = document.querySelectorAll('.state-card');
  const grid = document.querySelector('.states-grid');

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
    let anyVisible = false;
    const visibleCards = [];

    cards.forEach(card => {
      const text = card.textContent.toLowerCase();
      if (text.includes(filter)) {
        card.style.display = "flex";
        visibleCards.push(card);
        anyVisible = true;
      } else {
        card.style.display = "none";
        card.style.animation = ""; // reset
      }
    });

    animateCards(visibleCards);
    noResults.style.display = anyVisible ? 'none' : 'block';
  }

  // Animate all cards on page load
  animateCards(Array.from(cards));

  // Filter on input
  searchInput.addEventListener('input', filterStates);
}

// =================== STATE PAGE ===================
document.addEventListener("DOMContentLoaded", () => {
  // --- Get selected state from URL ---
  const params = new URLSearchParams(window.location.search);
  const stateName = params.get("state") || "Explore";

  // --- Update title and heading ---
  document.title = `Neighborhood Navigator - ${capitalize(stateName)}`;
  const heading = document.getElementById("stateTitle");
  if (heading) heading.textContent = capitalize(stateName);

  // --- Sidebar ---
  const states = [
    "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","Florida",
    "Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine",
    "Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska",
    "Nevada","New Hampshire","New Jersey","New Mexico","New York","North Carolina","North Dakota",
    "Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota",
    "Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming"
  ];

  const sidebar = document.getElementById("stateSidebar");
  sidebar.innerHTML = ""; // clear any existing items

  states.forEach(state => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = `state.html?state=${state.toLowerCase()}`;
    a.textContent = state;

    if (state.toLowerCase() === stateName.toLowerCase()) a.classList.add("active");

    li.appendChild(a);
    sidebar.appendChild(li);
  });

  // --- Cities / Neighborhoods ---
  const stateCities = {
    connecticut: [
      { name: "Hartford", img: "Images/hartfordct.jpg" },
      { name: "New Haven", img: "Images/newhavenct.png" },
      { name: "Stamford", img: "Images/stamfordct.png" },
      { name: "Danbury", img: "Images/danburyct.png" },
      { name: "Norwalk", img: "Images/norwalkct.png" },
      { name: "Bridgeport", img: "Images/bridgeportct.png" },
      { name: "New Britain", img: "Images/newbritainct.png" },
      { name: "New London", img: "Images/newlondonct.png" }
    ],
    california: [
      { name: "Los Angeles", img: "Images/cities/losangeles.jpg" },
      { name: "San Francisco", img: "Images/cities/sanfrancisco.jpg" },
      { name: "San Diego", img: "Images/cities/sandiego.jpg" },
      { name: "Sacramento", img: "Images/cities/sacramento.jpg" },
      { name: "San Jose", img: "Images/cities/sanjose.jpg" }
    ]
    // add other states here
  };

  const cities = stateCities[stateName.toLowerCase()] || [
    { name: "City 1", img: "Images/cities/default.jpg" },
    { name: "City 2", img: "Images/cities/default.jpg" },
    { name: "City 3", img: "Images/cities/default.jpg" },
    { name: "City 4", img: "Images/cities/default.jpg" },
    { name: "City 5", img: "Images/cities/default.jpg" }
  ];
  const grid = document.getElementById("stateCardsGrid");


  // Display cities
  grid.innerHTML = "";
  cities.forEach((city, i) => {
    const card = document.createElement("a");
    card.href = `city.html?city=${city.name.toLowerCase().replace(/\s+/g,'')}`;
    card.className = "state-card";

    // Add city image
    const img = document.createElement("img");
    img.src = city.img;
    img.alt = city.name;
    card.appendChild(img);

    // Add city name
    const name = document.createElement("span");
    name.textContent = city.name;
    card.appendChild(name);


    // Fade-in animation
    card.style.animation = `fadeInCard 0.5s forwards`;
    card.style.animationDelay = `${i * 0.1}s`;

    grid.appendChild(card);
  });

  // --- Breadcrumb ---
  const breadcrumb = document.getElementById("breadcrumbTrail");
  if (breadcrumb) {
    breadcrumb.innerHTML = `<a href="explore.html" style="color:white;text-decoration:underline;">Explore</a> &gt; <span>${capitalize(stateName)}</span>`;
  }
});

// Capitalize helper
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
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
  let savedTips = JSON.parse(localStorage.getItem("communityTips") || "[]");

  // Ensure old data still works (migration layer)
  savedTips = savedTips.map(t => ({
    id: t.id || Date.now() + Math.random(),
    text: t.text || "",
    category: (t.category || "general").toLowerCase(),
    votes: t.votes || 0,
    createdAt: t.createdAt || Date.now()
  }));

  function save() {
    localStorage.setItem("communityTips", JSON.stringify(savedTips));
  }

  function renderTips(filter = "All") {
    tipsList.innerHTML = "";

    let filtered = savedTips;

    if (filter !== "All") {
      filtered = savedTips.filter(t => t.category === filter.toLowerCase());
    }

    // Reddit-style ranking (MOST IMPORTANT UPGRADE)
    filtered.sort((a, b) => b.votes - a.votes);

    filtered.forEach(tip => {
      const li = document.createElement("li");
    li.className = "tip-card";
    li.dataset.id = tip.id; 

    li.innerHTML = `
      <div class="vote-column">
        <button type="button" onclick="window.voteTip('${tip.id}', 1)">▲</button>
        <div>${tip.votes}</div>
        <button type="button" onclick="window.voteTip('${tip.id}', -1)">▼</button>
      </div>

      <div class="tip-content">
        <p>${tip.text}</p>
      </div>

      <span class="tag ${tip.category}">
        ${tip.category}
      </span>
    `;

      tipsList.appendChild(li);
    });
  }

  // voting globally 
  function vote(id, delta) {
  const tip = savedTips.find(t => String(t.id) === String(id));
  if (!tip) return;

  tip.votes += delta;
  save();
  renderTips(filterCategory.value || "All");
}

  window.voteTip = vote;

  // Form submission
  tipForm.addEventListener("submit", function(event) {
    event.preventDefault();
    const tipText = userTipInput.value.trim();
    const category = tipCategory.value.toLowerCase();

    if (!tipText) {
      alert("Please enter a tip before submitting");
      return;
    }

     const newTip = {
      id: Date.now(),
      text: tipText,
      category,
      votes: 0,
      createdAt: Date.now()
    };

    savedTips = [...savedTips, newTip];
    save();

    renderTips(filterCategory.value || "All");

    userTipInput.value = "";
    tipCategory.value = "general";

    if (submitMessage) {
      submitMessage.style.display = "block";
      setTimeout(() => {
        submitMessage.style.display = "none";
      }, 2000);
    }
  });

  tipsList.addEventListener("click", function(event) {
    if (event.target.classList.contains("delete-btn")) {
      const id = event.target.closest(".tip-card").dataset.id;

      savedTips = savedTips.filter(t => t.id != id);

      save();
      renderTips(filterCategory.value || "All");
    }
  });
  

  // Filter tips
  filterCategory?.addEventListener("change", function() {
    renderTips(filterCategory.value);
    });

    // INITIAL RENDER
  renderTips();

})();