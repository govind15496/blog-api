# Blog API

> Nodejs/Expressjs RESTful API , with authentication using Passport and JWT

- Visit the client repo for this project [_here_](https://github.com/Ahmed-Mohadin/blog-client)👈

- Visit the cms repo for this project [_here_](https://github.com/Ahmed-Mohadin/blog-cms)👈

## Features and Functionalities

- Passport.js and JSON Web Token used for authentication
- Sign up and sign in user
- Create, Update and Delete post, only for authorized user
- Create and Delete comment on posts

## Built With

- Node.js
- [_Express.js_](https://expressjs.com)
- [_MongoDB_](https://www.mongodb.com/)
- [_Passport.js_](http://www.passportjs.org/)

## Installing and Getting Started

To get started, clone the project

```
git clone https://github.com/Ahmed-Mohadin/blog-api.git
```

Install the NPM packages

```
npm install
```

Run the following script in your command line

```
npm run start
```

Or run with Nodemon

```
npm run dev
```

The server will be running at

```
http://localhost:8080
```

## .env

create .env file and your

- MONGO_URI
- SECRET_KEY
- JWT_TOKEN_SECRET

## API

```
http://localhost:8080/api
```

#### Users

| Method | Endpoint    | Description  |
| ------ | ----------- | ------------ |
| POST   | /sign-up/   | Sign up user |
| POST   | /sign-in/   | Sign in user |
| GET    | /check-jwt/ | Check jwt    |

#### Posts

| Method | Endpoint      | Description             |
| ------ | ------------- | ----------------------- |
| GET    | /posts/       | Get all published posts |
| POST   | /posts/create | Create a new post       |
| GET    | /posts/:id    | Get a single post       |
| PUT    | /posts/:id    | Update a post           |
| DELETE | /posts/:id    | Remove a post           |

#### Comments

| Method | Endpoint      | Description                               |
| ------ | ------------- | ----------------------------------------- |
| POST   | /comments/:id | Create a new comment on requested post id |
| DELETE | /comments/:id | Remove a comment from requested post id   |

Enjoy 👍
