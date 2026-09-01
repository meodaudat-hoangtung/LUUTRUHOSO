import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Maximize, 
  Download, 
  RefreshCw, 
  AlertCircle,
  BookOpen
} from 'lucide-react';
import { StoredFileRecord, getFreshArrayBuffer } from '../utils/fileStorage';

// Configure PDF.js worker with Vite bundled URL and reliable fallback
try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
} catch (e) {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString();
  } catch (err) {
    console.warn('PDF.js worker setup fallback:', err);
  }
}

interface PdfCanvasViewerProps {
  fileRecord?: StoredFileRecord | null;
  dataUrl?: string;
  arrayBuffer?: ArrayBuffer;
  blob?: Blob;
  fileName?: string;
  title: string;
  onDownload?: () => void;
}

export const PdfCanvasViewer: React.FC<PdfCanvasViewerProps> = ({
  fileRecord,
  dataUrl,
  arrayBuffer,
  blob,
  title,
  onDownload
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  // Auto compute initial scale for mobile devices (screen width < 640px)
  const [scale, setScale] = useState<number>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      return Number(Math.max(0.5, (window.innerWidth - 48) / 595).toFixed(2));
    }
    return 1.15;
  });
  const [rotation, setRotation] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'single' | 'continuous'>(() => {
    return typeof window !== 'undefined' && window.innerWidth < 640 ? 'continuous' : 'continuous';
  });

  // Track active render tasks per page to avoid collision errors
  const activeRenderTasks = useRef<{ [page: number]: any }>({});
  const pageRefs = useRef<{ [key: number]: HTMLCanvasElement | null }>({});

  // Load PDF Document safely without ArrayBuffer detachment issues
  useEffect(() => {
    let isCancelled = false;
    let currentLoadingTask: any = null;

    setLoading(true);
    setError(null);
    setPdfDoc(null);
    setCurrentPage(1);

    async function loadPdf() {
      try {
        let buffer: ArrayBuffer | null = null;

        if (blob) {
          buffer = await blob.arrayBuffer();
        } else if (fileRecord) {
          buffer = await getFreshArrayBuffer(fileRecord, dataUrl);
        } else if (arrayBuffer && arrayBuffer.byteLength > 0) {
          buffer = arrayBuffer.slice(0);
        } else if (dataUrl) {
          buffer = await getFreshArrayBuffer(null, dataUrl);
        }

        if (!buffer || buffer.byteLength === 0) {
          throw new Error('Không thể đọc dữ liệu tệp PDF hoặc dữ liệu trống.');
        }

        // CRITICAL: Always slice buffer so worker detachment NEVER corrupts source data
        const safeData = new Uint8Array(buffer.slice(0));

        currentLoadingTask = pdfjsLib.getDocument({
          data: safeData,
          cMapUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/cmaps/`,
          cMapPacked: true,
          standardFontDataUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/standard_fonts/`,
        });

        const doc = await currentLoadingTask.promise;
        if (!isCancelled) {
          setPdfDoc(doc);
          setNumPages(doc.numPages);
          setLoading(false);
        }
      } catch (err: any) {
        if (!isCancelled) {
          console.error('PDF load error:', err);
          setError(err.message || 'Không thể giải mã và kết xuất tệp PDF.');
          setLoading(false);
        }
      }
    }

    loadPdf();

    return () => {
      isCancelled = true;
      if (currentLoadingTask && currentLoadingTask.destroy) {
        try {
          currentLoadingTask.destroy();
        } catch (e) {
          // ignore
        }
      }
    };
  }, [fileRecord, dataUrl, arrayBuffer, blob]);

  // Cancel any existing render task for a page
  const cancelRenderTask = (pageNumber: number) => {
    if (activeRenderTasks.current[pageNumber]) {
      try {
        activeRenderTasks.current[pageNumber].cancel();
      } catch (e) {
        // ignore cancel exception
      }
      delete activeRenderTasks.current[pageNumber];
    }
  };

  // Render a specific page to canvas
  const renderPage = useCallback(async (pageNumber: number, canvas: HTMLCanvasElement) => {
    if (!pdfDoc) return;
    
    // Cancel previous render on this canvas if any
    cancelRenderTask(pageNumber);

    try {
      const page = await pdfDoc.getPage(pageNumber);
      const outputScale = window.devicePixelRatio || 1;
      const viewport = page.getViewport({ scale, rotation });

      const context = canvas.getContext('2d');
      if (!context) return;

      canvas.width = Math.floor(viewport.width * outputScale);
      canvas.height = Math.floor(viewport.height * outputScale);
      canvas.style.width = Math.floor(viewport.width) + 'px';
      canvas.style.height = Math.floor(viewport.height) + 'px';

      const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined;

      const renderContext = {
        canvasContext: context,
        transform: transform,
        viewport: viewport,
      };

      const renderTask = page.render(renderContext);
      activeRenderTasks.current[pageNumber] = renderTask;

      await renderTask.promise;
      delete activeRenderTasks.current[pageNumber];
    } catch (err: any) {
      if (err?.name !== 'RenderingCancelledException') {
        console.warn(`Render error on page ${pageNumber}:`, err);
      }
    }
  }, [pdfDoc, scale, rotation]);

  // Trigger renders when doc, scale, rotation or viewMode changes
  useEffect(() => {
    if (!pdfDoc) return;

    if (viewMode === 'single') {
      const canvas = pageRefs.current[currentPage];
      if (canvas) {
        renderPage(currentPage, canvas);
      }
    } else {
      // Continuous mode: render all pages
      for (let i = 1; i <= numPages; i++) {
        const canvas = pageRefs.current[i];
        if (canvas) {
          renderPage(i, canvas);
        }
      }
    }

    return () => {
      // Cleanup running render tasks
      Object.keys(activeRenderTasks.current).forEach((key) => {
        cancelRenderTask(Number(key));
      });
    };
  }, [pdfDoc, currentPage, scale, rotation, viewMode, numPages, renderPage]);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < numPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 3.0));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.6));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleFitWidth = () => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth - 48;
      // Approximate 595pt standard A4 width
      const newScale = Math.max(0.7, Math.min(2.0, containerWidth / 620));
      setScale(Number(newScale.toFixed(2)));
    }
  };

  return (
    <div className="flex-1 flex flex-col w-full h-full bg-[#0D1017] rounded-xl border border-slate-800 overflow-hidden select-none">
      
      {/* PDF Controls Toolbar */}
      <div className="bg-[#151922] px-3 sm:px-4 py-2 border-b border-slate-800 flex items-center justify-between gap-2 flex-wrap text-slate-300">
        
        {/* Page navigation */}
        <div className="flex items-center gap-1 sm:gap-2">
          {viewMode === 'single' ? (
            <>
              <button
                onClick={handlePrevPage}
                disabled={currentPage <= 1}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-slate-200 transition-colors cursor-pointer"
                title="Trang trước"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="text-xs font-mono text-slate-300 px-1">
                Trang <span className="font-bold text-indigo-400">{currentPage}</span> / {numPages || 1}
              </div>
              <button
                onClick={handleNextPage}
                disabled={currentPage >= numPages}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-slate-200 transition-colors cursor-pointer"
                title="Trang tiếp theo"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>Tổng số: <strong className="text-slate-100">{numPages} trang</strong></span>
            </div>
          )}

          {/* Mode Switcher */}
          <div className="hidden sm:flex items-center bg-slate-900 p-0.5 rounded border border-slate-800 ml-2">
            <button
              onClick={() => setViewMode('continuous')}
              className={`px-2 py-0.5 text-[11px] font-mono rounded ${
                viewMode === 'continuous' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Cuộn liên tục
            </button>
            <button
              onClick={() => setViewMode('single')}
              className={`px-2 py-0.5 text-[11px] font-mono rounded ${
                viewMode === 'single' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Từng trang
            </button>
          </div>
        </div>

        {/* Zoom & View Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleZoomOut}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            title="Thu nhỏ (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <span className="text-xs font-mono text-slate-400 w-12 text-center">
            {Math.round(scale * 100)}%
          </span>

          <button
            onClick={handleZoomIn}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            title="Phóng to (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            onClick={handleFitWidth}
            className="px-2 py-1 text-xs font-mono rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer hidden md:inline-flex items-center gap-1"
            title="Vừa chiều ngang màn hình"
          >
            <Maximize className="w-3 h-3" />
            <span>Vừa khung</span>
          </button>

          <button
            onClick={handleRotate}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            title="Xoay 90 độ"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {onDownload && (
            <button
              onClick={onDownload}
              className="p-1.5 rounded bg-indigo-600/80 hover:bg-indigo-600 text-white transition-colors cursor-pointer ml-1"
              title="Tải xuống tệp PDF"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>

      {/* PDF View Container */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto p-4 sm:p-6 flex flex-col items-center gap-6 bg-[#080A0E]"
      >
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-3 py-20">
            <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
            <p className="text-xs font-mono text-slate-400">Đang giải mã và kết xuất trang PDF trực tiếp trên Canvas...</p>
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4 max-w-md">
            <div className="w-12 h-12 rounded-full bg-red-950/80 text-red-400 border border-red-800/60 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100">Không thể kết xuất trang PDF</h4>
              <p className="text-xs text-slate-400 mt-1">{error}</p>
            </div>
            {onDownload && (
              <button
                onClick={onDownload}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg inline-flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Tải xuống tệp PDF trực tiếp</span>
              </button>
            )}
          </div>
        ) : viewMode === 'single' ? (
          /* Single Page View */
          <div className="flex flex-col items-center shadow-2xl rounded-sm bg-white overflow-hidden my-auto">
            <canvas
              ref={(el) => {
                pageRefs.current[currentPage] = el;
                if (el && pdfDoc) {
                  renderPage(currentPage, el);
                }
              }}
              className="block"
            />
          </div>
        ) : (
          /* Continuous Scroll View (All Pages) */
          Array.from({ length: numPages }, (_, index) => {
            const pageNum = index + 1;
            return (
              <div key={pageNum} className="flex flex-col items-center relative group">
                <div className="shadow-2xl rounded-sm bg-white overflow-hidden border border-slate-700/50">
                  <canvas
                    ref={(el) => {
                      pageRefs.current[pageNum] = el;
                      if (el && pdfDoc) {
                        renderPage(pageNum, el);
                      }
                    }}
                    className="block"
                  />
                </div>
                <div className="mt-2 text-[11px] font-mono text-slate-500 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
                  Trang {pageNum} / {numPages}
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
