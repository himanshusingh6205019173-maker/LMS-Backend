
const USE_MOCK = false;
const BASE_URL = "http://localhost:8081/api";
const mockUsers = [
  { id: 1, name: "Admin",      email: "admin@lms.com",      password: "admin123", role: "ADMIN" },
  { id: 2, name: "Instructor", email: "instructor@lms.com", password: "inst123",  role: "INSTRUCTOR" },
  { id: 3, name: "Student",    email: "student@lms.com",    password: "stud123",  role: "STUDENT" }
];

async function login(email, password) {
  if (USE_MOCK) {
    const user = mockUsers.find(
      (u) => u.email === email && u.password === password
    );
    if (!user) {
      throw new Error("Invalid email or password");
    }
    return {
      token: "mock-token",
      user: { id: user.id, name: user.name, role: user.role }
    };
  }

  const res = await fetch(BASE_URL + "/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    throw new Error("Invalid email or password");
  }
  return res.json();
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    "Authorization": "Bearer " + localStorage.getItem("token")
  };
}

async function getUsers() {
  if (USE_MOCK) {
    return mockUsers.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role
    }));
  }

  const res = await fetch(BASE_URL + "/admin/users", { headers: authHeaders() });
  if (!res.ok) {
    throw new Error("Could not load users");
  }
  return res.json();
}

async function addUser(user) {
  if (USE_MOCK) {
    if (mockUsers.some((u) => u.email === user.email)) {
      throw new Error("Email already exists");
    }
        mockUsers.push({ id: Date.now(), ...user });
        logActivity("Created user " + user.name);
        return { message: "User created successfully" };
  }

  const res = await fetch(BASE_URL + "/admin/users", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(user)
  });
  if (!res.ok) {
    throw new Error("Could not create user");
  }
  return { message: "User created successfully" };
}

async function updateUser(id, data) {
  if (USE_MOCK) {
    const user = mockUsers.find((u) => u.id === id);
    if (!user) {
      throw new Error("User not found");
    }
    user.name = data.name;
    user.email = data.email;
    user.role = data.role;
        if (data.password) {
          user.password = data.password;
        }
        logActivity("Updated user " + user.name);
        return { message: "User updated successfully" };
  }

  const res = await fetch(BASE_URL + "/admin/users/" + id, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    throw new Error("Could not update user");
  }
  return { message: "User updated successfully" };
}

async function deleteUser(id) {
  if (USE_MOCK) {
    const index = mockUsers.findIndex((u) => u.id === id);
    if (index === -1) {
      throw new Error("User not found");
    }
        const removedUser = mockUsers.splice(index, 1)[0];
        logActivity("Deleted user " + removedUser.name);
        return { message: "User deleted successfully" };
  }

  const res = await fetch(BASE_URL + "/admin/users/" + id, {
    method: "DELETE",
    headers: authHeaders()
  });
  if (!res.ok) {
    throw new Error("Could not delete user");
  }
  return { message: "User deleted successfully" };
}

const mockCourses = [
  {
    id: 1,
    title: "Java Programming",
    description: "Learn core Java from basics to OOP.",
    syllabus: "Variables, Control Flow, OOP, Collections, Exceptions",
    instructorId: 2
  },
  {
    id: 2,
    title: "Web Development",
    description: "Build websites using HTML, CSS and JavaScript.",
    syllabus: "HTML, CSS, JavaScript, DOM, Fetch API",
    instructorId: 2
  }
];

async function getCourses() {
  if (USE_MOCK) {
    return mockCourses.map((c) => ({ ...c }));
  }

  const res = await fetch(BASE_URL + "/admin/courses", { headers: authHeaders() });
  if (!res.ok) {
    throw new Error("Could not load courses");
  }
  return res.json();
}

async function addCourse(course) {
  if (USE_MOCK) {
        mockCourses.push({ id: Date.now(), ...course });
        logActivity("Created course " + course.title);
        return { message: "Course created successfully" };
  }

  const res = await fetch(BASE_URL + "/admin/courses", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(course)
  });
  if (!res.ok) {
    throw new Error("Could not create course");
  }
  return { message: "Course created successfully" };
}

async function updateCourse(id, data) {
  if (USE_MOCK) {
    const course = mockCourses.find((c) => c.id === id);
    if (!course) {
      throw new Error("Course not found");
    }
    course.title = data.title;
    course.description = data.description;
        course.syllabus = data.syllabus;
        logActivity("Updated course " + course.title);
        return { message: "Course updated successfully" };
  }

  const res = await fetch(BASE_URL + "/admin/courses/" + id, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    throw new Error("Could not update course");
  }
  return { message: "Course updated successfully" };
}

