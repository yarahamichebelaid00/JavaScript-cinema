const API_KEY = 'd649c15d';

async function fetchFromOMDb(params) {
    const url = "https://www.omdbapi.com/?apikey=" + API_KEY + "&" + params;
    const response = await fetch(url);
    const data = await response.json();
    return data;
}