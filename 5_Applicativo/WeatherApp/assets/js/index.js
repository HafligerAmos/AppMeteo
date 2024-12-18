const OPENWEATHER_API_KEY = '2e859646a8a602b49dab81d8731d624f';
const COOKIE_NAME = "favoriteCities";
const EXPIRATION_DAYS = 14;

var city = 'Milano';
var sound = true;
var myChart;
var favoriteCities;

/**
 * Funzione per eseguire il textToSpeech sulla descrizione della meteo giornaliera
 */
function textToSpeech() {
    if (sound) {
        var text = document.getElementById('weather-description').innerHTML;
        if (text !== "") {
            var utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'it-IT';
            utterance.volume = 1;
            utterance.rate = 1;
            utterance.pitch = 1;

            // Avvia la lettura del testo
            window.speechSynthesis.speak(utterance);
            // Disabilita la lettura futura fino a quando non viene riattivata
            sound = false;
        } else {
            var modal = new bootstrap.Modal(document.getElementById('errorModal'));
            document.getElementById("modal-body").innerHTML = "Descrizione non leggibile";
            modal.show();
            cleanBackdrop();
        }
    } else {
        // Se la lettura vocale è già in corso, la interrompe
        speechSynthesis.cancel();
        // Riabilita la lettura vocale
        sound = true;  
    }
}

/**
 * Funzione che va a settare i cookie basandosi sui 3 parametri
 * nome, valore e tempo di scadenza
 * 
 * @param {NomeCookie} name 
 * @param {ValoreCookie} value 
 * @param {GiorniDiScadenza} days 
 */
function setCookie(name, value, days) {
    var date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000); //Da giorni a milliseondi
    var dateUTC = date.toUTCString();
    // Crea un cookie con i parametri specificati
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${dateUTC};path=/`;
}

/**
 * Funzione che restituisce i cookie in base al nome ad esso attribuito
 * 
 * @param {Nome del cookie} name 
 * @returns in caso il cookie sia trovato restituisce il valore del cookie altrimenti null
 */
function getCookie(name) {
    var cookies = document.cookie.split("; ");
    for (var cookie of cookies) {
        var [key, value] = cookie.split("=");
        if (key === name) {
            return decodeURIComponent(value);
        }
    }
    return null;  // Se il cookie non esiste, restituisce null
}

/**
 * Funzione che in caso il cookie sia presente
 * Converte la stringa Json in un array js e lo andiamo a 
 * mettere dentro l'array favoriteCities.
 * In caso il cookie sia null va a salvare all'interno di 
 * favoriteCities un array vuoto
 * Successivamente va a printare la l'aarray all'interno del 
 * div che conterrà le città preferite dell'utente
 */
function showCities() {
    var savedCities = getCookie(COOKIE_NAME);

    if (savedCities) {
        favoriteCities = JSON.parse(savedCities);
    } else {
        favoriteCities = [];
    }

    var txt = "";
    // Crea una lista HTML per ciascuna città preferita
    favoriteCities.forEach((value, index) => {
        txt += `
            <li class="list-group-item list-group-item-dark d-flex justify-content-between align-items-center">
                ${value}
                <div class="d-flex justify-content-flex-end align-content-space-between">
                    <button class="btn btn-warning btn-sm star-btn" onclick="removeFavoriteCity(${index})">
                        <!-- Icona del pulsante per rimuovere città -->
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-star-fill" viewBox="0 0 16 16">
                            <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
                        </svg>
                    </button>
                    <button class="btn btn-primary btn-sm search-btn" onclick="changeCity('${value}')">
                        <!-- Icona del pulsante per cercare una città -->
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
                            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
                        </svg>
                    </button>
                </div>      
            </li>
        `;
    });
    document.getElementById("recent-cities").innerHTML = txt;
}


/**
 * Funzione che rimuove una città dall'array delle città preferite
 * basandosi sull'index della città in questione
 * @param {*} index 
 */
function removeFavoriteCity(index) {
    favoriteCities.splice(index, 1);
    updateCookie();
    showCities();
}

/**
 * Funzione che aggiunge all'array delle città preferite 
 * una nuova città, che deve esseere prima selezionata e 
 * visualizzata nelle varie previsioni. 
 * Essendo che si basa sull'innerHTML del campo città
 */
function addCity() {
    var actualCity = document.getElementById("city").innerHTML;
    // Se la città non è già nelle preferite, la aggiunge
    if (!favoriteCities.includes(actualCity)) {
        // Se ci sono gia 8 città non aggiunge più la città
        if (favoriteCities.length < 8) {
            favoriteCities.push(actualCity);
            updateCookie();
            showCities();
        } else {
            var modal = new bootstrap.Modal(document.getElementById('errorModal'));
            document.getElementById("modal-body").innerHTML = "Massimo 8 città preferite";
            modal.show();
            cleanBackdrop();
        }
    } else {
        var modal = new bootstrap.Modal(document.getElementById('errorModal'));
        document.getElementById("modal-body").innerHTML = "Città già presente nelle città preferite";
        modal.show();
        cleanBackdrop();
    }
}

/**
 * Funzione che cambia la città attuale con la città che passiamo da parametro
 * @param {città che deve prendere il posto di quella vecchia} passCity 
 */
function changeCity(passCity){
    if(passCity){
        city = passCity;
    }
    updateCurrentTemperature();
    getWeeklyForecast(city, OPENWEATHER_API_KEY);
    createChart(city);
}

/**
 * Funzione che va ad aggiornare i cookie aggiornando e sovrascrivendo
 * il vecchio con la nuova favoriteCities (che quindi conterrà una nuova città al suo interno)
 */
function updateCookie() {
    setCookie(COOKIE_NAME, JSON.stringify(favoriteCities), EXPIRATION_DAYS);
}

async function fetchWeatherData(city, apiKey) {
    var response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=it`);
    var data = await response.json();
    return data;
}

