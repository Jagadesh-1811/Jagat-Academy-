import React from "react";
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import fallbackImage from '../assets/empty.jpg';

const ReviewCard = ({ text, name, image, rating, role }) => {
  return (
    <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 max-w-sm w-full hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all">
      {/* Rating Stars */}
      <div className="flex items-center mb-4 text-black">
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <span key={i}>
              {i < rating ? <StarIcon className="text-lg" /> : <StarBorderIcon className="text-lg" />}
            </span>
          ))}
      </div>

      {/* Review Text */}
      <p className="text-gray-700 text-sm font-medium mb-5 leading-relaxed">{text}</p>

      {/* Reviewer Info */}
      <div className="flex items-center gap-3 border-t-2 border-gray-200 pt-4">
        <div className="w-10 h-10 border-2 border-black flex items-center justify-center bg-gray-200 text-black font-black text-sm overflow-hidden">
          {image ? (
            <img src={image || fallbackImage} alt={name} className="w-full h-full object-cover" />
          ) : (
            <span>{name ? name.slice(0,1).toUpperCase() : 'U'}</span>
          )}
        </div>
        <div>
          <h4 className="font-black text-black text-sm uppercase tracking-tight">{name}</h4>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{role}</p>
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;

