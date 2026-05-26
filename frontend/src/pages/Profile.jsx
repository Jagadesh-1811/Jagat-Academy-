import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { serverUrl } from '../App'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import { setUserData, setToken } from '../redux/userSlice'
import UserFeedbackList from '../components/UserFeedbackList'
import StreakCounter from '../components/StreakCounter';
import { getBadgeIcon } from '../utils/gamificationHelpers';

function Profile() {
  let { userData, token } = useSelector(state => state.user)
  let dispatch = useDispatch()
  let navigate = useNavigate()

  const [gameProfile, setGameProfile] = React.useState(null);

  React.useEffect(() => {
    if (!userData?._id || !token) return;
    axios.get(`${serverUrl}/api/gamification/profile/${userData._id}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      if (res.data.success) {
        setGameProfile(res.data.profile);
      }
    }).catch(err => console.error(err));
  }, [userData?._id, token]);

  const handleDelete = async () => {
    const ok = window.confirm('Are you sure you want to delete your account? This action cannot be undone.')
    if (!ok) return
    try {
      const headers = {
        Authorization: `Bearer ${token}`
      }
      await axios.delete(serverUrl + '/api/auth/delete', { headers })
      // clear local user state
      dispatch(setUserData({}))
      dispatch(setToken(''))
      // clear local storage if token stored there
      localStorage.removeItem('token')
      navigate('/')
      alert('Account deleted successfully')
    } catch (error) {
      console.error('Delete account error', error)
      alert(error.response?.data?.message || 'Failed to delete account')
    }
  }
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Nav />
      <div className="flex-grow w-full px-4 py-10 flex flex-col items-center justify-start gap-6">
      {/* Streak Counter */}
      <div className="max-w-xl w-full flex justify-end">
        <StreakCounter />
      </div>

      <div className="bg-white border-4 border-black p-8 max-w-xl w-full relative shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
        {/* Profile Header */}
        <div className="flex flex-col items-center text-center">
          {userData?.photoUrl ? <img
            src={userData?.photoUrl}
            alt=""
            className="w-24 h-24 object-cover border-4 border-black"
          /> : <div className='w-24 h-24 text-white flex items-center justify-center text-3xl border-2 bg-black border-white cursor-pointer font-black'>
            {userData?.name ? userData.name.slice(0, 1).toUpperCase() : ''}
          </div>}
          <h2 className="text-2xl font-black mt-4 text-black uppercase tracking-tight">{userData?.name || ''}</h2>
          <p className="text-xs text-gray-500 font-black uppercase tracking-wider">{userData?.role || ''}</p>
        </div>

        {/* Profile Info */}
        <div className="mt-6 space-y-4 border-t-2 border-black pt-4">
          <div className="text-sm font-bold">
            <span className="font-black text-black uppercase text-xs tracking-wider">Email: </span>
            <span className="text-gray-600">{userData.email}</span>
          </div>

          <div className="text-sm font-bold">
            <span className="font-black text-black uppercase text-xs tracking-wider">Bio: </span>
            <span className="text-gray-600">{userData.description}</span>
          </div>

          <div className="text-sm font-bold">
            <span className="font-black text-black uppercase text-xs tracking-wider">Enrolled Courses: </span>
            <span className="text-gray-600">{userData?.enrolledCourses ? userData.enrolledCourses.length : 0}</span>
          </div>

          {/* Gamification Accolades Block */}
          {userData?.role === 'student' && gameProfile && (
            <div className="mt-6 border-4 border-black p-4 bg-gray-50 space-y-4">
              <div className="flex justify-between items-center border-b border-black pb-2">
                <span className="text-xs font-black uppercase tracking-widest text-gray-400">ACADEMY RANK ACCUMULATOR</span>
                <span className="bg-black text-white font-mono text-xs font-black px-2 py-0.5">LVL {gameProfile.level}</span>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-black uppercase text-gray-400 font-mono">
                  <span>⚡ {gameProfile.xp} XP Accum</span>
                  <span>🪙 {gameProfile.coins} Jagat Coins</span>
                </div>
                <div className="w-full bg-gray-200 h-3 border-2 border-black">
                  <div className="bg-black h-full" style={{ width: '65%' }} />
                </div>
              </div>

              {gameProfile.showcaseBadges?.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">FEATURED CABINET</span>
                  <div className="flex flex-wrap gap-2">
                    {gameProfile.showcaseBadges.map((badge) => (
                      <div 
                        key={badge._id} 
                        className="w-10 h-10 border-2 border-black bg-white flex items-center justify-center text-black"
                        title={badge.name}
                      >
                        {getBadgeIcon(badge.icon, 'w-6 h-6 text-black')}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button 
                onClick={() => navigate('/gamification')}
                className="w-full py-2 bg-black hover:bg-gray-800 text-white font-black text-xs uppercase tracking-widest border-2 border-black shadow-[4px_4px_0px_#000] cursor-pointer"
              >
                ENTER GAMIFICATION HUB
              </button>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-center gap-4 border-t-2 border-black pt-4">
          <button className="px-6 py-3 border-2 border-black bg-black text-white hover:bg-white hover:text-black cursor-pointer font-black uppercase text-xs tracking-wider shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all" onClick={() => navigate("/editprofile")}>
            Edit Profile
          </button>
          <button className="px-6 py-3 border-2 border-black bg-white text-black hover:bg-black hover:text-white cursor-pointer font-black uppercase text-xs tracking-wider shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all" onClick={handleDelete}>
            Delete Account
          </button>
        </div>
      </div>

      {/* User Feedback Section */}
      <div className="bg-white border-4 border-black p-6 max-w-xl w-full">
        <h3 className="text-lg font-black text-gray-800 mb-4 uppercase">My Feedback & Issues</h3>
        <UserFeedbackList userEmail={userData?.email} />
        <button
          onClick={() => navigate('/feedback')}
          className="mt-4 w-full py-2 bg-black hover:bg-gray-800 text-white border-2 border-black font-black uppercase text-xs tracking-widest cursor-pointer"
        >
          Submit New Feedback
        </button>
      </div>
      </div>
      <Footer />
    </div>
  )
}

export default Profile


