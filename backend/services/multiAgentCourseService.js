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
  return `## ${topic}\n\nThis ${difficultyLevel.toLowerCase()} module introduces the core ideas, practical workflow, and learning checkpoints for ${topic}.\n\n### Learning Goals\n- Understand the purpose of ${topic}\n- Learn the most important vocabulary and concepts\n- Practice with simple examples\n- Know what to study next\n\n### Core Explanation\n${topic} is best learned by connecting theory with practice. Start with the definitions, then move into examples, then test yourself with small exercises.\n\n### Practice Task\nCreate a short summary of the module in your own words and list three things you can now explain clearly.\n\n### Review Checklist\n- Can you define the topic?\n- Can you explain where it is used?\n- Can you complete a small practice task?`;
};

const generateModuleTopics = (mainTopic, numModules) => {
  const templates = [
    `Introduction to ${mainTopic}`,
    `Core Fundamentals of ${mainTopic}`,
    `Tools and Practical Workflow for ${mainTopic}`,
    `Real-World Projects with ${mainTopic}`,
    `Advanced Patterns and Next Steps in ${mainTopic}`
  ];

  return templates.slice(0, numModules);
};

const generateModuleContent = async (moduleTitle, difficultyLevel) => {
  const prompt = `Write a complete LMS lesson module titled "${moduleTitle}" for a ${difficultyLevel} learner.

Requirements:
- Use Markdown.
- Keep it practical and easy to teach.
- Include clear headings, examples, key terms, a short exercise, and a review checklist.
- Avoid filler, marketing language, web search references, and scraped content.
- Write original educational content only.
- Length: 700-1000 words.

Content:`;

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

const generateCourse = async (topic, difficultyLevel) => {
  const numModules = MODULE_COUNT_BY_LEVEL[difficultyLevel] || MODULE_COUNT_BY_LEVEL.Beginner;
  const moduleTopics = generateModuleTopics(topic, numModules);
  const usedVideoIds = new Set();

  const modules = [];
  for (const [index, moduleTitle] of moduleTopics.entries()) {
    const structuredContent = await generateModuleContent(moduleTitle, difficultyLevel);
    const videos = await fetchYouTubeVideos(moduleTitle, 5, index);
    const mainVideo = pickUniqueMainVideo(videos, usedVideoIds);
    if (mainVideo) usedVideoIds.add(mainVideo.id);

    const orderedVideos = mainVideo
      ? [mainVideo, ...videos.filter((video) => video.id !== mainVideo.id)]
      : videos;

    modules.push({
      title: moduleTitle,
      youtubeVideoUrl: mainVideo?.embedUrl || null,
      youtubeVideoId: mainVideo?.id || null,
      youtubeVideos: orderedVideos,
      structuredContent,
      images: [],
      resources: []
    });
  }

  return modules;
};

export const generateCourseModules = async ({ studentId, topic, difficultyLevel }) => {
  const modules = await generateCourse(topic, difficultyLevel);

  return {
    studentId,
    topic,
    difficultyLevel,
    modules
  };
};
