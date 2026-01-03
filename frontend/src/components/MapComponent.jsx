import { useEffect, useRef, useState } from 'react';

function MapComponent({ buses = [], center, zoom = 14, onBusClick }) {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Default center: Mandeville, Jamaica
  const defaultCenter = { lat: 18.0426, lng: -77.5054 };
  const mapCenter = center || defaultCenter;

  useEffect(() => {
    // Load Google Maps script dynamically
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        setIsLoaded(true);
        return;
      }

      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        console.error('Google Maps API key not found');
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
      script.async = true;
      script.defer = true;
      script.onload = () => setIsLoaded(true);
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  useEffect(() => {
    if (!isLoaded || !mapRef.current || map) return;

    const newMap = new window.google.maps.Map(mapRef.current, {
      center: mapCenter,
      zoom: zoom,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ],
      mapTypeControl: false,
      streetViewControl: false,
    });

    setMap(newMap);
  }, [isLoaded, mapCenter, zoom]);

  useEffect(() => {
    if (!map || !window.google) return;

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));

    // Create new markers for each bus
    const newMarkers = buses
      .filter(bus => bus.current_location?.latitude && bus.current_location?.longitude)
      .map(bus => {
        const marker = new window.google.maps.Marker({
          position: {
            lat: bus.current_location.latitude,
            lng: bus.current_location.longitude
          },
          map: map,
          title: bus.registration_number,
          icon: {
            url: 'data:image/svg+xml,' + encodeURIComponent(`
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40">
                <circle cx="20" cy="20" r="18" fill="#2563eb" stroke="white" stroke-width="3"/>
                <text x="20" y="26" text-anchor="middle" fill="white" font-size="16">B</text>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(40, 40),
          }
        });

        // Add info window
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 8px;">
              <strong>${bus.registration_number}</strong><br/>
              ${bus.make || ''} ${bus.model || ''}<br/>
              <small>Last update: ${bus.current_location.updated_at
                ? new Date(bus.current_location.updated_at).toLocaleTimeString()
                : 'Unknown'}</small>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
          if (onBusClick) onBusClick(bus);
        });

        return marker;
      });

    setMarkers(newMarkers);

    // Center map on first bus if available
    if (newMarkers.length > 0 && buses[0]?.current_location) {
      map.panTo({
        lat: buses[0].current_location.latitude,
        lng: buses[0].current_location.longitude
      });
    }
  }, [map, buses]);

  if (!isLoaded) {
    return (
      <div className="map-loading">
        <div className="loading-spinner"></div>
        <p>Loading map...</p>
      </div>
    );
  }

  return <div ref={mapRef} className="map-view" />;
}

export default MapComponent;
