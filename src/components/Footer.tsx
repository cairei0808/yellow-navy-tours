import fabinhsLogo from "@/assets/fabinhs-logo.jpg";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src={fabinhsLogo} alt="FABINHS Logo" className="w-12 h-12 rounded-full object-cover" />
              <span className="text-xl font-bold">FABINHS Virtual Tour</span>
            </div>
            <p className="text-primary-foreground/80">
              Empowering students to achieve excellence through innovative education.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="#home" className="text-primary-foreground/80 hover:text-accent transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="#about" className="text-primary-foreground/80 hover:text-accent transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#tour" className="text-primary-foreground/80 hover:text-accent transition-colors">
                  Virtual Tour
                </a>
              </li>
              <li>
                <a href="#contact" className="text-primary-foreground/80 hover:text-accent transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Programs</h4>
            <ul className="space-y-2 text-primary-foreground/80">
              <li>Junior High School (Grades 7-10)</li>
              <li>Senior High School (Grades 11-12)</li>
              <li>Academic Track</li>
              <li>TVL Track</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Hours</h4>
            <ul className="space-y-2 text-primary-foreground/80">
              <li>Monday - Friday: 8:00 AM - 4:00 PM</li>
              <li>Office Hours: 7:30 AM - 5:00 PM</li>
              <li>Saturday Tours: By Appointment</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 pt-8 text-center text-primary-foreground/80">
          <p>&copy; {new Date().getFullYear()} FABINHS Virtual Tour. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