/**
 * Funzione che esegue la richiesta all'API
 * @param {città sulla quale fare la richiesta} city 
 * @param {API key di openWeather} apiKey 
 * @returns 
 */
async function fetchOpenWeather(city, apiKey) {
    var data = await fetchWeatherData(city, apiKey);
    var temp = Math.round(data.main.temp);
    var iconCode = data.weather[0].icon;
    var iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    var humidity = data.main.humidity;
    var windSpeed = data.wind.speed;
    var description = data.weather[0].description;
    var precipitation = data.rain ? data.rain["1h"] : 0;

    return { temp, iconUrl, humidity, windSpeed, description, precipitation };
}

/**
 * Funzione che aggiorna la situazione giornaliera
 */
async function updateCurrentTemperature() {
    try {
        var { temp, iconUrl, humidity, windSpeed, description, precipitation } = await fetchOpenWeather(city, OPENWEATHER_API_KEY);
        document.getElementById('city').innerHTML = `${city}`;
        document.getElementById('today-temp').innerHTML = `${temp}°C`;
        document.getElementById("weather-icon").src = iconUrl;
        document.getElementById('today-humidity').innerHTML = `Umidità: ${humidity}%`;
        document.getElementById('today-wind').innerHTML = `Vento: ${windSpeed} km/h`;
        document.getElementById('today-precip').innerHTML = `Precipitazioni: ${precipitation}%`;
        document.getElementById('weather-description').innerHTML = `Oggi c'è ${description}, la temperatura è di ${temp} gradi Celsius e la probabilità di precipitazioni è pari a ${precipitation}%`;
    } catch (error) {
        var modal = new bootstrap.Modal(document.getElementById('errorModal'));
        document.getElementById("modal-body").innerHTML = "Nome città errato";
        modal.show();
        cleanBackdrop(); // Funzione per rimuovere le sovrapposizioni dei modali
    }
}

/**
 * Funzione per rimuovere le sovrapposizioni dei modali
 */
function cleanBackdrop() {
    var backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(backdrop => backdrop.remove());
}


/**
 * Funzione per prendere le coordinate della città 
 * sulla quale faremo poi le richieste per le previsioni 
 * giornaliere e settimanali
 * @param {città per la quale prendere la coordinata} city 
 * @param {apiKey di openWeather} apiKey 
 * @returns {Object} - Restituisce le coordinate (latitudine, longitudine)
 */
