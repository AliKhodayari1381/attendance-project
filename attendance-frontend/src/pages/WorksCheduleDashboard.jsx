import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "../components/ui/Card.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Input } from "../components/ui/Input.jsx";
import InputMask from "react-input-mask";
import { Edit, LogOut, Sun, Moon, User, Calendar, Clock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Modal from "../components/ui/Modal.jsx";
import api from "../api/api";

export default function WorkScheduleDashboard() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem("access");

  // چون api.js بیس '/api/' دارد:
  const baseURL = "works-chedule/";

  // مدیریت دارک مود
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  // دریافت برنامه کاری
  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const res = await api.get(baseURL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSchedules(res.data);
    } catch (err) {
      console.error("خطا در دریافت برنامه کاری:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) navigate("/");
    fetchSchedules();
  }, [token]);

  // ویرایش رکورد
  const handlePatch = async () => {
    if (!editItem || !editItem.id) return alert("رکورد نامعتبر است!");
    try {
      const body = {
        start_time: editItem.start_time || editItem["ساعت شروع"],
        end_time: editItem.end_time || editItem["ساعت پایان"],
      };
      const res = await api.patch(`${baseURL}${editItem.id}/`, body, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 200) {
        setSchedules((prev) =>
        prev.map((s) =>
        s.id === editItem.id
        ? {
          ...s,
          start_time: body.start_time,
          end_time: body.end_time,
          "ساعت شروع": body.start_time,
          "ساعت پایان": body.end_time,
        }
        : s
        )
        );
        setEditModalOpen(false);
      }
    } catch (err) {
      console.error(err);
      alert("خطا در ذخیره تغییرات!");
    }
  };

  if (loading)
    return (
      <p className="text-center mt-20 text-gray-700 dark:text-gray-200">
      در حال بارگذاری...
      </p>
    );

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors">
    {/* Sidebar */}
    <motion.aside
    initial={{ x: -200, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    transition={{ duration: 0.8 }}
    className="w-64 bg-white dark:bg-gray-800 p-6 flex flex-col justify-between shadow-lg"
    >
    <div>
    <h1 className="text-2xl font-bold mb-8">
    <Link to="/dashboard" className="hover:underline">
    داشبورد
    </Link>
    </h1>
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
    <li className="flex items-center space-x-2 rtl:space-x-reverse text-yellow-400">
    <Clock className="w-5 h-5" />
    <Link to="/dashboard/workschedule" className="hover:underline">
    ساعت های کاری
    </Link>
    </li>
    </ul>
    </div>
    <Button
    onClick={() => {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      navigate("/login");
    }}
    className="flex items-center space-x-2 rtl:space-x-reverse bg-red-500 hover:bg-red-600"
    >
    <LogOut className="w-4 h-4" /> خروج
    </Button>
    </motion.aside>

    {/* Main content */}
    <main className="flex-1 p-8 overflow-y-auto">
    <div className="mb-6 flex justify-between items-center" dir="rtl">
    <h1 className="text-2xl md:text-3xl font-bold text-blue-700 dark:text-blue-400">
    ساعت کاری
    </h1>
    <div className="flex gap-2" dir="ltr">
    <Button
    onClick={() => setDarkMode((prev) => !prev)}
    className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-md"
    >
    {darkMode ? (
      <Sun className="w-5 h-5" />
    ) : (
      <Moon className="w-5 h-5" />
    )}
    </Button>
    </div>
    </div>

    <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-x-auto">
    <CardContent className="p-4 min-w-[500px]">
    <table
    className="w-full text-sm text-gray-700 dark:text-gray-200"
    dir="rtl"
    >
    <thead>
    <tr className="border-b border-gray-200 dark:border-gray-700">
    <th className="px-4 py-2 text-center">ساعت شروع</th>
    <th className="px-4 py-2 text-center">ساعت پایان</th>
    <th className="px-4 py-2 text-center">عملیات</th>
    </tr>
    </thead>
    <tbody>
    {schedules.length > 0 ? (
      schedules.map((item) => (
        <tr
        key={item.id}
        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
        <td className="px-4 py-2 text-center">
        {item["ساعت شروع"]}
        </td>
        <td className="px-4 py-2 text-center">
        {item["ساعت پایان"]}
        </td>
        <td className="px-4 py-2 flex justify-center gap-2">
        <Button
        className="bg-yellow-400 hover:bg-yellow-500 text-white p-1 rounded shadow"
        onClick={() => {
          setEditItem({ ...item });
          setEditModalOpen(true);
        }}
        >
        <Edit className="w-4 h-4" />
        </Button>
        </td>
        </tr>
      ))
    ) : (
      <tr>
      <td
      colSpan={3}
      className="px-4 py-8 text-center text-gray-500 dark:text-gray-300"
      >
      هیچ رکوردی یافت نشد
      </td>
      </tr>
    )}
    </tbody>
    </table>
    </CardContent>
    </Card>

    {/* Modal */}
    {editModalOpen && editItem && (
      <Modal onClose={() => setEditModalOpen(false)} title="ویرایش رکورد">
      <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
      <label
      className="text-sm text-gray-600 dark:text-gray-300"
      dir="rtl"
      >
      ساعت شروع
      </label>
      <div className="flex items-center gap-2">
      <Clock className="w-5 h-5 text-gray-500" />
      <InputMask
      mask="99:99"
      value={
        editItem.start_time || editItem["ساعت شروع"] || ""
      }
      onChange={(e) =>
        setEditItem({
          ...editItem,
          start_time: e.target.value,
          "ساعت شروع": e.target.value,
        })
      }
      >
      {(inputProps) => (
        <input
        {...inputProps}
        type="text"
        className="border p-2 rounded w-full dark:bg-gray-700 dark:text-white text-center"
        placeholder="hh:mm"
        />
      )}
      </InputMask>
      </div>
      </div>

      <div className="flex flex-col gap-1">
      <label
      className="text-sm text-gray-600 dark:text-gray-300"
      dir="rtl"
      >
      ساعت پایان
      </label>
      <div className="flex items-center gap-2">
      <Clock className="w-5 h-5 text-gray-500" />
      <InputMask
      mask="99:99"
      value={
        editItem.end_time || editItem["ساعت پایان"] || ""
      }
      onChange={(e) =>
        setEditItem({
          ...editItem,
          end_time: e.target.value,
          "ساعت پایان": e.target.value,
        })
      }
      >
      {(inputProps) => (
        <input
        {...inputProps}
        type="text"
        className="border p-2 rounded w-full dark:bg-gray-700 dark:text-white text-center"
        placeholder="hh:mm"
        />
      )}
      </InputMask>
      </div>
      </div>

      <div className="flex justify-end gap-2 mt-4">
      <Button
      onClick={() => setEditModalOpen(false)}
      className="bg-gray-300 dark:bg-gray-600 px-4 py-2 rounded"
      >
      انصراف
      </Button>
      <Button
      onClick={handlePatch}
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
      ذخیره
      </Button>
      </div>
      </div>
      </Modal>
    )}
    </main>
    </div>
  );
}
