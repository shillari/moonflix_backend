# Moonflix backend
## Overview
Moonflix backend is the server-side component of a “movies” web application. This web application provides users with access to information about different movies, directors, and genres. Users can sign up, update their personal information, and create a list of their favorite movies.

## Stack
Moonflix backend is built using the following technologies:
- MongoDB v7.0.8: A NoSQL database used for storing movie data, user information, and other backend data.
- Node.js v20.12.2: A JavaScript runtime used for building scalable server-side applications.
- Express v4.19.2: A fast, unopinionated, minimalist web framework for Node.js used for building APIs.

## Dependencies
Moonflix backend relies on the following npm packages for its functionality:
- Bcrypt v5.1.1: Used for hashing passwords securely before storing them in the database.
- Body-parser v1.20.2: Middleware for parsing incoming request bodies in Express.js.
- Cors v2.8.5: Middleware for enabling Cross-Origin Resource Sharing (CORS) in Express.js.
- Express-validator v7.0.1: Middleware for validating and sanitizing user input data in Express.js.
- Jsonwebtoken v9.0.2: Used for generating and verifying JSON Web Tokens (JWT) for authentication and authorization.
- Mongoose v8.3.2: An ODM (Object Data Modeling) library for MongoDB and Node.js.
- Morgan v1.10.0: HTTP request logger middleware for Node.js used for logging request details.
- Passport v0.7.0: Authentication middleware for Node.js used for handling user authentication.
- Passport-jwt v4.0.1: Passport strategy for authenticating with JSON Web Tokens (JWT) using the `jwt` authentication scheme.
- Passport-local v1.0.0: Passport strategy for authenticating with a username and password.
- Swagger-jsdoc v6.2.8: Allows defining Swagger documentation using JSDoc comments in your code.
- Swagger-ui-express v5.0.0: Middleware for serving Swagger UI generated from Swagger-jsdoc in Express.js applications.

## Authentication/Authorization
The Moonflix API employs basic authentication for login functionality and JSON Web Tokens (JWT) for authorization. Users can log in using their username and password, and upon successful authentication, they receive a JWT token that is used to authorize subsequent requests.

## Documentation
- Endpoints and swagger documentation are available at [swagger](https://moonflix-97228dafe8d1.herokuapp.com/api-docs)
- Additionally, you can access the documentation at [documentation](https://moonflix-97228dafe8d1.herokuapp.com/documentation.html).

## Hosting
The API is hosted on [Heroku](https://moonflix-97228dafe8d1.herokuapp.com) while the database is managed using MongoDB Atlas, a cloud-based MongoDB database service.
