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

let myCourses = [];

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

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
    myCourses = await getMyCourses();
    coursesTableBody.innerHTML = myCourses
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
    const result = id ? await updateMyCourse(Number(id), data) : await addMyCourse(data);
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
    const course = myCourses.find((c) => c.id === Number(editBtn.dataset.id));
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
    const result = await deleteMyCourse(Number(deleteBtn.dataset.id));
    showCourseMessage(result.message, false);
    loadCourses();
  } catch (err) {
    showCourseMessage(err.message, true);
  }
});

loadCourses();

const gradingBody = document.getElementById("gradingBody");
const gradingMessage = document.getElementById("gradingMessage");
const gradeModal = document.getElementById("gradeModal");
const gradeForm = document.getElementById("gradeForm");
const gradeInfo = document.getElementById("gradeInfo");
const gradeError = document.getElementById("gradeError");
const gradeLabel = document.getElementById("gradeLabel");
const submissionIdInput = document.getElementById("submissionId");
const gradeValueInput = document.getElementById("gradeValue");
const gradeFeedbackInput = document.getElementById("gradeFeedback");

let allSubmissions = [];

function showGradingMessage(text, isError) {
  gradingMessage.textContent = text;
  gradingMessage.className = isError ? "message error" : "message";
}

function openGradeModal(submission) {
  gradeError.textContent = "";
  gradeForm.reset();

  submissionIdInput.value = submission.id;
  gradeInfo.innerHTML =
    "<strong>" + escapeHtml(submission.studentName) + "</strong><br>" +
    escapeHtml(submission.assignmentTitle) + " (" + escapeHtml(submission.courseTitle) + ")<br>" +
    "Submission: " + escapeHtml(submission.content);
  gradeLabel.textContent = "Grade (out of " + submission.maxMarks + ")";
  gradeValueInput.max = submission.maxMarks;

  if (submission.grade !== null) {
    gradeValueInput.value = submission.grade;
    gradeFeedbackInput.value = submission.feedback;
  }

  gradeModal.classList.add("show");
}

function closeGradeModal() {
  gradeModal.classList.remove("show");
}

async function loadSubmissions() {
  showGradingMessage("", false);
  try {
    allSubmissions = await getSubmissionsForGrading();

    allSubmissions.sort((a, b) => {
      const aOrder = a.grade === null ? 0 : 1;
      const bOrder = b.grade === null ? 0 : 1;
      if (aOrder !== bOrder) {
        return aOrder - bOrder;
      }
      return new Date(b.submittedAt) - new Date(a.submittedAt);
    });

    gradingBody.innerHTML = allSubmissions
      .map((s) => {
        const status =
          s.grade === null
            ? '<span class="status-tag pending">Pending</span>'
            : '<span class="status-tag graded">Graded: ' + s.grade + "/" + s.maxMarks + "</span>";
        const buttonText = s.grade === null ? "Grade" : "Edit Grade";

        return `
      <tr>
        <td>${escapeHtml(s.studentName)}</td>
        <td>${escapeHtml(s.courseTitle)}</td>
        <td>${escapeHtml(s.assignmentTitle)}</td>
        <td>${escapeHtml(s.content)}</td>
        <td>${status}</td>
        <td><button class="btn-grade" data-id="${s.id}">${buttonText}</button></td>
      </tr>`;
      })
      .join("");
  } catch (err) {
    showGradingMessage(err.message, true);
  }
}

gradingBody.addEventListener("click", (e) => {
  const gradeBtn = e.target.closest(".btn-grade");
  if (!gradeBtn) {
    return;
  }
  const submission = allSubmissions.find((s) => s.id === Number(gradeBtn.dataset.id));
  if (submission) {
    openGradeModal(submission);
  }
});

document.getElementById("cancelGradeModal").addEventListener("click", closeGradeModal);

gradeModal.addEventListener("click", (e) => {
  if (e.target === gradeModal) {
    closeGradeModal();
  }
});

gradeForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  gradeError.textContent = "";

  try {
    const result = await gradeSubmission(
      Number(submissionIdInput.value),
      Number(gradeValueInput.value),
      gradeFeedbackInput.value.trim()
    );
        closeGradeModal();
        showGradingMessage(result.message, false);
        loadSubmissions();
        refreshFeedbackIfOpen();
  } catch (err) {
    gradeError.textContent = err.message;
  }
});

