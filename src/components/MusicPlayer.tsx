
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Volume2, VolumeX } from 'lucide-react';

interface MusicPlayerProps {
  src: string;
}

export function MusicPlayer({ src }: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
        audioRef.current.loop = true;
    }
  }, [])
  
  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(error => {
          console.error("Audio playback failed:", error);
          // Autoplay is often blocked, user interaction is required.
      });
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="fixed bottom-6 left-6 z-50">
        <audio ref={audioRef} src={src} preload="auto" />
        <Button
            variant="ghost"
            size="icon"
            onClick={togglePlay}
            className="bg-background/50 backdrop-blur-sm rounded-full h-12 w-12 hover:bg-primary/20"
            aria-label={isPlaying ? 'Pause music' : 'Play music'}
        >
            {isPlaying ? (
                <Volume2 className="h-6 w-6 text-primary" />
            ) : (
                <VolumeX className="h-6 w-6 text-muted-foreground" />
            )}
        </Button>
    </div>
  );
}
