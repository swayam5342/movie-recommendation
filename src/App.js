import React, { useState, useEffect, useMemo } from "react";
import MovieList from "./MovieList";
import StatisticsDashboard from "./StatisticsDashboard";
import Navbar from "./Navbar";
import debounce from "lodash/debounce";

const App = () => {
  const [currentPage, setCurrentPage] = useState("movies");
  const [search, setSearch] = useState("");
  const debouncedSetSearch = useMemo(() => debounce(setSearch, 300), []);
  const [newMovie, setNewMovie] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedActor, setSelectedActor] = useState("");
  const [actorInput, setActorInput] = useState("");
  const [actorSuggestions, setActorSuggestions] = useState([]);
  const [uniqueGenres, setUniqueGenres] = useState([]);
  const [uniqueActors, setUniqueActors] = useState([]);
  const [movieToAdd, setMovieToAdd] = useState(null);

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

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navigation Header */}
      <Navbar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        search={search}
        setSearch={debouncedSetSearch}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        selectedGenre={selectedGenre}
        setSelectedGenre={setSelectedGenre}
        uniqueGenres={uniqueGenres}
        actorInput={actorInput}
        setActorInput={setActorInput}
        selectedActor={selectedActor}
        clearActorFilter={clearActorFilter}
        handleActorInputChange={handleActorInputChange}
        actorSuggestions={actorSuggestions}
        selectActor={selectActor}
        newMovie={newMovie}
        setNewMovie={setNewMovie}
        addMovie={addMovie}
      />

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