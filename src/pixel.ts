export const getCookie = (name: string) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return undefined;
};

export const generateEventId = () => {
  return 'evt_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
};

export const trackEvent = async (eventName: string, eventData: any = {}, userData: any = {}) => {
  const eventId = generateEventId();
  
  // Track on client-side pixel
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', eventName, eventData, { eventID: eventId });
  }

  // Track via Server-Side API
  try {
    const fbp = getCookie('_fbp');
    const fbc = getCookie('_fbc');
    
    await fetch('/api/capi', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        eventName,
        eventData,
        eventId,
        url: window.location.href,
        userAgent: navigator.userAgent,
        fbp,
        fbc,
        email: userData.email,
        phone: userData.phone
      })
    });
  } catch (err) {
    console.error('Failed to send event to CAPI:', err);
  }
};
