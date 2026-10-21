const searchInput = document.querySelector("#search-input");
const resultsContainer = document.querySelector("#search-results");
const loadMoreButton = document.querySelector("#load-more-search-btn");

const NO_POSTER =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450">' +
        '<rect width="100%" height="100%" fill="#333"/>' +
        '<text x="50%" y="50%" fill="#fff" font-size="20" text-anchor="middle" font-family="sans-serif">Pas d\'image</text>' +
        '</svg>'
    );

const DEBOUNCE_DELAY = 400; // ms d'attente après la dernière frappe
const MIN_LENGTH = 2;

let searchText = "";
let currentPage = 1;
let debounceTimer = null;
let requestId = 0; // sert à ignorer les réponses « périmées »

// Évite de casser le HTML si un titre contient des guillemets ou des chevrons
function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

function hideLoadMore() {
    if (loadMoreButton) loadMoreButton.style.display = "none";
}

function createMovieCard(movie) {
    const poster = movie.Poster && movie.Poster !== "N/A" ? movie.Poster : NO_POSTER;

    return `
        <div class="movie-card">
            <img src="${poster}" alt="Poster de ${escapeHtml(movie.Title)}">
            <h3>${escapeHtml(movie.Title)} (${escapeHtml(movie.Year)})</h3>
            <a href="movie.html?id=${movie.imdbID}" class="more-link">En savoir plus</a>
        </div>
    `;
}

function renderResults(data, append) {
    if (!resultsContainer) return;

    if (!data || data.Response === "False") {
        // Si on est en train d'ajouter une page, on garde les résultats déjà affichés
        if (!append) {
            const message = data && data.Error === "Too many results."
                ? "Trop de résultats, précisez votre recherche."
                : "Aucun film trouvé.";
            resultsContainer.innerHTML = `<p>${message}</p>`;
        }
        hideLoadMore();
        return;
    }

    const html = data.Search.map(createMovieCard).join("");

    if (append) {
        resultsContainer.insertAdjacentHTML("beforeend", html);
    } else {
        resultsContainer.innerHTML = html;
    }

    // Afficher « Charger plus » seulement s'il reste des résultats
    const total = parseInt(data.totalResults, 10) || 0;
    if (loadMoreButton) {
        loadMoreButton.style.display = total > currentPage * 10 ? "inline-block" : "none";
    }
}

async function runSearch() {
    currentPage = 1;
    const thisRequest = ++requestId;

    resultsContainer.innerHTML = "<p>Recherche en cours...</p>";
    hideLoadMore();

    const data = await fetchFromOMDb({ s: searchText, page: 1 });

    // Une recherche plus récente a été lancée entre-temps : on ignore cette réponse
    if (thisRequest !== requestId) return;

    renderResults(data, false);
}

if (searchInput) {
    searchInput.addEventListener("input", function (event) {
        searchText = event.target.value.trim();

        clearTimeout(debounceTimer);

        if (searchText.length < MIN_LENGTH) {
            requestId++; // annule toute réponse en attente
            resultsContainer.innerHTML = "<p>Tapez au moins 2 lettres pour lancer la recherche...</p>";
            hideLoadMore();
            return;
        }

        debounceTimer = setTimeout(runSearch, DEBOUNCE_DELAY);
    });
}

if (loadMoreButton) {
    loadMoreButton.addEventListener("click", async function () {
        const thisRequest = requestId;

        loadMoreButton.disabled = true;
        loadMoreButton.textContent = "Chargement...";

        currentPage++;
        const data = await fetchFromOMDb({ s: searchText, page: currentPage });

        loadMoreButton.disabled = false;
        loadMoreButton.textContent = "Charger plus de résultats";

        // L'utilisateur a changé sa recherche pendant le chargement : on ignore
        if (thisRequest !== requestId) return;

        renderResults(data, true);
    });
}