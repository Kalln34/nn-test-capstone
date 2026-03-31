const searchInput = document.getElementById('stateSearch');
const cards = document.querySelectorAll('.state-card');

// "No results" message
const noResults = document.createElement('p');
noResults.textContent = "No states found.";
noResults.style.textAlign = "center";
noResults.style.display = "none";
noResults.style.color = "#a0a64a";
noResults.style.fontWeight = "600";
noResults.style.marginTop = "20px";

const grid = document.querySelector('.states-grid');
grid.parentNode.insertBefore(noResults, grid.nextSibling);

function animateCards(filteredCards) {
  filteredCards.forEach((card, index) => {
    card.style.display = "flex";
    card.style.animation = `fadeInCard 0.5s forwards`;
    card.style.animationDelay = `${index * 0.1}s`;
  });
}

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

// Re-run filter on input
searchInput.addEventListener('input', filterStates);