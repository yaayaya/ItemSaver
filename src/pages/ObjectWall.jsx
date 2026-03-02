import { useState } from 'react';
import { mockItems } from '../data/mockItems';
import ModelViewer from '../components/ModelViewer';

export default function ObjectWall() {
  const [selectedItem, setSelectedItem] = useState(null);

  return (
    <div className="flex-1 flex flex-col p-6 max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">萬物物件牆 (Object Wall)</h2>
        <p className="mt-2 text-gray-500">點擊物件以進行 360 度預覽，或使用手機開啟 AR 預覽將模型投放至現實中。</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {mockItems.map((item) => (
          <div 
            key={item.id} 
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col"
            onClick={() => setSelectedItem(item)}
          >
            <div className="w-full aspect-square bg-gray-50 relative overflow-hidden flex items-center justify-center">
              {/* Thumbnail placeholder or miniature viewer could go here, but an image is better for list. We'll simulate with CSS */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 opacity-50"></div>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 text-indigo-200 group-hover:scale-110 transition-transform duration-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
              </svg>
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="text-lg font-bold text-gray-900 mb-2">{item.name}</h3>
              <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">{item.story}</p>
              <div className="text-indigo-600 text-sm font-medium flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span>點擊查看 3D</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 ml-1">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Model Viewer */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedItem(null)}
          ></div>
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="flex flex-col md:flex-row h-full">
              {/* 3D Viewer Area */}
              <div className="w-full md:w-3/5 h-[50vh] md:h-[70vh] bg-gray-50 relative">
                <ModelViewer src={selectedItem.model_url} alt={selectedItem.name} />
              </div>
              
              {/* Info Area */}
              <div className="w-full md:w-2/5 p-8 flex flex-col bg-white overflow-y-auto">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{selectedItem.name}</h3>
                <div className="w-12 h-1 bg-indigo-500 mb-6 rounded-full"></div>
                <p className="text-gray-600 leading-relaxed text-lg flex-1">
                  {selectedItem.story}
                </p>
                <div className="mt-8 pt-6 border-t border-gray-100 flex items-start gap-4 text-sm text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-indigo-400 shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.82 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.496 1.509 1.333 1.509 2.316V18" />
                  </svg>
                  <p>提示：在行動裝置上點擊右下角的「AR 預覽」即可開啟擴增實境模式，將該物件放置於您的實體空間中體驗。</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
