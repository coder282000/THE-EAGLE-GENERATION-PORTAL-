import { LegalPage } from "@/components/legal/legalpage";

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" lastUpdated="March 1, 2026" version="1.0">
      <h2>1. Acceptance of Terms</h2>
      <p>
        By accessing or using the Eagle Generation Portal, you agree to be bound by these Terms of Service
        and all applicable laws and regulations. If you do not agree with any part of these terms, you may
        not use our services.
      </p>

      <h2>2. Membership</h2>
      <p>
        Membership is open to individuals who meet the eligibility criteria. You are responsible for
        maintaining the confidentiality of your account credentials and for all activities that occur
        under your account. You agree to provide accurate and complete information during registration
        and to update it promptly when changes occur.
      </p>

      <h2>3. Community Guidelines</h2>
      <p>
        All members are expected to adhere to our Community Guidelines. Harassment, hate speech, spam,
        and any illegal activities are strictly prohibited. We reserve the right to suspend or terminate
        accounts that violate these guidelines.
      </p>

      <h2>4. Intellectual Property</h2>
      <p>
        All content, trademarks, logos, and intellectual property on the platform are owned by Eagle
        Generation or its licensors. You may not reproduce, distribute, or create derivative works
        without prior written permission.
      </p>

      <h2>5. Payments and Fees</h2>
      <p>
        Certain services may require payment of fees. All fees are non-refundable unless otherwise
        stated. We reserve the right to change fees with prior notice. You are responsible for all
        taxes applicable to your transactions.
      </p>

      <h2>6. Limitation of Liability</h2>
      <p>
        Eagle Generation provides the platform "as is" and does not warrant that the service will be
        uninterrupted or error-free. To the fullest extent permitted by law, we disclaim all liability
        for any damages arising from your use of the platform.
      </p>

      <h2>7. Termination</h2>
      <p>
        We may suspend or terminate your account at our discretion, with or without cause, and with or
        without notice. Upon termination, your access to the platform will cease, and any outstanding
        obligations shall survive.
      </p>

      <h2>8. Governing Law</h2>
      <p>
        These terms are governed by the laws of Kenya. Any disputes shall be resolved exclusively in
        the courts of Nairobi.
      </p>

      <h2>9. Changes to Terms</h2>
      <p>
        We may update these Terms of Service from time to time. We will notify you of any material
        changes by posting the new terms on this page. Your continued use of the platform constitutes
        acceptance of the updated terms.
      </p>

      <h2>10. Contact</h2>
      <p>
        If you have any questions about these terms, please contact us at{' '}
        <a href="mailto:legal@eaglegeneration.org">legal@eaglegeneration.org</a>.
      </p>
    </LegalPage>
  );
}