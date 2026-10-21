const API_KEY = 'd649c15d';
const BASE_URL = 'https://www.omdbapi.com/';

async function fetchFromOMDb(params) {
    let query;

    if (typeof params === 'string') {
        // Accepte "?s=batman", "&s=batman" ou "s=batman"
        query = new URLSearchParams(params.replace(/^[?&]/, ''));
    } else {
        query = new URLSearchParams(params);
    }

    query.set('apikey', API_KEY);

    try {
        const response = await fetch(`${BASE_URL}?${query.toString()}`);

        if (!response.ok) {
            throw new Error(`Erreur HTTP ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Erreur lors de la requête :", error);
        return null;
    }
}