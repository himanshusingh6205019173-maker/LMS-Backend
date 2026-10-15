function requireRole(role) {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!user || user.role !== role) {
    window.location.href = "../login.html";
    return;
  }

  document.getElementById("welcome").textContent = "Welcome, " + user.name;
}

function logout() {
  localStorage.clear();
  window.location.href = "../login.html";
}