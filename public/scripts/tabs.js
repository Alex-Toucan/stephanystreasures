document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll("#category-tabs .nav-link");
  const cards = document.querySelectorAll(".product-card");
  const emptyMessage = document.getElementById("empty-message");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      // Update active tab
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      const category = tab.dataset.category;
      let visibleCount = 0;

      cards.forEach(card => {
        const cardCat = card.dataset.category;

        // Fade out first
        card.classList.add("hide");

        setTimeout(() => {
          if (category === "All" || cardCat === category) {
            card.style.display = "";
            visibleCount++;
            // Fade back in
            requestAnimationFrame(() => card.classList.remove("hide"));
          } else {
            card.style.display = "none";
          }
        }, 200);
      });

      // Show empty message if needed
      setTimeout(() => {
        emptyMessage.style.display = visibleCount === 0 ? "block" : "none";
      }, 250);
    });
  });
});