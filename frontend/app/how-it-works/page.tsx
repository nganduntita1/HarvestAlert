import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'How It Works – HarvestAlert',
  description:
    'Understand how HarvestAlert predicts crop failure and malnutrition risk using climate data and machine learning.',
}

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Page heading */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">How It Works</h1>
        <p className="text-gray-500 mb-10 text-sm">
          From raw climate data to actionable risk assessments
        </p>

        {/* Overview */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Overview</h2>
          <p className="text-gray-700 leading-relaxed">
            HarvestAlert turns raw climate measurements into easy-to-read risk
            levels. The process runs continuously in the background — you always
            see the most current picture without needing to understand the
            underlying calculations.
          </p>
        </section>

        {/* Steps */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-5">The Process</h2>
          <ol className="space-y-6">
            {[
              {
                step: '1',
                title: 'Data Collection',
                body: 'Climate sensors and satellite feeds provide temperature, rainfall, and soil-moisture readings for each monitored region. Data is collected daily and stored for trend analysis.',
              },
              {
                step: '2',
                title: 'Drought Index Calculation',
                body: 'A drought index is computed from temperature and rainfall relative to long-term seasonal averages. A higher index means conditions are drier and hotter than normal — a key early indicator of crop stress.',
              },
              {
                step: '3',
                title: 'Risk Prediction',
                body: 'The prediction model combines the drought index with historical patterns to estimate the likelihood of crop failure and elevated malnutrition. It outputs two independent scores: crop risk and nutrition risk.',
              },
              {
                step: '4',
                title: 'Risk Classification',
                body: 'Each score is mapped to a three-level classification — Low, Medium, or High — based on thresholds validated against past crisis events. These levels are what you see on the map and in the summary cards.',
              },
            ].map(({ step, title, body }) => (
              <li key={step} className="flex gap-4">
                <div
                  className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm"
                  aria-hidden="true"
                >
                  {step}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                  <p className="text-gray-700 leading-relaxed">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Risk levels explained */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Understanding Risk Levels</h2>
          <div className="space-y-3">
            {[
              {
                color: 'bg-green-500',
                label: 'Low Risk',
                desc: 'Conditions are within normal seasonal ranges. No immediate action required, but routine monitoring continues.',
              },
              {
                color: 'bg-yellow-400',
                label: 'Medium Risk',
                desc: 'Conditions are deteriorating. Early preparedness actions — such as pre-positioning supplies — are recommended.',
              },
              {
                color: 'bg-red-500',
                label: 'High Risk',
                desc: 'Conditions indicate a high probability of crop failure or acute malnutrition. Immediate intervention planning is advised.',
              },
            ].map(({ color, label, desc }) => (
              <div
                key={label}
                className="flex items-start gap-4 bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
              >
                <span
                  className={`flex-shrink-0 mt-0.5 w-4 h-4 rounded-full ${color}`}
                  aria-hidden="true"
                />
                <div>
                  <span className="font-semibold text-gray-900">{label}: </span>
                  <span className="text-gray-700">{desc}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Trend data */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Reading the Trend Chart</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            The trend chart shows how climate conditions in a region have changed
            over the past seven days. Each line represents a different climate
            variable (temperature, rainfall, drought index).
          </p>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1" aria-hidden="true">→</span>
              A rising drought index line is an early warning sign — even before
              the risk level changes.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1" aria-hidden="true">→</span>
              Falling rainfall combined with rising temperature is the most
              common precursor to a high-risk classification.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1" aria-hidden="true">→</span>
              Stable or improving trends in a high-risk region may indicate that
              conditions are beginning to recover.
            </li>
          </ul>
        </section>

        {/* Data sources */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Data Sources</h2>
          <p className="text-gray-700 leading-relaxed">
            HarvestAlert currently uses climate station data and satellite-derived
            estimates for temperature, precipitation, and soil moisture. Historical
            baselines are drawn from multi-decade climate records for each region.
            As the platform matures, additional data sources — including crop
            yield surveys and market price indices — will be integrated.
          </p>
        </section>

        {/* Limitations */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Limitations</h2>
          <p className="text-gray-700 leading-relaxed">
            Risk predictions are probabilistic, not certain. Local factors such as
            conflict, market disruptions, or sudden weather events can affect
            outcomes in ways the model cannot fully anticipate. HarvestAlert is
            designed to support — not replace — the judgement of experienced
            humanitarian professionals.
          </p>
        </section>

        {/* CTA */}
        <div className="border-t border-gray-200 pt-8 flex flex-col sm:flex-row gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            View the Dashboard →
          </Link>
          <Link
            href="/about"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-md border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            About HarvestAlert
          </Link>
        </div>

      </div>
    </main>
  )
}
