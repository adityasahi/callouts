import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Assign faction based on lat/lng relative to all other users' median
// N/S determined by latitude median; E/W by longitude median
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const userId = body.event?.entity_id;
    const userData = body.data;

    if (!userId) {
      return Response.json({ skipped: true, reason: 'no user id' });
    }

    // Skip if faction already assigned
    if (userData?.faction) {
      return Response.json({ skipped: true, reason: 'faction already set' });
    }

    // Need coordinates — if not present yet, skip (profile update will re-trigger)
    const lat = userData?.latitude;
    const lng = userData?.longitude;

    if (lat == null || lng == null) {
      return Response.json({ skipped: true, reason: 'no coordinates yet' });
    }

    // Fetch all users with coordinates to compute medians
    const allUsers = await base44.asServiceRole.entities.User.list();
    const withCoords = allUsers.filter(u => u.latitude != null && u.longitude != null);

    let medianLat, medianLng;

    if (withCoords.length === 0) {
      // No reference users — default medians
      medianLat = lat;
      medianLng = lng;
    } else {
      const sortedLats = [...withCoords.map(u => u.latitude)].sort((a, b) => a - b);
      const sortedLngs = [...withCoords.map(u => u.longitude)].sort((a, b) => a - b);
      const mid = Math.floor(sortedLats.length / 2);
      medianLat = sortedLats.length % 2 !== 0
        ? sortedLats[mid]
        : (sortedLats[mid - 1] + sortedLats[mid]) / 2;
      const midLng = Math.floor(sortedLngs.length / 2);
      medianLng = sortedLngs.length % 2 !== 0
        ? sortedLngs[midLng]
        : (sortedLngs[midLng - 1] + sortedLngs[midLng]) / 2;
    }

    const latDiff = Math.abs(lat - medianLat);
    const lngDiff = Math.abs(lng - medianLng);

    let faction;
    if (latDiff >= lngDiff) {
      faction = lat >= medianLat ? 'Northside' : 'Southside';
    } else {
      faction = lng >= medianLng ? 'Eastside' : 'Westside';
    }

    await base44.asServiceRole.entities.User.update(userId, { faction });

    return Response.json({ action: 'assigned', userId, faction, medianLat, medianLng });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});