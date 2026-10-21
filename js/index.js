const trendingMovies = [
    { title: "Inside Out 2", year: 2024 },
    { title: "Deadpool & Wolverine", year: 2024 },
    { title: "Moana 2", year: 2024 }
];

const container = document.querySelector("#trending-movies");
const loadMoreButton = document.querySelector("#load-more-btn");

// Image affichée quand le film n'a pas de poster
const NO_POSTER =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450">' +
        '<rect width="100%" height="100%" fill="#333"/>' +
        '<text x="50%" y="50%" fill="#fff" font-size="20" text-anchor="middle" font-family="sans-serif">Pas d\'image</text>' +
        '</svg>'
    );

// État du bouton « charger plus »
let currentPage = 0;
const displayedIds = new Set();

// Évite de casser le HTML si un titre contient des guillemets ou des chevrons
function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

function createMovieCard(movie) {
    const poster = movie.Poster && movie.Poster !== "N/A" ? movie.Poster : NO_POSTER;

    // Bonus : petit résumé (disponible uniquement avec la recherche par titre/ID)
    let summaryHtml = "";
    if (movie.Plot && movie.Plot !== "N/A") {
        const short = movie.Plot.length > 120 ? movie.Plot.slice(0, 120) + "…" : movie.Plot;
        summaryHtml = `<p class="movie-summary">${escapeHtml(short)}</p>`;
    }

    return `
        <div class="movie-card">
            <img src="${poster}" alt="Poster de ${escapeHtml(movie.Title)}">
            <h3>${escapeHtml(movie.Title)} (${escapeHtml(movie.Year)})</h3>
            ${summaryHtml}
            <a href="movie.html?id=${movie.imdbID}" class="more-link">En savoir plus</a>
        </div>
    `;
}

async function displayTrendingMovies() {
    if (!container) return;

    container.innerHTML = "<p>Chargement des films tendances...</p>";

    // Toutes les requêtes partent en même temps
    const results = await Promise.all(
        trendingMovies.map(m => fetchFromOMDb({ t: m.title, y: m.year, plot: "short" }))
    );

    let html = "";
    results.forEach(movie => {
        if (movie && movie.Response === "True") {
            displayedIds.add(movie.imdbID);
            html += createMovieCard(movie);
        }
    });

    container.innerHTML = html || "<p>Impossible de charger les films. Vérifiez votre connexion.</p>";
}

async function loadMoreMovies() {
    loadMoreButton.disabled = true;
    loadMoreButton.textContent = "Chargement...";

    currentPage++;
    const data = await fetchFromOMDb({ s: "the", y: 2024, type: "movie", page: currentPage });

    if (data && data.Response === "True") {
        let html = "";
        data.Search.forEach(movie => {
            if (!displayedIds.has(movie.imdbID)) {
                displayedIds.add(movie.imdbID);
                html += createMovieCard(movie);
            }
        });
        container.insertAdjacentHTML("beforeend", html);

        // On cache le bouton quand il n'y a plus de résultats
        if (currentPage * 10 >= Number(data.totalResults)) {
            loadMoreButton.style.display = "none";
            return;
        }
    } else {
        loadMoreButton.style.display = "none";
        return;
    }

    loadMoreButton.disabled = false;
    loadMoreButton.textContent = "Charger plus de films de 2024";
}

displayTrendingMovies();

if (loadMoreButton) {
    loadMoreButton.addEventListener("click", loadMoreMovies);
}