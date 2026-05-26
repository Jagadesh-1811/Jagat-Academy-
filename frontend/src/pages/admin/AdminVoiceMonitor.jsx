import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../../App';
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import RefreshIcon from '@mui/icons-material/Refresh';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const AdminVoiceMonitor = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [activeRooms, setActiveRooms] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            navigate('/admin/login');
            return;
        }
        fetchActiveRooms();
        const interval = setInterval(fetchActiveRooms, 5000);
        return () => clearInterval(interval);
    }, [navigate]);

    const fetchActiveRooms = async () => {
        try {
            const response = await axios.get(`${serverUrl}/api/voice-room/admin/active`);
            if (response.data?.success) {
                setActiveRooms(response.data.rooms || []);
            }
        } catch (error) {
            console.error('Error fetching active rooms:', error);
        }
        setLoading(false);
        setRefreshing(false);
    };

    const handleEndRoom = async (roomId) => {
        try {
            const response = await axios.post(`${serverUrl}/api/voice-room/admin/${roomId}/end`);
            if (response.data?.success) {
                toast.success('Voice room ended successfully');
                fetchActiveRooms();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to end room');
        }
    };

    const formatDuration = (startTime) => {
        const duration = Date.now() - new Date(startTime).getTime();
        const mins = Math.floor(duration / 60000);
        const secs = Math.floor((duration % 60000) / 1000);
        return `${mins}m ${secs}s`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <ClipLoader size={40} color="#000" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <div className="bg-black border-b-4 border-black px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/admin/dashboard')} className="text-white hover:text-gray-300">
                            <ArrowBackIcon />
                        </button>
                        <div>
                            <h1 className="text-white font-black uppercase tracking-tight text-xl flex items-center gap-2">
                                <MicIcon /> Voice Room Monitor
                            </h1>
                            <p className="text-gray-400 text-xs font-bold uppercase">Live Active Sessions</p>
                        </div>
                    </div>
                    <button onClick={fetchActiveRooms} disabled={refreshing}
                        className="border-2 border-white text-white px-4 py-2 text-xs font-black uppercase hover:bg-white hover:text-black transition-none disabled:opacity-50">
                        {refreshing ? 'Refreshing...' : '↻ Refresh'}
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="border-4 border-black p-4 bg-gray-50">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Active Rooms</span>
                        <p className="text-4xl font-black mt-1">{activeRooms.length}</p>
                    </div>
                    <div className="border-4 border-black p-4 bg-black text-white">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Duration</span>
                        <p className="text-4xl font-black mt-1">
                            {activeRooms.reduce((acc, room) => {
                                return acc + (Date.now() - new Date(room.startTime).getTime());
                            }, 0) / 60000 > 0 
                                ? `${Math.floor(activeRooms.reduce((acc, room) => acc + (Date.now() - new Date(room.startTime).getTime()), 0) / 60000)}m`
                                : '0m'}
                        </p>
                    </div>
                </div>

                {/* Active Rooms */}
                {activeRooms.length === 0 ? (
                    <div className="border-4 border-black p-12 text-center">
                        <div className="w-16 h-16 border-2 border-black flex items-center justify-center mx-auto mb-4">
                            <MicIcon className="text-gray-400" style={{fontSize: 32}} />
                        </div>
                        <h3 className="text-lg font-black uppercase">No Active Voice Rooms</h3>
                        <p className="text-gray-500 text-xs font-bold mt-2">All voice communication channels are currently idle.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {activeRooms.map((room) => (
                            <div key={room._id} className="border-4 border-black p-4 bg-gray-50">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 bg-red-500" />
                                        <span className="text-xs font-black uppercase tracking-wider text-red-600">LIVE</span>
                                    </div>
                                    <button onClick={() => handleEndRoom(room._id)}
                                        className="bg-red-600 text-white px-4 py-2 text-xs font-black uppercase border-2 border-red-600 hover:bg-red-700 transition-none flex items-center gap-1">
                                        <StopIcon style={{fontSize: 14}} /> End Room
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-bold">
                                    <div className="border border-black p-2">
                                        <span className="text-gray-500 block uppercase tracking-wider mb-1 flex items-center gap-1"><PersonIcon style={{fontSize: 12}} /> Student</span>
                                        {room.student?.name || 'Unknown'}
                                    </div>
                                    <div className="border border-black p-2">
                                        <span className="text-gray-500 block uppercase tracking-wider mb-1 flex items-center gap-1"><SchoolIcon style={{fontSize: 12}} /> Educator</span>
                                        {room.educator?.name || 'Unknown'}
                                    </div>
                                    <div className="border border-black p-2">
                                        <span className="text-gray-500 block uppercase tracking-wider mb-1 flex items-center gap-1"><AccessTimeIcon style={{fontSize: 12}} /> Duration</span>
                                        {formatDuration(room.startTime)}
                                    </div>
                                    <div className="border border-black p-2">
                                        <span className="text-gray-500 block uppercase tracking-wider mb-1">Started</span>
                                        {new Date(room.startTime).toLocaleTimeString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminVoiceMonitor;
