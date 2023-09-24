const express = require("express");
const app = express();

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");

app.use(express.json());

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({ filename: dbPath, driver: sqlite3.Database });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000");
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `SELECT * FROM movie`;

  const movieNamesList = await db.all(getMoviesQuery);
  const formattedMovieNamesList = movieNamesList.map((eachMovie) => ({
    movieName: eachMovie.movie_name,
  }));
  response.send(formattedMovieNamesList);
});

app.post("/movies/", async (request, response) => {
  const addMovieDetails = request.body;
  const { directorId, movieName, leadActor } = addMovieDetails;

  const addMovieQuery = `INSERT INTO movie (director_id, movie_name, lead_actor)
                                VALUES (${directorId}, "${movieName}", "${leadActor}");`;
  await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const getMovieOfIdQuery = `SELECT * FROM movie WHERE movie_id = ${movieId};`;

  const movieIdObject = await db.get(getMovieOfIdQuery);

  const formattedMovieIdObject = convertDbObjectToResponseObject(movieIdObject);
  response.send(formattedMovieIdObject);
});

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovieDetailsQuery = `UPDATE movie 
        SET
            director_id = ${directorId},
            movie_name = "${movieName}",
            lead_actor = "${leadActor}"
        WHERE
            movie_id = ${movieId};
        `;
  await db.run(updateMovieDetailsQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  console.log(movieId);
  const deleteMovieQuery = `DELETE FROM movie WHERE movie_id = ${movieId}`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const getDirectorsDetailsQuery = `SELECT * FROM director`;
  const directorsDetailsObject = await db.all(getDirectorsDetailsQuery);
  const formattedDirectorsDetails = directorsDetailsObject.map(
    (eachDirector) => ({
      directorId: eachDirector.director_id,
      directorName: eachDirector.director_name,
    })
  );
  response.send(formattedDirectorsDetails);
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const moviesOfDirectorQuery = `SELECT movie_name FROM movie WHERE director_id = ${directorId}`;
  const moviesOfDirectorObject = await db.all(moviesOfDirectorQuery);
  const formattedMoviesListOfDirector = moviesOfDirectorObject.map(
    (eachMovie) => ({
      movieName: eachMovie.movie_name,
    })
  );
  response.send(formattedMoviesListOfDirector);
});

module.exports = app;
