import React from 'react';

const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              Terms of Service
            </h1>
            <p className="text-gray-600 font-medium">Effective Date: January 20, 2025</p>
          </div>

          <div className="prose prose-lg max-w-none">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using IntelCraft ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access the Service.
            </p>

            <h2>2. Description of Service</h2>
            <p>IntelCraft is an AI-powered SaaS platform that provides:</p>
            <ul>
              <li>Company research and analysis</li>
              <li>Automated email generation</li>
              <li>Proposal generation</li>
              <li>Business intelligence tools</li>
            </ul>

            <h2>3. User Accounts</h2>
            
            <h3>3.1 Account Creation</h3>
            <ul>
              <li>You must create an account to use our Service</li>
              <li>You may sign up using Google OAuth</li>
              <li>You are responsible for maintaining the confidentiality of your account</li>
            </ul>

            <h3>3.2 Account Responsibilities</h3>
            <ul>
              <li>You must provide accurate and complete information</li>
              <li>You are responsible for all activities under your account</li>
              <li>You must notify us immediately of any unauthorized use</li>
              <li>You must be at least 18 years old to use the Service</li>
            </ul>

            <h2>4. Acceptable Use</h2>
            
            <h3>4.1 Permitted Uses</h3>
            <p>You may use the Service for:</p>
            <ul>
              <li>Legitimate business research and outreach</li>
              <li>Generating professional communications</li>
              <li>Analyzing company information for business purposes</li>
            </ul>

            <h3>4.2 Prohibited Uses</h3>
            <p>You may not:</p>
            <ul>
              <li>Use the Service for any illegal or unauthorized purpose</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Use the Service to harm, harass, or defame others</li>
              <li>Reverse engineer, decompile, or disassemble the Service</li>
              <li>Use automated tools to access the Service without permission</li>
            </ul>

            <h2>5. Intellectual Property</h2>
            
            <h3>5.1 Our Rights</h3>
            <ul>
              <li>The Service and its original content, features, and functionality are owned by IntelCraft</li>
              <li>All trademarks, service marks, and trade names are our property</li>
              <li>You may not use our intellectual property without written permission</li>
            </ul>

            <h3>5.2 Your Rights</h3>
            <ul>
              <li>You retain ownership of content you create using our Service</li>
              <li>You grant us a license to use your content to provide the Service</li>
              <li>You are responsible for ensuring you have rights to any content you input</li>
            </ul>

            <h2>6. Privacy and Data</h2>
            
            <h3>6.1 Data Collection</h3>
            <ul>
              <li>We collect and process data as described in our <a href="/privacy-policy" className="text-blue-600 hover:text-blue-800">Privacy Policy</a></li>
              <li>By using the Service, you consent to our data practices</li>
              <li>We use Google OAuth for authentication</li>
            </ul>

            <h3>6.2 Data Security</h3>
            <ul>
              <li>We implement reasonable security measures</li>
              <li>You are responsible for protecting your account credentials</li>
              <li>We are not liable for unauthorized access to your account</li>
            </ul>

            <h2>7. Service Availability</h2>
            
            <h3>7.1 Service Level</h3>
            <ul>
              <li>We strive to maintain high availability but do not guarantee 100% uptime</li>
              <li>We may perform maintenance that temporarily affects availability</li>
              <li>We will provide reasonable notice for scheduled maintenance</li>
            </ul>

            <h3>7.2 Service Changes</h3>
            <ul>
              <li>We may modify, suspend, or discontinue the Service at any time</li>
              <li>We will provide reasonable notice for material changes</li>
              <li>Continued use after changes constitutes acceptance</li>
            </ul>

            <h2>8. Payment and Billing</h2>
            
            <h3>8.1 Pricing</h3>
            <ul>
              <li>Service pricing is available on our website</li>
              <li>Prices may change with reasonable notice</li>
              <li>All fees are non-refundable unless otherwise stated</li>
            </ul>

            <h3>8.2 Payment Terms</h3>
            <ul>
              <li>Payment is due upon service activation</li>
              <li>We may suspend service for non-payment</li>
              <li>You are responsible for all applicable taxes</li>
            </ul>

            <h2>9. Disclaimers and Limitations</h2>
            
            <h3>9.1 Service Disclaimer</h3>
            <ul>
              <li>The Service is provided "as is" without warranties</li>
              <li>We disclaim all warranties, express or implied</li>
              <li>We do not guarantee accuracy of research results</li>
              <li>AI-generated content should be reviewed before use</li>
            </ul>

            <h3>9.2 Limitation of Liability</h3>
            <ul>
              <li>Our liability is limited to the amount you paid for the Service</li>
              <li>We are not liable for indirect, incidental, or consequential damages</li>
              <li>We are not liable for data loss or service interruptions</li>
            </ul>

            <h2>10. Indemnification</h2>
            <p>You agree to indemnify and hold harmless IntelCraft from any claims, damages, or expenses arising from:</p>
            <ul>
              <li>Your use of the Service</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any third-party rights</li>
            </ul>

            <h2>11. Termination</h2>
            
            <h3>11.1 Termination by You</h3>
            <ul>
              <li>You may cancel your account at any time</li>
              <li>Cancellation takes effect immediately</li>
              <li>No refunds for partial periods</li>
            </ul>

            <h3>11.2 Termination by Us</h3>
            <ul>
              <li>We may terminate your account for Terms violations</li>
              <li>We may terminate with reasonable notice for other reasons</li>
              <li>Upon termination, your access to the Service ends</li>
            </ul>

            <h2>12. Governing Law</h2>
            <p>
              These Terms are governed by the laws of [Your Jurisdiction]. Any disputes will be resolved in the courts of [Your Jurisdiction].
            </p>

            <h2>13. Dispute Resolution</h2>
            
            <h3>13.1 Informal Resolution</h3>
            <ul>
              <li>We encourage informal resolution of disputes</li>
              <li>Contact us at <a href="mailto:akashkumarprasad984@gmail.com" className="text-blue-600 hover:text-blue-800">akashkumarprasad984@gmail.com</a></li>
            </ul>

            <h3>13.2 Arbitration</h3>
            <ul>
              <li>Disputes may be resolved through binding arbitration</li>
              <li>Arbitration will be conducted in [Your Jurisdiction]</li>
              <li>You waive your right to a jury trial</li>
            </ul>

            <h2>14. Severability</h2>
            <p>
              If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in effect.
            </p>

            <h2>15. Entire Agreement</h2>
            <p>
              These Terms constitute the entire agreement between you and IntelCraft regarding the Service.
            </p>

            <h2>16. Changes to Terms</h2>
            <p>We may update these Terms from time to time. We will notify you of material changes by:</p>
            <ul>
              <li>Posting the new Terms on our website</li>
              <li>Sending you an email notification</li>
              <li>Continuing to use the Service after changes constitutes acceptance</li>
            </ul>

            <h2>17. Contact Information</h2>
            <p>For questions about these Terms, please contact us at:</p>
            <p>
              <strong>Email</strong>: <a href="mailto:akashkumarprasad984@gmail.com" className="text-blue-600 hover:text-blue-800">akashkumarprasad984@gmail.com</a><br />
              <strong>Address</strong>: [Your Business Address]
            </p>

            <hr className="my-8" />
            <p className="text-sm text-gray-500 text-center">
              <em>Last updated: January 20, 2025</em>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService; 