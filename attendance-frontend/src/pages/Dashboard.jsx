import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "../components/ui/Card.jsx";
import { Button } from "../components/ui/Button.jsx";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { User, LogOut, Calendar, Clock, Sun, Moon } from "lucide-react";
import { Link } from "react-router-dom";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const lateValue = payload[0]?.value || 0;
    const user = payload[0]?.payload?.کاربر || "نامشخص";
    const status = payload[0]?.payload?.وضعیت || "نامشخص";
    return (
      <div
        style={{
          background: "white",
          color: "black",
          padding: "10px",
          borderRadius: "8px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
        }}
      >
        <p>کاربر: {user}</p>
        <p>تاریخ: {label.split(" (")[0]}</p>
        <p>دیرکرد: {lateValue} دقیقه</p>
        <p>وضعیت: {status}</p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    const fetchData = async () => {
      try {
        const userRes = await fetch("/api/employees/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (userRes.status === 401) {
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          window.location.href = "/login";
          return;
        }

        const userData = await userRes.json();
        setUser(userData[0] || null);

        const attRes = await fetch("/api/attendance/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!attRes.ok) throw new Error("Failed to fetch attendance");
        const attData = await attRes.json();
        setAttendance(attData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // حالت تاریک ذخیره شده
    const saved = localStorage.getItem("darkMode");
    if (saved === "true") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const chartData = attendance.length > 0
    ? attendance.map((item) => {
      const lateNumber = parseInt(item["دیر کرد"] || "0");
      return {
        تاریخ: `${item["تاریخ"]} (${item["کاربر"]})`,
        دیرکرد: isNaN(lateNumber) ? 0 : lateNumber,
        کاربر: item["کاربر"],
        وضعیت: item["وضعیت"] || "نامشخص",
      };
    })
    : [{ تاریخ: "بدون داده", دیرکرد: 0, کاربر: "-", وضعیت: "-" }];


  const totalLate = chartData.reduce((sum, item) => sum + item.دیرکرد, 0);

  if (loading || chartData.length === 0) {
    return <p className="text-gray-800 dark:text-gray-100 text-center mt-20">در حال بارگذاری یا داده‌ای موجود نیست...</p>;
  }

  return (
    <div className={`${darkMode ? "dark" : ""} flex h-screen transition-colors`}>
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -200, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className={`w-64 p-6 flex flex-col justify-between ${darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-800"} shadow-lg`}
      >
        <div>
          <li className="flex items-center space-x-2 rtl:space-x-reverse text-yellow-400"></li>
          <h1 className="text-2xl font-bold mb-8">داشبورد</h1>
          <ul className="space-y-4">
            <li className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer hover:text-yellow-500">
              <User className="w-5 h-5" />
              <Link to="/dashboard/employees" className="hover:underline">
                پرسنل
              </Link>
            </li>
            <li className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer hover:text-yellow-500">
              <Calendar className="w-5 h-5" />
              <Link to="/dashboard/attendace" className="hover:underline">
                حضور و غیاب
              </Link>
            </li>
            <li className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer hover:text-yellow-500">
              <Clock className="w-5 h-5" />
              <Link to="/dashboard/workschedule" className="hover:underline">
                ساعت های کاری
              </Link>
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-2">
          <Button
            onClick={() => setDarkMode(!darkMode)}
            className={`flex items-center gap-2 justify-center ${darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-yellow-400 hover:bg-yellow-500"} text-white px-4 py-2 rounded`}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            {darkMode ? "حالت روشن" : "حالت تاریک"}
          </Button>
          <Button
            onClick={() => {
              localStorage.removeItem("access");
              localStorage.removeItem("refresh");
              window.location.href = "/login";
            }}
            className="flex items-center space-x-2 rtl:space-x-reverse bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded mt-4"
          >
            <LogOut className="w-4 h-4" />
            خروج
          </Button>
        </div>
      </motion.aside>

      {/* Main */}
      <main className={`${darkMode ? "bg-gray-800 text-white" : "bg-gray-50 text-gray-900"} flex-1 p-8 overflow-y-auto transition-colors`} dir="rtl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold">
            خوش آمدید 👋
          </h2>
          <p className="text-lg mt-2">{`وضعیت امروز شما`}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className={`${darkMode ? "bg-gray-700/40 text-white" : "bg-white/40 text-gray-900"} shadow-xl rounded-2xl`}>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-2">تعداد حضور</h3>
              <p className="text-3xl">{attendance.length}</p>
            </CardContent>
          </Card>

          <Card className={`${darkMode ? "bg-gray-700/40 text-white" : "bg-white/40 text-gray-900"} shadow-xl rounded-2xl`}>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-2">دیرکردها</h3>
              <p className="text-3xl">{totalLate} دقیقه</p>
            </CardContent>
          </Card>

          <Card className={`${darkMode ? "bg-gray-700/40 text-white" : "bg-white/40 text-gray-900"} shadow-xl rounded-2xl`}>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-2">تاریخ امروز</h3>
              <p className="text-3xl">{new Date().toLocaleDateString("fa-IR")}</p>
            </CardContent>
          </Card>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          className={`${darkMode ? "bg-gray-700/40" : "bg-white/40"} mt-10 rounded-2xl p-6 shadow-lg`}
        >
          <h3 className="text-xl font-semibold mb-4">گزارش دیرکرد</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#facc15" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.7} />
                </linearGradient>
              </defs>
              <XAxis dataKey="تاریخ" stroke={darkMode ? "#fff" : "#333"} tick={{ fontSize: 12 }} />
              <YAxis stroke={darkMode ? "#fff" : "#333"} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="دیرکرد" fill="url(#gradient)" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-center mt-4 text-gray-500 dark:text-gray-300">
            {attendance.length === 0 ? "هیچ رکوردی موجود نیست" : ""}
          </p>
        </motion.div>
      </main>
    </div>
  );
}
