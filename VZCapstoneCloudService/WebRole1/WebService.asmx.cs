using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Net;
using System.Linq;
using System.Web;
using System.Web.Services;
using Microsoft.WindowsAzure.Storage;
using System.Configuration;
using Microsoft.WindowsAzure.Storage.Table;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.IO;
using Microsoft.WindowsAzure.Storage.Blob;
using System.Text;
using System.Threading.Tasks;

namespace WebRole1
{
    /// <summary>
    /// Summary description for WebService
    /// </summary>
    [WebService(Namespace = "http://tempuri.org/")]
    [WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
    [System.ComponentModel.ToolboxItem(false)]

    [System.Web.Script.Services.ScriptService]
    public class WebService : System.Web.Services.WebService
    {
        String openDataURL; // SDOT collision data endpoint
        int lastYear; // Most previous year
        String personFile; // Local filepath of PERSONS data table

        // Web method to call pull asynchronously to not run into scheduler timeout time
        [System.Web.Services.WebMethod()]
        public String startPull()
        {
            new Task(PullDataAndSave).Start();
            return "done";
        }

        // Called by asynchronous web method, pulls data from SODA endpoint and saves as formatted JSON locally
        private void PullDataAndSave()
        {
            openDataURL = "https://data.seattle.gov/resource/v7k9-7dn4.json";
            lastYear = DateTime.Today.AddYears(-1).Year;
            personFile = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, @"Data\COLLISION_PERSONS.csv");

            Stopwatch sw = new Stopwatch();
            sw.Start();

            // Final JSON list of collisions as List of JObjects
            Trace.TraceInformation("Started data get");
            List<JObject> collisions = getAllCollisionsAsObjects();

            // Make objects for progress bar and save to file
            {
                Trace.TraceInformation("Started progress");
                String progress = getProgressChartJSON(collisions);
                System.IO.File.WriteAllText(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, @"Data\progress.json"), progress);
            }

            Dictionary<String, JObject> collisionsDictionary = convertToDictionary(collisions);
            collisions = null; // No longer needed, save memory

            // Make objects for stacked bar chart and save to file
            {
                Trace.TraceInformation("Started stacked");
                String stacked = getStackedBarChartJSON(collisionsDictionary);
                System.IO.File.WriteAllText(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, @"Data\stackedBar.json"), stacked);
            }

