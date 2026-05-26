import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { serverUrl } from '../App';


const MonthlyQuiz = () => {
    const { userData, token } = useSelector((state) => state.user);
    const [quiz, setQuiz] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [isQuizActive, setIsQuizActive] = useState(false);
    const [isQuizClosed, setIsQuizClosed] = useState(false);
    const [isLastDayOfMonth, setIsLastDayOfMonth] = useState(false);

    const countdownTimerRef = useRef(null);

    useEffect(() => {
        const checkDateAndFetchQuiz = async () => {
            if (!userData || !userData.enrolledCourses || userData.enrolledCourses.length === 0) {
                setQuiz(null);
                setIsLastDayOfMonth(false);
                return;
            }
            const today = new Date();
            const year = today.getFullYear();
            const month = today.getMonth(); // 0-indexed
            const lastDay = new Date(year, month + 1, 0).getDate(); // Get last day of current month

            if (today.getDate() === lastDay) {
                setIsLastDayOfMonth(true);

                if (Array.isArray(userData?.enrolledCourses) && userData.enrolledCourses.length > 0) {
                    let foundQuiz = null;
                    let latestSchedule = null;

                    for (const course of userData.enrolledCourses) {
                        try {
                            const { data } = await axios.get(`${serverUrl}/api/quiz/course/${course._id}`, {
                                headers: {
                                    Authorization: `Bearer ${token}`
                                }
                            });
                            
                            const courseMonthlyQuiz = data.quizzes.find(q => {
                                const quizScheduleDate = new Date(q.schedule);
                                return quizScheduleDate.getDate() === lastDay && quizScheduleDate.getMonth() === month;
                            });

                            if (courseMonthlyQuiz) {
                                const currentQuizSchedule = new Date(courseMonthlyQuiz.schedule);
                                if (!latestSchedule || currentQuizSchedule.getTime() > latestSchedule.getTime()) {
                                    latestSchedule = currentQuizSchedule;
                                    foundQuiz = courseMonthlyQuiz;
                                }
                            }
                        } catch (error) {
                            console.error(`Error fetching quizzes for course ${course._id}:`, error);
                            // Continue to next course even if one fails
                        }
                    }

                    if (foundQuiz) {
                        setQuiz(foundQuiz);
                        // Clear previous countdown interval before starting a new one
                        if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
                        countdownTimerRef.current = startCountdown(new Date(foundQuiz.schedule));
                    } else {
                        setQuiz(null);
                        // Clear any existing countdown if no quiz is found
                        if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
                        setTimeRemaining(0);
                        setIsQuizActive(false);
                        setIsQuizClosed(false);
                    }

                } else {
                    setQuiz(null);
                    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
                    setTimeRemaining(0);
                    setIsQuizActive(false);
                    setIsQuizClosed(false);
                }
            } else {
                setIsLastDayOfMonth(false);
                setQuiz(null);
                if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
                setTimeRemaining(0);
                setIsQuizActive(false);
                setIsQuizClosed(false);
            }
        };

        const startCountdown = (scheduleDate) => {
            if (countdownTimerRef.current) clearInterval(countdownTimerRef.current); // Clear previous timer

            const updateCountdown = () => {
                const now = new Date();
                const quizStartTime = new Date(scheduleDate);
                quizStartTime.setHours(22, 0, 0, 0); // Set to 10 PM on the scheduled day
                const quizEndTime = new Date(scheduleDate);
                quizEndTime.setHours(23, 0, 0, 0); // Set to 11 PM on the scheduled day

                const diffToStart = quizStartTime.getTime() - now.getTime();
                const diffToEnd = quizEndTime.getTime() - now.getTime();

                if (diffToStart > 0) {
                    setTimeRemaining(diffToStart);
                    setIsQuizActive(false);
                    setIsQuizClosed(false);
                } else if (diffToEnd > 0) {
                    setTimeRemaining(diffToEnd);
                    setIsQuizActive(true);
                    setIsQuizClosed(false);
                } else {
                    setTimeRemaining(0);
                    setIsQuizActive(false);
                    setIsQuizClosed(true);
                    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current); // Quiz closed, stop countdown
                }
            };

            updateCountdown(); // Initial call
            countdownTimerRef.current = setInterval(updateCountdown, 1000);
            return countdownTimerRef.current; // Return the interval ID for cleanup
        };

        checkDateAndFetchQuiz();
        const fetchInterval = setInterval(checkDateAndFetchQuiz, 60 * 60 * 1000); // Check for quiz every hour

        return () => {
            clearInterval(fetchInterval);
            if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
        };
    }, [userData?.enrolledCourses]);

    const formatTime = (ms) => {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    if (!isLastDayOfMonth || !quiz) {
        return null; // Don't render if not the last day or no quiz found
    }

    return (
        <div className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 mb-8 mx-auto max-w-4xl bg-white">
            <div className="border-b-4 border-black pb-4 mb-6">
                <h2 className="text-3xl font-black text-center uppercase tracking-tight text-black">Quiz of the Month!</h2>
                <p className="text-center text-base font-bold text-gray-600 mt-1">Join the Monthly Quiz (10PM–11PM)</p>
            </div>

            <div className="bg-gray-50 border-2 border-black p-4 mb-6 space-y-2">
                <p className="text-sm font-bold">Instructions: <span className="font-normal text-gray-700">{quiz?.instructions}</span></p>
                <p className="text-sm font-bold">Rewards: <span className="font-normal text-gray-700">{quiz?.rewards}</span></p>
                <p className="text-sm font-bold">Scheduled: <span className="font-normal text-gray-700">{quiz?.schedule ? new Date(quiz.schedule).toLocaleString() : 'N/A'}</span></p>
            </div>

            <div className="text-center mb-6">
                {isQuizClosed ? (
                    <button
                        className="bg-gray-300 text-gray-600 font-black py-3 px-8 text-lg border-2 border-black cursor-not-allowed uppercase tracking-wider"
                        disabled
                    >
                        Quiz Closed
                    </button>
                ) : (
                    <button
                        className={`font-black py-3 px-8 text-lg border-2 border-black uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all ${
                            isQuizActive ? 'bg-black text-white' : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                        onClick={() => isQuizActive && window.open(quiz?.quizLink, '_blank')}
                        disabled={!isQuizActive}
                    >
                        {isQuizActive ? "Start Quiz Now!" : `Starts in ${formatTime(timeRemaining)}`}
                    </button>
                )}
            </div>

            {isQuizClosed && quiz?.liveSessionLink && (
                <div className="text-center mt-6 pt-4 border-t-2 border-black">
                    <p className="text-sm font-bold text-gray-700 mb-2">Join the post-quiz discussion:</p>
                    <a
                        href={quiz?.liveSessionLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block border-2 border-black bg-black text-white font-black uppercase text-xs px-6 py-3 hover:bg-white hover:text-black transition-none"
                    >
                        Live Session Link →
                    </a>
                </div>
            )}
        </div>
    );
};

export default MonthlyQuiz;
