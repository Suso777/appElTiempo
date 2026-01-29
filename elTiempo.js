const LATITUDE = 43.213;
const LONGITUDE = -8.689;

const API_URL = `https://api.open-meteo.com/v1/forecast?latitude=${LATITUDE}&longitude=${LONGITUDE}&current_weather=true&hourly=temperature_2m,weathercode,relative_humidity_2m,precipitation_probability&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset&timezone=auto`;

document.addEventListener("DOMContentLoaded", () => {
  fetchWeather();
  initializeAudio();
  setupCarouselControls();
  setupRefreshButton();
});

function setupCarouselControls() {
  const prevBtn = document.getElementById("prev-hour");
  const nextBtn = document.getElementById("next-hour");
  const container = document.getElementById("hours-container");

  if (prevBtn && nextBtn && container) {
    prevBtn.addEventListener("click", () => {
      container.scrollBy({ left: -150, behavior: "smooth" });
    });

    nextBtn.addEventListener("click", () => {
      container.scrollBy({ left: 150, behavior: "smooth" });
    });
  }
}

function setupRefreshButton() {
  const refreshBtn = document.getElementById("refresh-btn");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      refreshBtn.classList.add("spinning");
      fetchWeather();
      setTimeout(() => {
        refreshBtn.classList.remove("spinning");
      }, 1000);
    });
  }
}

function initializeAudio() {
  const bgAudio = document.getElementById("bg-audio");
  bgAudio.volume = 0.5;

  bgAudio.play().catch(() => {
    document.addEventListener(
      "click",
      () => {
        bgAudio.play();
      },
      { once: true }
    );
  });
}

  function changeBackgroundVideo(weatherCode) {
    const video = document.getElementById("bg-video");
    let videoPath = "videos/videoEla.mp4";

    // Códigos de sol: 0, 1, 2
    if ([0, 1, 2].includes(weatherCode)) {
      videoPath = "videos/videoBoTempo.mp4";
    }
    // Códigos de nublado: 3, 45, 48
    else if ([3, 45, 48].includes(weatherCode)) {
      videoPath = "videos/tempoNublado.mp4";
    }
    // Lluvia, tormenta, nieve: todo lo demás
    // 51, 53, 55 (llovizna), 61, 63, 65 (lluvia), 71, 73, 75 (nieve), 80, 81, 82 (chubascos), 95, 96, 99 (tormenta)
    else {
      videoPath = "videos/videoEla.mp4";
    }

    // Solo cambiar si es diferente al actual
    if (video.querySelector("source").src !== videoPath) {
      video.querySelector("source").src = videoPath;
      video.load();
    }
  }
async function fetchWeather() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error("Error al obtener datos del tiempo");
    }

    const data = await response.json();
    renderCurrentWeather(data);
    renderHourlyForecast(data);
    renderDailyForecast(data);
  } catch (error) {
    console.error(error);
    showErrorMessage();
  }
}

function renderCurrentWeather(data) {
  const current = data.current_weather;
  const hourly = data.hourly;
  
  // Encontrar el índice de la hora actual
  const currentIndex = hourly.time.findIndex(time => {
    const timeObj = new Date(time);
    const currentObj = new Date(current.time);
    return timeObj.getHours() === currentObj.getHours();
  });
  
  const currentHumidity = currentIndex >= 0 ? hourly.relative_humidity_2m[currentIndex] : "--";
  const currentPrecip = currentIndex >= 0 ? hourly.precipitation_probability[currentIndex] : "--";
  
  // Calcular índice de confort (Wind Chill simplificado)
  const comfort = calculateComfortIndex(current.temperature, current.windspeed, currentHumidity);

  const tempElement = document.getElementById("current-temp");
  const descElement = document.getElementById("current-description");
  const comfortElement = document.getElementById("current-comfort");
  const windElement = document.getElementById("current-wind");
  const humidityElement = document.getElementById("current-humidity");
  const precipElement = document.getElementById("current-precip");
  const updatedElement = document.getElementById("last-updated");

  tempElement.textContent = `${Math.round(current.temperature)}°C`;
    changeBackgroundVideo(current.weathercode);
  descElement.textContent = mapWeatherCodeToText(current.weathercode);
  comfortElement.textContent = `${Math.round(comfort)}°C`;
  windElement.textContent = `${Math.round(current.windspeed)} km/h`;
  humidityElement.textContent = `${currentHumidity}%`;
  precipElement.textContent = `${currentPrecip}%`;
  updatedElement.textContent = `Actualizado: ${formatTime(current.time)}`;
}

