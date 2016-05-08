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
        [WebMethod]
        public String TestJSON()
        {   
            // Final JSON list of collisions as string
            Trace.TraceInformation("Started data get");
            //String collisions = getAllCollisions();
            String collisions = "";

            Trace.TraceInformation("Started progress");
            //String progress = getProgressChartJSON(String.Copy(collisions));
            String progress = "";

            Trace.TraceInformation("Started stacked");
            //String stacked = getStackedBarChartJSON(String.Copy(collisions));
            String stacked = "";

            Trace.TraceInformation("Started age");
            String age = "", ageSpark = "";
            getAgeChartJSON(out age, out ageSpark);

            Trace.TraceInformation("Started table entry");
            // Save to dashboard table
            String connectionString = ConfigurationManager.AppSettings["StorageConnectionString"];
            CloudStorageAccount storageAccount = CloudStorageAccount.Parse("DefaultEndpointsProtocol=https;AccountName=visionzerostorage;AccountKey=gub7wrXQbWsNxb2vW4+MqhXPKFo9Ik9GtugE3b590NCnNHspYZHYRU/SdwW9BziNiPQlN6mz2P2rlIVK/is5TQ==");
            CloudTableClient tableClient = storageAccount.CreateCloudTableClient();
            CloudTable collisionDataTable = tableClient.GetTableReference("dashboarddata");
            collisionDataTable.CreateIfNotExists();

            // Delete old Progress Bar data, add new
            TableQuery<TableEntity> query = new TableQuery<TableEntity>()
                .Where(TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, "progress"));
            foreach(TableEntity entity in collisionDataTable.ExecuteQuery(query))
            {
                TableOperation op = TableOperation.Delete(entity);
                collisionDataTable.Execute(op);
            }

            TableEntity te = new TableEntity("progress", progress);
            TableOperation to = TableOperation.Insert(te);
            collisionDataTable.Execute(to);

            // Delete old Stacked Bar Chart data, add new
            query = new TableQuery<TableEntity>()
                .Where(TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, "stacked"));
            foreach (TableEntity entity in collisionDataTable.ExecuteQuery(query))
            {
                TableOperation op = TableOperation.Delete(entity);
                collisionDataTable.Execute(op);
            }

            te = new TableEntity("stacked", stacked);
            to = TableOperation.Insert(te);
            collisionDataTable.Execute(to);

            // Delete old Age Chart data, add new
            query = new TableQuery<TableEntity>()
                .Where(TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, "age"));
            foreach (TableEntity entity in collisionDataTable.ExecuteQuery(query))
            {
                TableOperation op = TableOperation.Delete(entity);
                collisionDataTable.Execute(op);
            }

            te = new TableEntity("age", age);
            to = TableOperation.Insert(te);
            collisionDataTable.Execute(to);

            // Create age JSON, age spark JSON
            // Create contributing factors JSON, contributing factors spark JSON
            // Create stackedbar JSON
            // Create map JSON, store locally as flat file OR year-to-year in table



            /*
            Stopwatch sw = new Stopwatch();
            sw.Start();
            */

            //System.IO.File.WriteAllText(@"C:\Users\Alex\Desktop\ALLDATA.txt", allRecords);

            /* Upload to table
            String connectionString = ConfigurationManager.AppSettings["StorageConnectionString"];
            CloudStorageAccount storageAccount = CloudStorageAccount.Parse("DefaultEndpointsProtocol=https;AccountName=visionzerostorage;AccountKey=gub7wrXQbWsNxb2vW4+MqhXPKFo9Ik9GtugE3b590NCnNHspYZHYRU/SdwW9BziNiPQlN6mz2P2rlIVK/is5TQ==");
            CloudTableClient tableClient = storageAccount.CreateCloudTableClient();
            CloudTable collisionDataTable = tableClient.GetTableReference("collisiondatatable");
            collisionDataTable.CreateIfNotExists();

            TableEntity te = new TableEntity("full data", allRecords);
            TableOperation to = TableOperation.Insert(te);
            collisionDataTable.Execute(to);
            */

            //JsonConvert.DeserializedObject<Collision>(allRecords);

            //Trace.TraceInformation("Time to download and save string: " + sw.Elapsed);
            //sw.Restart();

            /* Convert all JObjects to strings
            int i2 = 1;
            foreach (JObject jo in collisions)
            {
                stringCollisions += JsonConvert.SerializeObject(jo);
                Trace.TraceInformation("" + i2);
                i2++;
            }
            */

            /* Save to blob
            // Connect to blob container
            String connectionString = ConfigurationManager.AppSettings["StorageConnectionString"];
            CloudStorageAccount storageAccount = CloudStorageAccount.Parse("DefaultEndpointsProtocol=https;AccountName=visionzerostorage;AccountKey=gub7wrXQbWsNxb2vW4+MqhXPKFo9Ik9GtugE3b590NCnNHspYZHYRU/SdwW9BziNiPQlN6mz2P2rlIVK/is5TQ==");
            CloudBlobClient blobClient = storageAccount.CreateCloudBlobClient();
            CloudBlobContainer collisionContainer = blobClient.GetContainerReference("collisions");
            collisionContainer.CreateIfNotExists();

            // Upload blob
            CloudBlockBlob collisionBlob = collisionContainer.GetBlockBlobReference("collisions");
            collisionBlob.UploadText(stringCollisions);

            Trace.TraceInformation("Time to save blob: " + sw.Elapsed);
            sw.Restart();
            */

            /* Downloading blob as string
            string test = "";
            using (var memoryStream = new MemoryStream())
            {
                collisionBlob.DownloadToStream(memoryStream);
                test = System.Text.Encoding.UTF8.GetString(memoryStream.ToArray());
            }

            Trace.TraceInformation("Time to download blob: " + sw.Elapsed);
            Trace.TraceInformation("" + test.Length);
            sw.Restart();
            */

            /* All map data
            // Make for map
            // List of object for Map
            //List<JObject> mapPoints = new List<JObject>();
            foreach (JObject c in collisions)
            {
                double lat = Convert.ToDouble((String) c.SelectToken(@"shape.latitude"));
                double lon = Convert.ToDouble((String) c.SelectToken(@"shape.longitude"));
                String loc = (String) c.SelectToken(@"location");
                String weather = (String) c.SelectToken(@"weather");

                JObject newJ = JObject.FromObject(new
                {
                    type = "Feature",
                    geometry = new 
                    {
                        type = "Point",
                        coordinates = new double[] {lon, lat}
                    },
                    properties = new 
                    {
                        location = loc,
                        weather = weather
                    }
                });
                
                mapPoints.Add(newJ);
            }

            using (StreamWriter writer = new StreamWriter(@"C:\Users\Alex\Desktop\map.geojson"))
            {
                foreach (JObject jo in mapPoints)
                {
                    writer.Write(jo + ", ");
                }
            }

            Trace.TraceInformation("Time to convert to map points: " + sw.Elapsed);
            Trace.TraceInformation("" + mapPoints.Count);
            Trace.TraceInformation("" + mapPoints[0]);
            sw.Restart();
            */

            return "done";
        }

        // Returns a String representing the full JSON of SDOT collision data
        private String getAllCollisions()
        {
            String result = "[";

            //Determine total records
            String url = "https://data.seattle.gov/resource/v7k9-7dn4.json?$select=count(reportno)";
            var totalRecordsJSON = new WebClient().DownloadString(url);
            int totalRecords = Convert.ToInt32(totalRecordsJSON.Split('"')[3].Trim());

            // Get all records from SODA endpoint
            for (int i = 0; i < totalRecords; i += 49999)
            {
                // Get next block of 50k records
                url = "https://data.seattle.gov/resource/v7k9-7dn4.json?$limit=49999&$offset=" + i;
                String response = new WebClient().DownloadString(url);
                result += response.Substring(2, response.Length - 3) + ",";

                Trace.TraceInformation("yep");
            }

            return result + "]";
        }

        // Returns collision JSON string to list of JObjects
        // and removes all "unnecessary" fields if flag is true
        private List<JObject> convertToList(String collisionJSON, Boolean clean)
        {
            List<JObject> jsonObjects = JsonConvert.DeserializeObject<List<JObject>>(collisionJSON);

            if (clean)
            {
                List<JObject> result = new List<JObject>();

                // Remove unnecessary fields to save space
                foreach (JObject jo in jsonObjects)
                {
                    jo.Remove("sdot_colcode");
                    jo.Remove("sdotcolnum");
                    jo.Remove("st_colcode");
                    jo.Remove("inckey");
                    jo.Remove("segkey");
                    jo.Remove("status");
                    jo.Remove("width");
                    jo.Remove("seglanekey");
                    jo.Remove("intkey");
                    jo.Remove("objectid");
                    jo.Remove("incdate");

                    result.Add(jo);
                }

                return result;
            }
            else
            {
                return jsonObjects;
            }
        }

        // Creates and returns JSON for use in VZ progress chart
        private String getProgressChartJSON(String collisionJSON)
        {
            List<JObject> objects = convertToList(collisionJSON, true);
            List<JObject> resultObjects = new List<JObject>();

            SortedDictionary<int, int> fatalitiesPerYear = new SortedDictionary<int, int>();

            // For each collision find year
            // If there's a fatality, update dictionary for that year key
            foreach (JObject jo in objects)
            {
                int fatalities = (int)jo.GetValue("fatalities");
                int seriousinjuries = (int)jo.GetValue("seriousinjuries");
                
                // Add to dictionary if there is one or more fatalities
                if (fatalities > 0 || seriousinjuries > 0)
                {
                    String date = (String)jo.GetValue("incdttm");
                    int year = Convert.ToInt32(date.Split('/')[2].Substring(0, 4));

                    // Year not yet found, add new key with value of "fatalities"
                    if (!fatalitiesPerYear.ContainsKey(year))
                    {
                        fatalitiesPerYear.Add(year, fatalities + seriousinjuries);
                    }
                    else
                    {
                        fatalitiesPerYear[year] += fatalities + seriousinjuries;
                    }
                }
            }

            // Create formatted JObjects
            foreach (KeyValuePair<int, int> pair in fatalitiesPerYear)
            {
                JObject temp = JObject.FromObject(new
                {
                    y = pair.Value,
                    year = pair.Key
                });

                resultObjects.Add(temp);
            }

            return JsonConvert.SerializeObject(resultObjects);
        }

        // Creates and returns JSON used for stacked bar chart
        private String getStackedBarChartJSON(String collisionJSON)
        {
            List<JObject> objects = convertToList(collisionJSON, true);
            List<JArray> resultObjects = new List<JArray>();

            SortedDictionary<String, int> peds = new SortedDictionary<String, int>();
            SortedDictionary<String, int> bicycles = new SortedDictionary<String, int>();
            SortedDictionary<String, int> vehicles = new SortedDictionary<String, int>();

            // For each collision, if there is a serious injury or fatality,
            // regardless of how many, add number of peds, bicyclists, and vehicles
            // involved for that year
            foreach (JObject jo in objects)
            {
                if ((int)jo.GetValue("fatalities") > 0 || (int)jo.GetValue("seriousinjuries") > 0)
                {
                    String date = (String)jo.GetValue("incdttm");
                    String year = date.Split('/')[2].Substring(0, 4);

                    AddCountToSortedDictionary(peds, year, (int)jo.GetValue("pedcount"));
                    AddCountToSortedDictionary(bicycles, year, (int)jo.GetValue("pedcylcount"));
                    AddCountToSortedDictionary(vehicles, year, (int)jo.GetValue("vehcount"));
                }
            }

            // Create formatted JSON objects as JArrays
            resultObjects.Add(createJArrayFromSortedDictionary(peds));
            resultObjects.Add(createJArrayFromSortedDictionary(bicycles));
            resultObjects.Add(createJArrayFromSortedDictionary(vehicles));

            return JsonConvert.SerializeObject(resultObjects);
        }

        // Adds given count value to given key value in given SortedDictionary
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

        // Creates JArray for stacked bar chart based on given SortedDicitonary of collision JSON
        private JArray createJArrayFromSortedDictionary(SortedDictionary<String, int> dic)
        {
            JArray result = new JArray();

            foreach (KeyValuePair<String, int> pair in dic)
            {
                result.Add(JObject.FromObject(new { year = pair.Key, y = pair.Value }));
            }

            return result;
        }

        private void getAgeChartJSON(out String chart, out String spark)
        {
            String personFile = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, @"Data\COLLISION_PERSONS.csv");
            var reader = new StreamReader(File.OpenRead(personFile)); // Read PERSONS csv
            int lastYear = DateTime.Today.AddYears(-1).Year; // Most previous year

            // Read every line, except the first
            Boolean firstLine = true;

            // Define age ranges
            // Current format is: 10-19, 20-29, and so on until 99
            List<AgeRange> ageRanges = new List<AgeRange>();

            for (int i = 10; i < 100; i += 10)
            {
                ageRanges.Add(new AgeRange(i, i + 9));
            }

            while (!reader.EndOfStream)
            {
                if (firstLine)
                {
                    reader.ReadLine();
                    firstLine = false;
                }
                else
                {
                    String[] line = reader.ReadLine().Split(',');
                    String type = line[19]; // type of participant (driver)
                    String age = line[23]; // person age
                    String year = line[30].Substring(line[30].Length - 4); // year of collision
                    
                    // If there is no missing information
                    if (type != String.Empty && age != String.Empty && year != String.Empty)
                    {
                        int numType = Convert.ToInt32(type);
                        int numAge = Convert.ToInt32(age);
                        int numYear = Convert.ToInt32(year);

                        //The person is a driver, and the recorded date is between last year and 5 years ago inclusive
                        if (numType == 6 && numYear <= lastYear && numYear >= lastYear - 4)
                        {
                            // Find first appropriate age range
                            for (int i = 0; i < ageRanges.Count; i++)
                            {
                                AgeRange range = ageRanges[i];
                                if (numAge > range.getMinimumAge() && numAge < range.getMaximumAge())
                                {
                                    range.AddCollision(numYear);
                                    break;
                                }
                            }
                        }
                    }
                }
            }

            // Sort age ranges based on amount of crashes in most recent year
            // Top 4 will be saved into JSON
            ageRanges.Sort();

            List<JObject> ageList = new List<JObject>();

            for (int i = 0; i < 4; i++)
            {
                AgeRange range = ageRanges[i];

                JObject newJ = JObject.FromObject(new
                {
                    title = range.getTitle(),
                    ranges = new int[] { 0, 4000 },
                    measures = new int[] { range.collisionsPerYear.Values.Last() },
                    markers = new int[] { range.collisionsPerYear.Values.Reverse().Skip(1).First() }
                });

                ageList.Add(newJ);
            }

            chart = JsonConvert.SerializeObject(ageList);
            spark = "";
        }

        // An implementation of an age range of drivers involved in serious/fatal
        // collisions over a certain span of years
        private class AgeRange : IComparable
        {
            // Human readable title for age range in the format "xx - yy"
            private String plainTextTitle;

            // Minimum age that can be included in this range
            private int minimumAge;

            // Maximum age that can be included in this range
            private int maximumAge;

            // Relationship of serious/fatal collisions this age range is responsible for
            public SortedDictionary<int, int> collisionsPerYear;
            
            public AgeRange(int min, int max)
            {
                minimumAge = min;
                maximumAge = max;
                plainTextTitle = min + " - " + max;
                collisionsPerYear = new SortedDictionary<int, int>();
            }

            public String getTitle() { return plainTextTitle; }

            public int getMinimumAge() { return minimumAge; }

            public int getMaximumAge() { return maximumAge; }

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
                int thisCollisions = collisionsPerYear.Values.Last();
                int otherCollisions = ((AgeRange) otherRange).collisionsPerYear.Values.Last();

                if (thisCollisions > otherCollisions) { return -1; }
                else if (thisCollisions < otherCollisions) { return 1; }
                else { return 0; }
            }
        }
    }
}
