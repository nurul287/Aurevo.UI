import { Play, Pause } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface ProductVideoPlayerProps {
  videoUrl?: string;
  posterImage?: string;
  alt?: string;
  className?: string;
}

const ProductVideoPlayer = ({
  videoUrl,
  posterImage,
  alt = "Product video",
  className = "",
}: ProductVideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true); // Default to playing
  const [isLoaded, setIsLoaded] = useState(false);

  // If no video URL, show placeholder with poster image and play icon
  if (!videoUrl) {
    return (
      <div
        className={`relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden group ${className}`}
      >
        {posterImage ? (
          <>
            <img
              src={posterImage}
              alt={alt}
              className="w-full h-full object-cover opacity-50"
            />
            <button
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 hover:bg-opacity-30 transition-all z-10 group/button"
              aria-label="Play video"
              disabled
            >
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center group-hover/button:scale-110 transition-transform">
                <Play className="w-8 h-8 text-white ml-1" fill="white" />
              </div>
            </button>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-gray-400 text-sm">No video available</p>
          </div>
        )}
      </div>
    );
  }

  // Auto-play video when it loads
  useEffect(() => {
    if (videoRef.current && isLoaded) {
      videoRef.current.play().catch((error) => {
        // Autoplay might fail due to browser policies
        console.log("Autoplay prevented:", error);
        setIsPlaying(false);
      });
    }
  }, [isLoaded]);

  // Sync state with video element
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
    };
  }, []);

  const handlePlayPause = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  };

  const handleVideoLoaded = () => {
    setIsLoaded(true);
  };

  return (
    <div
      className={`relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden group ${className}`}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        poster={posterImage}
        className="w-full h-full object-cover bg-gray-100"
        loop
        muted
        playsInline
        preload="auto"
        autoPlay
        onLoadedData={handleVideoLoaded}
      />

      {/* Custom Play/Pause Button at Bottom */}
      <button
        onClick={handlePlayPause}
        className="absolute bottom-4 left-4 z-10 p-2 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full transition-all group/button"
        aria-label={isPlaying ? "Pause video" : "Play video"}
      >
        <div className="w-8 h-8 flex items-center justify-center group-hover/button:scale-110 transition-transform">
          {isPlaying ? (
            <Pause className="w-5 h-5 text-white" fill="white" />
          ) : (
            <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
          )}
        </div>
      </button>

      {/* Loading indicator */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-800 rounded-full animate-spin"></div>
        </div>
      )}

      {/* Poster image fallback */}
      {!isLoaded && posterImage && (
        <img
          src={posterImage}
          alt={alt}
          className="absolute inset-0 w-full h-full object-contain opacity-50"
        />
      )}
    </div>
  );
};

export default ProductVideoPlayer;
