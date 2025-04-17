import React, { useEffect, useState, useRef } from "react";

const MovieList = ({ 
  search, 
  selectedStatus, 
  selectedGenre, 
  selectedActor, 
  newMovieToAdd,
  onClearNewMovie,
  updateFilterOptions
}) => {
  const [movies, setMovies] = useState([]);
  const [suggestedMovie, setSuggestedMovie] = useState(null);
  const [isRandomOrder, setIsRandomOrder] = useState(true); // Default to random order
  const newMovieProcessedRef = useRef(false);

  useEffect(() => {
    fetchMovies();
  }, []);

  useEffect(() => {
    // Process new movie addition when newMovieToAdd changes and is not null
    if (newMovieToAdd && !newMovieProcessedRef.current) {
      addMovie(newMovieToAdd);
      newMovieProcessedRef.current = true;
      onClearNewMovie(); // Clear the input field in parent
    } else if (!newMovieToAdd) {
      newMovieProcessedRef.current = false;
    }
  }, [newMovieToAdd, onClearNewMovie]);

  const fetchMovies = () => {
    fetch("http://localhost:8000/movies/")
      .then((response) => response.json())
      .then((data) => {
        // Store the original data
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

    // Send the filter options back to the App component
    updateFilterOptions([...genres], [...actors]);
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

  const addMovie = async (movieTitle) => {
    if (!movieTitle.trim()) return;
    await fetch(`http://localhost:8000/movies/?title=${encodeURIComponent(movieTitle)}`, { method: "POST" });
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

  // Toggle random order function
  const toggleRandomOrder = () => {
    setIsRandomOrder(!isRandomOrder);
  };

  const filteredMovies = movies.filter((movie) => {
    return (
      movie.title.toLowerCase().includes(search.toLowerCase()) &&
      (selectedGenre ? movie.genre?.includes(selectedGenre) : true) &&
      (selectedActor ? movie.actors?.includes(selectedActor) : true) &&
      (selectedStatus === "all" ? true : selectedStatus === "watched" ? movie.watched : !movie.watched)
    );
  });
  const displayMovies = isRandomOrder 
    ? [...filteredMovies].sort(() => Math.random() - 0.5) 
    : filteredMovies;

  return (
    <div className="container mx-auto px-6">
      {/* Page header and controls */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-yellow-400">Movies</h2>
        <div className="flex gap-4">
          <button 
            onClick={toggleRandomOrder} 
            className={`px-4 py-2 rounded-lg ${isRandomOrder ? "bg-purple-600 hover:bg-purple-800" : "bg-gray-600 hover:bg-gray-700"} text-white font-semibold transition-all duration-300`}
          >
            {isRandomOrder ? "Random Order: ON" : "Random Order: OFF"}
          </button>
          <button 
            onClick={suggestMovie} 
            className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-700 text-white font-semibold transition-all duration-300"
          >
            Suggest a Movie
          </button>
        </div>
      </div>

      {/* Suggested movie section */}
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

      {/* Movie grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {displayMovies.length > 0 ? (
          displayMovies.map((movie) => (
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
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-400 text-lg">No movies match your filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieList;