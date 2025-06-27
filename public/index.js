document.addEventListener('DOMContentLoaded', () => {
    const openAddTaskButton = document.getElementById('open-add-task-modal');
    const taskModal = document.getElementById('task-modal');
    const closeButton = taskModal.querySelector('.close-button');
    const cancelButton = taskModal.querySelector('#cancel-task-button');
    const taskForm = document.getElementById('task-form');
    const modalTitle = document.getElementById('modal-title');
    const taskIdInput = document.getElementById('task-id');
    const taskTextInput = document.getElementById('task-text-input');
    const taskHoursInput = document.getElementById('task-hours-input');
    const taskDateInput = document.getElementById('task-date-input');
    const taskTimeInput = document.getElementById('task-time-input');

    const taskList = document.querySelector('#task-list');
    const calendarEl = document.getElementById('calendar'); // Get the calendar element

    const API_URL = 'https://phase-1-final-project-4q4b.onrender.com/tasks'; //json-server endpoint

    let calendar; 

    // --- Modal Functions ---
    function openModal(task = null) {
        taskModal.style.display = 'block'; 
        taskForm.reset();
        taskIdInput.value = '';

        if (task) {
            // Populate form for editing
            modalTitle.textContent = 'Edit Task';
            taskIdInput.value = task.id;
            taskTextInput.value = task.text;
            taskHoursInput.value = task.hours || '';
            taskDateInput.value = task.dueDate || '';
            taskTimeInput.value = task.time || '';
        } else {
            modalTitle.textContent = 'Add New Task';
        }
    }

    function closeModal() {
        taskModal.style.display = 'none'; 
    }

    // --- Task Rendering and Manipulation ---
    function renderTask(task) {
        const li = document.createElement('li');
        li.dataset.id = task.id;
        li.classList.add(
            'task-item',
            'p-4',
            'mb-2',
            'rounded',
            'flex',
            'justify-between',
            'items-center',
            task.completed ? 'bg-green-100' : 'bg-gray-100'
        );

        // --- Mouseover and Mouseleave Event Listeners for visual feedback ---
        li.addEventListener('mouseover', function() {
            li.style.backgroundColor = task.completed ? '#c6f6d5' : '#e2e8f0'; 
            li.style.transform = 'scale(1.01)'; 
            li.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)'; 
            li.style.transition = 'all 0.2s ease-in-out';
        });

        li.addEventListener('mouseleave', function() {
            li.style.backgroundColor = task.completed ? '#d1fae5' : '#f3f4f6'; 
            li.style.transform = 'scale(1)';
            li.style.boxShadow = 'none'; 
        });
       

        li.innerHTML = `
            <div class="flex items-center flex-grow">
                <input type="checkbox" data-action="toggle" class="mr-3 text-blue-600 form-checkbox h-5 w-5 cursor-pointer" ${task.completed ? 'checked' : ''}>
                <span class="text-lg ${task.completed ? 'line-through text-gray-500' : ''}">${task.text}</span>
                <span class="ml-4 text-sm text-gray-600">${task.hours ? `(${task.hours} hrs)` : ''}</span>
            </div>
            <div class="flex items-center space-x-2">
                <span class="text-sm text-gray-500">${task.dueDate || ''}</span>
                <span class="text-sm text-gray-500">${task.time || ''}</span>
                <button class="edit-btn p-2 rounded-full hover:bg-blue-200" data-action="edit" aria-label="Edit task">
                    <i class="fas fa-edit text-blue-500"></i>
                </button>
                <button class="delete-btn p-2 rounded-full hover:bg-red-200" data-action="delete" aria-label="Delete task">
                    <i class="fas fa-trash-alt text-red-500"></i>
                </button>
            </div>
        `;
        taskList.appendChild(li);
    }

    async function loadTasks() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const tasks = await response.json();
            taskList.innerHTML = ''; 
            if (tasks.length === 0) {
                taskList.innerHTML = '<p class="text-gray-600 text-center mt-4">No tasks yet. Add one!</p>';
            } else {
                tasks.forEach(renderTask); 
            }
            return tasks; 
        } catch (error) {
            console.error('Error fetching tasks:', error);
            taskList.innerHTML = '<p class="text-red-500 text-center mt-4">Failed to load tasks. Please ensure json-server is running.</p>';
            return []; 
        }
    }

    async function saveTask(taskData) {
        const method = taskData.id ? 'PUT' : 'POST';
        const url = taskData.id ? `${API_URL}/${taskData.id}` : API_URL;

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(taskData)
            });

            if (!response.ok) {
                throw new Error(`Failed to save task: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error saving task:', error);
            alert('Failed to save task. See console for details.');
            return null;
        }
    }

    async function deleteTask(id) {
        if (!confirm('Are you sure you want to delete this task?')) {
            return;
        }
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                throw new Error(`Failed to delete task: ${response.statusText}`);
            }
            loadTasks(); 
            calendar.refetchEvents(); 
        } catch (error) {
            console.error('Error deleting task:', error);
            alert('Failed to delete task. See console for details.');
        }
    }

    async function toggleTaskCompletion(id, completed) {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'PATCH', 
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ completed: completed })
            });
            if (!response.ok) {
                throw new Error(`Failed to toggle task: ${response.statusText}`);
            }
            loadTasks(); 
            calendar.refetchEvents(); 
        } catch (error) {
            console.error('Error toggling task completion:', error);
            alert('Failed to update task. See console for details.');
        }
    }

    // --- Calendar Initialization ---
    async function initializeCalendar() {
        
        calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
            },
            
            events: async function(fetchInfo, successCallback, failureCallback) {
                try {
                    const response = await fetch(API_URL); 
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const tasks = await response.json();
                    const events = tasks.map(task => ({ 
                        id: task.id,
                        title: task.text,
                        start: task.dueDate + (task.time ? `T${task.time}` : ''), 
                        allDay: !task.time, 
                        color: task.completed ? '#d1fae5' : '#3B82F6', 
                        textColor: task.completed ? '#10B981' : '#FFFFFF'
                    }));
                    successCallback(events); 
                } catch (error) {
                    console.error('Error fetching tasks for calendar:', error);
                    failureCallback(error); 
                }
            },
            eventClick: async function(info) {
                
                const taskId = info.event.id;
                try {
                    const response = await fetch(`${API_URL}/${taskId}`);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const taskToEdit = await response.json();
                    openModal(taskToEdit); // Open modal with task data
                } catch (error) {
                    console.error('Error fetching task for calendar event edit:', error);
                    alert('Failed to load task details for editing.');
                }
            },
            dateClick: function(info) {
                
                const clickedDate = info.dateStr;
                openModal(); 
                taskDateInput.value = clickedDate; 
                taskTextInput.focus();
            }
        });
        calendar.render(); 
        loadTasks(); 
    }

   
    openAddTaskButton.addEventListener('click', () => openModal());
    closeButton.addEventListener('click', closeModal);
    cancelButton.addEventListener('click', closeModal);

   
    window.addEventListener('click', (event) => {
        if (event.target === taskModal) {
            closeModal();
        }
    });

    // --- Event Listener for Task Form Submission ---
    taskForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = taskIdInput.value;
        const text = taskTextInput.value;
        const hours = taskHoursInput.value;
        const dueDate = taskDateInput.value;
        const time = taskTimeInput.value;

        const taskData = { text, hours, dueDate, time };
        if (id) {
            taskData.id = id;
        }

        const savedTask = await saveTask(taskData);
        if (savedTask) {
            closeModal();
            loadTasks();
            calendar.refetchEvents(); 
        }
    });

    // --- Event Listener for Task List Actions (Delete, Edit, Toggle) ---
    taskList.addEventListener('click', async (e) => {
        const target = e.target;
        const li = target.closest('li.task-item');
        if (!li) return;

        const taskId = li.dataset.id;
        const action = target.dataset.action || target.closest('button')?.dataset.action;

        if (action === 'delete') {
            await deleteTask(taskId);
        } else if (action === 'edit') {
            try {
                const response = await fetch(`${API_URL}/${taskId}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const taskToEdit = await response.json();
                openModal(taskToEdit);
            } catch (error) {
                console.error('Error fetching task for edit:', error);
                alert('Failed to load task details for editing.');
            }
        } else if (action === 'toggle') {
            const currentCheckbox = target;
            const newCompletedStatus = currentCheckbox.checked;
            await toggleTaskCompletion(taskId, newCompletedStatus);
        }
    });

    
    initializeCalendar();
});