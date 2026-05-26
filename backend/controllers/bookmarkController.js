import Bookmark from '../models/bookmarkModel.js';
import Doubt from '../models/doubtModel.js';
import Lecture from '../models/lectureModel.js';
import Course from '../models/courseModel.js';

export const createBookmark = async (req, res) => {
  try {
    const { lectureId, courseId, timestamp, note, folder, highlight, stickyNotes } = req.body;
    if (!lectureId || typeof timestamp === 'undefined') {
      return res.status(400).json({ message: 'lectureId and timestamp required' });
    }

    const lecture = await Lecture.findById(lectureId);
    if (!lecture) return res.status(404).json({ message: 'Lecture not found' });

    const bookmark = new Bookmark({
      student: req.userId,
      lecture: lectureId,
      course: courseId,
      timestamp: Math.floor(Number(timestamp)),
      note: note || '',
      folder: folder || 'General',
      highlight: highlight || undefined,
      stickyNotes: stickyNotes || []
    });

    await bookmark.save();
    res.status(201).json(bookmark);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBookmarksByLecture = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const bookmarks = await Bookmark.find({ 
      lecture: lectureId, 
      $or: [
        { student: req.userId },
        { sharedWith: req.userId }
      ]
    }).sort({ createdAt: -1 });
    res.status(200).json(bookmarks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBookmarksForUser = async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ 
      $or: [
        { student: req.userId },
        { sharedWith: req.userId }
      ]
    }).populate('lecture course').sort({ createdAt: -1 });
    res.status(200).json(bookmarks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBookmark = async (req, res) => {
  try {
    const { bookmarkId } = req.params;
    const { note, folder, highlight, stickyNotes } = req.body;

    const bookmark = await Bookmark.findById(bookmarkId);
    if (!bookmark) return res.status(404).json({ message: 'Bookmark not found' });
    if (bookmark.student.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to modify this bookmark' });
    }

    if (note !== undefined) bookmark.note = note;
    if (folder !== undefined) bookmark.folder = folder;
    if (highlight !== undefined) bookmark.highlight = highlight;
    if (stickyNotes !== undefined) bookmark.stickyNotes = stickyNotes;

    await bookmark.save();
    res.status(200).json(bookmark);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const shareBookmark = async (req, res) => {
  try {
    const { bookmarkId } = req.params;
    const { targetUserId } = req.body;

    const bookmark = await Bookmark.findById(bookmarkId);
    if (!bookmark) return res.status(404).json({ message: 'Bookmark not found' });
    if (bookmark.student.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only the owner can share bookmarks' });
    }

    if (!bookmark.sharedWith.includes(targetUserId)) {
      bookmark.sharedWith.push(targetUserId);
      await bookmark.save();
    }

    res.status(200).json({ success: true, message: 'Bookmark shared successfully', bookmark });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const exportStudyGuide = async (req, res) => {
  try {
    const { courseId } = req.params;
    const bookmarks = await Bookmark.find({ student: req.userId, course: courseId }).populate('lecture');

    let markdown = `# Study Guide - Bookmarked Material\n\n`;
    
    if (bookmarks.length === 0) {
      markdown += `*No bookmarked notes or annotations found for this course.*\n`;
    } else {
      bookmarks.forEach((b, i) => {
        markdown += `## ${i + 1}. [Lecture: ${b.lecture?.lectureTitle || 'General'}] at ${b.timestamp}s\n`;
        markdown += `* **Folder**: ${b.folder}\n`;
        if (b.note) markdown += `* **Notes**: ${b.note}\n`;
        if (b.highlight && b.highlight.text) {
          markdown += `* **Highlight**: "${b.highlight.text}" (Page: ${b.highlight.pdfPage || 'N/A'})\n`;
        }
        if (b.stickyNotes && b.stickyNotes.length > 0) {
          markdown += `* **Sticky Notes**:\n`;
          b.stickyNotes.forEach(sn => {
            markdown += `  - Page ${sn.page}: ${sn.content}\n`;
          });
        }
        markdown += `\n---\n\n`;
      });
    }

    res.setHeader('Content-Type', 'text/markdown');
    res.setHeader('Content-Disposition', 'attachment; filename="study_guide.md"');
    res.status(200).send(markdown);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createDoubtForBookmark = async (req, res) => {
  try {
    const { bookmarkId } = req.params;
    const { question } = req.body;
    if (!question) return res.status(400).json({ message: 'question required' });

    const bookmark = await Bookmark.findById(bookmarkId);
    if (!bookmark) return res.status(404).json({ message: 'Bookmark not found' });
    if (bookmark.student.toString() !== req.userId) return res.status(403).json({ message: 'Not authorized' });

    const doubt = new Doubt({
      student: req.userId,
      course: bookmark.course,
      lecture: bookmark.lecture,
      bookmark: bookmark._id,
      question
    });

    await doubt.save();
    bookmark.linkedDoubt = doubt._id;
    await bookmark.save();

    res.status(201).json(doubt);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
