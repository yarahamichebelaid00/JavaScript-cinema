const movieContainer = document.querySelector("#movie-details");

const NO_POSTER =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450">' +
        '<rect width="100%" height="100%" fill="#333"/>' +
        '<text x="50%" y="50%" fill="#fff" font-size="20" text-anchor="middle" font-family="sans-serif">Pas d\'image</text>' +
        '</svg>'
    );

const MONTHS = {
    Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
    Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12"
};

// Évite de casser le HTML si une donnée contient des guillemets ou des chevrons
function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

function getIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

// OMDb renvoie la date DVD sous la forme "15 Mar 2024" (ou "N/A")
function formatDateFr(dateStr) {
    if (!dateStr || dateStr === "N/A") return "Non disponible";

    const parts = dateStr.split(" ");
    if (parts.length === 3 && MONTHS[parts[1]]) {
        const day = parts[0].padStart(2, "0");
        return `${day}/${MONTHS[parts[1]]}/${parts[2]}`;
    }

    return dateStr; // format inattendu : on l'affiche tel quel
}

function buildRatingsHtml(ratings) {
    if (!ratings || ratings.length === 0) {
        return "<ul><li>Aucune note disponible</li></ul>";
    }

    const items = ratings
        .map(r => `<li><strong>${escapeHtml(r.Source)} :</strong> ${escapeHtml(r.Value)}</li>`)
        .join("");

    return `<ul>${items}</ul>`;
}

async function loadMovieDetails() {
    if (!movieContainer) return;

    const movieId = getIdFromUrl();

    if (!movieId) {
        movieContainer.innerHTML = "<p>Aucun film sélectionné.</p>";
        return;
    }

    const data = await fetchFromOMDb({ i: movieId, plot: "full" });

    if (!data || data.Response === "False") {
        movieContainer.innerHTML = "<p>Erreur lors du chargement des détails du film.</p>";
        return;
    }

    const poster = data.Poster && data.Poster !== "N/A" ? data.Poster : NO_POSTER;
    const plot = data.Plot && data.Plot !== "N/A" ? data.Plot : "Résumé non disponible.";

    document.title = `Cinéma - ${data.Title}`;

    movieContainer.innerHTML = `
        <div class="movie-detail">
            <div class="movie-detail-poster">
                <img src="${poster}" alt="Poster de ${escapeHtml(data.Title)}">
            </div>
            <div class="movie-detail-info">
                <h2>${escapeHtml(data.Title)} (${escapeHtml(data.Year)})</h2>
                <p><strong>Genre :</strong> ${escapeHtml(data.Genre)}</p>
                <p><strong>Acteurs :</strong> ${escapeHtml(data.Actors)}</p>
                <p><strong>Résumé :</strong> ${escapeHtml(plot)}</p>

                <hr>

                <h3>Notes</h3>
                ${buildRatingsHtml(data.Ratings)}

                <p><strong>Sortie en DVD :</strong> ${formatDateFr(data.DVD)}</p>

                <a href="index.html" class="back-link">Retour à l'accueil</a>
            </div>
        </div>
    `;
}

loadMovieDetails();