import React from "react";
import { FaStar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
const CourseCard = ({ thumbnail, title, category, price ,id , reviews }) => {
  const navigate = useNavigate()
   const calculateAverageRating = (reviews) => {
  if (!reviews || reviews.length === 0) return 0;

  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return (total / reviews.length).toFixed(1); // rounded to 1 decimal
};

// Usage:
const avgRating = calculateAverageRating(reviews);
console.log("Average Rating:", avgRating);
  return (
    <div className="max-w-sm w-full bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all cursor-pointer" onClick={()=>navigate(`/viewcourse/${id}`)}>
      {/* Thumbnail */}
      <div className="w-full h-48 border-b-4 border-black overflow-hidden">
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Content */}
      <div className="p-5 space-y-3">
        {/* Title */}
        <h2 className="text-lg font-black text-black uppercase tracking-tight">{title}</h2>

        {/* Category */}
        <span className="inline-block px-3 py-1 bg-gray-100 border-2 border-black text-black font-bold text-xs uppercase tracking-wider">
            {category}
          </span>
        

        {/* Meta info */}
        <div className="flex justify-between items-center text-sm border-t-2 border-gray-200 pt-3 mt-3">
          <span className="font-black text-black text-base">₹{price}</span>
           <span className="flex items-center gap-1 font-bold text-gray-700">
            <FaStar className="text-black" /> {avgRating}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
