#!/bin/sh
# Lumvero iOS-Bau fuer einen Mac (GitHub Actions oder eigener Mac).
# 1) Baut die App fuer den iPhone/iPad-Simulator, startet sie dort und macht Screenshots (Beweis: App laeuft).
# 2) Wenn App-Store-Connect-Schluessel gesetzt sind (ASC_KEY_ID, ASC_ISSUER_ID, ASC_KEY_P8, TEAM_ID):
#    signiert die App automatisch und laedt sie zu App Store Connect hoch (danach in TestFlight sichtbar).
#    Sonst: unsignierter Geraete-Build als Funktionsnachweis.
set -e
cd "$(dirname "$0")/App"
if [ -f Podfile ]; then pod install; SRC="-workspace App.xcworkspace"; else SRC="-project App.xcodeproj"; fi
OUT="$(pwd)/ci-out"
rm -rf "$OUT" build
mkdir -p "$OUT"
BUILD_NR="${BUILD_NR:-1}"

echo "== 1) Simulator-Build =="
xcodebuild $SRC -scheme App -configuration Debug -sdk iphonesimulator \
  -destination 'generic/platform=iOS Simulator' -derivedDataPath build/sim CODE_SIGNING_ALLOWED=NO build | tail -n 5
APP="build/sim/Build/Products/Debug-iphonesimulator/App.app"
BID=$(/usr/libexec/PlistBuddy -c 'Print CFBundleIdentifier' "$APP/Info.plist")
echo "Bundle-ID: $BID"

FAIL=0
for KIND in iPhone iPad; do
  UDID=$(xcrun simctl list devices available -j | python3 -c "
import json,sys
d=json.load(sys.stdin)['devices']
keys=sorted([k for k in d if 'iOS' in k], key=lambda k:[int(x) for x in k.split('iOS-')[1].split('-')])
for k in reversed(keys):
    for x in d[k]:
        if x['name'].startswith('$KIND'):
            print(x['udid']); sys.exit()")
  echo "== Starttest auf $KIND ($UDID) =="
  xcrun simctl boot "$UDID" 2>/dev/null || true
  xcrun simctl bootstatus "$UDID" -b > /dev/null
  xcrun simctl install "$UDID" "$APP"
  xcrun simctl launch "$UDID" "$BID"
  sleep 20
  xcrun simctl io "$UDID" screenshot "$OUT/$KIND-start.png"
  if xcrun simctl spawn "$UDID" launchctl list | grep -q "$BID"; then
    echo "OK: App laeuft auf $KIND"
  else
    echo "FEHLER: App laeuft auf $KIND nicht mehr (abgestuerzt?)"; FAIL=1
  fi
  xcrun simctl spawn "$UDID" log show --last 2m --style compact --predicate "process == \"App\"" > "$OUT/$KIND-log.txt" 2>/dev/null || true
  xcrun simctl shutdown "$UDID" || true
done
[ "$FAIL" = 0 ] || exit 1

if [ -n "$ASC_KEY_ID" ] && [ -n "$ASC_KEY_P8" ] && [ -n "$TEAM_ID" ]; then
  echo "== 2) Signieren und zu App Store Connect hochladen (Build $BUILD_NR) =="
  KEYDIR=$(mktemp -d)
  KEY="$KEYDIR/AuthKey_$ASC_KEY_ID.p8"
  # Schluessel robust neu zusammensetzen (Zeilenumbrueche gehen beim Speichern als Secret unter Windows leicht verloren)
  BODY=$(printf '%s' "$ASC_KEY_P8" | tr -d '\r\n ' | sed -e 's/-----BEGINPRIVATEKEY-----//' -e 's/-----ENDPRIVATEKEY-----//')
  { echo "-----BEGIN PRIVATE KEY-----"; echo "$BODY" | fold -w 64; echo "-----END PRIVATE KEY-----"; } > "$KEY"
  AUTH="-authenticationKeyPath $KEY -authenticationKeyID $ASC_KEY_ID -authenticationKeyIssuerID $ASC_ISSUER_ID"
  # Verteilungszertifikat in einen eigenen Schluesselbund, App-Store-Profil installieren
  KC="$KEYDIR/build.keychain-db"; KCPW=ci-temp
  security create-keychain -p "$KCPW" "$KC"
  security set-keychain-settings -lut 21600 "$KC"
  security unlock-keychain -p "$KCPW" "$KC"
  printf '%s' "$DIST_P12_B64" | base64 --decode > "$KEYDIR/dist.p12"
  security import "$KEYDIR/dist.p12" -k "$KC" -P "$DIST_P12_PASS" -T /usr/bin/codesign -T /usr/bin/security -T /usr/bin/productbuild
  security set-key-partition-list -S apple-tool:,apple:,codesign: -s -k "$KCPW" "$KC" > /dev/null
  security list-keychains -d user -s "$KC" $(security list-keychains -d user | tr -d '"')
  for D in "$HOME/Library/MobileDevice/Provisioning Profiles" "$HOME/Library/Developer/Xcode/UserData/Provisioning Profiles"; do
    mkdir -p "$D"; printf '%s' "$PROFILE_B64" | base64 --decode > "$D/$PROFILE_UUID.mobileprovision"
  done
  security find-identity -v -p codesigning "$KC"
  xcodebuild $SRC -scheme App -configuration Release -destination 'generic/platform=iOS' \
    -archivePath build/App.xcarchive DEVELOPMENT_TEAM="$TEAM_ID" CODE_SIGNING_ALLOWED=NO \
    CURRENT_PROJECT_VERSION="$BUILD_NR" archive | tail -n 5
  # Unsigniertes Archiv; signiert wird erst beim Export mit dem App-Store-Verteilungszertifikat
  # (das Team hat keine registrierten Geraete, daher kein Entwicklungsprofil moeglich).
  cat > build/export.plist <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>method</key><string>app-store-connect</string>
  <key>destination</key><string>upload</string>
  <key>teamID</key><string>$TEAM_ID</string>
  <key>signingStyle</key><string>manual</string>
  <key>signingCertificate</key><string>Apple Distribution</string>
  <key>provisioningProfiles</key><dict><key>$BID</key><string>$PROFILE_UUID</string></dict>
  <key>uploadSymbols</key><true/>
  <key>manageAppVersionAndBuildNumber</key><false/>
</dict></plist>
EOF
  xcodebuild -exportArchive -archivePath build/App.xcarchive -exportOptionsPlist build/export.plist \
    -exportPath "$OUT/export" $AUTH
  security delete-keychain "$KC" || true
  rm -rf "$KEYDIR"
  echo "HOCHGELADEN: Build $BUILD_NR ist in App Store Connect -> TestFlight (Verarbeitung dauert ca. 10-30 Min.)"
else
  echo "== 2) Kein App-Store-Schluessel gesetzt: unsignierter Geraete-Build als Nachweis =="
  xcodebuild $SRC -scheme App -configuration Release -sdk iphoneos -destination 'generic/platform=iOS' \
    -derivedDataPath build/dev CODE_SIGNING_ALLOWED=NO CODE_SIGNING_REQUIRED=NO CODE_SIGN_IDENTITY="" build | tail -n 5
  mkdir -p build/Payload
  cp -R build/dev/Build/Products/Release-iphoneos/App.app build/Payload/
  (cd build && zip -qr "$OUT/App-unsigniert.ipa" Payload)
  echo "Unsignierte IPA gebaut (zum Hochladen werden die App-Store-Schluessel gebraucht)."
fi
