import React from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Ruler, CreditCard, Truck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

import { Hero3DBackground } from "@/components/Hero3DBackground";
import { Product3DShowcase } from "@/components/Product3DShowcase";
import { Bee3DParticles } from "@/components/Bee3DParticles";
import { Stats3DCounter } from "@/components/Stats3DCounter";
import { TiltCard } from "@/components/TiltCard";
import { FlyingBee } from "@/components/FlyingBee";
import { LogoBackground } from "@/components/LogoBackground";

export default function Index() {
  const navigate = useNavigate();

  const showcaseCards = [
    {
      title: "Browse Uniforms",
      subtitle: "Students browsing catalog",
      color: "bg-[#FFB800]",
      textColor: "text-[#1A1A1A]",
      icon: <ShoppingBag className="w-16 h-16" />,
      delay: 0,
    },
    {
      title: "Pick Your Size",
      subtitle: "Size guide illustration",
      color: "bg-[#6B4EFF]",
      textColor: "text-white",
      icon: <Ruler className="w-16 h-16" />,
      delay: 0.15,
    },
    {
      title: "Place Your Order",
      subtitle: "Easy checkout illustration",
      color: "bg-[#FFB800]",
      textColor: "text-[#1A1A1A]",
      icon: <CreditCard className="w-16 h-16" />,
      delay: 0.3,
    },
    {
      title: "Get Delivered",
      subtitle: "Delivery to school/home",
      color: "bg-[#6B4EFF]",
      textColor: "text-white",
      icon: <Truck className="w-16 h-16" />,
      delay: 0.45,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden relative">
      <LogoBackground />
      <FlyingBee />
      <Hero3DBackground />
      {/* Navigation - Frosted Glass Effect slides down on load */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 px-6 py-4 backdrop-blur-md bg-white/70 border-b border-border"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <Bee3DParticles />
            <div className="font-headline font-black text-2xl tracking-tighter text-foreground z-10 relative">
              HappyB.Pvt.Ltd
            </div>
          </div>
        </div>
      </motion.nav>

      <main className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
        {/* Hero Section */}
        <section className="flex flex-col md:flex-row items-center justify-between mb-32 gap-12">
          {/* Text slides up and fades */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex-1 space-y-6"
          >
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight text-foreground">
              Quality & Comfort <br />
              <span className="text-[#6B4EFF]">In Every Stitch.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-lg leading-relaxed">
              We make school uniforms that children love to wear, 
              designed for durability and comfort.
            </p>
            <motion.div 
              whileHover={{ scale: 1.02 }} 
              whileTap={{ scale: 0.98 }}
              className="inline-block"
            >
              <Button 
                onClick={() => navigate("/login")}
                className="h-14 px-8 text-lg font-bold rounded-full bg-[#FFB800] text-[#1A1A1A] hover:bg-[#FFB800]/90 transition-colors shadow-lg hover:shadow-xl group overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-[#ffd147] -translate-x-full group-hover:translate-x-0 transition-transform duration-600 ease-out z-0"></div>
                <span className="relative z-10 flex items-center gap-2 text-[#1A1A1A]">
                  Login
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </motion.div>
          </motion.div>

          {/* Hero Image scales up from 95% */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            className="flex-1 flex justify-center lg:justify-end"
          >
            <div className="relative w-full max-w-md aspect-square bg-muted rounded-[2rem] overflow-hidden flex items-center justify-center p-8">
              {/* Decorative backgrounds */}
              <div className="absolute inset-0 bg-[#FFB800]/10"></div>
              <motion.div 
                animate={{ y: [-15, 15, -15] }} 
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10 w-full h-full bg-white rounded-2xl shadow-xl flex items-center justify-center border border-border overflow-hidden"
              >
                <Product3DShowcase />
              </motion.div>
            </div>
          </motion.div>
        </section>

        <Stats3DCounter />

        {/* 4-Panel Showcase Section */}
        <section className="mb-24 relative z-10 pt-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
              How It Works
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              Simple steps to get your perfect uniform.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {showcaseCards.map((card, idx) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: card.delay, ease: "easeOut" }}
                className="h-[400px]"
              >
                <TiltCard className={`flex flex-col relative rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-shadow duration-600 ${card.color} ${card.textColor} w-full h-full cursor-default`}>
                  {/* Illustration Area */}
                  <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden">
                    {/* Subtle float animation for the icon inside */}
                    <motion.div
                      animate={{ y: [-8, 8, -8] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      className="relative z-10 pointer-events-none"
                    >
                      {card.icon}
                    </motion.div>
                    {/* Background decal */}
                    <div className="absolute inset-0 bg-black/5 mix-blend-overlay rounded-b-[40%] scale-150 -translate-y-1/4 pointer-events-none"></div>
                  </div>

                  {/* Text Area */}
                  <div className="p-8 pt-4 pointer-events-none">
                    <h3 className="text-xl font-bold mb-2">
                      {idx + 1}. {card.title}
                    </h3>
                    <p className="opacity-90 font-medium">
                      {card.subtitle}
                    </p>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
