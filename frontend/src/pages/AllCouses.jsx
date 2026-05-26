import React, { useEffect, useState } from 'react';
import Card from "../components/Card.jsx";
import { FaArrowLeftLong } from "react-icons/fa6";
import { useNavigate } from 'react-router-dom';
import Nav from '../components/Nav';
import ai from '../assets/SearchAi.png'
import { useSelector } from 'react-redux';
function AllCourses() {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const navigate = useNavigate()
 const [category,setCategory] = useState([])
 const [filterCourses,setFilterCourses] = useState([])
  const {courseData} = useSelector(state=>state.course)

 
  
  const toggleCategory = (e) =>{
     if(category.includes(e.target.value)){
       setCategory(prev=> prev.filter(item => item !== e.target.value))
     }else{
      setCategory(prev => [...prev,e.target.value])
     }
  }

  const applyFilter = () =>{
    let courseCopy = courseData.slice();

    if(category.length > 0){
      courseCopy = courseCopy.filter(item => category.includes(item.category))
    }
   
    setFilterCourses(courseCopy)

  }

   useEffect(()=>{
setFilterCourses(courseData)
  },[courseData])

  useEffect(()=>{
    applyFilter()
  },[category])

  return (
    <div className="flex min-h-screen bg-white">
      <Nav/>
      {/* Toggle Button */}
      <button
        onClick={() => setIsSidebarVisible(prev => !prev)}
        className="fixed top-20 left-4 z-50 bg-white text-black px-3 py-1 md:hidden border-2 border-black font-black uppercase text-xs tracking-wider"
      >
        {isSidebarVisible ? '✕ Hide' : '☰ Filters'}
      </button>

      {/* Sidebar */}
      <aside className={`w-[260px] h-screen overflow-y-auto bg-black fixed top-0 left-0 p-6 py-[130px] border-r-4 border-white transition-transform duration-300 z-5 
        ${isSidebarVisible ? 'translate-x-0' : '-translate-x-full'} 
        md:block md:translate-x-0`}>
          
        <div className="flex items-center gap-3 mb-8 border-b-2 border-white pb-4">
          <FaArrowLeftLong className='text-white cursor-pointer hover:opacity-70' onClick={()=>navigate("/")}/>
          <h2 className="text-lg font-black text-white uppercase tracking-tight">Filter by Category</h2>
        </div>

        <form className="space-y-3 text-sm" onSubmit={(e)=>e.preventDefault()}>
          <button className='w-full px-4 py-3 bg-white text-black font-black uppercase text-xs tracking-wider border-2 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all flex items-center justify-center gap-2 cursor-pointer' onClick={()=>navigate("/searchwithai")}>
            <img src={ai} className='w-5 h-5' alt="" />
            Search with AI
          </button>
          <div className='border-2 border-white p-4 mt-4 space-y-3'>
            <p className='text-white font-black uppercase text-[10px] tracking-widest mb-3'>CATEGORIES</p>
            {['App Development', 'AI/ML', 'AI Tools', 'Data Science', 'Data Analytics', 'Ethical Hacking', 'UI UX Designing', 'Web Development', 'Others'].map((cat) => (
              <label key={cat} className="flex items-center gap-3 cursor-pointer text-white font-bold text-xs hover:text-gray-300 transition-colors">
                <input type="checkbox" className="accent-white w-4 h-4 border-2 border-white" value={cat} onChange={toggleCategory}/>
                {cat}
              </label>
            ))}
          </div>
        </form>
      </aside>

      {/* Main Courses Section */}
      <main className="w-full transition-all duration-300 py-[130px] md:pl-[300px] flex items-start justify-center md:justify-start flex-wrap gap-6 px-[10px]">
        {filterCourses?.map((item,index)=>(
          <Card key={index} thumbnail={item.thumbnail} title={item.title} price={item.price} category={item.category} id={item._id} reviews={item.reviews} />
        ))}
      </main>
    </div>
  );
}

export default AllCourses;

