import React, { useState, useRef, useEffect } from 'react';
import { Camera, Image, Upload, Trash2, X, RefreshCw, CheckCircle2, AlertCircle, ZoomIn, Eye, Sparkles } from 'lucide-react';
import api from '../services/api';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const ProfilePictureModal = ({ isOpen, onClose, currentAvatar, userName, userRole, onAvatarUpdated }) => {
  const [activeTab, setActiveTab] = useState('view'); // 'view' | 'gallery' | 'camera'
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileDetails, setFileDetails] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Camera stream state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  // Stop camera tracks cleanly
  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Cleanup camera on close or unmount
  useEffect(() => {
    if (!isOpen) {
      stopCameraStream();
      setPreviewUrl(null);
      setSelectedFile(null);
      setFileDetails(null);
      setError('');
      setSuccess('');
      setActiveTab('view');
    }
    return () => {
      stopCameraStream();
    };
  }, [isOpen]);

  // Start webcam
  const startCamera = async () => {
    setError('');
    setCameraError('');
    setPreviewUrl(null);
    setSelectedFile(null);
    setFileDetails(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera access is not supported on this browser or requires a secure connection (HTTPS/localhost).');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 640 }
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera permission was denied. Please allow camera access in your browser settings.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No webcam or camera device was detected on your device.');
      } else {
        setCameraError(`Camera error: ${err.message || 'Unable to access video device.'}`);
      }
      setIsCameraActive(false);
    }
  };

  // Capture frame from webcam
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const size = Math.min(video.videoWidth || 640, video.videoHeight || 640);

    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Center crop to square
    const startX = (video.videoWidth - size) / 2;
    const startY = (video.videoHeight - size) / 2;
    ctx.drawImage(video, startX, startY, size, size, 0, 0, size, size);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setError('Failed to capture photo from webcam.');
          return;
        }
        const file = new File([blob], `camera-snapshot-${Date.now()}.jpg`, { type: 'image/jpeg' });
        const localUrl = URL.createObjectURL(blob);
        setSelectedFile(file);
        setPreviewUrl(localUrl);
        setFileDetails({
          name: 'Camera Snapshot',
          size: `${(blob.size / 1024).toFixed(1)} KB`,
          type: 'image/jpeg'
        });
        stopCameraStream();
      },
      'image/jpeg',
      0.92
    );
  };

  // Handle gallery file selection
  const handleFileChange = (e) => {
    setError('');
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      setError('Please select a valid JPEG, PNG, or WebP image file.');
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(`Image size exceeds 5 MB (${(file.size / (1024 * 1024)).toFixed(2)} MB). Please select a smaller photo.`);
      return;
    }

    setSelectedFile(file);
    setFileDetails({
      name: file.name,
      size: `${(file.size / 1024).toFixed(1)} KB`,
      type: file.type
    });

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Save / Upload profile picture to backend
  const handleSaveUpload = async () => {
    if (!selectedFile) {
      setError('No new photo selected or captured.');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('profilePicture', selectedFile);

    try {
      const res = await api.post('/users/me/profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data?.success) {
        setSuccess('Profile picture updated successfully!');
        if (onAvatarUpdated) {
          onAvatarUpdated(res.data.user);
        }
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setError(res.data?.message || 'Failed to update profile picture.');
      }
    } catch (err) {
      setError(err.userMessage || 'Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Remove profile picture (reset to default)
  const handleRemoveAvatar = async () => {
    if (!window.confirm('Are you sure you want to remove your custom profile picture and reset to the default avatar?')) {
      return;
    }

    setRemoving(true);
    setError('');
    setSuccess('');

    try {
      const res = await api.delete('/users/me/profile-picture');
      if (res.data?.success) {
        setSuccess('Profile picture reset to default.');
        if (onAvatarUpdated) {
          onAvatarUpdated(res.data.user);
        }
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    } catch (err) {
      setError(err.userMessage || 'Failed to remove profile picture.');
    } finally {
      setRemoving(false);
    }
  };

  if (!isOpen) return null;

  const displayAvatar = previewUrl || currentAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 sm:p-7 shadow-2xl relative animate-scale-in max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={() => {
            stopCameraStream();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Manage Profile Picture</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Take a new photo with camera or choose from device gallery</p>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>{success}</span>
          </div>
        )}

        {/* Action Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              stopCameraStream();
              setActiveTab('view');
            }}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'view' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Current</span>
          </button>
          <button
            type="button"
            onClick={() => {
              stopCameraStream();
              setActiveTab('gallery');
              if (fileInputRef.current) fileInputRef.current.click();
            }}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'gallery' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Image className="w-3.5 h-3.5" />
            <span>Gallery</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('camera');
              startCamera();
            }}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'camera' ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Use Camera</span>
          </button>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Hidden Canvas for Camera Frame Capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* View / Preview State */}
        {activeTab !== 'camera' || previewUrl ? (
          <div className="space-y-4">
            <div className="relative mx-auto w-48 h-48 rounded-full border-4 border-indigo-100 shadow-xl overflow-hidden bg-slate-100 flex items-center justify-center group">
              <img
                src={displayAvatar}
                alt="Profile Avatar Preview"
                style={{ transform: `scale(${zoomLevel})` }}
                className="w-full h-full object-cover transition-transform duration-150"
              />
              {previewUrl && (
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                  New Photo Preview
                </div>
              )}
            </div>

            {/* User Meta Information */}
            <div className="text-center">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">{userName || 'Campus User'}</h4>
              <span className="inline-block mt-0.5 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {userRole || 'Member'}
              </span>
            </div>

            {/* Selected File Details */}
            {fileDetails && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between">
                <div className="truncate pr-2">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate">{fileDetails.name}</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">{fileDetails.size} • {fileDetails.type}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (fileInputRef.current) fileInputRef.current.click();
                  }}
                  className="px-2.5 py-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors"
                >
                  Change
                </button>
              </div>
            )}

            {/* Zoom Slider for Previews */}
            {previewUrl && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <ZoomIn className="w-3.5 h-3.5 text-slate-400" />
                    <span>Zoom & Crop Preview</span>
                  </span>
                  <span>{Math.round(zoomLevel * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="2"
                  step="0.05"
                  value={zoomLevel}
                  onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />
              </div>
            )}
          </div>
        ) : (
          /* Live Camera Stream Interface */
          <div className="space-y-4">
            {cameraError ? (
              <div className="p-6 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-2xl text-center space-y-3">
                <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
                <h4 className="font-bold text-sm text-rose-900 dark:text-rose-300">Camera Unavailable</h4>
                <p className="text-xs text-rose-700 dark:text-rose-400 leading-relaxed max-w-sm mx-auto">{cameraError}</p>
                <button
                  type="button"
                  onClick={() => {
                    stopCameraStream();
                    if (fileInputRef.current) fileInputRef.current.click();
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-700 hover:bg-rose-100 transition-colors"
                >
                  Choose From Gallery Instead
                </button>
              </div>
            ) : (
              <div className="text-center space-y-3">
                <div className="relative mx-auto w-52 h-52 rounded-full overflow-hidden border-4 border-cyan-500 shadow-xl bg-slate-900">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform -scale-x-100"
                  />
                  {/* Targeting circle guide */}
                  <div className="absolute inset-0 border-2 border-dashed border-white/40 rounded-full pointer-events-none" />
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400">Center your face inside the circle and click Capture.</p>

                <div className="flex justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={capturePhoto}
                    disabled={!isCameraActive}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-2 shadow-md transition-all transform hover:scale-[1.02] disabled:opacity-50"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Capture Photo</span>
                  </button>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Restart Camera"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-between gap-3 pt-6 border-t border-slate-100 dark:border-slate-800 mt-6">
          <div>
            {currentAvatar && !currentAvatar.includes('unsplash') && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                disabled={removing || uploading}
                className="px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{removing ? 'Removing...' : 'Remove Photo'}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                stopCameraStream();
                onClose();
              }}
              disabled={uploading}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>

            {previewUrl && (
              <button
                type="button"
                onClick={handleSaveUpload}
                disabled={uploading}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2 shadow-md transition-all transform hover:scale-[1.02] disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                <span>{uploading ? 'Saving & Securing...' : 'Save & Upload Photo'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePictureModal;
