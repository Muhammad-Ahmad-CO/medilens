"use client";
/**
 * Camera capture with file-upload fallback (for desktops / denied cameras).
 */
import { useEffect, useRef, useState } from "react";

export default function CameraCapture({
  onCapture,
}: {
  onCapture: (blob: Blob) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setReady(true);
        }
      } catch {
        setError("Camera unavailable — you can upload a photo instead.");
      }
    })();
    return () => stream?.getTracks().forEach((t) => t.stop());
  }, []);

  const capture = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    canvas.toBlob((b) => b && onCapture(b), "image/jpeg", 0.85);
  };

  return (
    <div>
      {error && <p className="muted small">{error}</p>}
      <div className="viewfinder">
        <video ref={videoRef} className="camera-frame" playsInline muted />
        <span className="corner tl" />
        <span className="corner tr" />
        <span className="corner bl" />
        <span className="corner br" />
        {ready && <div className="laser" />}
        <div className="scan-hint">Align the pack inside the frame</div>
      </div>
      <div className="capture-bar">
        <button className="btn capture-btn" onClick={capture} disabled={!ready}>
          📸 Capture label
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => fileRef.current?.click()}
        >
          Upload
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onCapture(f);
          }}
        />
      </div>
      <p className="muted small" style={{ marginTop: "0.6rem" }}>
        Tip: fill the frame with the pack&apos;s front label and hold steady in
        good light.
      </p>
    </div>
  );
}
