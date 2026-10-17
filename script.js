const apiKey = "bd610f8e8dc2f28f74d9b6c0690f4cb2";
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";

const searchBox = document.querySelector(".search-input");
const searchBtn = document.querySelector(".search-btn");
const weatherIcon = document.querySelector(".weather-icon");
const unitBtn = document.getElementById("unitBtn");
const errorBox = document.querySelector(".error");
const errorMsg = document.querySelector(".error-msg");
const weatherBox = document.querySelector(".weather");

let tempInCelsius = null;
let isCelsius = true;
let debounceTimer = null;

// CDN-hosted Weather Icons
const weatherImages = {
  Clouds: "https://cdn-icons-png.flaticon.com/512/1163/1163661.png",
  Clear: "https://cdn-icons-png.flaticon.com/512/869/869869.png",
  Rain: "https://cdn-icons-png.flaticon.com/512/1163/1163657.png",
  Drizzle: "https://cdn-icons-png.flaticon.com/512/3076/3076129.png",
  Mist: "https://cdn-icons-png.flaticon.com/512/4005/4005901.png",
  Snow: "https://cdn-icons-png.flaticon.com/512/2315/2315309.png"
};

async function checkWeather(city) {
  if (!city || !city.trim()) return;

  try {
    const response = await fetch(`${apiUrl}${encodeURIComponent(city.trim())}&appid=${apiKey}`);

    // If HTTP Status is not OK (200)
    if (!response.ok) {
      if (response.status === 404) {
        showError("City not found! Please check the spelling.");
      } else if (response.status === 401) {
        showError("API key activating or invalid. Please wait a few minutes!");
      } else {
        showError("Unable to fetch weather data right now.");
      }
      return;
    }

    const data = await response.json();

    // Store raw temperature & calculate display
    tempInCelsius = data.main.temp;
    updateTemperatureDisplay();

    document.querySelector(".city").innerText = data.name;
    document.querySelector(".humidity").innerText = data.main.humidity + "%";
    document.querySelector(".wind").innerText = data.wind.speed + " km/h";

    // Dynamic Icon Selection
    const condition = data.weather[0].main;
    weatherIcon.src = weatherImages[condition] || weatherImages.Clouds;

    // Save search in LocalStorage (FEATURE 3)
    localStorage.setItem("lastSearchedCity", data.name);

    // Show Weather Box & Hide Errors
    weatherBox.style.display = "block";
    errorBox.style.display = "none";

  } catch (err) {
    // Catch Offline disconnections or Fetch failures
    showError("Network connection error. Check your internet connection!");
  }
}

function showError(message) {
  errorMsg.innerText = message;
  errorBox.style.display = "block";
  weatherBox.style.display = "none";
}

function updateTemperatureDisplay() {
  if (tempInCelsius === null) return;

  if (isCelsius) {
    document.querySelector(".temp").innerText = Math.round(tempInCelsius) + "°C";
    if (unitBtn) unitBtn.innerText = "Switch to °F";
  } else {
    const tempInFahrenheit = (tempInCelsius * 9 / 5) + 32;
    document.querySelector(".temp").innerText = Math.round(tempInFahrenheit) + "°F";
    if (unitBtn) unitBtn.innerText = "Switch to °C";
  }
}

// Event Listeners
searchBtn.addEventListener("click", () => {
  checkWeather(searchBox.value);
});

searchBox.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    clearTimeout(debounceTimer);
    checkWeather(searchBox.value);
  }
});

// FEATURE 1: Auto-search as user types (600ms Debounce)
searchBox.addEventListener("input", () => {
  clearTimeout(debounceTimer);
  const query = searchBox.value.trim();
  if (query.length >= 3) {
    debounceTimer = setTimeout(() => {
      checkWeather(query);
    }, 600);
  }
});

// FEATURE 2: Unit Switcher
if (unitBtn) {
  unitBtn.addEventListener("click", () => {
    isCelsius = !isCelsius;
    updateTemperatureDisplay();
  });
}

// FEATURE 3: Auto-load last city on fresh page open
window.addEventListener("DOMContentLoaded", () => {
  const savedCity = localStorage.getItem("lastSearchedCity") || "London";
  checkWeather(savedCity);
});