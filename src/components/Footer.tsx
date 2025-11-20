const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                <span className="text-xl font-bold text-accent-foreground">S</span>
              </div>
              <span className="text-xl font-bold">SchoolTour</span>
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
              <li>Elementary School</li>
              <li>Middle School</li>
              <li>High School</li>
              <li>Advanced Placement</li>
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
          <p>&copy; {new Date().getFullYear()} SchoolTour. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
