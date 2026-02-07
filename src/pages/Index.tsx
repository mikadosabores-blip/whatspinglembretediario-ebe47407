import { ArrowUpRight, MessageCircle } from "lucide-react";

const Index = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="relative w-full max-w-3xl rounded-[var(--radius)] bg-primary p-10 md:p-16 shadow-2xl overflow-hidden min-h-[480px] flex flex-col justify-between">
        {/* Decorative subtle circle */}
        <div className="absolute left-[-40px] top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-primary-foreground/20" />

        {/* Top content */}
        <div className="flex items-start justify-between gap-6">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-primary-foreground leading-[1.1] tracking-tight max-w-lg">
            Like & Follow for Regular Updates.
          </h1>
          <ArrowUpRight className="text-primary-foreground w-12 h-12 md:w-16 md:h-16 flex-shrink-0 mt-2" strokeWidth={2.5} />
        </div>

        {/* Bottom bar */}
        <div className="flex items-end justify-between mt-16">
          <p className="text-primary-foreground/70 text-sm md:text-base">
            More information on <span className="underline underline-offset-2">whatsping.com</span>
          </p>
          <div className="flex items-center gap-2 text-primary-foreground">
            <MessageCircle className="w-6 h-6" strokeWidth={2.5} />
            <span className="text-lg md:text-xl font-bold tracking-tight">WhatsPing</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
