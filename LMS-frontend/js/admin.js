const navLinks = document.querySelectorAll(".nav-link");
const panels = document.querySelectorAll(".panel");

navLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();

    navLinks.forEach((l) => l.classList.remove("active"));
    panels.forEach((p) => p.classList.remove("active"));

    link.classList.add("active");
    document.getElementById(link.dataset.section).classList.add("active");
  });
});

const usersTableBody = document.getElementById("usersTableBody");
const userMessage = document.getElementById("userMessage");
const userModal = document.getElementById("userModal");
const userForm = document.getElementById("userForm");
const modalTitle = document.getElementById("modalTitle");
const modalError = document.getElementById("modalError");
const userIdInput = document.getElementById("userId");
const userNameInput = document.getElementById("userName");
const userEmailInput = document.getElementById("userEmail");
const userPasswordInput = document.getElementById("userPassword");
const userRoleInput = document.getElementById("userRole");

let allUsers = [];

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function showMessage(text, isError) {
  userMessage.textContent = text;
  userMessage.className = isError ? "message error" : "message";
}

function openModal(user) {
  modalError.textContent = "";
  userForm.reset();

  if (user) {
    modalTitle.textContent = "Edit User";
    userIdInput.value = user.id;
    userNameInput.value = user.name;
    userEmailInput.value = user.email;
    userRoleInput.value = user.role;
    userPasswordInput.required = false;
    userPasswordInput.placeholder = "Leave blank to keep current password";
  } else {
    modalTitle.textContent = "Add User";
    userIdInput.value = "";
    userPasswordInput.required = true;
    userPasswordInput.placeholder = "";
  }

  userModal.classList.add("show");
}

function closeModal() {
  userModal.classList.remove("show");
}

async function loadUsers() {
  try {
    allUsers = await getUsers();
    usersTableBody.innerHTML = allUsers
      .map(
        (u) => `
      <tr>
        <td>${escapeHtml(u.name)}</td>
        <td>${escapeHtml(u.email)}</td>
        <td><span class="badge ${u.role}">${u.role}</span></td>
        <td>
          <button class="btn-edit" data-id="${u.id}">Edit</button>
          <button class="btn-delete" data-id="${u.id}">Delete</button>
        </td>
      </tr>`
      )
      .join("");
  } catch (err) {
    showMessage(err.message, true);
  }
}

document.getElementById("addUserBtn").addEventListener("click", () => {
  openModal(null);
});

document.getElementById("cancelModal").addEventListener("click", closeModal);

userModal.addEventListener("click", (e) => {
  if (e.target === userModal) {
    closeModal();
  }
});

userForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  modalError.textContent = "";

  const id = userIdInput.value;
  const data = {
    name: userNameInput.value.trim(),
    email: userEmailInput.value.trim(),
    role: userRoleInput.value
  };

  if (userPasswordInput.value) {
    data.password = userPasswordInput.value;
  }

  try {
    const result = id ? await updateUser(Number(id), data) : await addUser(data);
    closeModal();
    showMessage(result.message, false);
    loadUsers();
  } catch (err) {
    modalError.textContent = err.message;
  }
});

usersTableBody.addEventListener("click", async (e) => {
  const editBtn = e.target.closest(".btn-edit");
  const deleteBtn = e.target.closest(".btn-delete");

  if (editBtn) {
    const user = allUsers.find((u) => u.id === Number(editBtn.dataset.id));
    if (user) {
      openModal(user);
    }
    return;
  }

  if (!deleteBtn) {
    return;
  }

  const id = Number(deleteBtn.dataset.id);
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  if (currentUser && currentUser.id === id) {
    showMessage("You cannot delete your own account", true);
    return;
  }

  if (!confirm("Are you sure you want to delete this user?")) {
    return;
  }

  try {
    const result = await deleteUser(id);
    showMessage(result.message, false);
    loadUsers();
  } catch (err) {
    showMessage(err.message, true);
  }
});

loadUsers();

const coursesTableBody = document.getElementById("coursesTableBody");
const courseMessage = document.getElementById("courseMessage");
const courseModal = document.getElementById("courseModal");
const courseForm = document.getElementById("courseForm");
const courseModalTitle = document.getElementById("courseModalTitle");
const courseModalError = document.getElementById("courseModalError");
const courseIdInput = document.getElementById("courseId");
const courseTitleInput = document.getElementById("courseTitle");
const courseDescriptionInput = document.getElementById("courseDescription");
const courseSyllabusInput = document.getElementById("courseSyllabus");

