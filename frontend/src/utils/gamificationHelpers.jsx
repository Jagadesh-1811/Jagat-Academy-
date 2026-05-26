import React from 'react';

// Material UI icon imports
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GradeIcon from '@mui/icons-material/Grade';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import GroupsIcon from '@mui/icons-material/Groups';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SpeedIcon from '@mui/icons-material/Speed';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PublicIcon from '@mui/icons-material/Public';
import StarsIcon from '@mui/icons-material/Stars';

const iconMap = {
  // Onboarding
  onboarding_welcome: <PersonIcon />,
  onboarding_course_1: <SchoolIcon />,
  onboarding_watch_1: <PlayCircleOutlineIcon />,
  onboarding_course_3: <LocalLibraryIcon />,
  onboarding_course_5: <SchoolIcon style={{ transform: 'scale(1.1)' }} />,

  // Consistency
  consistency_streak_3: <WhatshotIcon className="text-orange-500" />,
  consistency_streak_7: <WhatshotIcon className="text-orange-600 font-bold" />,
  consistency_streak_15: <WhatshotIcon className="text-red-500 scale-105" />,
  consistency_streak_30: <WhatshotIcon className="text-red-600 scale-110" />,
  consistency_streak_90: <WhatshotIcon className="text-amber-500 animate-pulse scale-120" />,
  consistency_streak_100: <WhatshotIcon className="text-amber-600 animate-pulse scale-125" />,
  consistency_watch_1h: <AccessTimeIcon />,
  consistency_watch_5h: <AccessTimeIcon />,
  consistency_watch_20h: <AccessTimeIcon />,
  consistency_watch_50h: <AccessTimeIcon className="scale-105" />,
  consistency_watch_100h: <AccessTimeIcon className="scale-110" />,
  consistency_watch_200h: <AccessTimeIcon className="scale-120 animate-spin" style={{ animationDuration: '6s' }} />,

  // Performance
  performance_grade_a: <GradeIcon className="text-amber-500" />,
  performance_perfect_3: <StarsIcon className="text-amber-600" />,
  performance_perfect_5: <StarsIcon className="text-amber-500 animate-pulse" />,
  performance_level_5: <GradeIcon />,
  performance_level_10: <GradeIcon />,
  performance_level_20: <GradeIcon className="scale-105" />,
  performance_level_30: <GradeIcon className="scale-110" />,
  performance_level_50: <GradeIcon className="scale-120 animate-bounce" style={{ animationDuration: '3s' }} />,
  performance_level_75: <GradeIcon className="scale-125 animate-pulse text-amber-500" />,
  performance_level_100: <StarsIcon className="scale-130 animate-pulse text-amber-500" />,
  performance_speed: <SpeedIcon />,
  performance_perfect_10: <EmojiEventsIcon className="text-amber-500" />,

  // Social
  social_doubt_1: <HelpOutlineIcon />,
  social_doubt_5: <HelpOutlineIcon />,
  social_doubt_10: <HelpOutlineIcon className="scale-105" />,
  social_doubt_25: <HelpOutlineIcon className="scale-110" />,
  social_doubt_50: <HelpOutlineIcon className="scale-120 animate-pulse" />,
  social_gift_1: <CardGiftcardIcon />,
  social_gift_5: <CardGiftcardIcon className="scale-105" />,
  social_gift_10: <CardGiftcardIcon className="scale-110" />,
  social_follow: <PersonAddIcon />,
  social_group: <GroupsIcon />,
  social_network: <PublicIcon />,

  // Milestones
  milestone_cert_1: <WorkspacePremiumIcon className="text-blue-500" />,
  milestone_cert_2: <WorkspacePremiumIcon className="text-purple-500" />,
  milestone_cert_5: <WorkspacePremiumIcon className="text-purple-600 scale-105" />,
  milestone_cert_10: <WorkspacePremiumIcon className="text-amber-600 scale-110" />,
  milestone_prestige_1: <AutoAwesomeIcon className="text-amber-500 animate-pulse" />,
  milestone_prestige_2: <AutoAwesomeIcon className="text-amber-600 animate-pulse scale-110" />,
  milestone_badge_10: <EmojiEventsIcon className="text-amber-500" />,
  milestone_badge_25: <EmojiEventsIcon className="text-amber-500 scale-105" />,
  milestone_badge_40: <EmojiEventsIcon className="text-amber-600 scale-110" />,
  milestone_badge_all: <AutoAwesomeIcon className="text-amber-500 animate-spin" style={{ animationDuration: '4s' }} />,
};

/**
 * Returns a clean, styled React SVG icon component matching the badge key identifier.
 * Completely replaces emojis with Neo-Brutalist responsive SVGs.
 */
export const getBadgeIcon = (iconName, customClassName = '') => {
  const icon = iconMap[iconName];
  if (!icon) {
    // Default fallback badge
    return <WorkspacePremiumIcon className={customClassName} />;
  }

  // Clone React element to inject className dynamically
  return React.cloneElement(icon, {
    className: `${icon.props.className || ''} ${customClassName}`.trim(),
    style: {
      fontSize: '2.5rem',
      ...icon.props.style,
    }
  });
};
