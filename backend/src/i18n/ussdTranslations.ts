/**
 * USSD Translations
 * Translations for USSD messages in Kinyarwanda, English, and French
 */

export type UssdLanguage = 'rw' | 'en' | 'fr';

export interface UssdTranslations {
  languageSelection: string;
  selectLanguage: string;
  invalidOption: string;
  mainMenu: string;
  signUp: string;
  signIn: string;
  exit: string;
  select: string;
  thankYou: string;
  enterName: string;
  nameTooShort: string;
  selectProvince: string;
  selectDistrict: string;
  selectSector: string;
  enterDistrict: string;
  enterSector: string;
  selectServices: string;
  reg: string;
  wasac: string;
  emergency: string;
  all: string;
  choice: string;
  invalid: string;
  accountCreated: string;
  welcome: string;
  youWillReceiveAlerts: string;
  signingIn: string;
  welcomeBack: string;
  signedIn: string;
  error: string;
  accountNotFound: string;
  registrationFailed: string;
  signInFailed: string;
  sessionExpired: string;
}

const translations: Record<UssdLanguage, UssdTranslations> = {
  rw: {
    languageSelection: 'Hitamo ururimi:\n1. Ikinyarwanda\n2. Icyongereza\n3. Igifaransa\n\nHitamo:',
    selectLanguage: 'Hitamo ururimi:',
    invalidOption: 'Hitamo 1, 2, cyangwa 3:',
    mainMenu: 'ServicePulse\n1. Iyandikishe\n2. Injira\n0. Sohoka\n\nHitamo:',
    signUp: 'Iyandikishe',
    signIn: 'Injira',
    exit: 'Sohoka',
    select: 'Hitamo:',
    thankYou: 'Murakoze!',
    enterName: 'Andika izina ryawe:',
    nameTooShort: 'Izina rirenga gato.\nAndika izina ryawe:',
    selectProvince: 'Hitamo intara:\n1. Kigali\n2. Amajyaruguru\n3. Amajyepfo\n4. Iburasirazuba\n5. Iburengerazuba\n\nHitamo:',
    selectDistrict: 'Hitamo akarere:',
    selectSector: 'Hitamo umurenge:',
    enterDistrict: 'Andika akarere:',
    enterSector: 'Andika umurenge:',
    selectServices: 'Hitamo serivisi:\n1. REG\n2. WASAC\n3. Zihutirwa\n0. Zose\n\nHitamo:',
    reg: 'REG',
    wasac: 'WASAC',
    emergency: 'Zihutirwa',
    all: 'Zose',
    choice: 'Hitamo:',
    invalid: 'Sibyo. Andika 1, 2, 3, cyangwa 0:',
    accountCreated: 'Konti yashyizweho.\nUzahabwa amatangazo.',
    welcome: 'Murakaza neza',
    youWillReceiveAlerts: 'Uzahabwa amatangazo.',
    signingIn: 'Injira',
    welcomeBack: 'Murakaza neza',
    signedIn: 'Winjiriye.',
    error: 'Ikosa:',
    accountNotFound: 'Konti ntiyabonetse. Mbere iyandikishe.',
    registrationFailed: 'Gushyiraho konti byanze.',
    signInFailed: 'Kwinjira byanze.',
    sessionExpired: 'Igihe cyahagaze. Ongera utangire.',
  },
  en: {
    languageSelection: 'Select language:\n1. Kinyarwanda\n2. English\n3. French\n\nSelect:',
    selectLanguage: 'Select language:',
    invalidOption: 'Select 1, 2, or 3:',
    mainMenu: 'ServicePulse\n1. Sign Up\n2. Sign In\n0. Exit\n\nSelect:',
    signUp: 'Sign Up',
    signIn: 'Sign In',
    exit: 'Exit',
    select: 'Select:',
    thankYou: 'Thank you!',
    enterName: 'Enter your name:',
    nameTooShort: 'Name too short.\nEnter your name:',
    selectProvince: 'Select province:\n1. Kigali\n2. Northern\n3. Southern\n4. Eastern\n5. Western\n\nSelect:',
    selectDistrict: 'Select district:',
    selectSector: 'Select sector:',
    enterDistrict: 'Enter district:',
    enterSector: 'Enter sector:',
    selectServices: 'Select services:\n1. REG\n2. WASAC\n3. Emergency\n0. All\n\nChoice:',
    reg: 'REG',
    wasac: 'WASAC',
    emergency: 'Emergency',
    all: 'All',
    choice: 'Choice:',
    invalid: 'Invalid. Enter 1, 2, 3, or 0:',
    accountCreated: 'Account created.\nYou will receive alerts.',
    welcome: 'Welcome',
    youWillReceiveAlerts: 'You will receive alerts.',
    signingIn: 'Signing in...',
    welcomeBack: 'Welcome back',
    signedIn: 'Signed in.',
    error: 'Error:',
    accountNotFound: 'Account not found. Please sign up first.',
    registrationFailed: 'Registration failed.',
    signInFailed: 'Sign-in failed.',
    sessionExpired: 'Session expired. Please start again.',
  },
  fr: {
    languageSelection: 'Choisissez la langue:\n1. Kinyarwanda\n2. Anglais\n3. Français\n\nChoisissez:',
    selectLanguage: 'Choisissez la langue:',
    invalidOption: 'Choisissez 1, 2 ou 3:',
    mainMenu: 'ServicePulse\n1. S\'inscrire\n2. Se connecter\n0. Quitter\n\nChoisissez:',
    signUp: 'S\'inscrire',
    signIn: 'Se connecter',
    exit: 'Quitter',
    select: 'Choisissez:',
    thankYou: 'Merci!',
    enterName: 'Entrez votre nom:',
    nameTooShort: 'Nom trop court.\nEntrez votre nom:',
    selectProvince: 'Choisissez la province:\n1. Kigali\n2. Nord\n3. Sud\n4. Est\n5. Ouest\n\nChoisissez:',
    selectDistrict: 'Choisissez le district:',
    selectSector: 'Choisissez le secteur:',
    enterDistrict: 'Entrez le district:',
    enterSector: 'Entrez le secteur:',
    selectServices: 'Choisissez les services:\n1. REG\n2. WASAC\n3. Urgence\n0. Tous\n\nChoix:',
    reg: 'REG',
    wasac: 'WASAC',
    emergency: 'Urgence',
    all: 'Tous',
    choice: 'Choix:',
    invalid: 'Invalide. Entrez 1, 2, 3 ou 0:',
    accountCreated: 'Compte créé.\nVous recevrez des alertes.',
    welcome: 'Bienvenue',
    youWillReceiveAlerts: 'Vous recevrez des alertes.',
    signingIn: 'Connexion...',
    welcomeBack: 'Bon retour',
    signedIn: 'Connecté.',
    error: 'Erreur:',
    accountNotFound: 'Compte introuvable. Veuillez vous inscrire d\'abord.',
    registrationFailed: 'Inscription échouée.',
    signInFailed: 'Connexion échouée.',
    sessionExpired: 'Session expirée. Veuillez recommencer.',
  },
};

export function getUssdTranslation(language: UssdLanguage): UssdTranslations {
  return translations[language] || translations.en;
}

export function getUssdLanguageFromCode(code: string): UssdLanguage {
  switch (code) {
    case '1':
      return 'rw';
    case '2':
      return 'en';
    case '3':
      return 'fr';
    default:
      return 'en';
  }
}
