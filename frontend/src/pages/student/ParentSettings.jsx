import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { serverUrl } from '../../App';
import { toast } from 'react-toastify';
import Nav from '../../components/Nav';

function ParentSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState({
    linkingCode: '',
    age: 18,
    parents: [],
    pendingRequests: [],
    parentAccessControls: {
      showGrades: true,
      showAttendance: true,
      showAnalytics: true,
      showAssignments: true
    }
  });

  const fetchPortalData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await axios.get(`${serverUrl}/api/student/parent-portal`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setData({
          linkingCode: response.data.linkingCode,
          age: response.data.age,
          parents: response.data.parents,
          pendingRequests: response.data.pendingRequests,
          parentAccessControls: response.data.parentAccessControls
        });
      }
    } catch (error) {
      console.error('Failed to load parent portal details:', error);
      toast.error('Failed to load parent portal settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortalData();
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(data.linkingCode);
    toast.success('Linking code copied to clipboard!');
  };

  const handleUpdatePrivacy = async (key, val) => {
    const updatedControls = { ...data.parentAccessControls, [key]: val };
    setData((prev) => ({ ...prev, parentAccessControls: updatedControls }));

    const token = localStorage.getItem('token');
    try {
      await axios.put(
        `${serverUrl}/api/student/parent-privacy`,
        { [key]: val },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Privacy control updated.');
    } catch (error) {
      console.error('Failed to update privacy control:', error);
      toast.error('Failed to save settings.');
    }
  };

  const handleAgeChange = async (newAge) => {
    const ageVal = parseInt(newAge) || 18;
    setData((prev) => ({ ...prev, age: ageVal }));

    const token = localStorage.getItem('token');
    try {
      await axios.put(
        `${serverUrl}/api/student/parent-privacy`,
        { age: ageVal },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Student age updated.');
    } catch (error) {
      console.error('Failed to update age:', error);
      toast.error('Failed to save age.');
    }
  };

  const handleApproval = async (parentId, action) => {
    setSaving(true);
    const token = localStorage.getItem('token');
    const endpoint = action === 'approve' ? 'approve-parent' : 'reject-parent';

    try {
      const response = await axios.post(
        `${serverUrl}/api/student/${endpoint}`,
        { parentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        fetchPortalData();
      }
    } catch (error) {
      console.error(`Failed to ${action} parent request:`, error);
      toast.error('Action failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center font-sans">
        <span className="text-xs uppercase tracking-widest">Loading Settings...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col">
      <Nav />

      <main className="flex-grow p-6 md:p-12 max-w-4xl mx-auto w-full space-y-12">
        {/* Header Title */}
        <div className="border-b border-neutral-800 pb-6">
          <h1 className="text-3xl font-bold tracking-tight uppercase">
            Parent Portal Settings
          </h1>
          <p className="text-xs uppercase text-neutral-400 tracking-wider mt-2">
            Configure access controls, manage linked parents, and share academic progress.
          </p>
        </div>

        {/* 1. Linking Code Section */}
        <section className="bg-neutral-950 border border-neutral-800 p-8 space-y-6">
          <div>
            <h2 className="text-lg font-bold tracking-wider uppercase mb-1">
              Your Profile Link Details
            </h2>
            <p className="text-xs text-neutral-400 uppercase tracking-wider">
              Share your linking code or registered email address with a parent.
            </p>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-black p-4 border border-neutral-900">
            <div>
              <span className="block text-[10px] text-neutral-500 uppercase tracking-widest mb-1">
                Profile Linking Code
              </span>
              <span className="text-lg font-mono tracking-widest text-white">
                {data.linkingCode || 'NOT_GENERATED'}
              </span>
            </div>
            <button
              onClick={handleCopyCode}
              className="bg-white text-black hover:bg-neutral-200 transition-colors px-6 py-2 text-xs uppercase font-bold tracking-widest cursor-pointer self-start md:self-auto"
            >
              [COPY CODE]
            </button>
          </div>

        </section>

        {/* 2. Privacy Settings Section */}
        <section className="bg-neutral-950 border border-neutral-800 p-8 space-y-6">
          <div>
            <h2 className="text-lg font-bold tracking-wider uppercase mb-1">
              Visibility Permissions
            </h2>
            <p className="text-xs text-neutral-400 uppercase tracking-wider">
              Toggle checkmarks to grant or block parent view permissions in real-time.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between py-2 border-b border-neutral-900">
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-white">
                  Share Grades
                </span>
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider">
                  Grades, quiz submissions, and teacher feedback evaluation.
                </span>
              </div>
              <input
                type="checkbox"
                checked={data.parentAccessControls.showGrades}
                onChange={(e) => handleUpdatePrivacy('showGrades', e.target.checked)}
                className="w-5 h-5 accent-white cursor-pointer border border-neutral-800 bg-black"
              />
            </div>

            <div className="flex items-center justify-between py-2 border-b border-neutral-900">
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-white">
                  Share Attendance Logs
                </span>
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider">
                  Attendance logs, lecture watch states, and presence rates.
                </span>
              </div>
              <input
                type="checkbox"
                checked={data.parentAccessControls.showAttendance}
                onChange={(e) => handleUpdatePrivacy('showAttendance', e.target.checked)}
                className="w-5 h-5 accent-white cursor-pointer border border-neutral-800 bg-black"
              />
            </div>

            <div className="flex items-center justify-between py-2 border-b border-neutral-900">
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-white">
                  Share Course Progress Analytics
                </span>
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider">
                  Analytics trends, time logs, and completion levels.
                </span>
              </div>
              <input
                type="checkbox"
                checked={data.parentAccessControls.showAnalytics}
                onChange={(e) => handleUpdatePrivacy('showAnalytics', e.target.checked)}
                className="w-5 h-5 accent-white cursor-pointer border border-neutral-800 bg-black"
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-white">
                  Share Assignments
                </span>
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider">
                  Upcoming course tasks, projects, and deadlines.
                </span>
              </div>
              <input
                type="checkbox"
                checked={data.parentAccessControls.showAssignments}
                onChange={(e) => handleUpdatePrivacy('showAssignments', e.target.checked)}
                className="w-5 h-5 accent-white cursor-pointer border border-neutral-800 bg-black"
              />
            </div>
          </div>
        </section>

        {/* 3. Linked Parents */}
        <section className="bg-neutral-950 border border-neutral-800 p-8 space-y-6">
          <div>
            <h2 className="text-lg font-bold tracking-wider uppercase mb-1">
              Linked Parents
            </h2>
            <p className="text-xs text-neutral-400 uppercase tracking-wider">
              Active parent connections with access.
            </p>
          </div>

          {data.parents.length === 0 ? (
            <div className="border border-dashed border-neutral-800 p-6 text-center">
              <span className="text-xs uppercase tracking-wider text-neutral-600 block">
                No parents linked
              </span>
            </div>
          ) : (
            <ul className="space-y-4">
              {data.parents.map((p) => (
                <li key={p._id} className="p-4 bg-black border border-neutral-900 flex justify-between items-center">
                  <div>
                    <span className="block text-xs font-bold uppercase tracking-wider text-white">
                      {p.name}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-500">
                      {p.email}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <footer className="border-t border-neutral-800 py-6 px-8 text-center text-xs text-neutral-600 uppercase tracking-widest">
        &copy; {new Date().getFullYear()} JAGAT ACADEMY. HIGH-CONTRAST SECURE FRAME.
      </footer>
    </div>
  );
}

export default ParentSettings;
