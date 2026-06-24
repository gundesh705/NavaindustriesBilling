import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Lock, User } from "lucide-react";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  setPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { auth } from "../../firebase";
import logo from "../../assets/logo.png";

export function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("kathiravanb916@gmail.com");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/dashboard");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      // Session-only login (cleared when browser is closed)
      await setPersistence(auth, browserSessionPersistence);

      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      navigate("/dashboard");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">

        <div className="bg-[#FFFFFF] p-8 text-center relative">
          <div className="w-74 h-54 mx-auto mb-4 flex items-center justify-center">
            <img
              src={logo}
              alt="Nava Industries"
              className="w-full h-full object-contain"
            />
          </div>

          <h1 className="text-xl font-bold text-gray-800 mb-1">
            Nava Industries
          </h1>

          <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-white to-transparent opacity-100"></div>
        </div>

        <div className="p-8 pt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
            Welcome Kathiravan
          </h2>

          <form onSubmit={handleLogin} className="space-y-5">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>

                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>

                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>

          </form>
        </div>
      </div>

      <p className="mt-8 text-sm text-gray-500">
        © {new Date().getFullYear()} Nava Industries. All rights reserved.
      </p>
    </div>
  );
}