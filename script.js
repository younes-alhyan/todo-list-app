document.addEventListener('DOMContentLoaded', () => {
  const todoInput = document.getElementById('todo-input');
  const todoInputCheckbox = document.getElementById('todo-input-checkbox');
  const todosContainer = document.getElementById('todos');
  let todos = [];
  let IDs = 0;

  const itemsText = document.getElementById('items');
  const clearButton = document.getElementById('clear');
  const AllButtons = document.querySelectorAll('#All');
  const ActiveButtons = document.querySelectorAll('#Active');
  const CompletedButtons = document.querySelectorAll('#Completed');
  let Active = AllButtons;

  // Event listeners
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      handleAddingTodo();
      Active.forEach(btn => {
        btn.click();
      });
    }
  });

  clearButton.addEventListener('click', () => {
    todos = todos.filter(todo => !todo.state);
    refreshTodosDisplay();
    itemsLeft();
  });
  AllButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      handleDisplayOptions(AllButtons);
      DisplayAll();
    });
  });
  ActiveButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      handleDisplayOptions(ActiveButtons);
      DisplayActive();
    });
  });
  CompletedButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      handleDisplayOptions(CompletedButtons);
      DisplayCompleted();
    });
  });
  // Handlers
  function handleAddingTodo() {
    const todoText = todoInput.value.trim();
    if (!todoText) {
      return;
    }
    const todoState = todoInputCheckbox.checked;
    addTodo(todoText, todoState);
    todoInput.value = ''; // Clear input after adding todo
  }

  function handleDisplayOptions(buttons) {
    Active.forEach(btn => {
      btn.classList.remove('active');
    });
    Active = buttons;
    Active.forEach(btn => {
      btn.classList.add('active');
    });
  }

  // Functions
  function addTodo(text, state) {
    const todoId = IDs++;
    const todo = {
      todoId,
      text,
      state
    };
    todos.push(todo);
    localStorage.setItem('todos', JSON.stringify(todos)); // Store todos after adding
    renderTodo(todo);
    itemsLeft();
  }

  function renderTodo(todo) {
    const todoElement = document.createElement('div');
    todoElement.className = 'todo';
    todoElement.id = `todo-${todo.todoId}`;
    todoElement.innerHTML = `
      <input type="checkbox" id="todo${todo.todoId}-checkbox" ${todo.state ? 'checked' : ''} onclick="ChangeState(${todo.todoId})" />
      <label for="todo${todo.todoId}-checkbox" class="costum-checkbox">
        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="9">
          <path fill="none" stroke="#FFF" stroke-width="2" d="M1 4.304L3.696 7l6-6" />
        </svg>
      </label>
      <p class="todo-label ${todo.state ? 'completed' : ''}" id="todo${todo.todoId}-label">${todo.text}</p>
      <button class="cross" onclick="DeleteTodo(${todo.todoId})">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18">
          <path fill="#494C6B" fill-rule="evenodd" d="M16.97 0l.708.707L9.546 8.84l8.132 8.132-.707.707-8.132-8.132-8.132 8.132L0 16.97l8.132-8.132L0 .707.707 0 8.84 8.132 16.971 0z" />
        </svg>
      </button>
    `;
    todoElement.draggable = true;
    todosContainer.appendChild(todoElement);
  }

  function refreshTodosDisplay() {
    todosContainer.innerHTML = '';
    todos.forEach(todo => renderTodo(todo));
    Active.forEach(btn => {
      btn.click();
    })
  }

  function itemsLeft() {
    let itemsleft = todos.filter(todo => !todo.state).length;
    itemsText.textContent = `${itemsleft} item${itemsleft !== 1 ? 's' : ''} left`;
  }

  function DisplayAll() {
    todos.forEach(todo => {
      const todoElement = document.getElementById(`todo-${todo.todoId}`);
      todoElement.style.display = 'flex';
    });
  }

  function DisplayActive() {
    todos.forEach(todo => {
      const todoElement = document.getElementById(`todo-${todo.todoId}`);
      todoElement.style.display = todo.state ? 'none' : 'flex';
    });
  }

  function DisplayCompleted() {
    todos.forEach(todo => {
      const todoElement = document.getElementById(`todo-${todo.todoId}`);
      todoElement.style.display = todo.state ? 'flex' : 'none';
    });
  }

  window.ChangeState = function (todoId) {
    const todoIndex = todos.findIndex(todo => todo.todoId === todoId);
    todos[todoIndex].state = !todos[todoIndex].state;
    localStorage.setItem('todos', JSON.stringify(todos));
    refreshTodosDisplay();
    itemsLeft();
    Active.forEach(btn => {
      btn.click();
    });
  };

  window.DeleteTodo = function (todoId) {
    todos = todos.filter(todo => todo.todoId !== todoId);
    localStorage.setItem('todos', JSON.stringify(todos));
    refreshTodosDisplay();
    itemsLeft();
  };

  // Load todos from localStorage on page load
  const storedTodos = JSON.parse(localStorage.getItem('todos')) || [];
  storedTodos.forEach(todo => addTodo(todo.text, todo.state));
  itemsLeft();
  let draggingTodo = null;

  // Add event listeners for drag and drop
  todosContainer.addEventListener('dragstart', (event) => {
    if (event.target.classList.contains('todo')) {
      draggingTodo = event.target;
      event.target.classList.add('dragging');
    }
  });

  todosContainer.addEventListener('dragend', (event) => {
    if (draggingTodo) {
      event.target.classList.remove('dragging');
      draggingTodo = null;
      updateTodosArray();
    }
  });

  todosContainer.addEventListener('dragover', (event) => {
    event.preventDefault();
    const afterElement = getDragAfterElement(todosContainer, event.clientY);
    const dragging = document.querySelector('.dragging');
    if (afterElement == null) {
      todosContainer.appendChild(dragging);
    } else {
      todosContainer.insertBefore(dragging, afterElement);
    }
  });
  function updateTodosArray() {
    const todosElements = document.querySelectorAll('.todo');
    todosElements.forEach((todoElement, i) => {
      const todoIdStr = todoElement.id.split('-').pop(); // Extract ID as string
      const todoId = Number(todoIdStr); // Convert to number

      // Find the index in the todos array
      const index = todos.findIndex(todo => todo.todoId === todoId);

      if (i != index) {
        let temp = todos[i];
        todos[i] = todos[index];
        todos[index] = temp;
      }
    });
  }



  function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.todo:not(.dragging)')];
    return draggableElements.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      },
      { offset: Number.NEGATIVE_INFINITY }
    ).element;
  }
});

