import React, { useState } from "react";
import { FiHome, FiList, FiUsers, FiDollarSign, FiTool, FiSettings, FiMoon, FiBell, FiUser } from "react-icons/fi";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, LineChart, Line } from "recharts";

const barData = [
  { month: "Jan", occupancy: 85 },
  { month: "Feb", occupancy: 88 },
  { month: "Mar", occupancy: 92 },
  { month: "Apr", occupancy: 90 },
  { month: "May", occupancy: 85 },
  { month: "Jun", occupancy: 89 }
];

const pieData = [
  { name: "Residential", value: 65 },
  { name: "Commercial", value: 35 }
];

const lineData = [
  { month: "Jan", income: 45000 },
  { month: "Feb", income: 48000 },
  { month: "Mar", income: 52000 },
  { month: "Apr", income: 51000 },
  { month: "May", income: 54000 },
  { month: "Jun", income: 58000 }
];

const propertyData = [
  {
    id: 1,
    name: "Sunset Apartments",
    address: "123 Sunset Blvd",
    type: "Residential",
    status: "Occupied",
    income: 5000
  },
  {
    id: 2,
    name: "Downtown Office Complex",
    address: "456 Business Ave",
    type: "Commercial",
    status: "Partially Occupied",
    income: 12000
  }
];

const tenantData = [
  {
    id: 1,
    name: "John Smith",
    contact: "john@email.com",
    property: "Sunset Apartments",
    lease: "12 months",
    status: "Paid"
  },
  {
    id: 2,
    name: "Sarah Johnson",
    contact: "sarah@email.com",
    property: "Downtown Office Complex",
    lease: "24 months",
    status: "Pending"
  }
];

const maintenanceData = [
  {
    id: 1,
    property: "Sunset Apartments",
    issue: "Plumbing",
    status: "Pending",
    date: "2024-01-15",
    staff: "Mike Tech"
  },
  {
    id: 2,
    property: "Downtown Office Complex",
    issue: "HVAC",
    status: "In Progress",
    date: "2024-01-14",
    staff: "Jane Fix"
  }
];

const kpiData = [
  { title: "Total Users", value: "3,421", icon: FiUsers, color: "blue" },
  { title: "Total Buildings", value: "253", icon: FiHome, color: "green" },
  { title: "Total Rooms", value: "812", icon: FiList, color: "purple" },
  { title: "Active Services", value: "119", icon: FiTool, color: "orange" },
  { title: "Pending Reports", value: "7", icon: FiBell, color: "red" },
  { title: "Withdrawal Requests", value: "4", icon: FiDollarSign, color: "yellow" }
];

const quickActions = [
  { title: "User Management", description: "View/edit/delete accounts", icon: FiUsers, color: "blue" },
  { title: "Room Management", description: "Review/approve/edit rooms", icon: FiHome, color: "green" },
  { title: "Service Management", description: "Review and moderate services", icon: FiTool, color: "purple" },
  { title: "Withdrawal Processing", description: "Approve withdrawal requests", icon: FiDollarSign, color: "orange" },
  { title: "Role Updates", description: "Review landlord/service owner requests", icon: FiUsers, color: "indigo" },
  { title: "Report Handling", description: "Check reported rooms/services", icon: FiBell, color: "red" }
];

const recentActivity = [
  { id: 1, message: "Nguyen Van A just registered a new account", type: "user", time: "5 min ago" },
  { id: 2, message: "Room ABC123 was reported by a user", type: "alert", time: "10 min ago" },
  { id: 3, message: "Le Thi B requested withdrawal of 500,000đ", type: "money", time: "15 min ago" },
  { id: 4, message: "Admin approved Room XYZ", type: "success", time: "20 min ago" },
  { id: 5, message: "New service registration pending review", type: "pending", time: "25 min ago" }
];

