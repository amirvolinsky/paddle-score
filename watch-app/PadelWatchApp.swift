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
        print("Watch session activated: \(activationState.rawValue)")
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
