const JOURNEY_COOKIE = 'terravisionJourney';

export const readJourneyCookie = () => {
  if (typeof document === 'undefined') {
    return null;
  }
  const entry = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${JOURNEY_COOKIE}=`));
  if (!entry) {
    return null;
  }
  const value = entry.slice(JOURNEY_COOKIE.length + 1);
  try {
    return JSON.parse(decodeURIComponent(value));
  } catch (error) {
    console.warn('Unable to parse journey cookie', error);
    return null;
  }
};

export const writeJourneyCookie = (payload) => {
  if (typeof document === 'undefined') {
    return;
  }
  const maxAge = 60 * 60 * 24 * 7; // 7 days
  document.cookie = `${JOURNEY_COOKIE}=${encodeURIComponent(JSON.stringify(payload))};path=/;max-age=${maxAge};SameSite=Lax`;
};

export default {
  readJourneyCookie,
  writeJourneyCookie,
};
