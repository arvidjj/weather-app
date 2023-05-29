//import './input.css';
import { html, render } from 'lit';
import './style.css';
import './input.css';

const input = document.querySelector("#locationInput");
const renderWeatherHere = document.querySelector("#renderWeather")

document.querySelector("#mainForm").addEventListener("submit", (e) => {
    e.preventDefault();
});

input.addEventListener("input", (e) => {
    fetchWeatherData(e.target.value);
});

const renderWeather = (data) => {
    console.log("rendering...")
    const component = html`
    <div class="flex align-middle items-center content-center flex-col m-10">
        <p class="text-4xl" id="">${data.location.name}</p>
        <p class="text-8xl">${data.current.temp_c}°C</p>

        <div class="flex flex-row items-center relative right-2">
            <img src="${data.current.condition.icon}" alt="Condition" class="">
            <p class="text-2xl">${data.current.condition.text}</p>
            
        </div>
        <div>
            <p class="text-l" id="">Feels Like: ${data.current.feelslike_c}°C</p>
        </div>
    </div>
    `;
    render(component, renderWeatherHere);
}

async function fetchWeatherData(location) {
    try {
        const url = `http://api.weatherapi.com/v1/current.json?key=5b9ab160015f4d91b5d231913231905&q=${location}&aqi=no`;
        const response = await fetch(url);
        const data = await response.json();

        // Process the received data
        console.log(data); // Display the weather data in the console or perform further operations

        renderWeather(data);
    } catch (error) {
        console.log('An error occurred:', error);
    }
}

fetchWeatherData("Ciudad Del Este");