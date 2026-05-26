import React from 'react';
import { FaChevronDown, FaChevronRight, FaPlayCircle, FaCheckCircle, FaLock } from 'react-icons/fa';

const ModuleCard = ({ module, lectures, onLectureClick, completedLectures }) => {
  const [expanded, setExpanded] = React.useState(false);

  const toggleExpand = () => setExpanded(!expanded);

  return (
    <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
      <button
        onClick={toggleExpand}
        className="w-full flex items-center justify-between px-6 py-4 bg-black text-white hover:bg-gray-900 transition-colors"
      >
        <div className="flex items-center gap-3">
          {expanded ? <FaChevronDown className="text-sm" /> : <FaChevronRight className="text-sm" />}
          <span className="font-black uppercase text-sm tracking-wider">{module.title}</span>
        </div>
        <span className="text-xs text-gray-400 font-bold">{lectures?.length || 0} lectures</span>
      </button>

      {expanded && lectures && (
        <div className="divide-y-2 divide-black">
          {lectures.map((lecture) => {
            const isCompleted = completedLectures?.includes(lecture._id);
            return (
              <button
                key={lecture._id}
                onClick={() => onLectureClick?.(lecture)}
                className="w-full flex items-center justify-between px-6 py-3 hover:bg-gray-100 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  {isCompleted ? (
                    <FaCheckCircle className="text-green-600 text-sm" />
                  ) : (
                    <FaPlayCircle className="text-gray-400 text-sm" />
                  )}
                  <span className="text-sm font-bold text-black">{lecture.title}</span>
                </div>
                <span className="text-xs text-gray-500 font-bold">{lecture.duration || ''}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ModuleCard;
