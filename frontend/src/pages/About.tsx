import { useTranslation } from '../i18n/useTranslation';

export default function About() {
  const { t } = useTranslation();

  return (
    <div className="container-main py-12">
      <h1 className="text-4xl font-bold mb-8">{t('about.title')}</h1>

      <div className="space-y-6 text-gray-700 dark:text-gray-300">
        <section>
          <h2 className="text-2xl font-semibold mb-4">{t('about.mission')}</h2>
          <p className="mb-4">{t('about.missionText')}</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t('about.challenge')}</h2>
          <p className="mb-4">{t('about.challengeText')}</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t('about.solution')}</h2>
          <p className="mb-4">{t('about.solutionText')}</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>{t('about.solution1')}</li>
            <li>{t('about.solution2')}</li>
            <li>{t('about.solution3')}</li>
            <li>{t('about.solution4')}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t('about.vision')}</h2>
          <p className="mb-4">{t('about.visionText')}</p>
        </section>
      </div>
    </div>
  );
}
