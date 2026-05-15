const form = document.querySelector('.formJs');
const input = document.querySelector('.inputJs');
const card = document.querySelector('.card');

const API_KEY = "4b3c72936318c0527a7c9d99ca963e98";

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const city = input.value.trim();

  if (!city) {
    displayError("Please enter a city name.");
    return;
  }

  try {
    const data = await getWeather(city);
    displayWeather(data);
  } catch {
    displayError("Couldn't find that city. Try again.");
  }
});

async function getWeather(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("City not found");
  return res.json();
}

function displayWeather(data) {
  const { name, main: { temp, humidity }, weather: [{ description, id }] } = data;
  const celsius = (temp - 273.15).toFixed(1);

  card.innerHTML = `
    <h2>${name}</h2>
    <div class="temp-row">
      <span class="temp-value">${celsius}</span>
      <span class="temp-unit">°C</span>
    </div>
    <div class="meta-row">
      <div class="meta-left">
        <span class="humidity">Humidity · ${humidity}%</span>
        <span class="description">${description}</span>
      </div>
      <span class="emoji">${getEmoji(id)}</span>
    </div>
  `;

  card.style.display = 'block';
}

function getEmoji(id) {
  if (id >= 200 && id < 600) return "🌧️";
  if (id >= 600 && id < 700) return "❄️";
  if (id >= 700 && id < 800) return "🌫️";
  if (id === 800) return "☀️";
  if (id > 800) return "☁️";
  return "🌡️";
}

function displayError(message) {
  card.innerHTML = `<p class="error-msg">${message}</p>`;
  card.style.display = 'block';
}
