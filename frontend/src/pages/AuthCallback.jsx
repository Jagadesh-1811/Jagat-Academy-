import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { setUserData, setToken } from '../redux/userSlice';
import { serverUrl } from '../App';
import { ClipLoader from 'react-spinners';

function AuthCallback() {
  const { provider } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [status, setStatus] = useState('Processing...');

  useEffect(() => {
    const handleAuth = async () => {
      try {
        const tokenFromUrl = searchParams.get('token');
        const firebaseToken = searchParams.get('firebaseToken');

        if (firebaseToken) {
          // Firebase token based auth
          dispatch(setToken(firebaseToken));
          localStorage.setItem('token', firebaseToken);

          // Sync user data with backend
          const response = await axios.post(
            `${serverUrl}/api/auth/sync`,
            {},
            { headers: { Authorization: `Bearer ${firebaseToken}` } }
          );
          dispatch(setUserData(response.data.user));
          setStatus('Login successful! Redirecting...');
          setTimeout(() => navigate('/'), 1500);
        } else if (tokenFromUrl) {
          // Direct JWT token based auth
          dispatch(setToken(tokenFromUrl));
          localStorage.setItem('token', tokenFromUrl);

          const response = await axios.get(`${serverUrl}/api/user/currentuser`, {
            headers: { Authorization: `Bearer ${tokenFromUrl}` },
          });
          dispatch(setUserData(response.data));
          setStatus('Login successful! Redirecting...');
          setTimeout(() => navigate('/'), 1500);
        } else {
          setStatus('No authentication token found. Please try logging in again.');
        }
      } catch (error) {
        console.error('Auth Callback Error:', error);
        setStatus('Authentication failed. Please try again.');
      }
    };

    if (provider) {
      handleAuth();
    }
  }, [provider, searchParams, dispatch, navigate]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="bg-white border-4 border-black p-10 max-w-md w-full shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center gap-4">
        <div className="w-20 h-20 bg-black flex items-center justify-center border-2 border-black">
          <ClipLoader size={30} color="white" />
        </div>
        <p className="text-lg font-black text-black text-center uppercase tracking-tight">
          {status}
        </p>
        {(status.includes('failed') || status.includes('No token')) && (
          <Link
            to="/auth"
            className="mt-4 px-8 py-3 bg-black text-white font-black uppercase text-sm tracking-wider border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-none"
          >
            Back to Login
          </Link>
        )}
      </div>
    </div>
  );
}

export default AuthCallback;
