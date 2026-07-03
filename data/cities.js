// ============================================================
// ball.town city configuration
// Add a new city by adding an entry here and creating
// city/<slug>.html (copy minneapolis.html and change data-city).
//
// sportPath = ESPN API path: <sport>/<league>
// match     = name fragment used to find the team's ESPN id
//             (or set teamId directly if you know it)
// colors    = [primary, secondary] used for the card header
// ============================================================

window.BALLTOWN = {
  cities: {
    "minneapolis": {
      name: "Minneapolis–St. Paul",
      shortName: "Minneapolis",
      tz: "America/Chicago",
      tzLabel: "CT",
      teams: [
        {
          key: "twins",
          name: "Minnesota Twins",
          leagueLabel: "MLB · Baseball",
          sportPath: "baseball/mlb",
          match: "Minnesota Twins",
          venue: "Target Field, Minneapolis",
          colors: ["#002B5C", "#D31145"]
        },
        {
          key: "lynx",
          name: "Minnesota Lynx",
          leagueLabel: "WNBA · Basketball",
          sportPath: "basketball/wnba",
          match: "Minnesota Lynx",
          venue: "Target Center, Minneapolis",
          colors: ["#0C2340", "#78BE20"]
        },
        {
          key: "vikings",
          name: "Minnesota Vikings",
          leagueLabel: "NFL · Football",
          sportPath: "football/nfl",
          match: "Minnesota Vikings",
          venue: "U.S. Bank Stadium, Minneapolis",
          colors: ["#4F2683", "#FFC62F"]
        },
        {
          key: "loons",
          name: "Minnesota United FC",
          leagueLabel: "MLS · Soccer",
          sportPath: "soccer/usa.1",
          match: "Minnesota United",
          venue: "Allianz Field, St. Paul",
          colors: ["#585958", "#8CD2F4"]
        },
        {
          key: "wolves",
          name: "Minnesota Timberwolves",
          leagueLabel: "NBA · Basketball",
          sportPath: "basketball/nba",
          match: "Minnesota Timberwolves",
          venue: "Target Center, Minneapolis",
          colors: ["#236192", "#78BE20"]
        },
        {
          key: "wild",
          name: "Minnesota Wild",
          leagueLabel: "NHL · Hockey",
          sportPath: "hockey/nhl",
          match: "Minnesota Wild",
          venue: "Xcel Energy Center, St. Paul",
          colors: ["#154734", "#DDCBA4"]
        }
      ]
    }
  }
};
