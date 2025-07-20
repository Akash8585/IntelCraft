import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Building2, 
  TrendingUp, 
  Users, 
  ArrowRight, 
  Sparkles, 
  Mail, 
  FileText, 
  Zap, 
  Shield, 
  Globe, 
  BarChart3,
  CheckCircle,
  Star,
  Play
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LandingPageProps {
  onGenerateResearch: (formData: {
    companyName: string;
    companyUrl: string;
    companyIndustry: string;
    helpDescription: string;
  }) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGenerateResearch }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    companyUrl: '',
    companyIndustry: '',
    helpDescription: ''
  });
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerateResearch(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const features = [
    {
      icon: Search,
      title: "Deep Company Research",
      description: "Comprehensive analysis covering company background, financials, market position, and competitive landscape.",
      color: "blue"
    },
    {
      icon: Mail,
      title: "AI-Generated Outreach",
      description: "Personalized emails and proposals crafted based on research insights for maximum engagement.",
      color: "green"
    },
    {
      icon: FileText,
      title: "Professional Reports",
      description: "Generate polished, professional reports ready for presentations, due diligence, or strategic planning.",
      color: "purple"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Get comprehensive research reports and outreach materials in minutes, not hours or days.",
      color: "yellow"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your research data is encrypted and secure. We never share your information with third parties.",
      color: "red"
    },
    {
      icon: Globe,
      title: "Global Coverage",
      description: "Research companies worldwide with access to international databases and market intelligence.",
      color: "indigo"
    }
  ];

  const howItWorks = [
    {
      step: "01",
      title: "Enter Company Details",
      description: "Provide the company name, website, and any specific focus areas you want to research."
    },
    {
      step: "02",
      title: "AI Research Engine",
      description: "Our AI analyzes multiple data sources including financial reports, news, social media, and market data."
    },
    {
      step: "03",
      title: "Get Comprehensive Report",
      description: "Receive a detailed report with company insights, market analysis, and competitive intelligence."
    },
    {
      step: "04",
      title: "Generate Outreach Materials",
      description: "Create personalized emails and proposals based on your research findings."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Business Development Manager",
      company: "TechCorp Solutions",
      content: "IntelCraft has revolutionized our outreach process. We can now research prospects thoroughly and create personalized proposals in minutes.",
      rating: 5
    },
    {
      name: "Michael Rodriguez",
      role: "Sales Director",
      company: "Global Ventures",
      content: "The depth of research and quality of generated content is incredible. It's like having a full research team at your fingertips.",
      rating: 5
    },
    {
      name: "Emily Watson",
      role: "Marketing Manager",
      company: "Innovate Labs",
      content: "IntelCraft saves us hours of research time and helps us create more targeted, effective outreach campaigns.",
      rating: 5
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "bg-blue-100 text-blue-600",
      green: "bg-green-100 text-green-600",
      purple: "bg-purple-100 text-purple-600",
      yellow: "bg-yellow-100 text-yellow-600",
      red: "bg-red-100 text-red-600",
      indigo: "bg-indigo-100 text-indigo-600"
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(70,139,255,0.1)_1px,transparent_0)] bg-[length:24px_24px] bg-center"></div>
      
      <div className="relative z-10">
        {/* Floating Navbar */}
        <header className="fixed top-0 left-0 right-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="mt-4 mx-4 bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl"
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className="flex justify-between items-center px-6 py-4">
                {/* Logo */}
                <motion.div 
                  className="flex items-center space-x-3"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                  <div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      IntelCraft
                    </h1>
                    <p className="text-xs text-gray-500 font-medium">Your AI outreach agent</p>
              </div>
                </motion.div>



                {/* CTA Button */}
                <motion.button 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/auth')}
                >
                  Sign In
                </motion.button>
              </div>
            </motion.div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                  <Sparkles className="w-4 h-4" />
                  <span>Powered by Advanced AI Research</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">IntelCraft</span>
                  <br />
                  <span className="text-gray-900">Your AI Outreach Agent</span>
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
                  Transform your business outreach with AI-powered research. Get deep company insights, generate personalized emails, and create compelling proposals in minutes.
                </p>
                <div className="flex items-center justify-center space-x-4 mb-8">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                    <span className="text-sm text-gray-600 ml-2">4.9/5 from 500+ users</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Research Form */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-4xl mx-auto mb-20"
            >
              <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 border border-gray-200/50 shadow-xl">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Start Your Research</h2>
                  <p className="text-gray-600">Enter company details to begin your comprehensive analysis</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.companyName}
                        onChange={(e) => handleInputChange('companyName', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="e.g., Apple Inc."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company Website
                      </label>
                      <input
                        type="url"
                        value={formData.companyUrl}
                        onChange={(e) => handleInputChange('companyUrl', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="https://www.company.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Industry
                    </label>
                    <input
                      type="text"
                      value={formData.companyIndustry}
                      onChange={(e) => handleInputChange('companyIndustry', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="e.g., Technology, Healthcare, Finance"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Research Focus (Optional)
                    </label>
                    <textarea
                      value={formData.helpDescription}
                      onChange={(e) => handleInputChange('helpDescription', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                      placeholder="Describe any specific aspects you'd like to focus on (e.g., financial performance, market analysis, competitive positioning, recent news)"
                    />
                  </div>

                  <div className="text-center pt-4">
                    <button
                      type="submit"
                      className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg"
                    >
                      <span>Generate Research Report</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose IntelCraft?</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Powerful AI-driven research and outreach tools designed to help you connect with prospects more effectively.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 hover:shadow-lg transition-all"
                >
                  <div className={`w-12 h-12 ${getColorClasses(feature.color)} rounded-xl flex items-center justify-center mb-4`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
                </div>
              </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Get comprehensive research reports and outreach materials in just 4 simple steps.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {howItWorks.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-lg">{step.step}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </motion.div>
              ))}
                </div>
              </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Join hundreds of professionals who have transformed their outreach with IntelCraft.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50"
                >
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role} at {testimonial.company}</p>
                  </div>
                </motion.div>
              ))}
                </div>
              </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-white mb-4">Ready to Transform Your Outreach?</h2>
              <p className="text-xl text-blue-100 mb-8">
                Start your first research report today and see the difference AI-powered insights can make.
              </p>
              <button
                onClick={() => navigate('/auth')}
                className="inline-flex items-center space-x-2 bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative">
          <div className="absolute inset-0 bg-gray-900/5 border-t border-gray-200/50"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">IntelCraft</h3>
                  <p className="text-sm text-gray-600">Your AI outreach agent</p>
                </div>
              </div>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Transform your business outreach with AI-powered research and personalized content generation.
              </p>
            </div>
            
            <div className="border-t border-gray-200 pt-8 text-center">
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6 mb-4">
                <a 
                  href="/privacy-policy" 
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Privacy Policy
                </a>
                <a 
                  href="/terms-of-service" 
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Terms of Service
                </a>
                <a 
                  href="mailto:akashkumarprasad984@gmail.com" 
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Contact Us
                </a>
              </div>
              <p className="text-gray-600">
                © 2025 IntelCraft. All rights reserved. Powered by advanced AI research technology.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage; 