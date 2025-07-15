import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';

const inputBase =
  'w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all';
const labelBase =
  'block font-semibold mb-1 text-gray-700 dark:text-gray-200';
const cardBase =
  'max-w-xl mx-auto p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl mt-24 border border-gray-200 dark:border-gray-800';
const buttonPrimary =
  'bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors font-semibold';
const buttonSecondary =
  'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors';

const UserDashboard = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef();

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
        const response = await axios.get('http://localhost:5000/api/userdetails', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUserDetails(response.data.user);
        setForm(response.data.user);
      } catch (err) {
        setError('Failed to fetch user details');
      } finally {
        setLoading(false);
      }
    };
    fetchUserDetails();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleResumeChange = (e) => {
    setResumeFile(e.target.files[0]);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      // Update user details
      await axios.put('http://localhost:5000/api/profile', form, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      // Upload resume if selected
      if (resumeFile) {
        const formData = new FormData();
        formData.append('resume', resumeFile);
        await axios.post('http://localhost:5000/api/profile/resume', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      setEditMode(false);
      setResumeFile(null);
      fileInputRef.current.value = '';
      // Refetch user details
      const response = await axios.get('http://localhost:5000/api/userdetails', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserDetails(response.data.user);
      setForm(response.data.user);
    } catch (err) {
      setError('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className={cardBase}>
      <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white text-center">User Dashboard</h2>
      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className={labelBase}>Name:</label>
          {editMode ? (
            <input name="name" value={form.name || ''} onChange={handleChange} className={inputBase} />
          ) : (
            <div className="text-lg text-gray-800 dark:text-gray-100">{userDetails?.name}</div>
          )}
        </div>
        <div>
          <label className={labelBase}>Email:</label>
          {editMode ? (
            <input name="email" value={form.email || ''} onChange={handleChange} className={inputBase} />
          ) : (
            <div className="text-lg text-gray-800 dark:text-gray-100">{userDetails?.email}</div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelBase}>College:</label>
            {editMode ? (
              <input name="college" value={form.college || ''} onChange={handleChange} className={inputBase} />
            ) : (
              <div className="text-gray-700 dark:text-gray-200">{userDetails?.college}</div>
            )}
          </div>
          <div>
            <label className={labelBase}>Course:</label>
            {editMode ? (
              <input name="course" value={form.course || ''} onChange={handleChange} className={inputBase} />
            ) : (
              <div className="text-gray-700 dark:text-gray-200">{userDetails?.course}</div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelBase}>Degree:</label>
            {editMode ? (
              <input name="degree" value={form.degree || ''} onChange={handleChange} className={inputBase} />
            ) : (
              <div className="text-gray-700 dark:text-gray-200">{userDetails?.degree}</div>
            )}
          </div>
          <div>
            <label className={labelBase}>Year of Graduation:</label>
            {editMode ? (
              <input name="yearOfGraduation" value={form.yearOfGraduation || ''} onChange={handleChange} className={inputBase} />
            ) : (
              <div className="text-gray-700 dark:text-gray-200">{userDetails?.yearOfGraduation}</div>
            )}
          </div>
        </div>
        <div>
          <label className={labelBase}>Resume:</label>
          {userDetails?.resumeUrl && (
            <div className="mb-2">
              <a href={userDetails.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 transition-colors">View Resume</a>
            </div>
          )}
          {editMode && (
            <input type="file" accept="application/pdf" onChange={handleResumeChange} ref={fileInputRef} className="block mt-1 text-gray-800 dark:text-gray-100" />
          )}
        </div>
        <div className="flex gap-4 mt-6 justify-center">
          {editMode ? (
            <>
              <button type="submit" disabled={saving} className={buttonPrimary + ' min-w-[100px]'}>{saving ? 'Saving...' : 'Save'}</button>
              <button type="button" onClick={() => { setEditMode(false); setForm(userDetails); setResumeFile(null); fileInputRef.current.value = ''; }} className={buttonSecondary}>Cancel</button>
            </>
          ) : (
            <button type="button" onClick={() => setEditMode(true)} className={buttonPrimary + ' min-w-[100px]'}>Edit</button>
          )}
        </div>
      </form>
    </div>
  );
};

export default UserDashboard; 