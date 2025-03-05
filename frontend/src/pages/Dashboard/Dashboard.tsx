import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSmile, faMeh, faFrown, faTired, faAngry } from "@fortawesome/free-solid-svg-icons";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Dữ liệu mẫu cho pieData
  const pieData = [
    { name: "Group A", value: 400, color: "#0088FE" },
    { name: "Group B", value: 300, color: "#00C49F" },
    { name: "Group C", value: 300, color: "#FFBB28" },
    { name: "Group D", value: 200, color: "#FF8042" },
  ];

  // Dữ liệu mẫu cho barData
  const barData = [
    { day: "Monday", tasks: 12 },
    { day: "Tuesday", tasks: 19 },
    { day: "Wednesday", tasks: 3 },
    { day: "Thursday", tasks: 5 },
    { day: "Friday", tasks: 2 },
    { day: "Saturday", tasks: 3 },
    { day: "Sunday", tasks: 9 },
  ];

  useEffect(() => {
    // Giả lập thời gian tải dữ liệu
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  const moods = [
    { name: "Good", icon: <FontAwesomeIcon icon={faSmile} />, className: "good" },
    { name: "Fine", icon: <FontAwesomeIcon icon={faMeh} />, className: "fine" },
    { name: "Sad", icon: <FontAwesomeIcon icon={faFrown} />, className: "sad" },
    { name: "Tired", icon: <FontAwesomeIcon icon={faTired} />, className: "tired" },
    { name: "Angry", icon: <FontAwesomeIcon icon={faAngry} />, className: "angry" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="flex-1 p-5">
        <div className="flex justify-between items-center">
          <div className="relative">
            <input type="text" placeholder="Searching..." className="px-4 py-2 w-80 border rounded-full shadow-md focus:outline-none" />
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-3 gap-5 mt-5">
          <div className="total">
            <h3 className="text-xl font-bold text-blue-900">Total Projects</h3>
            <p className="text-2xl">10</p>
          </div>
          <div className="today">
            <h3 className="text-xl font-bold text-blue-900">Today's Tasks</h3>
            <p className="text-2xl">5</p>
          </div>
          <div className="mood">
            <h3 className="text-red-600 text-lg font-bold">How are you feeling?</h3>
            <div className="flex gap-3 mt-3">
              {moods.map((mood) => (
                <button
                  key={mood.name}
                  onClick={() => setSelectedMood(mood.name)}
                  className={`mood-button ${mood.className} ${selectedMood === mood.name ? "opacity-80" : ""}`}
                >
                  {mood.icon}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-2 gap-5 mt-5">
          {/* Pie Chart */}
          <div className="pie">
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

          {/* Doughnut Chart */}
          <div className="doughnut">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70} fill="#8884d8" label>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart */}
          <div className="col-span-2 bar">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={barData}>
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="tasks" fill="#0D1F80" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;