import axios from 'axios';
import { queryOpenAI } from '../utils/aiHelper.js';

const MODULE_COUNT_BY_LEVEL = {
  Beginner: 2,
  Intermediate: 4,
  Advanced: 5
};

const buildVideo = (id, title, channelTitle, topic) => ({
  id,
  title,
  description: `A practical lesson for ${topic}.`,
  thumbnail: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
  channelTitle,
  publishedAt: new Date().toISOString(),
  embedUrl: `https://www.youtube.com/embed/${id}?autoplay=0&rel=0&modestbranding=1`,
  watchUrl: `https://www.youtube.com/watch?v=${id}`,
  duration: 'N/A',
  viewCount: 0,
  likeCount: 0
});

const rotate = (items, offset = 0) => {
  if (items.length === 0) return [];
  const start = offset % items.length;
  return [...items.slice(start), ...items.slice(0, start)];
};

const getFallbackVideos = (topic, maxResults = 5, offset = 0) => {
  const lowerTopic = topic.toLowerCase();
  let videos = [
    buildVideo('kUMe1FH4CHE', 'HTML and CSS Full Course for Beginners', 'freeCodeCamp.org', topic),
    buildVideo('PkZNo7MFNFg', 'Learn JavaScript - Full Course for Beginners', 'freeCodeCamp.org', topic),
    buildVideo('rfscVS0vtbw', 'Python for Beginners - Full Course', 'freeCodeCamp.org', topic),
    buildVideo('bMknfKXIFA8', 'React Course - Beginner Tutorial', 'freeCodeCamp.org', topic),
    buildVideo('GwIo3gGTO3A', 'Machine Learning for Everybody', 'freeCodeCamp.org', topic)
  ];

  if (lowerTopic.includes('python')) {
    videos = [
      buildVideo('rfscVS0vtbw', 'Python for Beginners - Full Course', 'freeCodeCamp.org', topic),
      buildVideo('kqtD5dpn9C8', 'Python Tutorial for Beginners', 'Programming with Mosh', topic),
      buildVideo('_uQrJ0TkZlc', 'Python Full Course for Beginners', 'Programming with Mosh', topic),
      buildVideo('HGOBQPFzWKo', 'Intermediate Python Programming Course', 'freeCodeCamp.org', topic),
      buildVideo('8DvywoWv6fI', 'Python for Everybody', 'freeCodeCamp.org', topic)
    ];
  } else if (lowerTopic.includes('machine learning') || lowerTopic.includes('ml') || lowerTopic.includes('ai')) {
    videos = [
      buildVideo('GwIo3gGTO3A', 'Machine Learning for Everybody', 'freeCodeCamp.org', topic),
      buildVideo('aircAruvnKk', 'But what is a neural network?', '3Blue1Brown', topic),
      buildVideo('IHZwWFHWa-w', 'Neural Networks from Scratch', 'Sentdex', topic),
      buildVideo('i_LwzRVP7bg', 'Machine Learning Explained', 'Simplilearn', topic),
      buildVideo('Gv9_4yMHFhI', 'Machine Learning Basics', 'Google Cloud Tech', topic)
    ];
  } else if (lowerTopic.includes('javascript') || lowerTopic.includes('js')) {
    videos = [
      buildVideo('PkZNo7MFNFg', 'Learn JavaScript - Full Course for Beginners', 'freeCodeCamp.org', topic),
      buildVideo('W6NZfCO5SIk', 'JavaScript Tutorial for Beginners', 'Programming with Mosh', topic),
      buildVideo('jS4aFq5-91M', 'JavaScript Programming - Full Course', 'freeCodeCamp.org', topic),
      buildVideo('hdI2bqOjy3c', 'JavaScript Crash Course', 'Traversy Media', topic),
      buildVideo('Mus_vwhTCq0', 'JavaScript DOM Crash Course', 'Traversy Media', topic)
    ];
  } else if (lowerTopic.includes('react')) {
    videos = [
      buildVideo('bMknfKXIFA8', 'React Course - Beginner Tutorial', 'freeCodeCamp.org', topic),
      buildVideo('Ke90Tje7VS0', 'React JS Full Course for Beginners', 'Programming with Mosh', topic),
      buildVideo('w7ejDZ8SWv8', 'React JS Crash Course', 'Traversy Media', topic),
      buildVideo('Tn6-PIqc4UM', 'React in 100 Seconds', 'Fireship', topic),
      buildVideo('SqcY0GlETPk', 'React Tutorial for Beginners', 'Programming with Mosh', topic)
    ];
  } else if (lowerTopic.includes('html') || lowerTopic.includes('css') || lowerTopic.includes('web')) {
    videos = [
      buildVideo('kUMe1FH4CHE', 'HTML and CSS Full Course for Beginners', 'freeCodeCamp.org', topic),
      buildVideo('G3e-cpL7ofc', 'HTML and CSS Full Course', 'SuperSimpleDev', topic),
      buildVideo('pQN-pnXPaVg', 'HTML Full Course', 'freeCodeCamp.org', topic),
      buildVideo('1Rs2ND1ryYc', 'CSS Tutorial - Zero to Hero', 'freeCodeCamp.org', topic),
      buildVideo('qz0aGYrrlhU', 'HTML Tutorial for Beginners', 'Programming with Mosh', topic)
    ];
  }

  return rotate(videos, offset).slice(0, maxResults);
};

