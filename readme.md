 Prerequisites

- Node.js v20
- MySQL

 Steps

1. clone the repository:
   git clone https://github.com/houssamberrezag/tahdda-book-management-backend.git
   cd tahdda-book-management-backend

2. Install dependencies:
   npm install

3. Configure environment variables: 
   Edit the `.env` file at the root of the project with the following information:
   
   PORT=3000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=book_management
   JWT_SECRET=your_jwt_secret

4. Start the server:
   npm start

5.Access the Swagger documentation  
   Open your browser and navigate to: http://localhost:3000/api-docs

API Endpoints

1. Authenticate through the API:  
   Endpoint: `POST /api/auth/login`
   Use any username and password for this step.

2. Copy the Token:
   After logging in, copy the token provided in the response.

3. Authorize in Swagger: 
   Use the token in the **Authorize** button within the Swagger interface to access the protected routes.