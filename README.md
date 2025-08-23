# IT Service Management (ITSM) System

This project is an IT Service Management (ITSM) system that focuses on managing incidents. It is built using Node.js for the backend with Express as the RESTful API, MongoDB as the database, and React with Tailwind CSS for the frontend.

## Project Structure

```
itsm-incidents
├── backend
│   ├── package.json          # Backend configuration and dependencies
│   ├── .env.example          # Environment variable examples for backend
│   └── src
│       ├── server.js         # Entry point for the backend application
│       ├── db.js             # MongoDB connection handling
│       ├── models
│       │   ├── user.js       # User model schema
│       │   ├── group.js      # Group model schema
│       │   └── incident.js    # Incident model schema
│       ├── routes
│       │   ├── users.js      # User-related routes
│       │   ├── groups.js     # Group-related routes
│       │   └── incidents.js   # Incident-related routes
│       ├── middleware
│       │   └── errorHandler.js # Error handling middleware
│       └── scripts
│           └── seed.js       # Database seeding script
├── frontend
│   ├── package.json          # Frontend configuration and dependencies
│   ├── index.html            # Main HTML file for the frontend
│   ├── postcss.config.js     # PostCSS configuration
│   ├── tailwind.config.js     # Tailwind CSS configuration
│   ├── .env.example          # Environment variable examples for frontend
│   └── src
│       ├── main.jsx          # Entry point for the React application
│       ├── app.jsx           # Main application component
│       ├── index.css         # Global styles and Tailwind CSS imports
│       ├── api
│       │   ├── client.js     # API client for HTTP requests
│       │   ├── incidents.js   # Incident API functions
│       │   ├── users.js      # User API functions
│       │   └── groups.js     # Group API functions
│       ├── components
│       │   ├── incidentForm.jsx # Component for creating/editing incidents
│       │   └── incidentTable.jsx # Component for displaying incidents
│       └── pages
│           ├── incidentsList.jsx # Page for listing incidents
│           └── incidentEdit.jsx  # Page for editing an incident
└── README.md                 # Project documentation
```

## Setup Instructions

### Backend

1. Navigate to the `backend` directory.
2. Copy the `.env.example` file to `.env` and configure the MongoDB URI and other environment variables as needed.
3. Install the dependencies:
   ```
   npm install
   ```
4. Start the backend server:
   ```
   npm run dev
   ```

### Frontend

1. Navigate to the `frontend` directory.
2. Copy the `.env.example` file to `.env` and set the API base URL.
3. Install the dependencies:
   ```
   npm install
   ```
4. Start the frontend application:
   ```
   npm run dev
   ```

## API Overview

- **Health Check**: `GET /api/health`
- **Users**:
  - `GET /api/users` - List users
  - `POST /api/users` - Create a new user
- **Groups**:
  - `GET /api/groups` - List groups
  - `POST /api/groups` - Create a new group
- **Incidents**:
  - `GET /api/incidents` - List incidents
  - `POST /api/incidents` - Create a new incident
  - `GET /api/incidents/:id` - Get an incident by ID
  - `PATCH /api/incidents/:id` - Update an incident

## Next Steps

- Implement authentication and authorization.
- Add additional features such as SLAs, comments, and attachments.
- Improve error handling and validation.
- Write tests for both backend and frontend components.
- Consider containerization with Docker for easier deployment.