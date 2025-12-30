// src/pages/Campaign.jsx

import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

// Путь к твоему PDF — обязательно положи файл в папку public!
const pdfUrl = '/Wiebe_TheHangover.pdf';

export default function Campaign() {
  // Это даёт красивую панель сверху и сбоку (зум, страницы, поиск, полноэкранный режим и т.д.)
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  return (
    <div style={{ height: '100vh', width: '100%',}}>
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
        <Viewer
          fileUrl={pdfUrl}
          plugins={[defaultLayoutPluginInstance]}
          theme="dark"
        />
      </Worker>
    </div>
  );
}