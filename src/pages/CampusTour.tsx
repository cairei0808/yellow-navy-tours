import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import campusTourVideo from "@/assets/campus-tour.mp4";
import { Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";

const CampusTour = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Campus Tour
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Take a virtual tour of Fernando Air Base Integrated National High School 
              and explore our campus facilities, classrooms, and learning environments.
            </p>
          </div>

          <div className="relative rounded-lg overflow-hidden shadow-2xl bg-black">
            <video
              ref={videoRef}
              className="w-full aspect-video"
              src={campusTourVideo}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onClick={togglePlay}
            >
              Your browser does not support the video tag.
            </video>

            {/* Video Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                    onClick={togglePlay}
                  >
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </Button>
                  
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                    onClick={toggleMute}
                  >
                    {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                  </Button>
                </div>

                <Button
                  size="icon"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                  onClick={toggleFullscreen}
                >
                  <Maximize className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-lg bg-card border border-border">
              <h3 className="font-semibold text-lg mb-2 text-foreground">Explore Facilities</h3>
              <p className="text-muted-foreground">
                View our modern classrooms, laboratories, library, and sports facilities.
              </p>
            </div>
            
            <div className="p-6 rounded-lg bg-card border border-border">
              <h3 className="font-semibold text-lg mb-2 text-foreground">Campus Life</h3>
              <p className="text-muted-foreground">
                Experience the vibrant student life and activities at FABINHS.
              </p>
            </div>
            
            <div className="p-6 rounded-lg bg-card border border-border">
              <h3 className="font-semibold text-lg mb-2 text-foreground">Learning Environment</h3>
              <p className="text-muted-foreground">
                Discover our conducive spaces designed for effective learning.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CampusTour;
