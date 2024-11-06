// Le chiavi API da configurare
const OPENWEATHER_API_KEY = '2e859646a8a602b49dab81d8731d624f';
const WEATHERAPI_API_KEY = '617feaa2a3d5475ca8592447241610';
const ACCUWEATHER_API_KEY = '0TZ0AytvOwmw7ESOsnIzkiAGss93JAAj';

const city = 'Milano'; // Sostituisci con la città desiderata

async function fetchOpenWeather(city, apiKey) {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
    const data = await response.json();
    const temp = data.main.temp;
    const iconCode = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    return {data,temp,iconUrl};
}

async function fetchWeatherAPI(city, apiKey) {
    const response = await fetch(`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}`);
    const data = await response.json();
    return data;
}

async function fetchAccuWeather(city, apiKey) {
    const locationResponse = await fetch(`http://dataservice.accuweather.com/locations/v1/cities/search?apikey=${apiKey}&q=${city}`);
    const locationData = await locationResponse.json();
    
    if (locationData.length > 0) {
        const locationKey = locationData[0].Key;
        const weatherResponse = await fetch(`http://dataservice.accuweather.com/currentconditions/v1/${locationKey}?apikey=${apiKey}`);
        const weatherData = await weatherResponse.json();
        return weatherData;
    } else {
        throw new Error("Città non trovata");
    }
}

async function updateTemperature(){
    try {
        // Puoi scegliere quale API chiamare, ad esempio, con OpenWeatherMap
        const { temp, iconUrl } = await fetchOpenWeather(city, OPENWEATHER_API_KEY);

        // Aggiorna il contenuto del div
        document.getElementById('city').innerHTML = `${city}`;
        document.getElementById('today-temp').innerHTML = `${temp}°C`;
        document.getElementById("weather-icon").src = iconUrl;
    } catch (error) {
        console.error('Errore nel recupero dei dati:', error);
        document.getElementById('today-temp').innerHTML = 'Errore nel recupero della temperatura.';
    }
}

// Funzione per ottenere le coordinate della città
async function getCityCoordinates(city, apiKey) {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`);
    const data = await response.json();
    
    if (data.cod === 200 && data.coord) {
        return data.coord;  // Restituisce le coordinate (latitudine, longitudine)
    } else {
        throw new Error(`Città non trovata: ${city}`);
    }
}

// Funzione per ottenere le previsioni settimanali
async function getWeeklyForecast(city, apiKey) {
    try {
        const { lat, lon } = await getCityCoordinates(city, apiKey);
        console.log(lat,lon);
        // Ottieni la previsione settimanale usando le coordinate (latitudine, longitudine)
        const response = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,alerts&appid=${apiKey}&units=metric`);
        const data = await response.json();

        if (!data.daily || data.daily.length === 0) {
            throw new Error('Nessuna previsione settimanale disponibile');
        }

        // Elenco delle previsioni giornaliere
        const dailyForecasts = data.daily;

        let forecastHtml = '<h2>Previsioni per la settimana</h2>';

        // Ciclo sui dati giornalieri per creare un elenco
        dailyForecasts.forEach((day) => {
            const date = new Date(day.dt * 1000);
            const dayName = date.toLocaleDateString('it-IT', { weekday: 'long' });
            const temperature = day.temp.day;  // Temperatura massima del giorno
            const description = day.weather[0].description;  // Descrizione meteo (es. "soleggiato")
            const icon = day.weather[0].icon;  // Icona del meteo

            forecastHtml += `
                <div>
                    <h3>${dayName}</h3>
                    <p>Temperatura: ${temperature}°C</p>
                    <p>Condizioni: ${description}</p>
                    <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}" />
                </div>
            `;
        });

        // Aggiungi le previsioni al div
        document.getElementById('weekly-forecast').innerHTML = forecastHtml;

    } catch (error) {
        console.error('Errore nel recupero delle previsioni:', error);
        document.getElementById('weekly-forecast').innerHTML = 'Errore nel recupero delle previsioni.';
    }
}



// Chiamare la funzione per ottenere le previsioni settimanali
getWeeklyForecast(city, OPENWEATHER_API_KEY);

updateTemperature();

