import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'HarvestAlert – Early Warning for Food Security Crises',
  description:
    'HarvestAlert helps humanitarian workers detect emerging food security crises weeks in advance using real-time climate data and predictive modelling.',
}

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gray-50">

      {/* Hero */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="text-5xl mb-6" aria-hidden="true">🌾</div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-4">
            Early Warning for<br className="hidden sm:block" /> Food Security Crises
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            HarvestAlert combines real-time climate data with predictive modelling
            to surface crop failure and malnutrition risk signals weeks before a
            crisis unfolds — giving humanitarian teams the time they need to act.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-8 py-3 rounded-md bg-blue-600 text-white text-base font-semibold hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm"
            >
              View the Dashboard →
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex items-center justify-center px-8 py-3 rounded-md border border-gray-300 text-gray-700 text-base font-semibold hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-semibold text-gray-900 text-center mb-10">
          Built for the people who respond first
        </h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            {
              icon: '🤝',
              title: 'Humanitarian Workers',
              desc: 'Get a fast, reliable overview of regional risk levels across multiple countries without digging through raw data.',
            },
            {
              icon: '📍',
              title: 'Field Coordinators',
              desc: 'Access up-to-date climate and nutrition risk data to plan logistics and allocate resources where they are needed most.',
            },
            {
              icon: '📊',
              title: 'Decision Makers',
              desc: 'Use evidence-based risk assessments to prioritise funding and interventions at NGOs, UN agencies, and government bodies.',
            },
          ].map(({ icon, title, desc }) => (
            <div
              key={title}
              className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm text-center"
            >
              <div className="text-3xl mb-3" aria-hidden="true">{icon}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What you'll see */}
      <section className="bg-white border-t border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-2xl font-semibold text-gray-900 text-center mb-10">
            What the dashboard shows
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                icon: '🗺️',
                title: 'Interactive Risk Map',
                desc: 'Colour-coded markers show low, medium, and high risk regions at a glance. Click any marker for details.',
              },
              {
                icon: '📈',
                title: 'Risk Trend Charts',
                desc: 'Seven-day trend lines reveal whether conditions are improving, stable, or deteriorating in each region.',
              },
              {
                icon: '⚠️',
                title: 'Risk Summary Cards',
                desc: 'A quick count of how many regions are at each risk level so you can prioritise at a glance.',
              },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex flex-col items-start gap-3">
                <div className="text-3xl" aria-hidden="true">{icon}</div>
                <h3 className="font-semibold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Ready to explore the data?
        </h2>
        <p className="text-gray-600 mb-8">
          The dashboard is live with real climate data across monitored regions.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center px-8 py-3 rounded-md bg-blue-600 text-white text-base font-semibold hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm"
        >
          Go to Dashboard →
        </Link>
      </section>

    </main>
  )
}
