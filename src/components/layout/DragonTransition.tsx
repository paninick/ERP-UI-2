import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

interface Props {
  isActive: boolean;
  onComplete: () => void;
}

const VIDEOS = [
  '/dragon-transition-8932.mp4',
  '/dragon-transition-6834.mp4',
];

// 视频总时长约 15 秒，只播后 5 秒（从第 10 秒开始）
const VIDEO_START_SEC = 10;
const VIDEO_DURATION_MS = 5500;

export default function DragonTransition({ isActive, onComplete }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const indexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [src, setSrc] = useState(VIDEOS[0]);
  const [visible, setVisible] = useState(false);
  const activeRef = useRef(false);

  // 用 ref 持有最新的 onComplete，避免 stale closure
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const triggerComplete = () => {
    if (!activeRef.current) return;
    activeRef.current = false;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    onCompleteRef.current();
  };

  useEffect(() => {
    if (!isActive) return;

    activeRef.current = true;

    // 交替选视频
    indexRef.current = (indexRef.current + 1) % VIDEOS.length;
    setSrc(VIDEOS[indexRef.current]);
    setVisible(true);

    // 超时兜底
    timerRef.current = setTimeout(triggerComplete, VIDEO_DURATION_MS);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  // isActive → false 时暂停并隐藏
  useEffect(() => {
    if (!isActive) {
      activeRef.current = false;
      setVisible(false);
      videoRef.current?.pause();
    }
  }, [isActive]);

  // 元数据加载完成后 seek 到起始点再播放
  const handleCanPlay = () => {
    const video = videoRef.current;
    if (!video || !activeRef.current) return;
    if (video.currentTime < VIDEO_START_SEC) {
      video.currentTime = VIDEO_START_SEC;
    }
    video.play().catch(() => triggerComplete());
  };

  const handleEnded = () => triggerComplete();

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="dragon-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            pointerEvents: 'none',
            background: '#000',
          }}
          aria-hidden="true"
        >
          <video
            ref={videoRef}
            src={src}
            muted
            playsInline
            preload="auto"
            onCanPlay={handleCanPlay}
            onEnded={handleEnded}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
