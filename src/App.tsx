import React, { useCallback, useMemo, useState } from 'react';
import axios from 'axios';
import { useJsApiLoader } from '@react-google-maps/api';
import MapApp from './components/MapApp';
import LocTable from './components/LocTable';
import PlaceAutocomplete, { SelectedPlace } from './components/PlaceAutocomplete';
import { LatLng, LocationItem } from './types';

const env = (import.meta as ImportMeta & { env: Record<string, string | undefined> }).env;
const GOOGLE_MAP_API_KEY = env.VITE_GOOGLE_MAPS_API_KEY ?? env.REACT_APP_GOOGLE_MAPS_API_KEY ?? '';
const GOOGLE_MAPS_API_URL =
  env.VITE_GOOGLE_MAPS_API_URL ??
  env.REACT_APP_GOOGLE_MAPS_API_URL ??
  'https://maps.googleapis.com/maps/api';
const libraries: 'places'[] = ['places'];

type TimeData = {
  timeZoneName: string;
  localTimeStr: string;
};

function App(): React.ReactElement | null {
  const [selectedPlace, setSelectedPlace] = useState<SelectedPlace | null>(null);
  const [locItems, setLocItems] = useState<LocationItem[]>([]);
  const [center, setCenter] = useState<LatLng>({ lat: 43.653226, lng: -79.3831843 });
  const [warningMsg, setWarningMsg] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAP_API_KEY,
    libraries,
  });

  const canDelete = useMemo(
    () => locItems.some((item: LocationItem) => item.checked),
    [locItems]
  );

  const handlePlaceSelect = useCallback((place: SelectedPlace): void => {
    setSelectedPlace(place);
    setWarningMsg(false);
  }, []);

  const getCoordinates = () =>
    new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });

  const getTimeData = async (pos: LatLng): Promise<TimeData> => {
    const now = Math.floor(Date.now() / 1000);
    const { data: timezone } = await axios.get(
      `${GOOGLE_MAPS_API_URL}/timezone/json?location=${pos.lat},${pos.lng}&timestamp=${now}&key=${GOOGLE_MAP_API_KEY}`
    );
    const { timeZoneName, dstOffset, rawOffset } = timezone;
    const localTime = new Date((now + dstOffset + rawOffset) * 1000);
    const localTimeStr = `${localTime
      .getUTCHours()
      .toString()
      .padStart(2, '0')}:${localTime
      .getUTCMinutes()
      .toString()
      .padStart(2, '0')}`;

    return { timeZoneName, localTimeStr };
  };

  const getCurrentPosition = async (): Promise<void> => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser.');
      return;
    }

    const { coords } = await getCoordinates();
    const pos: LatLng = { lat: coords.latitude, lng: coords.longitude };

    const { data: currLocData } = await axios.get(
      `${GOOGLE_MAPS_API_URL}/geocode/json?latlng=${pos.lat},${pos.lng}&key=${GOOGLE_MAP_API_KEY}`
    );
    const { timeZoneName, localTimeStr } = await getTimeData(pos);

    setLocItems((prev: LocationItem[]) => [
      ...prev,
      {
        locName: currLocData.results[0].formatted_address,
        pos,
        timeZoneName,
        localTimeStr,
        checked: false,
      },
    ]);
    setCenter(pos);
  };

  const addLoc = async (): Promise<void> => {
    if (selectedPlace) {
      const { name: placeName, pos } = selectedPlace;
      const { timeZoneName, localTimeStr } = await getTimeData(pos);

      setLocItems((prev: LocationItem[]) => [
        ...prev,
        {
          locName: placeName,
          pos,
          timeZoneName,
          localTimeStr,
          checked: false,
        },
      ]);
      setCenter(pos);
      setSelectedPlace(null);
      return;
    }

    setWarningMsg(true);
    setTimeout(() => setWarningMsg(false), 5000);
  };

  const delLoc = (): void => {
    setLocItems((prev: LocationItem[]) => prev.filter((item) => !item.checked));
  };

  const toggleLocChecked = (index: number): void => {
    setLocItems((prev: LocationItem[]) =>
      prev.map((item, itemIndex) =>
        itemIndex === index ? { ...item, checked: !item.checked } : item
      )
    );
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <div className={`app-shell ${isDarkMode ? 'theme-dark' : 'theme-light'}`}>
      <div className="padCom">
        <div className="header-row">
          <h1 className="app-title">Location App</h1>
          <button
            className="btn btn-outline-secondary theme-toggle-btn"
            type="button"
            onClick={() => setIsDarkMode((prev) => !prev)}
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>
        <div className="input-group mb-3">
          <PlaceAutocomplete
            isLoaded={isLoaded}
            onPlaceSelect={handlePlaceSelect}
            isDarkMode={isDarkMode}
          />
          <button
            className="btn btn-outline-primary"
            type="button"
            onClick={() => void addLoc()}
          >
            Add Location
          </button>
          <button
            className="btn btn-outline-secondary"
            type="button"
            onClick={() => void getCurrentPosition()}
          >
            Get Current Posistion
          </button>
        </div>
        <div
          className={`alert alert-warning align-items-center ${
            warningMsg ? 'd-flex' : 'd-none'
          }`}
          role="alert"
        >
          Location entered is not found. Please select a location from dropdown
        </div>
      </div>
      <MapApp items={locItems} center={center} isDarkMode={isDarkMode} />
      <LocTable
        items={locItems}
        onDeleteSelected={delLoc}
        onToggleChecked={toggleLocChecked}
        canDelete={canDelete}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}

export default App;
