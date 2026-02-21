import UssdSession, { UssdSessionState } from '../models/UssdSession';
import { registerUserUssd, signInUssd } from './authService';
import { getUssdTranslation, getUssdLanguageFromCode, UssdLanguage } from '../i18n/ussdTranslations';
import { RWANDA_LOCATIONS, getDistrictsForProvince, getSectorsForDistrict, getLocationName } from '../config/rwandaLocations';
import crypto from 'crypto';

export interface UssdRequest {
  phoneNumber: string;
  sessionId: string;
  text: string; // User input (menu selection or data)
  serviceCode: string; // USSD code (e.g., *123#)
}

export interface UssdResponse {
  message: string;
  shouldEnd: boolean; // true = END, false = CON
}

const USSD_TIMEOUT_MINUTES = 5;

function normalizePhoneForUssd(phone: string): string {
  // Remove USSD code characters if present
  let p = phone.replace(/[*#]/g, '').replace(/\D/g, '');
  if (p.startsWith('250')) return `+${p}`;
  if (p.startsWith('0')) return '+250' + p.slice(1);
  return '+250' + p;
}

function formatUssdMessage(text: string): string {
  // USSD messages should be concise and clear
  return text.trim();
}

function createExpiryDate(): Date {
  return new Date(Date.now() + USSD_TIMEOUT_MINUTES * 60 * 1000);
}

async function getOrCreateSession(phoneNumber: string, sessionId: string): Promise<any> {
  const normalizedPhone = normalizePhoneForUssd(phoneNumber);
  let session = await UssdSession.findOne({ session_id: sessionId }).lean();

  if (!session) {
    session = await UssdSession.create({
      phone_number: normalizedPhone,
      session_id: sessionId,
      state: 'LANGUAGE_SELECTION',
      data: { language: 'en' }, // Default to English
      expires_at: createExpiryDate(),
    });
  } else {
    // Update expiry on activity
    await UssdSession.updateOne(
      { session_id: sessionId },
      { $set: { expires_at: createExpiryDate() } }
    );
  }

  return session;
}

async function updateSession(sessionId: string, updates: Partial<{ state: UssdSessionState; data: any }>): Promise<void> {
  await UssdSession.updateOne(
    { session_id: sessionId },
    {
      $set: {
        ...updates,
        expires_at: createExpiryDate(),
      },
    }
  );
}

export async function handleUssdRequest(req: UssdRequest): Promise<UssdResponse> {
  const { phoneNumber, sessionId, text } = req;
  const normalizedPhone = normalizePhoneForUssd(phoneNumber);

  // Get or create session
  const session = await getOrCreateSession(phoneNumber, sessionId);
  const currentState = session.state as UssdSessionState;
  const sessionData = session.data || {};

  // Get language from session
  const language = (sessionData.language as UssdLanguage) || 'en';
  const t = getUssdTranslation(language);

  // Handle empty input (initial menu)
  if (!text || text.trim() === '') {
    if (currentState === 'LANGUAGE_SELECTION') {
      return showLanguageSelection(sessionId);
    }
    return showMainMenu(sessionId, language);
  }

  // Parse user input
  const input = text.trim();
  const parts = input.split('*');
  const lastInput = parts[parts.length - 1];

  // Route based on current state
  switch (currentState) {
    case 'LANGUAGE_SELECTION':
      return await handleLanguageSelection(sessionId, lastInput);

    case 'MENU':
      return await handleMenuSelection(sessionId, lastInput, normalizedPhone, language);

    case 'SIGNUP_NAME':
      return await handleSignupName(sessionId, lastInput, language);

    case 'SIGNUP_LOCATION_PROVINCE':
      return await handleSignupProvince(sessionId, lastInput, language);

    case 'SIGNUP_LOCATION_DISTRICT':
      return await handleSignupDistrict(sessionId, lastInput, language);

    case 'SIGNUP_LOCATION_SECTOR':
      return await handleSignupSector(sessionId, lastInput, language);

    case 'SIGNUP_SERVICE_PREFS':
      return await handleSignupServicePrefs(sessionId, lastInput, normalizedPhone, language);

    case 'SIGNIN_START':
      return await handleSigninStart(sessionId, lastInput, normalizedPhone, language);

    default:
      return {
        message: formatUssdMessage(t.sessionExpired),
        shouldEnd: true,
      };
  }
}

function showLanguageSelection(sessionId: string): UssdResponse {
  const t = getUssdTranslation('en'); // Use English for language selection
  return {
    message: formatUssdMessage(t.languageSelection),
    shouldEnd: false,
  };
}

async function handleLanguageSelection(sessionId: string, input: string): Promise<UssdResponse> {
  const language = getUssdLanguageFromCode(input);
  const t = getUssdTranslation(language);

  if (!['1', '2', '3'].includes(input)) {
    return {
      message: formatUssdMessage(t.invalidOption),
      shouldEnd: false,
    };
  }

  await updateSession(sessionId, {
    state: 'MENU',
    data: { language },
  });

  return {
    message: formatUssdMessage(t.mainMenu),
    shouldEnd: false,
  };
}

function showMainMenu(sessionId: string, language: UssdLanguage): UssdResponse {
  updateSession(sessionId, { state: 'MENU' });
  const t = getUssdTranslation(language);
  return {
    message: formatUssdMessage(t.mainMenu),
    shouldEnd: false,
  };
}

async function handleMenuSelection(sessionId: string, input: string, phoneNumber: string, language: UssdLanguage): Promise<UssdResponse> {
  const session = await UssdSession.findOne({ session_id: sessionId }).lean();
  const lang = (session?.data?.language as UssdLanguage) || language;
  const t = getUssdTranslation(lang);

  switch (input) {
    case '1':
      await updateSession(sessionId, { state: 'SIGNUP_NAME' });
      return {
        message: formatUssdMessage(`${t.signUp}\n\n${t.enterName}`),
        shouldEnd: false,
      };

    case '2':
      await updateSession(sessionId, { state: 'SIGNIN_START' });
      return {
        message: formatUssdMessage(`${t.signIn}\n\n${t.signingIn}`),
        shouldEnd: false,
      };

    case '0':
      return {
        message: formatUssdMessage(t.thankYou),
        shouldEnd: true,
      };

    default:
      return {
        message: formatUssdMessage(`${t.invalid} ${t.select}`),
        shouldEnd: false,
      };
  }
}

async function handleSignupName(sessionId: string, input: string, language: UssdLanguage): Promise<UssdResponse> {
  const session = await UssdSession.findOne({ session_id: sessionId }).lean();
  const lang = (session?.data?.language as UssdLanguage) || language;
  const t = getUssdTranslation(lang);

  if (!input || input.length < 2) {
    return {
      message: formatUssdMessage(`${t.nameTooShort}`),
      shouldEnd: false,
    };
  }

  await updateSession(sessionId, {
    state: 'SIGNUP_LOCATION_PROVINCE',
    data: { ...session?.data, name: input.trim() },
  });

  return {
    message: formatUssdMessage(t.selectProvince),
    shouldEnd: false,
  };
}

function formatMenu(items: string[], startIndex: number = 1): string {
  return items.map((item, idx) => `${startIndex + idx}. ${item}`).join('\n');
}

async function handleSignupProvince(sessionId: string, input: string, language: UssdLanguage): Promise<UssdResponse> {
  const session = await UssdSession.findOne({ session_id: sessionId }).lean();
  const lang = (session?.data?.language as UssdLanguage) || language;
  const t = getUssdTranslation(lang);

  const provinceIndex = parseInt(input) - 1;
  if (isNaN(provinceIndex) || provinceIndex < 0 || provinceIndex >= RWANDA_LOCATIONS.provinces.length) {
    return {
      message: formatUssdMessage(`${t.invalid}\n${t.selectProvince}`),
      shouldEnd: false,
    };
  }

  const province = RWANDA_LOCATIONS.provinces[provinceIndex];
  const provinceName = lang === 'rw' ? province.nameRw : lang === 'fr' ? province.nameFr : province.name;
  const districts = getDistrictsForProvince(provinceIndex, lang);

  await updateSession(sessionId, {
    state: 'SIGNUP_LOCATION_DISTRICT',
    data: {
      ...session?.data,
      province_index: provinceIndex,
      province: provinceName,
    },
  });

  const menu = formatMenu(districts);
  return {
    message: formatUssdMessage(`${t.selectDistrict}\n${menu}\n\n${t.select}`),
    shouldEnd: false,
  };
}

async function handleSignupDistrict(sessionId: string, input: string, language: UssdLanguage): Promise<UssdResponse> {
  const session = await UssdSession.findOne({ session_id: sessionId }).lean();
  const lang = (session?.data?.language as UssdLanguage) || language;
  const t = getUssdTranslation(lang);

  const provinceIndex = session?.data?.province_index;
  if (provinceIndex === undefined || provinceIndex === null) {
    return {
      message: formatUssdMessage(t.sessionExpired),
      shouldEnd: true,
    };
  }

  const districtIndex = parseInt(input) - 1;
  const districts = getDistrictsForProvince(provinceIndex, lang);
  
  if (isNaN(districtIndex) || districtIndex < 0 || districtIndex >= districts.length) {
    const menu = formatMenu(districts);
    return {
      message: formatUssdMessage(`${t.invalid}\n${t.selectDistrict}\n${menu}\n\n${t.select}`),
      shouldEnd: false,
    };
  }

  const districtName = districts[districtIndex];
  const sectors = getSectorsForDistrict(provinceIndex, districtIndex, lang);

  await updateSession(sessionId, {
    state: 'SIGNUP_LOCATION_SECTOR',
    data: {
      ...session?.data,
      district_index: districtIndex,
      district: districtName,
    },
  });

  // Handle pagination if sectors exceed USSD menu limit (typically 10-12 items)
  const maxItemsPerPage = 10;
  if (sectors.length > maxItemsPerPage) {
    // For now, show first page. In production, implement pagination
    const firstPage = sectors.slice(0, maxItemsPerPage);
    const menu = formatMenu(firstPage);
    return {
      message: formatUssdMessage(`${t.selectSector}\n${menu}\n\n${t.select}`),
      shouldEnd: false,
    };
  }

  const menu = formatMenu(sectors);
  return {
    message: formatUssdMessage(`${t.selectSector}\n${menu}\n\n${t.select}`),
    shouldEnd: false,
  };
}

async function handleSignupSector(sessionId: string, input: string, language: UssdLanguage): Promise<UssdResponse> {
  const session = await UssdSession.findOne({ session_id: sessionId }).lean();
  const lang = (session?.data?.language as UssdLanguage) || language;
  const t = getUssdTranslation(lang);

  const provinceIndex = session?.data?.province_index;
  const districtIndex = session?.data?.district_index;

  if (typeof provinceIndex !== 'number' || typeof districtIndex !== 'number') {
    return {
      message: formatUssdMessage(t.sessionExpired),
      shouldEnd: true,
    };
  }

  const sectorIndex = parseInt(input) - 1;
  const sectors = getSectorsForDistrict(provinceIndex, districtIndex, lang);
  
  if (isNaN(sectorIndex) || sectorIndex < 0 || sectorIndex >= sectors.length) {
    const menu = formatMenu(sectors);
    return {
      message: formatUssdMessage(`${t.invalid}\n${t.selectSector}\n${menu}\n\n${t.select}`),
      shouldEnd: false,
    };
  }

  const sectorName = sectors[sectorIndex];

  await updateSession(sessionId, {
    state: 'SIGNUP_SERVICE_PREFS',
    data: {
      ...session?.data,
      sector_index: sectorIndex,
      sector: sectorName,
    },
  });

  return {
    message: formatUssdMessage(t.selectServices),
    shouldEnd: false,
  };
}

async function handleSignupServicePrefs(sessionId: string, input: string, phoneNumber: string, language: UssdLanguage): Promise<UssdResponse> {
  const session = await UssdSession.findOne({ session_id: sessionId }).lean();
  const lang = (session?.data?.language as UssdLanguage) || language;
  const t = getUssdTranslation(lang);

  const serviceMap: Record<string, string> = {
    '1': 'REG',
    '2': 'WASAC',
    '3': 'EMERGENCY',
  };

  let servicePreferences: string[] = [];
  if (input === '0') {
    servicePreferences = ['REG', 'WASAC', 'EMERGENCY'];
  } else {
    const selections = input.split(',').map((s) => s.trim());
    servicePreferences = selections
      .map((s) => serviceMap[s])
      .filter((s) => s !== undefined);
  }

  if (servicePreferences.length === 0) {
    return {
      message: formatUssdMessage(t.invalid),
      shouldEnd: false,
    };
  }

  const { name, district, sector } = session?.data || {};

  // Create account directly (no OTP needed for USSD)
  try {
    const result = await registerUserUssd({
      identifier: phoneNumber,
      identifierType: 'phone',
      password: crypto.randomBytes(16).toString('hex'), // Random password for USSD users
      role: 'citizen',
      district: district || undefined,
      sector: sector || undefined,
      termsAccepted: true,
      fullName: name || undefined,
    });

    // Update user with service preferences if needed (can be stored in user preferences later)
    const User = (await import('../models/User')).default;
    await User.findByIdAndUpdate(result.user.id, {
      $set: {
        full_name: name,
        sms_opt_in: true,
      },
    });

    await UssdSession.deleteOne({ session_id: sessionId });

    return {
      message: formatUssdMessage(
        `${t.welcome} ${name}!\n\n` +
        `${t.accountCreated}\n\n` +
        `${t.thankYou}`
      ),
      shouldEnd: true,
    };
  } catch (error: any) {
    return {
      message: formatUssdMessage(`${t.error} ${error.message || t.registrationFailed}`),
      shouldEnd: true,
    };
  }
}

async function handleSigninStart(sessionId: string, input: string, phoneNumber: string, language: UssdLanguage): Promise<UssdResponse> {
  const session = await UssdSession.findOne({ session_id: sessionId }).lean();
  const lang = (session?.data?.language as UssdLanguage) || language;
  const t = getUssdTranslation(lang);

  try {
    const result = await signInUssd(phoneNumber);

    await UssdSession.deleteOne({ session_id: sessionId });

    const userName = result.user.fullName || 'User';

    return {
      message: formatUssdMessage(
        `${t.welcomeBack} ${userName}!\n\n` +
        `${t.signedIn}\n` +
        `${t.youWillReceiveAlerts}\n\n` +
        `${t.thankYou}`
      ),
      shouldEnd: true,
    };
  } catch (error: any) {
    return {
      message: formatUssdMessage(`${t.error} ${error.message || t.signInFailed}`),
      shouldEnd: true,
    };
  }
}
