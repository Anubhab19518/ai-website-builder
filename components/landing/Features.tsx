import { Cpu, Zap, Globe2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function Features() {
  const features = [
    {
      title: "AI-powered generation",
      description: "Our advanced language models write clean, maintainable React code using shadcn/ui and Tailwind CSS.",
      icon: Cpu,
      color: "text-indigo-400",
      bg: "bg-indigo-400/10",
    },
    {
      title: "Real-time editing via chat",
      description: "Don't like a color? Want to move a button? Just ask the AI to change it, and watch the UI update instantly.",
      icon: Zap,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
    },
    {
      title: "One-click deployment",
      description: "No need to configure Vercel or AWS. We handle the entire deployment pipeline with a single click.",
      icon: Globe2,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
  ];

  return (
    <section id="features" className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-wide">Everything you need to ship faster</h2>
          <p className="text-xl text-zinc-400">Stop wrestling with boilerplate and infrastructure. Let AI handle the heavy lifting while you focus on the user experience.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="bg-zinc-950/50 border-white/10 backdrop-blur-sm hover:border-white/20 transition-colors">
              <CardHeader>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${feature.bg} ${feature.color}`}>
                  <feature.icon size={28} />
                </div>
                <CardTitle className="text-2xl text-white">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-zinc-400 text-lg leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
