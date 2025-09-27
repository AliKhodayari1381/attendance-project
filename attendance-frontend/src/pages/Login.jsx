import { motion } from "framer-motion";
import { useState } from "react";
import { FaUserAlt, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import api from "../api/api";


export default function GlassLogin() {
  const [username, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await api.post("token/", { username, password });
      localStorage.setItem("access", response.data.access);
      localStorage.setItem("refresh", response.data.refresh); // به جای refresh_token
      window.location.href = "/dashboard";
    } catch (err) {
      setError("نام کاربری یا رمز عبور اشتباه است");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center relative overflow-hidden"
      style={{
        backgroundImage: `url("a.jpg")`,
      }}
    >
      <div className="absolute inset-0 bg-black/60"></div>


      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20, duration: 0.8 }}
        className="relative backdrop-blur-xl bg-black/20 border border-white/20 shadow-[0_8px_40px_rgba(0,150,255,0.15)] rounded-3xl p-12 w-full max-w-md"
        style={{
          boxShadow: "0 8px 40px 0 rgba(241, 150, 161, 0.64), 0 1.5px 8px 0 rgba(178, 182, 202, 0.79)",
        }}
      >
        <motion.h1
          initial={{ textShadow: "0 0 8px #000000ff, 0 0 15px #000000ff" }}
          animate={{
            color: ["#ffffffff", "#ffffffff", "#fceff4ff"], // رنگ‌های روشن و پررنگ
            textShadow: [
              "0 0 8px #f14ee0cc, 0 0 15px #fc36fccc",
              "0 0 10px #d322eeff, 0 0 20px #ee22d3ff",
              "0 0 8px #ff00ccff, 0 0 15px #ff00a2ff",
            ],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            repeatType: "loop",
          }}
          className="text-4xl font-extrabold text-center mb-10 tracking-tight"
        >
          ورود به سامانه
        </motion.h1>


        <form onSubmit={handleSubmit} className="space-y-7">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 120, delay: 0.3 }}
            className="relative"
          >

            <div className="flex items-center bg-black/40 rounded-xl px-4 py-3 h-12 shadow-inner border border-blue-400 focus-within:ring-2 focus-within:ring-blue-400 transition">
              <FaUserAlt className="text-blue-400 mr-3 text-lg" />
              <input
                type="text"
                value={username}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="نام کاربری خود را وارد کنید"
                className="w-full bg-transparent text-white placeholder-gray-400 focus:outline-none text-base h-full"
                autoFocus
              />
            </div>

          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 120, delay: 0.4 }}
            className="relative"
          >

            <div className="flex items-center bg-black/40 rounded-xl px-4 py-3 h-12 shadow-inner border border-blue-400 focus-within:ring-2 focus-within:ring-blue-400 transition">
              <FaLock className="text-blue-400 mr-3 text-lg" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="رمز عبور خود را وارد کنید"
                className="w-full bg-transparent text-white placeholder-gray-400 focus:outline-none text-base h-full"
              />
              <button
                type="button"
                tabIndex={-1}
                className="ml-2 text-gray-400 hover:text-blue-400 transition"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "مخفی کردن رمز" : "نمایش رمز"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

          </motion.div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 120 }}
              className="text-red-400 text-sm text-center font-semibold mt-2"
            >
              {error}
            </motion.p>
          )}

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 25, delay: 0.1 }} // سریعتر ورود
            whileHover={{
              scale: 1.05, // کمی بزرگتر برای حس بیشتر
              boxShadow: "0 0 20px #22d3ee, 0 0 40px #3b82f6, 0 0 60px #06b6d4", // نور واضح‌تر
              transition: { duration: 0.2, ease: "easeInOut" }, // سریع و روان
            }}
            whileTap={{ scale: 0.97, transition: { duration: 0.1 } }}
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl text-white font-bold shadow-lg transition text-lg flex items-center justify-center gap-2 
    bg-gradient-to-r from-green-800 via-green-700 to-cyan-800 border border-green-400`}
          >

            {loading ? (
              <span className="loader border-2 border-t-2 border-white border-t-cyan-400 rounded-full w-5 h-5 animate-spin"></span>
            ) : (
              "ورود"
            )}
          </motion.button>


        </form>
        {/* استایل لودر */}
        <style>{`
          .loader {
            border-width: 3px;
            border-style: solid;
            border-color: #fff #fff #fff #22d3ee;
            display: inline-block;
            vertical-align: middle;
          }
        `}</style>
      </motion.div>
    </div>
  );
}
