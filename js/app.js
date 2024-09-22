// Constants
const API_KEY = "9e702b2d8024194981717d834ba8c78e";
const API_BASE_URL = "https://api.openweathermap.org/data/2.5";
const GEO_API_URL = "https://api.openweathermap.org/geo/1.0/direct";

// DOM Elements
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const currentLocationBtn = document.getElementById("currentLocationBtn");
const recentSearches = document.getElementById("recentSearches");
const recentSearchesDropdown = document.getElementById(
  "recentSearchesDropdown"
);
const weatherInfo = document.getElementById("weatherInfo");
const extendedForecast = document.getElementById("extendedForecast");
const errorMessage = document.getElementById("errorMessage");

// Event Listeners
searchBtn.addEventListener("click", () => searchWeather(cityInput.value));
currentLocationBtn.addEventListener("click", getCurrentLocationWeather);
recentSearchesDropdown.addEventListener("change", handleRecentSearchSelect);
cityInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") searchWeather(cityInput.value);
});

// Functions
async function searchWeather(city) {
  try {
    const geoData = await fetchGeoData(city);
    if (geoData.length === 0) throw new Error("City not found");
    const { lat, lon, name, country } = geoData[0];
    const weatherData = await fetchWeatherData(lat, lon);
    const forecastData = await fetchForecastData(lat, lon);
    displayWeather(weatherData, name, country);
    displayExtendedForecast(forecastData);
    updateRecentSearches(city);
  } catch (error) {
    showError(error.message);
  }
}

async function getCurrentLocationWeather() {
  try {
    const position = await getCurrentPosition();
    const { latitude, longitude } = position.coords;
    const geoData = await fetchReversedGeoData(latitude, longitude);
    const weatherData = await fetchWeatherData(latitude, longitude);
    const forecastData = await fetchForecastData(latitude, longitude);
    displayWeather(weatherData, geoData[0].name, geoData[0].country);
    displayExtendedForecast(forecastData);
  } catch (error) {
    showError(
      "Unable to get current location. Please try searching by city name."
    );
  }
}

function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}

async function fetchGeoData(city) {
  const response = await fetch(
    `${GEO_API_URL}?q=${city}&limit=1&appid=${API_KEY}`
  );
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error(
        "API key is invalid or unauthorized. Please check your API key."
      );
    }
    throw new Error("Unable to fetch location data");
  }
  return response.json();
}

async function fetchReversedGeoData(lat, lon) {
  const response = await fetch(
    `${GEO_API_URL}?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`
  );
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error(
        "API key is invalid or unauthorized. Please check your API key."
      );
    }
    throw new Error("Unable to fetch location data");
  }
  return response.json();
}

async function fetchWeatherData(lat, lon) {
  const response = await fetch(
    `${API_BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
  );
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error(
        "API key is invalid or unauthorized. Please check your API key."
      );
    }
    throw new Error("Unable to fetch weather data");
  }
  return response.json();
}

async function fetchForecastData(lat, lon) {
  const response = await fetch(
    `${API_BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
  );
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error(
        "API key is invalid or unauthorized. Please check your API key."
      );
    }
    throw new Error("Unable to fetch forecast data");
  }
  return response.json();
}

function displayWeather(data, city, country) {
  const weatherIcon = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  weatherInfo.innerHTML = `
        <div class="flex flex-col md:flex-row items-center justify-between">
            <div class="flex items-center mb-4 md:mb-0">
                <img src="${weatherIcon}" alt="${
    data.weather[0].description
  }" class="w-20 h-20 mr-4">
                <div>
                    <h2 class="text-3xl font-bold">${city}, ${country}</h2>
                    <p class="text-xl">${data.weather[0].description}</p>
                </div>
            </div>
            <div class="text-right">
                <p class="text-6xl font-bold">${Math.round(
                  data.main.temp
                )}°C</p>
                <p class="text-xl">Feels like: ${Math.round(
                  data.main.feels_like
                )}°C</p>
            </div>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div class="bg-white bg-opacity-20 rounded-lg p-4 text-center">
                <i class="fas fa-tint text-2xl mb-2"></i>
                <p>Humidity</p>
                <p class="text-xl font-bold">${data.main.humidity}%</p>
            </div>
            <div class="bg-white bg-opacity-20 rounded-lg p-4 text-center">
                <i class="fas fa-wind text-2xl mb-2"></i>
                <p>Wind Speed</p>
                <p class="text-xl font-bold">${data.wind.speed} m/s</p>
            </div>
            <div class="bg-white bg-opacity-20 rounded-lg p-4 text-center">
                <i class="fas fa-compress-arrows-alt text-2xl mb-2"></i>
                <p>Pressure</p>
                <p class="text-xl font-bold">${data.main.pressure} hPa</p>
            </div>
            <div class="bg-white bg-opacity-20 rounded-lg p-4 text-center">
                <i class="fas fa-eye text-2xl mb-2"></i>
                <p>Visibility</p>
                <p class="text-xl font-bold">${data.visibility / 1000} km</p>
            </div>
        </div>
    `;
  weatherInfo.classList.remove("hidden");
}

function displayExtendedForecast(data) {
  const dailyData = data.list
    .filter((item) => item.dt_txt.includes("12:00:00"))
    .slice(0, 5);
  extendedForecast.innerHTML = dailyData
    .map((day) => {
      const weatherIcon = `https://openweathermap.org/img/wn/${day.weather[0].icon}.png`;
      return `
            <div class="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-lg shadow-lg p-4 text-center">
                <p class="font-bold text-lg">${new Date(
                  day.dt * 1000
                ).toLocaleDateString("en-US", { weekday: "short" })}</p>
                <img src="${weatherIcon}" alt="${
        day.weather[0].description
      }" class="w-16 h-16 mx-auto my-2">
                <p class="text-3xl font-bold mb-2">${Math.round(
                  day.main.temp
                )}°C</p>
                <p class="text-sm">${day.weather[0].description}</p>
                <div class="flex justify-between mt-2 text-sm">
                    <span><i class="fas fa-tint mr-1"></i>${
                      day.main.humidity
                    }%</span>
                    <span><i class="fas fa-wind mr-1"></i>${
                      day.wind.speed
                    } m/s</span>
                </div>
            </div>
        `;
    })
    .join("");

  extendedForecast.classList.remove("hidden");
}

function updateRecentSearches(city) {
  let searches = JSON.parse(localStorage.getItem("recentSearches")) || [];
  searches = [city, ...searches.filter((item) => item !== city)].slice(0, 5);
  localStorage.setItem("recentSearches", JSON.stringify(searches));
  displayRecentSearches();
}

function displayRecentSearches() {
  const searches = JSON.parse(localStorage.getItem("recentSearches")) || [];
  if (searches.length > 0) {
    recentSearchesDropdown.innerHTML = `
            <option value="">Recent Searches</option>
            ${searches
              .map((city) => `<option value="${city}">${city}</option>`)
              .join("")}
        `;
    recentSearches.classList.remove("hidden");
  } else {
    recentSearches.classList.add("hidden");
  }
}

function handleRecentSearchSelect(event) {
  const selectedCity = event.target.value;
  if (selectedCity) {
    cityInput.value = selectedCity;
    searchWeather(selectedCity);
  }
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove("hidden");
  weatherInfo.classList.add("hidden");
  extendedForecast.classList.add("hidden");
}

// Initialize
displayRecentSearches();
