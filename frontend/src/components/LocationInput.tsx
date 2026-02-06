import { useEffect, useRef, forwardRef } from 'react';

interface LocationInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
}

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const scriptId = 'google-maps-places-script';

function loadGoogleMapsScript(): Promise<void> {
  if (!API_KEY?.trim()) return Promise.reject(new Error('No API key'));
  const g = (window as any).google;
  if (g?.maps?.places) return Promise.resolve();

  return new Promise((resolve, reject) => {
    if (document.getElementById(scriptId)) {
      (window as any).initGoogleMaps = resolve;
      return;
    }
    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Maps'));
    document.head.appendChild(script);
  });
}

const LocationInput = forwardRef<HTMLInputElement, LocationInputProps>(
  function LocationInput({ id, className = '', ...props }, ref) {
    const autocompleteRef = useRef<any>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const setRefs = (el: HTMLInputElement | null) => {
      inputRef.current = el;
      if (typeof ref === 'function') ref(el);
      else if (ref) ref.current = el;
    };

    useEffect(() => {
      if (!API_KEY?.trim() || !inputRef.current) return;

      loadGoogleMapsScript()
        .then(() => {
          const g = (window as any).google;
          if (!inputRef.current || !g?.maps?.places) return;
          if (autocompleteRef.current) return;

          const autocomplete = new g.maps.places.Autocomplete(inputRef.current, {
            types: ['geocode'],
            componentRestrictions: { country: ['rw'] },
            fields: ['formatted_address', 'address_components'],
          });

          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            const address = place.formatted_address || '';
            if (inputRef.current && address) {
              inputRef.current.value = address;
              inputRef.current.dispatchEvent(new Event('input', { bubbles: true }));
            }
          });

          autocompleteRef.current = autocomplete;
        })
        .catch(() => {});
    }, []);

    return (
      <input
        ref={setRefs}
        id={id}
        type="text"
        autoComplete="off"
        className={`input ${className}`}
        {...props}
      />
    );
  }
);

export default LocationInput;
