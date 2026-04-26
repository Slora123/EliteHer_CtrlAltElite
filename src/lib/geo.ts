export type LonLat = [number, number] // [lon, lat]

export function haversineMeters(a: LonLat, b: LonLat) {
  const toRad = (x: number) => (x * Math.PI) / 180
  const R = 6371000
  const dLat = toRad(b[1] - a[1])
  const dLon = toRad(b[0] - a[0])
  const lat1 = toRad(a[1])
  const lat2 = toRad(b[1])
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(s))
}

export function metersToText(m: number) {
  if (m < 1000) return `${Math.round(m)} m`
  return `${(m / 1000).toFixed(1)} km`
}

// Distance from point P to segment AB (roughly) using sampling in lon/lat space.
// For our UX (deviation detection) we can use a simple nearest-point sampling along the polyline.
export function distanceToPolylineMeters(point: LonLat, line: LonLat[], samples = 160) {
  if (line.length < 2) return Infinity
  // Sample along the polyline length proportionally
  const total = polylineLengthMeters(line)
  if (!isFinite(total) || total <= 0) return haversineMeters(point, line[0])

  let best = Infinity
  for (let i = 0; i <= samples; i++) {
    const t = i / samples
    const p = pointAlongPolyline(line, total * t)
    best = Math.min(best, haversineMeters(point, p))
  }
  return best
}

export function polylineLengthMeters(line: LonLat[]) {
  let d = 0
  for (let i = 1; i < line.length; i++) d += haversineMeters(line[i - 1], line[i])
  return d
}

export function pointAlongPolyline(line: LonLat[], targetMeters: number): LonLat {
  if (line.length === 0) return [0, 0]
  if (line.length === 1) return line[0]
  let acc = 0
  for (let i = 1; i < line.length; i++) {
    const a = line[i - 1]
    const b = line[i]
    const seg = haversineMeters(a, b)
    if (acc + seg >= targetMeters) {
      const t = seg === 0 ? 0 : (targetMeters - acc) / seg
      return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
    }
    acc += seg
  }
  return line[line.length - 1]
}