async function deleteCourse(id) {
  if (USE_MOCK) {
    const index = mockCourses.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new Error("Course not found");
    }
        const removedCourse = mockCourses.splice(index, 1)[0];
        logActivity("Deleted course " + removedCourse.title);
        return { message: "Course deleted successfully" };
  }

  const res = await fetch(BASE_URL + "/admin/courses/" + id, {
    method: "DELETE",
    headers: authHeaders()
  });
  if (!res.ok) {
    throw new Error("Could not delete course");
  }
  return { message: "Course deleted successfully" };
}

const mockAnalytics = {
  courseStats: [
    { title: "Java Programming", enrolled: 42, completionRate: 68, averageGrade: 74 },
    { title: "Web Development", enrolled: 55, completionRate: 81, averageGrade: 79 },
    { title: "Data Structures", enrolled: 30, completionRate: 52, averageGrade: 66 },
    { title: "Database Basics", enrolled: 36, completionRate: 74, averageGrade: 71 }
  ],
  studentStats: [
    { name: "Aarav Sharma", course: "Java Programming", progress: 85, grade: 88 },
    { name: "Priya Verma", course: "Web Development", progress: 92, grade: 91 },
    { name: "Rohan Gupta", course: "Data Structures", progress: 45, grade: 58 },
    { name: "Sneha Patel", course: "Database Basics", progress: 70, grade: 76 },
    { name: "Karan Singh", course: "Java Programming", progress: 60, grade: 64 }
  ]
};

async function getAnalytics() {
  if (USE_MOCK) {
    return JSON.parse(JSON.stringify(mockAnalytics));
  }

  const res = await fetch(BASE_URL + "/admin/analytics", { headers: authHeaders() });
  if (!res.ok) {
    throw new Error("Could not load analytics");
  }
  return res.json();
}

const mockSettings = {
  siteName: "My LMS",
  supportEmail: "support@lms.com",
  allowRegistration: true,
  maintenanceMode: false
};

async function getSettings() {
  if (USE_MOCK) {
    return { ...mockSettings };
  }

  const res = await fetch(BASE_URL + "/admin/settings", { headers: authHeaders() });
  if (!res.ok) {
    throw new Error("Could not load settings");
  }
  return res.json();
}

async function updateSettings(data) {
  if (USE_MOCK) {
    mockSettings.siteName = data.siteName;
    mockSettings.supportEmail = data.supportEmail;
    mockSettings.allowRegistration = data.allowRegistration;
    mockSettings.maintenanceMode = data.maintenanceMode;
    return { message: "Settings updated successfully" };
  }

  const res = await fetch(BASE_URL + "/admin/settings", {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    throw new Error("Could not update settings");
  }
  return { message: "Settings updated successfully" };
}

const mockActivity = [
  { id: 1, user: "Admin", action: "Logged in to the system", time: new Date(Date.now() - 45 * 60000).toISOString() },
  { id: 2, user: "Instructor", action: "Created course Java Programming", time: new Date(Date.now() - 30 * 60000).toISOString() },
  { id: 3, user: "Student", action: "Enrolled in Web Development", time: new Date(Date.now() - 18 * 60000).toISOString() },
  { id: 4, user: "Student", action: "Submitted assignment in Java Programming", time: new Date(Date.now() - 7 * 60000).toISOString() }
];

function logActivity(action) {
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");
  mockActivity.unshift({
    id: Date.now(),
    user: currentUser ? currentUser.name : "System",
    action: action,
    time: new Date().toISOString()
  });
}

async function getActivity() {
  if (USE_MOCK) {
    return mockActivity.map((a) => ({ ...a }));
  }

  const res = await fetch(BASE_URL + "/admin/activity", { headers: authHeaders() });
  if (!res.ok) {
    throw new Error("Could not load activity");
  }
  return res.json();
}

function getCurrentUser() {
  return JSON.parse(localStorage.getItem("user") || "null");
}

async function getMyCourses() {
  if (USE_MOCK) {
    const me = getCurrentUser();
    return mockCourses
      .filter((c) => me && c.instructorId === me.id)
      .map((c) => ({ ...c }));
  }

  const res = await fetch(BASE_URL + "/instructor/courses", { headers: authHeaders() });
  if (!res.ok) {
    throw new Error("Could not load courses");
  }
  return res.json();
}

async function addMyCourse(course) {
  if (USE_MOCK) {
    const me = getCurrentUser();
    mockCourses.push({ id: Date.now(), ...course, instructorId: me ? me.id : null });
    logActivity("Created course " + course.title);
    return { message: "Course created successfully" };
  }

  const res = await fetch(BASE_URL + "/instructor/courses", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(course)
  });
  if (!res.ok) {
    throw new Error("Could not create course");
  }
  return { message: "Course created successfully" };
}

