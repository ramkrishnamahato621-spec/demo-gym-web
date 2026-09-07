import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Force perfectly smooth native-like scrolling on mobile devices
ScrollTrigger.normalizeScroll(true);

interface ScrollSequenceConfig {
  frameCount: number;
  currentFrame: { frame: number };
  container: HTMLElement | null;
  onUpdate: (frame: number) => void;
}

export const initScrollSequence = ({
  frameCount,
  currentFrame,
  container,
  onUpdate
}: ScrollSequenceConfig) => {
  if (!container) return;

  ScrollTrigger.create({
    trigger: container,
    start: 'top top',
    end: 'bottom bottom',
    scrub: 0.5, // Smooth scrubbing
    onUpdate: (self) => {
      // self.progress goes exactly from 0 to 1 (down) and 1 to 0 (up)
      const frame = Math.round(self.progress * (frameCount - 1));
      currentFrame.frame = frame;
      onUpdate(frame);
    }
  });
};
