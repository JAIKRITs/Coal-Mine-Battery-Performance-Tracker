export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export const MAP_LOCATION = {
  latitude: 23.18858,
  longitude: 72.628775,
};

export const MAP_VIEW = {
  ...MAP_LOCATION,
  zoom: 15,
  pitch: 60,
  bearing: -20,
};

export const MAP_OVERLAY_FLY_TO = {
  center: [MAP_LOCATION.longitude, MAP_LOCATION.latitude],
  zoom: 7,
  pitch: 45,
  speed: 1.2,
  curve: 1.4,
  essential: true,
};

export function clampMapView(view) {
  return {
    ...view,
    zoom: Math.min(20, Math.max(1, view.zoom ?? MAP_VIEW.zoom)),
    pitch: Math.min(85, Math.max(0, view.pitch ?? MAP_VIEW.pitch)),
    bearing: view.bearing ?? MAP_VIEW.bearing,
  };
}

export function getStaticMapUrl({
  width = 720,
  height = 360,
  view = MAP_VIEW,
} = {}) {
  if (!MAPBOX_TOKEN) {
    return null;
  }

  const safeView = clampMapView(view);
  const pin = `pin-s+ef4444(${MAP_LOCATION.longitude},${MAP_LOCATION.latitude})`;
  const camera = `${MAP_LOCATION.longitude},${MAP_LOCATION.latitude},${safeView.zoom},${safeView.bearing},${safeView.pitch}`;

  return `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/static/${pin}/${camera}/${width}x${height}?access_token=${MAPBOX_TOKEN}`;
}
