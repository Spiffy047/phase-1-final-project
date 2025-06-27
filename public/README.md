Daily Task Manager

This is a simple Single Page Application (SPA) designed to help users manage their daily tasks and schedule them effectively. It features full CRUD (Create, Read, Update, Delete) operations for tasks and integrates with a calendar to provide a visual overview of scheduled items.
Features

    Task Management: Add, edit, mark as complete, and delete daily tasks.

    Calendar Integration: View tasks directly on an interactive calendar powered by FullCalendar.js.

    Persistent Data: Utilizes json-server as a mock backend to store task data, ensuring changes persist across sessions (when json-server is running).

    Responsive Design: The application's layout is designed to be adaptable for various screen sizes, providing a good user experience on both desktop and mobile devices.

    Intuitive UI: A clean and easy-to-use interface for managing tasks and scheduling.

    Interactive Elements: Hover effects on task items provide visual feedback.

Technologies Used

    HTML5: For structuring the web content.

    CSS3: For styling, including custom styles in style.css for a modern look and responsive adjustments.

    JavaScript (ES6+): For all interactive client-side logic, API interactions, and DOM manipulation.

    FullCalendar.js: A robust JavaScript library used for displaying and managing events on the calendar.

    json-server: A lightweight tool used to create a full fake REST API for local data persistence during development.

    Font Awesome: For various icons used throughout the application.

    Google Fonts (Inter): For consistent typography.

Prerequisites

Before running this project, ensure you have the following installed on your machine:

    Node.js: Includes npm (Node Package Manager). You can download it from nodejs.org.

    json-server (Globally): Install it via npm:

    npm install -g json-server

Installation and Setup

Follow these steps to get the project up and running on your local machine:

    Clone the Repository (or create files manually):
    If this project is part of a Git repository, clone it:

    git clone <your-repository-url>
    cd <project-directory>

    Otherwise, ensure you have index.html, index.js, style.css, and db.json files in the same directory.

    Start json-server:
    Navigate to the project's root directory in your terminal and start the json-server using your db.json file:

    json-server --watch db.json

    This will start the API server, typically accessible at http://localhost:3000/tasks. Ensure this server is running before opening the HTML file.

    Open the Application:
    Open the index.html file in your web browser. You can usually do this by double-clicking the file or by right-clicking and selecting "Open with..." your preferred browser.

Usage

Once the json-server is running and you have opened index.html in your browser:

    View Tasks: All your tasks will be displayed in the "My Daily Tasks" list and on the "Daily Schedule" calendar.

    Add New Task: Click the "Add New Task" button to open a modal form. Fill in the details (Task Description, Estimated Hours, Due Date, Due Time) and click "Save Task". The task will appear in both the list and the calendar.

    Edit Task: Click on a task in the list or an event on the calendar to open the modal pre-filled with that task's data. Make your changes and click "Save Task".

    Mark as Complete/Incomplete: Click the checkbox next to a task in the list to toggle its completion status. Completed tasks will typically appear with a strikethrough and a different color in the calendar.

    Delete Task: Click the trash can icon next to a task in the list. A confirmation dialog will appear before deletion.

    Navigate Calendar: Use the arrows on the calendar to move between months, weeks, or days.

    Add Task from Calendar: Click on any date on the calendar to pre-fill the "Due Date" in the "Add New Task" modal.

File Structure

    index.html: The main HTML file structuring the web page, including the task list, calendar, and modal.

    index.js: Contains all the client-side JavaScript logic for fetching data, rendering tasks, handling CRUD operations, and integrating with FullCalendar.js.

    style.css: Custom CSS file for styling the application, complementing the layout and component design.

    db.json: The JSON file used by json-server to store your task data. It acts as your mock database.

Potential Enhancements

    Search/Filter Functionality: Add input fields to search tasks by description or filter by completion status, due date, or estimated hours.

    Task Prioritization: Implement a way to assign and display priority levels for tasks.

    User Accounts: For multi-user scenarios, integrate a simple authentication system (e.g., Firebase Authentication).

    Real Backend: Replace json-server with a real backend database and API (e.g., Node.js with Express and MongoDB/PostgreSQL) for a production-ready application.

    Notifications: Add browser notifications for upcoming tasks.

    Drag-and-Drop Tasks: Allow users to drag and drop tasks on the calendar to change their due dates.

Contact

For any questions or suggestions, feel free to reach out to Joe Kariuki:

    Email: mwanikijoe1@gmail.com