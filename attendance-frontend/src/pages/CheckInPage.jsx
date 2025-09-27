import React, { useState, useRef, useEffect } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";
import {
  Camera,
  UserCheck,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle
} from "lucide-react";

const ZXingScanner = ({ onScan, active, onClose }) => {
  const videoRef = useRef(null);
  const [error, setError] = useState(null);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (!active) return;
    const codeReader = new BrowserMultiFormatReader();

    codeReader
      .listVideoInputDevices()
      .then((videoInputDevices) => {
        if (videoInputDevices.length === 0) {
          setError("دوربینی یافت نشد. لطفاً دوربین را متصل کنید.");
          return;
        }

        const selectedDeviceId =
          videoInputDevices.find((device) =>
            device.label.toLowerCase().includes("back")
          )?.deviceId || videoInputDevices[0].deviceId;

        codeReader.decodeFromVideoDevice(
          selectedDeviceId,
          videoRef.current,
          (result) => {
            if (result) {
              setFlash(true);
              setTimeout(() => setFlash(false), 200);
              if (navigator.vibrate) navigator.vibrate(200);
              onScan(result.getText());
              codeReader.reset();
              onClose();
            }
          }
        );
      })
      .catch(() => {
        setError("دوربین قابل دسترسی نیست یا اجازه استفاده داده نشده.");
      });

    return () => codeReader.reset();
  }, [active, onScan, onClose]);

  if (!active) return null;

  return (
    <div className="w-full relative">
      {error ? (
        <div className="bg-gradient-to-br from-red-800/20 to-red-900/20 backdrop-blur-sm border border-red-700/30 rounded-2xl p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-200 mb-2">خطا در دوربین</h3>
          <p className="text-red-300">{error}</p>
          <button
            onClick={onClose}
            className="mt-4 px-6 py-2 bg-red-600/80 hover:bg-red-700 text-white rounded-xl transition-all duration-300"
          >
            بستن
          </button>
        </div>
      ) : (
        <div className="relative">
          <div className="relative bg-gradient-to-br from-gray-900/20 to-gray-800/20 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10">
            <video
              ref={videoRef}
              className="w-full aspect-video object-cover"
              muted
              autoPlay
              playsInline
            />
            <div className="absolute inset-0">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 border-2 border-green-400/50 rounded-lg">
                <div className="absolute inset-0 border-2 border-green-400 rounded-lg animate-pulse">
                  <div className="absolute inset-1 border-2 border-green-500/70 rounded-lg bg-gradient-to-r from-green-500/20 to-blue-500/20 animate-pulse"></div>
                </div>
              </div>
            </div>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
              <div className="flex items-center gap-2 text-green-300">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">در حال اسکن...</span>
              </div>
            </div>
            {flash && (
              <div className="absolute inset-0 bg-white/70 animate-flash"></div>
            )}
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={onClose}
              className="flex-1 p-3 bg-gradient-to-r from-gray-700/50 to-gray-800/50 hover:from-gray-600/70 text-white rounded-xl backdrop-blur-sm border border-white/10 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <XCircle className="w-5 h-5" />
              <span>لغو</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const AnimatedBackground = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none">
    <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-800 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob"></div>
    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-900 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-2000"></div>
    <div className="absolute top-40 left-40 w-80 h-80 bg-pink-900 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-4000"></div>
  </div>
);

const FloatingParticles = () => (
  <div className="fixed inset-0 pointer-events-none">
    {[...Array(20)].map((_, i) => (
      <div
        key={i}
        className="absolute w-1 h-1 bg-white/20 rounded-full animate-float"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 10}s`,
          animationDuration: `${5 + Math.random() * 10}s`,
        }}
      />
    ))}
  </div>
);

const CheckInPage = () => {
  const [employeeId, setEmployeeId] = useState("");
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scannerActive, setScannerActive] = useState(false);

  const successSound = new Audio("https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg");
  const generalErrorSound = new Audio("https://actions.google.com/sounds/v1/cartoon/boing.ogg");
  const warningSound = new Audio("https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg");

  const showTemporaryMessage = (setter, duration = 8000) => {
    setTimeout(() => setter(null), duration);
  };

  const handleCheckIn = async (id = null) => {
    const empId = id || employeeId;
    if (!empId) {
      setError("لطفاً کد کارمندی را وارد کنید");
      generalErrorSound.play().catch(() => {});
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      showTemporaryMessage(setError);
      return;
    }

    setLoading(true);
    setError(null);
    setAttendance(null);

    try {
      const res = await fetch("/api/check-in/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employee_id: empId }),
      });
      const data = await res.json();

      if (!res.ok) {
        const msg = data["خطا"] || data["پیغام"];
        setError(msg);
        if (msg.includes("قبلا ثبت") || msg.includes("یافت نشد")) {
          warningSound.play().catch(() => {});
        } else {
          generalErrorSound.play().catch(() => {});
        }
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        showTemporaryMessage(setError);
        return;
      }

      setAttendance(data);
      
      successSound.play().catch(() => {});
      if (navigator.vibrate) navigator.vibrate(200);
      showTemporaryMessage(setAttendance, 9000);
    } catch (err) {
      setError(err.message);
      generalErrorSound.play().catch(() => {});
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      showTemporaryMessage(setError);
    } finally {
      setEmployeeId("");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden text-white">
      <AnimatedBackground />
      <FloatingParticles />

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-700 to-pink-700 text-white px-4 py-2 rounded-full mb-4 backdrop-blur-sm">
              <Clock className="w-5 h-5" />
              <span className="font-medium">ساعت {new Date().toLocaleTimeString('fa-IR')}</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">ثبت حضور</h1>
            <p className="text-gray-300">ثبت حضور از طریق وراد کردن کد کارمندی و یا اسکن بارکد</p>
          </div>

          <div className="space-y-4 mb-6" dir="rtl">
            <div className="relative">
              <input
                type="text"
                placeholder="کد کارمندی..."
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCheckIn()}
                className="
                  w-full pl-12 pr-4 py-4
                  bg-gray-800/80 backdrop-blur-sm
                  rounded-2xl border border-gray-700/50
                  focus:border-purple-400 focus:ring-4 focus:ring-purple-600/30
                  transition-all duration-300 text-lg
                  text-black placeholder-gray-400
                  shadow-lg hover:shadow-xl
                "
              />
              <UserCheck className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
            </div>

            <button
              onClick={() => handleCheckIn()}
              disabled={loading}
              className={`w-full py-4 rounded-2xl font-semibold text-lg transition-all duration-300 shadow-lg transform hover:scale-[1.02] ${
                loading
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-700 to-pink-700 hover:from-purple-800 hover:to-pink-800 text-white'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>در حال ثبت...</span>
                </div>
              ) : (
                <span>ثبت حضور ✨</span>
              )}
            </button>
          </div>

          {!scannerActive && (
            <div className="space-y-3 mb-6">
              <button
                onClick={() => setScannerActive(true)}
                className="w-full flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] backdrop-blur-sm border border-green-500/20"
              >
                <Camera className="w-6 h-6" />
                <span>اسکن QR کد</span>
              </button>
            </div>
          )}

          <ZXingScanner
            active={scannerActive}
            onScan={(data) => handleCheckIn(data)}
            onClose={() => setScannerActive(false)}
          />

          {attendance && (
            <div className="bg-gray-800 border border-green-700/50 rounded-2xl p-6 shadow-xl animate-slideUp backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <CheckCircle className="w-12 h-12 text-green-500" />
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 bg-green-900/50 text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                    <CheckCircle className="w-4 h-4" />
                    ثبت شد
                  </span>
                </div>
              </div>

              <div className="space-y-3 text-right">
                <h2 className="text-2xl font-bold text-white">{attendance["کارمند"]}</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <span className="text-gray-400">زمان: </span>
                    <span className="font-semibold text-white">{attendance["زمان"]}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-gray-400">وضعیت: </span>
                    <span className={`font-semibold ${attendance["وضعیت"] === "به موقع"
                        ? "text-green-500"
                        : "text-yellow-400"
                      }`}>
                      {attendance["وضعیت"]}
                    </span>
                  </div>
                  <div className="space-y-1">

                  </div>
                  <div className="space-y-1">
                    <span className="text-gray-400">تاخیر: </span>
                    <span className={`font-semibold ${attendance["مدت زمان تاخیر"] === "0 دقیقه"
                        ? "text-green-500"
                        : "text-yellow-400"
                      }`}>
                      {attendance["مدت زمان تاخیر"]}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-green-700/50">
                <button
                  onClick={() => setAttendance(null)}
                  className="w-full py-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white rounded-xl transition-all duration-300 font-semibold"
                >
                  ثبت حضور جدید
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-900/50 border border-red-700/50 rounded-2xl p-5 shadow-lg animate-shake backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-8 h-8 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 text-right">
                  <p className="text-red-300 font-medium">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckInPage;
