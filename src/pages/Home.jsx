import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-gray-200">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            互動體驗入口
          </h2>
          <p className="text-lg text-gray-500">
            請選擇您要進行的功能測試
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Link
            to="/scan"
            className="group relative flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-transparent hover:border-blue-500 overflow-hidden"
          >
            <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10 text-blue-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
              </svg>
            </div>
            <h3 className="relative z-10 text-xl font-bold text-gray-900 mb-2">記憶掃描器</h3>
            <p className="relative z-10 text-sm text-gray-500 text-center">現場展覽體驗：掃描石板，浮現數位模型</p>
          </Link>

          <Link
            to="/wall"
            className="group relative flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-transparent hover:border-purple-500 overflow-hidden"
          >
            <div className="absolute inset-0 bg-purple-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10 text-purple-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
            </div>
            <h3 className="relative z-10 text-xl font-bold text-gray-900 mb-2">萬物物件牆</h3>
            <p className="relative z-10 text-sm text-gray-500 text-center">遠端線上瀏覽：360度預覽與行動AR展示</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
