const btn = document.getElementById("toggleSidebar");
const sidebar = document.getElementById("sidebar");


btn.addEventListener("click", () => {

    sidebar.classList.toggle("active");

    if (sidebar.classList.contains("active")) {
        btn.style.left = "170px";
    } else {
        btn.style.left = "20px";
    }

});