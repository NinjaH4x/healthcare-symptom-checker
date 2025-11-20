'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (!acceptedTerms) {
      setError('You must accept the Terms & Conditions to continue');
      return;
    }

    const success = login(email, password);
    if (success) {
      router.push('/chat');
    } else {
      setError('Invalid email/phone or password (min 4 characters)');
    }
  };

  const handleDemo = () => {
    // Demo login for testing (require acceptance)
    if (!acceptedTerms) {
      setError('You must accept the Terms & Conditions to use the demo account');
      return;
    }

    const success = login('demo@healthcare.com', 'demo1234');
    if (success) {
      router.push('/chat');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7EFD2] to-[#FFFBF0] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header Card */}
        <div className="bg-white rounded-xl shadow-2xl p-8 mb-6">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4 inline-block">🏥</div>
            <h1 className="text-3xl font-bold text-[#23408e] mb-2">HealthCare AI</h1>
            <p className="text-[#464444] font-medium">Medical Symptom Analyzer</p>
            <p className="text-xs text-[#464444] mt-2">Professional Healthcare Information Tool</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email/Phone Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-[#23408e] mb-2">
                📧 Email or Phone
              </label>
              <input
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com or 1234567890"
                className="w-full px-4 py-3 border-2 border-[#A6CBFF] rounded-lg focus:ring-2 focus:ring-[#A6CBFF] focus:border-[#A6CBFF] transition font-medium text-[#464444]"
              />
              <p className="text-xs text-[#464444] mt-1">
                Enter valid email or 10-digit phone number
              </p>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-[#23408e] mb-2">
                🔐 Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password (min 4 characters)"
                  className="w-full px-4 py-3 border-2 border-[#A6CBFF] rounded-lg focus:ring-2 focus:ring-[#A6CBFF] focus:border-[#A6CBFF] transition font-medium text-[#464444]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-[#464444] hover:text-[#23408e] text-xl"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              <p className="text-xs text-[#464444] mt-1">Minimum 4 characters required</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-2 border-[#E30D34] text-[#E30D34] px-4 py-3 rounded-lg text-sm font-medium">
                ⚠️ {error}
              </div>
            )}

            {/* Terms & Conditions */}
            <div className="flex items-start gap-3">
              <input id="terms" type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} className="mt-1" />
              <label htmlFor="terms" className="text-sm text-[#464444]">
                I accept the <a href="/terms" className="text-[#23408e] underline">Terms & Conditions</a>
              </label>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-[#A6CBFF] to-[#B7FAAF] text-[#23408e] font-bold rounded-lg hover:from-[#95C0FF] hover:to-[#A8F5A0] transition transform hover:scale-105 mt-2 text-lg"
            >
              🔓 Login to Dashboard
            </button>
          </form>

          {/* Demo Login */}
          <button
            onClick={handleDemo}
            className="w-full py-2 mt-3 bg-[#F7EFD2] text-[#23408e] font-semibold rounded-lg hover:bg-[#E8DFC0] transition"
          >
            🎬 Try Demo Account
          </button>

          {/* Info Box */}
          <div className="bg-[#F7EFD2] border-2 border-[#A6CBFF] rounded-lg p-4 mt-6">
            <p className="text-xs font-medium text-[#23408e] mb-2">
              <strong>📝 Demo Credentials:</strong>
            </p>
            <p className="text-xs text-[#464444]">
              Email: <code className="bg-[#A6CBFF] px-2 py-1 rounded text-[#23408e]">demo@healthcare.com</code>
              <br />
              Password: <code className="bg-[#A6CBFF] px-2 py-1 rounded text-[#23408e]">demo1234</code>
            </p>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center text-[#464444] text-sm space-y-2">
          <p className="font-semibold">
            ⚕️ Professional Healthcare AI Assistant
          </p>
          <p className="text-[#23408e]">
            ⚠️ For educational and informational purposes only
          </p>
          <p className="text-[#23408e] text-xs">
            Always consult a licensed healthcare professional for medical advice
          </p>
        </div>
      </div>
    </div>
  );
}
