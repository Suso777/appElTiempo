# ☀️ O TEMPO - Aplicación Meteorológica Dinámica

> Una aplicación web moderna y elegante para consultar el tiempo en tiempo real con un diseño dinámico y responsivo.

![Estado del Proyecto](https://img.shields.io/badge/estado-activo-brightgreen?style=flat-square)
![Licencia](https://img.shields.io/badge/licencia-MIT-blue?style=flat-square)
![Versión](https://img.shields.io/badge/versión-1.0-orange?style=flat-square)

---

## 🎯 Descripción

**O TEMPO** es una aplicación meteorológica interactiva desarrollada con tecnologías web modernas. Proporciona información detallada del tiempo actual, pronóstico por horas y pronóstico de 5 días con una interfaz visual atractiva y dinámica.

### ✨ Características Principales

- 🌡️ **Tiempo Actual**: Visualización instantánea de temperatura, descripción meteorológica y velocidad del viento
- ⏰ **Pronóstico Horario**: Predicción del tiempo para las próximas 12 horas con iconos visuales
- 📅 **Pronóstico Semanal**: Proyección de 5 días con temperaturas máximas y mínimas
- 🎨 **Interfaz Responsiva**: Diseño elegante y adaptable a cualquier dispositivo
- 🔄 **Actualización en Tiempo Real**: Datos actualizados automáticamente desde la API
- 📍 **Localización Automática**: Información de ubicación integrada
- 🎵 **Experiencia Multimedia**: Fondo de video y audio ambiental

---

## 🛠️ Tecnologías Utilizadas

| Tecnología | Descripción |
|-----------|-----------|
| **HTML5** | Estructura semántica y responsiva |
| **CSS3** | Estilos modernos con efectos visuales |
| **JavaScript (Vanilla)** | Lógica de aplicación sin dependencias externas |
| **Open-Meteo API** | Proveedor de datos meteorológicos gratuito |

---

## 📊 Estructura del Proyecto

```
elTiempo/
├── 📄 index.html          # Archivo principal HTML
├── 🎨 elTiempo.css        # Estilos de la aplicación
├── ⚙️  elTiempo.js        # Lógica y consumo de API
├── 📁 audio/              # Archivos de audio de fondo
├── 🎬 videoEla.mp4        # Video de fondo
└── 📖 README.md           # Este archivo
```

---

## 🔌 Consumo de la API - Flujo de Datos

### 📡 Proveedor: Open-Meteo API

La aplicación utiliza la **API Open-Meteo**, un servicio gratuito y sin autenticación que proporciona datos meteorológicos precisos.

#### 🔄 Flujo de Consumo

```javascript
// 1. SOLICITUD INICIAL (Al cargar la página)
DOMContentLoaded → fetchWeather()

// 2. CONSTRUCCIÓN DE LA URL
https://api.open-meteo.com/v1/forecast
├── latitude: 43.213 (Carballo, Galicia)
├── longitude: -8.689
├── current_weather: true (Tiempo actual)
├── hourly: temperature_2m, weathercode (Por horas)
├── daily: weathercode, temperature_2m_max, temperature_2m_min (Diarios)
└── timezone: auto (Zona horaria automática)

// 3. FETCH ASINCRÓNICO
fetch(API_URL)
├── response.ok → Validación
└── response.json() → Extracción de datos

// 4. PROCESAMIENTO DE DATOS
renderCurrentWeather() → Tiempo actual
renderHourlyForecast() → Pronóstico por horas
renderDailyForecast() → Pronóstico de 5 días

// 5. RENDERIZADO EN DOM
Actualización dinámica de elementos HTML
```

### 🔗 Endpoint Utilizado

```
GET https://api.open-meteo.com/v1/forecast
```

**Parámetros:**
- `latitude` / `longitude`: Coordenadas geográficas
- `current_weather`: Incluye datos meteorológicos actuales
- `hourly`: Datos de temperatura y códigos meteorológicos por horas
- `daily`: Datos de temperatura y códigos meteorológicos diarios
- `timezone`: Zona horaria para formateo de fechas

---

## 🧠 Explicación del JavaScript

### 📝 Módulos Principales

#### **1. Inicialización y Configuración**
```javascript
const LATITUDE = 43.213;
const LONGITUDE = -8.689;
const API_URL = `https://api.open-meteo.com/v1/forecast?...`

document.addEventListener("DOMContentLoaded", () => {
  fetchWeather();  // Se ejecuta al cargar la página
});
```

#### **2. Función Principal: `fetchWeather()`**
Realiza la llamada a la API y controla el flujo de datos:
- Realiza una solicitud `fetch()` asincrónica
- Valida la respuesta con `response.ok`
- Convierte el JSON a objeto JavaScript
- Distribuye los datos a funciones de renderizado
- Captura errores en el `catch`

```javascript
async function fetchWeather() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    // Renderizar tres secciones
    renderCurrentWeather(data);
    renderHourlyForecast(data);
    renderDailyForecast(data);
  } catch (error) {
    showErrorMessage();
  }
}
```

#### **3. Función: `renderCurrentWeather(data)`**
Actualiza la sección de tiempo actual:
- Extrae datos de `data.current_weather`
- Formatea temperatura y velocidad del viento
- Mapea códigos meteorológicos a descripción legible
- Inserta los datos en el DOM

#### **4. Función: `renderHourlyForecast(data)`**
Genera tarjetas para las próximas 12 horas:
- Busca la hora actual en los datos
- Itera 12 horas desde el presente
- Crea elementos `div` dinámicamente
- Añade iconos emoji según el código meteorológico

#### **5. Función: `renderDailyForecast(data)`**
Genera pronóstico de 5 días:
- Extrae datos de `data.daily`
- Muestra temperaturas máximas y mínimas
- Identifica el día actual como "Hoy"

#### **6. Funciones de Mapeo y Formato**
- `mapWeatherCodeToText(code)`: Convierte códigos numéricos a descripciones
- `getShortIcon(code)`: Asigna emojis a cada código meteorológico
- `formatTime()`, `formatHour()`, `formatDayName()`: Formatean fechas según localización

---

## 🎨 Características de Diseño

- **Responsividad Total**: Se adapta a móviles, tablets y escritorio
- **Tarjetas Visuales**: Estructura modular con cards para cada sección
- **Iconos Dinámicos**: Emojis que representan condiciones meteorológicas
- **Fondo Multimedia**: Video de fondo con audio ambiental
- **Actualización en Vivo**: Los datos se renuevan automáticamente
- **Modo Oscuro**: Interfaz oscura para reducir fatiga visual

---

## 🚀 Instalación y Uso

### Requisitos
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Conexión a internet para consumir la API

### Pasos
1. Clonar o descargar el repositorio
2. Abrir `index.html` en el navegador
3. ¡La aplicación cargará automáticamente los datos del tiempo!

```bash
# Clone el repositorio
git clone https://github.com/Suso777/appElTiempo.git

# Navegue al directorio
cd appElTiempo

# Abra en su navegador preferido
open index.html
```

---

## 📍 Localización

La aplicación está configurada para mostrar el tiempo de:
- **📌 Carballo, Galicia, España**
- Coordenadas: 43.213°N, 8.689°O

Para cambiar la ubicación, modifique las constantes:
```javascript
const LATITUDE = 43.213;   // Cambiar aquí
const LONGITUDE = -8.689;  // Cambiar aquí
```

---

## 🔐 Datos y Privacidad

- Los datos se obtienen de la **API Open-Meteo** (servicio gratuito)
- No se almacenan datos personales
- No requiere autenticación ni claves API
- Los datos se solicitan en tiempo real

---

## 👨‍💻 Desarrollo

**Desarrollado por:** **Suso Suárez**

Este proyecto fue creado como un ejercicio de desarrollo web, demostrando:
- Consumo de APIs REST
- Programación asincrónica con JavaScript
- Manipulación del DOM dinámicamente
- Diseño responsivo con CSS3
- Mejores prácticas de desarrollo web

---

## 📚 Documentación de la API

Para más información sobre Open-Meteo API, visite:
- [Open-Meteo Documentación](https://open-meteo.com/en/docs)
- [Códigos Meteorológicos WMO](https://open-meteo.com/en/docs#weather_code)

---

## 🎓 Agradecimientos

Un sincero agradecimiento a:

- 🙏 **Open-Meteo** por proporcionar una API meteorológica gratuita y confiable
- 🙏 **FACTORIA F5** por la formación y oportunidad de aprendizaje
- 🙏 **La comunidad de desarrollo web** por las herramientas y recursos compartidos
- 🙏 **Todos los usuarios** que utilizan esta aplicación

---

## 📝 Licencia

Este proyecto está bajo licencia **MIT**. Eres libre de usar, modificar y distribuir este código.

---

<div align="center">

**Hecho con ❤️ por Suso Suárez**

*Última actualización: 29 de enero de 2026*

</div>
