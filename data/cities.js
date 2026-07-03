// ============================================================
// ball.town city configuration
// Add a new city by adding an entry here and creating
// city/<slug>.html (copy an existing page and change data-city).
//
// abbr      = 3-letter city code shown in the sticky mobile header and
//             the installable-app name ("ball.town <abbr>")
// sportPath = ESPN API path: <sport>/<league>
// teamId    = the team's ESPN id (preferred — avoids a slow
//             per-team league scan on first load)
// match     = name fragment used to find the team's ESPN id when
//             teamId isn't set
// short     = nickname used in the filter chips and up-next strip
// colors    = [primary, secondary] used for the card header
// ============================================================

window.BALLTOWN = {
  cities: {
    "minneapolis": {
      name: "Minneapolis–St. Paul",
      shortName: "Minneapolis",
      abbr: "MSP",
      tz: "America/Chicago",
      tzLabel: "CT",
      teams: [
        {
          key: "twins",
          name: "Minnesota Twins",
          short: "Twins",
          leagueLabel: "MLB · Baseball",
          sportPath: "baseball/mlb",
          teamId: "9",
          match: "Minnesota Twins",
          venue: "Target Field, Minneapolis",
          colors: ["#002B5C", "#D31145"]
        },
        {
          key: "lynx",
          name: "Minnesota Lynx",
          short: "Lynx",
          leagueLabel: "WNBA · Basketball",
          sportPath: "basketball/wnba",
          teamId: "8",
          match: "Minnesota Lynx",
          venue: "Target Center, Minneapolis",
          colors: ["#0C2340", "#78BE20"]
        },
        {
          key: "vikings",
          name: "Minnesota Vikings",
          short: "Vikings",
          leagueLabel: "NFL · Football",
          sportPath: "football/nfl",
          teamId: "16",
          match: "Minnesota Vikings",
          venue: "U.S. Bank Stadium, Minneapolis",
          colors: ["#4F2683", "#FFC62F"]
        },
        {
          key: "loons",
          name: "Minnesota United FC",
          short: "United",
          leagueLabel: "MLS · Soccer",
          sportPath: "soccer/usa.1",
          teamId: "17362",
          match: "Minnesota United",
          venue: "Allianz Field, St. Paul",
          colors: ["#585958", "#8CD2F4"]
        },
        {
          key: "wolves",
          name: "Minnesota Timberwolves",
          short: "Timberwolves",
          leagueLabel: "NBA · Basketball",
          sportPath: "basketball/nba",
          teamId: "16",
          match: "Minnesota Timberwolves",
          venue: "Target Center, Minneapolis",
          colors: ["#236192", "#78BE20"]
        },
        {
          key: "wild",
          name: "Minnesota Wild",
          short: "Wild",
          leagueLabel: "NHL · Hockey",
          sportPath: "hockey/nhl",
          teamId: "30",
          match: "Minnesota Wild",
          venue: "Xcel Energy Center, St. Paul",
          colors: ["#154734", "#DDCBA4"]
        }
      ]
    },

    "los-angeles": {
      name: "Los Angeles",
      shortName: "Los Angeles",
      abbr: "LAX",
      tz: "America/Los_Angeles",
      tzLabel: "PT",
      teams: [
        {
          key: "dodgers",
          name: "Los Angeles Dodgers",
          short: "Dodgers",
          leagueLabel: "MLB · Baseball",
          sportPath: "baseball/mlb",
          teamId: "19",
          match: "Los Angeles Dodgers",
          venue: "Dodger Stadium, Los Angeles",
          colors: ["#005A9C", "#EF3E42"]
        },
        {
          key: "angels",
          name: "Los Angeles Angels",
          short: "Angels",
          leagueLabel: "MLB · Baseball",
          sportPath: "baseball/mlb",
          teamId: "3",
          match: "Los Angeles Angels",
          venue: "Angel Stadium, Anaheim",
          colors: ["#BA0021", "#003263"]
        },
        {
          key: "sparks",
          name: "Los Angeles Sparks",
          short: "Sparks",
          leagueLabel: "WNBA · Basketball",
          sportPath: "basketball/wnba",
          teamId: "6",
          match: "Los Angeles Sparks",
          venue: "Crypto.com Arena, Los Angeles",
          colors: ["#702F8A", "#FFC72C"]
        },
        {
          key: "rams",
          name: "Los Angeles Rams",
          short: "Rams",
          leagueLabel: "NFL · Football",
          sportPath: "football/nfl",
          teamId: "14",
          match: "Los Angeles Rams",
          venue: "SoFi Stadium, Inglewood",
          colors: ["#003594", "#FFA300"]
        },
        {
          key: "chargers",
          name: "Los Angeles Chargers",
          short: "Chargers",
          leagueLabel: "NFL · Football",
          sportPath: "football/nfl",
          teamId: "24",
          match: "Los Angeles Chargers",
          venue: "SoFi Stadium, Inglewood",
          colors: ["#0080C6", "#FFC20E"]
        },
        {
          key: "lafc",
          name: "LAFC",
          short: "LAFC",
          leagueLabel: "MLS · Soccer",
          sportPath: "soccer/usa.1",
          teamId: "18966",
          match: "LAFC",
          venue: "BMO Stadium, Los Angeles",
          colors: ["#000000", "#C39E6D"]
        },
        {
          key: "galaxy",
          name: "LA Galaxy",
          short: "Galaxy",
          leagueLabel: "MLS · Soccer",
          sportPath: "soccer/usa.1",
          teamId: "187",
          match: "LA Galaxy",
          venue: "Dignity Health Sports Park, Carson",
          colors: ["#00245D", "#FFD200"]
        },
        {
          key: "lakers",
          name: "Los Angeles Lakers",
          short: "Lakers",
          leagueLabel: "NBA · Basketball",
          sportPath: "basketball/nba",
          teamId: "13",
          match: "Los Angeles Lakers",
          venue: "Crypto.com Arena, Los Angeles",
          colors: ["#552583", "#FDB927"]
        },
        {
          key: "clippers",
          name: "LA Clippers",
          short: "Clippers",
          leagueLabel: "NBA · Basketball",
          sportPath: "basketball/nba",
          teamId: "12",
          match: "LA Clippers",
          venue: "Intuit Dome, Inglewood",
          colors: ["#C8102E", "#1D428A"]
        },
        {
          key: "kings",
          name: "Los Angeles Kings",
          short: "Kings",
          leagueLabel: "NHL · Hockey",
          sportPath: "hockey/nhl",
          teamId: "8",
          match: "Los Angeles Kings",
          venue: "Crypto.com Arena, Los Angeles",
          colors: ["#111111", "#A2AAAD"]
        },
        {
          key: "ducks",
          name: "Anaheim Ducks",
          short: "Ducks",
          leagueLabel: "NHL · Hockey",
          sportPath: "hockey/nhl",
          teamId: "25",
          match: "Anaheim Ducks",
          venue: "Honda Center, Anaheim",
          colors: ["#F47A38", "#B9975B"]
        }
      ]
    }
  }
};
