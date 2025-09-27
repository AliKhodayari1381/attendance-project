import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "../components/ui/Card.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Input } from "../components/ui/Input.jsx";
import { Edit, Trash2, User, Calendar, LogOut, Sun, Moon,Clock } from "lucide-react";
import { Link } from "react-router-dom";
import Select from "react-select";
import Modal from "../components/ui/Modal.jsx";
import api from "../api/api";
import jdatetime from "jalaali-js";
import DatePicker, { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/jalali";
import persian_fa from "react-date-object/locales/persian_fa";

export default function AttendanceDashboard() {
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [filterJalaliDate, setFilterJalaliDate] = useState(null);
  const [filterUser, setFilterUser] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);

  const token = localStorage.getItem("access");
  const statusMap = { حاضر: "present", غایب: "absent", دیرکرد: "late" };

  // فرمت تاریخ شمسی برای نمایش
  const formatJalaliDate = (jalaliDate) => {
    if (!jalaliDate || !jalaliDate.year) return "انتخاب تاریخ";
    return `${jalaliDate.year}/${jalaliDate.month.toString().padStart(2, '0')}/${jalaliDate.day.toString().padStart(2, '0')}`;
  };

  // تبدیل DateObject به فرمت {jy, jm, jd} برای API
  const getJalaliDateForAPI = (dateObject) => {
    if (!dateObject || !dateObject.year) return null;
    return {
      jy: dateObject.year,
      jm: dateObject.month,
      jd: dateObject.day
    };
  };

  // تنظیم تاریخ پیش‌فرض (امروز)
  const getTodayJalali = () => {
    const today = new Date();
    const jalali = jdatetime.toJalaali(today);
    return new DateObject({
      year: jalali.jy,
      month: jalali.jm,
      day: jalali.jd,
      calendar: persian
    });
  };

  // Fetch Attendance
  const fetchAttendance = async (jalaliDateParam = null) => {
    try {
      setLoading(true);
      let url = "/api/attendance/";

      if (jalaliDateParam && jalaliDateParam.year) {
        const apiDate = getJalaliDateForAPI(jalaliDateParam);
        if (apiDate) {
          url += `?date=${apiDate.jy}-${apiDate.jm.toString().padStart(2, '0')}-${apiDate.jd.toString().padStart(2, '0')}`;
        }
      }

      console.log("Fetching attendance with URL:", url); // Debug log

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("خطا در دریافت داده‌های حضور و غیاب");
      const data = await res.json();
      const formattedData = data.map((a) => ({
        ...a,
        late_minutes: parseInt(a["دیر کرد"]) || 0,
      }));
      setAttendance(formattedData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Employees
  const fetchEmployees = async () => {
    try {
      const res = await fetch("/api/employees/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("خطا در دریافت لیست پرسنل");
      const empData = await res.json();
      setEmployees(
        empData.map((e) => ({
          value: e.id,
          label: `${e["نام"]} ${e["نام خانوادگی"]}`.trim() || `کارمند ${e.id}`,
        }))
      );
    } catch (err) {
      console.error(err);
    }
  };

  // Initial Load
  useEffect(() => {
    if (!token) window.location.href = "/login";

    // تنظیم تاریخ پیش‌فرض به امروز
    const todayJalali = getTodayJalali();
    setFilterJalaliDate(todayJalali);

    fetchAttendance(todayJalali);
    fetchEmployees();

    const saved = localStorage.getItem("darkMode");
    setDarkMode(saved === "true");
    document.documentElement.classList.toggle("dark", saved === "true");
  }, [token]);

  // Refetch on date change
  useEffect(() => {
    if (filterJalaliDate) {
      fetchAttendance(filterJalaliDate);
    }
  }, [filterJalaliDate]);

  // Patch Attendance
  const handlePatch = async () => {
    if (!editItem || !editItem["کاربر_ایدی"]) return alert("کاربر معتبر نیست!");
    try {
      const body = {
        employee: editItem["کاربر_ایدی"],
        status: statusMap[editItem["وضعیت"]],
        check_in_time: editItem["ثبت شده در"] || null,
        late_minutes: editItem.late_minutes || 0,
      };
      const res = await api.patch(`attendance/${editItem.id}/`, body, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 200) {
        setAttendance((prev) =>
          prev.map((a) =>
            a.id === editItem.id
              ? { ...a, ...editItem, "دیر کرد": `${editItem.late_minutes} ` }
              : a
          )
        );
        setEditModalOpen(false);
      }
    } catch (err) {
      console.error(err);
      alert("خطا در ذخیره تغییرات!");
    }
  };

  // Delete Attendance
  const handleDelete = async (id) => {
    if (!confirm("آیا مطمئن هستید حذف شود؟")) return;
    try {
      const res = await api.delete(`attendance/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 204) setAttendance((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error(err);
      alert("خطا در حذف رکورد!");
    }
  };

  // Export Excel
  const handleExport = async () => {
    try {
      let url = "/api/attendance/export-excel/";
      if (filterJalaliDate && filterJalaliDate.year) {
        const apiDate = getJalaliDateForAPI(filterJalaliDate);
        if (apiDate) {
          url += `?date=${apiDate.jy}-${apiDate.jm.toString().padStart(2, '0')}-${apiDate.jd.toString().padStart(2, '0')}`;
        }
      }
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("خطا در دریافت فایل اکسل");
      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `attendance.xlsx`;
      link.click();
    } catch (err) {
      console.error(err);
      alert("خطا در دریافت فایل اکسل!");
    }
  };

  // Filtered Attendance
  const filteredAttendance = attendance.filter((a) => {
    const matchUser = filterUser ? a["کاربر_ایدی"] === filterUser.value : true;
    const matchStatus = filterStatus ? a["وضعیت"] === filterStatus.value : true;
    return matchUser && matchStatus;
  });

  const selectTheme = (theme) => ({
    ...theme,
    colors: {
      ...theme.colors,
      primary25: darkMode ? "#444" : "#ddd",
      primary: darkMode ? "#1e40af" : "#2563eb",
      neutral0: darkMode ? "#1f2937" : "#fff",
      neutral80: darkMode ? "#fff" : "#000",
    },
  });

  // هندل کردن تغییر تاریخ با تصحیح timezone
  const handleDateChange = (date) => {
    console.log("Date selected:", date); // Debug log

    if (date) {
      // تصحیح timezone - تنظیم ساعت به 12:00 ظهر برای جلوگیری از خطای timezone
      const correctedDate = new DateObject({
        year: date.year,
        month: date.month,
        day: date.day,
        hour: 12, // ساعت 12 ظهر
        minute: 0,
        second: 0,
        millisecond: 0,
        calendar: persian
      });

      console.log("Corrected date:", correctedDate); // Debug log
      setFilterJalaliDate(correctedDate);
    } else {
      setFilterJalaliDate(null);
    }
  };

  // پاک کردن فیلتر تاریخ
  const clearDateFilter = () => {
    setFilterJalaliDate(null);
  };

  if (loading) return <p className="text-center mt-20">در حال بارگذاری...</p>;

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors">
      <motion.aside
        initial={{ x: -200, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="w-64 bg-white/20 dark:bg-gray-800 backdrop-blur-xl p-6 flex flex-col justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold mb-8">
            <Link to="/dashboard" className="hover:underline">داشبورد</Link>
          </h1>
          <ul className="space-y-4">
            <li className="flex items-center space-x-2 rtl:space-x-reverse hover:text-yellow-500">
              <User className="w-5 h-5" />
              <Link to="/dashboard/employees" className="hover:underline">پرسنل</Link>
            </li>
            <li className="flex items-center space-x-2 rtl:space-x-reverse text-yellow-400">
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
        <Button
          onClick={() => {
            localStorage.removeItem("access");
            localStorage.removeItem("refresh");
            window.location.href = "/login";
          }}
          className="flex items-center space-x-2 rtl:space-x-reverse bg-red-500 hover:bg-red-600"
        >
          <LogOut className="w-4 h-4" /> خروج
        </Button>
      </motion.aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="mb-6 flex justify-between items-center" dir="rtl">
          <h1 className="text-2xl md:text-3xl font-bold text-blue-700 dark:text-blue-400">حضور و غیاب </h1>
          <div className="flex gap-2" dir="ltr">
            <Button onClick={handleExport} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md">خروجی اکسل</Button>
            <Button onClick={() => {
              setDarkMode(!darkMode);
              localStorage.setItem("darkMode", !darkMode);
              document.documentElement.classList.toggle("dark", !darkMode);
            }} className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-md">
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-4" dir="rtl">
          <Select
            options={employees}
            value={filterUser}
            onChange={setFilterUser}
            placeholder="فیلتر بر اساس کاربر"
            isClearable
            theme={selectTheme}
            className="w-64"
          />
          <Select
            options={[...new Set(attendance.map((a) => a["وضعیت"]))].map(v => ({ value: v, label: v }))}
            value={filterStatus}
            onChange={setFilterStatus}
            placeholder="فیلتر بر اساس وضعیت"
            isClearable
            theme={selectTheme}
            className="w-64"
          />

          {/* DatePicker با تنظیمات تصحیح شده */}
          <div className="w-full sm:w-64 relative">
            <DatePicker
              value={filterJalaliDate}
              onChange={setFilterJalaliDate}
              calendar={persian}
              locale={persian_fa}
              calendarPosition="bottom-right"
              placeholder="فیلتر بر اساس تاریخ"
              style={{
                background: darkMode ? "#37415183" : "#ffffff",
                color: darkMode ? "#f9fafb" : "#111827",
                border: `1.5px solid ${darkMode ? "#ffffff71" : "#c9cacdda"}`,
                borderRadius: "0.2.3rem",
                padding: "1.1rem 0.55rem",
                width: "100%",
                direction: "rtl",
                fontSize: "1.5rem",
              }}
            />

            {/* دکمه پاک کردن */}
            {filterJalaliDate && (
              <button
                onClick={clearDateFilter}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                title="پاک کردن تاریخ"
              >
                ×
              </button>
            )}

            
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10" dir="rtl">
          <Card className="bg-white/20 dark:bg-gray-700 rounded-2xl shadow-xl">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-2">تعداد رکوردها</h3>
              <p className="text-3xl">{filteredAttendance.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/20 dark:bg-gray-700 rounded-2xl shadow-xl">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-2">مجموع دیرکرد</h3>
              <p className="text-3xl">{filteredAttendance.reduce((sum, i) => sum + (i.late_minutes || 0), 0)} دقیقه</p>
            </CardContent>
          </Card>
          <Card className="bg-white/20 dark:bg-gray-700 rounded-2xl shadow-xl">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-2">تاریخ امروز</h3>
              <p className="text-3xl">{new Date().toLocaleDateString("fa-IR")}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/20 dark:bg-gray-700 rounded-2xl shadow-lg overflow-x-auto">
          <CardContent className="p-4 min-w-[700px]">
            <table className="w-full text-sm text-gray-700 dark:text-gray-200" dir="rtl">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-600">
                  <th className="px-4 py-2 text-center">کاربر</th>
                  <th className="px-4 py-2 text-center">کد کارمندی</th>
                  <th className="px-4 py-2 text-center">تاریخ</th>
                  <th className="px-4 py-2 text-center">ساعت ثبت</th>
                  <th className="px-4 py-2 text-center">وضعیت</th>
                  <th className="px-4 py-2 text-center">دیرکرد</th>
                  <th className="px-4 py-2 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendance.length > 0 ? (
                  filteredAttendance.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-4 py-2 text-center">{item["کاربر"]}</td>
                      <td className="px-4 py-2 text-center">{item["کد کارمندی"]}</td>
                      <td className="px-4 py-2 text-center">{item["تاریخ"]}</td>
                      <td className="px-4 py-2 text-center">{item["ثبت شده در"] || "-"}</td>
                      <td className="px-4 py-2 text-center">{item["وضعیت"]}</td>
                      <td className="px-4 py-2 text-center" dir="rtl">{item["دیر کرد"]} دقیقه</td>
                      <td className="px-4 py-2 flex justify-center gap-2">
                        <Button className="bg-yellow-400 hover:bg-yellow-500 text-white p-1 rounded shadow"
                          onClick={() => { setEditItem({ ...item }); setEditModalOpen(true); }}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button className="bg-red-500 hover:bg-red-600 text-white p-1 rounded shadow"
                          onClick={() => handleDelete(item.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      {filterJalaliDate ? `هیچ رکوردی برای ${formatJalaliDate(filterJalaliDate)} یافت نشد` : "هیچ رکوردی یافت نشد"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {editModalOpen && editItem && (
          <Modal onClose={() => setEditModalOpen(false)} title="ویرایش رکورد">
            <div className="flex flex-col gap-4">
              <Select
                options={employees}
                value={employees.find((e) => e.value === editItem["کاربر_ایدی"]) || { value: editItem["کاربر_ایدی"], label: editItem["کاربر"] }}
                onChange={(val) => setEditItem({ ...editItem, "کاربر_ایدی": val?.value, "کاربر": val?.label })}
                theme={selectTheme}
                isClearable
                placeholder="انتخاب کاربر"
              />
              <Select
                options={[{ value: "حاضر", label: "حاضر" }, { value: "غایب", label: "غایب" }, { value: "دیرکرد", label: "دیرکرد" }]}
                value={{ value: editItem["وضعیت"], label: editItem["وضعیت"] }}
                onChange={(val) => setEditItem({ ...editItem, "وضعیت": val?.value })}
                theme={selectTheme}
                isClearable
                placeholder="انتخاب وضعیت"
              />
              <Input type="text" placeholder="ساعت ثبت (مثال: 09:30)" value={editItem["ثبت شده در"] || ""}
                onChange={(e) => setEditItem({ ...editItem, "ثبت شده در": e.target.value })} />
              <Input type="number" placeholder="دیرکرد (دقیقه)" value={editItem.late_minutes || ""}
                onChange={(e) => setEditItem({ ...editItem, late_minutes: parseInt(e.target.value) || 0, "دیر کرد": `${parseInt(e.target.value) || 0} دقیقه` })} />
              <div className="flex justify-end gap-2">
                <Button onClick={() => setEditModalOpen(false)} className="bg-gray-300 dark:bg-gray-600 px-4 py-2 rounded">انصراف</Button>
                <Button onClick={handlePatch} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">ذخیره</Button>
              </div>
            </div>
          </Modal>
        )}
      </main>
    </div>
  );
}
