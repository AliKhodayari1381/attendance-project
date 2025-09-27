import { useEffect, useState } from "react";
import { Card, CardContent } from "../components/ui/Card.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Input } from "../components/ui/Input.jsx";
import { Edit, Trash2, Plus, Sun, Moon, User, Calendar, LogOut, Clock } from "lucide-react";
import { motion } from "framer-motion";
import Modal from "../components/ui/Modal.jsx";
import api from "../api/api";
import { Link } from "react-router-dom";

export default function EmployeesDashboardModern() {
  const [employees, setEmployees] = useState([]);
  const [selectedQR, setSelectedQR] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [formData, setFormData] = useState({
    نام: "",
    "نام خانوادگی": "",
    "کد کارمندی": "",
  });

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [darkMode, setDarkMode] = useState(false);

  const token = localStorage.getItem("access");

  // Dark mode from localStorage
  useEffect(() => {
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

  const fetchEmployees = async () => {
    if (!token) {
      setErrorMessage("توکن موجود نیست. لطفاً وارد شوید.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/employees/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("خطا در دریافت لیست پرسنل");
      const data = await res.json();
      setEmployees(data);
      setFiltered(data);
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || "مشکلی پیش آمد");
      setTimeout(() => setErrorMessage(""), 4000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    const filteredData = employees.filter(
      (emp) =>
        emp["نام"].toLowerCase().includes(search.toLowerCase()) ||
        emp["نام خانوادگی"].toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(filteredData);
  }, [search, employees]);

  const openAddModal = () => {
    setModalType("add");
    setFormData({ نام: "", "نام خانوادگی": "", "کد کارمندی": "" });
    setShowModal(true);
  };

  const openEditModal = (emp) => {
    setModalType("edit");
    setSelectedEmployee(emp);
    setFormData({
      نام: emp["نام"],
      "نام خانوادگی": emp["نام خانوادگی"],
      "کد کارمندی": emp["کد کارمندی"],
    });
    setShowModal(true);
  };

  const handleDelete = async (empId) => {
    if (!confirm("آیا از حذف این پرسنل مطمئن هستید؟")) return;
    try {
      const res = await api.delete(`employees/${empId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 204 || res.status === 200) {
        setSuccessMessage("پرسنل با موفقیت حذف شد ✅");
      } else {
        throw new Error("خطا در حذف پرسنل");
      }
      fetchEmployees();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error(err);
      setErrorMessage("خطا در حذف پرسنل");
      setTimeout(() => setErrorMessage(""), 4000);
    }
  };

  const preparePayload = (form) => ({
    first_name: form["نام"],
    last_name: form["نام خانوادگی"],
    employee_id: form["کد کارمندی"],
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === "add") {
        const res = await api.post("employees/", preparePayload(formData), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 201 || res.status === 200) {
          setSuccessMessage("پرسنل با موفقیت اضافه شد ✅");
        } else {
          throw new Error("خطا در اضافه کردن پرسنل");
        }
      } else if (modalType === "edit" && selectedEmployee) {
        const res = await api.put(
          `employees/${selectedEmployee.id}/`,
          preparePayload(formData),
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.status === 200) {
          setSuccessMessage("اطلاعات پرسنل با موفقیت ویرایش شد ✅");
        } else {
          throw new Error("خطا در ویرایش پرسنل");
        }
      }
      setShowModal(false);
      fetchEmployees();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error(err);
      setErrorMessage("خطا در ذخیره اطلاعات پرسنل");
      setTimeout(() => setErrorMessage(""), 4000);
    }
  };

  const highlightText = (text) => {
    if (!search) return text;
    const regex = new RegExp(`(${search})`, "gi");
    return text.split(regex).map((part, i) =>
      regex.test(part) ? (
        <span
          key={i}
          className="bg-yellow-200 dark:bg-yellow-400 text-black px-1 rounded"
        >
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  if (loading)
    return (
      <p className="text-gray-600 dark:text-gray-200 text-center mt-20">
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
        className="w-64 bg-white/20 dark:bg-gray-800 backdrop-blur-xl p-6 flex flex-col justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold mb-8">
            <Link to="/dashboard" className="hover:underline">
              داشبورد
            </Link>
          </h1>
          <ul className="space-y-4">
            <li className="flex items-center space-x-2 rtl:space-x-reverse text-yellow-400">
              <User className="w-5 h-5" />
              <Link to="/dashboard/employees" className="hover:underline">
                پرسنل
              </Link>
            </li>
            <li className="flex items-center space-x-2 rtl:space-x-reverse hover:text-yellow-500">
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
          <LogOut className="w-4 h-4" />
          خروج
        </Button>
      </motion.aside>

      {/* Main content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Toasts */}
        {successMessage && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-[9999]">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-[9999]">
            {errorMessage}
          </div>
        )}

        {/* Header & Search */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-row-reverse justify-between items-center">
            <h1 className="text-2xl md:text-3xl font-bold text-blue-700 dark:text-blue-400">
              مدیریت پرسنل
            </h1>
            <div className="flex items-center gap-2">
              <Button
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow transition"
                onClick={openAddModal}
              >
                <Plus className="w-4 h-4" />
                اضافه کردن پرسنل
              </Button>
              <Button
                className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 p-2 rounded-md"
                onClick={() => setDarkMode(!darkMode)}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          <Input
            placeholder="جستجو بر اساس نام یا نام خانوادگی..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-gray-700 dark:text-gray-100 border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-800 rounded-md"
          />
        </div>

        {/* Table */}
        <Card className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-x-auto">
          <CardContent className="p-4 min-w-[700px]" dir="rtl">
            <table className="w-full text-sm text-gray-700 dark:text-gray-200" dir="rtl">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-2 text-center">نام</th>
                  <th className="px-4 py-2 text-center">نام خانوادگی</th>
                  <th className="px-4 py-2 text-center">کد کارمندی</th>
                  <th className="px-4 py-2 text-center">QR-code</th>
                  <th className="px-4 py-2 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((emp) => (
                  <tr
                    key={emp.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-2 text-center">{highlightText(emp["نام"])}</td>
                    <td className="px-4 py-2 text-center">{highlightText(emp["نام خانوادگی"])}</td>
                    <td className="px-4 py-2 text-center">{highlightText(emp["کد کارمندی"])}</td>
                    <td className="px-4 py-2 text-center">
                      {emp["QR-code"] ? (
                        <img
                          src={emp["QR-code"]}
                          alt="QR Code"
                          className="w-16 h-16 mx-auto object-contain cursor-pointer hover:scale-110 transition-transform"
                          onClick={() => {
                            setSelectedQR(emp["QR-code"]);
                            setShowQRModal(true);
                          }}
                        />
                      ) : (
                        <span className="text-gray-400">ندارد</span>
                      )}
                    </td>

                    <td className="px-4 py-2 flex justify-center gap-2">
                      <Button
                        className="bg-yellow-400 hover:bg-yellow-500 text-white p-1 rounded shadow"
                        onClick={() => openEditModal(emp)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        className="bg-red-500 hover:bg-red-600 text-white p-1 rounded shadow"
                        onClick={() => handleDelete(emp.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
        {/* QR Modal */}
        {showQRModal && selectedQR && (
          <Modal onClose={() => setShowQRModal(false)} title="QR مشاهده کد">
            <div className="flex flex-col items-center gap-4">
              <img
                src={selectedQR}
                alt="QR Code"
                className="w-full max-w-xs h-auto rounded shadow"
              />
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  fetch(selectedQR)
                    .then((res) => res.blob())
                    .then((blob) => {
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "qr-code.png"; // نام فایل دانلودی
                      document.body.appendChild(a);
                      a.click();
                      a.remove();
                      window.URL.revokeObjectURL(url);
                    })
                    .catch((err) => console.error("خطا در دانلود QR:", err));
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
              >
                دانلود تصویر
              </a>

            </div>
          </Modal>
        )}

        {/* Modal Add/Edit */}
        {showModal && (
          <Modal
            onClose={() => setShowModal(false)}
            title={modalType === "add" ? "اضافه کردن پرسنل" : "ویرایش پرسنل"}
          >
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                placeholder="نام"
                value={formData["نام"]}
                onChange={(e) =>
                  setFormData({ ...formData, نام: e.target.value })
                }
                className="border-2 border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-100 rounded-md focus:border-blue-500 focus:ring-blue-500"
              />
              <Input
                placeholder="نام خانوادگی"
                value={formData["نام خانوادگی"]}
                onChange={(e) =>
                  setFormData({ ...formData, "نام خانوادگی": e.target.value })
                }
                className="border-2 border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-100 rounded-md focus:border-blue-500 focus:ring-blue-500"
              />
              <Input
                placeholder="کد کارمندی"
                value={formData["کد کارمندی"]}
                onChange={(e) =>
                  setFormData({ ...formData, "کد کارمندی": e.target.value })
                }
                className="border-2 border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-100 rounded-md focus:border-blue-500 focus:ring-blue-500"
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  className="bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 px-4 py-2 rounded"
                  onClick={() => setShowModal(false)}
                >
                  انصراف
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                  ذخیره
                </Button>
              </div>
            </form>
          </Modal>

        )}
      </div>
    </div>
  );
}
