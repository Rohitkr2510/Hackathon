const express = require("express");
const sqlite3 = require("sqlite3").verbose();
var path = require("path");

const ejs = require("ejs");
const { createConnection } = require("net");

let db = new sqlite3.Database(
  "./database/hackathon.db",
  sqlite3.OPEN_READWRITE,
  (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log("Connected to the Hackathon database");
  }
);

const app = express();

//view engine setup
app.set("view engine", "ejs");

//set path for static assets
app.use(express.static("public"));


app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.listen(5000, function () {
  console.log("Server started on port 5000");
});

app.get("/api/team", (req, res) => {
  var sql = "select * from teams";
  var params = [];
  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: "success",
      data: rows,
    });
  });
});

app.get("/api/team/:id", (req, res) => {
  var sql = "select * from teams where id = ?";
  var params = [req.params.id];
  db.get(sql, params, (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }

    res.json({
      message: "success",
      data: row,
    });
  });
});

app.post("/api/team", (req, res) => {
  var errors = [];
  if (!req.body.id) {
    errors.push("No id found");
  }
  if (!req.body.team_name) {
    errors.push("No team name found");
  }
  if (!req.body.project_name) {
    errors.push("No project name found");
  }
  if (!req.body.Description) {
    errors.push("No Description found");
  }

  if (errors.length) {
    res.status(400).json({ error: errors.join(",") });
  }

  var data = {
    team_name: req.body.team_name,
    project_name: req.body.project_name,
    id: req.body.id,
    Description: req.body.Description,
  };

  var sql =
    "INSERT INTO teams (id, team_name, project_name, Description) VALUES (?,?,?,?)";
  var params = [data.id, data.team_name, data.project_name, data.Description];
  console.log(params);

  db.run(sql, params, function (err, result) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }

    res.json({
      message: "success",
      data: data,
      id: this.lastID,
    });
  });
});

app.delete("/api/team/:id", (req, res) => {
  var sql = "DELETE FROM teams WHERE id = ?";
  var params = [req.params.id];
  db.run(sql, params, function (err, result) {
    if (err) {
      res.status(400).json({ error: res.message });
      return;
    }
    res.json({ message: "deleted", changes: this.changes });
  });
});

app.put("/api/team/:id", (req, res) => {
  var data = {
    id: req.body.id,
    team_name: req.body.team_name,
    project_name: req.body.project_name,
    Description: req.body.Description,
  };

  var sql =
    "UPDATE teams SET id = ?, team_name = ?, project_name = ?, Description = ? WHERE id = ? ";
  var params = [
    data.id,
    data.team_name,
    data.project_name,
    data.Description,
    data.id,
  ];
  db.run(sql, params, function (err, result) {
    if (err) {
      res.status(400).json({ error: res.message });
      return;
    }

    res.json({
      message: "success",
      data: data,
      changes: this.changes,
    });
  });
});

/* INSTRUCTIONS 
    For the remainder of the document, you will need to use the routes below, as required in 
    the 'website' section of the assessment brief.
    You should use EJS to render HTML for the remianing routes.
    For a low pass, the website shoud allow
        - Viewing
        - Adding
        - Deleting
    You will need to create additional routes to do this
    You do not need to connect to the API routes to achieve this
    Only when attempting A grade tasks does the API need to be communicated with.

    More requirements are added in the grading criteria (see assessment brief)
*/

app.get("/", (req, res) => {
  /* This route should render your home page
   */
  res.render("home");
});

app.get("/team", (req, res) => {
  /* This route should render a webpage that lists all teams from the database
   */
  var sql = "select * from teams";
  var params = [];
  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.render("team", { model: rows });
  });
});

// ADD A TEAM

app.post("/insert_team", function(req,res){
  var errors = [];
  if (!req.body.id) {
    errors.push("No id found");
  }
  if (!req.body.team_name) {
    errors.push("No team name found");
  }
  if (!req.body.project_name) {
    errors.push("No project name found");
  }
  if (!req.body.Description) {
    errors.push("No Description found");
  }

  if (errors.length) {
    res.status(400).json({ error: errors.join(",") });
    return;
  }

  var data = {
    team_name: req.body.team_name,
    project_name: req.body.project_name,
    id: req.body.id,
    Description: req.body.Description,
  };

  var sql =
    "INSERT INTO teams (id, team_name, project_name, Description) VALUES (?,?,?,?)";
  var params = [data.id, data.team_name, data.project_name, data.Description];
  console.log(params);

  db.run(sql, params, function (err, result) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }

    var sql1 = "select * from teams";
  var params = [];
  db.all(sql1, params, (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.render("team", { model: rows });
  });
  });
})

// DELETE A TEAM
app.get('/remove/(:id)', function(req,res,next){
  var sql = "DELETE FROM teams WHERE id = ?";
  var params = [req.params.id];
  db.run(sql, params, function (err, result) {
    if (err) {
      res.status(400).json({ error: res.message });
      return;
    }
    res.render("home");
  });
})


app.get("/team/:id", (req, res) => {
  /* This route should display information about a specific team (based on the 
        id parameter)
    */
        var sql = "select * from teams where id = ?";
        var params = [req.params.id];
        db.get(sql, params, (err, row) => {
          if (err) {
            res.status(400).json({ error: err.message });
            return;
          }
      
          res.render("details",{
                 team : row.team_name,
                 project : row.project_name,
                 description : row.Description,
                 id : row.id
          })
          });
        });


// UPDATING A SPECIFIC TEAM DETAILS
app.post("/update_team", function(req,res){
  var errors = [];
  if (!req.body.id) {
    errors.push("No id found");
  }
  if (!req.body.team_name) {
    errors.push("No team name found");
  }
  if (!req.body.project_name) {
    errors.push("No project name found");
  }
  if (!req.body.Description) {
    errors.push("No Description found");
  }

  if (errors.length) {
    res.status(400).json({ error: errors.join(",") });
    return;
  }

  var data = {
    team_name: req.body.team_name,
    project_name: req.body.project_name,
    id: req.body.id,
    Description: req.body.Description,
  };

  var sql =
  "UPDATE teams SET id = ?, team_name = ?, project_name = ?, Description = ? WHERE id = ? ";
var params = [
  data.id,
  data.team_name,
  data.project_name,
  data.Description,
  data.id,
];
db.run(sql, params, function (err, result) {
  if (err) {
    res.status(400).json({ error: res.message });
    return;
  }


  var sql = "select * from teams where id = ?";
  var params = [data.id];
  db.get(sql, params, (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }

    res.render("details",{
           team : row.team_name,
           project : row.project_name,
           description : row.Description,
           id : row.id
    })
    }); 

  });
})

/* 
    You will now need to create your own routes that facilitate the adding and
    deleting of teams. This is a website, so everything should be displayed to the user
    as a webpage.

    For a C grade you should also allow the user to update team information.

    See grading criteria for further C, B and A grade tasks. No prewritten code is 
    provided for these tasks.
*/

// db.close((err) => {
//     if(err) {
//         console.error(err.message);
//     }
//     console.log('Close the database connection.');
// });
