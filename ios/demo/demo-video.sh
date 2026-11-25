#!/bin/sh
# Nimmt im iPhone-Simulator ein Bildschirmvideo der App auf (fuer die App-Pruefung).
# Baut die App fuer den Simulator, fuegt NUR in diese Simulator-Kopie den automatischen Rundgang (ios/demo/*.js) ein,
# startet die Aufnahme auf dem Home-Bildschirm, oeffnet die App und laesst den Rundgang DEMO_SECS Sekunden laufen.
# Der Store-Build bleibt unveraendert.
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/App"
if [ -f Podfile ]; then pod install; SRC="-workspace App.xcworkspace"; else SRC="-project App.xcodeproj"; fi
OUT="$(pwd)/demo-out"; rm -rf "$OUT" build/demo; mkdir -p "$OUT"
xcodebuild $SRC -scheme App -configuration Debug -sdk iphonesimulator \
  -destination 'generic/platform=iOS Simulator' -derivedDataPath build/demo CODE_SIGNING_ALLOWED=NO build | tail -n 3
APP="build/demo/Build/Products/Debug-iphonesimulator/App.app"
BID=$(/usr/libexec/PlistBuddy -c 'Print CFBundleIdentifier' "$APP/Info.plist")

UDID=$(xcrun simctl list devices available -j | python3 -c "
import json,sys
d=json.load(sys.stdin)['devices']
keys=sorted([k for k in d if 'iOS' in k], key=lambda k:[int(x) for x in k.split('iOS-')[1].split('-')])
for k in reversed(keys):
    devs=[x for x in d[k] if x['name'].startswith('iPhone')]
    pref=[x for x in devs if x['name'].endswith('Pro')] or devs
    if pref:
        print(pref[-1]['udid']); print(pref[-1]['name'], k, file=sys.stderr); sys.exit()")
echo "Geraet: $UDID"
xcrun simctl boot "$UDID" 2>/dev/null || true
xcrun simctl bootstatus "$UDID" -b > /dev/null
xcrun simctl status_bar "$UDID" override --time 9:41 --dataNetwork wifi --wifiMode active --wifiBars 3 --cellularMode active --cellularBars 4 --batteryState charged --batteryLevel 100 || true
# Vorstart ohne Rundgang (WebKit aufwaermen, sonst bleibt der erste Start im Simulator lange schwarz)
xcrun simctl install "$UDID" "$APP"
xcrun simctl launch "$UDID" "$BID"; sleep 40
xcrun simctl terminate "$UDID" "$BID" || true
# Rundgang nur in diese Simulator-Kopie einfuegen und neu installieren (App-Daten bleiben leer, da noch nichts bedient wurde)
cp "$ROOT/demo/demo-core.js" "$ROOT/demo/demo-$DEMO_APP.js" "$APP/public/"
find "$APP/public" -name '*.html' -exec perl -0pi -e "s#</body>#<script src=\"/demo-core.js\"></script><script src=\"/demo-$DEMO_APP.js\"></script></body>#" {} \;
grep -rl "demo-core.js" "$APP/public" --include='*.html' | wc -l
xcrun simctl install "$UDID" "$APP"
sleep 10
xcrun simctl io "$UDID" recordVideo --codec=h264 --force "$OUT/$DEMO_APP-demo.mp4" &
REC=$!
sleep 4
xcrun simctl launch "$UDID" "$BID"
sleep "${DEMO_SECS:-90}"
kill -INT $REC; wait $REC || true
xcrun simctl io "$UDID" screenshot "$OUT/$DEMO_APP-ende.png"
if xcrun simctl spawn "$UDID" launchctl list | grep -q "$BID"; then echo "OK: App lief bis zum Ende"; else echo "FEHLER: App laeuft nicht mehr"; exit 1; fi
ls -la "$OUT"
