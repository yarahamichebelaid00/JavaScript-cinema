const searchInput = document.querySelector("#search-input");
const resultsContainer = document.querySelector("#search-results");
const loadMoreButton = document.querySelector("#load-more-search-btn");

let searchText = "";
let currentPage = 1;

function createMovieCard(movie) {
    let imageHtml = "";

    if (movie.Poster === "N/A") {
        imageHtml = "<p>Pas d'image</p>";
    } else {
        imageHtml = '<img src="' + movie.Poster + '" alt="Poster de ' + movie.Title + '">';
    }

    return `
        <div class="movie-card">
            ${imageHtml}
            <h3>${movie.Title} (${movie.Year})</h3>
            <a href="movie.html?id=${movie.imdbID}">En savoir plus</a>
        </div>
    `;
}

function updateLoadMoreButton(totalResults) {
    if (Number(totalResults) > currentPage * 10) {
        loadMoreButton.style.display = "inline-block";
    } else {
        loadMoreButton.style.display = "none";
    }
}

async function searchMovies() {
    searchText = searchInput.value.trim();
    currentPage = 1;

    if (searchText.length < 2) {
        resultsContainer.innerHTML = "<p>Tapez au moins 2 lettres...</p>";
        loadMoreButton.style.display = "none";
        return;
    }

    const data = await fetchFromOMDb("s=" + encodeURIComponent(searchText) + "&page=1");

    if (data.Response === "True") {
        resultsContainer.innerHTML = "";
        for (let i = 0; i < data.Search.length; i++) {
            resultsContainer.innerHTML += createMovieCard(data.Search[i]);
        }
        updateLoadMoreButton(data.totalResults);
    } else {
        resultsContainer.innerHTML = "<p>Aucun film trouvé.</p>";
        loadMoreButton.style.display = "none";
    }
}

async function loadMoreResults() {
    currentPage = currentPage + 1;

    const data = await fetchFromOMDb("s=" + encodeURIComponent(searchText) + "&page=" + currentPage);

    if (data.Response === "True") {
        for (let i = 0; i < data.Search.length; i++) {
            resultsContainer.innerHTML += createMovieCard(data.Search[i]);
        }
        updateLoadMoreButton(data.totalResults);
    } else {
        loadMoreButton.style.display = "none";
    }
}

searchInput.addEventListener("input", searchMovies);
loadMoreButton.addEventListener("click", loadMoreResults);