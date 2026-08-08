import { useEffect, useMemo, useState } from "react";
import Constants from "expo-constants";
import { StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import { colors } from "../lib/theme";

export interface MobileMapItem {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  visitOrder: number;
  color: string;
}

export interface MobileRoutePath {
  coordinates: [number, number][];
  color: string;
}

const FALLBACK_STYLE = "https://tiles.openfreemap.org/styles/liberty";

function buildMapHtml({
  items,
  routePath,
  mapKey,
}: {
  items: MobileMapItem[];
  routePath: MobileRoutePath | null;
  mapKey: string;
}) {
  const styleUrl = mapKey
    ? `https://tiles.goong.io/assets/goong_map_web.json?api_key=${encodeURIComponent(mapKey)}`
    : FALLBACK_STYLE;

  const payload = JSON.stringify({
    items,
    routePath,
    styleUrl,
    fallbackStyle: FALLBACK_STYLE,
  }).replace(/</g, "\\u003c");

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no" />
  <link href="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css" rel="stylesheet" />
  <style>
    html, body, #map { height: 100%; width: 100%; margin: 0; background: #FFF9F2; overflow: hidden; }
    body { position: relative; }
    #status {
      position: absolute;
      inset: 0;
      z-index: 5;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      color: #8A7563;
      background: #FFF9F2;
      text-align: center;
      font: 800 13px/1.45 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    body.map-ready #status { display: none; }
    .marker {
      width: 30px;
      height: 30px;
      border-radius: 999px;
      border: 2px solid white;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font: 900 13px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      box-shadow: 0 8px 18px rgba(43,33,24,.24);
    }
    .maplibregl-ctrl-attrib { font-size: 9px; }
  </style>
</head>
<body>
  <div id="map"></div>
  <div id="status">Đang tải bản đồ...</div>
  <script>
    function markMapReady() {
      document.body.classList.add("map-ready");
    }
    function markMapError(message) {
      const status = document.getElementById("status");
      if (status) status.textContent = message || "Không tải được bản đồ.";
      document.body.classList.remove("map-ready");
    }
  </script>
  <script src="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js" onerror="markMapError('Không tải được thư viện bản đồ. Kiểm tra kết nối mạng.')"></script>
  <script>
    const payload = ${payload};
    if (!window.maplibregl) {
      markMapError("Không tải được thư viện bản đồ. Kiểm tra kết nối mạng.");
    } else {
      const map = new maplibregl.Map({
        container: "map",
        style: payload.styleUrl,
        center: [106.7, 10.78],
        zoom: 5,
        attributionControl: { compact: true }
      });

      let switched = false;
      map.on("error", function () {
        if (!switched && payload.styleUrl !== payload.fallbackStyle) {
          switched = true;
          map.setStyle(payload.fallbackStyle);
          return;
        }
        if (switched || payload.styleUrl === payload.fallbackStyle) {
          markMapError("Không tải được tile bản đồ. Kiểm tra kết nối mạng hoặc Goong key.");
        }
      });

      function addRoute() {
        if (!payload.routePath || !payload.routePath.coordinates || payload.routePath.coordinates.length < 2) return;
        if (!map.getSource("route")) {
          map.addSource("route", {
            type: "geojson",
            data: {
              type: "Feature",
              properties: {},
              geometry: { type: "LineString", coordinates: payload.routePath.coordinates }
            }
          });
        }
        if (!map.getLayer("route-casing")) {
          map.addLayer({
            id: "route-casing",
            type: "line",
            source: "route",
            layout: { "line-cap": "round", "line-join": "round" },
            paint: { "line-color": "#ffffff", "line-width": 7, "line-opacity": 0.9 }
          });
        }
        if (!map.getLayer("route-line")) {
          map.addLayer({
            id: "route-line",
            type: "line",
            source: "route",
            layout: { "line-cap": "round", "line-join": "round" },
            paint: { "line-color": payload.routePath.color || "#FF6B2C", "line-width": 4 }
          });
        }
      }

      function addMarkers() {
        const bounds = new maplibregl.LngLatBounds();
        for (const item of payload.items) {
          const el = document.createElement("button");
          el.className = "marker";
          el.type = "button";
          el.textContent = String(item.visitOrder);
          el.title = item.name;
          el.style.background = item.color;
          el.onclick = function () {
            window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ type: "marker", id: item.id }));
          };
          new maplibregl.Marker({ element: el }).setLngLat([item.longitude, item.latitude]).addTo(map);
          bounds.extend([item.longitude, item.latitude]);
        }
        if (payload.routePath && payload.routePath.coordinates) {
          for (const point of payload.routePath.coordinates) bounds.extend(point);
        }
        if (!bounds.isEmpty()) map.fitBounds(bounds, { padding: 48, maxZoom: 14, duration: 0 });
      }

      map.on("load", function () {
        addRoute();
        addMarkers();
        markMapReady();
      });
      map.on("style.load", addRoute);
      map.once("idle", markMapReady);
      window.setTimeout(function () {
        if (!document.body.classList.contains("map-ready")) markMapError("Bản đồ tải chậm. Kiểm tra mạng hoặc Goong key.");
      }, 12000);
    }
  </script>
</body>
</html>`;
}

export function TripMapWebView({
  items,
  routePath,
  onMarkerPress,
}: {
  items: MobileMapItem[];
  routePath: MobileRoutePath | null;
  onMarkerPress?: (id: string) => void;
}) {
  const mapKey = String(Constants.expoConfig?.extra?.goongMapKey ?? "");
  const html = useMemo(() => buildMapHtml({ items, routePath, mapKey }), [items, routePath, mapKey]);
  const [webViewError, setWebViewError] = useState("");

  useEffect(() => {
    setWebViewError("");
  }, [html]);

  if (items.length === 0) {
    return (
      <View style={styles.emptyMap}>
        <Text style={styles.emptyTitle}>Chưa có tọa độ để hiện map</Text>
        <Text style={styles.emptyBody}>Thêm địa điểm từ Goong hoặc import booking có tọa độ.</Text>
      </View>
    );
  }

  return (
    <View style={styles.frame}>
      <WebView
        originWhitelist={["*"]}
        source={{ html }}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        allowsInlineMediaPlayback
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loadingOverlay}>
            <Text style={styles.loadingText}>Đang tải bản đồ...</Text>
          </View>
        )}
        renderError={() => (
          <View style={styles.loadingOverlay}>
            <Text style={styles.loadingText}>{webViewError || "Không mở được bản đồ trong app."}</Text>
          </View>
        )}
        onError={(event) => {
          setWebViewError(event.nativeEvent.description || "Không mở được bản đồ trong app.");
        }}
        onMessage={(event) => {
          try {
            const message = JSON.parse(event.nativeEvent.data) as { type?: string; id?: string };
            if (message.type === "marker" && message.id) onMarkerPress?.(message.id);
          } catch {
            // Ignore malformed WebView messages.
          }
        }}
        style={styles.webview}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    height: 260,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: "hidden",
    marginBottom: 14,
  },
  webview: { flex: 1, backgroundColor: colors.surfaceSoft },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceSoft,
    padding: 18,
  },
  loadingText: { color: colors.muted, fontSize: 13, fontWeight: "800", textAlign: "center", lineHeight: 19 },
  emptyMap: {
    minHeight: 150,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
    marginBottom: 14,
  },
  emptyTitle: { color: colors.text, fontSize: 15, fontWeight: "900", textAlign: "center" },
  emptyBody: { color: colors.muted, fontSize: 12, fontWeight: "700", textAlign: "center", lineHeight: 18, marginTop: 6 },
});
