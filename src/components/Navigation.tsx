import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import fabinhsLogo from "@/assets/fabinhs-logo.jpg";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={fabinhsLogo} alt="FABINHS Logo" className="w-12 h-12 rounded-full object-cover" />
            <span className="text-xl font-bold text-primary">FABINHS Kiosk Information System</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <a href="/#home" className="text-foreground hover:text-accent transition-colors">
              Home
            </a>
            <a href="/#about" className="text-foreground hover:text-accent transition-colors">
              About
            </a>
            <a href="/#kiosk" className="text-foreground hover:text-accent transition-colors">
              Campus Map
            </a>
            <Link to="/campus-tour" className="text-foreground hover:text-accent transition-colors">
              Campus Tour
            </Link>
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
              href="/#home"
              className="text-foreground hover:text-accent transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Home
            </a>
            <a
              href="/#about"
              className="text-foreground hover:text-accent transition-colors"
              onClick={() => setIsOpen(false)}
            >
              About
            </a>
            <a
              href="/#kiosk"
              className="text-foreground hover:text-accent transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Campus Map
            </a>
            <Link
              to="/campus-tour"
              className="text-foreground hover:text-accent transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Campus Tour
            </Link>
            <a
              href="/#contact"
              className="text-foreground hover:text-accent transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Contact
            </a>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
