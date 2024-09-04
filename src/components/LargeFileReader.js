import React, { useState, useEffect } from 'react';

const CHUNK_SIZE = 1024 * 1024; // 1 MB chunks

function LargeFileReader({ filePath, setData }) {
  const [fileContent, setFileContent] = useState(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function readFile() {
      try {
        const response = await fetch(filePath, {
          headers: {
            'Accept': 'application/octet-stream'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body.getReader();
        const contentLength = +response.headers.get('Content-Length');
        let receivedLength = 0;
        let chunks = [];

        while(true) {
          const {done, value} = await reader.read();
          
          if (done) {
            break;
          }
          
          chunks.push(value);
          receivedLength += value.length;
          setProgress(Math.round((receivedLength / contentLength) * 100));
        }

        let allChunks = new Uint8Array(receivedLength);
        let position = 0;
        for(let chunk of chunks) {
          allChunks.set(chunk, position);
          position += chunk.length;
        }

        // Convert to a string if needed, or process as binary data
        // const result = new TextDecoder("utf-8").decode(allChunks);
        setFileContent(allChunks);
        setData(allChunks);
      } catch (err) {
        console.error('Error reading file:', err);
        setError(err.message);
      }
    }

    readFile();
  }, [filePath]);

  if (error) {
    return <div>Error reading file: {error}</div>;
  }

  if (!fileContent) {
    return <div>Loading file... {progress}% complete</div>;
  }

  return (
    <div>
      {/* Add more processing or display logic here */}
    </div>
  );
}

export default LargeFileReader;

// Usage in another component:
// <LargeFileReader filePath="/path/to/large/file.bin" />