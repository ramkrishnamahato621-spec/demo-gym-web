import { useEffect, useRef, useCallback } from 'react';
import { initScrollSequence } from '../animations/scrollSequence';

interface ImageSequenceCanvasProps {
  frameCount: number;
  imagePath: (index: number) => string;
  onFrameUpdate?: (frame: number) => void;
  scrollContainerRef: { current: HTMLElement | null };
}

export const ImageSequenceCanvas = ({ frameCount, imagePath, onFrameUpdate, scrollContainerRef }: ImageSequenceCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<(HTMLImageElement | null)[]>([]);
  const currentFrame = useRef({ frame: 0 });
  const rafPending = useRef(false);
  const lastRenderedFrame = useRef(-1);

  // Find the nearest loaded frame to avoid showing blank canvas (anti-glitch)
  const findNearestLoadedFrame = useCallback((targetFrame: number): number => {
    const images = imagesRef.current;
    if (images[targetFrame]) return targetFrame;
    
    // Search outward from target in both directions for closest loaded frame
    for (let offset = 1; offset < frameCount; offset++) {
      const below = targetFrame - offset;
      const above = targetFrame + offset;
      if (below >= 0 && images[below]) return below;
      if (above < frameCount && images[above]) return above;
    }
    return 0; // fallback
  }, [frameCount]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !scrollContainerRef.current) return;

    const urls = Array.from({ length: frameCount }, (_, i) => imagePath(i));
    
    // Create array to hold loaded images
    const loadedImages = new Array<HTMLImageElement | null>(frameCount).fill(null);
    imagesRef.current = loadedImages;

    // Render a specific frame with cover-fit scaling
    const renderFrame = (index: number) => {
      const safeIndex = Math.max(0, Math.min(index, frameCount - 1));
      // Use nearest loaded frame to prevent blank/glitch
      const actualIndex = findNearestLoadedFrame(safeIndex);
      const img = loadedImages[actualIndex];
      
      if (img && canvas && ctx) {
        // Only re-render if frame actually changed
        if (lastRenderedFrame.current === actualIndex && canvas.width > 0) return;
        lastRenderedFrame.current = actualIndex;

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

    // Throttled render using rAF to prevent jank on fast scrolling
    const scheduleRender = (frame: number) => {
      if (onFrameUpdate) onFrameUpdate(frame);
      if (!rafPending.current) {
        rafPending.current = true;
        requestAnimationFrame(() => {
          renderFrame(frame);
          rafPending.current = false;
        });
      }
    };

    // Set canvas size with devicePixelRatio for crisp mobile rendering
    const handleResize = () => {
      if (canvas) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        canvas.style.width = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;
        lastRenderedFrame.current = -1; // force re-render
        renderFrame(currentFrame.current.frame);
      }
    };

    // Load a single image as a Promise
    const loadImage = (index: number): Promise<void> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.decoding = 'async';
        img.src = urls[index];
        img.onload = () => {
          loadedImages[index] = img;
          resolve();
        };
        img.onerror = () => resolve(); // skip failed frames silently
      });
    };

    // Load strategy: first 5 frames quickly in parallel, then rest sequentially
    const loadAllFrames = async () => {
      // Phase 1: Load first 5 frames in parallel for instant hero visibility
      const firstBatch = Math.min(5, frameCount);
      await Promise.all(
        Array.from({ length: firstBatch }, (_, i) => loadImage(i))
      );
      
      // Render frame 0 immediately
      handleResize();
      
      // Init scroll sequence right away so user can start scrolling
      initScrollSequence({
        frameCount: frameCount,
        currentFrame: currentFrame.current,
        container: scrollContainerRef.current,
        onUpdate: scheduleRender
      });

      // Phase 2: Load remaining frames in background, 3 at a time for speed
      const batchSize = 3;
      for (let i = firstBatch; i < frameCount; i += batchSize) {
        const batch = [];
        for (let j = i; j < Math.min(i + batchSize, frameCount); j++) {
          batch.push(loadImage(j));
        }
        await Promise.all(batch);
      }
    };

    loadAllFrames();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [frameCount, imagePath, scrollContainerRef, onFrameUpdate, findNearestLoadedFrame]);

  return (
    <div className="fixed top-0 left-0 w-full h-[100dvh] overflow-hidden z-0 bg-black pointer-events-none">
      <canvas ref={canvasRef} className="w-full h-full object-cover opacity-80" style={{ willChange: 'transform' }} />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none"></div>
    </div>
  );
};
