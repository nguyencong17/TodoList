// create element
const createElementLi = (todo, params) => {
    // check params
    if(!todo) return;

    // find template and element 
    const templateElement = document.querySelector("#todo-template");
    if(!templateElement) return null;

    //clone template
    const liCloneElement = templateElement.content.firstElementChild.cloneNode(true);

    // update id & status
    liCloneElement.dataset.id = todo.id;
    liCloneElement.dataset.status = todo.status;

    // update title
    const title = liCloneElement.querySelector(".title");
    if(!title) return null;

    // update status 
    const divElement = liCloneElement.querySelector('div.alert');
    if(!divElement) return null;
    const alertClass = liCloneElement.dataset.status === 'pending' ? 'alert-secondary' : 'alert-success';
    divElement.classList.add(alertClass);

    // update content
    title.textContent = todo.todo;

    // // Check isShow or notShow
    // liCloneElement.hidden = !isMatch(liCloneElement, params);

    // Attack Elent (Events)
    const btnStatus = liCloneElement.querySelector('.btn-status');
    const btnRemove = liCloneElement.querySelector('.btn-remove');
    const btnEdit = liCloneElement.querySelector('.btn-edit');

    // First Load 
    btnStatus.classList.add(liCloneElement.dataset.status === 'pending' ? 'btn-dark' : 'btn-success');
    btnStatus.textContent = liCloneElement.dataset.status === 'pending' ? 'Finish' : 'Reset';

    btnStatus.addEventListener('click', () => {
      const currentStatus = liCloneElement.dataset.status;
      const newStatus =  currentStatus === 'pending' ? 'completed' : 'pending';

      // get current todo list
      // update status of current todo
      // save to local storage
      const todoList = getTodoList();
      const index = todoList.findIndex(x => x.id === todo.id);
      if(index >= 0) {
        todoList[index].status = newStatus;
        localStorage.setItem('todo_list', JSON.stringify(todoList));
      }

      // update status when click finish
      liCloneElement.dataset.status = newStatus;

      // Color Div
      divElement.classList.remove('alert-success', 'alert-secondary');
      const newAlertClass = currentStatus === 'pending' ? 'alert-success' : 'alert-secondary';
      divElement.classList.add(newAlertClass);


      // Color btn
      btnStatus.classList.remove('btn-dark', 'btn-success');
      btnStatus.classList.add(currentStatus === 'pending' ? 'btn-success' : 'btn-dark');

      // Content Btn 
      const newContent = currentStatus === 'pending' ? 'Reset' : 'Finish';
      btnStatus.textContent = newContent;

    });

    btnRemove.addEventListener('click', () => {
      const todoList = getTodoList();
      const newTodoList = todoList.filter(x => x.id != todo.id );
      localStorage.setItem('todo_list', JSON.stringify(newTodoList));
      liCloneElement.remove();
    });

    btnEdit.addEventListener('click', () => {
      // get Latest TodoList
      const todoList = getTodoList();
      const latest = todoList.find(x => x.id === todo.id );
      if(!latest) return;
      populateTodoForm(latest);
    });

    return liCloneElement;
}

function populateTodoForm(todo) {
  // query form
  // set dataset
  const formId = document.getElementById('form-id');
  if(!formId) return;
  formId.dataset.id = todo.id;

  // update content for input
  const inputText = document.getElementById('todo-input');
  if(inputText) inputText.value = todo.todo; 
}

// render todoList
const renderTodoList = (todoList, ulElementId, params) => {
    if (!Array.isArray(todoList) || todoList.length == 0) return;

    // query element id tag ul
    const ulElement = document.getElementById(ulElementId);
    // check exist
    if(!ulElement) return;
    //todo something
    for(const todo of todoList) {
        const liElement = createElementLi(todo, params);
        ulElement.appendChild(liElement);
    }

}

function getTodoList() {
  try {
    return JSON.parse(localStorage.getItem('todo_list')) || [];
  } catch {
    return [];
  }
}

