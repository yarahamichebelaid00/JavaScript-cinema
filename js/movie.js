const movieContainer = document.querySelector("#movie-details");

const MONTHS = {
    Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
    Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12"
};

function getIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

function formatDate(dateText) {
    if (dateText === "N/A") {
        return "Non disponible";
    }

    const parts = dateText.split(" "); // ["15", "Mar", "2024"]
    const day = parts[0].padStart(2, "0");
    const month = MONTHS[parts[1]];
    const year = parts[2];

    return day + "/" + month + "/" + year;
}


async function loadMovieDetails() {
    const id = getIdFromUrl();

    if (id === null) {
        movieContainer.innerHTML = "<p>Aucun film sélectionné.</p>";
        return;
    }

    const movie = await fetchFromOMDb("i=" + id + "&plot=full");

    if (movie.Response === "False") {
        movieContainer.innerHTML = "<p>Film introuvable.</p>";
        return;
    }


    let imageHtml = "";
    if (movie.Poster === "N/A") {
        imageHtml = "<p>Pas d'image</p>";
    } else {
        imageHtml = '<img src="' + movie.Poster + '" alt="Poster de ' + movie.Title + '">';
    }

    let ratingsHtml = "";
    for (let i = 0; i < movie.Ratings.length; i++) {
        ratingsHtml += "<li>" + movie.Ratings[i].Source + " : " + movie.Ratings[i].Value + "</li>";
    }

    movieContainer.innerHTML = `
        <div class="movie-detail">
            <div class="movie-detail-poster">
                ${imageHtml}
            </div>
            <div class="movie-detail-info">
                <h2>${movie.Title} (${movie.Year})</h2>
                <p><strong>Genre :</strong> ${movie.Genre}</p>
                <p><strong>Acteurs :</strong> ${movie.Actors}</p>
                <p><strong>Résumé :</strong> ${movie.Plot}</p>
                <h3>Notes</h3>
                <ul>${ratingsHtml}</ul>
                <p><strong>Sortie en DVD :</strong> ${formatDate(movie.DVD)}</p>
                <a href="index.html" class="back-link">Retour à l'accueil</a>
            </div>
        </div>
    `;
}

loadMovieDetails();