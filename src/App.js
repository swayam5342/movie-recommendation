import React, { useEffect, useState } from "react";

const MovieList = () => {
  const [movies, setMovies] = useState([]);
  const [watchedMovies, setWatchedMovies] = useState(new Set());
  const [search, setSearch] = useState("");
  const [newMovie, setNewMovie] = useState("");

  useEffect(() => {
    fetch("http://localhost:8000/movies/")
      .then((response) => response.json())
      .then((data) => setMovies(data));
  }, []);

  const toggleWatched = async (id) => {
    await fetch(`http://localhost:8000/movies/${id}/watched`, { method: "PUT" });
    setWatchedMovies((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const addMovie = async () => {
    if (!newMovie.trim()) return;
    await fetch(`http://localhost:8000/movies/?title=${newMovie}`, { method: "POST" });
    setNewMovie("");
    window.location.reload();
  };

  const deleteMovie = async (id) => {
    await fetch(`http://localhost:8000/movies/${id}/`, { method: "DELETE" });
    setMovies(movies.filter(movie => movie.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="flex justify-between items-center p-6 bg-gray-800 shadow-md">
        <h1 className="text-3xl font-bold text-blue-400">Movie Recommendations</h1>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search movies..."
            className="p-2 rounded bg-gray-700 text-white focus:outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <input
            type="text"
            placeholder="Add movie..."
            className="p-2 rounded bg-gray-700 text-white focus:outline-none"
            value={newMovie}
            onChange={(e) => setNewMovie(e.target.value)}
          />
          <button onClick={addMovie} className="px-4 py-2 bg-blue-500 rounded text-white hover:bg-blue-700">Add</button>
        </div>
      </nav>
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {movies.filter(movie => movie.title.toLowerCase().includes(search.toLowerCase())).map((movie) => (
          <div
            key={movie.id}
            className={`bg-gray-800 p-4 rounded-2xl shadow-lg transition transform hover:scale-105 ${watchedMovies.has(movie.id) ? "opacity-60" : ""}`}
          >
            {movie.poster_url && (
              <img
                src={movie.poster_url}
                alt={movie.title}
                className="w-full h-96 object-cover rounded-lg mb-4 shadow-md"
              />
            )}
            <h2 className="text-xl font-semibold text-center text-blue-300">{movie.title}</h2>
            <p className="text-gray-400 text-sm text-center mb-2">{movie.type}</p>
            <p className="mt-2 text-justify text-gray-300 text-sm">{movie.description}</p>
            {movie.imdb_id && (
              <a
                href={`https://www.imdb.com/title/${movie.imdb_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline mt-2 block text-center font-semibold"
              >
                View on IMDb
              </a>
            )}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => toggleWatched(movie.id)}
                className={`flex-1 px-4 py-2 rounded-lg text-white font-semibold transition-all duration-300 ${watchedMovies.has(movie.id) ? "bg-red-500 hover:bg-red-700" : "bg-green-500 hover:bg-green-700"}`}
              >
                {watchedMovies.has(movie.id) ? "Mark as Unwatched" : "Mark as Watched"}
              </button>
              <button
                onClick={() => deleteMovie(movie.id)}
                className="px-4 py-2 bg-red-600 hover:bg-red-800 rounded-lg text-white font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MovieList;
