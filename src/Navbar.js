import React, { useState } from "react";

const Navbar = ({ 
  currentPage, 
  setCurrentPage, 
  search, 
  setSearch, 
  selectedStatus, 
  setSelectedStatus,
  selectedGenre, 
  setSelectedGenre,
  uniqueGenres,
  actorInput,
  setActorInput,
  selectedActor,
  clearActorFilter,
  handleActorInputChange,
  actorSuggestions,
  selectActor,
  newMovie,
  setNewMovie,
  addMovie
}) => {
  return (
    <nav className="fixed top-0 left-0 w-full bg-gray-800 shadow-lg z-50">
      <div className="p-4 flex flex-wrap justify-between items-center">
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
    </nav>
  );
};

export default Navbar;