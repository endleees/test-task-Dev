function toRadians(degrees) {
  return degrees * Math.PI / 180;
}
function distance(lat1, lng1, lat2, lng2) {
  const earthRadius = 6371; // Радиус Земли в километрах
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
        + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2))
        * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadius * c;
}

export default function findNearestCoordinate(coordinates, lat, lng) {
  let nearestCoordinate = null;
  let minDistance = Infinity;
  for (let i = 0; i < coordinates.length; i++) {
    const [lat2, lng2] = coordinates[i];
    const d = distance(lat, lng, lat2, lng2);
    if (d < minDistance) {
      minDistance = d;
      nearestCoordinate = [lat2, lng2];
    }
  }
  return nearestCoordinate;
}
