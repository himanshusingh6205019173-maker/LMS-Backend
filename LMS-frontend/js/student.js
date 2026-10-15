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

const enrollMessage = document.getElementById("enrollMessage");
const enrolledList = document.getElementById("enrolledList");
const availableList = document.getElementById("availableList");
const detailModal = document.getElementById("detailModal");
const detailTitle = document.getElementById("detailTitle");
const detailInstructor = document.getElementById("detailInstructor");
const detailDescription = document.getElementById("detailDescription");
const detailSyllabus = document.getElementById("detailSyllabus");

let catalog = [];

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function showEnrollMessage(text, isError) {
  enrollMessage.textContent = text;
  enrollMessage.className = isError ? "message error" : "message";
}

function courseCard(course) {
  const button = course.enrolled
    ? `<button class="btn-view" data-action="view" data-id="${course.id}">View Details</button>`
    : `<button class="btn-view" data-action="view" data-id="${course.id}">View Details</button>
       <button class="btn-enroll" data-action="enroll" data-id="${course.id}">Enroll</button>`;

  return `
    <div class="course-card">
      <h4>${escapeHtml(course.title)}</h4>
      <p class="course-instructor">Instructor: ${escapeHtml(course.instructorName)}</p>
      <p class="course-desc">${escapeHtml(course.description)}</p>
      <div class="course-actions">${button}</div>
    </div>`;
}

async function loadCatalog() {
  try {
    catalog = await getCourseCatalog();

    const enrolled = catalog.filter((c) => c.enrolled);
    const available = catalog.filter((c) => !c.enrolled);

    enrolledList.innerHTML = enrolled.length
      ? enrolled.map(courseCard).join("")
      : '<div class="empty-box">You have not enrolled in any course yet.</div>';

    availableList.innerHTML = available.length
      ? available.map(courseCard).join("")
      : '<div class="empty-box">No more courses available right now.</div>';
  } catch (err) {
    showEnrollMessage(err.message, true);
  }
}

function openDetailModal(course) {
  detailTitle.textContent = course.title;
  detailInstructor.textContent = "Instructor: " + course.instructorName;
  detailDescription.textContent = course.description;
  detailSyllabus.textContent = course.syllabus;
  detailModal.classList.add("show");
}

function closeDetailModal() {
  detailModal.classList.remove("show");
}

async function handleCourseClick(e) {
  const btn = e.target.closest("button[data-action]");
  if (!btn) {
    return;
  }

  const id = Number(btn.dataset.id);

  if (btn.dataset.action === "view") {
    const course = catalog.find((c) => c.id === id);
    if (course) {
      openDetailModal(course);
    }
    return;
  }

  try {
    const result = await enrollInCourse(id);
    showEnrollMessage(result.message, false);
    loadCatalog();
  } catch (err) {
    showEnrollMessage(err.message, true);
  }
}

enrolledList.addEventListener("click", handleCourseClick);
availableList.addEventListener("click", handleCourseClick);

document.getElementById("closeDetailModal").addEventListener("click", closeDetailModal);

detailModal.addEventListener("click", (e) => {
  if (e.target === detailModal) {
    closeDetailModal();
  }
});

loadCatalog();

const materialMessage = document.getElementById("materialMessage");
const materialsBody = document.getElementById("materialsBody");
const materialModal = document.getElementById("materialModal");
const materialTitle = document.getElementById("materialTitle");
const materialMeta = document.getElementById("materialMeta");
const materialContent = document.getElementById("materialContent");

let myMaterials = [];
let openedMaterial = null;

async function loadMaterials() {
  materialMessage.textContent = "";
  try {
    myMaterials = await getMyMaterials();

    if (myMaterials.length === 0) {
      materialsBody.innerHTML =
        '<tr><td colspan="4">No materials yet. Enroll in a course to access its materials.</td></tr>';
      return;
    }

    materialsBody.innerHTML = myMaterials
      .map(
        (m) => `
      <tr>
        <td>${escapeHtml(m.courseTitle)}</td>
        <td class="material-title">${escapeHtml(m.title)}</td>
        <td><span class="type-tag ${m.type}">${m.type}</span></td>
        <td>
          <div class="material-actions">
            <button class="btn-view" data-action="view" data-id="${m.id}">View</button>
            <button class="btn-download" data-action="download" data-id="${m.id}">Download</button>
          </div>
        </td>
      </tr>`
      )
      .join("");
  } catch (err) {
    materialMessage.textContent = err.message;
  }
}

function openMaterialModal(material) {
  openedMaterial = material;
  materialTitle.textContent = material.title;
  materialMeta.textContent = material.courseTitle + " - " + material.type;
  materialContent.textContent = material.content;
  materialModal.classList.add("show");
}

function closeMaterialModal() {
  materialModal.classList.remove("show");
}

async function startDownload(material) {
  materialMessage.textContent = "";
  try {
    await downloadMaterial(material);
  } catch (err) {
    materialMessage.textContent = err.message;
  }
}

