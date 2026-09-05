import { LegalPage } from "@/components/legal/legalpage";

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Notice" lastUpdated="March 1, 2026" version="2.0">
      <h2>1. Introduction</h2>
      <p>
        Eagle Generation ("we", "our", "us") is committed to protecting your privacy. This Privacy
        Notice explains how we collect, use, disclose, and safeguard your personal information when
        you use our platform.
      </p>

      <h2>2. Information We Collect</h2>
      <p>We may collect the following types of information:</p>
      <ul>
        <li>
          <strong>Personal identification information:</strong> Name, email address, phone number,
          date of birth, and other identifiers.
        </li>
        <li>
          <strong>Account credentials:</strong> Username, password, and authentication data.
        </li>
        <li>
          <strong>Profile information:</strong> Bio, photo, interests, and chapter affiliation.
        </li>
        <li>
          <strong>Usage data:</strong> How you interact with the platform, pages visited, and
          features used.
        </li>
        <li>
          <strong>Financial data:</strong> Payment details, transaction history, and wallet
          information (processed through secure third-party gateways).
        </li>
        <li>
          <strong>Device data:</strong> IP address, browser type, operating system, and device
          identifiers.
        </li>
      </ul>

      <h2>3. How We Use Your Information</h2>
      <p>We use your information to:</p>
      <ul>
        <li>Provide, maintain, and improve our services</li>
        <li>Process your membership and transactions</li>
        <li>Communicate with you about updates, events, and opportunities</li>
        <li>Ensure security and prevent fraud</li>
        <li>Comply with legal obligations</li>
        <li>Personalize your experience</li>
      </ul>

      <h2>4. Legal Basis for Processing</h2>
      <p>
        We process your personal data based on your consent, contractual necessity, legal obligations,
        and our legitimate interests in operating and improving the platform.
      </p>

      <h2>5. Data Sharing</h2>
      <p>
        We do not sell your personal information. We may share your data with:
      </p>
      <ul>
        <li>Service providers who assist us in operating the platform (e.g., hosting, payments)</li>
        <li>Other members as part of community features (e.g., directory, groups)</li>
        <li>Law enforcement or regulators when required by law</li>
      </ul>

      <h2>6. Data Security</h2>
      <p>
        We implement appropriate technical and organisational measures to protect your data from
        unauthorised access, alteration, or destruction. However, no method of transmission over the
        internet is 100% secure.
      </p>

      <h2>7. Your Data Protection Rights</h2>
      <p>You have the right to:</p>
      <ul>
        <li>Access, correct, or delete your personal data</li>
        <li>Withdraw consent at any time</li>
        <li>Object to processing of your data</li>
        <li>Data portability</li>
        <li>Lodge a complaint with a supervisory authority</li>
      </ul>

      <h2>8. Retention</h2>
      <p>
        We retain your personal data only as long as necessary to fulfil the purposes outlined in this
        policy or as required by law. When no longer needed, we securely delete or anonymise it.
      </p>

      <h2>9. International Transfers</h2>
      <p>
        Your data may be transferred to and processed in countries outside your jurisdiction. We ensure
        that appropriate safeguards are in place to protect your data.
      </p>

      <h2>10. Children's Privacy</h2>
      <p>
        Our services are not intended for individuals under the age of 18. We do not knowingly collect
        personal data from minors.
      </p>

      <h2>11. Changes to This Policy</h2>
      <p>
        We may update this Privacy Notice from time to time. We will notify you of significant changes
        via email or platform announcement.
      </p>

      <h2>12. Contact Us</h2>
      <p>
        If you have any questions or concerns about this Privacy Notice, please contact our Data
        Protection Officer at{' '}
        <a href="mailto:dpo@eaglegeneration.org">dpo@eaglegeneration.org</a>.
      </p>
    </LegalPage>
  );
}