// Handle Submit Fomr
function handleSumbitForm(e) {
  e.preventDefault();
  const formElementId = document.getElementById('form-id');
  // fill todo form
  const inputTodo = document.getElementById('todo-input');
  if(!inputTodo) return;

  const isEdit = Boolean(formElementId.dataset.id);
  if(isEdit) {
    //edit mode

    // update content
    const todoList = getTodoList();
    const index =  todoList.findIndex(x => x.id.toString() === formElementId.dataset.id );
    if(index < 0) return;
    todoList[index].todo = inputTodo.value;

    // save to localStorage
    localStorage.setItem('todo_list', JSON.stringify(todoList));
    
    // apply change to dom
    const liElementChange = document.querySelector(`ul#todoList > li[data-id="${formElementId.dataset.id}"]`);
    if (liElementChange) {
      const title = liElementChange.querySelector('.title');
      if(title) {
        title.textContent = inputTodo.value;
      }
    }

  } else {
    // add mode
    const  newTodo = {
      id: Date.now(),
      todo: inputTodo.value,
      status: 'pending'
    }

    // submit
    // save to localStorage
    const todoList = getTodoList();
    todoList.push(newTodo);
    localStorage.setItem('todo_list', JSON.stringify(todoList));

    // append new li to DOM
    const ulElement = document.getElementById('todoList');
    if(!ulElement) return;
    ulElement.appendChild(createElementLi(newTodo));
    }

  // reset todo form 
  delete formElementId.dataset.id;
  if(formElementId) formElementId.reset();
  
}

// Handle Filter 
function initSearchInput(params) {
  // find input 
  const searchInput = document.getElementById('search-input');
  if(!searchInput) return;

  if(params.get('searchTerm')) {
    searchInput.value = params.get('searchTerm');
  }

  searchInput.addEventListener('input', () => {
    // searchTodo(searchInput.value);
    handleFilterChangefilterName('searchTerm', searchInput.value);
  });
};

function initFilterStatus(params) {
  // find select
  const filterStatusSelect = document.getElementById('filterStatus');
  if(!filterStatusSelect) return;

  if(params.get('status')) {
    filterStatusSelect.value = params.get('status');
  }
  
  // attach event 
  filterStatusSelect.addEventListener('change', () => {
    // filterTodo(filterStatusSelect.value);
    handleFilterChangefilterName('status', filterStatusSelect.value);
  })
};

function isMatchSearch(todoElement, searchTerm) {
  if(!todoElement) return;
  if(searchTerm.length >= 0) {
    const titleElement = todoElement.querySelector('.title');
    return titleElement.textContent.toLowerCase().includes(searchTerm.toLowerCase());
  }
}

function isMatchStatus(todoElement, filterStatus) {
  return filterStatus === 'all' || todoElement.dataset.status === filterStatus;
}

function isMatch(todoElement, params) {
  return (
    isMatchSearch(todoElement, params.get('searchTerm')) && 
    isMatchStatus(todoElement, params.get('status'))
  );
}

function handleFilterChangefilterName(filterName, filterValue) {

  // update query params
  const url = new URL(window.location);
  url.searchParams.set(filterName, filterValue);

  history.pushState({}, '', url);

    // get list todo
    const listTodoElement = document.querySelectorAll('#todoList > li');
    for(const todoElement of listTodoElement) {
      const needShow = isMatch(todoElement, url.searchParams);
      todoElement.hidden = !needShow;
    }

}

// main
(() => {

    // Fake data
    // const todoList = [
    //     {id: 1, todo: "LearnJS", status: "pending"},
    //     {id: 2, todo: "Learn ReactJS", status: "completed"},
    //     {id: 3, todo: "Angular JS", status: "pending"}
    // ];
    //  localStorage.setItem('todo_list', JSON.stringify(todoList));

    // data from localStorage
    const todoList = getTodoList();

    // First Load
    const params = new URLSearchParams(window.location.search);

    // render
    renderTodoList(todoList, 'todoList', params);

    // add todo
    const formElementId = document.getElementById('form-id');
    if(formElementId) {
      formElementId.addEventListener('submit', handleSumbitForm);
    }

    // search
    initSearchInput(params);

    // filter
    initFilterStatus(params);
})()