import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { mockItems } from '../data/mockItems';

export default function Scanner() {
  const videoRef = useRef(null);
  const mountRef = useRef(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [isColored, setIsColored] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Use the first mock item for scanner demo
  const item = mockItems[0];
  
  // Refs for three.js objects we need to update
  const sceneRef = useRef(null);
  const modelRef = useRef(null);
  const materialsRef = useRef([]);
  const texturesRef = useRef({ stone: null, color: null });

  // Init Camera
  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setHasPermission(true);
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    }
    setupCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  // Init Three.js
  useEffect(() => {
    if (!mountRef.current || !hasPermission) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(1, 1, 2);
    scene.add(directionalLight);

    // Load Textures
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(item.stone_texture, (stoneTex) => {
      stoneTex.flipY = false;
      texturesRef.current.stone = stoneTex;
    });
    textureLoader.load(item.original_texture, (colorTex) => {
      colorTex.flipY = false;
      texturesRef.current.color = colorTex;
    });

    // Load Model
    const loader = new GLTFLoader();
    loader.load(item.model_url, (gltf) => {
      const model = gltf.scene;
      
      // Scale and position adjustment
      model.scale.set(1.5, 1.5, 1.5);
      
      // Center the model
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center);

      // Wrapper group for rotation
      const group = new THREE.Group();
      group.add(model);
      scene.add(group);
      modelRef.current = group;

      // Extract materials
      model.traverse((child) => {
        if (child.isMesh) {
          materialsRef.current.push(child.material);
        }
      });

      setIsLoading(false);
    }, undefined, (error) => {
      console.error('An error happened loading the model', error);
      setIsLoading(false);
    });

    // Animation loop
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      if (modelRef.current) {
        modelRef.current.rotation.y += 0.01; // slow continuous rotation for demo
      }
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const newWidth = mountRef.current.clientWidth;
      const newHeight = mountRef.current.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [hasPermission, item.model_url, item.original_texture, item.stone_texture]);

  // Handle Texture Switch
  const toggleMemory = () => {
    const newState = !isColored;
    setIsColored(newState);

    if (materialsRef.current.length > 0) {
      const targetTexture = newState ? texturesRef.current.color : texturesRef.current.stone;
      
      materialsRef.current.forEach((mat) => {
        if (targetTexture) {
          mat.map = targetTexture;
          mat.needsUpdate = true;
        }
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col relative bg-gray-900 overflow-hidden">
      {!hasPermission && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-gray-900 text-white p-6 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mb-4 text-gray-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
          </svg>
          <h2 className="text-xl font-bold mb-2">需要相機權限</h2>
          <p className="text-gray-400 max-w-sm">
            為了進入「現場掃描模式」並與實體物件互動，請允許瀏覽器使用您的攝影機。
          </p>
        </div>
      )}

      {/* Webcam Background */}
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted 
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* Three.js Canvas Overlay */}
      <div 
        ref={mountRef} 
        className="absolute inset-0 w-full h-full z-10 pointer-events-none"
      />

      {/* UI Overlay */}
      {hasPermission && (
        <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between p-6">
          <div className="flex justify-center mt-safe-top">
            <div className="bg-black/50 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              掃描模式準備就緒
            </div>
          </div>

          <div className="flex flex-col items-center pointer-events-auto mb-8">
            {isLoading ? (
              <div className="bg-black/60 backdrop-blur text-white px-6 py-3 rounded-xl flex items-center gap-3">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>分析石板紋理中...</span>
              </div>
            ) : (
              <button 
                onClick={toggleMemory}
                className={`flex flex-col items-center justify-center w-24 h-24 rounded-full shadow-2xl transition-all duration-500 transform hover:scale-105 active:scale-95 border-4 ${isColored ? 'bg-gradient-to-tr from-purple-500 to-indigo-500 border-white/50 text-white' : 'bg-white border-blue-500 text-blue-600'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mb-1">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09l2.846.813-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                </svg>
                <span className="font-bold text-sm tracking-widest">{isColored ? '還原' : '喚醒記憶'}</span>
              </button>
            )}
            <p className="mt-6 text-white text-sm font-medium bg-black/40 px-4 py-1.5 rounded-full backdrop-blur">
              {isColored ? '已連結彩色記憶' : '請將相機對準石板痕跡'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
