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
      name: "Minnesota",
      shortName: "Minnesota",
      abbr: "MN",
      tagline: "<b>Six pro teams, one page.</b> Upcoming games for every Twin Cities club, with dates and start times shown in your local time.",
      stripLabel: "Up next in the Twin Cities",
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
      name: "Dallas",
      shortName: "Dallas",
      abbr: "DAL",
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
    },

    "boston": {
      name: "Boston",
      shortName: "Boston",
      abbr: "BOS",
      tz: "America/New_York",
      tzLabel: "ET",
      teams: [
        {
          key: "redsox",
          name: "Boston Red Sox",
          short: "Red Sox",
          leagueLabel: "MLB · Baseball",
          sportPath: "baseball/mlb",
          teamId: "2",
          match: "Boston Red Sox",
          venue: "Fenway Park, Boston",
          colors: ["#0D2B56", "#BD3039"]
        },
        {
          key: "celtics",
          name: "Boston Celtics",
          short: "Celtics",
          leagueLabel: "NBA · Basketball",
          sportPath: "basketball/nba",
          teamId: "2",
          match: "Boston Celtics",
          venue: "TD Garden, Boston",
          colors: ["#008348", "#FFFFFF"]
        },
        {
          key: "patriots",
          name: "New England Patriots",
          short: "Patriots",
          leagueLabel: "NFL · Football",
          sportPath: "football/nfl",
          teamId: "17",
          match: "New England Patriots",
          venue: "Gillette Stadium, Foxborough",
          colors: ["#002A5C", "#C60C30"]
        },
        {
          key: "bruins",
          name: "Boston Bruins",
          short: "Bruins",
          leagueLabel: "NHL · Hockey",
          sportPath: "hockey/nhl",
          teamId: "1",
          match: "Boston Bruins",
          venue: "TD Garden, Boston",
          colors: ["#231F20", "#FDB71A"]
        },
        {
          key: "revolution",
          name: "New England Revolution",
          short: "Revolution",
          leagueLabel: "MLS · Soccer",
          sportPath: "soccer/usa.1",
          teamId: "189",
          match: "New England Revolution",
          venue: "New England Revolution",
          colors: ["#022166", "#CE0E2D"]
        }
      ]
    },

    "miami": {
      name: "Miami",
      shortName: "Miami",
      abbr: "MIA",
      tz: "America/New_York",
      tzLabel: "ET",
      teams: [
        {
          key: "marlins",
          name: "Miami Marlins",
          short: "Marlins",
          leagueLabel: "MLB · Baseball",
          sportPath: "baseball/mlb",
          teamId: "28",
          match: "Miami Marlins",
          venue: "LoanDepot park, Miami",
          colors: ["#00A3E0", "#000000"]
        },
        {
          key: "heat",
          name: "Miami Heat",
          short: "Heat",
          leagueLabel: "NBA · Basketball",
          sportPath: "basketball/nba",
          teamId: "14",
          match: "Miami Heat",
          venue: "Kaseya Center, Miami",
          colors: ["#98002E", "#000000"]
        },
        {
          key: "dolphins",
          name: "Miami Dolphins",
          short: "Dolphins",
          leagueLabel: "NFL · Football",
          sportPath: "football/nfl",
          teamId: "15",
          match: "Miami Dolphins",
          venue: "Hard Rock Stadium, Miami Gardens",
          colors: ["#008E97", "#FC4C02"]
        },
        {
          key: "panthers-nhl",
          name: "Florida Panthers",
          short: "Panthers",
          leagueLabel: "NHL · Hockey",
          sportPath: "hockey/nhl",
          teamId: "26",
          match: "Florida Panthers",
          venue: "Amerant Bank Arena, Sunrise",
          colors: ["#E51937", "#002D62"]
        },
        {
          key: "intermiami",
          name: "Inter Miami CF",
          short: "Inter Miami",
          leagueLabel: "MLS · Soccer",
          sportPath: "soccer/usa.1",
          teamId: "20232",
          match: "Inter Miami CF",
          venue: "Inter Miami CF",
          colors: ["#231F20", "#F7B5CD"]
        }
      ]
    },

    "denver": {
      name: "Denver",
      shortName: "Denver",
      abbr: "DEN",
      tz: "America/Denver",
      tzLabel: "MT",
      teams: [
        {
          key: "rockies",
          name: "Colorado Rockies",
          short: "Rockies",
          leagueLabel: "MLB · Baseball",
          sportPath: "baseball/mlb",
          teamId: "27",
          match: "Colorado Rockies",
          venue: "Coors Field, Denver",
          colors: ["#33006F", "#000000"]
        },
        {
          key: "nuggets",
          name: "Denver Nuggets",
          short: "Nuggets",
          leagueLabel: "NBA · Basketball",
          sportPath: "basketball/nba",
          teamId: "7",
          match: "Denver Nuggets",
          venue: "Ball Arena, Denver",
          colors: ["#0E2240", "#FEC524"]
        },
        {
          key: "broncos",
          name: "Denver Broncos",
          short: "Broncos",
          leagueLabel: "NFL · Football",
          sportPath: "football/nfl",
          teamId: "7",
          match: "Denver Broncos",
          venue: "Empower Field at Mile High, Denver",
          colors: ["#0A2343", "#FC4C02"]
        },
        {
          key: "avalanche",
          name: "Colorado Avalanche",
          short: "Avalanche",
          leagueLabel: "NHL · Hockey",
          sportPath: "hockey/nhl",
          teamId: "17",
          match: "Colorado Avalanche",
          venue: "Ball Arena, Denver",
          colors: ["#860038", "#005EA3"]
        },
        {
          key: "rapids",
          name: "Colorado Rapids",
          short: "Rapids",
          leagueLabel: "MLS · Soccer",
          sportPath: "soccer/usa.1",
          teamId: "184",
          match: "Colorado Rapids",
          venue: "Colorado Rapids",
          colors: ["#8A2432", "#8AB7E9"]
        }
      ]
    },

    "phoenix": {
      name: "Phoenix",
      shortName: "Phoenix",
      abbr: "PHX",
      tz: "America/Phoenix",
      tzLabel: "MST",
      teams: [
        {
          key: "dbacks",
          name: "Arizona Diamondbacks",
          short: "D-backs",
          leagueLabel: "MLB · Baseball",
          sportPath: "baseball/mlb",
          teamId: "29",
          match: "Arizona Diamondbacks",
          venue: "Chase Field, Phoenix",
          colors: ["#AA182C", "#000000"]
        },
        {
          key: "suns",
          name: "Phoenix Suns",
          short: "Suns",
          leagueLabel: "NBA · Basketball",
          sportPath: "basketball/nba",
          teamId: "21",
          match: "Phoenix Suns",
          venue: "Mortgage Matchup Center, Phoenix",
          colors: ["#29127A", "#E56020"]
        },
        {
          key: "cardinals",
          name: "Arizona Cardinals",
          short: "Cardinals",
          leagueLabel: "NFL · Football",
          sportPath: "football/nfl",
          teamId: "22",
          match: "Arizona Cardinals",
          venue: "State Farm Stadium, Glendale",
          colors: ["#A40227", "#FFFFFF"]
        },
        {
          key: "mercury",
          name: "Phoenix Mercury",
          short: "Mercury",
          leagueLabel: "WNBA · Basketball",
          sportPath: "basketball/wnba",
          teamId: "11",
          match: "Phoenix Mercury",
          venue: "Phoenix",
          colors: ["#3C286E", "#FA4B0A"]
        }
      ]
    },

    "detroit": {
      name: "Detroit",
      shortName: "Detroit",
      abbr: "DET",
      tz: "America/New_York",
      tzLabel: "ET",
      teams: [
        {
          key: "tigers",
          name: "Detroit Tigers",
          short: "Tigers",
          leagueLabel: "MLB · Baseball",
          sportPath: "baseball/mlb",
          teamId: "6",
          match: "Detroit Tigers",
          venue: "Comerica Park, Detroit",
          colors: ["#0A2240", "#FF4713"]
        },
        {
          key: "pistons",
          name: "Detroit Pistons",
          short: "Pistons",
          leagueLabel: "NBA · Basketball",
          sportPath: "basketball/nba",
          teamId: "8",
          match: "Detroit Pistons",
          venue: "Little Caesars Arena",
          colors: ["#1D428A", "#C8102E"]
        },
        {
          key: "lions",
          name: "Detroit Lions",
          short: "Lions",
          leagueLabel: "NFL · Football",
          sportPath: "football/nfl",
          teamId: "8",
          match: "Detroit Lions",
          venue: "Ford Field, Detroit",
          colors: ["#0076B6", "#BBBBBB"]
        },
        {
          key: "redwings",
          name: "Detroit Red Wings",
          short: "Red Wings",
          leagueLabel: "NHL · Hockey",
          sportPath: "hockey/nhl",
          teamId: "5",
          match: "Detroit Red Wings",
          venue: "Little Caesars Arena, Detroit",
          colors: ["#E30526", "#FFFFFF"]
        }
      ]
    },

    "seattle": {
      name: "Seattle",
      shortName: "Seattle",
      abbr: "SEA",
      tz: "America/Los_Angeles",
      tzLabel: "PT",
      teams: [
        {
          key: "mariners",
          name: "Seattle Mariners",
          short: "Mariners",
          leagueLabel: "MLB · Baseball",
          sportPath: "baseball/mlb",
          teamId: "12",
          match: "Seattle Mariners",
          venue: "T-Mobile Park, Seattle",
          colors: ["#005C5C", "#0C2C56"]
        },
        {
          key: "seahawks",
          name: "Seattle Seahawks",
          short: "Seahawks",
          leagueLabel: "NFL · Football",
          sportPath: "football/nfl",
          teamId: "26",
          match: "Seattle Seahawks",
          venue: "Lumen Field, Seattle",
          colors: ["#002A5C", "#69BE28"]
        },
        {
          key: "kraken",
          name: "Seattle Kraken",
          short: "Kraken",
          leagueLabel: "NHL · Hockey",
          sportPath: "hockey/nhl",
          teamId: "124292",
          match: "Seattle Kraken",
          venue: "Climate Pledge Arena, Seattle",
          colors: ["#000D33", "#A3DCE4"]
        },
        {
          key: "sounders",
          name: "Seattle Sounders FC",
          short: "Sounders",
          leagueLabel: "MLS · Soccer",
          sportPath: "soccer/usa.1",
          teamId: "9726",
          match: "Seattle Sounders FC",
          venue: "Seattle Sounders FC",
          colors: ["#2DC84D", "#0033A0"]
        },
        {
          key: "storm",
          name: "Seattle Storm",
          short: "Storm",
          leagueLabel: "WNBA · Basketball",
          sportPath: "basketball/wnba",
          teamId: "14",
          match: "Seattle Storm",
          venue: "Seattle",
          colors: ["#2C5235", "#FEE11A"]
        }
      ]
    },

    "toronto": {
      name: "Toronto",
      shortName: "Toronto",
      abbr: "TOR",
      tz: "America/New_York",
      tzLabel: "ET",
      teams: [
        {
          key: "bluejays",
          name: "Toronto Blue Jays",
          short: "Blue Jays",
          leagueLabel: "MLB · Baseball",
          sportPath: "baseball/mlb",
          teamId: "14",
          match: "Toronto Blue Jays",
          venue: "Rogers Centre, Toronto",
          colors: ["#134A8E", "#6CACE5"]
        },
        {
          key: "raptors",
          name: "Toronto Raptors",
          short: "Raptors",
          leagueLabel: "NBA · Basketball",
          sportPath: "basketball/nba",
          teamId: "28",
          match: "Toronto Raptors",
          venue: "Scotiabank Arena, Toronto",
          colors: ["#D91244", "#000000"]
        },
        {
          key: "mapleleafs",
          name: "Toronto Maple Leafs",
          short: "Maple Leafs",
          leagueLabel: "NHL · Hockey",
          sportPath: "hockey/nhl",
          teamId: "21",
          match: "Toronto Maple Leafs",
          venue: "Scotiabank Arena, Toronto",
          colors: ["#003E7E", "#FFFFFF"]
        },
        {
          key: "torontofc",
          name: "Toronto FC",
          short: "Toronto FC",
          leagueLabel: "MLS · Soccer",
          sportPath: "soccer/usa.1",
          teamId: "7318",
          match: "Toronto FC",
          venue: "Toronto FC",
          colors: ["#AA182C", "#A2A9AD"]
        },
        {
          key: "tempo",
          name: "Toronto Tempo",
          short: "Tempo",
          leagueLabel: "WNBA · Basketball",
          sportPath: "basketball/wnba",
          teamId: "131935",
          match: "Toronto Tempo",
          venue: "Toronto",
          colors: ["#33476D", "#7B1B38"]
        }
      ]
    },

    "tampa-bay": {
      name: "Tampa Bay",
      shortName: "Tampa Bay",
      abbr: "TB",
      tz: "America/New_York",
      tzLabel: "ET",
      teams: [
        {
          key: "rays",
          name: "Tampa Bay Rays",
          short: "Rays",
          leagueLabel: "MLB · Baseball",
          sportPath: "baseball/mlb",
          teamId: "30",
          match: "Tampa Bay Rays",
          venue: "Tropicana Field, St. Petersburg",
          colors: ["#092C5C", "#8FBCE6"]
        },
        {
          key: "buccaneers",
          name: "Tampa Bay Buccaneers",
          short: "Buccaneers",
          leagueLabel: "NFL · Football",
          sportPath: "football/nfl",
          teamId: "27",
          match: "Tampa Bay Buccaneers",
          venue: "Raymond James Stadium, Tampa",
          colors: ["#BD1C36", "#3E3A35"]
        },
        {
          key: "lightning",
          name: "Tampa Bay Lightning",
          short: "Lightning",
          leagueLabel: "NHL · Hockey",
          sportPath: "hockey/nhl",
          teamId: "20",
          match: "Tampa Bay Lightning",
          venue: "Benchmark International Arena, Tampa",
          colors: ["#003E7E", "#FFFFFF"]
        }
      ]
    },

    "pittsburgh": {
      name: "Pittsburgh",
      shortName: "Pittsburgh",
      abbr: "PIT",
      tz: "America/New_York",
      tzLabel: "ET",
      teams: [
        {
          key: "pirates",
          name: "Pittsburgh Pirates",
          short: "Pirates",
          leagueLabel: "MLB · Baseball",
          sportPath: "baseball/mlb",
          teamId: "23",
          match: "Pittsburgh Pirates",
          venue: "PNC Park, Pittsburgh",
          colors: ["#000000", "#FDB827"]
        },
        {
          key: "steelers",
          name: "Pittsburgh Steelers",
          short: "Steelers",
          leagueLabel: "NFL · Football",
          sportPath: "football/nfl",
          teamId: "23",
          match: "Pittsburgh Steelers",
          venue: "Acrisure Stadium, Pittsburgh",
          colors: ["#000000", "#FFB612"]
        },
        {
          key: "penguins",
          name: "Pittsburgh Penguins",
          short: "Penguins",
          leagueLabel: "NHL · Hockey",
          sportPath: "hockey/nhl",
          teamId: "16",
          match: "Pittsburgh Penguins",
          venue: "PPG Paints Arena, Pittsburgh",
          colors: ["#000000", "#FDB71A"]
        }
      ]
    },

    "cleveland": {
      name: "Cleveland",
      shortName: "Cleveland",
      abbr: "CLE",
      tz: "America/New_York",
      tzLabel: "ET",
      teams: [
        {
          key: "guardians",
          name: "Cleveland Guardians",
          short: "Guardians",
          leagueLabel: "MLB · Baseball",
          sportPath: "baseball/mlb",
          teamId: "5",
          match: "Cleveland Guardians",
          venue: "Progressive Field, Cleveland",
          colors: ["#002B5C", "#E31937"]
        },
        {
          key: "cavaliers",
          name: "Cleveland Cavaliers",
          short: "Cavaliers",
          leagueLabel: "NBA · Basketball",
          sportPath: "basketball/nba",
          teamId: "5",
          match: "Cleveland Cavaliers",
          venue: "Rocket Arena, Cleveland",
          colors: ["#860038", "#BC945C"]
        },
        {
          key: "browns",
          name: "Cleveland Browns",
          short: "Browns",
          leagueLabel: "NFL · Football",
          sportPath: "football/nfl",
          teamId: "5",
          match: "Cleveland Browns",
          venue: "Huntington Bank Field, Cleveland",
          colors: ["#472A08", "#FF3C00"]
        }
      ]
    },

    "st-louis": {
      name: "St. Louis",
      shortName: "St. Louis",
      abbr: "STL",
      tz: "America/Chicago",
      tzLabel: "CT",
      teams: [
        {
          key: "cardinals-mlb",
          name: "St. Louis Cardinals",
          short: "Cardinals",
          leagueLabel: "MLB · Baseball",
          sportPath: "baseball/mlb",
          teamId: "24",
          match: "St. Louis Cardinals",
          venue: "Busch Stadium, St. Louis",
          colors: ["#BE0A14", "#001541"]
        },
        {
          key: "blues",
          name: "St. Louis Blues",
          short: "Blues",
          leagueLabel: "NHL · Hockey",
          sportPath: "hockey/nhl",
          teamId: "19",
          match: "St. Louis Blues",
          venue: "Enterprise Center, St. Louis",
          colors: ["#0070B9", "#FDB71A"]
        },
        {
          key: "stlcity",
          name: "St. Louis CITY SC",
          short: "City SC",
          leagueLabel: "MLS · Soccer",
          sportPath: "soccer/usa.1",
          teamId: "21812",
          match: "St. Louis CITY SC",
          venue: "St. Louis CITY SC",
          colors: ["#EC1458", "#001544"]
        }
      ]
    },

    "nashville": {
      name: "Nashville",
      shortName: "Nashville",
      abbr: "NSH",
      tz: "America/Chicago",
      tzLabel: "CT",
      teams: [
        {
          key: "titans",
          name: "Tennessee Titans",
          short: "Titans",
          leagueLabel: "NFL · Football",
          sportPath: "football/nfl",
          teamId: "10",
          match: "Tennessee Titans",
          venue: "Nissan Stadium, Nashville",
          colors: ["#4495D2", "#001532"]
        },
        {
          key: "predators",
          name: "Nashville Predators",
          short: "Predators",
          leagueLabel: "NHL · Hockey",
          sportPath: "hockey/nhl",
          teamId: "27",
          match: "Nashville Predators",
          venue: "Bridgestone Arena, Nashville",
          colors: ["#FDBA31", "#002D62"]
        },
        {
          key: "nashvillesc",
          name: "Nashville SC",
          short: "Nashville SC",
          leagueLabel: "MLS · Soccer",
          sportPath: "soccer/usa.1",
          teamId: "18986",
          match: "Nashville SC",
          venue: "Nashville SC",
          colors: ["#ECE83A", "#1F1646"]
        }
      ]
    },

    "san-diego": {
      name: "San Diego",
      shortName: "San Diego",
      abbr: "SD",
      tz: "America/Los_Angeles",
      tzLabel: "PT",
      teams: [
        {
          key: "padres",
          name: "San Diego Padres",
          short: "Padres",
          leagueLabel: "MLB · Baseball",
          sportPath: "baseball/mlb",
          teamId: "25",
          match: "San Diego Padres",
          venue: "Petco Park, San Diego",
          colors: ["#2F241D", "#FFC425"]
        },
        {
          key: "sandiegofc",
          name: "San Diego FC",
          short: "San Diego FC",
          leagueLabel: "MLS · Soccer",
          sportPath: "soccer/usa.1",
          teamId: "22529",
          match: "San Diego FC",
          venue: "San Diego FC",
          colors: ["#697A7C", "#F89E1A"]
        }
      ]
    },

    "baltimore": {
      name: "Baltimore",
      shortName: "Baltimore",
      abbr: "BAL",
      tz: "America/New_York",
      tzLabel: "ET",
      teams: [
        {
          key: "orioles",
          name: "Baltimore Orioles",
          short: "Orioles",
          leagueLabel: "MLB · Baseball",
          sportPath: "baseball/mlb",
          teamId: "1",
          match: "Baltimore Orioles",
          venue: "Oriole Park at Camden Yards, Baltimore",
          colors: ["#DF4601", "#000000"]
        },
        {
          key: "ravens",
          name: "Baltimore Ravens",
          short: "Ravens",
          leagueLabel: "NFL · Football",
          sportPath: "football/nfl",
          teamId: "33",
          match: "Baltimore Ravens",
          venue: "M&T Bank Stadium, Baltimore",
          colors: ["#29126F", "#000000"]
        }
      ]
    },

    "charlotte": {
      name: "Charlotte",
      shortName: "Charlotte",
      abbr: "CLT",
      tz: "America/New_York",
      tzLabel: "ET",
      teams: [
        {
          key: "hornets",
          name: "Charlotte Hornets",
          short: "Hornets",
          leagueLabel: "NBA · Basketball",
          sportPath: "basketball/nba",
          teamId: "30",
          match: "Charlotte Hornets",
          venue: "Spectrum Center, Charlotte",
          colors: ["#008CA8", "#1D1060"]
        },
        {
          key: "panthers-nfl",
          name: "Carolina Panthers",
          short: "Panthers",
          leagueLabel: "NFL · Football",
          sportPath: "football/nfl",
          teamId: "29",
          match: "Carolina Panthers",
          venue: "Bank of America Stadium, Charlotte",
          colors: ["#0085CA", "#000000"]
        },
        {
          key: "charlottefc",
          name: "Charlotte FC",
          short: "Charlotte FC",
          leagueLabel: "MLS · Soccer",
          sportPath: "soccer/usa.1",
          teamId: "21300",
          match: "Charlotte FC",
          venue: "Charlotte FC",
          colors: ["#0085CA", "#000000"]
        }
      ]
    },

    "indianapolis": {
      name: "Indianapolis",
      shortName: "Indianapolis",
      abbr: "IND",
      tz: "America/New_York",
      tzLabel: "ET",
      teams: [
        {
          key: "colts",
          name: "Indianapolis Colts",
          short: "Colts",
          leagueLabel: "NFL · Football",
          sportPath: "football/nfl",
          teamId: "11",
          match: "Indianapolis Colts",
          venue: "Lucas Oil Stadium, Indianapolis",
          colors: ["#003B75", "#FFFFFF"]
        },
        {
          key: "pacers",
          name: "Indiana Pacers",
          short: "Pacers",
          leagueLabel: "NBA · Basketball",
          sportPath: "basketball/nba",
          teamId: "11",
          match: "Indiana Pacers",
          venue: "Gainbridge Fieldhouse, Indianapolis",
          colors: ["#0C2340", "#FFD520"]
        },
        {
          key: "fever",
          name: "Indiana Fever",
          short: "Fever",
          leagueLabel: "WNBA · Basketball",
          sportPath: "basketball/wnba",
          teamId: "5",
          match: "Indiana Fever",
          venue: "Indiana",
          colors: ["#002D62", "#E03A3E"]
        }
      ]
    },

    "kansas-city": {
      name: "Kansas City",
      shortName: "Kansas City",
      abbr: "KC",
      tz: "America/Chicago",
      tzLabel: "CT",
      teams: [
        {
          key: "royals",
          name: "Kansas City Royals",
          short: "Royals",
          leagueLabel: "MLB · Baseball",
          sportPath: "baseball/mlb",
          teamId: "7",
          match: "Kansas City Royals",
          venue: "Kauffman Stadium, Kansas City",
          colors: ["#004687", "#7AB2DD"]
        },
        {
          key: "chiefs",
          name: "Kansas City Chiefs",
          short: "Chiefs",
          leagueLabel: "NFL · Football",
          sportPath: "football/nfl",
          teamId: "12",
          match: "Kansas City Chiefs",
          venue: "GEHA Field at Arrowhead Stadium, Kansas City",
          colors: ["#E31837", "#FFB612"]
        },
        {
          key: "sportingkc",
          name: "Sporting Kansas City",
          short: "Sporting KC",
          leagueLabel: "MLS · Soccer",
          sportPath: "soccer/usa.1",
          teamId: "186",
          match: "Sporting Kansas City",
          venue: "Sporting Kansas City",
          colors: ["#A7C6ED", "#0A2240"]
        }
      ]
    },

    "wisconsin": {
      name: "Wisconsin",
      shortName: "Wisconsin",
      abbr: "WI",
      tz: "America/Chicago",
      tzLabel: "CT",
      teams: [
        {
          key: "packers",
          name: "Green Bay Packers",
          short: "Packers",
          leagueLabel: "NFL · Football",
          sportPath: "football/nfl",
          teamId: "9",
          match: "Green Bay Packers",
          venue: "Lambeau Field, Green Bay",
          colors: ["#204E32", "#FFB612"]
        },
        {
          key: "brewers",
          name: "Milwaukee Brewers",
          short: "Brewers",
          leagueLabel: "MLB · Baseball",
          sportPath: "baseball/mlb",
          teamId: "8",
          match: "Milwaukee Brewers",
          venue: "American Family Field, Milwaukee",
          colors: ["#13294B", "#FFC72C"]
        },
        {
          key: "bucks",
          name: "Milwaukee Bucks",
          short: "Bucks",
          leagueLabel: "NBA · Basketball",
          sportPath: "basketball/nba",
          teamId: "15",
          match: "Milwaukee Bucks",
          venue: "BMO Harris Bradley Center, Milwaukee",
          colors: ["#00471B", "#EEE1C6"]
        }
      ]
    },

    "cincinnati": {
      name: "Cincinnati",
      shortName: "Cincinnati",
      abbr: "CIN",
      tz: "America/New_York",
      tzLabel: "ET",
      teams: [
        {
          key: "reds",
          name: "Cincinnati Reds",
          short: "Reds",
          leagueLabel: "MLB · Baseball",
          sportPath: "baseball/mlb",
          teamId: "17",
          match: "Cincinnati Reds",
          venue: "Great American Ball Park, Cincinnati",
          colors: ["#C6011F", "#FFFFFF"]
        },
        {
          key: "bengals",
          name: "Cincinnati Bengals",
          short: "Bengals",
          leagueLabel: "NFL · Football",
          sportPath: "football/nfl",
          teamId: "4",
          match: "Cincinnati Bengals",
          venue: "Paycor Stadium, Cincinnati",
          colors: ["#FB4F14", "#000000"]
        },
        {
          key: "fccincinnati",
          name: "FC Cincinnati",
          short: "FC Cincinnati",
          leagueLabel: "MLS · Soccer",
          sportPath: "soccer/usa.1",
          teamId: "18267",
          match: "FC Cincinnati",
          venue: "FC Cincinnati",
          colors: ["#003087", "#FE5000"]
        }
      ]
    },

    "columbus": {
      name: "Columbus",
      shortName: "Columbus",
      abbr: "CMH",
      tz: "America/New_York",
      tzLabel: "ET",
      teams: [
        {
          key: "bluejackets",
          name: "Columbus Blue Jackets",
          short: "Blue Jackets",
          leagueLabel: "NHL · Hockey",
          sportPath: "hockey/nhl",
          teamId: "29",
          match: "Columbus Blue Jackets",
          venue: "Nationwide Arena, Columbus",
          colors: ["#002D62", "#E31937"]
        },
        {
          key: "crew",
          name: "Columbus Crew",
          short: "Crew",
          leagueLabel: "MLS · Soccer",
          sportPath: "soccer/usa.1",
          teamId: "183",
          match: "Columbus Crew",
          venue: "Columbus Crew",
          colors: ["#000000", "#FEDD00"]
        }
      ]
    },

    "portland": {
      name: "Portland",
      shortName: "Portland",
      abbr: "PDX",
      tz: "America/Los_Angeles",
      tzLabel: "PT",
      teams: [
        {
          key: "blazers",
          name: "Portland Trail Blazers",
          short: "Trail Blazers",
          leagueLabel: "NBA · Basketball",
          sportPath: "basketball/nba",
          teamId: "22",
          match: "Portland Trail Blazers",
          venue: "Moda Center, Portland",
          colors: ["#E03A3E", "#000000"]
        },
        {
          key: "timbers",
          name: "Portland Timbers",
          short: "Timbers",
          leagueLabel: "MLS · Soccer",
          sportPath: "soccer/usa.1",
          teamId: "9723",
          match: "Portland Timbers",
          venue: "Portland Timbers",
          colors: ["#2C5234", "#C99700"]
        },
        {
          key: "portlandfire",
          name: "Portland Fire",
          short: "Fire",
          leagueLabel: "WNBA · Basketball",
          sportPath: "basketball/wnba",
          teamId: "132052",
          match: "Portland Fire",
          venue: "Portland",
          colors: ["#CEE5EB", "#000000"]
        }
      ]
    },

    "salt-lake-city": {
      name: "Salt Lake City",
      shortName: "Salt Lake City",
      abbr: "SLC",
      tz: "America/Denver",
      tzLabel: "MT",
      teams: [
        {
          key: "jazz",
          name: "Utah Jazz",
          short: "Jazz",
          leagueLabel: "NBA · Basketball",
          sportPath: "basketball/nba",
          teamId: "26",
          match: "Utah Jazz",
          venue: "Delta Center, Salt Lake City",
          colors: ["#4E008E", "#79A3DC"]
        },
        {
          key: "mammoth",
          name: "Utah Mammoth",
          short: "Mammoth",
          leagueLabel: "NHL · Hockey",
          sportPath: "hockey/nhl",
          teamId: "129764",
          match: "Utah Mammoth",
          venue: "Delta Center, Salt Lake City",
          colors: ["#000000", "#7AB2E1"]
        },
        {
          key: "rsl",
          name: "Real Salt Lake",
          short: "Real Salt Lake",
          leagueLabel: "MLS · Soccer",
          sportPath: "soccer/usa.1",
          teamId: "4771",
          match: "Real Salt Lake",
          venue: "Real Salt Lake",
          colors: ["#A32035", "#DAA900"]
        }
      ]
    },

    "las-vegas": {
      name: "Las Vegas",
      shortName: "Las Vegas",
      abbr: "LV",
      tz: "America/Los_Angeles",
      tzLabel: "PT",
      teams: [
        {
          key: "raiders",
          name: "Las Vegas Raiders",
          short: "Raiders",
          leagueLabel: "NFL · Football",
          sportPath: "football/nfl",
          teamId: "13",
          match: "Las Vegas Raiders",
          venue: "Allegiant Stadium, Las Vegas",
          colors: ["#000000", "#A5ACAF"]
        },
        {
          key: "goldenknights",
          name: "Vegas Golden Knights",
          short: "Golden Knights",
          leagueLabel: "NHL · Hockey",
          sportPath: "hockey/nhl",
          teamId: "37",
          match: "Vegas Golden Knights",
          venue: "T-Mobile Arena, Las Vegas",
          colors: ["#344043", "#B4975A"]
        },
        {
          key: "aces",
          name: "Las Vegas Aces",
          short: "Aces",
          leagueLabel: "WNBA · Basketball",
          sportPath: "basketball/wnba",
          teamId: "17",
          match: "Las Vegas Aces",
          venue: "Las Vegas",
          colors: ["#A7A8AA", "#000000"]
        }
      ]
    },

    "san-antonio": {
      name: "San Antonio",
      shortName: "San Antonio",
      abbr: "SA",
      tz: "America/Chicago",
      tzLabel: "CT",
      teams: [
        {
          key: "spurs",
          name: "San Antonio Spurs",
          short: "Spurs",
          leagueLabel: "NBA · Basketball",
          sportPath: "basketball/nba",
          teamId: "24",
          match: "San Antonio Spurs",
          venue: "Frost Bank Center, San Antonio",
          colors: ["#000000", "#C4CED4"]
        }
      ]
    },

    "memphis": {
      name: "Memphis",
      shortName: "Memphis",
      abbr: "MEM",
      tz: "America/Chicago",
      tzLabel: "CT",
      teams: [
        {
          key: "grizzlies",
          name: "Memphis Grizzlies",
          short: "Grizzlies",
          leagueLabel: "NBA · Basketball",
          sportPath: "basketball/nba",
          teamId: "29",
          match: "Memphis Grizzlies",
          venue: "FedExForum, Memphis",
          colors: ["#5D76A9", "#12173F"]
        }
      ]
    },

    "new-orleans": {
      name: "New Orleans",
      shortName: "New Orleans",
      abbr: "NOLA",
      tz: "America/Chicago",
      tzLabel: "CT",
      teams: [
        {
          key: "pelicans",
          name: "New Orleans Pelicans",
          short: "Pelicans",
          leagueLabel: "NBA · Basketball",
          sportPath: "basketball/nba",
          teamId: "3",
          match: "New Orleans Pelicans",
          venue: "Smoothie King Center, New Orleans",
          colors: ["#0A2240", "#B4975A"]
        },
        {
          key: "saints",
          name: "New Orleans Saints",
          short: "Saints",
          leagueLabel: "NFL · Football",
          sportPath: "football/nfl",
          teamId: "18",
          match: "New Orleans Saints",
          venue: "Caesars Superdome, New Orleans",
          colors: ["#D3BC8D", "#000000"]
        }
      ]
    },

    "oklahoma-city": {
      name: "Oklahoma City",
      shortName: "Oklahoma City",
      abbr: "OKC",
      tz: "America/Chicago",
      tzLabel: "CT",
      teams: [
        {
          key: "thunder",
          name: "Oklahoma City Thunder",
          short: "Thunder",
          leagueLabel: "NBA · Basketball",
          sportPath: "basketball/nba",
          teamId: "25",
          match: "Oklahoma City Thunder",
          venue: "Paycom Center, Oklahoma City",
          colors: ["#007AC1", "#EF3B24"]
        }
      ]
    },

    "sacramento": {
      name: "Sacramento",
      shortName: "Sacramento",
      abbr: "SAC",
      tz: "America/Los_Angeles",
      tzLabel: "PT",
      teams: [
        {
          key: "kings-nba",
          name: "Sacramento Kings",
          short: "Kings",
          leagueLabel: "NBA · Basketball",
          sportPath: "basketball/nba",
          teamId: "23",
          match: "Sacramento Kings",
          venue: "Sleep Train Arena, Sacramento",
          colors: ["#5A2D81", "#6A7A82"]
        },
        {
          key: "athletics",
          name: "Athletics",
          short: "Athletics",
          leagueLabel: "MLB · Baseball",
          sportPath: "baseball/mlb",
          teamId: "11",
          match: "Athletics",
          venue: "Oakland Coliseum, Oakland",
          colors: ["#003831", "#EFB21E"]
        }
      ]
    },

    "buffalo": {
      name: "Buffalo",
      shortName: "Buffalo",
      abbr: "BUF",
      tz: "America/New_York",
      tzLabel: "ET",
      teams: [
        {
          key: "bills",
          name: "Buffalo Bills",
          short: "Bills",
          leagueLabel: "NFL · Football",
          sportPath: "football/nfl",
          teamId: "2",
          match: "Buffalo Bills",
          venue: "Highmark Stadium, Orchard Park",
          colors: ["#00338D", "#D50A0A"]
        },
        {
          key: "sabres",
          name: "Buffalo Sabres",
          short: "Sabres",
          leagueLabel: "NHL · Hockey",
          sportPath: "hockey/nhl",
          teamId: "2",
          match: "Buffalo Sabres",
          venue: "KeyBank Center, Buffalo",
          colors: ["#00468B", "#FDB71A"]
        }
      ]
    },

    "jacksonville": {
      name: "Jacksonville",
      shortName: "Jacksonville",
      abbr: "JAX",
      tz: "America/New_York",
      tzLabel: "ET",
      teams: [
        {
          key: "jaguars",
          name: "Jacksonville Jaguars",
          short: "Jaguars",
          leagueLabel: "NFL · Football",
          sportPath: "football/nfl",
          teamId: "30",
          match: "Jacksonville Jaguars",
          venue: "EverBank Stadium, Jacksonville",
          colors: ["#007487", "#D7A22A"]
        }
      ]
    },

    "orlando": {
      name: "Orlando",
      shortName: "Orlando",
      abbr: "ORL",
      tz: "America/New_York",
      tzLabel: "ET",
      teams: [
        {
          key: "magic",
          name: "Orlando Magic",
          short: "Magic",
          leagueLabel: "NBA · Basketball",
          sportPath: "basketball/nba",
          teamId: "19",
          match: "Orlando Magic",
          venue: "Kia Center, Orlando",
          colors: ["#0150B5", "#9CA0A3"]
        },
        {
          key: "orlandocity",
          name: "Orlando City SC",
          short: "Orlando City",
          leagueLabel: "MLS · Soccer",
          sportPath: "soccer/usa.1",
          teamId: "12011",
          match: "Orlando City SC",
          venue: "Orlando City SC",
          colors: ["#60269E", "#F0D283"]
        }
      ]
    },

    "austin": {
      name: "Austin",
      shortName: "Austin",
      abbr: "AUS",
      tz: "America/Chicago",
      tzLabel: "CT",
      teams: [
        {
          key: "austinfc",
          name: "Austin FC",
          short: "Austin FC",
          leagueLabel: "MLS · Soccer",
          sportPath: "soccer/usa.1",
          teamId: "20906",
          match: "Austin FC",
          venue: "Austin FC",
          colors: ["#00B140", "#000000"]
        }
      ]
    },

    "raleigh": {
      name: "Raleigh",
      shortName: "Raleigh",
      abbr: "RDU",
      tz: "America/New_York",
      tzLabel: "ET",
      teams: [
        {
          key: "hurricanes",
          name: "Carolina Hurricanes",
          short: "Hurricanes",
          leagueLabel: "NHL · Hockey",
          sportPath: "hockey/nhl",
          teamId: "7",
          match: "Carolina Hurricanes",
          venue: "Lenovo Center, Raleigh",
          colors: ["#E30426", "#000000"]
        }
      ]
    },

    "montreal": {
      name: "Montréal",
      shortName: "Montréal",
      abbr: "MTL",
      tz: "America/New_York",
      tzLabel: "ET",
      teams: [
        {
          key: "canadiens",
          name: "Montreal Canadiens",
          short: "Canadiens",
          leagueLabel: "NHL · Hockey",
          sportPath: "hockey/nhl",
          teamId: "10",
          match: "Montreal Canadiens",
          venue: "Bell Centre, Montreal",
          colors: ["#C41230", "#013A81"]
        },
        {
          key: "cfmontreal",
          name: "CF Montréal",
          short: "CF Montréal",
          leagueLabel: "MLS · Soccer",
          sportPath: "soccer/usa.1",
          teamId: "9720",
          match: "CF Montréal",
          venue: "CF Montréal",
          colors: ["#003DA6", "#C1C5C8"]
        }
      ]
    },

    "ottawa": {
      name: "Ottawa",
      shortName: "Ottawa",
      abbr: "OTT",
      tz: "America/New_York",
      tzLabel: "ET",
      teams: [
        {
          key: "senators",
          name: "Ottawa Senators",
          short: "Senators",
          leagueLabel: "NHL · Hockey",
          sportPath: "hockey/nhl",
          teamId: "14",
          match: "Ottawa Senators",
          venue: "Canadian Tire Centre, Ottawa",
          colors: ["#DD1A32", "#B79257"]
        }
      ]
    },

    "calgary": {
      name: "Calgary",
      shortName: "Calgary",
      abbr: "CGY",
      tz: "America/Edmonton",
      tzLabel: "MT",
      teams: [
        {
          key: "flames",
          name: "Calgary Flames",
          short: "Flames",
          leagueLabel: "NHL · Hockey",
          sportPath: "hockey/nhl",
          teamId: "3",
          match: "Calgary Flames",
          venue: "Scotiabank Saddledome, Calgary",
          colors: ["#DD1A32", "#000000"]
        }
      ]
    },

    "edmonton": {
      name: "Edmonton",
      shortName: "Edmonton",
      abbr: "EDM",
      tz: "America/Edmonton",
      tzLabel: "MT",
      teams: [
        {
          key: "oilers",
          name: "Edmonton Oilers",
          short: "Oilers",
          leagueLabel: "NHL · Hockey",
          sportPath: "hockey/nhl",
          teamId: "6",
          match: "Edmonton Oilers",
          venue: "Rogers Place, Edmonton",
          colors: ["#00205B", "#FF4C00"]
        }
      ]
    },

    "vancouver": {
      name: "Vancouver",
      shortName: "Vancouver",
      abbr: "VAN",
      tz: "America/Los_Angeles",
      tzLabel: "PT",
      teams: [
        {
          key: "canucks",
          name: "Vancouver Canucks",
          short: "Canucks",
          leagueLabel: "NHL · Hockey",
          sportPath: "hockey/nhl",
          teamId: "22",
          match: "Vancouver Canucks",
          venue: "Rogers Arena, Vancouver",
          colors: ["#003E7E", "#008752"]
        },
        {
          key: "whitecaps",
          name: "Vancouver Whitecaps",
          short: "Whitecaps",
          leagueLabel: "MLS · Soccer",
          sportPath: "soccer/usa.1",
          teamId: "9727",
          match: "Vancouver Whitecaps",
          venue: "Vancouver Whitecaps",
          colors: ["#FFFFFF", "#12284C"]
        }
      ]
    },

    "winnipeg": {
      name: "Winnipeg",
      shortName: "Winnipeg",
      abbr: "WPG",
      tz: "America/Winnipeg",
      tzLabel: "CT",
      teams: [
        {
          key: "jets-nhl",
          name: "Winnipeg Jets",
          short: "Jets",
          leagueLabel: "NHL · Hockey",
          sportPath: "hockey/nhl",
          teamId: "28",
          match: "Winnipeg Jets",
          venue: "State Farm Arena, Atlanta",
          colors: ["#002D62", "#C41230"]
        }
      ]
    },

    "connecticut": {
      name: "Connecticut",
      shortName: "Connecticut",
      abbr: "CT",
      tz: "America/New_York",
      tzLabel: "ET",
      teams: [
        {
          key: "sun",
          name: "Connecticut Sun",
          short: "Sun",
          leagueLabel: "WNBA · Basketball",
          sportPath: "basketball/wnba",
          teamId: "18",
          match: "Connecticut Sun",
          venue: "Connecticut",
          colors: ["#F05023", "#0A2240"]
        }
      ]
    }
  }
  };
});
