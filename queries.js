const Pool = require('pg').Pool
const pool = new Pool({
  // user: "Austin",
  user: "postgres",
  password: "latte-a1",
  database: "db",
  hostname: "localhost",
  port: 5432,
})


//User
const getUsers = (request, response) => {
  pool.query('SELECT * FROM users ORDER BY uid ASC', (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}

const getUserById = (request, response) => {
  const id = parseInt(request.params.id)

  pool.query('SELECT * FROM users WHERE uid = $1', [id], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}

const createUser = (request, response) => {
  const { email, password } = request.body

  const result = pool.query('INSERT INTO users (email, password) VALUES ($1, $2)', [email, password], (error, results) => {
    if (error) {
      throw error
    }
    // response.status(201).send(`User added with ID: ${result.insertId}`)
  })
}

const updateUser = (request, response) => {
  const id = parseInt(request.params.id)
  const { name, email } = request.body

  pool.query(
    'UPDATE users SET email = $1, password = $2 WHERE uid = $3',
    [name, email, id],
    (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).send(`User modified with ID: ${id}`)
    }
  )
}

const deleteUser = (request, response) => {
  const id = parseInt(request.params.id)

  pool.query('DELETE FROM users WHERE uid = $1', [id], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).send(`User deleted with ID: ${id}`)
  })
}


//Post
const getPosts = (request, response) => {
  pool.query('SELECT * FROM posts ORDER BY updated_at DESC', (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}

const getPostById = (request, response) => {
  const id = request.params.id;

  pool.query('SELECT * FROM posts WHERE pid = $1', [id], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}

const createPost = (request, response) => {
  // console.log(request.body)
  const { title } = request.body

  const result = pool.query('INSERT INTO posts (title) VALUES ($1)', [title], (error, results) => {
    if (error) {
      throw error
    }
    response.redirect("https://lattemall.company/chat");
    // response.status(201).send(`Post added with ID: ${result.insertId}`)
  })
}

const updatePost = (request, response) => {
  const id = parseInt(request.params.id)
  const { title } = request.body

  pool.query(
    'UPDATE users SET title = $1 WHERE pid = $2',
    [name, email, id],
    (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).send(`Post modified with ID: ${id}`)
    }
  )
}

const deletePost = (request, response) => {
  const id = parseInt(request.params.id)

  pool.query('DELETE FROM posts WHERE pid = $1', [id], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).send(`Post deleted with ID: ${id}`)
  })
}


//Messages
const getMessagesByPostId = (request, response) => {
  const id = request.params.id;
// console.log('log', id)
  pool.query('SELECT * FROM messages WHERE pid = $1 ORDER BY created_at ASC', [id], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}

const createMessages = (request, response) => {
  // console.log(request.body)
  const { pid, user, content } = request.body
// console.log(pid, user, content)
  const result = pool.query('INSERT INTO messages (pid, username, message) VALUES ($1, $2, $3)', [pid, user, content], (error, results) => {
    if (error) {
      throw error
    }
    // response.status(201).send(`Post added with ID: ${result.insertId}`)
  })
}


module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  getMessagesByPostId,
  createMessages,
}