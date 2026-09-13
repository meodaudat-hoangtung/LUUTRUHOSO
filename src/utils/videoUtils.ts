/**
 * Video Utilities for parsing and embedding video links (YouTube, Facebook, etc.)
 */

export type VideoPlatform = 'youtube' | 'facebook' | 'vimeo' | 'direct' | 'drive' | 'other';

export interface VideoInfo {
  platform: VideoPlatform;
  embedUrl: string | null;
  originalUrl: string;
  videoId?: string;
  thumbnailUrl?: string | null;
  platformName: string;
}

/**
 * Extracts YouTube Video ID from various URL formats
 */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // Handle youtu.be/ID
  const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch && shortMatch[1]) return shortMatch[1];

  // Handle youtube.com/shorts/ID
  const shortsMatch = trimmed.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
  if (shortsMatch && shortsMatch[1]) return shortsMatch[1];

  // Handle youtube.com/live/ID
  const liveMatch = trimmed.match(/\/live\/([a-zA-Z0-9_-]{11})/);
  if (liveMatch && liveMatch[1]) return liveMatch[1];

  // Handle youtube.com/embed/ID
  const embedMatch = trimmed.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch && embedMatch[1]) return embedMatch[1];

  // Handle standard watch?v=ID or &v=ID
  const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch && watchMatch[1]) return watchMatch[1];

  // General fallback for 11 char ID in youtube URL
  const generalMatch = trimmed.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  if (generalMatch && generalMatch[1]) return generalMatch[1];

  return null;
}

/**
 * Parses any video URL and returns structured information for embedding
 */
export function parseVideoUrl(url?: string): VideoInfo | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // 1. YouTube
  if (trimmed.includes('youtube.com') || trimmed.includes('youtu.be')) {
    const videoId = extractYouTubeId(trimmed);
    if (videoId) {
      return {
        platform: 'youtube',
        platformName: 'YouTube',
        videoId,
        originalUrl: trimmed,
        embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`,
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
      };
    }
  }

  // 2. Facebook
  if (trimmed.includes('facebook.com') || trimmed.includes('fb.watch')) {
    // Official Facebook video embed player plugin URL
    const fbEmbed = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(trimmed)}&show_text=0&width=560`;
    return {
      platform: 'facebook',
      platformName: 'Facebook Video',
      originalUrl: trimmed,
      embedUrl: fbEmbed,
      thumbnailUrl: null
    };
  }

  // 3. Vimeo
  if (trimmed.includes('vimeo.com')) {
    const vimeoMatch = trimmed.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^\/]*\/videos\/|album\/(?:\d+\/)?video\/|video\/|)(\d+)/);
    const videoId = vimeoMatch ? vimeoMatch[1] : undefined;
    return {
      platform: 'vimeo',
      platformName: 'Vimeo',
      videoId,
      originalUrl: trimmed,
      embedUrl: videoId ? `https://player.vimeo.com/video/${videoId}` : trimmed,
      thumbnailUrl: null
    };
  }

  // 4. Google Drive Video
  if (trimmed.includes('drive.google.com')) {
    const gDriveMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    const gDriveIdMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    const fileId = gDriveMatch?.[1] || gDriveIdMatch?.[1];
    return {
      platform: 'drive',
      platformName: 'Google Drive Video',
      videoId: fileId,
      originalUrl: trimmed,
      embedUrl: fileId ? `https://drive.google.com/file/d/${fileId}/preview` : trimmed,
      thumbnailUrl: null
    };
  }

  // 5. Direct Video File (.mp4, .webm, .ogg)
  const isDirect = /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(trimmed);
  if (isDirect) {
    return {
      platform: 'direct',
      platformName: 'Tệp Video Trực Tiếp',
      originalUrl: trimmed,
      embedUrl: trimmed,
      thumbnailUrl: null
    };
  }

  // 6. Generic Video Link / Other
  return {
    platform: 'other',
    platformName: 'Video Trực Tuyến',
    originalUrl: trimmed,
    embedUrl: trimmed,
    thumbnailUrl: null
  };
}