            // Make objects for age chart and save to file
            {
                Trace.TraceInformation("Started age");
                String age = "", ageSpark = "";
                getAgeChartJSON(collisionsDictionary, out age, out ageSpark);
                System.IO.File.WriteAllText(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, @"Data\age.json"), age);
                System.IO.File.WriteAllText(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, @"Data\ageSpark.json"), ageSpark);
            }

            // Make objects for contributing factors chart and save to file
            {
                Trace.TraceInformation("Start contributing factors");
                String factors = "", factorsSpark = "";
                getContributingFactorsChartJSON(collisionsDictionary, out factors, out factorsSpark);
                System.IO.File.WriteAllText(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, @"Data\contributingFactors.json"), factors);
                System.IO.File.WriteAllText(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, @"Data\contributingFactorsSpark.json"), factorsSpark);
            }

            {
                // Makes obects for boxes containing injury ratios for bicylists and pedestrians
                Trace.TraceInformation("Start injury rates");
                String injuryRate = getBikeAndPedInjuryRates(collisionsDictionary); ;
                System.IO.File.WriteAllText(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, @"Data\inuryRates.json"), injuryRate);
            }

            Trace.TraceInformation("" + sw.Elapsed);
        }
        
        // Returns a List of JObjects representing the full JSON of SDOT collision data
        private List<JObject> getAllCollisionsAsObjects()
        {
            String url = openDataURL + "?$select=count(reportno)";
            var totalRecordsJSON = new WebClient().DownloadString(url);
            int totalRecords = Convert.ToInt32(totalRecordsJSON.Split('"')[3].Trim());
            List<JObject> result = new List<JObject>();

            // Get all records from SODA endpoint
            for (int i = 0; i < totalRecords; i += 49999)
            {
                // Get next block of 50k records
                url = openDataURL + "?$limit=49999&$offset=" + i;
                String response = new WebClient().DownloadString(url);
                List<JObject> temp = JsonConvert.DeserializeObject<List<JObject>>(response);
                result.AddRange(temp);
                Trace.TraceInformation("Completed one get iteration");
            }

            return result;
        }

        // Returns collision JSON string as a Dictionary 
        // with "coldetkey" (collision key) as String key and the corresponding JObject as the value
        private Dictionary<String, JObject> convertToDictionary(List<JObject> JObjects)
        {
            Dictionary<String, JObject> result = new Dictionary<String, JObject>();

            foreach (JObject jo in JObjects)
            {
                result.Add((String)jo.GetValue("coldetkey"), jo);
            }

            return result;
        }

        // Creates and returns JSON for use in VZ progress chart
        private String getProgressChartJSON(List<JObject> objects)
        {
            JArray result = new JArray(); // JArray representing serious/fatal collisions

            // Key: year as int, Value: number of serious injuries/fatalities for that year as int
            SortedDictionary<int, int> fatalitiesPerYear = new SortedDictionary<int, int>();

            // Iterate through each collision and find year
            // If there's a fatality, update dictionary for that year key
            foreach (JObject jo in objects)
            {
                int year = Convert.ToInt32(getCollisionYear(jo));

                // Add to dictionary if there is one or more fatalities or serious injuries
                if (collisionIsSeriousOrFatal(jo) && year >= 2004)
                {
                    // Add that many fatalities and serious injuries
                    int fatalities = (int)jo.GetValue("fatalities");
                    int seriousInjuries = (int)jo.GetValue("seriousinjuries");

                    AddCountToSortedDictionary(fatalitiesPerYear, year, fatalities + seriousInjuries);
                }
            }

            // Create formatted JArray for fatalities and serious injuries
            foreach (KeyValuePair<int, int> pair in fatalitiesPerYear)
            {
                JObject temp = JObject.FromObject(new
                {
                    y = pair.Value,
                    year = pair.Key
                });

                result.Add(temp);
            }

            // Return list of JObjects as JSON string
            return JsonConvert.SerializeObject(result);
        }

        // Creates and returns JSON used for stacked bar chart
        private String getStackedBarChartJSON(Dictionary<String, JObject> collisions)
        {
            var reader = new StreamReader(File.OpenRead(personFile)); // Read local PERSONS csv
            List<JArray> result = new List<JArray>();

            // Key: year as String, Value: number of participants in serious/fatal collisions for that year as int
            SortedDictionary<String, int> peds = new SortedDictionary<String, int>();
            SortedDictionary<String, int> bicycles = new SortedDictionary<String, int>();
            SortedDictionary<String, int> vehicles = new SortedDictionary<String, int>();

            // Read each line, except the first
            reader.ReadLine();

            // For each person, if they were seriously injured or killed,
            // add them to appropriate group dictionary
            while (!reader.EndOfStream)
            {
                String[] line = reader.ReadLine().Split(',');
                String type = line[19]; // type of participant (driver, etc.)
                String injury = line[15]; // type of injury
                String collisionKey = line[12]; // key tieing this person to a certain collision
                JObject collision; // Corresponding collision object

                // Check there is no missing information, collision key exists
                if (type != String.Empty && injury != String.Empty && collisionKey != String.Empty
                    && collisions.TryGetValue(collisionKey, out collision))
                {
                    int numType = Convert.ToInt32(type);
                    int numInjury = Convert.ToInt32(injury);

                    // Check the person was seriously injured or killed
                    if (numInjury > 1 && numInjury < 6)
                    {
                        switch (numType)
                        {
                            case 5:
                            case 6:
                                AddCountToSortedDictionary(vehicles, getCollisionYear(collision), 1);
                                break;
                            case 7:
                                AddCountToSortedDictionary(peds, getCollisionYear(collision), 1);
                                break;
                            case 8:
                            case 9:
                                AddCountToSortedDictionary(bicycles, getCollisionYear(collision), 1);
                                break;
                            default:
                                break;
                        }
                    }
                }
            }

            // Create formatted JSON objects as JArrays
            result.Add(createJArrayFromSortedDictionary(peds));
            result.Add(createJArrayFromSortedDictionary(bicycles));
            result.Add(createJArrayFromSortedDictionary(vehicles));

            // Return list of JArrays as JSON string
            return JsonConvert.SerializeObject(result);
        }

        // Creates and returns JSON used for age chart and corresponding sparklines into out variables
        private void getAgeChartJSON(Dictionary<String, JObject> collisions, out String chart, out String spark)
        {
            var reader = new StreamReader(File.OpenRead(personFile)); // Read local PERSONS csv

            // Define age ranges
            // Current format is: 16-29, 30-39 and so on until 69, then 70+
            List<AgeRange> ageRanges = new List<AgeRange>();
            ageRanges.Add(new AgeRange(16, 29));
            ageRanges.Add(new AgeRange(70, 99).setTitle("70+"));

            for (int i = 30; i < 70; i += 10)
            {
                ageRanges.Add(new AgeRange(i, i + 9));
            }

            // Read every line, except the first
            reader.ReadLine();

            while (!reader.EndOfStream)
            {
                String[] line = reader.ReadLine().Split(',');
                String type = line[19]; // type of participant (driver, etc.)
                String age = line[23]; // person age
                String collisionKey = line[12]; // key tieing this person to a certain collision
                JObject collision; // corresponding collision object

                // Check there is no missing information, collision key exists, collision is serious/fatal
                if (type != String.Empty && age != String.Empty && collisionKey != String.Empty
                    && collisions.TryGetValue(collisionKey, out collision)
                    && collisionIsSeriousOrFatal(collision))
                {
                    int numType = Convert.ToInt32(type);
                    int numAge = Convert.ToInt32(age);
                    int numYear = Convert.ToInt32(getCollisionYear(collision));

                    // The person is a driver, the recorded date is between last year and 5 years ago inclusive
                    if (numType == 5 && numYear <= lastYear && numYear >= lastYear - 4)
                    {
                        // Find appropriate age ranges
                        // If age ranges overlap, a collision will be added to all ranges applicable
                        foreach (AgeRange range in ageRanges)
                        {
                            if (numAge >= range.getMinimumAge() && numAge <= range.getMaximumAge())
                            {
                                range.AddCollision(numYear);
                            }
                        }
                    }
                }
            }

            // Age ranges now contain collision information from last 5 years
            // Sort age ranges based on amount of crashes in most recent year
            // Top 4 will be saved into JSON
            ageRanges.Sort();

            // Find upper bound for defining bar range in chart
            int max = -1;

            for (int i = 0; i < 4; i++)
            {
                AgeRange range = ageRanges[i];

                // last year
                int num1 = range.collisionsPerYear.Values.Last();

                // the year before
                int num2 = range.collisionsPerYear.Values.Reverse().Skip(1).First();

                max = Math.Max(max, Math.Max(num1, num2));
            }

            // Round to nearest 20
            max = roundUpToNearestN(20, max + 5);

            // Construct JSON for age chart
            List<JObject> ageList = new List<JObject>();
            List<JArray> sparkList = new List<JArray>();

            for (int i = 0; i < 4; i++)
            {
                AgeRange range = ageRanges[i];

                // Chart object
                JObject newJ = JObject.FromObject(new
                {
                    title = range.getTitle(),
                    ranges = new int[] { 0, max },
                    measures = new int[] { range.collisionsPerYear.Values.Last() },
                    markers = new int[] { range.collisionsPerYear.Values.Reverse().Skip(1).First() }
                });

                // Sparkline object
                JArray newJarray = new JArray();

                for (int j = lastYear - 4; j < lastYear + 1; j++)
                {
                    newJarray.Add(JObject.FromObject(new
                    {
                        date = j,
                        yValue = range.collisionsPerYear[j]
                    }));
                }

                ageList.Add(newJ);
                sparkList.Add(newJarray);
            }

            // Return list of JObjects and list of JArrays as JSON string
            chart = JsonConvert.SerializeObject(ageList);
            spark = JsonConvert.SerializeObject(sparkList);
        }

        // Creates and returns JSON used for contributing factors chart and corresponding sparklines into out variables
        private void getContributingFactorsChartJSON(Dictionary<String, JObject> collisions, out String chart, out String spark)
        {
            String codeFile = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, @"Data\SDOT_INCIDENT_WSDOT_CRCMSTNCCODE.csv");
            var reader = new StreamReader(File.OpenRead(personFile)); // Read PERSONS csv
            var codeReader = new StreamReader(File.OpenRead(codeFile)); // Read SRCMSTNCCODE csv
            Dictionary<String, Factor> factors = new Dictionary<String, Factor>();

            // Set of factors to be omitted from comparison
            HashSet<String> blackList = new HashSet<String>();
            blackList.Add("0"); // Unknown
            blackList.Add("17"); // Other
            blackList.Add("18"); // None
            blackList.Add("51"); // Unknown Driver Distraction
            blackList.Add("52"); // Driver Not Distracted

            // Read every line, except the first two
            codeReader.ReadLine();
            codeReader.ReadLine();

            // Create list of factor objects from code table
            while (!codeReader.EndOfStream)
            {
                String[] line = codeReader.ReadLine().Split(',');
                String factorCode = line[0];

                // Check not a blacklisted factor
                if (!blackList.Contains(factorCode))
                {
                    factors.Add(factorCode, new Factor(factorCode, line[4]));
                }
            }

            // Read every line, except the first
            reader.ReadLine();

            while (!reader.EndOfStream)
            {
                String[] line = reader.ReadLine().Split(',');
                String collisionKey = line[12];
                JObject collision;

                // Check collision key is not empty and is valid, person is driver, collision is serious/fatal
                if (collisionKey != String.Empty
                    && collisions.TryGetValue(collisionKey, out collision)
                    && collisionIsSeriousOrFatal(collision))
                {
                    int year = Convert.ToInt32(getCollisionYear(collision));

                    // Get factors
                    for (int i = 3; i < 6; i++)
                    {
                        String tempFactor = line[i];

                        // The factor is not empty and not blacklisted, 
                        // the recorded date is between last year and 5 years ago inclusive,
                        if (tempFactor != String.Empty && !blackList.Contains(tempFactor)
                            && year <= lastYear && year >= lastYear - 4)
                        {
                            factors[tempFactor].AddCollision(year);
                        }
                    }
                }
            }

            // Factors dictionary now contains collision information from last 5 years
            // List of factors sorted in terms of most collisions last year
            List<Factor> sortedFactors = new List<Factor>();

            foreach (KeyValuePair<String, Factor> pair in factors)
            {
                sortedFactors.Add(pair.Value);
            }

            sortedFactors.Sort();

            // Find upper bound
            int max = -1;

            for (int i = 0; i < 4; i++)
            {
                Factor factor = sortedFactors[i];

                // last year
                int num1 = factor.collisionsPerYear.Values.Last();

                // the year before
                int num2 = factor.collisionsPerYear.Values.Reverse().Skip(1).First();

                max = Math.Max(max, Math.Max(num1, num2));
            }

            // Round to nearest 20
            max = roundUpToNearestN(20, max + 5);

            List<JObject> factorList = new List<JObject>();
            List<JArray> sparkList = new List<JArray>();

            for (int i = 0; i < 4; i++)
            {
                Factor factor = sortedFactors[i];

                // Chart object
                JObject newJ = JObject.FromObject(new
                {
                    title = factor.getTitle(),
                    ranges = new int[] { 0, max },
                    measures = new int[] { factor.collisionsPerYear.Values.Last() },
                    markers = new int[] { factor.collisionsPerYear.Values.Reverse().Skip(1).First() }
                });

                // Sparkline object
                JArray newJarray = new JArray();

                for (int j = lastYear - 4; j < lastYear + 1; j++)
                {
                    newJarray.Add(JObject.FromObject(new
                    {
                        date = j,
                        yValue = factor.collisionsPerYear[j]
                    }));
                }

                factorList.Add(newJ);
                sparkList.Add(newJarray);
            }

            // Return list of JObjects and list of JArrays as JSON string
            chart = JsonConvert.SerializeObject(factorList);
            spark = JsonConvert.SerializeObject(sparkList);
        }

        // Creates and returns JSON used for biciclyst and pedestrian injury rate boxes
        private String getBikeAndPedInjuryRates(Dictionary<String, JObject> collisions)
        {
            var reader = new StreamReader(File.OpenRead(personFile)); // Read local PERSONS csv
            List<JObject> result = new List<JObject>();

            // Counts of total particpants and total injuries for bicicysts and injuries
            int bicParticipants = 0;
            int pedParticipants = 0;
            int bicInjuries = 0;
            int pedInjuries = 0;

            String thisYear = "" + (lastYear + 1);

            // Read every line, except the first
            reader.ReadLine();

            while (!reader.EndOfStream)
            {
                String[] line = reader.ReadLine().Split(',');
                String type = line[19]; // type of participant (driver, etc.)
                String injury = line[15]; // type of injury
                String collisionKey = line[12]; // key tieing this person to a certain collision
                JObject collision; // corresponding collision object

                // Check there is no missing information, collision key exists, collision is in current year
                if (type != String.Empty && injury != String.Empty && collisionKey != String.Empty
                    && collisions.TryGetValue(collisionKey, out collision)
                    && getCollisionYear(collision).Equals(thisYear))
                {
                    int numType = Convert.ToInt32(type);
                    int numInjury = Convert.ToInt32(injury);

                    // Person is either a pedestrian or a bicycle rider
                    switch (numType)
                    {
                        case 7:
                            pedParticipants++;

                            // Received at least a possible injury
                            if (numInjury > 1 && numInjury < 8)
                            {
                                pedInjuries++;
                            }
                            break;
                        case 8:
                        case 9:
                            bicParticipants++;

                            // Received at least a possible injury
                            if (numInjury > 1 && numInjury < 8)
                            {
                                bicInjuries++;
                            }
                            break;
                        default:
                            break;
                    }
                }
            }

            // Add object for bicycles
            result.Add(JObject.FromObject(new
            {
                bicInjury = bicInjuries,
                bicParticipant = bicParticipants
            }));

            // Add object for pedestrians
            result.Add(JObject.FromObject(new
            {
                pedInjury = pedInjuries,
                pedParticipant = pedParticipants
            }));

            return JsonConvert.SerializeObject(result);
        }

        // Adds given count value to given key value (int) in given SortedDictionary<int, int>
        private void AddCountToSortedDictionary(SortedDictionary<int, int> dic, int year, int count)
        {
            if (count != 0)
            {
                if (!dic.ContainsKey(year))
                {
                    dic.Add(year, count);
                }
                else
                {
                    dic[year] += count;
                }
            }
        }

        // Adds given count value to given key value (String) in given SortedDictionary<String, int>
        private void AddCountToSortedDictionary(SortedDictionary<String, int> dic, String year, int count)
        {
            if (count != 0)
            {
                if (!dic.ContainsKey(year))
                {
                    dic.Add(year, count);
                }
                else
                {
                    dic[year] += count;
                }
            }
        }

        // Creates JArray filled with JObjects for stacked bar chart
        // based on given SortedDicitonary of collision JSON
        private JArray createJArrayFromSortedDictionary(SortedDictionary<String, int> dic)
        {
            JArray result = new JArray();

            foreach (KeyValuePair<String, int> pair in dic)
            {
                result.Add(JObject.FromObject(new { year = pair.Key, y = pair.Value }));
            }

            return result;
        }

        // Returns true if given JObject representing a collision
        // contains a serious injury or fatality
        private Boolean collisionIsSeriousOrFatal(JObject collision)
        {
            return (int)collision.GetValue("fatalities") > 0 
                || (int)collision.GetValue("seriousinjuries") > 0;
        }

        // Returns String year of collision from collision JObject
        private String getCollisionYear(JObject collision)
        {
            String date = (String)collision.GetValue("incdttm");
            return date.Split('/')[2].Substring(0, 4);
        }

        // Returns number closest multiple of n rounded up from given number
        private int roundUpToNearestN(int n, int num)
        {
            if (num % n != 0)
            {
                return num + n - (num % n);
            }

            return num;
        }

        // An implementation of an age range of drivers involved in serious/fatal
        // collisions over a certain span of years
        // Can be compared to other age ranges by amount of collisions in most recent year
        private class AgeRange : IComparable
        {
            // Human readable title for age range in the format "xx - yy"
            private String plainTextTitle;

            // Minimum age that can be included in this range
            private int minimumAge;

            // Maximum age that can be included in this range
            private int maximumAge;

            // Relationship of serious/fatal collisions this age range is responsible for
            // Key: year as int, value: total number of serious/fatal collisions for that year as int
            public SortedDictionary<int, int> collisionsPerYear;
            
            // Constructs an AgeRange given range lower bound and upper bound
            public AgeRange(int min, int max)
            {
                minimumAge = min;
                maximumAge = max;
                plainTextTitle = min + " - " + max;
                collisionsPerYear = new SortedDictionary<int, int>();
            }

            // Returns title
            public String getTitle() { return plainTextTitle; }

            // Returns minimum age necessary to be considered part of this group
            public int getMinimumAge() { return minimumAge; }

            // Returns maximum age to be considered part of this group
            public int getMaximumAge() { return maximumAge; }

            // Sets this age range's title to given and returns this AgeRange
            public AgeRange setTitle(String newTitle) 
            { 
                plainTextTitle = newTitle;
                return this;
            }

            // Adds one collision to the value of the given year key in local dictionary
            public void AddCollision(int year)
            {
                if (!collisionsPerYear.ContainsKey(year))
                {
                    collisionsPerYear.Add(year, 1);
                }
                else
                {
                    collisionsPerYear[year] += 1;
                }
            }

            // Returns 1 if this age range has more collisions in the most recent year,
            // returns 0 if the amount is the same, -1 if less
            public int CompareTo(object otherRange)
            {
                // No collisions stored in this range and other range respectively
                if (collisionsPerYear.Values.Count == 0)
                {
                    return 1;
                }
                else if (((AgeRange)otherRange).collisionsPerYear.Values.Count == 0)
                {
                    return -1;
                }

                int thisCollisions = collisionsPerYear.Values.Last();
                int otherCollisions = ((AgeRange) otherRange).collisionsPerYear.Values.Last();

                if (thisCollisions > otherCollisions) { return -1; }
                else if (thisCollisions < otherCollisions) { return 1; }
                else { return 0; }
            }
        }

        // An implementation of contributing or circumstancial factors in serious/fatal
        // collisions over a certain span of years
        // Can be compared to other factors by amount of collisions in most recent year
        private class Factor : IComparable
        {
            // Human readable title, as given by code table
            private String plainTextTitle;

            // Code index, as given by code table
            private String code;

            // Relationship of serious/fatal injuries to given year for this factor
            // Key: year as int, value: total number of serious/fatal collisions for that year as int
            public SortedDictionary<int, int> collisionsPerYear;

            // Constructs a Factor given SDOT factor code and plain text description
            public Factor(String code, String descr)
            {
                this.code = code;
                this.plainTextTitle = descr;
                collisionsPerYear = new SortedDictionary<int, int>();
            }

            // Returns code
            public String getCode() { return code; }
            
            // Returns title
            public String getTitle() { return plainTextTitle; }

            // Adds one collision to the value of the given year key in local dictionary
            public void AddCollision(int year)
            {
                if (!collisionsPerYear.ContainsKey(year))
                {
                    collisionsPerYear.Add(year, 1);
                }
                else
                {
                    collisionsPerYear[year] += 1;
                }
            }

            // Returns 1 if this factor has more collisions in the most recent year,
            // returns 0 if the amount is the same, -1 if less
            public int CompareTo(object otherFactor)
            {
                // No collisions stored in this factor and other factor respectively
                if(collisionsPerYear.Values.Count == 0)
                {
                    return 1;
                }
                else if (((Factor) otherFactor).collisionsPerYear.Values.Count == 0)
                {
                    return -1;
                }

                int thisCollisions = collisionsPerYear.Values.Last();
                int otherCollisions = ((Factor)otherFactor).collisionsPerYear.Values.Last();

                if (thisCollisions > otherCollisions) { return -1; }
                else if (thisCollisions < otherCollisions) { return 1; }
                else { return 0; }
            }
        }
    }
}
