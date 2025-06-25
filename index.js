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

    const API_URL = 'http://localhost:3000/tasks'; // Your json-server endpoint

    let calendar; // Declare calendar globally

    // --- Modal Functions ---
    function openModal(task = null) {
        taskModal.style.display = 'block'; // Show the modal

        // Reset form
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
            // Set for adding new task
            modalTitle.textContent = 'Add New Task';
            // Set default date to today for convenience
            const today = new Date().toISOString().split('T')[0];
            taskDateInput.value = today;
        }
    }

    function closeModal() {
        taskModal.style.display = 'none'; // Hide the modal
        taskForm.reset(); // Clear form fields
    }

    // --- Function to render a single task element in the list ---
    function renderTask(task) {
        const li = document.createElement('li');
        li.dataset.id = task.id; // Store the task ID on the list item

        if (task.completed) {
            li.classList.add('checked');
        }

        // Create a container for task text and date/time
        const taskDetailsDiv = document.createElement('div');
        taskDetailsDiv.classList.add('task-details');

        const taskTextDisplay = document.createElement('span');
        taskTextDisplay.classList.add('task-text-display');
        taskTextDisplay.textContent = `${task.text} (${task.hours || 'N/A'} hours)`;
        taskDetailsDiv.appendChild(taskTextDisplay);

        if (task.dueDate) {
            const taskDateTimeDisplay = document.createElement('span');
            taskDateTimeDisplay.classList.add('task-datetime-display');
            let dateTimeStr = `Due: ${task.dueDate}`;
            if (task.time) {
                dateTimeStr += ` at ${task.time}`;
            }
            taskDateTimeDisplay.textContent = dateTimeStr;
            taskDetailsDiv.appendChild(taskDateTimeDisplay);
        }
        li.appendChild(taskDetailsDiv); // Append the div to the li

        // Add delete button
        const deleteSpan = document.createElement('span');
        deleteSpan.innerHTML = '\u00d7'; // Unicode 'x'
        deleteSpan.classList.add('delete-btn');
        li.appendChild(deleteSpan);

        taskList.appendChild(li);
    }

    // --- Fetch and display all tasks from json-server ---
    async function loadTasks() {
        taskList.innerHTML = ''; // Clear existing tasks before loading
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const tasks = await response.json();
            tasks.forEach(renderTask); // Render tasks in the list
            return tasks; // Return tasks for calendar integration
        } catch (error) {
            console.error('Error loading tasks:', error);
            return [];
        }
    }

    // --- Handle Form Submission (Add or Update Task) ---
    taskForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent default form submission

        const id = taskIdInput.value;
        const text = taskTextInput.value.trim();
        const hours = taskHoursInput.value;
        const dueDate = taskDateInput.value; // YYYY-MM-DD format
        const time = taskTimeInput.value; // HH:MM format

        if (text === '' || dueDate === '') {
            alert('Task description and due date are required!');
            return;
        }

        const taskData = {
            text,
            hours: hours || '1',
            dueDate,
            time: time || '', // Store empty string if no time
            completed: false // Default for new tasks, will be updated for existing
        };

        try {
            let response;
            let method;
            let url;

            if (id) {
                // UPDATE existing task
                method = 'PATCH';
                url = `${API_URL}/${id}`;
                // Fetch existing task to preserve 'completed' status
                const existingTaskRes = await fetch(url);
                const existingTask = await existingTaskRes.json();
                taskData.completed = existingTask.completed; // Preserve status
            } else {
                // ADD new task
                method = 'POST';
                url = API_URL;
            }

            response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(taskData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const savedTask = await response.json();
            console.log('Task saved:', savedTask);

            closeModal(); // Close the modal
            initializeCalendar(); // Refresh both list and calendar
        } catch (error) {
            console.error('Error saving task:', error);
            alert(`Failed to save task: ${error.message}`);
        }
    });

    // --- Task List Click Listener (for complete/delete) ---
    taskList.addEventListener('click', async (e) => {
        const li = e.target.closest('li');
        if (!li) return;

        const taskId = li.dataset.id;
        if (!taskId) return; // Should not happen if li has dataset.id

        if (e.target.classList.contains('delete-btn')) {
            // DELETE task
            try {
                const response = await fetch(`${API_URL}/${taskId}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                li.remove(); // Remove from DOM
                initializeCalendar(); // Refresh calendar
            } catch (error) {
                console.error('Error deleting task:', error);
                alert('Failed to delete task.');
            }
        } else if (e.target.classList.contains('task-details') || e.target.closest('.task-details')) {
             // OPEN MODAL FOR EDITING (if task details clicked)
             try {
                const response = await fetch(`${API_URL}/${taskId}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const taskToEdit = await response.json();
                openModal(taskToEdit); // Open modal with task data
            } catch (error) {
                console.error('Error fetching task for edit:', error);
                alert('Failed to load task details for editing.');
            }
        } else if (e.target.tagName === 'LI' || e.target.classList.contains('task-text-display') || e.target.classList.contains('task-datetime-display')) {
            // TOGGLE COMPLETION (if li itself or specific text parts are clicked)
            const currentCompletedStatus = li.classList.contains('checked');
            const newCompletedStatus = !currentCompletedStatus;

            try {
                const response = await fetch(`${API_URL}/${taskId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ completed: newCompletedStatus })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                li.classList.toggle('checked', newCompletedStatus); // Update UI
                initializeCalendar(); // Refresh calendar
            } catch (error) {
                console.error('Error toggling task completion:', error);
                alert('Failed to update task status.');
            }
        }
    });

    // --- Calendar Integration using FullCalendar.js ---
    async function initializeCalendar() {
        // Fetch tasks from your JSON server to get the latest data
        const myTasks = await loadTasks(); // This also refreshes the list display

        // Map your json-server tasks to FullCalendar event objects
        const taskEvents = myTasks.map(task => {
            let startDateTime = task.dueDate;
            if (task.time) {
                startDateTime += `T${task.time}`; // Combine date and time for FullCalendar
            }

            return {
                id: task.id,
                title: `${task.text} (${task.hours} hrs)`,
                start: startDateTime,
                allDay: !task.time, // If no time, it's an all-day event
                extendedProps: {
                    completed: task.completed,
                    hours: task.hours,
                    time: task.time // Keep original time for edit
                },
                color: task.completed ? '#c6e2b9' : '#a923ca' // Green for completed, purple for incomplete
            };
        });

        // Destroy existing calendar instance before creating a new one to prevent duplicates
        const calendarEl = document.getElementById('calendar');
        if (!calendarEl) {
            console.error("Calendar element not found!");
            return;
        }

        if (calendar) {
            calendar.destroy();
        }

        // Initialize FullCalendar
        calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth', // Default view
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay' // Allows switching views
            },
            events: taskEvents, // Only your json-server tasks
            eventClick: async function(info) {
                // When a task event on the calendar is clicked, open the modal for editing
                const taskId = info.event.id;
                if (taskId) {
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
                }
            },
            dateClick: function(info) {
                // When a specific date on the calendar is clicked, open modal to add a task for that date
                const clickedDate = info.dateStr; // YYYY-MM-DD
                openModal(); // Open modal for new task
                taskDateInput.value = clickedDate; // Pre-fill the date
                taskTextInput.focus();
            }
        });
        calendar.render(); // Render the calendar
    }

    // --- Event Listeners for Modal ---
    openAddTaskButton.addEventListener('click', () => openModal());
    closeButton.addEventListener('click', closeModal);
    cancelButton.addEventListener('click', closeModal);

    // Close modal if user clicks outside of it
    window.addEventListener('click', (event) => {
        if (event.target === taskModal) {
            closeModal();
        }
    });

    // Initial load of tasks and calendar when the page loads
    initializeCalendar();
});