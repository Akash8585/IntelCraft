import React, { useState } from 'react';
import ReactMarkdown from "react-markdown";
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { Check, Copy, Mail, Loader2 } from 'lucide-react';
import { EmailDisplayProps } from '../types';

const EmailDisplay: React.FC<EmailDisplayProps> = ({
  email,
  company,
  isGenerating,
  isResetting,
  glassStyle,
  fadeInAnimation,
  loaderColor
}) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyToClipboard = async () => {
    if (!email) return;
    
    try {
      await navigator.clipboard.writeText(email);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy email: ', err);
    }
  };

  // Show loading state when generating
  if (isGenerating) {
    return (
      <div 
        className={`${glassStyle.card} ${fadeInAnimation.fadeIn} ${isResetting ? 'opacity-0 transform -translate-y-4' : 'opacity-100 transform translate-y-0'} font-['DM_Sans']`}
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className={`${glassStyle.base} p-3 rounded-full bg-[#468BFF]/10 border-[#468BFF]/20`}>
                <Loader2 className="h-6 w-6 animate-spin" style={{ stroke: loaderColor }} />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Generating Outreach Email</h3>
            <p className="text-sm text-gray-600">
              Creating a personalized email based on the research findings...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Don't render if no email
  if (!email) return null;

  return (
    <div 
      className={`${glassStyle.card} ${fadeInAnimation.fadeIn} ${isResetting ? 'opacity-0 transform -translate-y-4' : 'opacity-100 transform translate-y-0'} font-['DM_Sans']`}
    >
      {/* Header with title and actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`${glassStyle.base} p-2 rounded-full bg-[#22C55E]/10 border-[#22C55E]/20`}>
            <Mail className="h-5 w-5 text-[#22C55E]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Outreach Email
            </h3>
            {company && (
              <p className="text-sm text-gray-600">
                Generated for {company}
              </p>
            )}
          </div>
        </div>
        
        <button
          onClick={handleCopyToClipboard}
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[#468BFF] text-white hover:bg-[#8FBCFA] transition-all duration-200 text-sm font-medium"
        >
          {isCopied ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-2" />
              Copy Email
            </>
          )}
        </button>
      </div>

      {/* Email content */}
      <div className="bg-white/50 rounded-xl p-6 border border-gray-200/50">
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown
            rehypePlugins={[rehypeRaw]}
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({node, ...props}) => (
                <p className="text-gray-800 leading-relaxed mb-3 last:mb-0" {...props} />
              ),
              strong: ({node, ...props}) => (
                <strong className="font-semibold text-gray-900" {...props} />
              ),
              em: ({node, ...props}) => (
                <em className="italic text-gray-700" {...props} />
              ),
              a: ({node, href, ...props}) => (
                <a 
                  href={href}
                  className="text-[#468BFF] hover:text-[#8FBCFA] underline decoration-[#468BFF] hover:decoration-[#8FBCFA] cursor-pointer transition-colors" 
                  target="_blank"
                  rel="noopener noreferrer"
                  {...props} 
                />
              ),
              ul: ({node, ...props}) => (
                <ul className="text-gray-800 space-y-1 list-disc pl-5 mb-3" {...props} />
              ),
              li: ({node, ...props}) => (
                <li className="text-gray-800" {...props} />
              ),
            }}
          >
            {email}
          </ReactMarkdown>
        </div>
      </div>

      {/* Footer with tips */}
      <div className="mt-4 p-4 bg-blue-50/50 rounded-lg border border-blue-200/30">
        <div className="flex items-start space-x-2">
          <div className="flex-shrink-0 mt-0.5">
            <div className="w-2 h-2 bg-[#468BFF] rounded-full"></div>
          </div>
          <div>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Pro tip:</span> Personalize this further by adding specific details about their recent achievements or initiatives you discovered during research.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailDisplay; 