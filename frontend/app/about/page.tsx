import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About – HarvestAlert',
  description:
    'Learn about the HarvestAlert platform, its mission, target users, and the data it uses to predict food security crises.',
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Page heading */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">About HarvestAlert</h1>
        <p className="text-gray-500 mb-10 text-sm">
          Early warning for food security crises
        </p>

        {/* Mission */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Our Mission</h2>
          <p className="text-gray-700 leading-relaxed">
            HarvestAlert is an early-warning platform designed to help humanitarian
            organisations detect emerging food security crises before they become
            catastrophic. By combining real-time climate data with predictive
            modelling, the platform surfaces risk signals weeks in advance — giving
            field teams and decision-makers the time they need to act.
          </p>
        </section>

        {/* Who it's for */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Who It&apos;s For</h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3">
              <span className="mt-1 text-blue-500" aria-hidden="true">●</span>
              <span>
                <strong>Humanitarian workers</strong> who need a fast, reliable
                overview of regional risk levels across multiple countries.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 text-blue-500" aria-hidden="true">●</span>
              <span>
                <strong>Field coordinators</strong> who require up-to-date climate
                and nutrition risk data to plan logistics and resource allocation.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 text-blue-500" aria-hidden="true">●</span>
              <span>
                <strong>Decision makers</strong> at NGOs, UN agencies, and
                government bodies who need evidence-based insights to prioritise
                funding and interventions.
              </span>
            </li>
          </ul>
        </section>

        {/* Data */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Data We Use</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            The platform ingests and analyses several types of data to generate
            risk assessments:
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                icon: '🌡️',
                title: 'Temperature',
                desc: 'Current and historical surface temperature readings by region.',
              },
              {
                icon: '🌧️',
                title: 'Rainfall',
                desc: 'Precipitation levels compared against seasonal baselines.',
              },
              {
                icon: '🏜️',
                title: 'Drought Index',
                desc: 'A composite score reflecting soil moisture deficit and water stress.',
              },
            ].map(({ icon, title, desc }) => (
              <div
                key={title}
                className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
              >
                <div className="text-2xl mb-2" aria-hidden="true">{icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                <p className="text-sm text-gray-600">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Development context */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Development Context</h2>
          <p className="text-gray-700 leading-relaxed">
            HarvestAlert is currently an MVP (Minimum Viable Product) built for
            humanitarian organisations operating in food-insecure regions. The
            platform is under active development, with new data sources, improved
            models, and additional regions being added regularly. Feedback from
            field users directly shapes the product roadmap.
          </p>
        </section>

        {/* Contact */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Get in Touch</h2>
          <p className="text-gray-700 leading-relaxed">
            Have questions, feedback, or want to report an issue? We&apos;d love to
            hear from you.
          </p>
          <a
            href="mailto:support@harvestalert.org"
            className="inline-block mt-3 text-blue-600 hover:text-blue-700 font-medium underline underline-offset-2 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          >
            support@harvestalert.org
          </a>
        </section>

        {/* CTA */}
        <div className="border-t border-gray-200 pt-8 flex flex-col sm:flex-row gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Go to Dashboard →
          </Link>
          <Link
            href="/how-it-works"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-md border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            How It Works →
          </Link>
        </div>

      </div>
    </main>
  )
}
