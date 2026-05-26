import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { serverUrl } from '../App';

// Create a simple slice to store AI courses
const getAICourses = async (token) => {
  try {
    const response = await axios.get(
      `${serverUrl}/api/ai/my-courses`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data.courses || [];
  } catch (error) {
    console.error('Error fetching AI courses:', error);
    return [];
  }
};

const useGetAICourses = () => {
  const { token } = useSelector(state => state.user);
  
  useEffect(() => {
    if (token) {
      getAICourses(token);
    }
  }, [token]);
};

export default useGetAICourses;
