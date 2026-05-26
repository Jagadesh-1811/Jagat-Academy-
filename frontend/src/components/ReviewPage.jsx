import React, { useEffect, useState } from 'react'
import ReviewCard from './ReviewCard'
import { useSelector } from 'react-redux';


function ReviewPage() {
  const [latestReview,setLatestReview] =useState([]);
  const {allReview} = useSelector(state=>state.review)
  
  useEffect(()=>{
    setLatestReview(allReview.slice(0,6));
    },[allReview])
  return (
     <div className='flex items-center justify-center flex-col py-16'>
      <h1 className='md:text-5xl text-3xl font-black text-center px-6 uppercase tracking-tight'>Real Reviews from Real Learners</h1>
      <span className='lg:w-[50%] md:w-[80%] text-sm font-medium text-gray-600 text-center mt-4 mb-10 px-6'>Discover how our Virtual Courses is transforming learning experiences through real feedback from students and professionals worldwide.</span>
    <div className='w-full flex items-center justify-center flex-wrap gap-12 lg:p-[50px] md:p-[30px] p-[20px] mb-[40px]'>
      
     
            {
                latestReview.map((item,index)=>(
                    <ReviewCard 
                      key={index} 
                      rating={item.rating} 
                      image={item.user?.photoUrl || '/default-avatar.png'} 
                      text={item.comment} 
                      name={item.user?.name || 'Anonymous'} 
                      role={item.user?.role || 'student'} 
                    />
                ))
            }
             
    
    
    </div>
    </div>
  )
}
 

export default ReviewPage
