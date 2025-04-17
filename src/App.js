import React, { useState, useEffect } from "react";
import MovieList from "./MovieList";
import StatisticsDashboard from "./StatisticsDashboard";

const App = () => {
  const [currentPage, setCurrentPage] = useState("movies");
  const [search, setSearch] = useState("");
  const [newMovie, setNewMovie] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedActor, setSelectedActor] = useState("");
  const [actorInput, setActorInput] = useState("");
  const [actorSuggestions, setActorSuggestions] = useState([]);
  const [uniqueGenres, setUniqueGenres] = useState([]);
  const [uniqueActors, setUniqueActors] = useState([]);
  const [movieToAdd, setMovieToAdd] = useState(null);
  const [isNavExpanded, setIsNavExpanded] = useState(false);

  // Function to receive genres and actors from MovieList
  const updateFilterOptions = (genres, actors) => {
    setUniqueGenres(genres);
    setUniqueActors(actors);
  };

  // Handler for actor input
  const handleActorInputChange = (e) => {
    const value = e.target.value.toLowerCase();
    setActorInput(e.target.value);
    
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
    setIsNavExpanded(false); // Close expanded nav after selection
  };
  
  const clearActorFilter = () => {
    setSelectedActor("");
    setActorInput("");
    setActorSuggestions([]);
  };

  // Add movie function (pass to MovieList)
  const addMovie = () => {
    if (newMovie.trim()) {
      setMovieToAdd(newMovie.trim());
      setNewMovie("");
    }
  };

  // Toggle nav expansion for mobile view
  const toggleNavExpansion = () => {
    setIsNavExpanded(!isNavExpanded);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navigation Header */}
      <nav className="fixed top-0 left-0 w-full bg-gray-800 shadow-lg z-50">
        {/* Main navigation bar */}
        <div className="p-4 flex flex-wrap justify-between items-center">
          {/* Logo and page tabs */}
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-blue-400">Movie App</h1>
            <div className="hidden md:flex gap-4">
              <button
                onClick={() => setCurrentPage("movies")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  currentPage === "movies"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                }`}
              >
                Movies
              </button>
              <button
                onClick={() => setCurrentPage("stats")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  currentPage === "stats"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                }`}
              >
                Statistics
              </button>
            </div>
          </div>

          {/* Mobile toggle button */}
          <button 
            className="md:hidden bg-gray-700 hover:bg-gray-600 text-white p-2 rounded"
            onClick={toggleNavExpansion}
          >
            {isNavExpanded ? "Hide Controls" : "Show Controls"}
          </button>

          {/* Desktop search controls */}
          <div className="hidden md:flex items-center gap-3 flex-wrap">
            {currentPage === "movies" && (
              <>
                <input
                  type="text"
                  placeholder="Search movies..."
                  className="p-2 rounded bg-gray-700 text-white focus:outline-none w-40"
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
                      className="p-2 rounded-l bg-gray-700 text-white focus:outline-none w-36"
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
                    <ul className="absolute bg-gray-800 border border-gray-700 rounded-lg mt-1 w-36 max-h-40 overflow-y-auto z-10">
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

                <div className="flex gap-1">
                  <input
                    type="text"
                    placeholder="Add movie..."
                    className="p-2 rounded-l bg-gray-700 text-white focus:outline-none w-36"
                    value={newMovie}
                    onChange={(e) => setNewMovie(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newMovie.trim()) {
                        addMovie();
                        setNewMovie("");
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      addMovie();
                      setNewMovie("");
                    }}
                    className="px-3 py-2 bg-blue-500 hover:bg-blue-700 rounded-r text-white font-semibold"
                  >
                  +
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mobile expanded controls */}
        {isNavExpanded && (
          <div className="md:hidden p-4 bg-gray-800 border-t border-gray-700">
            <div className="flex gap-4 mb-4">
              <button
                onClick={() => {
                  setCurrentPage("movies");
                  setIsNavExpanded(false);
                }}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                  currentPage === "movies"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                }`}
              >
                Movies
              </button>
              <button
                onClick={() => {
                  setCurrentPage("stats");
                  setIsNavExpanded(false);
                }}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                  currentPage === "stats"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                }`}
              >
                Statistics
              </button>
            </div>

            {currentPage === "movies" && (
              <div className="flex flex-col gap-3">
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
                      className="p-2 rounded-l bg-gray-700 text-white focus:outline-none flex-1"
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
                    <ul className="absolute bg-gray-800 border border-gray-700 rounded-lg mt-1 w-full max-h-40 overflow-y-auto z-10">
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

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add movie..."
                    className="p-2 rounded-l bg-gray-700 text-white focus:outline-none flex-1"
                    value={newMovie}
                    onChange={(e) => setNewMovie(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newMovie.trim()) {
                        addMovie();
                        setNewMovie("");
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      addMovie();
                      setNewMovie("");
                    }}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-700 rounded-r text-white font-semibold"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Main Content Area with increased padding for larger nav */}
      <div className="pt-24 md:pt-20">
        {currentPage === "movies" ? (
          <MovieList 
          search={search}
          selectedStatus={selectedStatus}
          selectedGenre={selectedGenre}
          selectedActor={selectedActor}
          newMovieToAdd={movieToAdd}
          onClearNewMovie={() => setMovieToAdd(null)}  // Callback to clear it after use
          updateFilterOptions={updateFilterOptions}
          />
        ) : (
          <StatisticsDashboard />
        )}
      </div>
    </div>
  );
};

export default App;