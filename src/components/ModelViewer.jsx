import { useEffect, useRef } from 'react';
// @google/model-viewer must be imported as a module to define the custom element
import '@google/model-viewer';

export default function ModelViewer({ src, alt }) {
  const viewerRef = useRef(null);

  useEffect(() => {
    // Optionally interact with the model-viewer DOM element
    // e.g. viewerRef.current.play() 
  }, []);

  return (
    <div className="w-full h-full relative group">
      <model-viewer
        ref={viewerRef}
        src={src}
        alt={alt}
        auto-rotate
        camera-controls
        ar
        ar-modes="webxr scene-viewer quick-look"
        shadow-intensity="1"
        style={{ width: '100%', height: '100%', backgroundColor: '#f9fafb' }}
      >
        <div slot="progress-bar" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">
          載入模型中...
        </div>
        <button
          slot="ar-button"
          className="absolute bottom-4 right-4 bg-white/90 backdrop-blur text-gray-800 px-4 py-2 rounded-full shadow-lg font-medium text-sm flex items-center gap-2 hover:bg-white transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.315 48.315 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
          </svg>
          AR 預覽
        </button>
      </model-viewer>
    </div>
  );
}
