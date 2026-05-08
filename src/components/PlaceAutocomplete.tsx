import React, { useEffect, useRef } from 'react';
import { LatLng } from '../types';

export type SelectedPlace = {
  name: string;
  pos: LatLng;
};

type PlaceSelectEvent = Event & {
  placePrediction?: {
    toPlace: () => google.maps.places.Place;
  };
};

type PlaceAutocompleteProps = {
  isLoaded: boolean;
  onPlaceSelect: (place: SelectedPlace) => void;
  isDarkMode: boolean;
};

function PlaceAutocomplete({
  isLoaded,
  onPlaceSelect,
  isDarkMode,
}: PlaceAutocompleteProps): React.ReactElement {
  const placeInputHostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isLoaded || !placeInputHostRef.current || !google.maps.places) {
      return;
    }

    const host = placeInputHostRef.current;
    const placeAutocomplete = new google.maps.places.PlaceAutocompleteElement({});
    placeAutocomplete.setAttribute('placeholder', 'Enter Location');
    placeAutocomplete.style.width = '100%';
    placeAutocomplete.style.colorScheme = isDarkMode ? 'dark' : 'light';

    const handlePlaceSelect = async (event: Event): Promise<void> => {
      const placeEvent = event as PlaceSelectEvent;
      const placePrediction = placeEvent.placePrediction;

      if (!placePrediction) {
        return;
      }

      const place = placePrediction.toPlace();
      await place.fetchFields({ fields: ['displayName', 'location'] });

      if (place.location && place.displayName) {
        onPlaceSelect({
          name: place.displayName,
          pos: { lat: place.location.lat(), lng: place.location.lng() },
        });
      }
    };

    placeAutocomplete.addEventListener('gmp-select', handlePlaceSelect as EventListener);
    host.replaceChildren(placeAutocomplete);

    return () => {
      placeAutocomplete.removeEventListener('gmp-select', handlePlaceSelect as EventListener);
      host.replaceChildren();
    };
  }, [isLoaded, isDarkMode, onPlaceSelect]);

  return <div className="form-control p-0 border-0" ref={placeInputHostRef} />;
}

export default PlaceAutocomplete;
