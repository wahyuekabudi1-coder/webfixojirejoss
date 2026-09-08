import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../AppContext';
import { VEHICLES } from '../data';
import { 
  Route, MapPin, Calendar, Clock, Users, ArrowRight, ShieldCheck, 
  CheckCircle2, Map, Info, Briefcase, Locate, Search, 
  Plane, Mail, Phone, User, Sparkles, X, Check, ArrowRightLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { processArtoPayPayment } from '../lib/artopay';
import CustomerReviewsSection from '../components/CustomerReviewsSection';
import Breadcrumbs from '../components/Breadcrumbs';
import ServiceNavTabs from '../components/ServiceNavTabs';

// Predefined node coordinates for matching admin configured tariffs
const cityCoordinates: Record<string, { lat: number, lon: number }> = {
  'surabaya': { lat: -7.2575, lon: 112.7521 },
  'malang': { lat: -7.9653, lon: 112.6214 },
  'bromo': { lat: -7.9425, lon: 112.9530 },
  'probolinggo (bromo)': { lat: -7.9425, lon: 112.9530 },
  'denpasar / seminyak': { lat: -8.6500, lon: 115.2167 },
  'yogyakarta': { lat: -7.7956, lon: 110.3695 },
  'jakarta': { lat: -6.2088, lon: 106.8456 }
};

const airportsList = [
  { code: 'SUB', name: 'Juanda International Airport (SUB)', lat: -7.3798, lon: 112.7874 },
  { code: 'DPS', name: 'Ngurah Rai International Airport (DPS)', lat: -8.7481, lon: 115.1674 },
  { code: 'CGK', name: 'Soekarno-Hatta International Airport (CGK)', lat: -6.1256, lon: 106.6559 },
  { code: 'YIA', name: 'Yogyakarta International Airport (YIA)', lat: -7.9001, lon: 110.0573 }
];

// Haversine formula to compute distance in km between two lat/lon coordinates
function getDistanceKM(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // radius of Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const POPULAR_ROUTES = [
  {
    title: 'Surabaya Airport (SUB) ⇄ Malang City',
    pickup: 'Juanda International Airport (SUB), Surabaya',
    pickupCoords: { lat: -7.3798, lon: 112.7874 },
    dest: 'Malang City Center, East Java',
    destCoords: { lat: -7.9653, lon: 112.6214 },
    airportCode: 'SUB',
    city: 'Malang'
  },
  {
    title: 'Surabaya Airport (SUB) ⇄ Mount Bromo',
    pickup: 'Juanda International Airport (SUB), Surabaya',
    pickupCoords: { lat: -7.3798, lon: 112.7874 },
    dest: 'Cemoro Lawang, Mount Bromo, Probolinggo',
    destCoords: { lat: -7.9425, lon: 112.9530 },
    airportCode: 'SUB',
    city: 'Probolinggo (Bromo)'
  },
  {
    title: 'Ngurah Rai Airport (DPS) ⇄ Seminyak / Kuta',
    pickup: 'Ngurah Rai International Airport (DPS), Bali',
    pickupCoords: { lat: -8.7481, lon: 115.1674 },
    dest: 'Seminyak, Kuta, Badung Regency, Bali',
    destCoords: { lat: -8.4412, lon: 115.1235 },
    airportCode: 'DPS',
    city: 'Denpasar / Seminyak'
  },
  {
    title: 'Yogyakarta Airport (YIA) ⇄ Jogja Center',
    pickup: 'Yogyakarta International Airport (YIA)',
    pickupCoords: { lat: -7.9001, lon: 110.0573 },
    dest: 'Yogyakarta City Center, DI Yogyakarta',
    destCoords: { lat: -7.7956, lon: 110.3695 },
    airportCode: 'YIA',
    city: 'Yogyakarta'
  },
  {
    title: 'Jakarta Airport (CGK) ⇄ Jakarta Central',
    pickup: 'Soekarno-Hatta International Airport (CGK), Tangerang',
    pickupCoords: { lat: -6.1256, lon: 106.6559 },
    dest: 'Central Jakarta City, Special Capital Region of Jakarta',
    destCoords: { lat: -6.2088, lon: 106.8456 },
    airportCode: 'CGK',
    city: 'Jakarta'
  },
  {
    title: 'Surabaya Airport (SUB) ⇄ Surabaya Central',
    pickup: 'Juanda International Airport (SUB), Surabaya',
    pickupCoords: { lat: -7.3798, lon: 112.7874 },
    dest: 'Surabaya Central City, East Java',
    destCoords: { lat: -7.2575, lon: 112.7521 },
    airportCode: 'SUB',
    city: 'Surabaya'
  }
];

export default function TaxiView() {
  const { 
    airportRoutes, 
    formatPrice, 
    addBooking, 
    setPage,
    taxiMasterAreas,
    taxiMasterDestinations,
    taxiPricingRules,
    taxiAreaRules
  } = useApp();

  // Leaflet map hooks & refs
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const pickupMarkerRef = useRef<any>(null);
  const destMarkerRef = useRef<any>(null);
  const routeLayerRef = useRef<any>(null);

  const [leafletLoaded, setLeafletLoaded] = useState(false);

  // Search autocomplete states
  const [pickupInput, setPickupInput] = useState('');
  const [pickupCoords, setPickupCoords] = useState<{ lat: number, lon: number } | null>(null);
  const [pickupSelected, setPickupSelected] = useState(false);
  const [pickupSuggestions, setPickupSuggestions] = useState<any[]>([]);

  const [destInput, setDestInput] = useState('');
  const [destCoords, setDestCoords] = useState<{ lat: number, lon: number } | null>(null);
  const [destSelected, setDestSelected] = useState(false);
  const [destSuggestions, setDestSuggestions] = useState<any[]>([]);

  const [fetchingGPS, setFetchingGPS] = useState(false);

  // OSRM route details
  const [distance, setDistance] = useState<number | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [routeGeometry, setRouteGeometry] = useState<any | null>(null);
  const [loadingRoute, setLoadingRoute] = useState(false);

  // Vehicle selection
  const [selectedVehicle, setSelectedVehicle] = useState(VEHICLES[1]); // default Innova Reborn
  const [step, setStep] = useState(1); // 1: Route, 2: Vehicle, 3: Passenger Details

  // Booking fields
  const [travelDate, setTravelDate] = useState('');
  const [travelTime, setTravelTime] = useState('');
  const [flightNumber, setFlightNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [extraNotes, setExtraNotes] = useState('');

  const [bookingSuccess, setBookingSuccess] = useState<any | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Dynamic loading of Leaflet from standard CDN
  useEffect(() => {
    if ((window as any).L) {
      setLeafletLoaded(true);
      return;
    }

    // Inject CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    // Inject JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => {
      setLeafletLoaded(true);
    };
    document.head.appendChild(script);
  }, []);

  // Initialize Map container
  useEffect(() => {
    if (!leafletLoaded || !mapContainerRef.current) return;
    if (mapRef.current) return; // already exists

    const L = (window as any).L;
    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      scrollWheelZoom: false
    }).setView([-7.2575, 112.7521], 9);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Merge default icons safely
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [leafletLoaded, step]);

  // Handle GPS Current Location
  const handleGetGPSLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setFetchingGPS(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setPickupCoords({ lat: latitude, lon: longitude });

        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`, {
            headers: {
              'User-Agent': 'SawahJayaTrans-TaxiService/1.0'
            }
          });
          const data = await res.json();
          setPickupInput(data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          setPickupSelected(true);
        } catch (err) {
          setPickupInput(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          setPickupSelected(true);
        } finally {
          setFetchingGPS(false);
        }
      },
      (error) => {
        alert("Unable to retrieve your location: " + error.message);
        setFetchingGPS(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Autocomplete Suggestions for Pickup
  useEffect(() => {
    if (pickupInput.length < 3 || pickupSelected) {
      setPickupSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(pickupInput)}&limit=5&addressdetails=1&countrycodes=id`, {
          headers: {
            'User-Agent': 'SawahJayaTrans-TaxiService/1.0'
          }
        });
        const data = await res.json();
        setPickupSuggestions(data);
      } catch (err) {
        console.error("Geocoding failed", err);
      }
    }, 450);

    return () => clearTimeout(delayDebounce);
  }, [pickupInput, pickupSelected]);

  // Autocomplete Suggestions for Destination
  useEffect(() => {
    if (destInput.length < 3 || destSelected) {
      setDestSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destInput)}&limit=5&addressdetails=1&countrycodes=id`, {
          headers: {
            'User-Agent': 'SawahJayaTrans-TaxiService/1.0'
          }
        });
        const data = await res.json();
        setDestSuggestions(data);
      } catch (err) {
        console.error("Geocoding failed", err);
      }
    }, 450);

    return () => clearTimeout(delayDebounce);
  }, [destInput, destSelected]);

  // Fetch driving route, distance, and duration from OSRM
  useEffect(() => {
    if (!pickupCoords || !destCoords) return;

    const fetchRoute = async () => {
      setLoadingRoute(true);
      try {
        const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${pickupCoords.lon},${pickupCoords.lat};${destCoords.lon},${destCoords.lat}?geometries=geojson&overview=full`);
        const data = await res.json();
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          setDistance(Math.round(route.distance / 1000)); // in km
          setDuration(route.duration); // in seconds
          setRouteGeometry(route.geometry);
        } else {
          setDistance(null);
          setDuration(null);
          setRouteGeometry(null);
        }
      } catch (err) {
        console.error("Routing calculation failed", err);
        // Fallback distance calculation using haversine if OSRM is blocked or slow
        const d = Math.round(getDistanceKM(pickupCoords.lat, pickupCoords.lon, destCoords.lat, destCoords.lon) * 1.25); // approximate driving factor
        setDistance(d);
        setDuration(d * 75); // estimate driving speed 50km/h
        setRouteGeometry(null);
      } finally {
        setLoadingRoute(false);
      }
    };

    fetchRoute();
  }, [pickupCoords, destCoords]);

  // Update markers and lines on Leaflet Map
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current) return;
    const L = (window as any).L;
    const map = mapRef.current;

    // Clear previous markers
    if (pickupMarkerRef.current) {
      map.removeLayer(pickupMarkerRef.current);
      pickupMarkerRef.current = null;
    }
    if (destMarkerRef.current) {
      map.removeLayer(destMarkerRef.current);
      destMarkerRef.current = null;
    }
    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }

    const bounds: any[] = [];

    // Pickup Marker (Classic Blue / standard Leaflet marker)
    if (pickupCoords) {
      const marker = L.marker([pickupCoords.lat, pickupCoords.lon])
        .addTo(map)
        .bindPopup("<div class='font-sans font-bold text-xs text-neutral-800'>📍 Pickup Location</div>")
        .openPopup();
      pickupMarkerRef.current = marker;
      bounds.push([pickupCoords.lat, pickupCoords.lon]);
    }

    // Destination Marker (Green marker)
    if (destCoords) {
      const destIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        iconRetinaUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        shadowSize: [41, 41]
      });

      const marker = L.marker([destCoords.lat, destCoords.lon], { icon: destIcon })
        .addTo(map)
        .bindPopup("<div class='font-sans font-bold text-xs text-emerald-700'>🏁 Destination</div>");
      destMarkerRef.current = marker;
      bounds.push([destCoords.lat, destCoords.lon]);
    }

    // Route Polyline
    if (routeGeometry) {
      const geoLayer = L.geoJSON(routeGeometry, {
        style: {
          color: '#f59e0b', // Luxury brand Amber highlight
          weight: 5,
          opacity: 0.8
        }
      }).addTo(map);
      routeLayerRef.current = geoLayer;
      map.fitBounds(geoLayer.getBounds(), { padding: [40, 40] });
    } else if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [80, 80], maxZoom: 14 });
    }
  }, [leafletLoaded, pickupCoords, destCoords, routeGeometry, step]);

  // Popular Route Select Helper
  const handleSelectPopularRoute = (route: any) => {
    setPickupInput(route.pickup);
    setPickupCoords(route.pickupCoords);
    setPickupSelected(true);
    setPickupSuggestions([]);

    setDestInput(route.dest);
    setDestCoords(route.destCoords);
    setDestSelected(true);
    setDestSuggestions([]);
  };

  // Smart Tariff Lookup matching algorithm
  const getMatchedTariff = () => {
    if (!pickupCoords || !destCoords) return null;

    // Define lookup list matching administrative centers for coordinates
    const nodes = [
      { code: 'SUB', type: 'airport', lat: -7.3798, lon: 112.7874 },
      { code: 'DPS', type: 'airport', lat: -8.7481, lon: 115.1674 },
      { code: 'CGK', type: 'airport', lat: -6.1256, lon: 106.6559 },
      { code: 'YIA', type: 'airport', lat: -7.9001, lon: 110.0573 },
      { name: 'Surabaya', type: 'city', lat: -7.2575, lon: 112.7521 },
      { name: 'Malang', type: 'city', lat: -7.9653, lon: 112.6214 },
      { name: 'Probolinggo (Bromo)', type: 'city', lat: -7.9425, lon: 112.9530 },
      { name: 'Denpasar / Seminyak', type: 'city', lat: -8.6500, lon: 115.2167 },
      { name: 'Yogyakarta', type: 'city', lat: -7.7956, lon: 110.3695 },
      { name: 'Jakarta', type: 'city', lat: -6.2088, lon: 106.8456 }
    ];

    // Find closest administrative node to Pickup coords
    let closestPickup = nodes[0];
    let minPickupDist = Infinity;
    nodes.forEach(n => {
      const d = getDistanceKM(pickupCoords.lat, pickupCoords.lon, n.lat, n.lon);
      if (d < minPickupDist) {
        minPickupDist = d;
        closestPickup = n;
      }
    });

    // Find closest administrative node to Destination coords
    let closestDest = nodes[0];
    let minDestDist = Infinity;
    nodes.forEach(n => {
      const d = getDistanceKM(destCoords.lat, destCoords.lon, n.lat, n.lon);
      if (d < minDestDist) {
        minDestDist = d;
        closestDest = n;
      }
    });

    const published = airportRoutes.filter(r => r.status === 'Published');

    // Scenario A: Check direct Airport-City match
    let matched = published.find(r => 
      (r.airport === closestPickup.code && r.city === closestDest.name) ||
      (r.airport === closestDest.code && r.city === closestPickup.name)
    );

    // Scenario B: Loose match on city name details
    if (!matched) {
      matched = published.find(r => 
        r.city.toLowerCase().includes(closestPickup.name?.toLowerCase() || '') ||
        r.city.toLowerCase().includes(closestDest.name?.toLowerCase() || '')
      );
    }

    // Default to the first published route or SUB-Surabaya if nothing matches
    return matched || published[0] || { priceUSD: 30, priceIDR: 450000, airport: 'SUB', city: 'Surabaya' };
  };

  const matchedRoute = getMatchedTariff();

  // Dynamic Excel-driven pricing engine with coordinate mapping and airport/area rules
  const getDynamicPriceForVehicle = (car: any) => {
    if (!pickupCoords || !destCoords) return { usd: 30, idr: 450000 };

    let vType: 'Standard' | 'Family' | 'Premium' | 'Van' = 'Standard';
    if (car.id === 'avanza') vType = 'Standard';
    else if (car.id === 'innova') vType = 'Family';
    else if (car.id === 'alphard' || car.id === 'premium') vType = 'Premium';
    else if (car.id === 'hiace-commuter' || car.id === 'hiace-premio' || car.id === 'van') vType = 'Van';

    if (!taxiMasterAreas || taxiMasterAreas.length === 0 || !taxiPricingRules || taxiPricingRules.length === 0) {
      // Fallback if master data is empty
      let mult = 1.0;
      if (vType === 'Standard') mult = 0.9;
      if (vType === 'Family') mult = 1.0;
      if (vType === 'Premium') mult = 1.5;
      if (vType === 'Van') mult = 1.8;
      return {
        usd: Math.round((matchedRoute?.priceUSD || 30) * mult),
        idr: Math.round((matchedRoute?.priceIDR || 450000) * mult)
      };
    }

    // Resolve closest destination (within 5km of a predefined destination place)
    let pickupAreaId = '';
    let minPickupDestDist = Infinity;
    (taxiMasterDestinations || []).forEach(d => {
      const dist = getDistanceKM(pickupCoords.lat, pickupCoords.lon, d.lat, d.lon);
      if (dist < minPickupDestDist) {
        minPickupDestDist = dist;
        if (dist < 5) pickupAreaId = d.area_id;
      }
    });

    if (!pickupAreaId) {
      let closestArea = taxiMasterAreas[0];
      let minAreaDist = Infinity;
      taxiMasterAreas.forEach(a => {
        const dist = getDistanceKM(pickupCoords.lat, pickupCoords.lon, a.lat, a.lon);
        if (dist < minAreaDist) {
          minAreaDist = dist;
          closestArea = a;
        }
      });
      pickupAreaId = closestArea.id;
    }

    let destAreaId = '';
    let minDestDestDist = Infinity;
    (taxiMasterDestinations || []).forEach(d => {
      const dist = getDistanceKM(destCoords.lat, destCoords.lon, d.lat, d.lon);
      if (dist < minDestDestDist) {
        minDestDestDist = dist;
        if (dist < 5) destAreaId = d.area_id;
      }
    });

    if (!destAreaId) {
      let closestArea = taxiMasterAreas[0];
      let minAreaDist = Infinity;
      taxiMasterAreas.forEach(a => {
        const dist = getDistanceKM(destCoords.lat, destCoords.lon, a.lat, a.lon);
        if (dist < minAreaDist) {
          minAreaDist = dist;
          closestArea = a;
        }
      });
      destAreaId = closestArea.id;
    }

    // Find custom Pricing Rule
    const rule = taxiPricingRules.find(r => 
      ((r.source_id === pickupAreaId && r.destination_id === destAreaId) ||
       (r.source_id === destAreaId && r.destination_id === pickupAreaId)) &&
      r.vehicle_type === vType &&
      r.status === 'Active'
    );

    let baseUSD = 30;
    let baseIDR = 450000;

    if (rule) {
      baseUSD = rule.price_usd;
      baseIDR = rule.price_idr;
    } else {
      const distKm = distance || 25;
      baseUSD = Math.max(15, Math.round(10 + distKm * 0.45));
      baseIDR = Math.max(220000, Math.round(150000 + distKm * 6800));

      let mult = 1.0;
      if (vType === 'Standard') mult = 0.9;
      if (vType === 'Family') mult = 1.0;
      if (vType === 'Premium') mult = 1.5;
      if (vType === 'Van') mult = 1.8;
      baseUSD = Math.round(baseUSD * mult);
      baseIDR = Math.round(baseIDR * mult);
    }

    // Add Area Surcharges if applicable
    const pickupSurcharge = (taxiAreaRules || []).find(r => r.area_id === pickupAreaId);
    const destSurcharge = (taxiAreaRules || []).find(r => r.area_id === destAreaId);

    if (pickupSurcharge) {
      baseUSD += pickupSurcharge.surcharge_usd;
      baseIDR += pickupSurcharge.surcharge_idr;
    }
    if (destSurcharge) {
      baseUSD += destSurcharge.surcharge_usd;
      baseIDR += destSurcharge.surcharge_idr;
    }

    return { usd: baseUSD, idr: baseIDR };
  };

  const getServiceRouteName = () => {
    if (!pickupCoords || !destCoords) return 'Route';
    if (taxiMasterAreas && taxiMasterAreas.length > 0) {
      let pickupAreaId = '';
      let minPickupDestDist = Infinity;
      (taxiMasterDestinations || []).forEach(d => {
        const dist = getDistanceKM(pickupCoords.lat, pickupCoords.lon, d.lat, d.lon);
        if (dist < minPickupDestDist) {
          minPickupDestDist = dist;
          if (dist < 5) pickupAreaId = d.area_id;
        }
      });
      if (!pickupAreaId) {
        let closestArea = taxiMasterAreas[0];
        let minAreaDist = Infinity;
        taxiMasterAreas.forEach(a => {
          const dist = getDistanceKM(pickupCoords.lat, pickupCoords.lon, a.lat, a.lon);
          if (dist < minAreaDist) {
            minAreaDist = dist;
            closestArea = a;
          }
        });
        pickupAreaId = closestArea.id;
      }

      let destAreaId = '';
      let minDestDestDist = Infinity;
      (taxiMasterDestinations || []).forEach(d => {
        const dist = getDistanceKM(destCoords.lat, destCoords.lon, d.lat, d.lon);
        if (dist < minDestDestDist) {
          minDestDestDist = dist;
          if (dist < 5) destAreaId = d.area_id;
        }
      });
      if (!destAreaId) {
        let closestArea = taxiMasterAreas[0];
        let minAreaDist = Infinity;
        taxiMasterAreas.forEach(a => {
          const dist = getDistanceKM(destCoords.lat, destCoords.lon, a.lat, a.lon);
          if (dist < minAreaDist) {
            minAreaDist = dist;
            closestArea = a;
          }
        });
        destAreaId = closestArea.id;
      }

      const pName = taxiMasterAreas.find(a => a.id === pickupAreaId)?.name || 'Zone';
      const dName = taxiMasterAreas.find(a => a.id === destAreaId)?.name || 'Zone';
      return `${pName} ⇄ ${dName}`;
    }
    return `${matchedRoute ? matchedRoute.airport : 'Zone'} ⇄ ${matchedRoute ? matchedRoute.city : 'Zone'}`;
  };

  const currentPrice = getDynamicPriceForVehicle(selectedVehicle);

  // Time conversion helper
  const formatDuration = (sec: number | null) => {
    if (!sec) return 'Calculating...';
    const h = Math.floor(sec / 3600);
    const m = Math.round((sec % 3600) / 60);
    if (h > 0) {
      return `${h} hr ${m} min`;
    }
    return `${m} minutes`;
  };

  // Submit Booking handler
  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupCoords || !destCoords) {
      alert("Please select complete pickup and destination addresses.");
      return;
    }
    if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim() || !travelDate || !travelTime) {
      alert("Please fill in all the required passenger details.");
      return;
    }

    const bookingPayload = {
      type: 'taxi' as const,
      serviceName: `Private Taxi: ${getServiceRouteName()} (${selectedVehicle.name})`,
      details: {
        pickupLocation: pickupInput,
        destination: destInput,
        date: travelDate,
        time: travelTime,
        guests: selectedVehicle.passengers,
        vehicleId: selectedVehicle.id,
        vehicleName: selectedVehicle.name,
        flightNumber: flightNumber,
        cityAddress: pickupInput,
        extraNotes: extraNotes
      },
      totalPrice: currentPrice.usd,
      totalPriceIDR: currentPrice.idr,
      customerName,
      customerEmail,
      customerPhone
    };

    try {
      const newBooking = addBooking(bookingPayload);
      setBookingSuccess(newBooking);
      // Scroll to summary screen
      setTimeout(() => {
        const el = document.getElementById('taxi-success-card');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      alert("Booking error: " + err.message);
    }
  };

  // ArtoPay Inline checkout flow
  const handlePayArtoPay = async () => {
    if (!bookingSuccess) return;
    setPaymentLoading(true);
    setPaymentError(null);

    try {
      await processArtoPayPayment({
        orderId: bookingSuccess.id,
        amount: bookingSuccess.totalPriceIDR,
        currency: 'IDR',
        onSuccess: (res) => {
          console.log('ArtoPay payment event completed:', res);
          window.location.hash = '#/bookings';
        },
        onPending: (res) => {
          console.log('ArtoPay payment pending event:', res);
          window.location.hash = '#/bookings';
        },
        onError: (err) => {
          console.error('ArtoPay payment error/cancelled:', err);
          setPaymentError('Pembayaran ArtoPay dibatalkan atau tidak diselesaikan.');
        }
      });
    } catch (err: any) {
      setPaymentError(err.message || 'Terjadi kesalahan koneksi sistem pembayaran ArtoPay.');
    } finally {
      setPaymentLoading(false);
    }
  };

  // WhatsApp Confirm trigger
  const handleWhatsAppConfirm = () => {
    if (!bookingSuccess) return;

    const msg = `Halo SawahJaya Trans, saya ingin mengonfirmasi pesanan Private Taxi:\n\n` +
      `📌 *ID Booking:* ${bookingSuccess.id}\n` +
      `👤 *Nama:* ${bookingSuccess.customerName}\n` +
      `📞 *WhatsApp:* ${bookingSuccess.customerPhone}\n` +
      `🚗 *Armada:* ${selectedVehicle.name}\n` +
      `📍 *Penjemputan:* ${pickupInput}\n` +
      `🏁 *Tujuan:* ${destInput}\n` +
      `📅 *Jadwal:* ${travelDate} pukul ${travelTime}\n` +
      `✈️ *No. Penerbangan:* ${flightNumber || '-'}\n` +
      `ℹ️ *Catatan:* ${extraNotes || '-'}\n` +
      `📏 *Jarak Info:* ${distance ? `${distance} km` : '-'}\n` +
      `💰 *Total Tarif:* ${formatPrice(currentPrice.usd, currentPrice.idr)} (Fixed Zone Tariff)\n\n` +
      `Mohon dibantu konfirmasi penjemputan armada privat kami, terima kasih!`;

    window.open(`https://wa.me/6285212347289?text=${encodeURIComponent(msg)}`, '_blank', 'noreferrer,noopener');
  };

  return (
    <div id="taxi-view" className="bg-[#f8fafc] text-neutral-800 min-h-screen pt-20 md:pt-24 pb-16 md:pb-24 font-sans">
      
      {/* Service Switcher Navigation Bar */}
      <ServiceNavTabs />

      {/* Breadcrumb Navigation */}
      <Breadcrumbs items={[{ label: 'Private Intercity Taxi' }]} />

      {/* 1. HERO DESCRIPTION HEADER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="inline-flex items-center space-x-1.5 bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 rounded-full text-xs font-bold text-amber-700 uppercase tracking-wider font-mono">
            <Route className="h-4 w-4" />
            <span>Executive Private Transfers &amp; Chauffeurs</span>
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-neutral-900 leading-tight tracking-tight">
            Premium Airport Transfer &amp; <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700">
              Private Taxi Services
            </span>
          </h1>
          <p className="text-neutral-500 text-sm sm:text-base leading-relaxed">
            Travel stress-free across East Java with locked, flat-rate fares completely immune to surge pricing, city traffic delays, or toll charges. Select your route, track driving paths interactively on our live map, and travel in executive class comfort.
          </p>
        </div>
      </section>

      {/* 3. STEP PROGRESS TRACKER */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="bg-white border border-neutral-200 rounded-3xl p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center space-x-3 w-full md:w-auto">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
              step >= 1 ? 'bg-amber-500 text-neutral-950 font-black' : 'bg-neutral-100 text-neutral-400'
            }`}>
              {step > 1 ? <Check className="w-4 h-4 text-neutral-950 stroke-[3]" /> : '1'}
            </div>
            <div className="text-left">
              <span className="text-[10px] text-neutral-400 font-bold block uppercase tracking-wider font-mono">STEP 1</span>
              <span className={`text-xs font-extrabold ${step === 1 ? 'text-amber-600' : 'text-neutral-700'}`}>Route &amp; Live Map</span>
            </div>
          </div>

          <div className="hidden md:block flex-1 h-0.5 bg-neutral-100 mx-4">
            <div className={`h-full bg-amber-500 transition-all duration-300 ${step >= 2 ? 'w-full' : 'w-0'}`}></div>
          </div>

          <div className="flex items-center space-x-3 w-full md:w-auto">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
              step >= 2 ? 'bg-amber-500 text-neutral-950 font-black' : 'bg-neutral-100 text-neutral-400'
            }`}>
              {step > 2 ? <Check className="w-4 h-4 text-neutral-950 stroke-[3]" /> : '2'}
            </div>
            <div className="text-left">
              <span className="text-[10px] text-neutral-400 font-bold block uppercase tracking-wider font-mono">STEP 2</span>
              <span className={`text-xs font-extrabold ${step === 2 ? 'text-amber-600' : 'text-neutral-700'}`}>Select Vehicle</span>
            </div>
          </div>

          <div className="hidden md:block flex-1 h-0.5 bg-neutral-100 mx-4">
            <div className={`h-full bg-amber-500 transition-all duration-300 ${step >= 3 ? 'w-full' : 'w-0'}`}></div>
          </div>

          <div className="flex items-center space-x-3 w-full md:w-auto">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
              step >= 3 ? 'bg-amber-500 text-neutral-950 font-black' : 'bg-neutral-100 text-neutral-400'
            }`}>
              3
            </div>
            <div className="text-left">
              <span className="text-[10px] text-neutral-400 font-bold block uppercase tracking-wider font-mono">STEP 3</span>
              <span className={`text-xs font-extrabold ${step === 3 ? 'text-amber-600' : 'text-neutral-700'}`}>Passenger Details</span>
            </div>
          </div>

        </div>
      </section>

      {/* 4. ACTIVE SLIDE CONTAINER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          
          {/* SLIDE 1: ROUTE CONFIGURATION & INTERACTIVE MAP */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
            >
              {/* Route Input Controls */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white border border-neutral-200/80 p-6 rounded-3xl shadow-xl shadow-neutral-100 text-left space-y-5">
                  <h3 className="text-lg font-extrabold text-neutral-900 flex items-center gap-2">
                    <Route className="h-5 w-5 text-amber-500" />
                    <span>Configure Private Journey</span>
                  </h3>

                  <div className="space-y-4">
                    {/* Pickup Address */}
                    <div className="space-y-1.5 relative text-left">
                      <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest pl-1">
                        Pickup Location (Airport, Hotel, Landmark)
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-amber-500 shrink-0" />
                        <input
                          type="text"
                          required
                          placeholder="Type pickup address or use GPS..."
                          value={pickupInput}
                          onChange={(e) => {
                            setPickupInput(e.target.value);
                            setPickupSelected(false);
                          }}
                          className="bg-neutral-50 border border-neutral-200 text-neutral-800 text-sm rounded-xl pl-10 pr-12 py-3 w-full focus:outline-none focus:border-amber-500 focus:bg-white transition-all placeholder-neutral-400 font-medium"
                        />
                        <button
                          type="button"
                          onClick={handleGetGPSLocation}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 hover:text-amber-700 rounded-lg transition-all flex items-center justify-center cursor-pointer"
                          title="Use Current Location (GPS)"
                          disabled={fetchingGPS}
                        >
                          {fetchingGPS ? (
                            <span className="w-3.5 h-3.5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></span>
                          ) : (
                            <Locate className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>

                      <AnimatePresence>
                        {pickupSuggestions.length > 0 && (
                          <motion.ul
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            className="absolute z-40 bg-white border border-neutral-200 w-full mt-1.5 rounded-xl shadow-xl max-h-60 overflow-y-auto text-xs divide-y divide-neutral-100"
                          >
                            {pickupSuggestions.map((sug: any) => (
                              <li
                                key={sug.place_id}
                                onClick={() => {
                                  setPickupInput(sug.display_name);
                                  setPickupCoords({ lat: parseFloat(sug.lat), lon: parseFloat(sug.lon) });
                                  setPickupSelected(true);
                                  setPickupSuggestions([]);
                                }}
                                className="px-4 py-3 hover:bg-amber-50 cursor-pointer transition-colors text-left font-medium text-neutral-800"
                              >
                                {sug.display_name}
                              </li>
                            ))}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Swap buttons */}
                    <div className="flex justify-center -my-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          const tempIn = pickupInput;
                          const tempC = pickupCoords;
                          const tempSel = pickupSelected;

                          setPickupInput(destInput);
                          setPickupCoords(destCoords);
                          setPickupSelected(destSelected);

                          setDestInput(tempIn);
                          setDestCoords(tempC);
                          setDestSelected(tempSel);
                        }}
                        className="w-8 h-8 rounded-full bg-white border border-neutral-200 hover:border-amber-500 hover:text-amber-600 flex items-center justify-center transition-all cursor-pointer shadow-sm"
                        title="Swap Pickup & Destination"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5 rotate-90" />
                      </button>
                    </div>

                    {/* Destination Address */}
                    <div className="space-y-1.5 relative text-left">
                      <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest pl-1">
                        Destination Address
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-emerald-500 shrink-0" />
                        <input
                          type="text"
                          required
                          placeholder="Type destination location..."
                          value={destInput}
                          onChange={(e) => {
                            setDestInput(e.target.value);
                            setDestSelected(false);
                          }}
                          className="bg-neutral-50 border border-neutral-200 text-neutral-800 text-sm rounded-xl pl-10 pr-4 py-3 w-full focus:outline-none focus:border-amber-500 focus:bg-white transition-all placeholder-neutral-400 font-medium"
                        />
                      </div>

                      <AnimatePresence>
                        {destSuggestions.length > 0 && (
                          <motion.ul
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            className="absolute z-40 bg-white border border-neutral-200 w-full mt-1.5 rounded-xl shadow-xl max-h-60 overflow-y-auto text-xs divide-y divide-neutral-100"
                          >
                            {destSuggestions.map((sug: any) => (
                              <li
                                key={sug.place_id}
                                onClick={() => {
                                  setDestInput(sug.display_name);
                                  setDestCoords({ lat: parseFloat(sug.lat), lon: parseFloat(sug.lon) });
                                  setDestSelected(true);
                                  setDestSuggestions([]);
                                }}
                                className="px-4 py-3 hover:bg-amber-50 cursor-pointer transition-colors text-left font-medium text-neutral-800"
                              >
                                {sug.display_name}
                              </li>
                            ))}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                {/* Navigation to Step 2 */}
                {pickupCoords && destCoords ? (
                  <div className="bg-white border border-neutral-200/80 p-6 rounded-3xl shadow-xl shadow-neutral-100 text-left space-y-4">
                    <div className="bg-emerald-500/5 border border-emerald-500/10 p-3.5 rounded-2xl flex items-center space-x-2.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span className="text-xs text-neutral-600 font-medium">Route locked! Fixed zone tariff successfully matched.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="w-full bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black py-4 rounded-2xl text-sm transition-all shadow-lg shadow-amber-500/10 flex items-center justify-center space-x-2 cursor-pointer uppercase font-mono tracking-wider"
                    >
                      <span>Select Private Ride</span>
                      <ArrowRight className="h-4.5 w-4.5" />
                    </button>
                  </div>
                ) : (
                  <div className="bg-white border border-neutral-200/80 p-6 rounded-3xl shadow-xl shadow-neutral-100 text-center space-y-3">
                    <Info className="h-5 w-5 text-amber-500 mx-auto" />
                    <h4 className="font-bold text-neutral-900 text-sm">Awaiting Locations</h4>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      Please enter your pickup point and final destination above to calculate path details.
                    </p>
                  </div>
                )}
              </div>

              {/* Interactive Route Mapping Frame */}
              <div className="lg:col-span-7">
                <div className="bg-white border border-neutral-200/80 p-5 rounded-3xl shadow-xl shadow-neutral-100 text-left space-y-4 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-neutral-900 text-sm flex items-center gap-1.5">
                      <Map className="h-4 w-4 text-amber-500" />
                      <span>Interactive Route Mapping</span>
                    </h4>
                    {loadingRoute && (
                      <span className="text-[10px] text-amber-600 font-mono animate-pulse">Calculating road geometry...</span>
                    )}
                  </div>

                  <div 
                    ref={mapContainerRef} 
                    id="taxi-map"
                    className="h-64 sm:h-[380px] w-full bg-neutral-100 rounded-2xl overflow-hidden shadow-inner border border-neutral-200 z-10"
                  />

                  {pickupCoords && destCoords && (
                    <div className="grid grid-cols-2 gap-4 bg-neutral-50 p-4 rounded-2xl border border-neutral-150">
                      <div className="space-y-0.5">
                        <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider font-mono">ESTIMATED ROAD DISTANCE</span>
                        <div className="text-xl font-black text-neutral-900 font-mono">
                          {distance ? `${distance} km` : 'Computing...'}
                        </div>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider font-mono">DRIVING DURATION</span>
                        <div className="text-xl font-black text-neutral-900 font-mono">
                          {formatDuration(duration)}
                        </div>
                      </div>
                      <div className="col-span-2 border-t border-neutral-200/60 pt-2.5 flex items-start gap-2">
                        <Info className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                        <span className="text-[10px] text-neutral-500 leading-relaxed font-medium">
                          These values are purely for information purposes. Tariffs are locked based on administrative zones (fixed zones) established by SawahJaya Trans, not accumulated by meters or GPS distance.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* SLIDE 2: VEHICLE SELECTION */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              transition={{ duration: 0.25 }}
              className="max-w-3xl mx-auto space-y-6"
            >
              <div className="bg-white border border-neutral-200/80 p-6 rounded-3xl shadow-xl shadow-neutral-100 text-left space-y-5">
                <div className="border-b border-neutral-100 pb-3 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] text-amber-600 font-bold uppercase tracking-widest font-mono">STEP 2 OF 3</span>
                    <h3 className="text-lg font-extrabold text-neutral-900 mt-0.5">Choose Private Chauffeur Ride</h3>
                  </div>
                  <span className="text-xs bg-amber-500/10 text-amber-700 font-bold px-3 py-1 rounded-full font-mono">
                    Fixed Zone Fare Guaranteed
                  </span>
                </div>

                {/* Selected route snippet */}
                <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-150 text-xs text-neutral-600 space-y-1">
                  <p className="font-semibold text-neutral-900 mb-1">Your Selected Journey:</p>
                  <p className="truncate"><strong className="text-neutral-500">From:</strong> {pickupInput}</p>
                  <p className="truncate"><strong className="text-neutral-500">To:</strong> {destInput}</p>
                </div>

                <div className="space-y-3.5">
                  {VEHICLES.map((car) => {
                    const isSelected = selectedVehicle.id === car.id;
                    const priceObj = getDynamicPriceForVehicle(car);

                    return (
                      <div
                        key={car.id}
                        onClick={() => setSelectedVehicle(car)}
                        className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-500 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500'
                            : 'bg-neutral-50 border-neutral-150 hover:bg-neutral-100'
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <img 
                            src={car.image} 
                            alt={car.name} 
                            className="w-20 h-14 object-cover rounded-xl bg-neutral-100 shrink-0 border border-neutral-200 shadow-sm"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <h4 className="font-bold text-base text-neutral-900 flex items-center gap-2">
                              <span>{car.name}</span>
                              {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>}
                            </h4>
                            <div className="flex items-center space-x-3 text-xs text-neutral-500 font-mono mt-1">
                              <span className="flex items-center space-x-1">
                                <Users className="h-3.5 w-3.5 text-amber-500" />
                                <span>{car.passengers} Max Passengers</span>
                              </span>
                              <span>·</span>
                              <span className="flex items-center space-x-1">
                                <Briefcase className="h-3.5 w-3.5 text-amber-500" />
                                <span>{car.luggage} Luggages</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-left sm:text-right pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-200/60 flex sm:flex-col justify-between items-center sm:items-end">
                          <span className="text-[8px] text-neutral-400 font-bold uppercase tracking-wider font-mono">ALL-IN TARIFF</span>
                          <span className="text-lg font-black text-amber-600 font-mono">
                            {formatPrice(priceObj.usd, priceObj.idr)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Back and Next navigation */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold py-3.5 rounded-2xl text-xs transition-all uppercase tracking-wider font-mono flex items-center justify-center space-x-1.5"
                  >
                    <span>Back to Route</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black py-3.5 rounded-2xl text-xs transition-all shadow-md shadow-amber-500/10 uppercase tracking-wider font-mono flex items-center justify-center space-x-1.5"
                  >
                    <span>Passenger Info</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* SLIDE 3: PASSENGER INFORMATION DETAILS */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              transition={{ duration: 0.25 }}
              className="max-w-xl mx-auto space-y-6"
            >
              <div className="bg-white border border-neutral-200/80 p-6 rounded-3xl shadow-xl shadow-neutral-100 text-left space-y-5">
                <div className="border-b border-neutral-100 pb-3">
                  <span className="text-[9px] text-amber-600 font-bold uppercase tracking-widest font-mono">STEP 3 OF 3</span>
                  <h3 className="text-base font-extrabold text-neutral-900 mt-0.5">Lead Passenger Information</h3>
                </div>

                <form onSubmit={handleConfirmBooking} className="space-y-4">
                  {/* Name */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider pl-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3.5 h-4 w-4 text-neutral-400" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Alex Carter"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="bg-neutral-50 border border-neutral-200 rounded-xl pl-10 pr-4 py-3 text-sm text-neutral-800 w-full focus:outline-none focus:border-amber-500 focus:bg-white transition-all placeholder-neutral-400 font-medium"
                      />
                    </div>
                  </div>

                  {/* Email & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider pl-1">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-neutral-400" />
                        <input
                          type="email"
                          required
                          placeholder="alex@gmail.com"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          className="bg-neutral-50 border border-neutral-200 rounded-xl pl-10 pr-4 py-3 text-xs text-neutral-800 w-full focus:outline-none focus:border-amber-500 focus:bg-white transition-all placeholder-neutral-400 font-medium"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider pl-1">WhatsApp Phone</label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-neutral-400" />
                        <input
                          type="tel"
                          required
                          placeholder="+62 812 345 678"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className="bg-neutral-50 border border-neutral-200 rounded-xl pl-10 pr-4 py-3 text-xs text-neutral-800 w-full focus:outline-none focus:border-amber-500 focus:bg-white transition-all placeholder-neutral-400 font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Travel Date & Departure Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider pl-1">Travel Date</label>
                      <div className="relative">
                        <Calendar className="absolute right-3.5 top-3.5 h-4 w-4 text-neutral-400 pointer-events-none" />
                        <input
                          type="date"
                          required
                          value={travelDate}
                          onChange={(e) => setTravelDate(e.target.value)}
                          className="bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-3 text-xs text-neutral-800 w-full focus:outline-none focus:border-amber-500 focus:bg-white transition-all font-semibold font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider pl-1">Departure Time</label>
                      <div className="relative">
                        <Clock className="absolute right-3.5 top-3.5 h-4 w-4 text-neutral-400 pointer-events-none" />
                        <input
                          type="time"
                          required
                          value={travelTime}
                          onChange={(e) => setTravelTime(e.target.value)}
                          className="bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-3 text-xs text-neutral-800 w-full focus:outline-none focus:border-amber-500 focus:bg-white transition-all font-semibold font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Flight Number */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider pl-1">Flight Number (Optional)</label>
                    <div className="relative">
                      <Plane className="absolute left-3.5 top-3.5 h-4 w-4 text-neutral-400" />
                      <input
                        type="text"
                        placeholder="e.g. GA-251"
                        value={flightNumber}
                        onChange={(e) => setFlightNumber(e.target.value)}
                        className="bg-neutral-50 border border-neutral-200 rounded-xl pl-10 pr-4 py-3 text-sm text-neutral-800 w-full focus:outline-none focus:border-amber-500 focus:bg-white transition-all placeholder-neutral-400 uppercase font-mono"
                      />
                    </div>
                  </div>

                  {/* Extra notes */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider pl-1">Special Instructions / Child Seat</label>
                    <textarea
                      rows={2}
                      placeholder="Specify child seat requirements, extra bags, hotel room details..."
                      value={extraNotes}
                      onChange={(e) => setExtraNotes(e.target.value)}
                      className="bg-neutral-50 border border-neutral-200 text-neutral-800 text-xs rounded-xl px-3 py-2.5 w-full focus:outline-none focus:border-amber-500 focus:bg-white transition-all placeholder-neutral-400 font-medium"
                    />
                  </div>

                  {/* Trip details summary */}
                  <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-[10px] text-amber-700 font-black uppercase tracking-wider font-mono">Matched Fixed Tariff</span>
                        <p className="text-xs text-neutral-500 font-semibold mt-0.5">{matchedRoute?.airport} ⇄ {matchedRoute?.city}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-neutral-400 block font-mono">ARMADA: {selectedVehicle.name}</span>
                        <strong className="text-base font-black text-amber-600 font-mono">
                          {formatPrice(currentPrice.usd, currentPrice.idr)}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Back and Confirm booking */}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold py-3.5 rounded-2xl text-xs transition-all uppercase tracking-wider font-mono flex items-center justify-center"
                    >
                      <span>Back to Vehicle</span>
                    </button>
                    <button
                      type="submit"
                      className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black py-3.5 rounded-2xl text-xs transition-all shadow-lg shadow-amber-500/15 flex items-center justify-center space-x-1.5 cursor-pointer uppercase font-mono tracking-wider"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      <span>Confirm Booking</span>
                    </button>
                  </div>

                  <p className="text-[9px] text-neutral-400 text-center font-medium leading-relaxed mt-2">
                    No prepayment required. Cash is accepted directly on arrival by your private chauffeur. Rescheduling or cancellation is 100% free.
                  </p>

                </form>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </section>

      {/* 4. SUCCESS DIALOG (BOOKED INLINE SUCCESS COMPONENT) */}
      <AnimatePresence>
        {bookingSuccess && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              id="taxi-success-card"
              className="bg-white border border-neutral-200 rounded-3xl w-full max-w-lg shadow-2xl z-10 flex flex-col p-6 text-left relative overflow-hidden"
            >
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-5">
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 bg-emerald-500/15 rounded-lg text-emerald-600">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-neutral-900 tracking-tight">Booking Confirmed!</h3>
                    <p className="text-[9px] text-emerald-600 uppercase tracking-widest font-mono font-bold">Safe Journey Guaranteed</p>
                  </div>
                </div>
                <button
                  onClick={() => setBookingSuccess(null)}
                  className="text-neutral-400 hover:text-neutral-600 bg-neutral-100 hover:bg-neutral-200 p-1.5 rounded-full transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="text-center py-2 space-y-1 bg-emerald-50 rounded-2xl">
                  <p className="text-xs text-neutral-500">Your Private Booking ID</p>
                  <strong className="text-lg font-black text-emerald-600 font-mono tracking-wider">{bookingSuccess.id}</strong>
                </div>

                <div className="border border-neutral-150 p-4 rounded-2xl bg-neutral-50 space-y-2.5 text-xs">
                  <div className="flex justify-between border-b border-neutral-200/60 pb-2">
                    <span className="text-neutral-400 font-medium">Passenger Name</span>
                    <span className="text-neutral-800 font-bold">{bookingSuccess.customerName}</span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-200/60 pb-2">
                    <span className="text-neutral-400 font-medium">WhatsApp Phone</span>
                    <span className="text-neutral-800 font-bold font-mono">{bookingSuccess.customerPhone}</span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-200/60 pb-2 flex-wrap gap-2">
                    <span className="text-neutral-400 font-medium">Route Selected</span>
                    <span className="text-neutral-800 font-bold font-mono max-w-xs truncate">{pickupInput} ➔ {destInput}</span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-200/60 pb-2">
                    <span className="text-neutral-400 font-medium">Travel Date &amp; Time</span>
                    <span className="text-neutral-800 font-bold font-mono">{travelDate} @ {travelTime}</span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-200/60 pb-2">
                    <span className="text-neutral-400 font-medium">Private Vehicle</span>
                    <span className="text-neutral-800 font-bold">{selectedVehicle.name}</span>
                  </div>
                  {flightNumber && (
                    <div className="flex justify-between border-b border-neutral-200/60 pb-2">
                      <span className="text-neutral-400 font-medium">Flight Track</span>
                      <span className="text-neutral-800 font-bold font-mono uppercase">{flightNumber}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-neutral-500 font-bold">Total Zone price</span>
                    <span className="text-base font-black text-amber-600 font-mono">
                      {formatPrice(bookingSuccess.totalPrice, bookingSuccess.totalPriceIDR)}
                    </span>
                  </div>
                </div>

                {paymentError && (
                  <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl font-bold">
                    {paymentError}
                  </div>
                )}

                {/* Confirm Options (ArtoPay vs WhatsApp) */}
                <div className="space-y-2.5 pt-2">
                  <button
                    onClick={handleWhatsAppConfirm}
                    className="w-full bg-[#25d366] hover:bg-[#20ba5a] text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm transition-colors cursor-pointer"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.451L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.488 2.01 14.016.985 11.41.985c-5.44 0-9.863 4.374-9.868 9.803-.001 1.764.475 3.483 1.381 5.017l-.986 3.6 3.693-.971zm12.188-6.933c-.273-.137-1.613-.797-1.863-.888-.25-.09-.432-.137-.613.137-.182.273-.705.888-.863 1.07-.159.182-.318.205-.59.069-.273-.137-1.15-.424-2.19-1.354-.809-.722-1.354-1.616-1.513-1.888-.159-.273-.017-.42.12-.556.123-.121.273-.318.41-.477.136-.159.182-.273.272-.455.09-.182.046-.341-.023-.477-.068-.137-.613-1.477-.84-2.023-.222-.534-.488-.46-.613-.466-.12-.005-.272-.006-.431-.006-.159 0-.41.06-.624.295-.214.234-.818.8-.818 1.95 0 1.15.836 2.26 1.018 2.51.182.25 1.644 2.51 3.985 3.52.557.24 1 .38 1.34.49.56.18 1.07.15 1.47.09.45-.07 1.4-.57 1.6-.1.2.47.2.88.1 1.01-.1.13-.13.18-.32.07z"/>
                    </svg>
                    <span>Instant WhatsApp Confirm</span>
                  </button>

                  <button
                    onClick={handlePayArtoPay}
                    disabled={paymentLoading}
                    className="w-full bg-neutral-900 hover:bg-neutral-950 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm transition-colors border border-white/10 disabled:opacity-50 cursor-pointer"
                  >
                    {paymentLoading ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    )}
                    <span>Pay Online Securely (ArtoPay)</span>
                  </button>
                </div>

                <div className="flex space-x-3 pt-3 border-t border-neutral-100">
                  <button
                    onClick={() => {
                      setBookingSuccess(null);
                      setPage('bookings');
                    }}
                    className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold py-2.5 rounded-xl text-xs text-center transition-colors"
                  >
                    Manage Bookings
                  </button>
                  <button
                    onClick={() => setBookingSuccess(null)}
                    className="flex-1 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold py-2.5 rounded-xl text-xs text-center transition-colors"
                  >
                    Book Another Taxi
                  </button>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <CustomerReviewsSection 
        serviceType="taxi" 
        serviceName="Taxi Service (Layanan Taksi Antar Kota)" 
      />
    </div>
  );
}
