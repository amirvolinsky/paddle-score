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
                    Text("\(scoreModel.setsA)")
                        .font(.system(size: 20, weight: .black))
                        .foregroundColor(.yellow)
                    Text("\(scoreModel.gamesA)")
                        .font(.system(size: 14, weight: .bold))
                        .foregroundColor(.white)
                }
                
                Text(":")
                    .font(.system(size: 20, weight: .black))
                    .foregroundColor(.gray)
                
                VStack(spacing: 2) {
                    Text("\(scoreModel.setsB)")
                        .font(.system(size: 20, weight: .black))
                        .foregroundColor(.yellow)
                    Text("\(scoreModel.gamesB)")
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
