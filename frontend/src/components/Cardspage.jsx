import React, { useEffect, useState } from 'react'
import Card from "./Card.jsx"
import { useSelector } from 'react-redux';
import { SiViaplay } from "react-icons/si";
import { useNavigate } from 'react-router-dom';

function Cardspage() {
  const [popularCourses,setPopularCourses] =useState([]);
  const {courseData} = useSelector(state=>state.course)
  const navigate = useNavigate()
  useEffect(()=>{
    setPopularCourses(courseData.slice(0,6));
    },[courseData])
  return (
    <div className='relative flex items-center justify-center flex-col py-16'>
      <h1 className='md:text-5xl text-3xl font-black text-center px-6 uppercase tracking-tight'>Our Popular Courses</h1>
      <span className='lg:w-[50%] md:w-[80%] text-sm font-medium text-gray-600 text-center mt-4 mb-10 px-6'>Explore top-rated courses designed to boost your skills, enhance careers, and unlock opportunities in tech, AI, business, and beyond.</span>
    <div className='w-full flex items-center justify-center flex-wrap gap-12 lg:p-[50px] md:p-[30px] p-[20px] mb-[40px]

    '>

    
            {
                popularCourses.map((item,index)=>(
                    <Card key={index} id={item._id} thumbnail={item.thumbnail} title={item.title} price={item.price} category={item.category} reviews={item.reviews}  />
                ))
            }
             
            </div>
           <button className='px-8 py-3 border-2 border-black bg-black text-white font-black text-sm uppercase tracking-wider flex gap-2 cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all' onClick={()=>navigate("/allcourses")}>View all Courses <SiViaplay className='w-5 h-5 fill-white' /></button>
            </div>
  )
}

export default Cardspage
