"""Fills in the HuntZone / Peekaboom App Store listing through the App Store Connect API.
Runs in GitHub Actions with the same Apple key the iPhone build uses. Never prints the key."""
import os, sys, time, json, hashlib, glob, jwt, requests

KEY, KID, ISS = os.environ["APP_STORE_CONNECT_PRIVATE_KEY"], os.environ["APP_STORE_CONNECT_KEY_IDENTIFIER"].strip(), os.environ["APP_STORE_CONNECT_ISSUER_ID"].strip()
BUNDLE = "io.github.sergioi1.zonehunt"
API = "https://api.appstoreconnect.apple.com"
ONLY = set(filter(None, os.environ.get("STEPS", "").split(",")))   # empty = every step

def token():
    now = int(time.time())
    return jwt.encode({"iss": ISS, "iat": now, "exp": now + 1100, "aud": "appstoreconnect-v1"}, KEY, algorithm="ES256", headers={"kid": KID, "typ": "JWT"})
S = requests.Session()
def call(method, path, body=None, ok=(200, 201, 204)):
    r = S.request(method, path if path.startswith("http") else API + path, json=body, headers={"Authorization": "Bearer " + token()})
    if r.status_code not in ok:
        print(f"  ! {method} {path.split('?')[0]} -> {r.status_code}: {r.text[:900]}")
        return None
    return r.json() if r.content else {}
def step(name):
    def deco(f):
        if ONLY and name not in ONLY: return f
        print(f"\n== {name}")
        try: f()
        except Exception as e: print(f"  ! {name} failed: {e!r}")
        return f
    return deco

app = call("GET", f"/v1/apps?filter[bundleId]={BUNDLE}")["data"][0]; APP = app["id"]
print("app", APP, app["attributes"]["name"])
infos = call("GET", f"/v1/apps/{APP}/appInfos")["data"]
info = next((i for i in infos if i["attributes"].get("appStoreState") in ("PREPARE_FOR_SUBMISSION", "DEVELOPER_REJECTED", "REJECTED") or i["attributes"].get("state") in ("PREPARE_FOR_SUBMISSION",)), infos[0])
INFO = info["id"]
vers = call("GET", f"/v1/apps/{APP}/appStoreVersions?filter[platform]=IOS")["data"]
ver = next(v for v in vers if v["attributes"]["appStoreState"] in ("PREPARE_FOR_SUBMISSION", "DEVELOPER_REJECTED", "REJECTED", "METADATA_REJECTED"))
VER = ver["id"]; print("version", ver["attributes"]["versionString"], ver["attributes"]["appStoreState"])

DESC = open(os.path.join(os.path.dirname(__file__), "description.txt")).read().strip()

@step("names")
def _():
    for loc in call("GET", f"/v1/appInfos/{INFO}/appInfoLocalizations")["data"]:
        r = call("PATCH", f"/v1/appInfoLocalizations/{loc['id']}", {"data": {"type": "appInfoLocalizations", "id": loc["id"], "attributes": {
            "name": "Peekaboom: Hide & Seek", "subtitle": "Real hide-and-seek on a map", "privacyPolicyUrl": "https://sergio-i1.github.io/zone-hhunt/privacy.html"}}})
        print("  ", loc["attributes"]["locale"], "ok" if r else "failed")

@step("category")
def _():
    r = call("PATCH", f"/v1/appInfos/{INFO}", {"data": {"type": "appInfos", "id": INFO, "relationships": {
        "primaryCategory": {"data": {"type": "appCategories", "id": "GAMES"}},
        "primarySubcategoryOne": {"data": {"type": "appCategories", "id": "GAMES_ACTION"}},
        "primarySubcategoryTwo": {"data": {"type": "appCategories", "id": "GAMES_FAMILY"}}}}})
    print("  ", "ok" if r else "failed")

