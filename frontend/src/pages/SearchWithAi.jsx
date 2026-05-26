import React, { useState } from 'react'
import ai from "../assets/ai.png"
import ai1 from "../assets/SearchAi.png"
import { useSelector } from 'react-redux';
import axios from 'axios';
import { serverUrl } from '../App';
import { useNavigate } from 'react-router-dom';
import start from "../assets/start.mp3"
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { RiMicAiFill } from "react-icons/ri";
import { TbSearch, TbSparkles } from 'react-icons/tb';

function SearchWithAi() {
  const [input, setInput] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const startSound = new Audio(start)
  const { token } = useSelector(state => state.user);

  function speak(message) {
    window.speechSynthesis.cancel();
    const chunks = message.match(/[^.!?]+[.!?]+/g) || [message];
    let currentChunk = 0;

    const speakNextChunk = () => {
        if (currentChunk >= chunks.length) return;
        let utterance = new SpeechSynthesisUtterance(chunks[currentChunk].trim());
        utterance.onend = () => {
            currentChunk++;
            speakNextChunk();
        };
        window.speechSynthesis.speak(utterance);
    };
    
    speakNextChunk();
  }

  const recognition = React.useMemo(() => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRec) {
      return new SpeechRec();
    }
    console.log("Speech recognition not supported");
    return null;
  }, []);

  const handleSearch = async () => {
    if (!recognition) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }
    setListening(true);
    try {
      startSound.play().catch(e => console.log('Audio play failed:', e));
    } catch(e) {}
    
    try {
      recognition.start();
    } catch (e) {
      setListening(false);
    }
    
    recognition.onresult = async (e) => {
      const transcript = e.results[0][0].transcript.trim();
      setInput(transcript);
      setListening(false);
      await handleRecommendation(transcript);
    };

    recognition.onerror = (e) => {
      console.log('Speech recognition error', e.error);
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };
  };

  const handleRecommendation = async (query) => {
    if (!query || query.trim() === '') return;
    setLoading(true);
    try {
      const result = await axios.post(`${serverUrl}/api/ai/search`, { input: query }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setRecommendations(result.data);
      if (result.data.length > 0) {
        speak("These are the top courses I found for you");
      } else {
        speak("No courses found");
      }
    } catch (error) {
      console.log(error);
      speak("Sorry, the search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Nav />
      <div className="flex-grow flex flex-col items-center px-4 py-16 w-full">

      {/* Search Container */}
      <div className="bg-white border-4 border-white p-6 sm:p-8 w-full max-w-2xl text-center relative shadow-[8px_8px_0px_0px_rgba(255,255,255,0.15)]">
        <h1 className="text-2xl sm:text-3xl font-black text-black uppercase mb-6 flex items-center justify-center gap-2 tracking-tight">
          <img src={ai} className='w-8 h-8 sm:w-[30px] sm:h-[30px] border-2 border-black' alt="AI" />
          Search with <span className='text-gray-500'>AI</span>
        </h1>

        <div className="flex items-center border-2 border-black overflow-hidden relative w-full">
          <input
            type="text"
            className="flex-grow px-4 py-3 bg-white text-black placeholder-gray-400 focus:outline-none text-sm sm:text-base font-bold"
            placeholder="What do you want to learn? (e.g. AI, MERN, Cloud...)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRecommendation(input)}
          />
          <button
            onClick={() => handleRecommendation(input)}
            className="bg-black text-white w-10 h-10 flex items-center justify-center border-l-2 border-black hover:bg-gray-800 transition-colors"
            title="Search with AI"
          >
            <div className="relative">
              <TbSearch className="w-5 h-5" />
              <TbSparkles className="w-2.5 h-2.5 absolute -top-1 -right-1 animate-pulse" />
            </div>
          </button>
          <button
            className="bg-gray-200 w-10 h-10 flex items-center justify-center border-l-2 border-black hover:bg-gray-300 transition-colors"
            onClick={handleSearch}
          >
            <RiMicAiFill className="w-5 h-5 text-black" />
          </button>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 ? (
        <div className="w-full max-w-6xl mt-12 px-2 sm:px-4">
          <h2 className="text-xl sm:text-2xl font-black mb-6 text-white text-center flex items-center justify-center gap-3 uppercase tracking-tight">
            <img src={ai1} className="w-10 h-10 sm:w-[60px] sm:h-[60px] p-2 border-2 border-white" alt="AI Results" />
            AI Search Results
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {recommendations.map((course, index) => (
              <div
                key={index}
                className="bg-white text-black p-5 border-4 border-white shadow-[8px_8px_0px_0px_rgba(255,255,255,0.15)] cursor-pointer hover:-translate-y-1 hover:shadow-[10px_10px_0px_0px_rgba(255,255,255,0.2)] transition-all"
                onClick={() => navigate(`/viewcourse/${course._id}`)}
              >
                <h3 className="text-lg font-black uppercase tracking-tight">{course.title}</h3>
                <p className="text-xs font-bold text-gray-500 uppercase mt-2">{course.category}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        loading ? <h1 className='text-center text-xl sm:text-2xl mt-10 text-gray-500 font-bold'>Searching with AI... <span className="animate-pulse">✨</span></h1> :
        listening ? <h1 className='text-center text-xl sm:text-2xl mt-10 text-red-500 font-bold animate-pulse'>Listening to your voice... 🎙️</h1> : 
        <h1 className='text-center text-xl sm:text-2xl mt-10 text-gray-500 font-bold'>No Courses Found</h1>
      )}
      </div>
      <Footer />
    </div>
  );
}

export default SearchWithAi;
