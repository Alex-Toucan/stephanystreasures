document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const items = document.querySelectorAll(".product-card");

  const numberWords = {
    zero: "0", one: "1", two: "2", three: "3", four: "4",
    five: "5", six: "6", seven: "7", eight: "8", nine: "9",
    ten: "10"
  };

  function levenshtein(a, b) {
    const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        matrix[i][j] =
          b[i - 1] === a[j - 1]
            ? matrix[i - 1][j - 1]
            : Math.min(
                matrix[i - 1][j - 1] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j] + 1
              );
      }
    }
    return matrix[b.length][a.length];
  }

  function convertQuery(q) {
    return numberWords[q] || q;
  }

  function runSearch() {
    let query = searchInput.value.toLowerCase().trim();
    query = convertQuery(query);
    const maxDistance = 1;

    items.forEach(item => {
      const text = item.textContent.toLowerCase();
      let match = text.includes(query);

      if (!match && query.length > 0) {
        const words = text.split(/\s+/);
        match = words.some(word =>
          word === query ||
          word.includes(query) ||
          levenshtein(query, word) <= maxDistance
        );
      }

      item.style.display = match || query.length === 0 ? "" : "none";
    });
  }

  searchInput.addEventListener("input", runSearch);
});