let allCourses = [];

function showCourseMessage(text, isError) {
  courseMessage.textContent = text;
  courseMessage.className = isError ? "message error" : "message";
}

function openCourseModal(course) {
  courseModalError.textContent = "";
  courseForm.reset();

  if (course) {
    courseModalTitle.textContent = "Edit Course";
    courseIdInput.value = course.id;
    courseTitleInput.value = course.title;
    courseDescriptionInput.value = course.description;
    courseSyllabusInput.value = course.syllabus;
  } else {
    courseModalTitle.textContent = "Add Course";
    courseIdInput.value = "";
  }

  courseModal.classList.add("show");
}

function closeCourseModal() {
  courseModal.classList.remove("show");
}

async function loadCourses() {
  try {
    allCourses = await getCourses();
    coursesTableBody.innerHTML = allCourses
      .map(
        (c) => `
      <tr>
        <td>${escapeHtml(c.title)}</td>
        <td>${escapeHtml(c.description)}</td>
        <td>${escapeHtml(c.syllabus)}</td>
        <td>
          <button class="btn-edit" data-id="${c.id}">Edit</button>
          <button class="btn-delete" data-id="${c.id}">Delete</button>
        </td>
      </tr>`
      )
      .join("");
  } catch (err) {
    showCourseMessage(err.message, true);
  }
}

document.getElementById("addCourseBtn").addEventListener("click", () => {
  openCourseModal(null);
});

document.getElementById("cancelCourseModal").addEventListener("click", closeCourseModal);

courseModal.addEventListener("click", (e) => {
  if (e.target === courseModal) {
    closeCourseModal();
  }
});

courseForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  courseModalError.textContent = "";

  const id = courseIdInput.value;
  const data = {
    title: courseTitleInput.value.trim(),
    description: courseDescriptionInput.value.trim(),
    syllabus: courseSyllabusInput.value.trim()
  };

  try {
    const result = id ? await updateCourse(Number(id), data) : await addCourse(data);
    closeCourseModal();
    showCourseMessage(result.message, false);
    loadCourses();
  } catch (err) {
    courseModalError.textContent = err.message;
  }
});

coursesTableBody.addEventListener("click", async (e) => {
  const editBtn = e.target.closest(".btn-edit");
  const deleteBtn = e.target.closest(".btn-delete");

  if (editBtn) {
    const course = allCourses.find((c) => c.id === Number(editBtn.dataset.id));
    if (course) {
      openCourseModal(course);
    }
    return;
  }

  if (!deleteBtn) {
    return;
  }

  if (!confirm("Are you sure you want to delete this course?")) {
    return;
  }

  try {
    const result = await deleteCourse(Number(deleteBtn.dataset.id));
    showCourseMessage(result.message, false);
    loadCourses();
  } catch (err) {
    showCourseMessage(err.message, true);
  }
});

loadCourses();

const analyticsMessage = document.getElementById("analyticsMessage");
const studentStatsBody = document.getElementById("studentStatsBody");

let enrollmentChart = null;
let performanceChart = null;

function drawCharts(courseStats) {
  const labels = courseStats.map((c) => c.title);

  if (enrollmentChart) {
    enrollmentChart.destroy();
  }
  if (performanceChart) {
    performanceChart.destroy();
  }

  enrollmentChart = new Chart(document.getElementById("enrollmentChart"), {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Enrolled Students",
          data: courseStats.map((c) => c.enrolled),
          backgroundColor: "#6366f1",
          borderRadius: 8
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    }
  });

  performanceChart = new Chart(document.getElementById("performanceChart"), {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Completion Rate (%)",
          data: courseStats.map((c) => c.completionRate),
          backgroundColor: "#db2777",
          borderRadius: 8
        },
        {
          label: "Average Grade",
          data: courseStats.map((c) => c.averageGrade),
          backgroundColor: "#059669",
          borderRadius: 8
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { y: { beginAtZero: true, max: 100 } }
    }
  });
}

function drawStudentTable(studentStats) {
  studentStatsBody.innerHTML = studentStats
    .map(
      (s) => `
    <tr>
      <td>${escapeHtml(s.name)}</td>
      <td>${escapeHtml(s.course)}</td>
      <td>
        <div class="progress"><div class="progress-bar" style="width: ${s.progress}%"></div></div>
        <span class="progress-text">${s.progress}%</span>
      </td>
      <td>${s.grade}</td>
    </tr>`
    )
    .join("");
}

