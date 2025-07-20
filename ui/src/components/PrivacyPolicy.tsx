import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              Privacy Policy
            </h1>
            <p className="text-gray-600 font-medium">Effective Date: January 20, 2025</p>
          </div>

          <div className="prose prose-lg max-w-none">
            <h2>1. Introduction</h2>
            <p>
              Welcome to IntelCraft ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered company research and automated email + proposal generation platform.
            </p>

            <h2>2. Information We Collect</h2>
            
            <h3>2.1 Information You Provide</h3>
            <ul>
              <li><strong>Account Information</strong>: When you sign up using Google OAuth, we collect your email address, full name, and profile picture (read-only access).</li>
              <li><strong>Usage Data</strong>: We collect information about how you use our service, including search queries, document generation history, and feature usage patterns.</li>
            </ul>

            <h3>2.2 Information Collected Automatically</h3>
            <ul>
              <li><strong>Log Data</strong>: We automatically collect certain information when you use our service, including your IP address, browser type, operating system, and access times.</li>
              <li><strong>Usage Analytics</strong>: We collect aggregated, anonymous data about how our service is used to improve functionality and user experience.</li>
            </ul>

            <h2>3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li><strong>Provide and Maintain Our Service</strong>: Deliver our AI-powered research and document generation services.</li>
              <li><strong>Improve Our Service</strong>: Analyze usage patterns to enhance functionality and user experience.</li>
              <li><strong>Communicate with You</strong>: Send important service updates, security alerts, and support messages.</li>
              <li><strong>Ensure Security</strong>: Protect against fraud, abuse, and security threats.</li>
              <li><strong>Comply with Legal Obligations</strong>: Meet applicable laws, regulations, and legal processes.</li>
            </ul>

            <h2>4. Information Sharing and Disclosure</h2>
            <p>We do not sell, trade, or otherwise transfer your personal information to third parties except in the following circumstances:</p>
            <ul>
              <li><strong>Service Providers</strong>: We may share information with trusted third-party service providers who assist us in operating our service (e.g., hosting providers, analytics services).</li>
              <li><strong>Legal Requirements</strong>: We may disclose information if required by law or in response to valid legal requests.</li>
              <li><strong>Business Transfers</strong>: In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of the transaction.</li>
              <li><strong>Consent</strong>: We may share information with your explicit consent.</li>
            </ul>

            <h2>5. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure.
            </p>

            <h2>6. Data Retention</h2>
            <p>
              We retain your personal information for as long as necessary to provide our services and comply with legal obligations. You may request deletion of your account and associated data at any time by contacting us.
            </p>

            <h2>7. Your Rights and Choices</h2>
            <p>Depending on your location, you may have the following rights regarding your personal information:</p>
            <ul>
              <li><strong>Access</strong>: Request access to your personal information.</li>
              <li><strong>Correction</strong>: Request correction of inaccurate or incomplete information.</li>
              <li><strong>Deletion</strong>: Request deletion of your personal information.</li>
              <li><strong>Portability</strong>: Request a copy of your data in a portable format.</li>
              <li><strong>Objection</strong>: Object to certain processing of your information.</li>
            </ul>
            <p>To exercise these rights, please contact us at <a href="mailto:akashkumarprasad984@gmail.com" className="text-blue-600 hover:text-blue-800">akashkumarprasad984@gmail.com</a>.</p>

            <h2>8. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy.
            </p>

            <h2>9. Children's Privacy</h2>
            <p>
              Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.
            </p>

            <h2>10. Third-Party Services</h2>
            <p>
              Our service integrates with Google OAuth for authentication. Please review Google's Privacy Policy to understand how they handle your information.
            </p>

            <h2>11. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Effective Date" at the top.
            </p>

            <h2>12. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy or our privacy practices, please contact us at:</p>
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

export default PrivacyPolicy; 