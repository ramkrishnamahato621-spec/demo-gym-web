import { useEffect, useRef } from 'react';
import { preloadImages } from '../utilities/preloadImages';
import { initScrollSequence } from '../animations/scrollSequence';

interface ImageSequenceCanvasProps {
  frameCount: number;
  imagePath: (index: number) => string;
  onFrameUpdate?: (frame: number) => void;
  scrollContainerRef: { current: HTMLElement | null };
}

export const ImageSequenceCanvas = ({ frameCount, imagePath, onFrameUpdate, scrollContainerRef }: ImageSequenceCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrame = useRef({ frame: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !scrollContainerRef.current) return;

    const urls = Array.from({ length: frameCount }, (_, i) => imagePath(i));
    
    // Create array to hold loaded images
    const loadedImages = new Array(frameCount).fill(null);
    imagesRef.current = loadedImages;

    // Load Frame 0 instantly for immediate perceived performance
    const img0 = new Image();
    img0.src = urls[0];
    img0.onload = () => {
      loadedImages[0] = img0;
      renderFrame(0);
      
      // Initialize scroll sequence immediately so user doesn't wait
      initScrollSequence({
        frameCount: frameCount,
        currentFrame: currentFrame.current,
        container: scrollContainerRef.current,
        onUpdate: (frame) => {
          renderFrame(frame);
          if (onFrameUpdate) onFrameUpdate(frame);
        }
      });
      
      // Background load the remaining 99 frames asynchronously
      const loadRest = async () => {
        for(let i = 1; i < frameCount; i++) {
          await new Promise((resolve) => {
            const img = new Image();
            img.src = urls[i];
            img.onload = () => {
              loadedImages[i] = img;
              resolve(true);
            };
            img.onerror = () => resolve(false);
          });
        }
      };
      loadRest();
    };

    const renderFrame = (index: number) => {
      const safeIndex = Math.min(index, imagesRef.current.length - 1);
      const img = imagesRef.current[safeIndex];
      
      if (img && canvas && ctx) {
        const hRatio = canvas.width / img.width;
        const vRatio = canvas.height / img.height;
        const ratio = Math.max(hRatio, vRatio);
        const centerShift_x = (canvas.width - img.width * ratio) / 2;
        const centerShift_y = (canvas.height - img.height * ratio) / 2;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(
          img,
          0, 0, img.width, img.height,
          centerShift_x, centerShift_y, img.width * ratio, img.height * ratio
        );
      }
    };

    const handleResize = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        renderFrame(currentFrame.current.frame);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); 

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [frameCount, imagePath, scrollContainerRef, onFrameUpdate]);

  return (
    <div className="fixed top-0 left-0 w-full h-[100dvh] overflow-hidden z-0 bg-black pointer-events-none">
      <canvas ref={canvasRef} className="w-full h-full object-cover opacity-80" style={{ willChange: 'transform' }} />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none"></div>
    </div>
  );
};
