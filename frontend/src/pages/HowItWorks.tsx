import { useTranslation } from '../i18n/useTranslation';

export default function HowItWorks() {
  const { t } = useTranslation();

  return (
    <div className="container-main py-12">
      <h1 className="text-4xl font-bold mb-8">{t('howItWorks.title')}</h1>

      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-semibold mb-6">{t('howItWorks.forCitizens')}</h2>
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold mb-2">1. {t('howItWorks.step1Title')}</h3>
              <p className="text-gray-600 dark:text-gray-400">{t('howItWorks.step1Desc')}</p>
            </div>
            <div className="card">
              <h3 className="text-lg font-semibold mb-2">2. {t('howItWorks.step2Title')}</h3>
              <p className="text-gray-600 dark:text-gray-400">{t('howItWorks.step2Desc')}</p>
            </div>
            <div className="card">
              <h3 className="text-lg font-semibold mb-2">3. {t('howItWorks.step3Title')}</h3>
              <p className="text-gray-600 dark:text-gray-400">{t('howItWorks.step3Desc')}</p>
            </div>
            <div className="card">
              <h3 className="text-lg font-semibold mb-2">4. {t('howItWorks.step4Title')}</h3>
              <p className="text-gray-600 dark:text-gray-400">{t('howItWorks.step4Desc')}</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-6">{t('howItWorks.forAgencies')}</h2>
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold mb-2">1. {t('howItWorks.agencyStep1Title')}</h3>
              <p className="text-gray-600 dark:text-gray-400">{t('howItWorks.agencyStep1Desc')}</p>
            </div>
            <div className="card">
              <h3 className="text-lg font-semibold mb-2">2. {t('howItWorks.agencyStep2Title')}</h3>
              <p className="text-gray-600 dark:text-gray-400">{t('howItWorks.agencyStep2Desc')}</p>
            </div>
            <div className="card">
              <h3 className="text-lg font-semibold mb-2">3. {t('howItWorks.agencyStep3Title')}</h3>
              <p className="text-gray-600 dark:text-gray-400">{t('howItWorks.agencyStep3Desc')}</p>
            </div>
            <div className="card">
              <h3 className="text-lg font-semibold mb-2">4. {t('howItWorks.agencyStep4Title')}</h3>
              <p className="text-gray-600 dark:text-gray-400">{t('howItWorks.agencyStep4Desc')}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
