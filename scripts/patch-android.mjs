// Fills in what the Android project needs after `npx cap add android`:
// camera permission, version numbers, and release signing from GitHub secrets.
import { readFile, writeFile } from "node:fs/promises";

const manifestPath = "android/app/src/main/AndroidManifest.xml";
let manifest = await readFile(manifestPath, "utf8");
if (!manifest.includes("android.permission.CAMERA")) {
  manifest = manifest.replace("</manifest>", '    <uses-permission android:name="android.permission.CAMERA" />\n</manifest>');
}
await writeFile(manifestPath, manifest);

const gradlePath = "android/app/build.gradle";
let gradle = await readFile(gradlePath, "utf8");
const build = Number(process.env.BUILD_NUMBER || 1);
gradle = gradle.replace(/versionCode \d+/, "versionCode " + build).replace(/versionName "[^"]*"/, 'versionName "3.0.' + build + '"');
if (!gradle.includes("signingConfigs {")) {
  gradle = gradle.replace(/buildTypes \{/, `signingConfigs {
        release {
            if (System.getenv("ANDROID_KEYSTORE_PATH")) {
                storeFile file(System.getenv("ANDROID_KEYSTORE_PATH"))
                storePassword System.getenv("ANDROID_KEYSTORE_PASSWORD")
                keyAlias System.getenv("ANDROID_KEY_ALIAS")
                keyPassword System.getenv("ANDROID_KEY_PASSWORD")
            }
        }
    }
    buildTypes {`);
  gradle = gradle.replace(/release \{\n(\s+)minifyEnabled/, (m, sp) => 'release {\n' + sp + 'if (System.getenv("ANDROID_KEYSTORE_PATH")) signingConfig signingConfigs.release\n' + sp + 'minifyEnabled');
}
await writeFile(gradlePath, gradle);
console.log("Android project patched (build " + build + ")");