YES = {"userGeneratedContent", "sharedLocation"}   # players can share a photo icon, and their location with their game
BOOL_Q = {"advertising", "ageAssurance", "datingAndRelationships", "gambling", "healthOrWellnessTopics", "lootBox", "messagingAndChat", "parentalControls",
          "sharedLocation", "socialMedia", "socialMediaAgeRestricted", "unrestrictedWebAccess", "userGeneratedContent"}
@step("agerating")
def _():
    d = call("GET", f"/v1/appInfos/{INFO}/ageRatingDeclaration")["data"]
    skip = {"kidsAgeBand", "ageRatingOverride", "ageRatingOverrideV2", "koreaAgeRatingOverride", "developerAgeRatingInfoUrl", "gracRatingClassificationNumber"}
    want = {k: (k in YES) if k in BOOL_Q else "NONE" for k in d["attributes"] if k not in skip}   # all answered at once, as Apple requires
    r = call("PATCH", f"/v1/ageRatingDeclarations/{d['id']}", {"data": {"type": "ageRatingDeclarations", "id": d["id"], "attributes": want}})
    print("   yes:", sorted(k for k, v in want.items() if v is True)); print("  ", "ok" if r else "failed")

@step("text")
def _():
    for loc in call("GET", f"/v1/appStoreVersions/{VER}/appStoreVersionLocalizations")["data"]:
        r = call("PATCH", f"/v1/appStoreVersionLocalizations/{loc['id']}", {"data": {"type": "appStoreVersionLocalizations", "id": loc["id"], "attributes": {
            "description": DESC,
            "keywords": "hide and seek,manhunt,tag,gps,outdoor,party,friends,freeze tag,sardines,seek,zone,game",
            "promotionalText": "Real hide-and-seek on a live map. No accounts, no ads, no subscriptions.",
            "supportUrl": "https://github.com/Sergio-I1/zone-hhunt/issues",
            "marketingUrl": "https://sergio-i1.github.io/zone-hhunt/"}}})
        print("  ", loc["attributes"]["locale"], "ok" if r else "failed")
    r = call("PATCH", f"/v1/appStoreVersions/{VER}", {"data": {"type": "appStoreVersions", "id": VER, "attributes": {"copyright": "2026 Sergio Ibarra"}}})
    print("   copyright", "ok" if r else "failed")
    r = call("PATCH", f"/v1/apps/{APP}", {"data": {"type": "apps", "id": APP, "attributes": {"contentRightsDeclaration": "USES_THIRD_PARTY_CONTENT"}}})
    print("   content rights (OpenStreetMap maps)", "ok" if r else "failed")

@step("build")
def _():
    want = os.environ.get("BUILD", "").strip()
    bs = call("GET", f"/v1/builds?filter[app]={APP}&sort=-uploadedDate&limit=10")["data"]
    for b in bs: print("   build", b["attributes"]["version"], b["attributes"]["processingState"])
    pick = next((b for b in bs if b["attributes"]["processingState"] == "VALID" and (not want or b["attributes"]["version"] == want)), None)
    if not pick: return print("   no ready build found")
    r = call("PATCH", f"/v1/appStoreVersions/{VER}/relationships/build", {"data": {"type": "builds", "id": pick["id"]}})
    print("   picked build", pick["attributes"]["version"], "ok" if r is not None else "failed")

