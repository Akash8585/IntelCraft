import React, { useState } from 'react';
import ReactMarkdown from "react-markdown";
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { Check, Copy, FileText, Loader2 } from 'lucide-react';
import { ProposalDisplayProps } from '../types';

const ProposalDisplay: React.FC<ProposalDisplayProps> = ({
  proposal,
  company,
  isGenerating,
  isResetting,
  glassStyle,
  fadeInAnimation,
  loaderColor
}) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyToClipboard = async () => {
    if (!proposal) return;
    
    try {
      await navigator.clipboard.writeText(proposal);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy proposal: ', err);
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Generating Partnership Proposal</h3>
            <p className="text-sm text-gray-600">
              Creating a comprehensive business proposal based on research insights...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Don't render if no proposal
  if (!proposal) return null;

  return (
    <div 
      className={`${glassStyle.card} ${fadeInAnimation.fadeIn} ${isResetting ? 'opacity-0 transform -translate-y-4' : 'opacity-100 transform translate-y-0'} font-['DM_Sans']`}
    >
      {/* Header with title and actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`${glassStyle.base} p-2 rounded-full bg-[#8B5CF6]/10 border-[#8B5CF6]/20`}>
            <FileText className="h-5 w-5 text-[#8B5CF6]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Partnership Proposal
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
            className="inline-flex items-center justify-center px-3 py-2 rounded-lg bg-[#468BFF] text-white hover:bg-[#8FBCFA] transition-all duration-200 text-sm font-medium"
          >
            {isCopied ? (
              <>
                <Check className="h-4 w-4 mr-1" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </>
            )}
          </button>
      </div>

      {/* Proposal content */}
      <div className="bg-white/50 rounded-xl p-8 border border-gray-200/50">
        <div className="prose prose-base max-w-none">
          <ReactMarkdown
            rehypePlugins={[rehypeRaw]}
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({node, ...props}) => (
                <h1 className="text-3xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3" {...props} />
              ),
              h2: ({node, ...props}) => (
                <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4" {...props} />
              ),
              h3: ({node, ...props}) => (
                <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3" {...props} />
              ),
              p: ({node, ...props}) => (
                <p className="text-gray-800 leading-relaxed mb-4 last:mb-0" {...props} />
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
                <ul className="text-gray-800 space-y-2 list-disc pl-6 mb-4" {...props} />
              ),
              ol: ({node, ...props}) => (
                <ol className="text-gray-800 space-y-2 list-decimal pl-6 mb-4" {...props} />
              ),
              li: ({node, ...props}) => (
                <li className="text-gray-800" {...props} />
              ),
              blockquote: ({node, ...props}) => (
                <blockquote className="border-l-4 border-[#8B5CF6] pl-4 py-2 my-4 bg-purple-50/50 rounded-r-lg" {...props} />
              ),
              code: ({node, inline, ...props}: any) => (
                inline 
                  ? <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono" {...props} />
                  : <code className="block bg-gray-100 text-gray-800 p-4 rounded-lg text-sm font-mono overflow-x-auto" {...props} />
              ),
              table: ({node, ...props}) => (
                <div className="overflow-x-auto my-4">
                  <table className="min-w-full border border-gray-200 rounded-lg" {...props} />
                </div>
              ),
              th: ({node, ...props}) => (
                <th className="border border-gray-200 px-4 py-2 bg-gray-50 font-semibold text-left" {...props} />
              ),
              td: ({node, ...props}) => (
                <td className="border border-gray-200 px-4 py-2" {...props} />
              ),
            }}
          >
            {proposal}
          </ReactMarkdown>
        </div>
      </div>

      {/* Footer with tips */}
      <div className="mt-4 p-4 bg-purple-50/50 rounded-lg border border-purple-200/30">
        <div className="flex items-start space-x-2">
          <div className="flex-shrink-0 mt-0.5">
            <div className="w-2 h-2 bg-[#8B5CF6] rounded-full"></div>
          </div>
          <div>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Pro tip:</span> This proposal is fully customizable. You can edit sections, add specific technical details, or include case studies before sending to the company.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalDisplay; 