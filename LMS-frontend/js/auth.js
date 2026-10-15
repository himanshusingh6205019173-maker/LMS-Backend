const ROLE_PAGES = {
  ADMIN: "admin/dashboard.html",
  INSTRUCTOR: "instructor/dashboard.html",
  STUDENT: "student/dashboard.html"
};

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const errorBox = document.getElementById("error");
  errorBox.textContent = "";

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const data = await login(email, password);
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    window.location.href = ROLE_PAGES[data.user.role];
  } catch (err) {
    errorBox.textContent = err.message;
  }
});