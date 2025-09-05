# Project Overview

This is a full-stack web application for an optical store named "Optica Magdiel". It consists of a React frontend and a Node.js/Express backend, with a MySQL database.

## Technologies

*   **Frontend:**
    *   React
    *   Vite
    *   React Router (it's imported as `react-router` in the code, not `react-router-dom`)
    *   Axios
    *   Tailwind CSS
*   **Backend:**
    *   Node.js
    *   Express
    *   MySQL2
    *   JSON Web Tokens (JWT) for authentication
    *   Nodemailer for sending emails
    *   bcryptjs for password hashing

## Architecture

The project is divided into two main parts:

*   **`client`:** Contains the React frontend code. It handles the user interface and interacts with the backend API.
*   **`server`:** Contains the Node.js backend code using ESModules. It provides a RESTful API for the frontend, handles business logic, and interacts with the MySQL database.

# Building and Running

## Frontend

To run the frontend, navigate to the `client` directory and use the following commands:

*   **Install dependencies:** `npm install`
*   **Run in development mode:** `npm run dev`
*   **Build for production:** `npm run build`
*   **Lint the code:** `npm run lint`

## Backend

To run the backend, navigate to the `server` directory and use the following commands:

*   **Install dependencies:** `npm install`
*   **Run the server:** `npm start`
*   **Run in development mode with auto-restarting:** `npm run dev`

**Note:** The backend requires a `.env` file with the following variables for database connection and JWT:

```
DB_HOST=your_database_host
DB_USER=your_database_user
DB_PASS=your_database_password
DB_NAME=your_database_name
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=your_jwt_expiration
CLIENT_URL=your_client_url
```

# Development Conventions

*   **Code Style:** The backend follows the "standard" JavaScript style. The frontend uses ESLint for code linting.
*   **Authentication:** The application uses JWT for authentication. The backend provides endpoints for user registration, login, password reset, and profile management.
*   **Routing:** The frontend uses React Router for client-side routing. The backend uses Express Router for defining API routes.
*   **Database:** The backend uses `mysql2` to interact with a MySQL database. The database schema is not defined in the codebase and needs to be created separately.
*   **Lenguage:** Use Spanish for all user-facing text in the frontend.
