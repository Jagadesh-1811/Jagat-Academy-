import React from 'react';
import { FaPlay } from 'react-icons/fa';

const VideoPlayer = ({ videoUrl, title, poster, onComplete }) => {
  const videoRef = React.useRef(null);

  return (
    <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
      <div className="bg-black px-6 py-3 border-b-4 border-black">
        <div className="flex items-center gap-2">
          <FaPlay className="text-white text-xs" />
          <h3 className="text-white font-black uppercase text-sm tracking-wider">{title || 'Video Lecture'}</h3>
        </div>
      </div>
      <div className="bg-black">
        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            poster={poster}
            controls
            className="w-full aspect-video"
            onEnded={onComplete}
          />
        ) : (
          <div className="w-full aspect-video flex items-center justify-center bg-gray-900">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-white flex items-center justify-center mx-auto mb-4">
                <FaPlay className="text-white text-2xl ml-1" />
              </div>
              <p className="text-gray-400 font-bold text-sm uppercase tracking-wider">No video available</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
