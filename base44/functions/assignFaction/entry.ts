import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

async function computeAndAssign(base44, userId, lat, lng) {
  const allUsers = await base44.asServiceRole.entities.User.list();
  const withCoords = allUsers.filter(u => u.latitude != null && u.longitude != null);

  let medianLat = lat;
  let medianLng = lng;

  if (withCoords.length > 1) {
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
  return faction;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    // Sweep mode — called by scheduled automation (no entity payload)
    if (!body.event?.entity_id) {
      const allUsers = await base44.asServiceRole.entities.User.list();
      const unfactioned = allUsers.filter(
        u => !u.faction && u.latitude != null && u.longitude != null
      );

      const results = [];
      for (const u of unfactioned) {
        const faction = await computeAndAssign(base44, u.id, u.latitude, u.longitude);
        results.push({ userId: u.id, faction });
      }

      return Response.json({ mode: 'sweep', assigned: results.length, results });
    }

    // Entity-trigger mode
    const userId = body.event.entity_id;
    const userData = body.data;

    if (userData?.faction) {
      return Response.json({ skipped: true, reason: 'faction already set' });
    }

    const lat = userData?.latitude;
    const lng = userData?.longitude;

    if (lat == null || lng == null) {
      return Response.json({ skipped: true, reason: 'no coordinates yet' });
    }

    const faction = await computeAndAssign(base44, userId, lat, lng);
    return Response.json({ action: 'assigned', userId, faction });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});