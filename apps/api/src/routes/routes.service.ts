import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../common/audit.service';

export interface RoutePoint {
  address: string;
  lat?: number;
  lng?: number;
}

@Injectable()
export class RoutesService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  /**
   * Calcula ruta óptima entre puntos. Wrapper sobre Google Directions API.
   * Si no hay GOOGLE_MAPS_API_KEY, devuelve un cálculo aproximado (Haversine).
   */
  async calculate(points: RoutePoint[]) {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (apiKey && points.every((p) => p.lat != null && p.lng != null)) {
      return this.callGoogleDirections(points, apiKey);
    }
    return this.approximate(points);
  }

  async saveForService(serviceId: string, route: any, manual: boolean, userId?: string) {
    const s = await this.prisma.service.findUnique({ where: { id: serviceId } });
    if (!s) throw new NotFoundException('Servicio no encontrado');
    const updated = await this.prisma.service.update({
      where: { id: serviceId },
      data: {
        routeJson: JSON.stringify(route),
        distanciaKm: route.distanceKm ?? null,
        duracionMin: route.durationMin ?? null,
        rutaManual: manual,
      },
    });
    await this.audit.log({
      userId,
      action: 'ROUTE_SET',
      entity: 'Service',
      entityId: serviceId,
      data: { manual },
    });
    return updated;
  }

  private async callGoogleDirections(points: RoutePoint[], apiKey: string) {
    try {
      const origin = `${points[0].lat},${points[0].lng}`;
      const destination = `${points[points.length - 1].lat},${points[points.length - 1].lng}`;
      const waypoints = points
        .slice(1, -1)
        .map((p) => `${p.lat},${p.lng}`)
        .join('|');
      const url = new URL('https://maps.googleapis.com/maps/api/directions/json');
      url.searchParams.set('origin', origin);
      url.searchParams.set('destination', destination);
      if (waypoints) url.searchParams.set('waypoints', `optimize:true|${waypoints}`);
      url.searchParams.set('departure_time', 'now');
      url.searchParams.set('key', apiKey);
      const res = await fetch(url.toString());
      const json: any = await res.json();
      if (!json.routes?.[0]) return this.approximate(points);
      const leg = json.routes[0].legs;
      const distMeters = leg.reduce((acc: number, l: any) => acc + l.distance.value, 0);
      const durSec = leg.reduce((acc: number, l: any) => acc + l.duration.value, 0);
      return {
        distanceKm: Math.round((distMeters / 1000) * 10) / 10,
        durationMin: Math.round(durSec / 60),
        polyline: json.routes[0].overview_polyline?.points,
        legs: json.routes[0].legs,
        provider: 'google',
      };
    } catch {
      return this.approximate(points);
    }
  }

  private approximate(points: RoutePoint[]) {
    let distKm = 0;
    for (let i = 0; i < points.length - 1; i++) {
      const a = points[i];
      const b = points[i + 1];
      if (a.lat != null && a.lng != null && b.lat != null && b.lng != null) {
        distKm += haversine(a.lat, a.lng, b.lat, b.lng);
      } else {
        distKm += 5; // fallback dummy
      }
    }
    return {
      distanceKm: Math.round(distKm * 10) / 10,
      durationMin: Math.round((distKm / 35) * 60), // ~35km/h promedio urbano
      polyline: null,
      legs: null,
      provider: 'approximation',
    };
  }
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
