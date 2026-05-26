import React, { useEffect } from 'react'
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackLongIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { serverUrl } from '../../App';
import { toast } from 'react-toastify';
import { setCreatorCourseData } from '../../redux/courseSlice';
import img1 from "../../assets/empty.jpg"

function Courses() {

  let navigate = useNavigate()
  let dispatch = useDispatch()

  const { creatorCourseData } = useSelector(state => state.course)
  const { token } = useSelector(state => state.user);

  useEffect(() => {
    const getCreatorData = async () => {
      try {
        const result = await axios.get(serverUrl + "/api/course/getcreatorcourses", { headers: { Authorization: `Bearer ${token}` } })
        await dispatch(setCreatorCourseData(result.data))
        console.log(result.data)
      } catch (error) {
        console.log(error)
        toast.error(error.response?.data?.message || "Error fetching courses")
      }
    }
    getCreatorData()
  }, [token])

  return (
    <div className="flex min-h-screen bg-white">
      <div className="w-[100%] min-h-screen p-4 sm:p-6 bg-white">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
          <div className='flex items-center justify-center gap-3'>
            <ArrowBackLongIcon className='w-[22px] h-[22px] cursor-pointer border-2 border-black p-1 box-content hover:bg-black hover:text-white transition-none' onClick={() => navigate("/teacher/dashboard")} />
            <h1 className="text-xl font-black uppercase tracking-tight">Courses</h1>
          </div>

          <button className="bg-black text-white font-black text-sm uppercase tracking-wider px-6 py-3 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all" onClick={() => navigate("/createcourses")}>
            Create Course →
          </button>
        </div>

        {/* For larger screens (table layout) */}
        <div className="hidden md:block border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-black text-white">
              <tr>
                <th className="text-left py-3 px-4 font-black uppercase text-xs tracking-wider">Course</th>
                <th className="text-left py-3 px-4 font-black uppercase text-xs tracking-wider">Price</th>
                <th className="text-left py-3 px-4 font-black uppercase text-xs tracking-wider">Status</th>
                <th className="text-left py-3 px-4 font-black uppercase text-xs tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody>
              {creatorCourseData?.map((course, index) => (
                <tr key={index} className="border-b-2 border-black hover:bg-gray-100 transition-none">
                  <td className="py-3 px-4 flex items-center gap-4">
                    {course?.thumbnail ? <img
                      src={course?.thumbnail}
                      alt=""
                      className="w-24 h-14 object-cover border-2 border-black"
                    /> : <img src={img1} alt='' className="w-14 h-14 object-cover border-2 border-black" />}
                    <span className="font-bold text-sm">{course?.title}</span>
                  </td>
                  {course?.price ? <td className="py-3 px-4 font-bold">₹{course?.price}</td> : <td className="py-3 px-4 font-bold">₹ NA</td>}
                  <td className="py-3 px-4">
                    <span className={`inline-block px-3 py-1 text-xs font-black uppercase tracking-wider border-2 border-black ${course?.isPublished ? "bg-black text-white" : "bg-white text-black"}`}>
                      {course?.isPublished ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <EditIcon className="text-black cursor-pointer border-2 border-black p-1 box-content hover:bg-black hover:text-white transition-none" onClick={() => navigate(`/addcourses/${course?._id}`)} />
                      <button onClick={() => navigate(`/admin/create-doubt-session/${course?._id}`)} className="bg-black text-white font-black uppercase text-[10px] tracking-wider px-3 py-2 border-2 border-black hover:bg-white hover:text-black transition-all">Doubt Session</button>
                      <button onClick={() => navigate(`/teacher/materials/${course?._id}`)} className="bg-black text-white font-black uppercase text-[10px] tracking-wider px-3 py-2 border-2 border-black hover:bg-white hover:text-black transition-all">Materials</button>
                      <button onClick={() => navigate(`/teacher/attendance/${course?._id}`)} className="bg-black text-white font-black uppercase text-[10px] tracking-wider px-3 py-2 border-2 border-black hover:bg-white hover:text-black transition-all">Attendance</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-center text-sm text-gray-500 mt-4 mb-4 font-bold uppercase tracking-wider">
            A list of your recent courses.
          </p>
        </div>

        {/* Mobile view */}
        <div className="md:hidden space-y-4">
          {creatorCourseData?.map((course, index) => (
            <div key={index} className="border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-4 flex flex-col gap-3">
              <div className="flex gap-4 items-center">
                {course?.thumbnail ? <img
                  src={course?.thumbnail}
                  alt=""
                  className="w-16 h-16 object-cover border-2 border-black"
                /> : <img
                  src={img1}
                  alt=""
                  className="w-16 h-16 object-cover border-2 border-black"
                />}
                <div className="flex-1">
                  <h2 className="font-black text-sm uppercase">{course?.title}</h2>
                  {course?.price ? <p className="text-gray-600 font-bold text-xs mt-1">₹{course?.price}</p> : <p className="text-gray-600 font-bold text-xs mt-1">₹ NA</p>}
                </div>
                <EditIcon className="text-black cursor-pointer border-2 border-black p-1 box-content hover:bg-black hover:text-white transition-none" onClick={() => navigate(`/addcourses/${course?._id}`)} />
              </div>
              <div className="flex items-center justify-between mt-2 gap-2 flex-wrap">
                <span className={`px-3 py-1 text-xs font-black uppercase tracking-wider border-2 border-black ${course?.isPublished ? "bg-black text-white" : "bg-white text-black"}`}>
                  {course?.isPublished ? "Published" : "Draft"}
                </span>
                <div className="flex gap-2">
                  <button onClick={() => navigate(`/teacher/materials/${course?._id}`)} className="bg-black text-white font-black uppercase text-[10px] tracking-wider px-3 py-2 border-2 border-black">Materials</button>
                  <button onClick={() => navigate(`/teacher/attendance/${course?._id}`)} className="bg-black text-white font-black uppercase text-[10px] tracking-wider px-3 py-2 border-2 border-black">Attendance</button>
                </div>
              </div>
            </div>
          ))}
          <p className="text-center text-sm text-gray-500 font-bold uppercase tracking-wider mt-6">
            A list of your recent courses.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Courses;