async function getCityCoordinates(city, apiKey) {
    var data = await fetchWeatherData(city, apiKey);

    if (data.cod === 200 && data.coord) {
        return data.coord;
    } else {
        throw new Error(`Città non trovata: ${city}`);
    }
}



/**
 * Funzione per ricevere le previsioni settimanali
 * @param {città per la quale prendere le previsioni} city 
 * @param {apiKey di openWeather} apiKey 
 */
async function getWeeklyForecast(city, apiKey) {
    try {
        var { lat, lon } = await getCityCoordinates(city, apiKey);
        var response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=it`);
        var data = await response.json();
        
        if (!data.list || data.list.length === 0) {
            throw new Error('Nessuna previsione settimanale disponibile');
        }

        var dailyForecasts = processForecastData(data.list);

        let forecastHtml = `
            <h2 class="text-center my-3">Previsioni per la settimana</h2>
            <h3 class="card-title text-center">${city}</h3>
            <div class="row gx-3 gy-3 justify-content-center align-items-stretch">`;

        // Cicla sui dati giornalieri per creare un elenco di previsioni
        dailyForecasts.forEach((day) => {
            var date = new Date(day.date);
            var dayName = date.toLocaleDateString('it-IT', { weekday: 'long' });
            var temperature = Math.round(day.avgTemp.toFixed(1)); // Temperatura media arrotondata
            var description = day.description; // Descrizione meteo
            var icon = day.icon; // Icona meteo
            var humidity = day.humidity; // Umidità
            var windSpeed = day.windSpeed; // Velocità del vento
            var precipitation = day.precipitation; // Probabilità di pioggia
            var iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;

            forecastHtml += `
                <div class="col-12 col-md-6 col-lg-4">
                <div class="card weather-card text-center shadow-sm h-100" style="position: relative; overflow: hidden;">
                <div class="card-background" style="background-image: url('${iconUrl}');"></div>
                        <div class="card-body d-flex flex-column justify-content-between" style="position: relative; z-index: 1;">
                            <h5 class="card-title">${dayName}</h5>
                            <p class="card-text">Temperatura media: ${temperature}°C</p>
                            <p class="card-text">${description}</p>
                            <p class="card-text">Umidità: ${humidity}%</p>
                            <p class="card-text">Vento: ${windSpeed} km/h</p>
                            <p class="card-text">Precipitazioni: ${precipitation}%</p>
                        </div>
                    </div>
                </div>
            `;
        });

        forecastHtml += '</div>';
        document.getElementById('weekly-forecast').innerHTML = forecastHtml;
    } catch (error) {
        var modal = new bootstrap.Modal(document.getElementById('errorModal'));
        document.getElementById("modal-body").innerHTML = "Previsioni settimanali non trovate";
        modal.show();
        cleanBackdrop();
    }
}

// Funzione per elaborare i dati delle previsioni
function processForecastData(forecastList) {

    var groupedData = forecastList.reduce((acc, forecast) => {
        var date = forecast.dt_txt.split(' ')[0]; // Estrai solo la data (es. "2024-11-21")
        if (!acc[date]) acc[date] = [];
        acc[date].push(forecast);
        return acc;
    }, {});

    // Calcola i valori medi per ogni giorno
    return Object.keys(groupedData).map(date => {
        var dayData = groupedData[date];
        var temps = dayData.map(f => f.main.temp);
        var avgTemp = temps.reduce((sum, temp) => sum + temp, 0) / temps.length;

        // Estrai altri valori interessanti
        var humidity = dayData[0].main.humidity; // Umidità
        var windSpeed = dayData[0].wind.speed; // Velocità del vento
        var precipitation = dayData[0].pop * 100; // Probabilità di pioggia in percentuale

        return {
            date,
            avgTemp,
            description: dayData[0].weather[0].description, // Usa la descrizione del primo intervallo
            icon: dayData[0].weather[0].icon, // Usa l'icona del primo intervallo
            humidity,
            windSpeed,
            precipitation
        };
    });
}

/**
 * Funziona che ritorna i dati dello storico
 * @returns ritorna i dati dello storico
 */
function getHistory() {
    // Recupera i dati storici (se esistono) dal localStorage, altrimenti ritorna un array vuoto
    return JSON.parse(localStorage.getItem('storicoMeteo')) || [];
}

// Funzione per estrarre i dati di una città specifica
function extractDataByCity(city) {
    // Recupera i dati storici dallo storage
    var history = getHistory();
    var dates = []; // Array per memorizzare le date
    var temperatures = []; // Array per memorizzare le temperature

    // Filtra i dati dello storico per città specifica
    history.forEach(record => {
        if (record.citta === city) {
            dates.push(record.ora);   // Aggiungi l'ora dei dati
            temperatures.push(record.temperatura);  // Aggiungi la temperatura
        }
    });

    // Ritorna un oggetto contenente le etichette (date) e le temperature per la città
    return { dates, temperatures };
}

function createChart(city) {
    // Estrae i dati relativi alla città specifica
    var { dates, temperatures } = extractDataByCity(city);
    // Se non ci sono dati per la città, mostra un errore
    if (dates.length === 0 || temperatures.length === 0) {
        var modal = new bootstrap.Modal(document.getElementById('errorModal'));
        document.getElementById("modal-body").innerHTML = `Grafico non disponibile per: ${city}`;
        modal.show();  
        cleanBackdrop();
        return;
    }
    // Se esiste già un grafico, distruggilo per crearne uno nuovo
    if (myChart) {
        myChart.destroy();
    }
    // Ottieni il contesto del canvas per il grafico
    var ctx = document.getElementById('temperatureChart').getContext('2d');

    // Crea un nuovo grafico di tipo 'line' (grafico a linee)
    myChart = new Chart(ctx, {
        type: 'line',  // Tipo di grafico (lineare)
        data: {
            labels: dates,  // Le etichette sono le date
            datasets: [{
                label: `Temperatura a ${city} (°C)`,
                data: temperatures,  // I dati sono le temperature
                borderColor: 'rgba(206, 212, 218, 1)',  // Colore della linea
                backgroundColor: 'rgba(75, 192, 192, 0.2)',  // Colore di sfondo
                fill: false,  // Non riempire sotto la linea
                tension: 0.1  // Impostazione per la curva della linea
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                },
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Data'
                    },
                },
                y: {
                    title: {
                        display: true,
                        text: 'Temperatura (°C)'
                    },
                    min: Math.min(...temperatures) - 5,  // Imposta un limite inferiore per l'asse Y
                    max: Math.max(...temperatures) + 5   // Imposta un limite superiore per l'asse Y
                }
            }
        }
    });
}


// Funzione per salvare data, ora e temperatura
function saveForecasts(city, date, hours, temp) {
    // Recupera i dati storici dal localStorage (se esistono)
    var dateHistory = JSON.parse(localStorage.getItem('storicoMeteo')) || [];

    dateHistory.push({ city, date, hours, temp });

    localStorage.setItem('storicoMeteo', JSON.stringify(dateHistory));
}

// Funzione per ottenere la data e l'ora corrente
function getDateTime() {
    var actualHour = new Date();
    var date = actualHour.toISOString().split('T')[0]; // Ottieni la data in formato YYYY-MM-DD
    var hour = actualHour.toTimeString().split(' ')[0]; // Ottieni l'ora in formato HH:mm:ss
    return { date, hour }; 
}

/**
 * Funzione che prende data, ora, città e temperatura
 * 
 * @param {città interessata} city 
 */
async function getTemperature(city) {
    try {
        var data = await fetchWeatherData(city, OPENWEATHER_API_KEY);
        var temp = data.main.temp;
        var { data: currentDate, ora: currentHour } = getDateTime();
        saveForecasts(city, currentDate, currentHour, temp);
    } catch (error) {
        console.error('Errore nel recupero dei dati meteo:', error);  // Logga eventuali errori
    }
}

async function saveDataFavoriteCities() {
    for (var city of favoriteCities) {
        await getTemperature(city);
    }
}

setInterval(saveDataFavoriteCities, 1 * 60 * 1000); // Ogni minuto (1 * 60 * 1000 millisecondi)
getWeeklyForecast(city, OPENWEATHER_API_KEY);
showCities();
updateCurrentTemperature();