function renderHourlyForecast(data) {
  const container = document.getElementById("hours-container");
  container.innerHTML = "";

  const times = data.hourly.time;
  const temps = data.hourly.temperature_2m;
  const codes = data.hourly.weathercode;

  const currentTime = new Date(data.current_weather.time);
  const currentHourISO = currentTime.toISOString().substring(0, 13) + ":00";

  let startIndex = 0;
  for (let i = 0; i < times.length; i++) {
    if (times[i] >= currentHourISO) {
      startIndex = i;
      break;
    }
  }

  const hoursToShow = 12;

  for (let i = startIndex; i < startIndex + hoursToShow && i < times.length; i++) {
    const hourCard = document.createElement("div");
    hourCard.classList.add("hour-card");

    const hourTime = document.createElement("p");
    hourTime.classList.add("hour-time");
    hourTime.textContent = formatHour(times[i]);

    const hourTemp = document.createElement("p");
    hourTemp.classList.add("hour-temp");
    hourTemp.textContent = `${Math.round(temps[i])}°`;

    const hourDesc = document.createElement("p");
    hourDesc.classList.add("hour-desc");
    hourDesc.textContent = getShortIcon(codes[i]);

    hourCard.appendChild(hourTime);
    hourCard.appendChild(hourTemp);
    hourCard.appendChild(hourDesc);
    container.appendChild(hourCard);
  }
}

function renderDailyForecast(data) {
  const container = document.getElementById("days-container");
  container.innerHTML = "";

  const times = data.daily.time;
  const maxTemps = data.daily.temperature_2m_max;
  const minTemps = data.daily.temperature_2m_min;
  const codes = data.daily.weathercode;

  const daysToShow = 5;

  for (let i = 0; i < daysToShow && i < times.length; i++) {
    const dayCard = document.createElement("div");
    dayCard.classList.add("day-card");

    const dayHeader = document.createElement("div");
    dayHeader.classList.add("day-header");

    const dayName = document.createElement("p");
    dayName.classList.add("day-name");
    dayName.textContent = formatDayName(times[i], i === 0);

    const dayIcon = document.createElement("span");
    dayIcon.classList.add("day-icon");
    dayIcon.textContent = getShortIcon(codes[i]);

    dayHeader.appendChild(dayName);
    dayHeader.appendChild(dayIcon);

    const dayDesc = document.createElement("p");
    dayDesc.classList.add("day-desc");
    dayDesc.textContent = mapWeatherCodeToText(codes[i]);

    const dayTemp = document.createElement("p");
    dayTemp.classList.add("day-temp");
    dayTemp.textContent = `${Math.round(minTemps[i])}° / ${Math.round(
      maxTemps[i]
    )}°`;

    dayCard.appendChild(dayHeader);
    dayCard.appendChild(dayDesc);
    dayCard.appendChild(dayTemp);
    container.appendChild(dayCard);
  }
}

function showErrorMessage() {
  const current = document.getElementById("current-description");
  current.textContent = "No se ha podido cargar el tiempo.";
}

function formatTime(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatHour(isoString) {
  const date = new Date(isoString);
  return date.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDayName(isoString, isToday) {
  const date = new Date(isoString);
  if (isToday) return "Hoy";
  const dayName = date.toLocaleDateString("es-ES", {
    weekday: "short",
  });
  return dayName.charAt(0).toUpperCase() + dayName.slice(1);
}

function calculateComfortIndex(temp, windSpeed, humidity) {
  // Índice de sensación térmica simplificado (Wind Chill + humedad)
  // Wind Chill: 13.12 + 0.6215*T - 11.37*V^0.16 + 0.3965*T*V^0.16
  // Simplificado: T - (windSpeed * 0.3) + (humedad * 0.1)
  
  if (temp > 10) {
    // Para temperaturas cálidas: considerar humedad
    return temp - (windSpeed * 0.15) + ((humidity - 50) * 0.02);
  } else {
    // Para temperaturas frías: wind chill más importante
    const windChill = temp - (windSpeed * 0.3);
    return windChill + ((humidity - 50) * 0.01);
  }
}

function mapWeatherCodeToText(code) {
  const map = {
    0: "Despejado",
    1: "Mayormente despejado",
    2: "Parcialmente nublado",
    3: "Nublado",
    45: "Niebla",
    48: "Niebla con escarcha",
    51: "Llovizna débil",
    53: "Llovizna",
    55: "Llovizna intensa",
    61: "Lluvia débil",
    63: "Lluvia",
    65: "Lluvia intensa",
    71: "Nieve débil",
    73: "Nieve",
    75: "Nieve intensa",
    80: "Chubascos débiles",
    81: "Chubascos",
    82: "Chubascos intensos",
    95: "Tormenta",
    96: "Tormenta con granizo",
    99: "Tormenta fuerte con granizo",
  };

  return map[code] || "Condición desconocida";
}

function getShortIcon(code) {
  if (code === 0) return "☀️";
  if ([1, 2].includes(code)) return "🌤️";
  if (code === 3) return "☁️";
  if ([51, 53, 55].includes(code)) return "🌦️";
  if ([61, 63, 65, 80, 81, 82].includes(code)) return "🌧️";
  if ([71, 73, 75].includes(code)) return "❄️";
  if ([95, 96, 99].includes(code)) return "⛈️";
  return "ℹ️";
}

