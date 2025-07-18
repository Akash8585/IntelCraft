import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Header from './components/Header';
import UserInfo from './components/UserInfo';
import ResearchBriefings from './components/ResearchBriefings';
import CurationExtraction from './components/CurationExtraction';
import ResearchQueries from './components/ResearchQueries';
import ResearchStatus from './components/ResearchStatus';
import ResearchReport from './components/ResearchReport';
import ResearchForm from './components/ResearchForm';
import EmailDisplay from './components/EmailDisplay';
import ProposalDisplay from './components/ProposalDisplay';
import LandingPage from './components/LandingPage';
import { AuthPage } from './components/Auth/AuthPage';
import { AuthCallback } from './components/Auth/AuthCallback';
import { useCustomAuthStore } from './stores/customAuth';
import {ResearchOutput, DocCount,DocCounts, EnrichmentCounts, ResearchState, ResearchStatusType} from './types';
import { checkForFinalReport } from './utils/handlers';
import { colorAnimation, dmSansStyle, glassStyle, fadeInAnimation } from './styles';
import { apiRequest } from './utils/api';
import { API_BASE_URL, WS_BASE_URL } from './utils/constants';

// Use centralized API configuration
const API_URL = API_BASE_URL;
const WS_URL = WS_BASE_URL;

// Add styles to document head
const colorStyle = document.createElement('style');
colorStyle.textContent = colorAnimation;
document.head.appendChild(colorStyle);

const dmSansStyleElement = document.createElement('style');
dmSansStyleElement.textContent = dmSansStyle;
document.head.appendChild(dmSansStyleElement);

