//import './input.css';
import { html, render } from 'lit';
import './style.css';
import './input.css';
import moment from 'moment';
import { geocode } from 'opencage-api-client';

const renderWeatherHere = document.querySelector("#renderWeather")

//DATE AND LOCATION
const currentHour = moment().hour();
const bodyElement = document.querySelector('body');

if (currentHour >= 19 || currentHour < 5) {
    bodyElement.classList.add('night');
} else {
    bodyElement.classList.add('day');
}
if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            // Use reverse geocoding to get the city and country
            const geoCodeResult = await geocode({
                q: `${latitude}, ${longitude}`,
                key: 'YOUR_OPENCAGE_API_KEY',
            });

            const city = geoCodeResult.results[0].components.city;
            const country = geoCodeResult.results[0].components.country;

            console.log(`City: ${city}, Country: ${country}`);
        },
        (error) => {
            console.log('Error retrieving location:', error);
        }
    );
} else {
    console.log('Geolocation is not supported by this browser.');
}


const input = document.getElementById('locationInput');
const mainForm = document.getElementById('mainForm');
let isLoading = false;

mainForm.addEventListener('submit', (e) => {
    e.preventDefault();
})
input.addEventListener('input', async (e) => {
    fetchWeatherData(e.target.value);
  });

//MAIN FUNCTION
const renderWeather = (current, forecast) => {
    const hours = Array.from({ length: 25 }, (_, index) => {
        const forecastIndex = Math.floor(index / 24) + 1;
        const hourIndex = index % 24;
        return {
            time: moment().add(forecastIndex, 'days').hour(hourIndex).format('h A'),
            icon: forecast.forecast.forecastday[forecastIndex].hour[hourIndex].condition.icon,
            temp_c: forecast.forecast.forecastday[forecastIndex].hour[hourIndex].temp_c
        };
    });

    const component = html`
     <div class="flex align-middle items-center content-center flex-col m-10 fade-in ${isLoading ? 'loading' : ''}">
        <p class="text-4xl">${current.location.name}</p>
        <p class="text-8xl">${current.current.temp_c}°C</p>
        <div class="flex flex-row items-center relative right-2">
            <img src="${current.current.condition.icon}" alt="Condition" class="">
            <p class="text-2xl">${current.current.condition.text}</p>
        </div>
        <div class="mb-20">
            <p class="text-l" id="">Feels Like: ${current.current.feelslike_c}°C</p>
        </div>
        <div class="flex gap-5 forecast-day">
            ${hours.map((hour) => html`
            <div class="flex flex-col">
                <p>${hour.time}</p>
                <img src="${hour.icon}" alt="Condition" class="">
                <p class="mt-auto">${hour.temp_c}°C</p>
            </div>
            `)}
        </div>
    </div>
`;
    render(component, renderWeatherHere);
    renderWeatherHere.classList.remove("loading");
    
    // ANIMATION
    setTimeout(() => {
        const componentElement = document.querySelector('.fade-in');
        componentElement.classList.add('show');
    }, 100);
    
};

async function fetchWeatherData(location) {
    try {
        const currentUrl = `http://api.weatherapi.com/v1/current.json?key=5b9ab160015f4d91b5d231913231905&q=${location}&aqi=no`;
        const forecastUrl = `http://api.weatherapi.com/v1/forecast.json?key=5b9ab160015f4d91b5d231913231905&q=${location}&days=3`;

        const [currentResponse, forecastResponse] = await Promise.all([
            fetch(currentUrl),
            fetch(forecastUrl),
        ]);

        const currentData = await currentResponse.json();
        const forecastData = await forecastResponse.json();

        renderWeatherHere.classList.add("loading");

        // Process the received data
        console.log(currentData); // Display the current weather data
        console.log(forecastData); // Display the forecast weather data

        renderWeather(currentData, forecastData);
    } catch (error) {
        console.log('An error occurred:', error);
    }
}


fetchWeatherData("Ciudad Del Este");