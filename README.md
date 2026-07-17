# Daraz Clone

This is a clone of the Daraz e-commerce platform. The project is divided into two main parts: the frontend and the backend.

## Project Structure

- `frontend/`: Contains the static assets (HTML, CSS, JavaScript, and images) for the user interface.
- `backend/`: Contains the Node.js/Express application that serves as the API for the application.

## Prerequisites

To run this project locally, you will need to have [Node.js](https://nodejs.org/) installed on your machine.

## How to Run Locally

### 1. Running the Backend Server

The backend provides the necessary data and API endpoints for the frontend.

1. Open your terminal and navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Install the required dependencies:

   ```bash
   npm install
   ```

3. Start the backend server:

   ```bash
   npm start
   ```

   *Note: You can also use `npm run dev` to start the server with nodemon, which will automatically restart the server when you make changes to the code.*

### 2. Running the Frontend

The frontend is built with plain HTML, CSS, and JavaScript.

1. Navigate to the `frontend` directory.
2. You can simply open the `index.html` file in your preferred web browser by double-clicking it.
3. Alternatively, for a better development experience, you can use an extension like **Live Server** in VS Code:
   - Open the `frontend` folder in VS Code.
   - Right-click on `index.html` and select **"Open with Live Server"**.

## Technologies Used

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express, CORS, dotenv