@step("screenshots")
def _():
    files = sorted(glob.glob(os.path.join(os.path.dirname(__file__), "ios", "*.png")))
    for loc in call("GET", f"/v1/appStoreVersions/{VER}/appStoreVersionLocalizations")["data"]:
        sets = call("GET", f"/v1/appStoreVersionLocalizations/{loc['id']}/appScreenshotSets")["data"]
        st = next((x for x in sets if x["attributes"]["screenshotDisplayType"] == "APP_IPHONE_67"), None)
        if not st:
            st = call("POST", "/v1/appScreenshotSets", {"data": {"type": "appScreenshotSets", "attributes": {"screenshotDisplayType": "APP_IPHONE_67"},
                "relationships": {"appStoreVersionLocalization": {"data": {"type": "appStoreVersionLocalizations", "id": loc["id"]}}}}})["data"]
        for old in call("GET", f"/v1/appScreenshotSets/{st['id']}/appScreenshots")["data"]:
            call("DELETE", f"/v1/appScreenshots/{old['id']}")
        for f in files:
            blob = open(f, "rb").read()
            sh = call("POST", "/v1/appScreenshots", {"data": {"type": "appScreenshots", "attributes": {"fileName": os.path.basename(f), "fileSize": len(blob)},
                "relationships": {"appScreenshotSet": {"data": {"type": "appScreenshotSets", "id": st["id"]}}}}})["data"]
            for op in sh["attributes"]["uploadOperations"]:
                part = blob[op["offset"]:op["offset"] + op["length"]]
                requests.request(op["method"], op["url"], data=part, headers={h["name"]: h["value"] for h in op["requestHeaders"]}).raise_for_status()
            r = call("PATCH", f"/v1/appScreenshots/{sh['id']}", {"data": {"type": "appScreenshots", "id": sh["id"], "attributes": {"uploaded": True, "sourceFileChecksum": hashlib.md5(blob).hexdigest()}}})
            print("  ", loc["attributes"]["locale"], os.path.basename(f), "ok" if r else "failed")

@step("price")
def _():
    pts = call("GET", f"/v1/apps/{APP}/appPricePoints?filter[territory]=USA&limit=200")["data"]
    free = next(p for p in pts if float(p["attributes"]["customerPrice"]) == 0)
    r = call("POST", "/v1/appPriceSchedules", {"data": {"type": "appPriceSchedules", "relationships": {
        "app": {"data": {"type": "apps", "id": APP}}, "baseTerritory": {"data": {"type": "territories", "id": "USA"}},
        "manualPrices": {"data": [{"type": "appPrices", "id": "${p0}"}]}}},
        "included": [{"type": "appPrices", "id": "${p0}", "attributes": {"startDate": None}, "relationships": {"appPricePoint": {"data": {"type": "appPricePoints", "id": free["id"]}}}}]})
    print("   free price", "ok" if r else "failed")

EU = "AUT BEL BGR HRV CYP CZE DNK EST FIN FRA DEU GRC HUN IRL ITA LVA LTU LUX MLT NLD POL PRT ROU SVK SVN ESP SWE".split()
SKIP = set(EU + ["CHN"])     # EU needs a public trader address; China needs extra filings
@step("availability")
def _():
    terr = []; url = "/v1/territories?limit=200"
    while url:
        j = call("GET", url); terr += [t["id"] for t in j["data"]]; url = j.get("links", {}).get("next")
    data, inc = [], []
    for i, t in enumerate(terr):
        lid = "${t%d}" % i
        data.append({"type": "territoryAvailabilities", "id": lid})
        inc.append({"type": "territoryAvailabilities", "id": lid, "attributes": {"available": t not in SKIP, "releaseDate": None, "preOrderEnabled": False},
                    "relationships": {"territory": {"data": {"type": "territories", "id": t}}}})
    r = call("POST", "/v2/appAvailabilities", {"data": {"type": "appAvailabilities", "attributes": {"availableInNewTerritories": False},
        "relationships": {"app": {"data": {"type": "apps", "id": APP}}, "territoryAvailabilities": {"data": data}}}, "included": inc}, ok=(200, 201, 204, 409))
    print("   territories:", len(terr), "available:", len([t for t in terr if t not in SKIP]), "ok" if r is not None else "failed")

@step("expire101")
def _():
    if "expire101" not in ONLY: return print("   skipped (only runs when asked by name)")
    bs = call("GET", f"/v1/builds?filter[app]={APP}&filter[preReleaseVersion.version]=1.0.1&limit=50")["data"]
    for b in bs:
        if b["attributes"].get("expired"): print("   build", b["attributes"]["version"], "already expired"); continue
        r = call("PATCH", f"/v1/builds/{b['id']}", {"data": {"type": "builds", "id": b["id"], "attributes": {"expired": True}}})
        print("   expired 1.0.1 build", b["attributes"]["version"], "ok" if r is not None else "failed")

print("\nDone.")
