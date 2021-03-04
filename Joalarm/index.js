var express = require('express');
var app     = express();
var port    = 3000;

const Pool = require('pg').Pool
const pool = new Pool({
  // user: "Austin",
  user: "postgres",
  password: "latte-a1",
  database: "db",
  hostname: "localhost",
  port: 5432,
})

const router = express.Router();

app.get("/createUser/:name/:long/:lat/:token", async (req, res) => {
  console.log(`/createUser/${req.params.name}/${req.params.long}/${req.params.lat}/${req.params.token}`)
  const results = (await pool.query(`INSERT INTO "USER" (name, location, token) VALUES ('${req.params.name}', 'SRID=4326;POINT(${req.params.long} ${req.params.lat})', '${req.params.token}') RETURNING id;`)).rows;
  return res.send(results);
});

app.get("/updateUserLocation/:id/:long/:lat", async (req, res) => {
  console.log(`/updateUserLocation/${req.params.id}/${req.params.long}/${req.params.lat}`)
  const results = (await pool.query(`UPDATE "USER" SET location = 'SRID=4326;POINT(${req.params.long} ${req.params.lat})' WHERE id = '${req.params.id}';`)).rows;
  return res.send(results);
});

app.get("/updateUserCnt/:id", async (req, res) => {
  console.log(`/updateUserCnt/${req.params.id}`)
  const results = (await pool.query(`UPDATE "USER" SET cnt = cnt + 1 WHERE id = '${req.params.id}';`)).rows;
  return res.send(results);
});

app.get("/chkDis/:follower/:followee", async (req, res) => {
  console.log(`/chkDis/${req.params.follower}/${req.params.followee}`)
  const results = (await pool.query(`SELECT ST_Distance(location, lag(location) over()) from "USER" where id = '${req.params.follower}' or id = '${req.params.followee}';`)).rows[1];
  return res.send(results);
});



// app.get("/searchNearByFollower/:id/:long/:lat", async (req, res) => {
//   console.log(`/searchNearByFollower/${req.params.id}/${req.params.long}/${req.params.lat}`)
//   const results = (await pool.query(`SELECT * FROM "USER" u, "FOLLOW" f WHERE ST_DWithin ( location, geography (ST_Point(${req.params.long}, ${req.params.lat})), 10000) AND ${req.params.id} = f.followee;`)).rows;

//   return res.send(results);
// });

app.get("/createFollow/:follower/:followee", async (req, res) => {
  console.log(`/createFollow/${req.params.follower}/${req.params.followee}`)
  const results = (await pool.query(`INSERT INTO "FOLLOW" (follower, followee) VALUES ('${req.params.follower}', '${req.params.followee}') RETURNING id;`)).rows;
  return res.send(results);
});


app.get("/userName/:name", async (req, res) => {
  console.log(`/userName/${req.params.name}`)
  const results = (await pool.query(`SELECT * FROM "USER" WHERE name = '${req.params.name}';`)).rows[0];
  return res.send(results);
});

app.get("/userId/:id", async (req, res) => {
  console.log(`/userId/${req.params.id}`)
  const results = (await pool.query(`SELECT * FROM "USER" WHERE id = '${req.params.id}';`)).rows[0];
  return res.send(results);
});




app.listen(port, () => {
  console.log(`App listening at http://66.228.52.222:${port}`)
})