async function loadAnalytics() {
  analyticsMessage.textContent = "";
  try {
    const data = await getAnalytics();
    drawCharts(data.courseStats);
    drawStudentTable(data.studentStats);
  } catch (err) {
    analyticsMessage.textContent = err.message;
  }
}

document
  .querySelector('.nav-link[data-section="analytics"]')
  .addEventListener("click", loadAnalytics);

  const settingsMessage = document.getElementById("settingsMessage");
  const settingsForm = document.getElementById("settingsForm");
  const siteNameInput = document.getElementById("siteName");
  const supportEmailInput = document.getElementById("supportEmail");
  const allowRegistrationInput = document.getElementById("allowRegistration");
  const maintenanceModeInput = document.getElementById("maintenanceMode");

  function showSettingsMessage(text, isError) {
    settingsMessage.textContent = text;
    settingsMessage.className = isError ? "message error" : "message";
  }

  async function loadSettings() {
    showSettingsMessage("", false);
    try {
      const settings = await getSettings();
      siteNameInput.value = settings.siteName;
      supportEmailInput.value = settings.supportEmail;
      allowRegistrationInput.checked = settings.allowRegistration;
      maintenanceModeInput.checked = settings.maintenanceMode;
    } catch (err) {
      showSettingsMessage(err.message, true);
    }
  }

  settingsForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      siteName: siteNameInput.value.trim(),
      supportEmail: supportEmailInput.value.trim(),
      allowRegistration: allowRegistrationInput.checked,
      maintenanceMode: maintenanceModeInput.checked
    };

    try {
      const result = await updateSettings(data);
      showSettingsMessage(result.message, false);
    } catch (err) {
      showSettingsMessage(err.message, true);
    }
  });

  document
    .querySelector('.nav-link[data-section="settings"]')
    .addEventListener("click", loadSettings);

    const activityBody = document.getElementById("activityBody");
    const activityMessage = document.getElementById("activityMessage");

    let activityTimer = null;

    function timeAgo(isoTime) {
      const seconds = Math.floor((Date.now() - new Date(isoTime).getTime()) / 1000);

      if (seconds < 10) {
        return "Just now";
      }
      if (seconds < 60) {
        return seconds + " sec ago";
      }

      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) {
        return minutes + " min ago";
      }

      const hours = Math.floor(minutes / 60);
      if (hours < 24) {
        return hours + " hr ago";
      }

      return new Date(isoTime).toLocaleDateString();
    }

    async function loadActivity() {
      activityMessage.textContent = "";
      try {
        const items = await getActivity();
        items.sort((a, b) => new Date(b.time) - new Date(a.time));
        activityBody.innerHTML = items
          .map(
            (a) => `
          <tr>
            <td class="time-text">${timeAgo(a.time)}</td>
            <td>${escapeHtml(a.user)}</td>
            <td>${escapeHtml(a.action)}</td>
          </tr>`
          )
          .join("");
      } catch (err) {
        activityMessage.textContent = err.message;
      }
    }

    function stopActivityRefresh() {
      if (activityTimer) {
        clearInterval(activityTimer);
        activityTimer = null;
      }
    }

    function startActivityRefresh() {
      stopActivityRefresh();
      loadActivity();
      activityTimer = setInterval(loadActivity, 5000);
    }

    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        if (link.dataset.section === "activity") {
          startActivityRefresh();
        } else {
          stopActivityRefresh();
        }
      });
    });

    const overviewMessage = document.getElementById("overviewMessage");
    const totalUsersEl = document.getElementById("totalUsers");
    const totalCoursesEl = document.getElementById("totalCourses");
    const totalEnrollmentsEl = document.getElementById("totalEnrollments");
    const totalInstructorsEl = document.getElementById("totalInstructors");

    async function loadOverview() {
      overviewMessage.textContent = "";
      try {
        const stats = await getOverviewStats();
        totalUsersEl.textContent = stats.totalUsers;
        totalCoursesEl.textContent = stats.totalCourses;
        totalEnrollmentsEl.textContent = stats.totalEnrollments;
        totalInstructorsEl.textContent = stats.totalInstructors;
      } catch (err) {
        overviewMessage.textContent = err.message;
      }
    }

    document
      .querySelector('.nav-link[data-section="overview"]')
      .addEventListener("click", loadOverview);

    loadOverview();