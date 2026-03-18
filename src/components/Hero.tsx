import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroImage from "@/assets/fabinhs-school.webp";

const Hero = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center pt-20">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="FABINHS school building with Philippine flag"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 z-10 relative">
        <div className="max-w-3xl animate-fade-in">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 leading-tight">
            Welcome to
            <span className="block text-accent">FABINHS Kiosk System</span>
          </h1>
          <p className="text-xl md:text-2xl text-primary-foreground/90 mb-8 leading-relaxed">
            Discover our facilities and find your way
            around Fernando Air Base Integrated National High School with ease.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90 text-lg px-8 py-6"
              onClick={() => document.getElementById('kiosk')?.scrollIntoView({ behavior: 'smooth' })}
            >
              View Information Kiosk System
              <ArrowRight className="ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce z-10">
        <div className="w-6 h-10 border-2 border-primary-foreground rounded-full flex justify-center">
          <div className="w-1.5 h-3 bg-accent rounded-full mt-2"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
