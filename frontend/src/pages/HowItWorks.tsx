import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n/useTranslation';

const StepCard = ({ num, title, desc }: { num: number; title: string; desc: string }) => (
  <div className="card flex gap-4">
    <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold shrink-0">
      {num}
    </div>
    <div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{desc}</p>
    </div>
  </div>
);

export default function HowItWorks() {
  const { t } = useTranslation();

  return (
    <div className="container-main py-12 lg:py-16">
      <h1 className="text-4xl font-bold mb-4">{t('howItWorks.title')}</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-12 max-w-2xl">
        ServicePulse connects citizens with REG, WASAC, and Emergency Services. Here's how to get started.
      </p>

      <div className="space-y-14">
        <section>
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-sm font-bold text-primary-600 dark:text-primary-400">C</span>
            {t('howItWorks.forCitizens')}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <StepCard num={1} title={t('howItWorks.step1Title')} desc={t('howItWorks.step1Desc')} />
            <StepCard num={2} title={t('howItWorks.step2Title')} desc={t('howItWorks.step2Desc')} />
            <StepCard num={3} title={t('howItWorks.step3Title')} desc={t('howItWorks.step3Desc')} />
            <StepCard num={4} title={t('howItWorks.step4Title')} desc={t('howItWorks.step4Desc')} />
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-sm font-bold text-amber-600 dark:text-amber-400">A</span>
            {t('howItWorks.forAgencies')}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <StepCard num={1} title={t('howItWorks.agencyStep1Title')} desc={t('howItWorks.agencyStep1Desc')} />
            <StepCard num={2} title={t('howItWorks.agencyStep2Title')} desc={t('howItWorks.agencyStep2Desc')} />
            <StepCard num={3} title={t('howItWorks.agencyStep3Title')} desc={t('howItWorks.agencyStep3Desc')} />
            <StepCard num={4} title={t('howItWorks.agencyStep4Title')} desc={t('howItWorks.agencyStep4Desc')} />
          </div>
        </section>

        <div className="card bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800 text-center py-8">
          <p className="text-gray-700 dark:text-gray-300 mb-4">In case of emergency, save these numbers:</p>
          <Link to="/" className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 font-semibold hover:underline">
            View Emergency Hotlines
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
