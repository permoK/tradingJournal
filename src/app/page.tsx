import Auth from '@/components/Auth';

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
                <span className="text-slate-700">Track your learning progress</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 text-emerald-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-slate-700">Keep a private trading journal</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 text-emerald-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-slate-700">Share insights with friends</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 text-emerald-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-slate-700">Build consistency with streak tracking</span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
            <Auth />
          </div>
        </div>
      </div>
    </main>
  );
}