async function updateMyCourse(id, data) {
  if (USE_MOCK) {
    const me = getCurrentUser();
    const course = mockCourses.find((c) => c.id === id && me && c.instructorId === me.id);
    if (!course) {
      throw new Error("Course not found");
    }
    course.title = data.title;
    course.description = data.description;
    course.syllabus = data.syllabus;
    logActivity("Updated course " + course.title);
    return { message: "Course updated successfully" };
  }

  const res = await fetch(BASE_URL + "/instructor/courses/" + id, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    throw new Error("Could not update course");
  }
  return { message: "Course updated successfully" };
}

async function deleteMyCourse(id) {
  if (USE_MOCK) {
    const me = getCurrentUser();
    const index = mockCourses.findIndex((c) => c.id === id && me && c.instructorId === me.id);
    if (index === -1) {
      throw new Error("Course not found");
    }
    const removed = mockCourses.splice(index, 1)[0];
    logActivity("Deleted course " + removed.title);
    return { message: "Course deleted successfully" };
  }

  const res = await fetch(BASE_URL + "/instructor/courses/" + id, {
    method: "DELETE",
    headers: authHeaders()
  });
  if (!res.ok) {
    throw new Error("Could not delete course");
  }
  return { message: "Course deleted successfully" };
}

const mockAssignments = [
  { id: 1, courseId: 1, title: "Java OOP Basics", description: "Build a Library system using classes and objects.", maxMarks: 100 },
  { id: 2, courseId: 2, title: "Portfolio Page", description: "Create a personal portfolio page using HTML and CSS.", maxMarks: 50 }
];

const mockSubmissions = [
  {
    id: 1,
    assignmentId: 1,
    studentId: 3,
    studentName: "Aarav Sharma",
    content: "library-system.zip",
    submittedAt: new Date(Date.now() - 3 * 3600000).toISOString(),
    grade: null,
    feedback: ""
  },
  {
    id: 2,
    assignmentId: 2,
    studentId: 4,
    studentName: "Priya Verma",
    content: "portfolio.html",
    submittedAt: new Date(Date.now() - 26 * 3600000).toISOString(),
    grade: null,
    feedback: ""
  },
  {
    id: 3,
    assignmentId: 1,
    studentId: 5,
    studentName: "Rohan Gupta",
    content: "library-oop.zip",
    submittedAt: new Date(Date.now() - 50 * 3600000).toISOString(),
    grade: 78,
    feedback: "Good use of classes. Add input validation."
  },
  {
    id: 4,
    assignmentId: 2,
    studentId: 6,
    studentName: "Sneha Patel",
    content: "my-portfolio.html",
    submittedAt: new Date(Date.now() - 70 * 3600000).toISOString(),
    grade: 44,
    feedback: "Nice layout. Make it responsive for mobile."
  }
];

async function getSubmissionsForGrading() {
  if (USE_MOCK) {
    const me = getCurrentUser();
    const myCourseIds = mockCourses
      .filter((c) => me && c.instructorId === me.id)
      .map((c) => c.id);

    return mockSubmissions
      .map((s) => {
        const assignment = mockAssignments.find((a) => a.id === s.assignmentId);
        if (!assignment || !myCourseIds.includes(assignment.courseId)) {
          return null;
        }
        const course = mockCourses.find((c) => c.id === assignment.courseId);
        return {
          ...s,
          assignmentTitle: assignment.title,
          courseTitle: course.title,
          maxMarks: assignment.maxMarks
        };
      })
      .filter((s) => s !== null);
  }

  const res = await fetch(BASE_URL + "/instructor/submissions", { headers: authHeaders() });
  if (!res.ok) {
    throw new Error("Could not load submissions");
  }
  return res.json();
}

