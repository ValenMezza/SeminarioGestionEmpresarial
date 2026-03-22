const btn = document.getElementById("toggleSidebar");
const sidebar = document.getElementById("sidebar");

const SIDEBAR_WIDTH = 240;

btn.addEventListener("click", () => {
    sidebar.classList.toggle("active");

    if (sidebar.classList.contains("active")) {
        btn.style.left = (SIDEBAR_WIDTH + 12) + "px";
    } else {
        btn.style.left = "16px";
    }
});

// Marcar link activo según la URL actual
document.querySelectorAll(".sidebar__link").forEach(link => {
    if (link.getAttribute("href") === window.location.pathname) {
        link.classList.add("is-active");
    }
});
