document.addEventListener("DOMContentLoaded", () => {
  const navWrapper = document.querySelector(".fixed-top");
  const twoPointFiveRem =
    parseFloat(getComputedStyle(document.documentElement).fontSize) * 2.5;

  window.addEventListener("scroll", () => {
    if (window.scrollY > twoPointFiveRem) {
      navWrapper.classList.add("navbar-scrolled");
    } else {
      navWrapper.classList.remove("navbar-scrolled");
    }
  });
});
