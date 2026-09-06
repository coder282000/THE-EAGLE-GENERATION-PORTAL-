'use client';
// app/verify/liveness/page.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/button';
import { cn } from '@/lib/utils';
import { mockKYCSubmissions } from '@/components/mock/data';

// Mock current user ID
const CURRENT_USER_ID = '1';

type LivenessAction = 'blink' | 'smile' | 'turn_left' | 'turn_right';

const LIVENESS_ACTIONS: LivenessAction[] = ['blink', 'smile', 'turn_left', 'turn_right'];

const ACTION_LABELS: Record<LivenessAction, string> = {
  blink: 'Please blink your eyes',
  smile: 'Please smile at the camera',
  turn_left: 'Please turn your head to the left',
  turn_right: 'Please turn your head to the right',
};

const ACTION_ICONS: Record<LivenessAction, string> = {
  blink: '👀',
  smile: '😊',
  turn_left: '👈',
  turn_right: '👉',
};

export default function LivenessPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Liveness state
  const [currentAction, setCurrentAction] = useState<LivenessAction>('blink');
  const [actionStep, setActionStep] = useState(0);
  const [livenessVerified, setLivenessVerified] = useState(false);

  // Start camera on mount
  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
        setIsCameraReady(true);
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError('Unable to access camera. Please ensure camera permissions are enabled.');
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get photo data
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setPhotoData(dataUrl);

    // Simulate liveness check
    setIsCapturing(true);
    setTimeout(() => {
      // Check if we've done all actions
      if (actionStep < LIVENESS_ACTIONS.length - 1) {
        // Move to next action
        const nextStep = actionStep + 1;
        setActionStep(nextStep);
        setCurrentAction(LIVENESS_ACTIONS[nextStep]);
        setIsCapturing(false);
        // Reset photo after a moment to allow user to see the image
        setTimeout(() => {
          setPhotoData(null);
        }, 1200);
      } else {
        // All actions complete!
        setLivenessVerified(true);
        setIsCapturing(false);
      }
    }, 1500);
  };

  const retakePhoto = () => {
    setPhotoData(null);
    setIsCapturing(false);
  };

  const handleSubmit = async () => {
    if (!livenessVerified && !photoData) return;

    setIsSubmitting(true);

    try {
      // Simulate API call to upload selfie
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Update KYC submission record with selfie
      const kyc = mockKYCSubmissions.find((s) => s.userId === CURRENT_USER_ID);
      if (kyc) {
        // Remove existing selfie if any
        kyc.documents = kyc.documents.filter((d) => d.type !== 'selfie');
        kyc.documents.push({
          type: 'selfie',
          url: photoData || '/mock/selfie.png',
          status: 'pending',
          uploadedAt: new Date().toISOString(),
        });
        if (kyc.status === 'not_started') {
          kyc.status = 'pending';
          kyc.submittedAt = new Date().toISOString();
        }
      }

      // Redirect to address verification
      router.push('/verify/address');
    } catch (error) {
      console.error('Submission error:', error);
      setError('Failed to submit selfie. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-4xl mb-4">📷</div>
          <h2 className="text-xl font-semibold text-red-700 mb-2">Camera Error</h2>
          <p className="text-red-600">{error}</p>
          <Button
            variant="primary"
            className="mt-4"
            onClick={() => {
              setError(null);
              startCamera();
            }}
          >
            Try Again
          </Button>
          <Link href="/verify/identity" className="block mt-2 text-sm text-blue-600 hover:underline">
            ← Back to Identity Upload
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/profile/verification" className="hover:text-blue-600">
          Verification
        </Link>
        <span className="mx-2">/</span>
        <Link href="/verify/identity" className="hover:text-blue-600">
          Identity
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">Selfie / Liveness</span>
      </nav>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Selfie & Liveness Check</h1>
        <p className="text-gray-500 mb-6">
          {livenessVerified
            ? '✅ Liveness check complete! Your selfie has been captured.'
            : 'Follow the instructions below to complete your liveness check. This helps us verify you are a real person.'}
        </p>

        <div className="space-y-6">
          {/* Camera / Photo Preview */}
          <div className="bg-gray-900 rounded-lg overflow-hidden aspect-video relative">
            {photoData ? (
              <img
                src={photoData}
                alt="Captured selfie"
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                ref={videoRef}
                className={cn(
                  'w-full h-full object-cover',
                  !isCameraReady && 'opacity-0'
                )}
                autoPlay
                playsInline
                muted
              />
            )}
            {!isCameraReady && !photoData && (
              <div className="absolute inset-0 flex items-center justify-center text-white">
                <div className="text-center">
                  <div className="text-4xl mb-2">⏳</div>
                  <p>Loading camera...</p>
                </div>
              </div>
            )}
            {isCapturing && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-3 mx-auto"></div>
                  <p>Analyzing...</p>
                </div>
              </div>
            )}
            {livenessVerified && (
              <div className="absolute inset-0 bg-green-500 bg-opacity-20 flex items-center justify-center">
                <div className="bg-green-600 text-white px-6 py-3 rounded-lg text-xl font-bold">
                  ✅ Verified!
                </div>
              </div>
            )}
          </div>

          {/* Hidden canvas for capturing */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Liveness Instructions */}
          {!livenessVerified && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{ACTION_ICONS[currentAction]}</span>
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    Step {actionStep + 1} of {LIVENESS_ACTIONS.length}
                  </p>
                  <p className="text-blue-700">{ACTION_LABELS[currentAction]}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-blue-600">
                <span>💡</span>
                <span>Position your face in the center and click "Capture" when ready</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
            <div className="flex gap-3">
              {!livenessVerified && (
                <>
                  {photoData ? (
                    <Button variant="secondary" onClick={retakePhoto} disabled={isCapturing}>
                      🔄 Retake
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      onClick={capturePhoto}
                      disabled={!isCameraReady || isCapturing}
                    >
                      {isCapturing ? 'Analyzing...' : '📸 Capture'}
                    </Button>
                  )}
                </>
              )}
            </div>
            <div className="flex gap-3">
              {livenessVerified && (
                <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Continue to Address →'}
                </Button>
              )}
              <Link href="/verify/identity">
                <Button variant="secondary" type="button">
                  ← Back
                </Button>
              </Link>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center gap-2 justify-center">
            {LIVENESS_ACTIONS.map((_, index) => (
              <div
                key={index}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  index <= actionStep ? 'bg-green-500 w-8' : 'bg-gray-300 w-4'
                )}
              />
            ))}
          </div>

          {/* Liveness verified message */}
          {livenessVerified && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
              <p className="text-green-700 font-medium">✅ Liveness check passed!</p>
              <p className="text-sm text-green-600">Click "Continue to Address" to proceed.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
