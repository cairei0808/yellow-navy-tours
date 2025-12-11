import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import KioskSystem from "@/components/KioskSystem";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <KioskSystem />
      <Contact />
      <Footer />
    </div>
  );
};

export default Index;
