const fs = require('fs');
const Pool = require('pg').Pool
const pool = new Pool({
  // user: "Austin",
  user: "postgres",
  password: "latte-a1",
  database: "db",
  hostname: "localhost",
  port: 5432,
})

var emailService = require('./email.js')

//User
const getUsers = (request, response) => {
  pool.query('SELECT * FROM users ORDER BY updated_at DESC', (error, results) => {
    if (error) {
      throw error
    }
      response.status(200).json(results.rows)
  })
}

const getUserById = async (id) => {
  // const id = parseInt(request.params.id)

  const results = await pool.query('SELECT * FROM users WHERE uid = $1', [id])
  return results.rows[0]
    
}

const getUserByEmail = async (email) => {

  const results = await pool.query('SELECT * FROM users WHERE email = $1', [email])
  return results.rowCount
}

const getUserByEmailAndPassword = async (email, password) => {
  const results = await pool.query('SELECT * FROM users WHERE email = $1 AND password = $2', [email, password])
  console.log(results.rowCount)
  return results.rows
}

const createUser = async (request, response) => {
  let formData = request.body;
  console.log('form data', formData);
  console.log(request.file.path)
  // console.log(formData.photo)
  let email = formData.email
  let nickname = formData.nickname
  let password = formData.password
  let info = formData.info
    /** When using the "single"
      data come in "req.file" regardless of the attribute "name". **/
      var tmp_path = request.file.path;

      /** The original name of the uploaded file
          stored in the variable "originalname". **/
      var target_path = 'public/' + request.file.path+'.jpg';
    
      /** A better way to copy the uploaded file. **/
      var src = fs.createReadStream(tmp_path);
      var dest = fs.createWriteStream(target_path);
      src.pipe(dest);

  // const { nickname, email, password, info } = request.body
  // console.log(nickname, email, password, info)

  const preResult = await getUserByEmail(email)
  if (preResult === 0){
    const result =  await pool.query('INSERT INTO users (email, password, nickname, info, photo) VALUES ($1, $2, $3, $4, $5)', [email, password, nickname, info, request.file.path ])
    request.session.user = { nickname, email, password, info }
      // response.status(201).send(`User added with ID: ${result.insertId}`)
      await emailService.send(email, '"尬聊小站 | Chatting Booth" 歡迎您的加入❤️❤️', `Hi ${nickname},\n給就要認識新朋友的妳/你，\n匿名、配對、聊天！\n快開始您的冒險吧！\n https://lattemall.company`);
      
        // 'austin362667@gmail.com',
        // '感謝您的註冊!',
        // "<p>一起來尬聊小站聊天交朋友~</p> <h4>https://lattemall.company</h4>",
        // response.redirect(301, '/avenue');
        response.status(200).json({msg: 'success!'})
    }else{
   console.log('email already used!')
   response.status(500).json({msg: 'success!'})
  }

}

const updateUser = (request, response) => {
  const id = parseInt(request.params.id)
  const { name, email, nickname, info } = request.body

  pool.query(
    'UPDATE users SET email = $1, password = $2, nickname = $3, info = $4 WHERE uid = $3',
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
    console.log(results.rows)
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

//chats
const getChats = (request, response) => {
  pool.query('SELECT * FROM chats ORDER BY updated_at DESC', (error, results) => {
    if (error) {
      throw error
    }
    console.log(results.rows)
    response.status(200).json(results.rows)
  })
}

const getChatByUsersIds = async ( userA, userB ) => {

 const results = await pool.query('SELECT * FROM chats WHERE (user_a = $1 AND user_b = $2) OR (user_a = $2 AND user_b = $1)', [userA, userB])

    return results
}

const getChatById = (request, response) => {
  const id = request.params.id;

  pool.query('SELECT * FROM chats WHERE cid = $1', [id], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}

const createChat = async (request, response) => {
  // console.log(request.body)
  const userA = request.params.userA
  const userB = request.params.userB
  let info = ''
  // const { info, userA, userB } = request.body
  console.log(info, userA, userB)
  var preResults = await getChatByUsersIds( userA, userB )
  console.log('CNT: ', preResults.rowCount)
  var user = await getUserById(userA);

  if( preResults.rowCount === 0){
    await pool.query('INSERT INTO chats (info, user_a, user_b) VALUES ($1, $2, $3)', [info, userA, userB] )
    console.log(user.email)
    preResults = await getChatByUsersIds( userA, userB )
    await emailService.send(user.email
      , '"尬聊小站 | Chatting Booth" 您有新訊息❤️❤️', `Hi ${user.nickname},\n有人在 尬聊小站 傳了訊息給妳/你！，\n快來看看是誰吧！\n https://lattemall.company/chat/${preResults.rows[0].cid}`);

  }
    // preResults = await getChatByUsersIds( userA, userB )
    // var results = preResults
    response.redirect(`/chat/${preResults.rows[0].cid}`);


  // if(results.rows !== undefined){

  //   // console.log(results.rows[0]);
  // }
    // response.status(200).json(results.rows)
    // response.status(201).send(`Post added with ID: ${result.insertId}`)
}

const updateChat = (request, response) => {
  const id = parseInt(request.params.id)
  const { info, userA, userB } = request.body

  pool.query(
    'UPDATE users SET info = $1, user_a = $2, user_b = $3 WHERE cid = $4',
    [info, userA, userB],
    (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).send(`Chat modified with ID: ${id}`)
    }
  )
}

const deleteChat = (request, response) => {
  const id = parseInt(request.params.id)

  pool.query('DELETE FROM posts WHERE cid = $1', [id], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).send(`Chat deleted with ID: ${id}`)
  })
}


module.exports = {
  getUsers,
  getUserById,
  getUserByEmailAndPassword,
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
  getChats,
  getChatById,
  createChat,
  updateChat,
  deleteChat,
}