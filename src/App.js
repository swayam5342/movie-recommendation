import React, { useEffect, useState } from "react";

const MovieList = () => {
  const [movies, setMovies] = useState([]);
  const [search, setSearch] = useState("");
  const [newMovie, setNewMovie] = useState("");
  const [suggestedMovie, setSuggestedMovie] = useState(null);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedActor, setSelectedActor] = useState("");
  const [actorInput, setActorInput] = useState(""); 
  const [actorSuggestions, setActorSuggestions] = useState([]);
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

  // Parse ratings from string to JSON object
  const parseRatings = (ratingsString) => {
    if (!ratingsString) return [];
    try {
      // Replace single quotes with double quotes for valid JSON
      const validJsonString = ratingsString.replace(/'/g, '"');
      return JSON.parse(validJsonString);
    } catch (error) {
      console.error("Error parsing ratings:", error);
      return [];
    }
  };

  // Get appropriate color for rating based on score
  const getRatingColor = (source, value) => {
    if (source === "Rotten Tomatoes") {
      const percentage = parseInt(value.replace("%", ""));
      if (percentage >= 90) return "text-green-500";
      if (percentage >= 70) return "text-green-400";
      if (percentage >= 60) return "text-yellow-500";
      return "text-red-500";
    }
    
    if (source === "Internet Movie Database") {
      const score = parseFloat(value.split("/")[0]);
      if (score >= 7.5) return "text-green-500";
      if (score >= 6) return "text-yellow-500";
      return "text-red-500";
    }
    
    if (source === "Metacritic") {
      const score = parseInt(value.split("/")[0]);
      if (score >= 75) return "text-green-500";
      if (score >= 60) return "text-yellow-500";
      return "text-red-500";
    }
    
    return "text-gray-400";
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
      
      // Scroll to top to ensure suggested movie is visible
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleActorInputChange = (e) => {
    const value = e.target.value.toLowerCase();
    setActorInput(e.target.value);
    
    // Reset selectedActor if input is cleared
    if (value.trim() === "") {
      setSelectedActor("");
      setActorSuggestions([]);
    } else {
      setActorSuggestions(
        uniqueActors.filter((actor) => actor.toLowerCase().includes(value))
      );
    }
  };

  const selectActor = (actor) => {
    setSelectedActor(actor);
    setActorInput(actor);
    setActorSuggestions([]);
  };
  
  // Clear actor filter function
  const clearActorFilter = () => {
    setSelectedActor("");
    setActorInput("");
    setActorSuggestions([]);
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
            <div className="flex">
              <input
                type="text"
                placeholder="Search Actor..."
                className="p-2 rounded-l bg-gray-700 text-white focus:outline-none w-48"
                value={actorInput}
                onChange={handleActorInputChange}
              />
              {selectedActor && (
                <button 
                  onClick={clearActorFilter}
                  className="bg-gray-700 text-gray-400 hover:text-white px-2 rounded-r"
                >
                  ✕
                </button>
              )}
            </div>
            {actorSuggestions.length > 0 && (
              <ul className="absolute bg-gray-800 border border-gray-700 rounded-lg mt-1 w-48 max-h-40 overflow-y-auto z-10">
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-yellow-400">Movies</h2>
          <button 
            onClick={suggestMovie} 
            className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-700 text-white font-semibold transition-all duration-300"
          >
            Suggest a Movie
          </button>
        </div>

        {suggestedMovie && (
          <div className="mb-6 p-4 bg-gray-800 rounded-2xl shadow-lg border-2 border-yellow-400 transform transition-all duration-500">
            <div className="flex flex-col md:flex-row gap-6">
              {suggestedMovie.poster_url && (
                <img 
                  src={suggestedMovie.poster_url} 
                  alt={suggestedMovie.title} 
                  className="w-full md:w-64 h-auto object-cover rounded-lg shadow-md" 
                />
              )}
              <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-2xl font-bold text-yellow-300">
                    {suggestedMovie.title}
                  </h3>
                  <span className="bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold">
                    Suggested for you!
                  </span>
                </div>
                <p className="text-gray-400 text-sm mb-2">{suggestedMovie.type}</p>
                
                {/* Ratings section */}
                {suggestedMovie.ratings && (
                  <div className="mt-2 mb-4">
                    <h4 className="text-lg font-semibold text-blue-300 mb-1">Ratings</h4>
                    <div className="flex flex-wrap gap-2">
                      {parseRatings(suggestedMovie.ratings).map((rating, index) => (
                        <div key={index} className="bg-gray-700 rounded-lg px-3 py-1 inline-flex items-center">
                          <span className="text-sm text-gray-300 mr-2">{rating.Source}:</span>
                          <span className={`text-sm font-bold ${getRatingColor(rating.Source, rating.Value)}`}>
                            {rating.Value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <p className="mt-2 text-justify text-gray-300">{suggestedMovie.description}</p>
                <p className="text-gray-300 mt-2">Genre: {suggestedMovie.genre}</p>
                <p className="text-gray-300">Actors: {suggestedMovie.actors}</p>
                {suggestedMovie.imdb_id && (
                  <a 
                    href={`https://www.imdb.com/title/${suggestedMovie.imdb_id}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-400 hover:underline mt-2 inline-block font-semibold"
                  >
                    View on IMDb
                  </a>
                )}
                <div className="flex gap-2 mt-4">
                  <button 
                    onClick={() => toggleWatched(suggestedMovie.id)} 
                    className="flex-1 px-4 py-2 rounded-lg bg-green-500 hover:bg-green-700 text-white font-semibold transition-all duration-300"
                  >
                    Mark as Watched
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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
              {movie.imdb_id && (
                <a href={`https://www.imdb.com/title/${movie.imdb_id}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline mt-2 block text-center font-semibold">View on IMDb</a>
              )}
              <div className="flex gap-2 mt-4">
                <button onClick={() => toggleWatched(movie.id)} className={`flex-1 px-4 py-2 rounded-lg ${movie.watched ? "bg-red-500 hover:bg-red-700" : "bg-green-500 hover:bg-green-700"} text-white font-semibold transition-all duration-300`}>
                  {movie.watched ? "Mark as Unwatched" : "Mark as Watched"}
                </button>
                <button onClick={() => deleteMovie(movie.id)} className="px-4 py-2 bg-red-600 hover:bg-red-800 rounded-lg text-white font-semibold">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MovieList;