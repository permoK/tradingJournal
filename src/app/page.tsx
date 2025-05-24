import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col justify-center">
            <h1 className="text-4xl font-bold text-slate-800 mb-4">
              Deriv Progress Tracker
            </h1>
            <p className="text-xl text-slate-700 mb-6">
              Track your Deriv trading journey, learn together with friends, and master trading consistently.
            </p>
            <ul className="space-y-2 mb-8">
              <li className="flex items-start">
                <svg className="h-6 w-6 text-emerald-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-slate-800 font-medium">Track your learning progress</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 text-emerald-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-slate-800 font-medium">Keep a private trading journal</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 text-emerald-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-slate-800 font-medium">Share insights with friends</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 text-emerald-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-slate-800 font-medium">Build consistency with streak tracking</span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Ready to start your trading journey?
              </h3>
              <div className="space-y-3">
                <Link
                  href="/auth/register"
                  className="w-full inline-flex justify-center py-3 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Get Started - Sign Up
                </Link>
                <Link
                  href="/auth/login"
                  className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Already have an account? Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
