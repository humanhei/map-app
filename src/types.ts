export type LatLng = {
  lat: number;
  lng: number;
};

export type LocationItem = {
  locName: string;
  pos: LatLng;
  timeZoneName: string;
  localTimeStr: string;
  checked: boolean;
};
