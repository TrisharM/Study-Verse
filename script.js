// Global variables

const studyTips = [
  "Break study time into focused 25-minute sprints (Pomodoro Technique).",
  "Teach what you've learned to someone else to reinforce your understanding.",
  "Create mind maps to visualize complex topics and their relationships.",
  "Use spaced repetition software like Anki for long-term retention.",
  "Study in different locations to create multiple memory associations.",
  "Prioritize sleep - it's when your brain consolidates what you've learned.",
  "Practice active recall by testing yourself instead of just re-reading.",
  "Connect new information to what you already know for better retention.",
  "Take regular breaks to maintain focus and prevent burnout.",
  "Summarize key points in your own words after each study session."
];

// Utility functions
function getTodayDate() {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const yyyy = today.getFullYear();
  return `${yyyy}-${mm}-${dd}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yy = date.getFullYear().toString().slice(2);
  return `${dd}-${mm}-${yy}`;
}

// To-Do List Functions
let currentEditTask = null;

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('add-todo-btn').addEventListener('click', addTodo);
});

function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

function formatDate(dateStr) {
  const [yy, mm, dd] = dateStr.split("-");
  return `${dd}-${mm}-${yy.slice(-2)}`;
}

function addTodo() {
  const taskText = document.getElementById('todo-input').value.trim();
  const date = document.getElementById('todo-date').value;
  const todoList = document.getElementById('todo-list');
  const noTaskMsg = document.getElementById('no-task');

  if (!taskText) return;
  if (date && date < getTodayDate()) {
    alert('You cannot add tasks with a date in the past.');
    return;
  }

  const formattedDate = date ? formatDate(date) : null;

  if (currentEditTask) {
    const taskTextDiv = currentEditTask.querySelector('.task-text');
    const taskDateDiv = currentEditTask.querySelector('.todo-date');

    taskTextDiv.innerText = taskText;

    if (formattedDate) {
      if (taskDateDiv) {
        taskDateDiv.innerText = formattedDate;
      } else {
        const newDateDiv = document.createElement('div');
        newDateDiv.className = 'todo-date';
        newDateDiv.innerText = formattedDate;
        taskTextDiv.parentElement.appendChild(newDateDiv);
      }
    } else if (taskDateDiv) {
      taskDateDiv.remove();
    }

    currentEditTask = null;
  } else {
    const li = document.createElement('li');
    li.className = 'list-group-item';

    li.innerHTML = `
      <div class="d-flex align-items-start w-100">
        <div class="flex-grow-1 task-clickable">
          <div class="task-text">${taskText}</div>
          ${formattedDate ? `<div class="todo-date">${formattedDate}</div>` : ''}
        </div>
        <i class="fas fa-edit text-primary ms-3" style="cursor:pointer" onclick="editTask(this)"></i>
        <i class="fas fa-trash text-danger ms-2" style="cursor:pointer" onclick="deleteTask(this)"></i>
      </div>
    `;

    li.querySelector('.task-clickable').addEventListener('click', function () {
      toggleTaskStatus(this);
    });

    todoList.appendChild(li);
  }

  noTaskMsg.style.display = 'none';
  sortTasks();
  document.getElementById('todo-input').value = '';
  document.getElementById('todo-date').value = '';
  bootstrap.Modal.getInstance(document.getElementById('todoModal')).hide();
}

function toggleTaskStatus(taskDiv) {
  taskDiv.classList.toggle('task-done');
}

function sortTasks() {
  const todoList = document.getElementById('todo-list');
  const items = Array.from(todoList.children);

  items.sort((a, b) => {
    const dateA = a.querySelector('.todo-date') ? new Date(a.querySelector('.todo-date').innerText.split('-').reverse().join('-')) : null;
    const dateB = b.querySelector('.todo-date') ? new Date(b.querySelector('.todo-date').innerText.split('-').reverse().join('-')) : null;
    if (!dateA) return -1;
    if (!dateB) return 1;
    return dateB - dateA;
  });

  items.forEach(item => todoList.appendChild(item));
}

function editTask(icon) {
  const item = icon.closest('li');
  const taskText = item.querySelector('.task-text').innerText;
  const taskDate = item.querySelector('.todo-date')?.innerText;

  document.getElementById('todo-input').value = taskText;
  if (taskDate) {
    const [dd, mm, yy] = taskDate.split('-');
    document.getElementById('todo-date').value = `20${yy}-${mm}-${dd}`;
  } else {
    document.getElementById('todo-date').value = '';
  }

  currentEditTask = item;
  const modal = new bootstrap.Modal(document.getElementById('todoModal'));
  modal.show();
}

function deleteTask(icon) {
  const item = icon.closest('li');
  item.remove();
  if (document.getElementById('todo-list').children.length === 0) {
    document.getElementById('no-task').style.display = 'block';
  }
}









// Study Planner Functions
let plannerTasks = JSON.parse(localStorage.getItem('plannerTasks')) || [];
let editingIndex = null;

document.getElementById('studyForm').addEventListener('submit', function (e) {
  e.preventDefault(); // Prevent form from refreshing the page

  const subject = document.getElementById('subject').value.trim();
  const startTime = document.getElementById('startTime').value;
  const endTime = document.getElementById('endTime').value;
  const date = document.getElementById('date').value;

  if (!subject || !startTime || !endTime || !date) {
    alert('Please fill in all fields.');
    return;
  }

  if (new Date(date) < new Date(new Date().toDateString())) {
    alert('You cannot set a task for a past date.');
    return;
  }

  const task = { subject, startTime, endTime, date };

  if (editingIndex !== null) {
    plannerTasks[editingIndex] = task;
    editingIndex = null;
    document.getElementById('plannerModalLabel').textContent = 'Add Study Task';
  } else {
    plannerTasks.push(task);
  }

  localStorage.setItem('plannerTasks', JSON.stringify(plannerTasks));
  renderPlannerTasks();
  document.getElementById('studyForm').reset();
  bootstrap.Modal.getInstance(document.getElementById('plannerModal')).hide();
});

function renderPlannerTasks() {
  const list = document.getElementById('planner-list');
  list.innerHTML = '';

  if (plannerTasks.length === 0) {
    list.innerHTML = '<div class="no-task-msg">No study tasks planned.</li>';
    return;
  }

  plannerTasks.sort((a, b) => new Date(`${a.date}T${a.startTime}`) - new Date(`${b.date}T${b.startTime}`));

  plannerTasks.forEach((task, index) => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-start';
    li.innerHTML = `
      <div>
        <strong>${task.subject}</strong><br>
        <small>${task.date} | ${task.startTime} - ${task.endTime}</small>
      </div>
      <div>
        <button class="btn btn-sm btn-outline-primary me-2" onclick="editPLTask(${index})">Edit</button>
        <button class="btn btn-sm btn-outline-danger" onclick="deletePLTask(${index})">Delete</button>
      </div>
    `;
    list.appendChild(li);
  });
}

function editPLTask(index) {
  const task = plannerTasks[index];
  document.getElementById('subject').value = task.subject;
  document.getElementById('startTime').value = task.startTime;
  document.getElementById('endTime').value = task.endTime;
  document.getElementById('date').value = task.date;
  editingIndex = index;

  document.getElementById('plannerModalLabel').textContent = 'Edit Study Task';
  const modal = new bootstrap.Modal(document.getElementById('plannerModal'));
  modal.show();
}

function deletePLTask(index) {
  if (confirm('Delete this task?')) {
    plannerTasks.splice(index, 1);
    localStorage.setItem('plannerTasks', JSON.stringify(plannerTasks));
    renderPlannerTasks();
  }
}

// Initial render
renderPlannerTasks();





// Goal Tracker Functions
function addGoal() {
  const goalText = document.getElementById('goal-input').value.trim();
  const goalDate = document.getElementById('goal-date').value;
  const goalList = document.getElementById('goal-list');
  const noGoalMsg = document.getElementById('no-goal-task');

  if (!goalText) return;

  const goal = { text: goalText, date: goalDate };
  goals.push(goal);
  localStorage.setItem('goals', JSON.stringify(goals));

  renderGoalList();
  
  document.getElementById('goal-input').value = '';
  document.getElementById('goal-date').value = '';
  bootstrap.Modal.getInstance(document.getElementById('goalModal')).hide();
}

function renderGoalList() {
  const goalList = document.getElementById('goal-list');
  const noGoalMsg = document.getElementById('no-goal-task');
  goalList.innerHTML = '';

  if (goals.length === 0) {
    noGoalMsg.style.display = 'block';
    return;
  }

  noGoalMsg.style.display = 'none';

  goals.forEach((goal, index) => {
    const div = document.createElement('div');
    div.className = 'goal-item';
    const display = goal.text + (goal.date ? ` (${formatDate(goal.date)})` : '');
    div.innerHTML = `
      <span>${display}</span>
      <span>
        <i class="fas fa-check text-success me-2" style="cursor:pointer" onclick="completeGoal(${index})"></i>
        <i class="fas fa-trash text-danger" style="cursor:pointer" onclick="deleteGoal(${index})"></i>
      </span>
    `;
    goalList.appendChild(div);
  });
}

function completeGoal(index) {
  goals.splice(index, 1);
  localStorage.setItem('goals', JSON.stringify(goals));
  renderGoalList();
}

function deleteGoal(index) {
  if (confirm('Are you sure you want to delete this goal?')) {
    goals.splice(index, 1);
    localStorage.setItem('goals', JSON.stringify(goals));
    renderGoalList();
  }
}






// Countdown Timer Functions
let countdownInterval;

document.getElementById('set-timer-btn').addEventListener('click', startCountdown);

function startCountdown() {
  const eventName = document.getElementById('event-name').value;
  const inputDate = document.getElementById('countdown-date').value;
  const inputTime = document.getElementById('countdown-time').value;
  const resultDiv = document.getElementById('countdown-result');

  if (!eventName || !inputDate || !inputTime) {
    resultDiv.innerText = 'Please fill out all fields.';
    return;
  }

  // Combine date and time into one Date object
  const targetDate = new Date(`${inputDate}T${inputTime}`);
  const now = new Date();
  const diff = targetDate - now;

  if (diff <= 0) {
    resultDiv.innerText = 'The selected date is today or already passed.';
    return;
  }

  // Clear any existing interval
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }

  // Update immediately
  updateCountdownDisplay(eventName, targetDate);

  // Update every second
  countdownInterval = setInterval(() => updateCountdownDisplay(eventName, targetDate), 1000);

  // Hide the modal
  bootstrap.Modal.getInstance(document.getElementById('timerModal')).hide();
}

function updateCountdownDisplay(eventName, targetDate) {
  const resultDiv = document.getElementById('countdown-result');
  const now = new Date();
  const diff = targetDate - now;

  if (diff <= 0) {
    resultDiv.innerText = `${eventName} has arrived!`;
    if (countdownInterval) {
      clearInterval(countdownInterval);
    }
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  resultDiv.innerHTML = `<div class="countdown-display"><strong>${days}</strong> day(s) remaining for <strong>${eventName}</strong><br>
                         <strong>${hours}</strong>:<strong>${minutes}</strong>:<strong>${seconds}</strong></div>`;
}


// GPA 
const gpaResult = document.getElementById("gpa-result");
const addGradeRowBtn = document.getElementById("add-grade-row");
const gradesContainer = document.getElementById("grades-container");
const calculateGpaBtn = document.getElementById("calculate-gpa");

// Grade to GPA mapping
const gradeScale = {
  "A+": 4.0, "A": 4.0, "A-": 3.7,
  "B+": 3.3, "B": 3.0, "B-": 2.7,
  "C+": 2.3, "C": 2.0, "C-": 1.7,
  "D+": 1.3, "D": 1.0, "F": 0.0
};

// Add more input rows
addGradeRowBtn.addEventListener("click", () => {
  const inputGroup = document.createElement("div");
  inputGroup.className = "input-group mb-2";
  inputGroup.innerHTML = `
    <input type="text" class="form-control subject-input" placeholder="Subject (e.g. Physics)">
    <input type="text" class="form-control grade-input" placeholder="Grade (A, B+, etc)">
  `;
  gradesContainer.appendChild(inputGroup);
});

// Calculate GPA
calculateGpaBtn.addEventListener("click", () => {
  const gradeInputs = document.querySelectorAll(".grade-input");
  let totalGpa = 0;
  let count = 0;

  gradeInputs.forEach(input => {
    const grade = input.value.trim().toUpperCase();
    if (gradeScale.hasOwnProperty(grade)) {
      totalGpa += gradeScale[grade];
      count++;
    }
  });

  if (count === 0) {
    gpaResult.textContent = "Please enter valid grades.";
  } else {
    const gpa = (totalGpa / count).toFixed(2);
    gpaResult.innerHTML = `<div class="countdown-display"><strong> 🎓 GPA: ${gpa}</strong></div>`;
  }

  // Reset inputs
  document.querySelectorAll('.subject-input').forEach(input => input.value = '');
  gradeInputs.forEach(input => input.value = '');
});







// Study Tip Generator

document.addEventListener('DOMContentLoaded', function () {  
    document.getElementById('new-tip-btn').addEventListener('click', generateNewTip);
  });
  
function generateNewTip() {
    const tipText = document.getElementById('tip-text');
    const randomIndex = Math.floor(Math.random() * studyTips.length);
    tipText.textContent = `"${studyTips[randomIndex]}"`;
  }
  

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
  // Initialize displays
  renderPlannerList();
  renderGoalList();
  
  // Set default date to today for planner
  document.getElementById('date').valueAsDate = new Date();
  
  // Add event listeners
  document.getElementById('save-planner-btn').addEventListener('click', savePlannerTask);
  document.getElementById('add-goal-btn').addEventListener('click', addGoal);
  document.getElementById('start-countdown-btn').addEventListener('click', startCountdown);
  document.getElementById('calculate-gpa-btn').addEventListener('click', calculateGPA);
  
  // Check for empty states
  if (document.getElementById('todo-list').children.length === 0) {
    document.getElementById('no-task').style.display = 'block';
  }
  if (plannerTasks.length === 0) {
    document.getElementById('no-planner-task').style.display = 'block';
  }
  if (goals.length === 0) {
    document.getElementById('no-goal-task').style.display = 'block';
  }
});






//Goal Tracker
  const goalInput = document.getElementById("goal-input");
  const saveGoalBtn = document.getElementById("save-goal-btn");
  const goalList = document.getElementById("goal-list");
  const noGoalMsg = document.getElementById("no-goal-task");

  let goals = JSON.parse(localStorage.getItem("weeklyGoals")) || [];

  function getTodayDateStr() {
    return new Date().toISOString().split("T")[0];
  }

  function getWeekDates() {
    const today = new Date();
    const day = today.getDay(); // 0 (Sun) - 6 (Sat)
    const monday = new Date(today);
    monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1)); // Monday as start
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(d.getDate() + i);
      return d.toISOString().split("T")[0];
    });
  }

  function renderGoals() {
    goalList.innerHTML = "";
    if (goals.length === 0) {
      noGoalMsg.style.display = "block";
      return;
    }
    noGoalMsg.style.display = "none";

    const weekDates = getWeekDates();

    goals.forEach((goal, goalIndex) => {
      const container = document.createElement("div");
      container.className = "mb-3";

      const completedDays = Object.values(goal.history).filter(Boolean).length;
      const startDate = new Date(goal.createdAt);
      const today = new Date();
      const weeksSinceStart = Math.ceil((today - startDate) / (1000 * 60 * 60 * 24 * 7));
      const totalTargetDays = weeksSinceStart * goal.daysPerWeek;

      container.innerHTML = `
        <strong>${goal.name}</strong><br/>
        <small>Streak: ${completedDays} / ${totalTargetDays} days</small>
        <div class="d-flex gap-2 mt-2 flex-wrap">
          ${weekDates.map(date => {
            const isChecked = goal.history[date];
            const label = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
            return `
              <span 
                class="day-link ${isChecked ? 'checked' : ''}" 
                data-goal-index="${goalIndex}" 
                data-date="${date}"
              >
                ${label}
              </span>
            `;
          }).join("")}
        </div>
      `;
      goalList.appendChild(container);
    });
  }

  // ✅ Event delegation to listen to all clicks on .day-link
  goalList.addEventListener("click", function (e) {
    if (e.target.classList.contains("day-link")) {
      const goalIndex = parseInt(e.target.dataset.goalIndex);
      const date = e.target.dataset.date;
      const goal = goals[goalIndex];

      if (goal) {
        goal.history[date] = !goal.history[date]; // Toggle the state
        localStorage.setItem("weeklyGoals", JSON.stringify(goals));
        renderGoals(); // Re-render to reflect changes
      }
    }
  });

  saveGoalBtn.addEventListener("click", () => {
    const name = goalInput.value.trim();
    const daysPerWeek = parseInt(document.getElementById("goal-days").value.trim());
    if (name && daysPerWeek >= 1 && daysPerWeek <= 7) {
      const newGoal = {
        name,
        daysPerWeek,
        history: {},
        createdAt: getTodayDateStr()
      };
      goals.push(newGoal);
      localStorage.setItem("weeklyGoals", JSON.stringify(goals));
      goalInput.value = "";
      document.getElementById("goal-days").value = "";
      renderGoals();
    }
  });

  renderGoals();


    // This script will load the username from sessionStorage and display it
    document.addEventListener('DOMContentLoaded', function() {
      const username = sessionStorage.getItem("loggedInUser");

      if (username) {
        // If there's a username in sessionStorage, show it in the greeting message
        document.getElementById("username-placeholder").textContent = username;
      } else {
        // If no username is found, set default text (Optional)
        document.getElementById("username-placeholder").textContent = "Student";
      }
    });

  document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logout-btn');

    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        // Clear session storage
        sessionStorage.clear();

        // Optional: Show alert or toast
        alert("You have been logged out.");

        // Redirect to login page (adjust filename if needed)
        window.location.href = "login.html";
      });
    }
  });


