// Глобальні змінні для зберігання даних
let allMovies = [];
let filteredMovies = [];

// DOM елементи
const moviesContainer = document.getElementById("moviesContainer");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const loadingElement = document.getElementById("loading");
const errorElement = document.getElementById("error");

// Асинхронна функція для отримання даних з API
async function fetchMovies() {
  try {
    showLoading(true);
    hideError();

    const response = await fetch("https://api.tvmaze.com/shows");

    // Перевірка статусу відповіді
    if (!response.ok) {
      throw new Error(`HTTP помилка! статус: ${response.status}`);
    }

    const data = await response.json();

    // Обмежуємо кількість фільмів для простоти
    allMovies = data.slice(0, 20);
    filteredMovies = [...allMovies];

    displayMovies(filteredMovies);
  } catch (error) {
    console.error("Помилка завантаження:", error);
    showError(`Помилка завантаження даних: ${error.message}`);
  } finally {
    showLoading(false);
  }
}

// Функція відображення фільмів з використанням ES6 деструктуризації та шаблонних рядків
function displayMovies(movies) {
  if (movies.length === 0) {
    moviesContainer.innerHTML =
      '<p style="text-align: center; color: white; font-size: 1.2rem;">Фільми не знайдено</p>';
    return;
  }

  const moviesHTML = movies
    .map((movie) => {
      // ES6 деструктуризація
      const {
        name,
        image,
        rating: { average: rating } = { average: "N/A" },
        genres,
        summary,
      } = movie;

      // Обробка відсутнього зображення
      const imageUrl = image?.medium || "/placeholder.svg?height=200&width=300";

      // Очищення HTML тегів з опису
      const cleanSummary = summary
        ? summary.replace(/<[^>]*>/g, "").substring(0, 150) + "..."
        : "Опис недоступний";

      // Шаблонний рядок для створення картки фільму
      return `
            <div class="movie-card">
                <img src="${imageUrl}" alt="${name}" class="movie-image">
                <div class="movie-info">
                    <h3 class="movie-title">${name}</h3>
                    <div class="movie-rating">⭐ ${rating || "N/A"}</div>
                    <div class="movie-genres">${
                      genres.join(", ") || "Жанр невідомий"
                    }</div>
                    <p class="movie-summary">${cleanSummary}</p>
                </div>
            </div>
        `;
    })
    .join("");

  moviesContainer.innerHTML = moviesHTML;
}

// Функція фільтрації за назвою
function filterMovies(searchTerm) {
  filteredMovies = allMovies.filter((movie) =>
    movie.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  displayMovies(filteredMovies);
}

// Функція сортування
function sortMovies(sortBy) {
  const sortedMovies = [...filteredMovies].sort((a, b) => {
    if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    } else if (sortBy === "rating") {
      const ratingA = a.rating?.average || 0;
      const ratingB = b.rating?.average || 0;
      return ratingB - ratingA; // Сортування за спаданням
    }
    return 0;
  });

  displayMovies(sortedMovies);
}

// Допоміжні функції для UI
function showLoading(show) {
  loadingElement.classList.toggle("hidden", !show);
}

function hideError() {
  errorElement.classList.add("hidden");
}

function showError(message) {
  errorElement.textContent = message;
  errorElement.classList.remove("hidden");
}

// Обробники подій
searchInput.addEventListener("input", (e) => {
  filterMovies(e.target.value);
});

sortSelect.addEventListener("change", (e) => {
  sortMovies(e.target.value);
});

// Ініціалізація застосунку
document.addEventListener("DOMContentLoaded", () => {
  fetchMovies();
});
