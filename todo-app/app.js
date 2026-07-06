const STORAGE_KEY = "todo-app-items";

const todoForm = document.getElementById("todoForm");
const todoInput = document.getElementById("todoInput");
const todoList = document.getElementById("todoList");
const todoCount = document.getElementById("todoCount");
const emptyState = document.getElementById("emptyState");
const clearCompletedBtn = document.getElementById("clearCompleted");
const filterBtns = document.querySelectorAll(".filter-btn");

let todos = loadTodos();
let currentFilter = "all";

function loadTodos() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function getFilteredTodos() {
  switch (currentFilter) {
    case "active":
      return todos.filter((t) => !t.completed);
    case "completed":
      return todos.filter((t) => t.completed);
    default:
      return todos;
  }
}

function updateCount() {
  const activeCount = todos.filter((t) => !t.completed).length;
  const total = todos.length;

  if (total === 0) {
    todoCount.textContent = "0 项任务";
  } else {
    todoCount.textContent = `${activeCount} 项待完成 / 共 ${total} 项`;
  }

  const hasCompleted = todos.some((t) => t.completed);
  clearCompletedBtn.hidden = !hasCompleted;
}

function render() {
  const filtered = getFilteredTodos();
  todoList.innerHTML = "";

  filtered.forEach((todo) => {
    const li = document.createElement("li");
    li.className = "todo-item" + (todo.completed ? " completed" : "");
    li.dataset.id = todo.id;

    li.innerHTML = `
      <input type="checkbox" class="todo-checkbox" ${todo.completed ? "checked" : ""} aria-label="标记完成">
      <span class="todo-text">${escapeHtml(todo.text)}</span>
      <button type="button" class="btn-delete" aria-label="删除任务">&times;</button>
    `;

    const checkbox = li.querySelector(".todo-checkbox");
    checkbox.addEventListener("change", () => toggleTodo(todo.id));

    li.querySelector(".btn-delete").addEventListener("click", () => deleteTodo(todo.id));

    todoList.appendChild(li);
  });

  const showEmpty = todos.length === 0 || (filtered.length === 0 && todos.length > 0);
  emptyState.hidden = !showEmpty;

  if (todos.length === 0) {
    emptyState.textContent = "暂无任务，添加一条开始吧";
  } else if (filtered.length === 0) {
    emptyState.textContent =
      currentFilter === "active"
        ? "没有进行中的任务"
        : "没有已完成的任务";
  }

  updateCount();
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function addTodo(text) {
  const trimmed = text.trim();
  if (!trimmed) return;

  todos.unshift({
    id: generateId(),
    text: trimmed,
    completed: false,
  });

  saveTodos();
  render();
}

function toggleTodo(id) {
  const todo = todos.find((t) => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
    saveTodos();
    render();
  }
}

function deleteTodo(id) {
  todos = todos.filter((t) => t.id !== id);
  saveTodos();
  render();
}

function clearCompleted() {
  todos = todos.filter((t) => !t.completed);
  saveTodos();
  render();
}

function setFilter(filter) {
  currentFilter = filter;
  filterBtns.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.filter === filter);
  });
  render();
}

todoForm.addEventListener("submit", (e) => {
  e.preventDefault();
  addTodo(todoInput.value);
  todoInput.value = "";
  todoInput.focus();
});

filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => setFilter(btn.dataset.filter));
});

clearCompletedBtn.addEventListener("click", clearCompleted);

render();
