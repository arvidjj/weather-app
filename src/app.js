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
const nightBG = document.querySelector('.bg');
const dayBG = document.querySelector('.sky');
//NIGHTTIME ANIMATION THANKS TO CSSSCRIPT.COM
const z1 = document.getElementsByClassName("z-1")[0];
const z2 = document.getElementsByClassName("z-2")[0];
const z3 = document.getElementsByClassName("z-3")[0];
const ratio = 0.05;
let x;
let y;
document.addEventListener("mousemove", function (e) {
    x = e.pageX;
    y = e.pageY;
});
requestAnimationFrame(function animation() {
    z1.style.transform = "translate(" + x * ratio + "px," + y * ratio + "px)";

    z2.style.transform =
        "translate(" +
        (x * ratio) / 2 +
        "px," +
        (y * ratio) / 2 +
        "px) rotate(217deg)";

    z3.style.transform =
        "translate(" +
        (x * ratio) / 3 +
        "px," +
        (y * ratio) / 3 +
        "px) rotate(71deg)";

    requestAnimationFrame(animation);
});

if (currentHour >= 19 || currentHour < 5) {
    dayBG.classList.add('isNotVisible');
    nightBG.classList.remove('isNotVisible');
    bodyElement.classList.add('night');
} else {
    dayBG.classList.remove('isNotVisible');
    nightBG.classList.add('isNotVisible');
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
const degreesSelect = document.getElementById('type')
let isLoading = false;
let degrees = 'celsius';
let currentData = null; // Declare currentData variable
let forecastData = null; // Declare currentData variable

mainForm.addEventListener('submit', (e) => {
    e.preventDefault();
})
input.addEventListener('input', (e) => {
    fetchWeatherData(e.target.value);
});
degreesSelect.addEventListener('change', (e) => {
    degrees = e.target.value
    console.log('selected ' + degrees)
    renderWeather(currentData, forecastData);
});

//MAIN FUNCTION
const renderWeather = (current, forecast) => {
    const temperatureUnit = degrees === 'celsius' ? '°C' : '°F';
    const hours = Array.from({ length: 25 }, (_, index) => {
        const forecastIndex = Math.floor(index / 24) + 1;
        const hourIndex = index % 24;
        return {
            time: moment().add(forecastIndex, 'days').hour(hourIndex).format('h A'),
            icon: forecast.forecast.forecastday[forecastIndex].hour[hourIndex].condition.icon,
            temp: degrees === 'celsius'
                ? forecast.forecast.forecastday[forecastIndex].hour[hourIndex].temp_c
                : forecast.forecast.forecastday[forecastIndex].hour[hourIndex].temp_f
        };
    });

    const component = html`
      <div class="flex align-middle items-center content-center flex-col m-10 fade-in ${isLoading ? 'loading' : ''}">
        <div class="main-component flex align-middle items-center content-center flex-col mb-20 p-8 border rounded-3xl">
          <p class="text-4xl font-bold">${current.location.name}</p>
          <p class="text-8xl font-bold">${degrees === 'celsius' ? current.current.temp_c : current.current.temp_f}${temperatureUnit}</p>
          <div class="flex flex-row items-center relative right-2">
            <img src="${current.current.condition.icon}" alt="Condition" class="">
            <p class="text-2xl">${current.current.condition.text}</p>
          </div>
          <div class="">
            <p class="text-l" id="">Feels Like: ${degrees === 'celsius' ? current.current.feelslike_c : current.current.feelslike_f}${temperatureUnit}</p>
          </div>
        </div>
        <div class="flex gap-5 forecast-day">
          ${hours.map((hour) => html`
          <div class="flex flex-col">
            <p class="font-bold">${hour.time}</p>
            <img src="${hour.icon}" alt="Condition" class="">
            <p class="mt-auto font-bold">${hour.temp}${temperatureUnit}</p>
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

        currentData = await currentResponse.json();
        forecastData = await forecastResponse.json();

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