async function gradeSubmission(id, grade, feedback) {
  if (USE_MOCK) {
    const submission = mockSubmissions.find((s) => s.id === id);
    if (!submission) {
      throw new Error("Submission not found");
    }
    const assignment = mockAssignments.find((a) => a.id === submission.assignmentId);
    if (grade < 0 || grade > assignment.maxMarks) {
      throw new Error("Grade must be between 0 and " + assignment.maxMarks);
    }
    submission.grade = grade;
    submission.feedback = feedback;
    logActivity("Graded " + submission.studentName + " in " + assignment.title);
    return { message: "Grade saved successfully" };
  }

  const res = await fetch(BASE_URL + "/instructor/submissions/" + id + "/grade", {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ grade, feedback })
  });
  if (!res.ok) {
    throw new Error("Could not save grade");
  }
  return { message: "Grade saved successfully" };
}

const mockStudentProgress = [
  { id: 1, studentName: "Aarav Sharma", courseId: 1, progress: 85, assignmentsDone: 4, assignmentsTotal: 5, averageGrade: 88 },
  { id: 2, studentName: "Priya Verma",  courseId: 2, progress: 92, assignmentsDone: 5, assignmentsTotal: 5, averageGrade: 91 },
  { id: 3, studentName: "Rohan Gupta",  courseId: 1, progress: 45, assignmentsDone: 2, assignmentsTotal: 5, averageGrade: 78 },
  { id: 4, studentName: "Sneha Patel",  courseId: 2, progress: 70, assignmentsDone: 3, assignmentsTotal: 5, averageGrade: 88 },
  { id: 5, studentName: "Karan Singh",  courseId: 1, progress: 60, assignmentsDone: 3, assignmentsTotal: 5, averageGrade: 64 },
  { id: 6, studentName: "Meera Joshi",  courseId: 2, progress: 38, assignmentsDone: 1, assignmentsTotal: 5, averageGrade: 55 }
];

async function getStudentPerformance() {
  if (USE_MOCK) {
    const me = getCurrentUser();
    const myCourseIds = mockCourses
      .filter((c) => me && c.instructorId === me.id)
      .map((c) => c.id);

    return mockStudentProgress
      .filter((s) => myCourseIds.includes(s.courseId))
      .map((s) => {
        const course = mockCourses.find((c) => c.id === s.courseId);
        return { ...s, courseTitle: course.title };
      });
  }

  const res = await fetch(BASE_URL + "/instructor/students", { headers: authHeaders() });
  if (!res.ok) {
    throw new Error("Could not load student performance");
  }
  return res.json();
}

const mockEnrollmentTrend = [
  { month: "May", enrollments: 4 },
  { month: "Jun", enrollments: 7 },
  { month: "Jul", enrollments: 9 },
  { month: "Aug", enrollments: 12 },
  { month: "Sep", enrollments: 15 },
  { month: "Oct", enrollments: 18 }
];

async function getEnrollmentStats() {
  if (USE_MOCK) {
    const me = getCurrentUser();
    const myCourses = mockCourses.filter((c) => me && c.instructorId === me.id);

    const courses = myCourses.map((c) => {
      const students = mockStudentProgress.filter((s) => s.courseId === c.id);
      const totalProgress = students.reduce((sum, s) => sum + s.progress, 0);
      return {
        title: c.title,
        enrolled: students.length,
        averageProgress: students.length ? Math.round(totalProgress / students.length) : 0,
        atRisk: students.filter((s) => s.progress < 50).length
      };
    });

    return { courses, monthly: mockEnrollmentTrend.map((m) => ({ ...m })) };
  }

  const res = await fetch(BASE_URL + "/instructor/enrollment-stats", { headers: authHeaders() });
  if (!res.ok) {
    throw new Error("Could not load enrollment stats");
  }
  return res.json();
}

const mockStudentEnrollments = [
  { id: 1, studentId: 3, courseId: 1 }
];

async function getCourseCatalog() {
  if (USE_MOCK) {
    const me = getCurrentUser();
    return mockCourses.map((c) => {
      const instructor = mockUsers.find((u) => u.id === c.instructorId);
      return {
        ...c,
        instructorName: instructor ? instructor.name : "Unassigned",
        enrolled: mockStudentEnrollments.some(
          (e) => me && e.studentId === me.id && e.courseId === c.id
        )
      };
    });
  }

  const res = await fetch(BASE_URL + "/student/courses", { headers: authHeaders() });
  if (!res.ok) {
    throw new Error("Could not load courses");
  }
  return res.json();
}

