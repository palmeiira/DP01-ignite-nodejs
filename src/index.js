const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = (users.find(user => user.username === username))

  if (!user) {
    return response.status(404).json({ error: 'User not found.' });
  }

  request.user = user;

  next();

}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userExists = (users.find(u => u.username === username))

  if (userExists) {
    return response.status(400).json({ error: "Selected username is being used by another user." });
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };

  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;
 
  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(newTodo);

  return response.status(201).json(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;
  const { title, deadline } = request.body;

  const changedTodo = user.todos.find(todo => todo.id === id);

  if (!changedTodo) {
    return response.status(404).json({ error: 'TODO not found.' });
  }

  changedTodo.title = title;
  changedTodo.deadline = new Date(deadline);

  return response.json(changedTodo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;

  const changedTodo = request.user.todos.find(todo => todo.id === id);

  if (!changedTodo) {
    return response.status(404).json({ error: 'TODO not found.' });
  }

  changedTodo.done = true;

  return response.json(changedTodo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const deletedTodoIndex = request.user.todos.findIndex(todo => todo.id === id);

  if (deletedTodoIndex === -1) {
    return response.status(404).json({ error: 'TODO not found.' });
  }

  user.todos.splice(deletedTodoIndex, 1);

  response.status(204).json();
});

module.exports = app;;