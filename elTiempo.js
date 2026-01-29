// Coordenadas de Carballo aproximadas
const LATITUDE = 43.213;
const LONGITUDE = -8.689;

const API_URL = `https://api.open-meteo.com/v1/forecast?latitude=${LATITUDE}&longitude=${LONGITUDE}&current_weather=true&hourly=temperature_2m,weathercode&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`;

document.addEventListener("DOMContentLoaded", () => {
  fetchWeather();
  initializeAudio();
  setupCarouselControls();
});

// Configurar controles del carrusel
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

// Reproducir audio de fondo
function initializeAudio() {
  const bgAudio = document.getElementById("bg-audio");
  bgAudio.volume = 0.5; // Volumen al 50%
  
  // Reproducir automáticamente (puede ser bloqueado por el navegador)
  bgAudio.play().catch(() => {
    // Si el navegador bloquea reproducción automática, reproducir al hacer click
    document.addEventListener("click", () => {
      bgAudio.play();
      console.log("Audio iniciado por click del usuario");
    }, { once: true });
  });
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
  const daily = data.daily;

  const tempElement = document.getElementById("current-temp");
  const descElement = document.getElementById("current-description");
  const extraElement = document.getElementById("current-extra");
  const updatedElement = document.getElementById("last-updated");

  tempElement.textContent = `${Math.round(current.temperature)}°C`;
  descElement.textContent = mapWeatherCodeToText(current.weathercode);
  extraElement.textContent = `Viento: ${Math.round(current.windspeed)} km/h`;
  updatedElement.textContent = `Actualizado: ${formatTime(current.time)}`;
}

// Próximas horas (por ejemplo, 12 horas desde la actual)
function renderHourlyForecast(data) {
  const container = document.getElementById("hours-container");
  container.innerHTML = "";

  const times = data.hourly.time;
  const temps = data.hourly.temperature_2m;
  const codes = data.hourly.weathercode;

  // Obtener la hora actual en formato ISO
  const currentTime = new Date(data.current_weather.time);
  const currentHourISO = currentTime.toISOString().substring(0, 13) + ":00"; // Formato: "2025-01-29T14:00"

  // Encontrar el índice más cercano a la hora actual
  let startIndex = 0;
  for (let i = 0; i < times.length; i++) {
    if (times[i] >= currentHourISO) {
      startIndex = i;
      break;
    }
  }

  const hoursToShow = 12;

  for (
    let i = startIndex;
    i < startIndex + hoursToShow && i < times.length;
    i++
  ) {
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

// Próximos días (por ejemplo, 5 días)
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

    const dayName = document.createElement("p");
    dayName.classList.add("day-name");
    dayName.textContent = formatDayName(times[i], i === 0);

    const dayDesc = document.createElement("p");
    dayDesc.classList.add("day-desc");
    dayDesc.textContent = mapWeatherCodeToText(codes[i]);

    const dayTemp = document.createElement("p");
    dayTemp.classList.add("day-temp");
    dayTemp.textContent = `${Math.round(minTemps[i])}° / ${Math.round(
      maxTemps[i]
    )}°`;

    dayCard.appendChild(dayName);
    dayCard.appendChild(dayDesc);
    dayCard.appendChild(dayTemp);
    container.appendChild(dayCard);
  }
}

function showErrorMessage() {
  const current = document.getElementById("current-description");
  current.textContent = "No se ha podido cargar el tiempo.";
}

// Funciones auxiliares de formato

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
  return date.toLocaleDateString("es-ES", {
    weekday: "short",
  });
}

// Mapeo sencillo de códigos de tiempo de Open-Meteo
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

// Versión muy corta para poner un icono/emoji en próximas horas
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

