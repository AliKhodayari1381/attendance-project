import React from 'react';
import { motion } from 'framer-motion';

const Navbar = () => (
  <motion.nav
    initial={{ y: -50 }}
    animate={{ y: 0 }}
    className="bg-white shadow-md p-4 flex justify-between items-center"
  >
    <h1 className="text-xl font-bold text-indigo-600">داشبورد</h1>
    <button
      onClick={() => {
        localStorage.removeItem('token');
        window.location.reload();
      }}
      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
    >
      خروج
    </button>
  </motion.nav>
);

export default Navbar;
