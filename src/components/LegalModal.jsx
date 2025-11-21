'use client';

import { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import styles from './LegalModal.module.css';

export default function LegalModal({ isOpen, onClose, title, content, type, pdfUrl }) {
  const [numPages, setNumPages] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageWidth, setPageWidth] = useState(800);
  const [pdfData, setPdfData] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [PdfComponents, setPdfComponents] = useState(null);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      Promise.all([
        import('react-pdf'),
        import('react-pdf/dist/Page/AnnotationLayer.css'),
        import('react-pdf/dist/Page/TextLayer.css')
      ]).then(([module]) => {
        const { Document: Doc, Page: Pg, pdfjs: pdf } = module;
        pdf.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdf.version}/build/pdf.worker.min.mjs`;
        setPdfComponents({ Document: Doc, Page: Pg, pdfjs: pdf });
      });
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const updateWidth = () => {
        setPageWidth(Math.min(800, window.innerWidth * 0.8));
      };
      updateWidth();
      window.addEventListener('resize', updateWidth);
      return () => {
        window.removeEventListener('resize', updateWidth);
        document.body.style.overflow = 'unset';
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  useEffect(() => {
    if (pdfUrl && isOpen) {
      setNumPages(null);
      setLoading(true);
      setError(null);
      setPdfData(null);
      
      const loadPdf = async () => {
        try {
          if (pdfUrl.startsWith('http')) {
            setPdfData(pdfUrl);
            return;
          }
          
          const encodedUrl = encodeURIComponent(pdfUrl);
          const proxyUrl = `/api/pdf-proxy?url=${encodedUrl}`;
          
          try {
            const response = await fetch(proxyUrl);
            
            if (response.ok) {
              const blob = await response.blob();
              const blobUrl = URL.createObjectURL(blob);
              setPdfData(blobUrl);
              return;
            }
          } catch (proxyError) {
            console.warn('Proxy failed, using direct URL:', proxyError);
          }
          
          const fullUrl = pdfUrl.startsWith('http') ? pdfUrl : `https://aldalinde.ru${pdfUrl}`;
          setPdfData(fullUrl);
        } catch (err) {
          console.error('Error loading PDF:', err);
          setError('Ошибка загрузки PDF. Возможно, проблема с CORS или файл поврежден.');
          setLoading(false);
        }
      };
      
      loadPdf();
    }
  }, [pdfUrl, isOpen]);

  useEffect(() => {
    return () => {
      if (pdfData && pdfData.startsWith('blob:')) {
        URL.revokeObjectURL(pdfData);
      }
    };
  }, [pdfData]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  }

  function onDocumentLoadError(error) {
    console.error('PDF load error:', error);
    setError('Ошибка загрузки PDF. Возможно, проблема с CORS или файл поврежден.');
    setLoading(false);
  }

  const pdfOptions = useMemo(() => {
    if (!PdfComponents?.pdfjs) return null;
    return {
      cMapUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PdfComponents.pdfjs.version}/cmaps/`,
      cMapPacked: true,
    };
  }, [PdfComponents]);

  if (!isOpen) return null;

  return createPortal(
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0.5 0.5L15.5 15.5M15.5 0.5L0.5 15.5" stroke="#C1AF86" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className={styles.content}>
          {pdfUrl ? (
            <div className={styles.pdfContainer}>
              {loading && <div className={styles.loading}>Загрузка PDF...</div>}
              {error && (
                <div className={styles.error}>
                  <p>{error}</p>
                  <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className={styles.downloadLink}>
                    Открыть PDF в новой вкладке
                  </a>
                </div>
              )}
              {pdfData && isClient && PdfComponents && pdfOptions && (
                <PdfComponents.Document
                  file={pdfData}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={onDocumentLoadError}
                  loading={null}
                  className={styles.document}
                  options={pdfOptions}
                >
                  {Array.from(new Array(numPages), (el, index) => (
                    <PdfComponents.Page
                      key={`page_${index + 1}`}
                      pageNumber={index + 1}
                      renderTextLayer={true}
                      renderAnnotationLayer={true}
                      className={styles.pdfPage}
                      width={pageWidth}
                    />
                  ))}
                </PdfComponents.Document>
              )}
              {!isClient && <div className={styles.loading}>Загрузка...</div>}
            </div>
          ) : (
            <div 
              className={styles.text}
              dangerouslySetInnerHTML={{ __html: content }}
            />
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