function AppContent() {
  const navigate = useNavigate();
  const { user, isAuthenticated, signOut: originalSignOut, initializeAuth, isLoading } = useCustomAuthStore();

  // Custom sign out function that redirects to homepage
  const signOut = async () => {
    await originalSignOut();
    navigate('/');
  };

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Check for pending research data after authentication
  useEffect(() => {
    if (isAuthenticated) {
      const pendingData = localStorage.getItem('pendingResearchData');
      if (pendingData) {
        try {
          const formData = JSON.parse(pendingData);
          // Auto-fill the research form with pending data
          setOriginalCompanyName(formData.companyName);
          // Clear the pending data
          localStorage.removeItem('pendingResearchData');
          // Optionally auto-start the research
          // handleFormSubmit(formData);
        } catch (error) {
          console.error('Error parsing pending research data:', error);
          localStorage.removeItem('pendingResearchData');
        }
      }
    }
  }, [isAuthenticated]);

  const [isResearching, setIsResearching] = useState(false);
  const [status, setStatus] = useState<ResearchStatusType | null>(null);
  const [output, setOutput] = useState<ResearchOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [hasFinalReport, setHasFinalReport] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const maxReconnectAttempts = 3;
  const reconnectDelay = 2000; // 2 seconds
  const [researchState, setResearchState] = useState<ResearchState>({
    status: "idle",
    message: "",
    queries: [],
    streamingQueries: {},
    briefingStatus: {
      company: false,
      industry: false,
      financial: false,
      news: false
    }
  });
  const [originalCompanyName, setOriginalCompanyName] = useState<string>("");

  // Add ref for status section
  const statusRef = useRef<HTMLDivElement>(null);

  // Add state to track initial scroll
  const [hasScrolledToStatus, setHasScrolledToStatus] = useState(false);

  // Modify the scroll helper function
  const scrollToStatus = () => {
    if (!hasScrolledToStatus && statusRef.current) {
      const yOffset = -20; // Reduced negative offset to scroll further down
      const y = statusRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setHasScrolledToStatus(true);
    }
  };

  // Add new state for query section collapse
  const [isQueriesExpanded, setIsQueriesExpanded] = useState(true);
  const [shouldShowQueries, setShouldShowQueries] = useState(false);
  
  // Add new state for tracking search phase
  const [isSearchPhase, setIsSearchPhase] = useState(false);

  // Add state for section collapse
  const [isBriefingExpanded, setIsBriefingExpanded] = useState(true);
  const [isEnrichmentExpanded, setIsEnrichmentExpanded] = useState(true);

  // Add state for phase tracking
  const [currentPhase, setCurrentPhase] = useState<'search' | 'enrichment' | 'briefing' | 'complete' | null>(null);

  const [isResetting, setIsResetting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Add new state for color cycling
  const [loaderColor, setLoaderColor] = useState("#468BFF");

  // Add state for email functionality
  const [email, setEmail] = useState<string | null>(null);
  const [isEmailGenerating, setIsEmailGenerating] = useState(false);

  // Add state for proposal functionality
  const [proposal, setProposal] = useState<string | null>(null);
  const [isProposalGenerating, setIsProposalGenerating] = useState(false);
  
  // Research session management
  const [currentResearchId, setCurrentResearchId] = useState<string | null>(null);
  
  // Add useEffect for color cycling
  useEffect(() => {
    if (!isResearching) return;
    
    const colors = [
      "#468BFF", // Blue
      "#8FBCFA", // Light Blue
      "#FE363B", // Red
      "#FF9A9D", // Light Red
      "#FDBB11", // Yellow
      "#F6D785", // Light Yellow
    ];
    
    let currentIndex = 0;
    
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % colors.length;
      setLoaderColor(colors[currentIndex]);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isResearching]);

  const resetResearch = () => {
    setIsResetting(true);
    
    // Use setTimeout to create a smooth transition
    setTimeout(() => {
      setStatus(null);
      setOutput(null);
      setError(null);
      setIsComplete(false);
      setResearchState({
        status: "idle",
        message: "",
        queries: [],
        streamingQueries: {},
        briefingStatus: {
          company: false,
          industry: false,
          financial: false,
          news: false
        }
      });
      setCurrentPhase(null);
      setIsSearchPhase(false);
      setShouldShowQueries(false);
      setIsQueriesExpanded(true);
      setIsBriefingExpanded(true);
      setIsEnrichmentExpanded(true);
      setIsResetting(false);
      setHasScrolledToStatus(false); // Reset scroll flag when resetting research
      setEmail(null); // Reset email state
      setIsEmailGenerating(false);
      setProposal(null); // Reset proposal state
      setIsProposalGenerating(false);
    }, 300); // Match this with CSS transition duration
  };

  const connectWebSocket = (jobId: string) => {
    console.log("Initializing WebSocket connection for job:", jobId);
    
    // Construct WebSocket URL based on current protocol
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = WS_URL.replace(/^https?:\/\//, '').replace(/^ws:\/\//, '').replace(/^wss:\/\//, ''); // Remove any protocol prefixes
    const wsUrl = `${protocol}//${host}/research/ws/${jobId}`;
    
    console.log("Connecting to WebSocket URL:", wsUrl);
    
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("WebSocket connection established for job:", jobId);
      setReconnectAttempts(0);
    };

    ws.onclose = (event) => {
      console.log("WebSocket disconnected", {
        jobId,
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean,
        timestamp: new Date().toISOString()
      });

      if (isResearching && !hasFinalReport) {
        // Start polling for final report
        if (!pollingIntervalRef.current) {
          pollingIntervalRef.current = setInterval(() => checkForFinalReport(
            jobId,
            setOutput,
            setStatus,
            setIsComplete,
            setIsResearching,
            setCurrentPhase,
            setHasFinalReport,
            pollingIntervalRef
          ), 5000);
        }

        // Attempt reconnection if we haven't exceeded max attempts
        if (reconnectAttempts < maxReconnectAttempts) {
          console.log(`Attempting to reconnect (${reconnectAttempts + 1}/${maxReconnectAttempts})...`);
          setTimeout(() => {
            setReconnectAttempts(prev => prev + 1);
            connectWebSocket(jobId);
          }, reconnectDelay);
        } else {
          console.log("Max reconnection attempts reached");
          setError("Connection lost. Checking for final report...");
          // Keep polling for final report
        }
      } else if (isResearching) {
        setError("Research connection lost. Please try again.");
        setIsResearching(false);
      }
    };

    ws.onerror = (event) => {
      console.error("WebSocket error:", {
        jobId,
        error: event,
        timestamp: new Date().toISOString(),
        readyState: ws.readyState,
        url: wsUrl
      });
      
      // Don't immediately set error for connection issues - let onclose handle reconnection
      if (ws.readyState === WebSocket.CONNECTING) {
        console.log("WebSocket connection failed, will attempt reconnection");
      } else {
        setError("WebSocket connection error");
        setIsResearching(false);
      }
    };

    ws.onmessage = (event) => {
      const rawData = JSON.parse(event.data);

      if (rawData.type === "status_update") {
        const statusData = rawData.data;

        // Handle phase transitions
        if (statusData.result?.step) {
          const step = statusData.result.step;
          if (step === "Search" && currentPhase !== 'search') {
            setCurrentPhase('search');
            setIsSearchPhase(true);
            setShouldShowQueries(true);
            setIsQueriesExpanded(true);
          } else if (step === "Enriching" && currentPhase !== 'enrichment') {
            setCurrentPhase('enrichment');
            setIsSearchPhase(false);
            setIsQueriesExpanded(false);
            setIsEnrichmentExpanded(true);
          } else if (step === "Briefing" && currentPhase !== 'briefing') {
            setCurrentPhase('briefing');
            setIsEnrichmentExpanded(false);
            setIsBriefingExpanded(true);
          }
        }

        // Handle email generation
        if (statusData.status === "processing" && statusData.result?.step === "EmailGenerator") {
          setIsEmailGenerating(true);
          setStatus({
            step: "Generating Email",
            message: statusData.message || "Generating personalized outreach email..."
          });
        } else if (statusData.status === "email_ready") {
          setIsEmailGenerating(false);
          if (statusData.result?.email) {
            setEmail(statusData.result.email);
          }
        }

        // Handle proposal generation
        if (statusData.status === "processing" && statusData.result?.step === "ProposalGenerator") {
          setIsProposalGenerating(true);
          setStatus({
            step: "Generating Proposal",
            message: statusData.message || "Generating partnership proposal..."
          });
        } else if (statusData.status === "proposal_ready") {
          setIsProposalGenerating(false);
          if (statusData.result?.proposal) {
            setProposal(statusData.result.proposal);
          }
        }

        // Handle completion
        if (statusData.status === "completed") {
          setCurrentPhase('complete');
          setIsComplete(true);
          setIsResearching(false);
          setIsEmailGenerating(false); // Ensure email generation is stopped
          setIsProposalGenerating(false); // Ensure proposal generation is stopped
          setStatus({
            step: "Complete",
            message: "Research completed successfully"
          });
          setOutput({
            summary: "",
            details: {
              report: statusData.result.report,
            },
          });
          setHasFinalReport(true);
          
          // Research completed successfully
          
          // Clear polling interval if it exists
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
        }

        // Set search phase when first query starts generating
        if (statusData.status === "query_generating" && !isSearchPhase) {
          setIsSearchPhase(true);
          setShouldShowQueries(true);
          setIsQueriesExpanded(true);
        }
        
        // End search phase and start enrichment when moving to next step
        if (statusData.result?.step && statusData.result.step !== "Search") {
          if (isSearchPhase) {
            setIsSearchPhase(false);
            // Add delay before collapsing queries
            setTimeout(() => {
              setIsQueriesExpanded(false);
            }, 1000);
          }
          
          // Handle enrichment phase
          if (statusData.result.step === "Enriching") {
            setIsEnrichmentExpanded(true);
            // Collapse enrichment section when complete
            if (statusData.status === "enrichment_complete") {
              setTimeout(() => {
                setIsEnrichmentExpanded(false);
              }, 1000);
            }
          }
          
          // Handle briefing phase
          if (statusData.result.step === "Briefing") {
            setIsBriefingExpanded(true);
            if (statusData.status === "briefing_complete" && statusData.result?.category) {
              // Update briefing status
              setResearchState((prev) => {
                const newBriefingStatus = {
                  ...prev.briefingStatus,
                  [statusData.result.category]: true
                };
                
                // Check if all briefings are complete
                const allBriefingsComplete = Object.values(newBriefingStatus).every(status => status);
                
                // Only collapse when all briefings are complete
                if (allBriefingsComplete) {
                  setTimeout(() => {
                    setIsBriefingExpanded(false);
                  }, 2000);
                }
                
                return {
                  ...prev,
                  briefingStatus: newBriefingStatus
                };
              });
            }
          }
        }

        // Handle enrichment-specific updates
        if (statusData.result?.step === "Enriching") {
          
          // Initialize enrichment counts when starting a category
          if (statusData.status === "category_start") {
            const category = statusData.result.category as keyof EnrichmentCounts;
            if (category) {
              setResearchState((prev) => ({
                ...prev,
                enrichmentCounts: {
                  ...prev.enrichmentCounts,
                  [category]: {
                    total: statusData.result.count || 0,
                    enriched: 0
                  }
                } as EnrichmentCounts
              }));
            }
          }
          // Update enriched count when a document is processed
          else if (statusData.status === "extracted") {
            const category = statusData.result.category as keyof EnrichmentCounts;
            if (category) {
              setResearchState((prev) => {
                const currentCounts = prev.enrichmentCounts?.[category];
                if (currentCounts) {
                  return {
                    ...prev,
                    enrichmentCounts: {
                      ...prev.enrichmentCounts,
                      [category]: {
                        ...currentCounts,
                        enriched: Math.min(currentCounts.enriched + 1, currentCounts.total)
                      }
                    } as EnrichmentCounts
                  };
                }
                return prev;
              });
            }
          }
          // Handle extraction errors
          else if (statusData.status === "extraction_error") {
            const category = statusData.result.category as keyof EnrichmentCounts;
            if (category) {
              setResearchState((prev) => {
                const currentCounts = prev.enrichmentCounts?.[category];
                if (currentCounts) {
                  return {
                    ...prev,
                    enrichmentCounts: {
                      ...prev.enrichmentCounts,
                      [category]: {
                        ...currentCounts,
                        total: Math.max(0, currentCounts.total - 1)
                      }
                    } as EnrichmentCounts
                  };
                }
                return prev;
              });
            }
          }
          // Update final counts when a category is complete
          else if (statusData.status === "category_complete") {
            const category = statusData.result.category as keyof EnrichmentCounts;
            if (category) {
              setResearchState((prev) => ({
                ...prev,
                enrichmentCounts: {
                  ...prev.enrichmentCounts,
                  [category]: {
                    total: statusData.result.total || 0,
                    enriched: statusData.result.enriched || 0
                  }
                } as EnrichmentCounts
              }));
            }
          }
        }

        // Handle curation-specific updates
        if (statusData.result?.step === "Curation") {
          
          // Initialize doc counts when curation starts
          if (statusData.status === "processing" && statusData.result.doc_counts) {
            setResearchState((prev) => ({
              ...prev,
              docCounts: statusData.result.doc_counts as DocCounts
            }));
          }
          // Update initial count for a category
          else if (statusData.status === "category_start") {
            const docType = statusData.result?.doc_type as keyof DocCounts;
            if (docType) {
              setResearchState((prev) => ({
                ...prev,
                docCounts: {
                  ...prev.docCounts,
                  [docType]: {
                    initial: statusData.result.initial_count,
                    kept: 0
                  } as DocCount
                } as DocCounts
              }));
            }
          }
          // Increment the kept count for a specific category
          else if (statusData.status === "document_kept") {
            const docType = statusData.result?.doc_type as keyof DocCounts;
            setResearchState((prev) => {
              if (docType && prev.docCounts?.[docType]) {
                return {
                  ...prev,
                  docCounts: {
                    ...prev.docCounts,
                    [docType]: {
                      initial: prev.docCounts[docType].initial,
                      kept: prev.docCounts[docType].kept + 1
                    }
                  } as DocCounts
                };
              }
              return prev;
            });
          }
          // Update final doc counts when curation is complete
          else if (statusData.status === "curation_complete" && statusData.result.doc_counts) {
            setResearchState((prev) => ({
              ...prev,
              docCounts: statusData.result.doc_counts as DocCounts
            }));
          }
        }

        // Handle briefing status updates
        if (statusData.status === "briefing_start") {
          setStatus({
            step: "Briefing",
            message: statusData.message
          });
        } else if (statusData.status === "briefing_complete" && statusData.result?.category) {
          const category = statusData.result.category;
          setResearchState((prev) => ({
            ...prev,
            briefingStatus: {
              ...prev.briefingStatus,
              [category]: true
            }
          }));
        }

        // Handle query updates
        if (statusData.status === "query_generating") {
          setResearchState((prev) => {
            const key = `${statusData.result.category}-${statusData.result.query_number}`;
            return {
              ...prev,
              streamingQueries: {
                ...prev.streamingQueries,
                [key]: {
                  text: statusData.result.query,
                  number: statusData.result.query_number,
                  category: statusData.result.category,
                  isComplete: false
                }
              }
            };
          });
        } else if (statusData.status === "query_generated") {
          setResearchState((prev) => {
            // Remove from streaming queries and add to completed queries
            const key = `${statusData.result.category}-${statusData.result.query_number}`;
            const { [key]: _, ...remainingStreamingQueries } = prev.streamingQueries;
            
            return {
              ...prev,
              streamingQueries: remainingStreamingQueries,
              queries: [
                ...prev.queries,
                {
                  text: statusData.result.query,
                  number: statusData.result.query_number,
                  category: statusData.result.category,
                },
              ],
            };
          });
        }
        // Handle report streaming
        else if (statusData.status === "report_chunk") {
          setOutput((prev) => ({
            summary: "Generating report...",
            details: {
              report: prev?.details?.report
                ? prev.details.report + statusData.result.chunk
                : statusData.result.chunk,
            },
          }));
        }
        // Handle other status updates
        else if (statusData.status === "processing") {
          setIsComplete(false);
          // Only update status.step if we're not in curation or the new step is curation
          if (!status?.step || status.step !== "Curation" || statusData.result?.step === "Curation") {
            setStatus({
              step: statusData.result?.step || "Processing",
              message: statusData.message || "Processing...",
            });
          }
          
          // Reset briefing status when starting a new research
          if (statusData.result?.step === "Briefing") {
            setResearchState((prev) => ({
              ...prev,
              briefingStatus: {
                company: false,
                industry: false,
                financial: false,
                news: false
              }
            }));
          }
          
          scrollToStatus();
        } else if (
          statusData.status === "failed" ||
          statusData.status === "error" ||
          statusData.status === "website_error"
        ) {
          setError(statusData.error || statusData.message || "Research failed");
          
          // Research failed
          
          if (statusData.status === "website_error" && statusData.result?.continue_research) {
          } else {
            setIsResearching(false);
            setIsComplete(false);
          }
        }
      }
    };

    wsRef.current = ws;
  };

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Create a custom handler for the form that receives form data
  const handleFormSubmit = async (formData: {
    companyName: string;
    companyUrl: string;
    companyIndustry: string;
    helpDescription: string;
  }) => {

    // Clear any existing errors first
    setError(null);

    // If research is complete, reset the UI first
    if (isComplete) {
      resetResearch();
      await new Promise(resolve => setTimeout(resolve, 300)); // Wait for reset animation
    }

    // Reset states
    setHasFinalReport(false);
    setReconnectAttempts(0);
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    setIsResearching(true);
    setOriginalCompanyName(formData.companyName);
    setHasScrolledToStatus(false); // Reset scroll flag when starting new research

    // Save research session
    const researchId = generateResearchId();

    try {
      const url = `${API_URL}/research`;

      // Format the company URL if provided
      const formattedCompanyUrl = formData.companyUrl
        ? formData.companyUrl.startsWith('http://') || formData.companyUrl.startsWith('https://')
          ? formData.companyUrl
          : `https://${formData.companyUrl}`
        : undefined;

      // Log the request details
      const requestData = {
        company: formData.companyName,
        company_url: formattedCompanyUrl,
        industry: formData.companyIndustry || undefined,
        help_description: formData.helpDescription || undefined,
      };

      const response = await apiRequest('/research', {
        method: "POST",
        body: JSON.stringify(requestData),
      }).catch((error) => {
        console.error("Fetch error:", error);
        throw error;
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log("Error response:", errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.job_id) {
        console.log("Connecting WebSocket with job_id:", data.job_id);
        connectWebSocket(data.job_id);
      } else {
        throw new Error("No job ID received");
      }
    } catch (err) {
      console.log("Caught error:", err);
      setError(err instanceof Error ? err.message : "Failed to start research");
      setIsResearching(false);
      
      // Research failed
    }
  };



  // Add new function to handle copying to clipboard
  const handleCopyToClipboard = async () => {
    if (!output?.details?.report) return;
    
    try {
      await navigator.clipboard.writeText(output.details.report);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy text: ', err);
      setError('Failed to copy to clipboard');
    }
  };

  // Add document count display component

  // Add BriefingProgress component

  // Add EnrichmentProgress component

  // Function to render progress components in order
  const renderProgressComponents = () => {
    const components = [];

    // Research Report (always at the top when available)
    if (output && output.details) {
      components.push(
        <ResearchReport
          key="report"
          output={{
            summary: output.summary,
            details: {
              report: output.details.report || ''
            }
          }}
          isResetting={isResetting}
          glassStyle={glassStyle}
          fadeInAnimation={fadeInAnimation}
          loaderColor={loaderColor}
          isCopied={isCopied}
          onCopyToClipboard={handleCopyToClipboard}
        />
      );
    }

    // Email Display (show when email is available or being generated)
    if (email || isEmailGenerating) {
      components.push(
        <EmailDisplay
          key="email"
          email={email}
          company={originalCompanyName}
          isGenerating={isEmailGenerating}
          isResetting={isResetting}
          glassStyle={glassStyle}
          fadeInAnimation={fadeInAnimation}
          loaderColor={loaderColor}
        />
      );
    }

    // Proposal Display (show when proposal is available or being generated)
    if (proposal || isProposalGenerating) {
      components.push(
        <ProposalDisplay
          key="proposal"
          proposal={proposal}
          company={originalCompanyName}
          isGenerating={isProposalGenerating}
          isResetting={isResetting}
          glassStyle={glassStyle}
          fadeInAnimation={fadeInAnimation}
          loaderColor={loaderColor}
        />
      );
    }

    // Current phase component
    if (currentPhase === 'briefing' || (currentPhase === 'complete' && researchState.briefingStatus)) {
      components.push(
        <ResearchBriefings
          key="briefing"
          briefingStatus={researchState.briefingStatus}
          isExpanded={isBriefingExpanded}
          onToggleExpand={() => setIsBriefingExpanded(!isBriefingExpanded)}
          isResetting={isResetting}
        />
      );
    }

    if (currentPhase === 'enrichment' || currentPhase === 'briefing' || currentPhase === 'complete') {
      components.push(
        <CurationExtraction
          key="enrichment"
          enrichmentCounts={researchState.enrichmentCounts}
          isExpanded={isEnrichmentExpanded}
          onToggleExpand={() => setIsEnrichmentExpanded(!isEnrichmentExpanded)}
          isResetting={isResetting}
          loaderColor={loaderColor}
        />
      );
    }

    // Queries are always at the bottom when visible
    if (shouldShowQueries && (researchState.queries.length > 0 || Object.keys(researchState.streamingQueries).length > 0)) {
      components.push(
        <ResearchQueries
          key="queries"
          queries={researchState.queries}
          streamingQueries={researchState.streamingQueries}
          isExpanded={isQueriesExpanded}
          onToggleExpand={() => setIsQueriesExpanded(!isQueriesExpanded)}
          isResetting={isResetting}
          glassStyle={glassStyle.base}
        />
      );
    }

    return components;
  };

  // Add cleanup for polling interval
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // Handle landing page form submission
  const handleLandingPageSubmit = (formData: {
    companyName: string;
    companyUrl: string;
    companyIndustry: string;
    helpDescription: string;
  }) => {
    localStorage.setItem('pendingResearchData', JSON.stringify(formData));
    navigate('/auth');
  };

  // Handle new research
  const handleNewResearch = () => {
    setCurrentResearchId(null);
    resetResearch();
  };

  // Generate research ID when starting new research
  const generateResearchId = () => {
    const researchId = `research_${Date.now()}`;
    setCurrentResearchId(researchId);
    return researchId;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
          <div className="animate-spin h-8 w-8 mx-auto mb-4 text-blue-600 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h2>
          <p className="text-gray-600">Checking authentication status...</p>
        </div>
      </div>
    );
  }

  // Protected route component for authenticated users
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!isAuthenticated) {
      return <Navigate to="/auth" replace />;
    }
    return <>{children}</>;
  };

  // Main app dashboard component
  const AppDashboard = () => (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-gray-50 to-white relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(70,139,255,0.35)_1px,transparent_0)] bg-[length:24px_24px] bg-center"></div>
      
      {/* User Info */}
      <UserInfo user={user} onSignOut={signOut} onNewResearch={handleNewResearch} />

      {/* Main Content */}
      <div className="p-8 pt-20">
        <div className="max-w-5xl mx-auto space-y-8 relative">
          {/* IntelCraft Branding */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              IntelCraft
            </h1>
            <p className="text-lg text-gray-600 font-medium">
              Your AI outreach agent.
            </p>
          </div>

          {/* Form Section */}
          <ResearchForm 
            onSubmit={handleFormSubmit}
            isResearching={isResearching}
            glassStyle={glassStyle}
            loaderColor={loaderColor}
          />

          {/* Error Message */}
          {error && (
            <div 
              className={`${glassStyle.card} border-[#FE363B]/30 bg-[#FE363B]/10 ${fadeInAnimation.fadeIn} ${isResetting ? 'opacity-0 transform -translate-y-4' : 'opacity-100 transform translate-y-0'} font-['DM_Sans']`}
            >
              <p className="text-[#FE363B]">{error}</p>
            </div>
          )}

          {/* Status Box */}
          <ResearchStatus
            status={status}
            error={error}
            isComplete={isComplete}
            currentPhase={currentPhase}
            isResetting={isResetting}
            glassStyle={glassStyle}
            loaderColor={loaderColor}
            statusRef={statusRef}
          />

          {/* Progress Components Container */}
          <div className="space-y-12 transition-all duration-500 ease-in-out">
            {renderProgressComponents()}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Routes>
      <Route path="/" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage onGenerateResearch={handleLandingPageSubmit} />
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <AppDashboard />
        </ProtectedRoute>
      } />
      <Route path="/auth" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> : <AuthPage />
      } />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/about" element={<div className="min-h-screen flex items-center justify-center text-2xl">About Page Coming Soon</div>} />
      <Route path="/features" element={<div className="min-h-screen flex items-center justify-center text-2xl">Features Page Coming Soon</div>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return <AppContent />;
}