import { useTranslation } from '../i18n/useTranslation';

export default function Terms() {
  const { t } = useTranslation();

  return (
    <div className="container-main py-12">
      <h1 className="text-4xl font-bold mb-8">{t('terms.title')}</h1>

      <div className="space-y-6 text-gray-700 dark:text-gray-300">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. {t('terms.section1')}</h2>
          <p className="mb-4">{t('terms.section1Text')}</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. {t('terms.section2')}</h2>
          <p className="mb-4">{t('terms.section2Text')}</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>{t('terms.section2a')}</li>
            <li>{t('terms.section2b')}</li>
            <li>{t('terms.section2c')}</li>
            <li>{t('terms.section2d')}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. {t('terms.section3')}</h2>
          <p className="mb-4">{t('terms.section3Text')}</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. {t('terms.section4')}</h2>
          <p className="mb-4">{t('terms.section4Text')}</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. {t('terms.section5')}</h2>
          <p className="mb-4">{t('terms.section5Text')}</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">6. {t('terms.section6')}</h2>
          <p className="mb-4">{t('terms.section6Text')}</p>
        </section>
      </div>
    </div>
  );
}
