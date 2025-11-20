export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F7EFD2] flex items-start justify-center p-6">
      <div className="max-w-3xl bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-4" style={{ color: '#23408e' }}>Terms & Conditions</h1>
        <p className="text-sm text-[#464444] mb-4">
          Please read these Terms & Conditions carefully before using the HealthCare AI web application.
        </p>
        <div className="prose prose-sm text-[#464444]">
          <h3>1. Acceptance</h3>
          <p>
            By using this application you agree to these terms. This tool provides educational and informational
            content only and is not a substitute for professional medical advice, diagnosis, or treatment.
          </p>

          <h3>2. Privacy & Data</h3>
          <p>
            Any information you provide may be stored locally in your browser (for chat persistence) and processed
            to generate analysis. Do not upload or submit Protected Health Information (PHI) unless you understand
            and accept the privacy implications.
          </p>

          <h3>3. No Medical Advice</h3>
          <p>
            The outputs are informational and should not be relied upon for clinical decisions. Always consult a
            licensed healthcare professional for diagnosis or treatment.
          </p>

          <h3>4. Liability</h3>
          <p>
            The project creators and maintainers are not liable for any decisions made based on information
            from this application.
          </p>

          <h3>5. Changes</h3>
          <p>
            We may update these terms from time to time. Continued use of the app indicates acceptance of updates.
          </p>
        </div>

        <div className="mt-6 text-right">
          <a href="/login" className="text-[#23408e] font-semibold">Back to Login</a>
        </div>
      </div>
    </div>
  );
}
