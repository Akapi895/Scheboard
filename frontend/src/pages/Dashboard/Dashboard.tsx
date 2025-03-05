import React, { useState } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Search, Calendar, List, MessageSquare, User, Settings, LogOut } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard: React.FC = () => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const pieData = [
    { name: "Study", value: 30, color: "#7D9EF1" },
    { name: "Work", value: 40, color: "#0D1F80" },
    { name: "Health", value: 20, color: "#4A64CD" },
    { name: "Other", value: 10, color: "#A6B7FF" },
  ];

  const barData = [
    { day: "Mon", tasks: 20 },
    { day: "Tue", tasks: 30 },
    { day: "Wed", tasks: 100 },
    { day: "Thu", tasks: 40 },
    { day: "Fri", tasks: 40 },
    { day: "Sat", tasks: 70 },
    { day: "Sun", tasks: 90 },
  ];

  const moods = ["Good", "Fine", "Sad", "Tired", "Angry"];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-1/5 bg-white p-5 shadow-md min-h-screen">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <span>📌</span> Scheboard
        </h1>
        <nav className="mt-5 space-y-3">
          <Link to="/search" className="flex items-center gap-3 text-gray-700 font-medium hover:text-blue-700">
            <Search size={18} /> Search
          </Link>
          <Link to="/calendar" className="flex items-center gap-3 text-gray-700 font-medium hover:text-blue-700">
            <Calendar size={18} /> Calendar
          </Link>
          <Link to="/tasks" className="flex items-center gap-3 text-gray-700 font-medium hover:text-blue-700">
            <List size={18} /> Main Tasks
          </Link>
          <Link to="/chatbot" className="flex items-center gap-3 text-gray-700 font-medium hover:text-blue-700">
            <MessageSquare size={18} /> Chatbot
          </Link>
          <Link to="/profile" className="flex items-center gap-3 text-gray-700 font-medium hover:text-blue-700">
            <User size={18} /> Profile
          </Link>
          <Link to="/settings" className="flex items-center gap-3 text-gray-700 font-medium hover:text-blue-700">
            <Settings size={18} /> Setting
          </Link>
        </nav>
        <div className="mt-10">
          <Link to="/logout" className="flex items-center gap-3 text-red-500 font-medium hover:text-red-700">
            <LogOut size={18} /> Logout
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-5">
        {/* Top Section */}
        <div className="flex justify-between items-center">
          <div className="relative">
            <input type="text" placeholder="Searching..." className="px-4 py-2 w-80 border rounded-full shadow-md focus:outline-none" />
            <Search size={20} className="absolute top-2 left-2 text-gray-500" />
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-3 gap-5 mt-5">
          <div className="bg-white p-5 shadow-md rounded-lg w-full border-2 border-blue-900">
            <h3 className="text-xl font-bold text-blue-900">Total Projects</h3>
          </div>
          <div className="bg-white p-5 shadow-md rounded-lg w-full border-2 border-blue-900">
            <h3 className="text-xl font-bold text-blue-900">Today's Tasks</h3>
          </div>
          <div className="bg-white p-5 shadow-md rounded-lg w-full">
            <h3 className="text-red-600 text-lg font-bold">How are you feeling?</h3>
            <div className="flex gap-3 mt-3">
              {moods.map((mood) => (
                <button
                  key={mood}
                  onClick={() => setSelectedMood(mood)}
                  className={`px-3 py-1 rounded-full border-2 transition-all ${selectedMood === mood ? "bg-red-500 text-white" : "border-red-500 text-red-500 hover:bg-red-500 hover:text-white"}`}
                >
                  {mood}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-2 gap-5 mt-5">
          {/* Pie Chart */}
          <div className="bg-white p-5 rounded-lg shadow-md">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart */}
          <div className="bg-white p-5 rounded-lg shadow-md">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData}>
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="tasks" fill="#0D1F80" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Progress Section */}
        <div className="bg-white p-5 rounded-lg shadow-md mt-5">
          <h3 className="text-lg font-bold text-center">Project Ended</h3>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie dataKey="value" startAngle={180} endAngle={0} data={[{ value: 60 }, { value: 40 }]} cx="50%" cy="80%" innerRadius={50} outerRadius={70} fill="green" />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-3 mt-2">
            <span className="text-green-500">Completed</span>
            <span className="text-gray-500">Ended</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;