async function enrollInCourse(courseId) {
  if (USE_MOCK) {
    const me = getCurrentUser();
    if (!me) {
      throw new Error("Please login again");
    }
    const course = mockCourses.find((c) => c.id === courseId);
    if (!course) {
      throw new Error("Course not found");
    }
    const already = mockStudentEnrollments.some(
      (e) => e.studentId === me.id && e.courseId === courseId
    );
    if (already) {
      throw new Error("You are already enrolled in this course");
    }
    mockStudentEnrollments.push({ id: Date.now(), studentId: me.id, courseId: courseId });
    logActivity("Enrolled in " + course.title);
    return { message: "Enrolled successfully in " + course.title };
  }

  const res = await fetch(BASE_URL + "/student/enrollments", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ courseId })
  });
  if (!res.ok) {
    throw new Error("Could not enroll in course");
  }
  return { message: "Enrolled successfully" };
}

const mockMaterials = [
  {
    id: 1,
    courseId: 1,
    title: "Introduction to Java",
    type: "Notes",
    fileName: "java-introduction.txt",
    content: "Java is a class-based, object-oriented language. Programs are compiled to bytecode and run on the Java Virtual Machine (JVM)."
  },
  {
    id: 2,
    courseId: 1,
    title: "OOP Concepts Guide",
    type: "PDF",
    fileName: "oop-concepts.txt",
    content: "The four pillars of OOP: Encapsulation, Abstraction, Inheritance and Polymorphism."
  },
  {
    id: 3,
    courseId: 1,
    title: "Collections Cheat Sheet",
    type: "Notes",
    fileName: "java-collections.txt",
    content: "List keeps order, Set keeps unique values, Map stores key-value pairs."
  },
  {
    id: 4,
    courseId: 2,
    title: "HTML and CSS Basics",
    type: "Notes",
    fileName: "html-css-basics.txt",
    content: "HTML gives a page its structure. CSS controls colors, spacing and layout."
  },
  {
    id: 5,
    courseId: 2,
    title: "JavaScript DOM Guide",
    type: "PDF",
    fileName: "javascript-dom.txt",
    content: "The DOM lets JavaScript read and change the elements of a web page."
  }
];

async function getMyMaterials() {
  if (USE_MOCK) {
    const me = getCurrentUser();
    const myCourseIds = mockStudentEnrollments
      .filter((e) => me && e.studentId === me.id)
      .map((e) => e.courseId);

    return mockMaterials
      .filter((m) => myCourseIds.includes(m.courseId))
      .map((m) => {
        const course = mockCourses.find((c) => c.id === m.courseId);
        return { ...m, courseTitle: course ? course.title : "Unknown course" };
      });
  }

  const res = await fetch(BASE_URL + "/student/materials", { headers: authHeaders() });
  if (!res.ok) {
    throw new Error("Could not load materials");
  }
  return res.json();
}

async function downloadMaterial(material) {
  let blob;

  if (USE_MOCK) {
    blob = new Blob([material.title + "\n\n" + material.content], { type: "text/plain" });
  } else {
    const res = await fetch(BASE_URL + "/student/materials/" + material.id + "/download", {
      headers: authHeaders()
    });
    if (!res.ok) {
      throw new Error("Could not download material");
    }
    blob = await res.blob();
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = material.fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

mockAssignments.push(
  { id: 3, courseId: 1, title: "Java Collections Practice", description: "Write a program that uses List, Set and Map.", maxMarks: 50 },
  { id: 4, courseId: 2, title: "JavaScript DOM Task", description: "Build a to-do list that changes the page using the DOM.", maxMarks: 50 }
);

async function getMyAssignments() {
  if (USE_MOCK) {
    const me = getCurrentUser();
    const myCourseIds = mockStudentEnrollments
      .filter((e) => me && e.studentId === me.id)
      .map((e) => e.courseId);

    return mockAssignments
      .filter((a) => myCourseIds.includes(a.courseId))
      .map((a) => {
        const course = mockCourses.find((c) => c.id === a.courseId);
        const submission = mockSubmissions.find(
          (s) => s.assignmentId === a.id && me && s.studentId === me.id
        );
        return {
          ...a,
          courseTitle: course ? course.title : "Unknown course",
          submission: submission ? { ...submission } : null
        };
      });
  }

  const res = await fetch(BASE_URL + "/student/assignments", { headers: authHeaders() });
  if (!res.ok) {
    throw new Error("Could not load assignments");
  }
  return res.json();
}

async function submitAssignment(assignmentId, fileName, notes) {
  if (USE_MOCK) {
    const me = getCurrentUser();
    if (!me) {
      throw new Error("Please login again");
    }
    const assignment = mockAssignments.find((a) => a.id === assignmentId);
    if (!assignment) {
      throw new Error("Assignment not found");
    }
    const enrolled = mockStudentEnrollments.some(
      (e) => e.studentId === me.id && e.courseId === assignment.courseId
    );
    if (!enrolled) {
      throw new Error("You are not enrolled in this course");
    }
    const already = mockSubmissions.some(
      (s) => s.assignmentId === assignmentId && s.studentId === me.id
    );
    if (already) {
      throw new Error("You have already submitted this assignment");
    }

    mockSubmissions.push({
      id: Date.now(),
      assignmentId: assignmentId,
      studentId: me.id,
      studentName: me.name,
      content: fileName || "Text answer",
      notes: notes,
      submittedAt: new Date().toISOString(),
      grade: null,
      feedback: ""
    });
    logActivity("Submitted assignment " + assignment.title);
    return { message: "Assignment submitted successfully" };
  }

  const res = await fetch(BASE_URL + "/student/submissions", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ assignmentId, fileName, notes })
  });
  if (!res.ok) {
    throw new Error("Could not submit assignment");
  }
  return { message: "Assignment submitted successfully" };
}

async function getMyProgress() {
  if (USE_MOCK) {
    const me = getCurrentUser();
    const myCourseIds = mockStudentEnrollments
      .filter((e) => me && e.studentId === me.id)
      .map((e) => e.courseId);

    return mockCourses
      .filter((c) => myCourseIds.includes(c.id))
      .map((c) => {
        const assignments = mockAssignments.filter((a) => a.courseId === c.id);

        const mySubmissions = assignments
          .map((a) => ({
            assignment: a,
            submission: mockSubmissions.find(
              (s) => s.assignmentId === a.id && me && s.studentId === me.id
            )
          }))
          .filter((item) => item.submission);

        const gradedPercents = mySubmissions
          .filter((item) => item.submission.grade !== null)
          .map((item) => (item.submission.grade / item.assignment.maxMarks) * 100);

        const done = mySubmissions.length;
        const total = assignments.length;

        return {
          courseId: c.id,
          title: c.title,
          assignmentsDone: done,
          assignmentsTotal: total,
          progress: total ? Math.round((done / total) * 100) : 0,
          averageGrade: gradedPercents.length
            ? Math.round(gradedPercents.reduce((sum, p) => sum + p, 0) / gradedPercents.length)
            : null
        };
      });
  }

  const res = await fetch(BASE_URL + "/student/progress", { headers: authHeaders() });
  if (!res.ok) {
    throw new Error("Could not load progress");
  }
  return res.json();
}

mockAssignments.push(
  { id: 5, courseId: 1, title: "Java Basics Quiz", description: "Short quiz on Java syntax and data types.", maxMarks: 20 }
);

mockSubmissions.push(
  {
    id: 5,
    assignmentId: 5,
    studentId: 3,
    studentName: "Student",
    content: "java-basics-answers.txt",
    submittedAt: new Date(Date.now() - 96 * 3600000).toISOString(),
    grade: 17,
    feedback: "Great work on data types. Revise switch statements."
  }
);

async function getMyGrades() {
  if (USE_MOCK) {
    const me = getCurrentUser();
    return mockSubmissions
      .filter((s) => me && s.studentId === me.id)
      .map((s) => {
        const assignment = mockAssignments.find((a) => a.id === s.assignmentId);
        if (!assignment) {
          return null;
        }
        const course = mockCourses.find((c) => c.id === assignment.courseId);
        return {
          ...s,
          assignmentTitle: assignment.title,
          courseTitle: course ? course.title : "Unknown course",
          maxMarks: assignment.maxMarks
        };
      })
      .filter((s) => s !== null);
  }

  const res = await fetch(BASE_URL + "/student/grades", { headers: authHeaders() });
  if (!res.ok) {
    throw new Error("Could not load grades");
  }
  return res.json();
}

async function getOverviewStats() {
  if (USE_MOCK) {
    return {
      totalUsers: mockUsers.length,
      totalCourses: mockCourses.length,
      totalEnrollments: mockStudentEnrollments.length,
      totalInstructors: mockUsers.filter((u) => u.role === "INSTRUCTOR").length
    };
  }

  const res = await fetch(BASE_URL + "/admin/overview", { headers: authHeaders() });
  if (!res.ok) {
    throw new Error("Could not load overview");
  }
  return res.json();
}