const Dashboard = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleDarkMode = () => setDarkMode(!darkMode);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className={`min-h-screen ${darkMode ? "dark bg-gradient-to-br from-gray-900 to-gray-800 text-white" : "bg-gradient-to-br from-blue-50 to-indigo-50"}`}>
      <aside className={`fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-blue-900 to-indigo-900 text-white shadow-xl transition-all duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">PropManager</h1>
          <nav className="space-y-3">
            <button onClick={() => setActiveSection("dashboard")} className={`flex items-center w-full p-4 rounded-lg transition-all duration-200 ${activeSection === "dashboard" ? "bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg" : "hover:bg-blue-800"}`}>
              <FiHome className="mr-3 text-xl" /> Dashboard
            </button>
            <button onClick={() => setActiveSection("properties")} className={`flex items-center w-full p-4 rounded-lg transition-all duration-200 ${activeSection === "properties" ? "bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg" : "hover:bg-blue-800"}`}>
              <FiList className="mr-3 text-xl" /> Properties
            </button>
            <button onClick={() => setActiveSection("tenants")} className={`flex items-center w-full p-4 rounded-lg transition-all duration-200 ${activeSection === "tenants" ? "bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg" : "hover:bg-blue-800"}`}>
              <FiUsers className="mr-3 text-xl" /> Tenants
            </button>
            <button onClick={() => setActiveSection("financial")} className={`flex items-center w-full p-4 rounded-lg transition-all duration-200 ${activeSection === "financial" ? "bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg" : "hover:bg-blue-800"}`}>
              <FiDollarSign className="mr-3 text-xl" /> Financial
            </button>
            <button onClick={() => setActiveSection("maintenance")} className={`flex items-center w-full p-4 rounded-lg transition-all duration-200 ${activeSection === "maintenance" ? "bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg" : "hover:bg-blue-800"}`}>
              <FiTool className="mr-3 text-xl" /> Maintenance
            </button>
            <button onClick={() => setActiveSection("settings")} className={`flex items-center w-full p-4 rounded-lg transition-all duration-200 ${activeSection === "settings" ? "bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg" : "hover:bg-blue-800"}`}>
              <FiSettings className="mr-3 text-xl" /> Settings
            </button>
          </nav>
        </div>
      </aside>

      <main className={`transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-0"}`}>
        <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-lg p-4">
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            <button onClick={toggleSidebar} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              <FiList className="text-xl" />
            </button>
            <div className="flex items-center space-x-4">
              <button onClick={toggleDarkMode} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                <FiMoon className="text-xl" />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                <FiBell className="text-xl" />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                <FiUser className="text-xl" />
              </button>
            </div>
          </div>
        </header>

        <div className="p-6 max-w-7xl mx-auto">
          {activeSection === "dashboard" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
                {kpiData.map((kpi, index) => (
                  <div key={index} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{kpi.title}</h3>
                        <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{kpi.value}</p>
                      </div>
                      <div className={`p-4 rounded-full bg-${kpi.color}-100 dark:bg-${kpi.color}-900/30`}>
                        <kpi.icon className={`text-${kpi.color}-500 text-2xl`} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
                  <h3 className="text-xl font-semibold mb-6">User Role Distribution</h3>
                  <PieChart width={400} height={300}>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#4299e1" label />
                    <Tooltip />
                  </PieChart>
                </div>
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
                  <h3 className="text-xl font-semibold mb-6">Monthly Room/Service Growth</h3>
                  <BarChart width={400} height={300} data={barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="occupancy" fill="#4299e1" />
                  </BarChart>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quickActions.map((action, index) => (
                  <div key={index} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-6 rounded-2xl shadow-xl hover:shadow-xl transition-shadow">
                    <div className="flex items-center mb-4">
                      <action.icon className={`text-${action.color}-500 text-2xl mr-3`} />
                      <h3 className="text-lg font-semibold">{action.title}</h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{action.description}</p>
                    <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                      Access
                    </button>
                  </div>
                ))}
              </div>

              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-6 rounded-2xl shadow-xl">
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center p-3 border-b dark:border-gray-700">
                      <div className={`w-2 h-2 rounded-full mr-3 ${
                        activity.type === "alert" ? "bg-red-500" :
                        activity.type === "money" ? "bg-yellow-500" :
                        activity.type === "success" ? "bg-green-500" :
                        "bg-blue-500"
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm">{activity.message}</p>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === "properties" && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4">Property Listings</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-700">
                      <th className="p-3 text-left">Property Name</th>
                      <th className="p-3 text-left">Address</th>
                      <th className="p-3 text-left">Type</th>
                      <th className="p-3 text-left">Status</th>
                      <th className="p-3 text-left">Monthly Income</th>
                    </tr>
                  </thead>
                  <tbody>
                    {propertyData.map((property) => (
                      <tr key={property.id} className="border-b dark:border-gray-700">
                        <td className="p-3">{property.name}</td>
                        <td className="p-3">{property.address}</td>
                        <td className="p-3">{property.type}</td>
                        <td className="p-3">{property.status}</td>
                        <td className="p-3">${property.income}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === "tenants" && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4">Tenant Management</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-700">
                      <th className="p-3 text-left">Name</th>
                      <th className="p-3 text-left">Contact</th>
                      <th className="p-3 text-left">Property</th>
                      <th className="p-3 text-left">Lease Duration</th>
                      <th className="p-3 text-left">Payment Status</th>
                      <th className="p-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tenantData.map((tenant) => (
                      <tr key={tenant.id} className="border-b dark:border-gray-700">
                        <td className="p-3">{tenant.name}</td>
                        <td className="p-3">{tenant.contact}</td>
                        <td className="p-3">{tenant.property}</td>
                        <td className="p-3">{tenant.lease}</td>
                        <td className="p-3">{tenant.status}</td>
                        <td className="p-3">
                          <button className="bg-blue-500 text-white px-3 py-1 rounded mr-2">View</button>
                          <button className="bg-green-500 text-white px-3 py-1 rounded">Contact</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === "maintenance" && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4">Maintenance Requests</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-700">
                      <th className="p-3 text-left">Property</th>
                      <th className="p-3 text-left">Issue</th>
                      <th className="p-3 text-left">Status</th>
                      <th className="p-3 text-left">Date</th>
                      <th className="p-3 text-left">Assigned To</th>
                    </tr>
                  </thead>
                  <tbody>
                    {maintenanceData.map((request) => (
                      <tr key={request.id} className="border-b dark:border-gray-700">
                        <td className="p-3">{request.property}</td>
                        <td className="p-3">{request.issue}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded ${request.status === "Pending" ? "bg-yellow-200 text-yellow-800" : "bg-blue-200 text-blue-800"}`}>
                            {request.status}
                          </span>
                        </td>
                        <td className="p-3">{request.date}</td>
                        <td className="p-3">{request.staff}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;