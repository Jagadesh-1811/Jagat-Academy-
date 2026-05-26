import axios from 'axios'
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { serverUrl } from '../App'
import { setUserData } from '../redux/userSlice'
import { toast } from 'react-toastify'
import { ClipLoader } from 'react-spinners'
import { useNavigate } from 'react-router-dom'
import Nav from '../components/Nav'
import Footer from '../components/Footer'

function EditProfile() {
  let { userData, token } = useSelector(state => state.user)
  let [name, setName] = useState(userData.name || "")
  let [description, setDescription] = useState(userData.description || "")
  let [photoUrl, setPhotoUrl] = useState(null)
  let dispatch = useDispatch()
  let [loading, setLoading] = useState(false)
  let navigate = useNavigate()

  const formData = new FormData()
  formData.append("name", name)
  formData.append("description", description)
  formData.append("photoUrl", photoUrl)

  const updateProfile = async () => {
    setLoading(true)
    try {
      const result = await axios.post(serverUrl + "/api/user/updateprofile", formData, { headers: { Authorization: `Bearer ${token}` } })
      console.log(result.data)
      dispatch(setUserData(result.data))
      navigate("/")
      setLoading(false)
      toast.success("Profile Update Successfully")
    } catch (error) {
      console.log(error)
      toast.error("Profile Update Error")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Nav />
      <div className="flex-grow flex items-center justify-center px-4 py-10 w-full">
        <div className="bg-white border-4 border-black p-8 max-w-xl w-full shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
        <h2 className="text-2xl font-black text-center text-black uppercase tracking-tight mb-6 border-b-2 border-black pb-4">Edit Profile</h2>

        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          <div className="flex flex-col items-center text-center">
            {userData?.photoUrl ? <img
              src={userData?.photoUrl}
              alt=""
              className="w-24 h-24 object-cover border-4 border-black"
            /> : <div className='w-24 h-24 text-white flex items-center justify-center text-3xl border-2 bg-black border-white cursor-pointer font-black'>
              {userData?.name ? userData.name.slice(0, 1).toUpperCase() : ''}
            </div>}
          </div>
          <div>
            <label className="text-sm font-black text-black uppercase tracking-wider block mb-2">Select Avatar</label>
            <input
              type="file"
              name="photoUrl"
              placeholder="Photo URL"
              className="w-full px-4 py-3 border-2 border-black font-bold text-sm"
              onChange={(e) => setPhotoUrl(e.target.files[0])}
            />
          </div>

          <div>
            <label className="text-sm font-black text-black uppercase tracking-wider block mb-2">Full Name</label>
            <input
              type="text"
              name="name"
              className="w-full px-4 py-3 border-2 border-black font-bold focus:outline-none focus:ring-2 focus:ring-black"
              placeholder={userData.name}
              onChange={(e) => setName(e.target.value)}
              value={name}
            />
          </div>

          <div>
            <label className="text-sm font-black text-black uppercase tracking-wider block mb-2">Email</label>
            <input
              type="email"
              readOnly
              className="w-full px-4 py-3 bg-gray-100 border-2 border-black text-gray-500 font-bold"
              placeholder={userData.email}
            />
          </div>

          <div>
            <label className="text-sm font-black text-black uppercase tracking-wider block mb-2">Description</label>
            <textarea
              name="description"
              className="w-full px-4 py-3 border-2 border-black font-bold resize-none focus:outline-none focus:ring-2 focus:ring-black"
              rows={3}
              placeholder="Tell us about yourself"
              onChange={(e) => setDescription(e.target.value)}
              value={description}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white py-3 font-black uppercase text-sm tracking-wider border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all cursor-pointer" disabled={loading} onClick={updateProfile}
          >
            {loading ? <ClipLoader size={30} color='white' /> : "Save Changes"}
          </button>
        </form>
      </div>
      </div>
      <Footer />
    </div>
  )
}

export default EditProfile
