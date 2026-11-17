const locationNameCache = new Map();

export const reverseGeocode = (latitude, longitude) => {
  const key = `${latitude},${longitude}`;
  if (locationNameCache.has(key)) return locationNameCache.get(key);

  const request = fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
    { headers: { 'Accept-Language': 'id' } },
  )
    .then((response) => {
      if (!response.ok) throw new Error(`Reverse geocoding failed (${response.status})`);
      return response.json();
    })
    .then((data) => {
      const name = data.name || data.display_name;
      return typeof name === 'string' ? name.slice(0, 500) : null;
    })
    .catch((error) => {
      locationNameCache.delete(key);
      throw error;
    });

  locationNameCache.set(key, request);
  return request;
};
