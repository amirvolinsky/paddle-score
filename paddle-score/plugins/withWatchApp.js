const { withXcodeProject, withInfoPlist, IOSConfig } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

function withWatchApp(config) {
  config = withInfoPlist(config, (config) => {
    // Ensure WCSession support is declared
    if (!config.modResults.WKCompanionAppBundleIdentifier) {
      // This is set on the watch side; on the phone side we just need watch connectivity
    }
    return config;
  });

  config = withXcodeProject(config, async (config) => {
    const xcodeProject = config.modResults;
    const projectRoot = config.modRequest.projectRoot;
    const bundleId = config.ios?.bundleIdentifier || 'com.paddle.scorekeeper';
    const watchBundleId = `${bundleId}.watchkitapp`;
    const projectName = config.modRequest.projectName || 'paddlescore';

    const watchAppDir = path.join(projectRoot, 'ios', 'PadelWatch');

    if (!fs.existsSync(watchAppDir)) {
      fs.mkdirSync(watchAppDir, { recursive: true });
    }

    // Write SwiftUI app entry point
    const watchAppSwift = `
import SwiftUI
import WatchConnectivity

@main
struct PadelWatchApp: App {
    @StateObject private var scoreModel = ScoreModel()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(scoreModel)
        }
    }
}

class ScoreModel: NSObject, ObservableObject, WCSessionDelegate {
    @Published var teamA: String = "0"
    @Published var teamB: String = "0"
    @Published var gamesA: Int = 0
    @Published var gamesB: Int = 0
    @Published var setsA: Int = 0
    @Published var setsB: Int = 0
    @Published var displayScore: String = "0 - 0"
    @Published var matchOver: Bool = false
    
    override init() {
        super.init()
        if WCSession.isSupported() {
            let session = WCSession.default
            session.delegate = self
            session.activate()
        }
    }
    
    func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {
        print("Watch session activated: \\(activationState.rawValue)")
    }
    
    func session(_ session: WCSession, didReceiveApplicationContext applicationContext: [String : Any]) {
        DispatchQueue.main.async {
            self.teamA = applicationContext["teamA"] as? String ?? "0"
            self.teamB = applicationContext["teamB"] as? String ?? "0"
            self.gamesA = applicationContext["gamesA"] as? Int ?? 0
            self.gamesB = applicationContext["gamesB"] as? Int ?? 0
            self.setsA = applicationContext["setsA"] as? Int ?? 0
            self.setsB = applicationContext["setsB"] as? Int ?? 0
            self.displayScore = applicationContext["displayScore"] as? String ?? "0 - 0"
            self.matchOver = applicationContext["matchOver"] as? Bool ?? false
        }
    }
    
    func sendAction(_ action: String) {
        guard WCSession.default.isReachable else { return }
        WCSession.default.sendMessage(["action": action], replyHandler: nil)
    }
}
`;

    const contentViewSwift = `
import SwiftUI

struct ContentView: View {
    @EnvironmentObject var scoreModel: ScoreModel
    
    var body: some View {
        VStack(spacing: 8) {
            Text("PADEL")
                .font(.system(size: 14, weight: .black))
                .foregroundColor(.yellow)
                .tracking(3)
            
            HStack {
                VStack(spacing: 2) {
                    Text("\\(scoreModel.setsA)")
                        .font(.system(size: 20, weight: .black))
                        .foregroundColor(.yellow)
                    Text("\\(scoreModel.gamesA)")
                        .font(.system(size: 14, weight: .bold))
                        .foregroundColor(.white)
                }
                
                Text(":")
                    .font(.system(size: 20, weight: .black))
                    .foregroundColor(.gray)
                
                VStack(spacing: 2) {
                    Text("\\(scoreModel.setsB)")
                        .font(.system(size: 20, weight: .black))
                        .foregroundColor(.yellow)
                    Text("\\(scoreModel.gamesB)")
                        .font(.system(size: 14, weight: .bold))
                        .foregroundColor(.white)
                }
            }
            
            HStack(spacing: 4) {
                Text(scoreModel.teamA)
                    .font(.system(size: 32, weight: .black))
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                
                Text(":")
                    .font(.system(size: 24, weight: .black))
                    .foregroundColor(.yellow)
                
                Text(scoreModel.teamB)
                    .font(.system(size: 32, weight: .black))
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
            }
            .padding(.vertical, 4)
            
            if scoreModel.matchOver {
                Text("MATCH OVER")
                    .font(.system(size: 12, weight: .black))
                    .foregroundColor(.red)
            } else {
                HStack(spacing: 8) {
                    Button(action: {
                        scoreModel.sendAction("pointA")
                    }) {
                        Text("+A")
                            .font(.system(size: 16, weight: .black))
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 10)
                            .background(Color.blue)
                            .cornerRadius(10)
                    }
                    .buttonStyle(.plain)
                    
                    Button(action: {
                        scoreModel.sendAction("pointB")
                    }) {
                        Text("+B")
                            .font(.system(size: 16, weight: .black))
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 10)
                            .background(Color.red)
                            .cornerRadius(10)
                    }
                    .buttonStyle(.plain)
                }
            }
        }
        .padding(.horizontal, 4)
    }
}
`;

    const infoPlist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>en</string>
    <key>CFBundleDisplayName</key>
    <string>Padel Score</string>
    <key>CFBundleExecutable</key>
    <string>$(EXECUTABLE_NAME)</string>
    <key>CFBundleIdentifier</key>
    <string>${watchBundleId}</string>
    <key>CFBundleName</key>
    <string>PadelWatch</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0</string>
    <key>CFBundleVersion</key>
    <string>1</string>
    <key>WKApplication</key>
    <true/>
    <key>WKCompanionAppBundleIdentifier</key>
    <string>${bundleId}</string>
</dict>
</plist>`;

    const assetContents = `{
  "info": {
    "version": 1,
    "author": "xcode"
  }
}`;

    const appIconContents = `{
  "images": [],
  "info": {
    "version": 1,
    "author": "xcode"
  }
}`;

    // Write all watch app source files
    fs.writeFileSync(path.join(watchAppDir, 'PadelWatchApp.swift'), watchAppSwift);
    fs.writeFileSync(path.join(watchAppDir, 'ContentView.swift'), contentViewSwift);
    fs.writeFileSync(path.join(watchAppDir, 'Info.plist'), infoPlist);

    const assetsDir = path.join(watchAppDir, 'Assets.xcassets');
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
    }
    fs.writeFileSync(path.join(assetsDir, 'Contents.json'), assetContents);

    const appIconDir = path.join(assetsDir, 'AppIcon.appiconset');
    if (!fs.existsSync(appIconDir)) {
      fs.mkdirSync(appIconDir, { recursive: true });
    }
    fs.writeFileSync(path.join(appIconDir, 'Contents.json'), appIconContents);

    // Add Watch target to Xcode project
    const watchTargetName = 'PadelWatch';

    // Create a native target for the watch app
    const watchTarget = xcodeProject.addTarget(
      watchTargetName,
      'watch2_app',
      watchTargetName,
      watchBundleId
    );

    if (watchTarget) {
      // Add source files to the watch target
      const watchGroup = xcodeProject.addPbxGroup(
        ['PadelWatchApp.swift', 'ContentView.swift', 'Info.plist', 'Assets.xcassets'],
        watchTargetName,
        'PadelWatch'
      );

      // Add the watch group to the main project group
      const mainGroup = xcodeProject.getFirstProject().firstProject.mainGroup;
      xcodeProject.addToPbxGroup(watchGroup.uuid, mainGroup);

      // Add source build phase
      const sourcesBuildPhase = xcodeProject.addBuildPhase(
        ['PadelWatchApp.swift', 'ContentView.swift'],
        'PBXSourcesBuildPhase',
        'Sources',
        watchTarget.uuid
      );

      // Add resources build phase
      const resourcesBuildPhase = xcodeProject.addBuildPhase(
        ['Assets.xcassets'],
        'PBXResourcesBuildPhase',
        'Resources',
        watchTarget.uuid
      );

      // Set build settings for the watch target
      const watchBuildConfigs = xcodeProject.pbxXCBuildConfigurationSection();
      for (const key in watchBuildConfigs) {
        const config = watchBuildConfigs[key];
        if (config.buildSettings && config.name && config.baseConfigurationReference === undefined) {
          // Check if this config belongs to the watch target
          if (config.buildSettings.PRODUCT_BUNDLE_IDENTIFIER === watchBundleId ||
              (config.buildSettings.PRODUCT_NAME && config.buildSettings.PRODUCT_NAME.includes(watchTargetName))) {
            config.buildSettings.SDKROOT = 'watchos';
            config.buildSettings.TARGETED_DEVICE_FAMILY = '4';
            config.buildSettings.WATCHOS_DEPLOYMENT_TARGET = '9.0';
            config.buildSettings.SWIFT_VERSION = '5.0';
            config.buildSettings.PRODUCT_BUNDLE_IDENTIFIER = watchBundleId;
            config.buildSettings.INFOPLIST_FILE = 'PadelWatch/Info.plist';
            config.buildSettings.ASSETCATALOG_COMPILER_APPICON_NAME = 'AppIcon';
            config.buildSettings.SUPPORTS_MACCATALYST = 'NO';
            config.buildSettings.CODE_SIGN_STYLE = 'Automatic';
          }
        }
      }

      // Add watch app as dependency of the main target
      const mainTarget = xcodeProject.getFirstTarget();
      if (mainTarget) {
        xcodeProject.addTargetDependency(mainTarget.firstTarget.uuid, [watchTarget.uuid]);

        // Embed watch app in the main target
        xcodeProject.addBuildPhase(
          [`${watchTargetName}.app`],
          'PBXCopyFilesBuildPhase',
          'Embed Watch Content',
          mainTarget.firstTarget.uuid,
          'watch_app'
        );
      }
    }

    return config;
  });

  return config;
}

module.exports = withWatchApp;