const fetchYouTubeVideos = async (topic, maxResults = 5, offset = 0) => {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return getFallbackVideos(topic, maxResults, offset);
  }

  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        q: `${topic} tutorial course`,
        part: 'snippet',
        maxResults,
        type: 'video',
        relevanceLanguage: 'en',
        order: 'relevance',
        key: apiKey
      },
      headers: {
        Referer: 'https://localhost',
        Origin: 'https://localhost',
        'X-Requested-With': 'XMLHttpRequest'
      },
      timeout: 10000
    });

    const videoIds = response.data.items.map((item) => item.id.videoId).filter(Boolean);
    let videoDetails = {};

    if (videoIds.length > 0) {
      try {
        const detailsResponse = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
          params: {
            id: videoIds.join(','),
            part: 'statistics,contentDetails',
            key: apiKey
          },
          headers: {
            Referer: 'https://localhost',
            Origin: 'https://localhost',
            'X-Requested-With': 'XMLHttpRequest'
          },
          timeout: 10000
        });

        detailsResponse.data.items.forEach((item) => {
          videoDetails[item.id] = {
            duration: item.contentDetails.duration,
            viewCount: parseInt(item.statistics.viewCount || 0),
            likeCount: parseInt(item.statistics.likeCount || 0)
          };
        });
      } catch (error) {
        console.warn(`Could not fetch YouTube video details: ${error.message}`);
      }
    }

    const videos = response.data.items
      .map((item) => {
        const videoId = item.id.videoId;
        if (!videoId) return null;
        return {
          id: videoId,
          title: item.snippet.title,
          description: item.snippet.description?.substring(0, 200) || '',
          thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
          channelTitle: item.snippet.channelTitle,
          publishedAt: item.snippet.publishedAt,
          embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`,
          watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
          duration: videoDetails[videoId]?.duration || 'N/A',
          viewCount: videoDetails[videoId]?.viewCount || 0,
          likeCount: videoDetails[videoId]?.likeCount || 0
        };
      })
      .filter(Boolean);

    return videos.length > 0 ? videos : getFallbackVideos(topic, maxResults, offset);
  } catch (error) {
    console.warn(`YouTube fetch failed for "${topic}": ${error.message}`);
    return getFallbackVideos(topic, maxResults, offset);
  }
};

const generateFallbackContent = (topic, difficultyLevel) => {
  return `In this ${difficultyLevel.toLowerCase()} lesson on ${topic}, we will explore the fundamental concepts and practical applications that form the core of this subject. Understanding ${topic} requires a solid foundation in its basic principles, and this module is designed to guide you through each essential concept step by step.

Let us begin by establishing a clear understanding of what ${topic} truly means in a practical context. At its heart, ${topic} revolves around a set of core ideas that professionals and practitioners use every day to solve real-world problems. The journey to mastery begins with grasping these foundational elements and understanding how they fit together to form a cohesive framework for learning and application.

As we delve deeper into the subject matter, we will examine how the key concepts interconnect and support one another. Each idea builds upon the previous one, creating a progressive learning path that ensures you develop a thorough understanding before moving on to more advanced topics. This approach allows you to build confidence gradually while maintaining a clear overview of how each piece contributes to the larger picture.

Throughout this module, we will explore practical examples that illustrate how these concepts are applied in real-world scenarios. By connecting theory with practice, you will develop both the knowledge and the intuition needed to work effectively with ${topic}. The examples provided are drawn from common situations you are likely to encounter, preparing you for hands-on work and further study.

To solidify your understanding, take time to reflect on how the concepts covered in this lesson relate to your own learning goals. Consider how you might apply these ideas in practice and what additional areas you might want to explore further. The true measure of learning is not just in knowing the concepts but in being able to apply them effectively in new and unfamiliar situations. Keep practicing, stay curious, and remember that mastery comes through consistent effort and engagement with the material.`;
};

const generateModuleTopics = async (mainTopic, numModules, description = '') => {
  const prompt = `You are designing a course syllabus for a course titled "${mainTopic}".
The user description is: "${description}"

Generate exactly ${numModules} distinct and highly specific module titles that progress logically from basic to advanced. 
Do not use generic titles like "Introduction to X". Make them specific to the actual subject.
Format the output as a simple comma-separated list of titles. No numbering, no bullet points, just the titles separated by commas.`;

  try {
    const response = await queryOpenAI(prompt);
    if (response) {
      const titles = response.split(',').map(t => t.trim()).filter(Boolean);
      if (titles.length >= numModules) {
        return titles.slice(0, numModules);
      }
    }
  } catch (error) {
    console.warn('Failed to generate module topics dynamically, falling back to templates.');
  }

  const templates = [
    `Introduction to ${mainTopic}`,
    `Core Fundamentals of ${mainTopic}`,
    `Tools and Practical Workflow for ${mainTopic}`,
    `Real-World Projects with ${mainTopic}`,
    `Advanced Patterns and Next Steps in ${mainTopic}`
  ];

  return templates.slice(0, numModules);
};

const generateModuleContent = async (moduleTitle, difficultyLevel, courseDescription = '') => {
  const descriptionContext = courseDescription 
    ? `
The student has described their learning goal as: "${courseDescription}"
Use this context to tailor the lesson content specifically to their needs.` 
    : '';

  const prompt = `Write a comprehensive, in-depth educational lesson for a module titled "${moduleTitle}" at ${difficultyLevel} level.${descriptionContext}

CRITICAL REQUIREMENTS:
- Write in FLOWING PARAGRAPHS only. NO bullet points, NO numbered lists, NO asterisk lists, NO dash lists.
- Do NOT use any markdown headings like ## or ###. Use plain text paragraph breaks only.
- The content should read like a well-structured textbook chapter or a detailed lecture transcript.
- Aim for approximately 5000 words. Be thorough, detailed, and deeply educational.
- Cover core concepts, real-world examples, practical applications, and detailed explanations.
- Include theoretical foundations, step-by-step reasoning, and practical insights.
- Write original educational content only — no filler, no marketing language.
- Structure the content as multiple cohesive paragraphs with smooth transitions between ideas.

Content (in flowing paragraphs only):`;

  try {
    const content = await queryOpenAI(prompt);
    return content?.trim() || generateFallbackContent(moduleTitle, difficultyLevel);
  } catch (error) {
    console.warn(`OpenAI content generation failed for "${moduleTitle}": ${error.message}`);
    return generateFallbackContent(moduleTitle, difficultyLevel);
  }
};

const pickUniqueMainVideo = (videos, usedVideoIds) => {
  const uniqueVideo = videos.find((video) => !usedVideoIds.has(video.id));
  return uniqueVideo || videos[0] || null;
};

const generateCourseDescription = async (topic, difficultyLevel, description, modules) => {
  const moduleTitles = modules.map(m => m.title).join(', ');
  const prompt = `Write a compelling course overview for a course titled "${topic}" at ${difficultyLevel} level.

The course covers the following modules: ${moduleTitles}.

The student's original request was: "${description || 'No specific details provided.'}"

Write 3-4 flowing paragraphs (no bullet points, no headings) that:
1. Introduce the course and what students will learn
2. Describe the modules and how they build on each other
3. Explain the practical outcomes and skills gained
4. Motivate the learner to begin their journey

Keep it professional, encouraging, and informative. Approximately 300-400 words.`;

  try {
    const content = await queryOpenAI(prompt);
    return content?.trim() || `An in-depth ${difficultyLevel.toLowerCase()} course on ${topic}, designed to take you from foundational concepts to practical mastery through carefully structured modules.`;
  } catch (error) {
    console.warn(`Course description generation failed: ${error.message}`);
    return `An in-depth ${difficultyLevel.toLowerCase()} course on ${topic}, designed to take you from foundational concepts to practical mastery through carefully structured modules.`;
  }
};

const generateCourse = async (topic, difficultyLevel, studentDescription = '') => {
  const numModules = MODULE_COUNT_BY_LEVEL[difficultyLevel] || MODULE_COUNT_BY_LEVEL.Beginner;
  const moduleTopics = await generateModuleTopics(topic, numModules, studentDescription);
  const usedVideoIds = new Set();

  const modules = [];
  for (const [index, moduleTitle] of moduleTopics.entries()) {
    const structuredContent = await generateModuleContent(moduleTitle, difficultyLevel, studentDescription);
    
    const searchQuery = `${moduleTitle} ${topic} tutorial`;
    let videos = await fetchYouTubeVideos(searchQuery, 5, index);
    
    // Ensure we get different videos for each module by filtering out used ones
    videos = videos.filter(v => !usedVideoIds.has(v.id));
    
    // The user requested 1 to 2 videos only per module
    const finalVideos = videos.slice(0, 2);
    finalVideos.forEach(v => usedVideoIds.add(v.id));
    
    const mainVideo = finalVideos[0] || null;

    modules.push({
      title: moduleTitle,
      youtubeVideoUrl: mainVideo?.embedUrl || null,
      youtubeVideoId: mainVideo?.id || null,
      youtubeVideos: finalVideos,
      structuredContent,
      images: [],
      resources: []
    });
  }

  return modules;
};

export const generateCourseModules = async ({ studentId, topic, difficultyLevel, description }) => {
  const studentDescription = description || '';
  const modules = await generateCourse(topic, difficultyLevel, studentDescription);
  
  // Generate a course-level description based on all modules
  const courseDescription = await generateCourseDescription(topic, difficultyLevel, studentDescription, modules);

  return {
    studentId,
    topic,
    difficultyLevel,
    description: studentDescription,
    courseDescription,
    modules
  };
};
