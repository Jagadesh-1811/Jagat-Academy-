import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { serverUrl } from '../../App';
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const MaterialsManager = () => {
    const navigate = useNavigate();
    const { courseId } = useParams();
    const { token } = useSelector((state) => state.user);
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [materials, setMaterials] = useState([]);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        fetchMaterials();
    }, [courseId]);

    const fetchMaterials = async () => {
        setFetching(true);
        try {
            const { data } = await axios.get(`${serverUrl}/api/material/course/${courseId}/materials`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMaterials(data);
        } catch (error) {
            console.error("Failed to fetch materials:", error);
            toast.error("Failed to load materials");
        } finally {
            setFetching(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !url.trim()) {
            toast.error('Title and URL are required');
            return;
        }
        setLoading(true);
        try {
            await axios.post(`${serverUrl}/api/material/course/${courseId}/materials`, { title, url }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Material added successfully');
            setTitle('');
            setUrl('');
            fetchMaterials();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add material');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (materialId) => {
        if (!window.confirm("Are you sure you want to delete this study material?")) return;
        try {
            await axios.delete(`${serverUrl}/api/material/materials/${materialId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Material deleted successfully");
            fetchMaterials();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete material");
        }
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <div className="bg-black border-b-4 border-black px-6 py-4">
                <div className="max-w-xl mx-auto flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="text-white hover:text-gray-300">
                        <ArrowBackIcon />
                    </button>
                    <div>
                        <h1 className="text-white font-black uppercase tracking-tight text-lg">Manage Study Materials</h1>
                        <p className="text-gray-400 text-xs font-bold uppercase">Add files, guides, and resource links</p>
                    </div>
                </div>
            </div>

            <div className="max-w-xl mx-auto p-6 space-y-8">
                {/* Form to Create */}
                <div className="border-4 border-black p-6 bg-gray-50 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <h2 className="text-sm font-black uppercase tracking-wider mb-4 border-b-2 border-black pb-2">Add New Material</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-gray-600">Material Title</label>
                            <input 
                                type="text" 
                                value={title} 
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Cheat Sheet or Project Assets" 
                                className="w-full border-2 border-black p-3 text-sm font-bold focus:outline-none bg-white" 
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-gray-600">Material URL (Link to Google Drive / Github / PDF)</label>
                            <input 
                                type="url" 
                                value={url} 
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://drive.google.com/..." 
                                className="w-full border-2 border-black p-3 text-sm font-bold focus:outline-none bg-white" 
                            />
                        </div>

                        <button type="submit" disabled={loading}
                            className="w-full bg-black text-white font-black py-4 text-xs uppercase border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all disabled:opacity-50">
                            {loading ? <ClipLoader size={20} color="white" /> : 'Add Material →'}
                        </button>
                    </form>
                </div>

                {/* List of Materials */}
                <div className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <div className="border-b-2 border-black p-4 bg-gray-50">
                        <h2 className="font-black uppercase text-xs tracking-wider">Course Resource Links</h2>
                    </div>

                    {fetching ? (
                        <div className="p-8 text-center">
                            <ClipLoader size={25} color="black" />
                        </div>
                    ) : materials.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 font-bold text-xs uppercase">
                            No study materials uploaded yet.
                        </div>
                    ) : (
                        <div className="divide-y divide-black">
                            {materials.map((material, index) => (
                                <div key={material._id} className="p-4 flex items-center justify-between gap-4">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase">Material #{index + 1}</p>
                                        <span className="text-sm font-black text-black block mt-0.5">{material.title}</span>
                                        <a href={material.url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-blue-600 underline block truncate mt-1">
                                            {material.url}
                                        </a>
                                    </div>
                                    <button 
                                        onClick={() => handleDelete(material._id)}
                                        className="bg-red-500 hover:bg-red-600 text-white font-black text-[9px] uppercase tracking-wider border-2 border-black px-3 py-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                                    >
                                        Delete
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MaterialsManager;
