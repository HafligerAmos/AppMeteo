// Le chiavi API da configurare
const OPENWEATHER_API_KEY = '2e859646a8a602b49dab81d8731d624f';
const WEATHERAPI_API_KEY = '617feaa2a3d5475ca8592447241610';
const ACCUWEATHER_API_KEY = '0TZ0AytvOwmw7ESOsnIzkiAGss93JAAj';

const city = 'Milano'; // Sostituisci con la città desiderata

async function fetchOpenWeather(city, apiKey) {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
    const data = await response.json();
    return data;
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
        return weatherData[0];
    } else {
        throw new Error("Città non trovata");
    }
}

