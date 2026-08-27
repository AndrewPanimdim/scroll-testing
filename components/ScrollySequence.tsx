"use client";

import { useEffect, useRef, useState } from "react";
import { useScroll, useTransform, motion, useMotionValueEvent } from "framer-motion";

const FRAME_COUNT = 23;

export default function ScrollySequence() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentFrame, setCurrentFrame] = useState(1);

  // Load all images
  useEffect(() => {
    let loadedCount = 0;
    const loadedImages: HTMLImageElement[] = [];
    
    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image();
      const paddedIndex = String(i).padStart(3, "0");
      img.src = `/iphoneAnimation/ezgif-frame-${paddedIndex}.jpg`;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === FRAME_COUNT) {
          setIsLoading(false);
        }
      };
      loadedImages.push(img);
    }
    setImages(loadedImages);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const frameIndex = useTransform(scrollYProgress, [0, 1], [1, FRAME_COUNT]);

  // Pre-calculate transforms before any early returns to obey Hook rules
  const opacity1 = useTransform(scrollYProgress, [0, 0.1, 0.15], [1, 1, 0]);
  const opacity2 = useTransform(scrollYProgress, [0.15, 0.25, 0.35, 0.45], [0, 1, 1, 0]);
  const opacity3 = useTransform(scrollYProgress, [0.45, 0.55, 0.7, 0.8], [0, 1, 1, 0]);
  const opacity4 = useTransform(scrollYProgress, [0.8, 0.9, 1], [0, 1, 1]);

  useMotionValueEvent(frameIndex, "change", (latest) => {
    const nextFrame = Math.round(latest);
    if (nextFrame !== currentFrame) {
      setCurrentFrame(nextFrame);
    }
  });

  const drawImage = () => {
    if (!canvasRef.current || images.length === 0 || isLoading) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Check if dimensions changed to avoid unnecessary resizing
    if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
       canvas.width = window.innerWidth;
       canvas.height = window.innerHeight;
    }

    const img = images[currentFrame - 1];
    if (!img) return;

    // Use contain fit
    const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
    const x = (canvas.width / 2) - (img.width / 2) * scale;
    const y = (canvas.height / 2) - (img.height / 2) * scale;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
  };

  useEffect(() => {
    drawImage();
  }, [currentFrame, images, isLoading]);

  useEffect(() => {
    window.addEventListener("resize", drawImage);
    return () => window.removeEventListener("resize", drawImage);
  }, [images, currentFrame]);

  return (
    <div ref={containerRef} className="relative h-[400vh] bg-black">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="w-12 h-12 border-4 border-white/20 border-t-white/90 rounded-full animate-spin"></div>
        </div>
      )}

      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full object-contain" />
        
        {/* Overlays */}
        {!isLoading && (
          <div className="absolute inset-0 pointer-events-none flex flex-col justify-center">
            
            {/* 0% Scroll */}
            <motion.div
              className="absolute inset-x-0 top-[20%] flex justify-center"
              style={{ opacity: opacity1 }}
            >
              <h1 className="text-white/90 text-5xl md:text-8xl font-bold tracking-tighter">THE NEW IPHONE</h1>
            </motion.div>

            {/* 30% Scroll */}
            <motion.div
              className="absolute left-6 md:left-24 top-1/3 md:top-1/2 -translate-y-1/2"
              style={{ opacity: opacity2 }}
            >
              <h2 className="text-white/90 text-3xl md:text-6xl font-semibold tracking-tight max-w-xs md:max-w-md">Engineered to perfection.</h2>
              <p className="text-white/60 text-base md:text-lg mt-4 max-w-xs md:max-w-md">Every detail matters. The architecture redefines power.</p>
            </motion.div>

            {/* 60% Scroll */}
            <motion.div
              className="absolute right-6 md:right-24 top-2/3 md:top-1/2 -translate-y-1/2 text-right"
              style={{ opacity: opacity3 }}
            >
              <h2 className="text-white/90 text-3xl md:text-6xl font-semibold tracking-tight max-w-xs md:max-w-md ml-auto">Internal brilliance.</h2>
              <p className="text-white/60 text-base md:text-lg mt-4 max-w-xs md:max-w-md ml-auto">Uncompromising performance hidden within a sleek shell.</p>
            </motion.div>

            {/* 90% Scroll */}
            <motion.div
              className="absolute inset-x-0 bottom-[20%] flex flex-col items-center justify-center"
              style={{ opacity: opacity4 }}
            >
              <h2 className="text-white/90 text-4xl md:text-7xl font-bold tracking-tighter text-center">Reassemble the future.</h2>
              <button className="mt-8 px-8 py-3 bg-white text-black font-semibold rounded-full hover:scale-105 transition-transform pointer-events-auto">
                Pre-order Now
              </button>
            </motion.div>

          </div>
        )}
      </div>
    </div>
  );
}
