import React, { useEffect, useState } from "react";

const MovieList = () => {
  const [movies, setMovies] = useState([]);
  const [search, setSearch] = useState("");
  const [newMovie, setNewMovie] = useState("");
  const [suggestedMovie, setSuggestedMovie] = useState(null);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedActor, setSelectedActor] = useState("");
  const [actorInput, setActorInput] = useState(""); // Input field for actor search
  const [actorSuggestions, setActorSuggestions] = useState([]); // Suggested actors
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [uniqueGenres, setUniqueGenres] = useState([]);
  const [uniqueActors, setUniqueActors] = useState([]);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = () => {
    fetch("http://localhost:8000/movies/")
      .then((response) => response.json())
      .then((data) => {
        setMovies(data);
        extractFilters(data);
      });
  };

  const extractFilters = (data) => {
    const genres = new Set();
    const actors = new Set();

    data.forEach((movie) => {
      movie.genre?.split(", ").forEach((g) => genres.add(g));
      movie.actors?.split(", ").forEach((a) => actors.add(a));
    });

    setUniqueGenres([...genres]);
    setUniqueActors([...actors]);
  };

  const toggleWatched = async (id) => {
    await fetch(`http://localhost:8000/movies/${id}/watched`, { method: "PUT" });
    fetchMovies();
  };

  const deleteMovie = async (id) => {
    await fetch(`http://localhost:8000/movies/${id}/`, { method: "DELETE" });
    fetchMovies();
  };

  const addMovie = async () => {
    if (!newMovie.trim()) return;
    await fetch(`http://localhost:8000/movies/?title=${newMovie}`, { method: "POST" });
    setNewMovie("");
    fetchMovies();
  };

  const suggestMovie = () => {
    const toWatchMovies = movies.filter((movie) => !movie.watched);
    if (toWatchMovies.length > 0) {
      const randomMovie = toWatchMovies[Math.floor(Math.random() * toWatchMovies.length)];
      setSuggestedMovie(randomMovie);
    }
  };

  const handleActorInputChange = (e) => {
    const value = e.target.value.toLowerCase();
    setActorInput(e.target.value);

    if (value.trim() === "") {
      setActorSuggestions([]);
    } else {
      setActorSuggestions(
        uniqueActors.filter((actor) => actor.toLowerCase().includes(value))
      );
    }
  };

  const selectActor = (actor) => {
    setSelectedActor(actor);
    setActorInput(actor); // Show selected actor in input
    setActorSuggestions([]); // Hide suggestions
  };

  const filteredMovies = movies.filter((movie) => {
    return (
      movie.title.toLowerCase().includes(search.toLowerCase()) &&
      (selectedGenre ? movie.genre?.includes(selectedGenre) : true) &&
      (selectedActor ? movie.actors?.includes(selectedActor) : true) &&
      (selectedStatus === "all" ? true : selectedStatus === "watched" ? movie.watched : !movie.watched)
    );
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <nav className="fixed top-0 left-0 w-full bg-gray-800 shadow-lg p-4 flex justify-between items-center z-50">
        <h1 className="text-2xl font-bold text-blue-400">Movie Recommendations</h1>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search movies..."
            className="p-2 rounded bg-gray-700 text-white focus:outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="p-2 rounded bg-gray-700 text-white"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">All Movies</option>
            <option value="watched">Watched</option>
            <option value="to_watch">To Watch</option>
          </select>

          <select
            className="p-2 rounded bg-gray-700 text-white"
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
          >
            <option value="">All Genres</option>
            {uniqueGenres.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>

          <div className="relative">
            <input
              type="text"
              placeholder="Search Actor..."
              className="p-2 rounded bg-gray-700 text-white focus:outline-none w-48"
              value={actorInput}
              onChange={handleActorInputChange}
            />
            {actorSuggestions.length > 0 && (
              <ul className="absolute bg-gray-800 border border-gray-700 rounded-lg mt-1 w-48 max-h-40 overflow-y-auto">
                {actorSuggestions.map((actor) => (
                  <li
                    key={actor}
                    className="p-2 cursor-pointer hover:bg-gray-700"
                    onClick={() => selectActor(actor)}
                  >
                    {actor}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <input
            type="text"
            placeholder="Add movie..."
            className="p-2 rounded bg-gray-700 text-white focus:outline-none"
            value={newMovie}
            onChange={(e) => setNewMovie(e.target.value)}
          />
          <button
            onClick={addMovie}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-700 rounded-lg text-white font-semibold"
          >
            Add
          </button>
        </div>
      </nav>

      <div className="pt-20">
        <h2 className="text-2xl font-semibold text-yellow-400 mb-4">Movies</h2>
        <button 
          onClick={suggestMovie} 
          className="mb-4 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-700 text-white font-semibold transition-all duration-300"
        >
          Suggest a Movie
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredMovies.map((movie) => (
            <div key={movie.id} className={`bg-gray-800 p-4 rounded-2xl shadow-lg transition transform hover:scale-105 ${movie.watched ? "opacity-60" : ""}`}>
              {movie.poster_url && (
                <img src={movie.poster_url} alt={movie.title} className="w-full h-96 object-cover rounded-lg mb-4 shadow-md" />
              )}
              <h2 className="text-xl font-semibold text-center text-blue-300">{movie.title}</h2>
              <p className="text-gray-400 text-sm text-center mb-2">{movie.type}</p>
              <p className="mt-2 text-justify text-gray-300 text-sm">{movie.description}</p>
              <p className="text-gray-300 text-sm mt-2">Genre: {movie.genre}</p>
              <p className="text-gray-300 text-sm">Actors: {movie.actors}</p>
              <button onClick={() => toggleWatched(movie.id)} className={`flex-1 px-4 py-2 rounded-lg ${movie.watched ? "bg-red-500 hover:bg-red-700" : "bg-green-500 hover:bg-green-700"} text-white font-semibold transition-all duration-300`}>
                {movie.watched ? "Mark as Unwatched" : "Mark as Watched"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MovieList;
