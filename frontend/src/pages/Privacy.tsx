import { useTranslation } from '../i18n/useTranslation';

export default function Privacy() {
  const { t } = useTranslation();

  return (
    <div className="container-main py-12">
      <h1 className="text-4xl font-bold mb-8">{t('privacy.title')}</h1>

      <div className="space-y-6 text-gray-700 dark:text-gray-300">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. {t('privacy.section1')}</h2>
          <p className="mb-4">{t('privacy.section1Text')}</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>{t('privacy.section1a')}</li>
            <li>{t('privacy.section1b')}</li>
            <li>{t('privacy.section1c')}</li>
            <li>{t('privacy.section1d')}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. {t('privacy.section2')}</h2>
          <p className="mb-4">{t('privacy.section2Text')}</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>{t('privacy.section2a')}</li>
            <li>{t('privacy.section2b')}</li>
            <li>{t('privacy.section2c')}</li>
            <li>{t('privacy.section2d')}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. {t('privacy.section3')}</h2>
          <p className="mb-4">{t('privacy.section3Text')}</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. {t('privacy.section4')}</h2>
          <p className="mb-4">{t('privacy.section4Text')}</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. {t('privacy.section5')}</h2>
          <p className="mb-4">{t('privacy.section5Text')}</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">6. {t('privacy.section6')}</h2>
          <p className="mb-4">{t('privacy.section6Text')}</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>{t('privacy.section6a')}</li>
            <li>{t('privacy.section6b')}</li>
            <li>{t('privacy.section6c')}</li>
            <li>{t('privacy.section6d')}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">7. {t('privacy.section7')}</h2>
          <p className="mb-4">{t('privacy.section7Text')}</p>
        </section>
      </div>
    </div>
  );
}
