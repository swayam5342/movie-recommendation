import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const StatisticsDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState("overview");

  // Define chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'];
  
  // Define sections
  const sections = [
    { id: "overview", label: "Overview" },
    { id: "genres", label: "Genres" },
    { id: "actors", label: "Top Actors" },
    { id: "ratings", label: "Ratings" }
  ];

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8000/statistics/");
      if (!response.ok) {
        throw new Error("Failed to fetch statistics");
      }
      const data = await response.json();
      setStats(data);
      setError(null);
    } catch (err) {
      setError("Error loading statistics. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Format percentage for pie charts
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, value }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    if (percent < 0.05) return null;
    
    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${name} (${value})`}
      </text>
    );
  };

  // Custom tooltip for bar charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
          <p className="font-medium text-white">{`${label}`}</p>
          <p className="text-blue-300">{`Movies: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  // Format rating data for visualization
  const formatRatingsData = () => {
    if (!stats || !stats.avg_ratings) return [];
    
    return Object.entries(stats.avg_ratings).map(([source, value]) => {
      let formattedValue = value;
      let maxValue = 10;
      
      if (source === "Rotten Tomatoes") {
        maxValue = 100;
      } else if (source === "Metacritic") {
        maxValue = 100;
      }
      
      return {
        name: source,
        value: formattedValue,
        maxValue: maxValue
      };
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-blue-400 text-lg">Loading statistics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 text-red-300">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-white min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-blue-400">Movie Collection Statistics</h1>
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap mb-6 gap-2">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeSection === section.id 
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>
        
        {/* Overview Section */}
        {activeSection === "overview" && stats && (
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gray-800 rounded-xl p-5 shadow-lg">
                <h3 className="text-gray-400 font-medium mb-1">Total Movies</h3>
                <p className="text-3xl font-bold text-white">{stats.total_movies}</p>
              </div>
              
              <div className="bg-gray-800 rounded-xl p-5 shadow-lg">
                <h3 className="text-gray-400 font-medium mb-1">Watched</h3>
                <p className="text-3xl font-bold text-green-400">{stats.watched_movies}</p>
                <p className="text-sm text-gray-400 mt-1">{stats.watched_percentage}% of collection</p>
              </div>
              
              <div className="bg-gray-800 rounded-xl p-5 shadow-lg">
                <h3 className="text-gray-400 font-medium mb-1">To Watch</h3>
                <p className="text-3xl font-bold text-yellow-400">{stats.unwatched_movies}</p>
                <p className="text-sm text-gray-400 mt-1">{100 - stats.watched_percentage}% of collection</p>
              </div>
              
              <div className="bg-gray-800 rounded-xl p-5 shadow-lg">
                <h3 className="text-gray-400 font-medium mb-1">Average IMDb</h3>
                <p className="text-3xl font-bold text-blue-400">
                  {stats.avg_ratings["Internet Movie Database"] || "N/A"}
                </p>
                <p className="text-sm text-gray-400 mt-1">out of 10</p>
              </div>
            </div>
            
            {/* Watch Status Pie Chart */}
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-semibold text-white mb-4">Watch Status</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Watched", value: stats.watched_movies },
                        { name: "To Watch", value: stats.unwatched_movies }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#4ade80" />
                      <Cell fill="#facc15" />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Content Types Pie Chart */}
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-semibold text-white mb-4">Content Types</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.types}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="name"
                    >
                      {stats.types.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
        
        {/* Genres Section */}
        {activeSection === "genres" && stats && (
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-white mb-6">Genre Distribution</h3>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.genres.slice(0, 15)} // Show top 15 genres only
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                  <XAxis type="number" />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    tick={{ fill: 'white' }} 
                    width={90}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="#3b82f6">
                    {stats.genres.slice(0, 15).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        
        {/* Top Actors Section */}
        {activeSection === "actors" && stats && (
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-white mb-6">Top Actors</h3>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.top_actors}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                  <XAxis type="number" />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    tick={{ fill: 'white' }}
                    width={120}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="#3b82f6">
                    {stats.top_actors.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        
        {/* Ratings Section */}
        {activeSection === "ratings" && stats && (
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-white mb-6">Average Ratings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* IMDb Rating */}
              <div className="bg-gray-700 rounded-lg p-5 text-center">
                <h4 className="text-lg mb-2">IMDb</h4>
                <div className="text-4xl font-bold">
                  {stats.avg_ratings["Internet Movie Database"] || "N/A"}
                  <span className="text-lg text-gray-400">/10</span>
                </div>
              </div>
              
              {/* Rotten Tomatoes Rating */}
              <div className="bg-gray-700 rounded-lg p-5 text-center">
                <h4 className="text-lg mb-2">Rotten Tomatoes</h4>
                <div className="text-4xl font-bold">
                  {stats.avg_ratings["Rotten Tomatoes"] ? `${stats.avg_ratings["Rotten Tomatoes"]}%` : "N/A"}
                </div>
              </div>
              
              {/* Metacritic Rating */}
              <div className="bg-gray-700 rounded-lg p-5 text-center">
                <h4 className="text-lg mb-2">Metacritic</h4>
                <div className="text-4xl font-bold">
                  {stats.avg_ratings["Metacritic"] || "N/A"}
                  <span className="text-lg text-gray-400">/100</span>
                </div>
              </div>
            </div>
            
            <div className="h-64 mt-8">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={formatRatingsData()}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar 
                    dataKey="value" 
                    name="Rating Value" 
                    fill="#3b82f6"
                    label={(props) => {
                      const { x, y, width, value, index } = props;
                      const source = formatRatingsData()[index].name;
                      const display = source === "Internet Movie Database" ? 
                        `${value}/10` : source === "Rotten Tomatoes" ? 
                        `${value}%` : `${value}/100`;
                      
                      return (
                        <text x={x + width / 2} y={y - 10} fill="#fff" textAnchor="middle" dominantBaseline="middle">
                          {display}
                        </text>
                      );
                    }}
                  >
                    {formatRatingsData().map((entry, index) => {
                      // Calculate color based on rating value
                      let color = "#ef4444"; // red for low ratings
                      
                      if (entry.name === "Internet Movie Database") {
                        if (entry.value >= 7.5) color = "#22c55e"; // green
                        else if (entry.value >= 6) color = "#eab308"; // yellow
                      } else {
                        // For Rotten Tomatoes and Metacritic
                        if (entry.value >= 75) color = "#22c55e"; // green
                        else if (entry.value >= 60) color = "#eab308"; // yellow
                      }
                      
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatisticsDashboard;