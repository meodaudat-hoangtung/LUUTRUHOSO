import React, { useState } from 'react';
import { 
  Play, 
  ExternalLink, 
  Copy, 
  Check, 
  AlertCircle,
  Video,
  Share2
} from 'lucide-react';
import { parseVideoUrl, VideoInfo } from '../utils/videoUtils';

interface VideoPlayerProps {
  videoUrl: string;
  title?: string;
  className?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  title,
  className = ''
}) => {
  const [copied, setCopied] = useState(false);
  const [hasError, setHasError] = useState(false);

  const videoInfo: VideoInfo | null = parseVideoUrl(videoUrl);

  const handleCopyLink = () => {
    if (!videoUrl) return;
    navigator.clipboard.writeText(videoUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!videoInfo || !videoInfo.embedUrl) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 bg-slate-900/90 rounded-xl border border-slate-800 text-center ${className}`}>
        <AlertCircle className="w-10 h-10 text-amber-400 mb-3" />
        <h4 className="text-sm font-semibold text-slate-200 mb-1">Đường link video không hợp lệ hoặc chưa được hỗ trợ</h4>
        <p className="text-xs text-slate-400 font-mono break-all max-w-md mb-4">{videoUrl}</p>
        <a
          href={videoUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Mở liên kết trong tab mới</span>
        </a>
      </div>
    );
  }

  return (
    <div className={`flex flex-col w-full bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-2xl ${className}`}>
      
      {/* Video Bar Header */}
      <div className="bg-[#0D1117] px-4 py-2.5 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
        
        {/* Left: Platform badge & title */}
        <div className="flex items-center gap-2 min-w-0">
          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 ${
            videoInfo.platform === 'youtube'
              ? 'bg-red-600 text-white shadow-2xs'
              : videoInfo.platform === 'facebook'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'bg-indigo-600 text-white shadow-2xs'
          }`}>
            <Video className="w-3 h-3" />
            <span>{videoInfo.platformName}</span>
          </span>

          {title && (
            <span className="text-slate-200 font-medium truncate max-w-xs sm:max-w-md" title={title}>
              {title}
            </span>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 ml-auto">
          <button
            onClick={handleCopyLink}
            title="Sao chép đường link video"
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer border border-slate-700"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Đã chép' : 'Sao chép link'}</span>
          </button>

          <a
            href={videoInfo.originalUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[11px] font-medium transition-colors flex items-center gap-1 shadow-xs"
            title="Mở video trực tiếp trên nền tảng gốc"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Mở trang gốc</span>
          </a>
        </div>

      </div>

      {/* Video Viewport: 16:9 Aspect Ratio Container */}
      <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
        
        {videoInfo.platform === 'direct' ? (
          <video
            src={videoInfo.embedUrl}
            controls
            playsInline
            className="w-full h-full object-contain"
            onError={() => setHasError(true)}
          >
            Trình duyệt của bạn không hỗ trợ phát video HTML5.
          </video>
        ) : (
          <iframe
            src={videoInfo.embedUrl}
            title={title || 'Video Player'}
            className="w-full h-full border-none"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
            onError={() => setHasError(true)}
          />
        )}

        {hasError && (
          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-6 text-center z-10">
            <AlertCircle className="w-8 h-8 text-amber-400 mb-2" />
            <p className="text-xs text-slate-300 mb-3">
              Không thể tải trực tiếp video trong khung nhúng (do cài đặt bảo mật hoặc quyền riêng tư của video).
            </p>
            <a
              href={videoInfo.originalUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Xem trực tiếp trên {videoInfo.platformName}</span>
            </a>
          </div>
        )}

      </div>

      {/* Subtle footer note for Facebook / specific video types */}
      {videoInfo.platform === 'facebook' && (
        <div className="bg-[#0A0D12] px-4 py-2 border-t border-slate-900 text-[11px] text-slate-400 flex items-center justify-between">
          <span>💡 Lưu ý: Video Facebook cần được đặt ở chế độ Công khai (Public) để xem nhúng.</span>
          <a
            href={videoInfo.originalUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="text-sky-400 hover:underline flex items-center gap-1 font-medium"
          >
            <span>Mở Facebook Watch</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

    </div>
  );
};
