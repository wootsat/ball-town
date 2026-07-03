// ============================================================
// ball.town city configuration — the single source of truth.
//
// This is the ONLY file you edit to add a city. After editing, run
//   node tools/build.mjs   (or: npm run build)
// to regenerate city/<slug>.html + city/<slug>.webmanifest and the
// index.html city cards from tools/city.template.html.
//
// abbr       = 3-letter city code shown in the sticky mobile header and
//              the installable-app name ("ball.town <abbr>")
// tagline    = optional header blurb (HTML ok); default is generated
// stripLabel = optional "Up next" heading; default "Up next in <shortName>"
// sportPath  = ESPN API path: <sport>/<league>
// teamId     = the team's ESPN id (preferred — avoids a slow
//              per-team league scan on first load)
// match      = name fragment used to find the team's ESPN id when
//              teamId isn't set
// short      = nickname used in the filter chips and up-next strip
// colors     = [primary, secondary] used for the card header
// ============================================================

(function (root, factory) {
  var data = factory();
  // Node (tools/build.mjs) reads it as a module; the browser reads the
  // <script> tag and gets window.BALLTOWN.
  if (typeof module !== "undefined" && module.exports) module.exports = data;
  if (typeof window !== "undefined") window.BALLTOWN = data;
})(this, function () {
  return {
  cities: {
    "minneapolis": {
      name: "Minneapolis–St. Paul",
      shortName: "Minneapolis",
      abbr: "MSP",
      tagline: "<b>Six pro teams, one page.</b> Upcoming games for every Twin Cities club, with dates and start times shown in your local time.",
      stripLabel: "Up next in the Cities",
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
      abbr: "LA",
      tagline: "<b>Eleven pro teams, one page.</b> Upcoming games for every LA-area club, with dates and start times shown in your local time.",
      stripLabel: "Up next in LA",
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
    },

    "new-york": {
      name: "New York",
      shortName: "New York",
      abbr: "NYC",
      tz: "America/New_York",
      tzLabel: "ET",
      teams: [
        {
          key: "yankees",
          name: "New York Yankees",
          short: "Yankees",
          leagueLabel: "MLB · Baseball",
          sportPath: "baseball/mlb",
          teamId: "10",
          match: "New York Yankees",
          venue: "Yankee Stadium, Bronx",
          colors: ["#132448", "#C4CED4"]
        },
        {
          key: "mets",
          name: "New York Mets",
          short: "Mets",
          leagueLabel: "MLB · Baseball",
          sportPath: "baseball/mlb",
          teamId: "21",
          match: "New York Mets",
          venue: "Citi Field, Queens",
          colors: ["#002D72", "#FF5910"]
        },
        {
          key: "giants-nfl",
          name: "New York Giants",
          short: "Giants",
          leagueLabel: "NFL · Football",
          sportPath: "football/nfl",
          teamId: "19",
          match: "New York Giants",
          venue: "MetLife Stadium, East Rutherford",
          colors: ["#003C7F", "#C9243F"]
        },
        {
          key: "jets",
          name: "New York Jets",
          short: "Jets",
          leagueLabel: "NFL · Football",
          sportPath: "football/nfl",
          teamId: "20",
          match: "New York Jets",
          venue: "MetLife Stadium, East Rutherford",
          colors: ["#115740", "#FFFFFF"]
        },
        {
          key: "knicks",
          name: "New York Knicks",
          short: "Knicks",
          leagueLabel: "NBA · Basketball",
          sportPath: "basketball/nba",
          teamId: "18",
          match: "New York Knicks",
          venue: "Madison Square Garden, New York",
          colors: ["#1D428A", "#F58426"]
        },
        {
          key: "nets",
          name: "Brooklyn Nets",
          short: "Nets",
          leagueLabel: "NBA · Basketball",
          sportPath: "basketball/nba",
          teamId: "17",
          match: "Brooklyn Nets",
          venue: "Prudential Center, Newark",
          colors: ["#000000", "#FFFFFF"]
        },
        {
          key: "rangers-nhl",
          name: "New York Rangers",
          short: "Rangers",
          leagueLabel: "NHL · Hockey",
          sportPath: "hockey/nhl",
          teamId: "13",
          match: "New York Rangers",
          venue: "Madison Square Garden, New York",
          colors: ["#0056AE", "#E51937"]
        },
        {
          key: "islanders",
          name: "New York Islanders",
          short: "Islanders",
          leagueLabel: "NHL · Hockey",
          sportPath: "hockey/nhl",
          teamId: "12",
          match: "New York Islanders",
          venue: "UBS Arena, Elmont",
          colors: ["#00529B", "#F47D31"]
        },
        {
          key: "devils",
          name: "New Jersey Devils",
          short: "Devils",
          leagueLabel: "NHL · Hockey",
          sportPath: "hockey/nhl",
          teamId: "11",
          match: "New Jersey Devils",
          venue: "IZOD Center, East Rutherford",
          colors: ["#E30B2B", "#000000"]
        },
        {
          key: "nycfc",
          name: "New York City FC",
          short: "NYC FC",
          leagueLabel: "MLS · Soccer",
          sportPath: "soccer/usa.1",
          teamId: "17606",
          match: "New York City FC",
          venue: "New York City FC",
          colors: ["#9FD2FF", "#000229"]
        },
        {
          key: "redbulls",
          name: "Red Bull New York",
          short: "Red Bulls",
          leagueLabel: "MLS · Soccer",
          sportPath: "soccer/usa.1",
          teamId: "190",
          match: "Red Bull New York",
          venue: "Red Bull New York",
          colors: ["#BA0C2F", "#FFC72C"]
        },
        {
          key: "liberty",
          name: "New York Liberty",
          short: "Liberty",
          leagueLabel: "WNBA · Basketball",
          sportPath: "basketball/wnba",
          teamId: "9",
          match: "New York Liberty",
          venue: "New York",
          colors: ["#86CEBC", "#000000"]
        }
      ]
    },

    "chicago": {
      name: "Chicago",
      shortName: "Chicago",
      abbr: "CHI",
      tz: "America/Chicago",
      tzLabel: "CT",
      teams: [
        {
          key: "bears",
          name: "Chicago Bears",
          short: "Bears",
          leagueLabel: "NFL · Football",
          sportPath: "football/nfl",
          teamId: "3",
          match: "Chicago Bears",
          venue: "Soldier Field, Chicago",
          colors: ["#0B1C3A", "#E64100"]
        },
        {
          key: "bulls",
          name: "Chicago Bulls",
          short: "Bulls",
          leagueLabel: "NBA · Basketball",
          sportPath: "basketball/nba",
          teamId: "4",
          match: "Chicago Bulls",
          venue: "United Center, Chicago",
          colors: ["#CE1141", "#000000"]
        },
        {
          key: "cubs",
          name: "Chicago Cubs",
          short: "Cubs",
          leagueLabel: "MLB · Baseball",
          sportPath: "baseball/mlb",
          teamId: "16",
          match: "Chicago Cubs",
          venue: "Wrigley Field, Chicago",
          colors: ["#0E3386", "#CC3433"]
        },
        {
          key: "whitesox",
          name: "Chicago White Sox",
          short: "White Sox",
          leagueLabel: "MLB · Baseball",
          sportPath: "baseball/mlb",
          teamId: "4",
          match: "Chicago White Sox",
          venue: "Rate Field, Chicago",
          colors: ["#000000", "#C4CED4"]
        },
        {
          key: "blackhawks",
          name: "Chicago Blackhawks",
          short: "Blackhawks",
          leagueLabel: "NHL · Hockey",
          sportPath: "hockey/nhl",
          teamId: "4",
          match: "Chicago Blackhawks",
          venue: "United Center, Chicago",
          colors: ["#E31937", "#000000"]
        },
        {
          key: "fire",
          name: "Chicago Fire FC",
          short: "Fire",
          leagueLabel: "MLS · Soccer",
          sportPath: "soccer/usa.1",
          teamId: "182",
          match: "Chicago Fire FC",
          venue: "Chicago Fire FC",
          colors: ["#7CCDEF", "#FF0000"]
        },
        {
          key: "sky",
          name: "Chicago Sky",
          short: "Sky",
          leagueLabel: "WNBA · Basketball",
          sportPath: "basketball/wnba",
          teamId: "19",
          match: "Chicago Sky",
          venue: "Chicago",
          colors: ["#5091CD", "#FFD520"]
        }
      ]
    },

    "philadelphia": {
      name: "Philadelphia",
      shortName: "Philadelphia",
      abbr: "PHL",
      tz: "America/New_York",
      tzLabel: "ET",
      teams: [
        {
          key: "eagles",
          name: "Philadelphia Eagles",
          short: "Eagles",
          leagueLabel: "NFL · Football",
          sportPath: "football/nfl",
          teamId: "21",
          match: "Philadelphia Eagles",
          venue: "Lincoln Financial Field, Philadelphia",
          colors: ["#06424D", "#000000"]
        },
        {
          key: "sixers",
          name: "Philadelphia 76ers",
          short: "76ers",
          leagueLabel: "NBA · Basketball",
          sportPath: "basketball/nba",
          teamId: "20",
          match: "Philadelphia 76ers",
          venue: "Xfinity Mobile Arena, Philadelphia",
          colors: ["#1D428A", "#E01234"]
        },
        {
          key: "phillies",
          name: "Philadelphia Phillies",
          short: "Phillies",
          leagueLabel: "MLB · Baseball",
          sportPath: "baseball/mlb",
          teamId: "22",
          match: "Philadelphia Phillies",
          venue: "Citizens Bank Park, Philadelphia",
          colors: ["#E81828", "#003278"]
        },
        {
          key: "flyers",
          name: "Philadelphia Flyers",
          short: "Flyers",
          leagueLabel: "NHL · Hockey",
          sportPath: "hockey/nhl",
          teamId: "15",
          match: "Philadelphia Flyers",
          venue: "Xfinity Mobile Arena, Philadelphia",
          colors: ["#FE5823", "#000000"]
        },
        {
          key: "union",
          name: "Philadelphia Union",
          short: "Union",
          leagueLabel: "MLS · Soccer",
          sportPath: "soccer/usa.1",
          teamId: "10739",
          match: "Philadelphia Union",
          venue: "Philadelphia Union",
          colors: ["#051F31", "#E0D0A6"]
        }
      ]
    },

    "dallas": {
      name: "Dallas–Fort Worth",
      shortName: "Dallas",
      abbr: "DFW",
      tz: "America/Chicago",
      tzLabel: "CT",
      teams: [
        {
          key: "cowboys",
          name: "Dallas Cowboys",
          short: "Cowboys",
          leagueLabel: "NFL · Football",
          sportPath: "football/nfl",
          teamId: "6",
          match: "Dallas Cowboys",
          venue: "AT&T Stadium, Arlington",
          colors: ["#002A5C", "#B0B7BC"]
        },
        {
          key: "mavericks",
          name: "Dallas Mavericks",
          short: "Mavericks",
          leagueLabel: "NBA · Basketball",
          sportPath: "basketball/nba",
          teamId: "6",
          match: "Dallas Mavericks",
          venue: "American Airlines Center, Dallas",
          colors: ["#0064B1", "#BBC4CA"]
        },
        {
          key: "rangers-mlb",
          name: "Texas Rangers",
          short: "Rangers",
          leagueLabel: "MLB · Baseball",
          sportPath: "baseball/mlb",
          teamId: "13",
          match: "Texas Rangers",
          venue: "Globe Life Field, Arlington",
          colors: ["#003278", "#C0111F"]
        },
        {
          key: "stars",
          name: "Dallas Stars",
          short: "Stars",
          leagueLabel: "NHL · Hockey",
          sportPath: "hockey/nhl",
          teamId: "9",
          match: "Dallas Stars",
          venue: "American Airlines Center, Dallas",
          colors: ["#20864C", "#000000"]
        },
        {
          key: "fcdallas",
          name: "FC Dallas",
          short: "FC Dallas",
          leagueLabel: "MLS · Soccer",
          sportPath: "soccer/usa.1",
          teamId: "185",
          match: "FC Dallas",
          venue: "FC Dallas",
          colors: ["#C6093B", "#001F5B"]
        },
        {
          key: "wings",
          name: "Dallas Wings",
          short: "Wings",
          leagueLabel: "WNBA · Basketball",
          sportPath: "basketball/wnba",
          teamId: "3",
          match: "Dallas Wings",
          venue: "Dallas",
          colors: ["#002B5C", "#C4D600"]
        }
      ]
    },

    "atlanta": {
      name: "Atlanta",
      shortName: "Atlanta",
      abbr: "ATL",
      tz: "America/New_York",
      tzLabel: "ET",
      teams: [
        {
          key: "falcons",
          name: "Atlanta Falcons",
          short: "Falcons",
          leagueLabel: "NFL · Football",
          sportPath: "football/nfl",
          teamId: "1",
          match: "Atlanta Falcons",
          venue: "Mercedes-Benz Stadium, Atlanta",
          colors: ["#A71930", "#000000"]
        },
        {
          key: "hawks",
          name: "Atlanta Hawks",
          short: "Hawks",
          leagueLabel: "NBA · Basketball",
          sportPath: "basketball/nba",
          teamId: "1",
          match: "Atlanta Hawks",
          venue: "State Farm Arena, Atlanta",
          colors: ["#C8102E", "#FDB927"]
        },
        {
          key: "braves",
          name: "Atlanta Braves",
          short: "Braves",
          leagueLabel: "MLB · Baseball",
          sportPath: "baseball/mlb",
          teamId: "15",
          match: "Atlanta Braves",
          venue: "Truist Park, Atlanta",
          colors: ["#0C2340", "#BA0C2F"]
        },
        {
          key: "atlutd",
          name: "Atlanta United FC",
          short: "United",
          leagueLabel: "MLS · Soccer",
          sportPath: "soccer/usa.1",
          teamId: "18418",
          match: "Atlanta United FC",
          venue: "Atlanta United FC",
          colors: ["#9D2235", "#AA9767"]
        },
        {
          key: "dream",
          name: "Atlanta Dream",
          short: "Dream",
          leagueLabel: "WNBA · Basketball",
          sportPath: "basketball/wnba",
          teamId: "20",
          match: "Atlanta Dream",
          venue: "Atlanta",
          colors: ["#E31837", "#5091CC"]
        }
      ]
    },

    "houston": {
      name: "Houston",
      shortName: "Houston",
      abbr: "HOU",
      tz: "America/Chicago",
      tzLabel: "CT",
      teams: [
        {
          key: "texans",
          name: "Houston Texans",
          short: "Texans",
          leagueLabel: "NFL · Football",
          sportPath: "football/nfl",
          teamId: "34",
          match: "Houston Texans",
          venue: "NRG Stadium, Houston",
          colors: ["#00143F", "#C41230"]
        },
        {
          key: "rockets",
          name: "Houston Rockets",
          short: "Rockets",
          leagueLabel: "NBA · Basketball",
          sportPath: "basketball/nba",
          teamId: "10",
          match: "Houston Rockets",
          venue: "Toyota Center (Houston), Houston",
          colors: ["#CE1141", "#000000"]
        },
        {
          key: "astros",
          name: "Houston Astros",
          short: "Astros",
          leagueLabel: "MLB · Baseball",
          sportPath: "baseball/mlb",
          teamId: "18",
          match: "Houston Astros",
          venue: "Daikin Park, Houston",
          colors: ["#002D62", "#EB6E1F"]
        },
        {
          key: "dynamo",
          name: "Houston Dynamo FC",
          short: "Dynamo",
          leagueLabel: "MLS · Soccer",
          sportPath: "soccer/usa.1",
          teamId: "6077",
          match: "Houston Dynamo FC",
          venue: "Houston Dynamo FC",
          colors: ["#FF6B00", "#101820"]
        }
      ]
    },

    "washington": {
      name: "Washington, D.C.",
      shortName: "Washington",
      abbr: "DC",
      tz: "America/New_York",
      tzLabel: "ET",
      teams: [
        {
          key: "commanders",
          name: "Washington Commanders",
          short: "Commanders",
          leagueLabel: "NFL · Football",
          sportPath: "football/nfl",
          teamId: "28",
          match: "Washington Commanders",
          venue: "Northwest Stadium, Landover",
          colors: ["#5A1414", "#FFB612"]
        },
        {
          key: "wizards",
          name: "Washington Wizards",
          short: "Wizards",
          leagueLabel: "NBA · Basketball",
          sportPath: "basketball/nba",
          teamId: "27",
          match: "Washington Wizards",
          venue: "Capital One Arena, Washington",
          colors: ["#E31837", "#002B5C"]
        },
        {
          key: "nationals",
          name: "Washington Nationals",
          short: "Nationals",
          leagueLabel: "MLB · Baseball",
          sportPath: "baseball/mlb",
          teamId: "20",
          match: "Washington Nationals",
          venue: "Nationals Park, Washington",
          colors: ["#AB0003", "#11225B"]
        },
        {
          key: "capitals",
          name: "Washington Capitals",
          short: "Capitals",
          leagueLabel: "NHL · Hockey",
          sportPath: "hockey/nhl",
          teamId: "23",
          match: "Washington Capitals",
          venue: "Capital One Arena, Washington",
          colors: ["#D71830", "#0B1F41"]
        },
        {
          key: "dcunited",
          name: "D.C. United",
          short: "United",
          leagueLabel: "MLS · Soccer",
          sportPath: "soccer/usa.1",
          teamId: "193",
          match: "D.C. United",
          venue: "D.C. United",
          colors: ["#000000", "#D61018"]
        },
        {
          key: "mystics",
          name: "Washington Mystics",
          short: "Mystics",
          leagueLabel: "WNBA · Basketball",
          sportPath: "basketball/wnba",
          teamId: "16",
          match: "Washington Mystics",
          venue: "Washington",
          colors: ["#E03A3E", "#002B5C"]
        }
      ]
    },

    "bay-area": {
      name: "San Francisco Bay Area",
      shortName: "Bay Area",
      abbr: "SF",
      stripLabel: "Up next in the Bay",
      tz: "America/Los_Angeles",
      tzLabel: "PT",
      teams: [
        {
          key: "niners",
          name: "San Francisco 49ers",
          short: "49ers",
          leagueLabel: "NFL · Football",
          sportPath: "football/nfl",
          teamId: "25",
          match: "San Francisco 49ers",
          venue: "Levi's Stadium, Santa Clara",
          colors: ["#AA0000", "#B3995D"]
        },
        {
          key: "warriors",
          name: "Golden State Warriors",
          short: "Warriors",
          leagueLabel: "NBA · Basketball",
          sportPath: "basketball/nba",
          teamId: "9",
          match: "Golden State Warriors",
          venue: "Oracle Arena, Oakland",
          colors: ["#FDB927", "#1D428A"]
        },
        {
          key: "giants-mlb",
          name: "San Francisco Giants",
          short: "Giants",
          leagueLabel: "MLB · Baseball",
          sportPath: "baseball/mlb",
          teamId: "26",
          match: "San Francisco Giants",
          venue: "Oracle Park, San Francisco",
          colors: ["#000000", "#FD5A1E"]
        },
        {
          key: "sharks",
          name: "San Jose Sharks",
          short: "Sharks",
          leagueLabel: "NHL · Hockey",
          sportPath: "hockey/nhl",
          teamId: "18",
          match: "San Jose Sharks",
          venue: "SAP Center at San Jose, San Jose",
          colors: ["#00788A", "#070707"]
        },
        {
          key: "quakes",
          name: "San Jose Earthquakes",
          short: "Quakes",
          leagueLabel: "MLS · Soccer",
          sportPath: "soccer/usa.1",
          teamId: "191",
          match: "San Jose Earthquakes",
          venue: "San Jose Earthquakes",
          colors: ["#003DA6", "#FFFFFF"]
        },
        {
          key: "valkyries",
          name: "Golden State Valkyries",
          short: "Valkyries",
          leagueLabel: "WNBA · Basketball",
          sportPath: "basketball/wnba",
          teamId: "129689",
          match: "Golden State Valkyries",
          venue: "Golden State",
          colors: ["#B38FCF", "#000000"]
        }
      ]
    }
  }
  };
});
