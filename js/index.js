const trendingMovies = [
    { title: "Inside Out 2", year: 2024 },
    { title: "Deadpool & Wolverine", year: 2024 },
    { title: "Moana 2", year: 2024 }
];

const container = document.querySelector("#trending-movies");
const loadMoreButton = document.querySelector("#load-more-btn");

let currentPage = 1;

function createMovieCard(movie) {
    let poster = movie.Poster;
    let imageHtml = "";
    
    if (poster === "N/A") {
        imageHtml = "<p>Pas d'image</p>";
    } else {
        imageHtml = '<img src="' + poster + '" alt="Poster de ' + movie.Title + '">';
    }

    let summaryHtml = "";
    if (movie.Plot) {
        summaryHtml = "<p>" + movie.Plot + "</p>";
    }

    return `
        <div class="movie-card">
            ${imageHtml}
            <h3>${movie.Title} (${movie.Year})</h3>
            ${summaryHtml}
            <a href="movie.html?id=${movie.imdbID}">En savoir plus</a>
        </div>
    `;
}
async function displayTrendingMovies() {
    container.innerHTML = "";

    for (let i = 0; i < trendingMovies.length; i++) {
        const movie = trendingMovies[i];
        const title = encodeURIComponent(movie.title);

        const data = await fetchFromOMDb("t=" + title + "&y=" + movie.year + "&plot=short");

        if (data.Response === "True") {
            container.innerHTML += createMovieCard(data);
        }
    }

    if (container.innerHTML === "") {
        container.innerHTML = "<p>Impossible de charger les films.</p>";
    }
}
async function loadMoreMovies() {
    const data = await fetchFromOMDb("s=the&y=2024&type=movie&page=" + currentPage);

    if (data.Response === "True") {
        for (let i = 0; i < data.Search.length; i++) {
            container.innerHTML += createMovieCard(data.Search[i]);
        }
        currentPage = currentPage + 1;
    } else {
        loadMoreButton.style.display = "none";
    }
}
displayTrendingMovies();
loadMoreButton.addEventListener("click", loadMoreMovies);