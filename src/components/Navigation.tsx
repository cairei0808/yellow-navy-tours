import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
              <span className="text-xl font-bold text-primary-foreground">S</span>
            </div>
            <span className="text-xl font-bold text-primary">SchoolTour</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#home" className="text-foreground hover:text-accent transition-colors">
              Home
            </a>
            <a href="#about" className="text-foreground hover:text-accent transition-colors">
              About
            </a>
            <a href="#tour" className="text-foreground hover:text-accent transition-colors">
              Virtual Tour
            </a>
            <a href="#contact" className="text-foreground hover:text-accent transition-colors">
              Contact
            </a>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
              Schedule Visit
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4 flex flex-col gap-4 animate-fade-in">
            <a
              href="#home"
              className="text-foreground hover:text-accent transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Home
            </a>
            <a
              href="#about"
              className="text-foreground hover:text-accent transition-colors"
              onClick={() => setIsOpen(false)}
            >
              About
            </a>
            <a
              href="#tour"
              className="text-foreground hover:text-accent transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Virtual Tour
            </a>
            <a
              href="#contact"
              className="text-foreground hover:text-accent transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Contact
            </a>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90 w-full">
              Schedule Visit
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
