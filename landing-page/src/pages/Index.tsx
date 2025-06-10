
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <Header />
      <Hero />
      <Features />
      <CTA />
      <Footer />
    </div>
  );
};

export default Index;
