# Database-Driven Application with User Management and Core Functionalities

## Overview
This project is a full-stack application integrating a dynamic backend with a relational database and a user-friendly frontend. It offers secure user authentication, robust data management, and interactive features to enhance user experience.

## Features

1. **Database Integration**:
   - A relational database with tables such as `users`, `categories`, and `transactions`, supporting many-to-many relationships.
   - Automatic seeding of sample data for easy setup and testing.
   - Data integrity enforced through constraints and validations.

2. **Core Functionalities**:
   - **CRUD Operations**: Add, update, delete, and retrieve data for users, categories, and transactions.
   - **Detailed Views**: View comprehensive details, including related data for each record.
   - **Pagination**: Navigate through large datasets with ease.

3. **User Management**:
   - Secure registration and login with encrypted passwords using `bcrypt`.
   - JSON Web Token (JWT) authentication for session management.
   - Role-based access control restricting data modifications to authorized users.

4. **Additional Features**:
   - Interactive category management for user-specific customization.
   - Real-time validations and meaningful error messages for better usability.

## Technical Details

- **Backend**: Node.js and Express.js for building RESTful APIs.
- **Frontend**: Interactive UI built with HTML, CSS, and JavaScript for seamless user interaction.
- **Database**: SQLite for development, scalable to MySQL or MongoDB.
- **Authentication**: Token-based authentication using `jsonwebtoken` for secure API calls.
- **Error Handling**: Comprehensive error handling and validation on both client and server sides.

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/byzhs/TIN-Project.git
