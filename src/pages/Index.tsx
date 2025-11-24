import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import About from "@/components/About";
import KioskSystem from "@/components/KioskSystem";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <About />
      <KioskSystem />
      <Contact />
      <Footer />
    </div>
  );
};

export default Index;
