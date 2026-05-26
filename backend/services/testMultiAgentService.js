// Simple test for the multi-agent course service
import { generateCourseModules } from './multiAgentCourseService.js';

async function testService() {
  try {
    console.log('🧪 Testing multi-agent course service...');

    const result = await generateCourseModules({
      studentId: 'test-student-id',
      topic: 'JavaScript Fundamentals',
      difficultyLevel: 'Beginner'
    });

    console.log('✅ Test successful!');
    console.log(`📚 Generated course: ${result.topic} (${result.difficultyLevel})`);
    console.log(`📝 Number of modules: ${result.modules.length}`);

    // Display first module details
    if (result.modules.length > 0) {
      const firstModule = result.modules[0];
      console.log(`\n📖 First module: ${firstModule.title}`);
      console.log(`🎥 YouTube URL: ${firstModule.youtubeVideoUrl}`);
      console.log(`🖼️  Images: ${firstModule.images.length} found`);
      console.log(`📄 Content preview: ${firstModule.structuredContent.substring(0, 100)}...`);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testService();