document
  .querySelector('.nav-link[data-section="grading"]')
  .addEventListener("click", loadSubmissions);

  const performanceBody = document.getElementById("performanceBody");
  const performanceMessage = document.getElementById("performanceMessage");

  async function loadPerformance() {
    performanceMessage.textContent = "";
    try {
      const students = await getStudentPerformance();
      students.sort((a, b) => b.progress - a.progress);

      performanceBody.innerHTML = students
        .map(
          (s) => `
        <tr>
          <td>${escapeHtml(s.studentName)}</td>
          <td>${escapeHtml(s.courseTitle)}</td>
          <td>
            <div class="progress"><div class="progress-bar" style="width: ${s.progress}%"></div></div>
            <span class="progress-text">${s.progress}%</span>
          </td>
          <td>${s.assignmentsDone} / ${s.assignmentsTotal}</td>
          <td>${s.averageGrade}%</td>
        </tr>`
        )
        .join("");
    } catch (err) {
      performanceMessage.textContent = err.message;
    }
  }

  document
    .querySelector('.nav-link[data-section="performance"]')
    .addEventListener("click", loadPerformance);

  const enrollmentMessage = document.getElementById("enrollmentMessage");
  const statStudents = document.getElementById("statStudents");
  const statCourses = document.getElementById("statCourses");
  const statProgress = document.getElementById("statProgress");
  const statRisk = document.getElementById("statRisk");
  const engagementBody = document.getElementById("engagementBody");

  let courseEnrollChart = null;
  let trendChart = null;

  function drawEnrollmentCharts(courses, monthly) {
    if (courseEnrollChart) {
      courseEnrollChart.destroy();
    }
    if (trendChart) {
      trendChart.destroy();
    }

    courseEnrollChart = new Chart(document.getElementById("courseEnrollChart"), {
      type: "bar",
      data: {
        labels: courses.map((c) => c.title),
        datasets: [
          {
            label: "Enrolled Students",
            data: courses.map((c) => c.enrolled),
            backgroundColor: "#6366f1",
            borderRadius: 8
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
      }
    });

    trendChart = new Chart(document.getElementById("trendChart"), {
      type: "line",
      data: {
        labels: monthly.map((m) => m.month),
        datasets: [
          {
            label: "Enrollments",
            data: monthly.map((m) => m.enrollments),
            borderColor: "#db2777",
            backgroundColor: "rgba(219, 39, 119, 0.15)",
            fill: true,
            tension: 0.35
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
      }
    });
  }

  async function loadEnrollmentStats() {
    enrollmentMessage.textContent = "";
    try {
      const data = await getEnrollmentStats();

      const totalStudents = data.courses.reduce((sum, c) => sum + c.enrolled, 0);
      const totalRisk = data.courses.reduce((sum, c) => sum + c.atRisk, 0);
      const weightedProgress = data.courses.reduce(
        (sum, c) => sum + c.averageProgress * c.enrolled,
        0
      );

      statStudents.textContent = totalStudents;
      statCourses.textContent = data.courses.length;
      statProgress.textContent = (totalStudents ? Math.round(weightedProgress / totalStudents) : 0) + "%";
      statRisk.textContent = totalRisk;

      engagementBody.innerHTML = data.courses
        .map(
          (c) => `
        <tr>
          <td>${escapeHtml(c.title)}</td>
          <td>${c.enrolled}</td>
          <td>
            <div class="progress"><div class="progress-bar" style="width: ${c.averageProgress}%"></div></div>
            <span class="progress-text">${c.averageProgress}%</span>
          </td>
          <td>${c.atRisk}</td>
        </tr>`
        )
        .join("");

      drawEnrollmentCharts(data.courses, data.monthly);
    } catch (err) {
      enrollmentMessage.textContent = err.message;
    }
  }

  document
    .querySelector('.nav-link[data-section="enrollmentStats"]')
    .addEventListener("click", loadEnrollmentStats);

const feedbackMessage = document.getElementById("feedbackMessage");
const fbGraded = document.getElementById("fbGraded");
const fbPending = document.getElementById("fbPending");
const fbAverage = document.getElementById("fbAverage");
const feedbackList = document.getElementById("feedbackList");

let feedbackItems = [];

function gradeClass(percent) {
  if (percent >= 75) {
    return "high";
  }
  if (percent >= 50) {
    return "mid";
  }
  return "low";
}

async function loadFeedback() {
  feedbackMessage.textContent = "";
  try {
    const submissions = await getSubmissionsForGrading();
    const graded = submissions.filter((s) => s.grade !== null);
    const pending = submissions.filter((s) => s.grade === null);
    feedbackItems = graded;

    const totalPercent = graded.reduce((sum, s) => sum + (s.grade / s.maxMarks) * 100, 0);
    fbGraded.textContent = graded.length;
    fbPending.textContent = pending.length;
    fbAverage.textContent = (graded.length ? Math.round(totalPercent / graded.length) : 0) + "%";

    if (graded.length === 0) {
      feedbackList.innerHTML = '<div class="feedback-empty">No feedback given yet.</div>';
      return;
    }

    graded.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

    feedbackList.innerHTML = graded
      .map((s) => {
        const percent = Math.round((s.grade / s.maxMarks) * 100);
        return `
      <div class="feedback-card">
        <div class="feedback-head">
          <h4>${escapeHtml(s.studentName)}</h4>
          <span class="grade-pill ${gradeClass(percent)}">${s.grade}/${s.maxMarks}</span>
        </div>
        <p class="feedback-meta">${escapeHtml(s.assignmentTitle)} - ${escapeHtml(s.courseTitle)}</p>
        <div class="feedback-text">${escapeHtml(s.feedback || "No feedback written.")}</div>
        <button class="btn-edit" data-id="${s.id}">Edit Feedback</button>
      </div>`;
      })
      .join("");
  } catch (err) {
    feedbackMessage.textContent = err.message;
  }
}

function refreshFeedbackIfOpen() {
  if (document.getElementById("feedback").classList.contains("active")) {
    loadFeedback();
  }
}

feedbackList.addEventListener("click", (e) => {
  const editBtn = e.target.closest(".btn-edit");
  if (!editBtn) {
    return;
  }
  const item = feedbackItems.find((s) => s.id === Number(editBtn.dataset.id));
  if (item) {
    openGradeModal(item);
  }
});

document
  .querySelector('.nav-link[data-section="feedback"]')
  .addEventListener("click", loadFeedback);