materialsBody.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) {
    return;
  }

  const material = myMaterials.find((m) => m.id === Number(btn.dataset.id));
  if (!material) {
    return;
  }

  if (btn.dataset.action === "view") {
    openMaterialModal(material);
  } else {
    startDownload(material);
  }
});

document.getElementById("closeMaterialModal").addEventListener("click", closeMaterialModal);

document.getElementById("downloadFromModal").addEventListener("click", () => {
  if (openedMaterial) {
    startDownload(openedMaterial);
  }
});

materialModal.addEventListener("click", (e) => {
  if (e.target === materialModal) {
    closeMaterialModal();
  }
});

document
  .querySelector('.nav-link[data-section="materials"]')
  .addEventListener("click", loadMaterials);

  const submissionMessage = document.getElementById("submissionMessage");
  const assignmentsBody = document.getElementById("assignmentsBody");
  const submitModal = document.getElementById("submitModal");
  const submitForm = document.getElementById("submitForm");
  const submitInfo = document.getElementById("submitInfo");
  const submitError = document.getElementById("submitError");
  const submitAssignmentIdInput = document.getElementById("submitAssignmentId");
  const submitFileInput = document.getElementById("submitFile");
  const submitNotesInput = document.getElementById("submitNotes");

  let myAssignments = [];

  function showSubmissionMessage(text, isError) {
    submissionMessage.textContent = text;
    submissionMessage.className = isError ? "message error" : "message";
  }

  function assignmentStatus(assignment) {
    if (!assignment.submission) {
      return '<span class="status-tag notsubmitted">Not Submitted</span>';
    }
    if (assignment.submission.grade === null) {
      return '<span class="status-tag submitted">Submitted</span>';
    }
    return (
      '<span class="status-tag graded">Graded: ' +
      assignment.submission.grade + "/" + assignment.maxMarks + "</span>"
    );
  }

  async function loadAssignments() {
    showSubmissionMessage("", false);
    try {
      myAssignments = await getMyAssignments();

      if (myAssignments.length === 0) {
        assignmentsBody.innerHTML =
          '<tr><td colspan="5">No assignments yet. Enroll in a course to see its assignments.</td></tr>';
        return;
      }

      myAssignments.sort((a, b) => {
        const aOrder = a.submission ? 1 : 0;
        const bOrder = b.submission ? 1 : 0;
        return aOrder - bOrder;
      });

      assignmentsBody.innerHTML = myAssignments
        .map(
          (a) => `
        <tr>
          <td>${escapeHtml(a.courseTitle)}</td>
          <td class="material-title">${escapeHtml(a.title)}</td>
          <td>${a.maxMarks}</td>
          <td>${assignmentStatus(a)}</td>
          <td>${
            a.submission
              ? "-"
              : `<button class="btn-submit" data-id="${a.id}">Submit</button>`
          }</td>
        </tr>`
        )
        .join("");
    } catch (err) {
      showSubmissionMessage(err.message, true);
    }
  }

  function openSubmitModal(assignment) {
    submitError.textContent = "";
    submitForm.reset();
    submitAssignmentIdInput.value = assignment.id;
    submitInfo.innerHTML =
      "<strong>" + escapeHtml(assignment.title) + "</strong> (" + escapeHtml(assignment.courseTitle) + ")<br>" +
      escapeHtml(assignment.description) + "<br>" +
      "Max marks: " + assignment.maxMarks;
    submitModal.classList.add("show");
  }

  function closeSubmitModal() {
    submitModal.classList.remove("show");
  }

  assignmentsBody.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-submit");
    if (!btn) {
      return;
    }
    const assignment = myAssignments.find((a) => a.id === Number(btn.dataset.id));
    if (assignment) {
      openSubmitModal(assignment);
    }
  });

  document.getElementById("cancelSubmitModal").addEventListener("click", closeSubmitModal);

  submitModal.addEventListener("click", (e) => {
    if (e.target === submitModal) {
      closeSubmitModal();
    }
  });

  submitForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    submitError.textContent = "";

    const file = submitFileInput.files[0];
    const fileName = file ? file.name : "";
    const notes = submitNotesInput.value.trim();

    if (!fileName && !notes) {
      submitError.textContent = "Please upload a file or write a note";
      return;
    }

    try {
      const result = await submitAssignment(Number(submitAssignmentIdInput.value), fileName, notes);
      closeSubmitModal();
      showSubmissionMessage(result.message, false);
      loadAssignments();
    } catch (err) {
      submitError.textContent = err.message;
    }
  });

  document
    .querySelector('.nav-link[data-section="submission"]')
    .addEventListener("click", loadAssignments);

    const progressMessage = document.getElementById("progressMessage");
    const pCourses = document.getElementById("pCourses");
    const pAssignments = document.getElementById("pAssignments");
    const pOverall = document.getElementById("pOverall");
    const pGrade = document.getElementById("pGrade");
    const progressBody = document.getElementById("progressBody");

    let progressChart = null;
    let assignmentChart = null;

    function drawProgressCharts(courses, done, remaining) {
      if (progressChart) {
        progressChart.destroy();
      }
      if (assignmentChart) {
        assignmentChart.destroy();
      }

      progressChart = new Chart(document.getElementById("progressChart"), {
        type: "bar",
        data: {
          labels: courses.map((c) => c.title),
          datasets: [
            {
              label: "Progress (%)",
              data: courses.map((c) => c.progress),
              backgroundColor: "#6366f1",
              borderRadius: 8
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, max: 100 } }
        }
      });

      assignmentChart = new Chart(document.getElementById("assignmentChart"), {
        type: "doughnut",
        data: {
          labels: ["Completed", "Remaining"],
          datasets: [
            {
              data: [done, remaining],
              backgroundColor: ["#059669", "#e2e8f0"],
              borderWidth: 0
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: "bottom" } }
        }
      });
    }

    async function loadProgress() {
      progressMessage.textContent = "";
      try {
        const courses = await getMyProgress();

        const done = courses.reduce((sum, c) => sum + c.assignmentsDone, 0);
        const total = courses.reduce((sum, c) => sum + c.assignmentsTotal, 0);
        const overall = total ? Math.round((done / total) * 100) : 0;

        const graded = courses.filter((c) => c.averageGrade !== null);
        const avgGrade = graded.length
          ? Math.round(graded.reduce((sum, c) => sum + c.averageGrade, 0) / graded.length)
          : null;

        pCourses.textContent = courses.length;
        pAssignments.textContent = done + " / " + total;
        pOverall.textContent = overall + "%";
        pGrade.textContent = avgGrade === null ? "-" : avgGrade + "%";

        if (courses.length === 0) {
          progressBody.innerHTML =
            '<tr><td colspan="4">You are not enrolled in any course yet.</td></tr>';
        } else {
          progressBody.innerHTML = courses
            .map(
              (c) => `
            <tr>
              <td class="material-title">${escapeHtml(c.title)}</td>
              <td>
                <div class="progress"><div class="progress-bar" style="width: ${c.progress}%"></div></div>
                <span class="progress-text">${c.progress}%</span>
              </td>
              <td>${c.assignmentsDone} / ${c.assignmentsTotal}</td>
              <td>${c.averageGrade === null ? "-" : c.averageGrade + "%"}</td>
            </tr>`
            )
            .join("");
        }

        drawProgressCharts(courses, done, total - done);
      } catch (err) {
        progressMessage.textContent = err.message;
      }
    }

    document
      .querySelector('.nav-link[data-section="progress"]')
      .addEventListener("click", loadProgress);

      const gradesMessage = document.getElementById("gradesMessage");
      const gGraded = document.getElementById("gGraded");
      const gPending = document.getElementById("gPending");
      const gAverage = document.getElementById("gAverage");
      const gradesList = document.getElementById("gradesList");

      function gradeClass(percent) {
        if (percent >= 75) {
          return "high";
        }
        if (percent >= 50) {
          return "mid";
        }
        return "low";
      }

      async function loadGrades() {
        gradesMessage.textContent = "";
        try {
          const submissions = await getMyGrades();
          const graded = submissions.filter((s) => s.grade !== null);
          const pending = submissions.filter((s) => s.grade === null);

          const totalPercent = graded.reduce((sum, s) => sum + (s.grade / s.maxMarks) * 100, 0);
          gGraded.textContent = graded.length;
          gPending.textContent = pending.length;
          gAverage.textContent = graded.length ? Math.round(totalPercent / graded.length) + "%" : "-";

          if (submissions.length === 0) {
            gradesList.innerHTML = '<div class="feedback-empty">You have not submitted any assignment yet.</div>';
            return;
          }

          graded.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
          pending.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

          const gradedCards = graded.map((s) => {
            const percent = Math.round((s.grade / s.maxMarks) * 100);
            return `
            <div class="feedback-card">
              <div class="feedback-head">
                <h4>${escapeHtml(s.assignmentTitle)}</h4>
                <span class="grade-pill ${gradeClass(percent)}">${s.grade}/${s.maxMarks}</span>
              </div>
              <p class="feedback-meta">${escapeHtml(s.courseTitle)} - ${percent}%</p>
              <div class="feedback-text">${escapeHtml(s.feedback || "No feedback written.")}</div>
            </div>`;
          });

          const pendingCards = pending.map(
            (s) => `
            <div class="feedback-card">
              <div class="feedback-head">
                <h4>${escapeHtml(s.assignmentTitle)}</h4>
                <span class="grade-pill mid">Pending</span>
              </div>
              <p class="feedback-meta">${escapeHtml(s.courseTitle)}</p>
              <div class="feedback-text">Your instructor has not graded this yet.</div>
            </div>`
          );

          gradesList.innerHTML = gradedCards.concat(pendingCards).join("");
        } catch (err) {
          gradesMessage.textContent = err.message;
        }
      }

      document
        .querySelector('.nav-link[data-section="grades"]')
        .addEventListener("click", loadGrades);