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
            String collisions = getAllCollisions();

            saveProgressChartJSON(String.Copy(collisions));
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
                    jo.Remove("coldetkey");
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

        // Creates and saves JSON for use in VZ progress chart
        private void saveProgressChartJSON(String collisionJSON)
        {
            List<JObject> objects = convertToList(collisionJSON, false);
            SortedDictionary<int, int> fatalitiesPerYear = new SortedDictionary<int, int>();
            List<JObject> resultObjects = new List<JObject>();
            String resultString = "";

            // For each collision find year
            // If there's a fatality, update dictionary for that year key
            foreach (JObject jo in objects)
            {
                int fatalities = (int) jo.GetValue("fatalities");
                
                // Add to dictionary if there is one or more fatalities
                if (fatalities > 0)
                {
                    String date = (String) jo.GetValue("incdttm");
                    int year = Convert.ToInt32(date.Split('/')[2].Substring(0, 4));

                    // Year not yet found, add new key with value of "fatalities"
                    if (!fatalitiesPerYear.ContainsKey(year))
                    {
                        fatalitiesPerYear.Add(year, fatalities);
                    }
                    else
                    {
                        fatalitiesPerYear[year] += fatalities;
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

            resultString = JsonConvert.SerializeObject(resultObjects);

            // Save to dashboard table
            String connectionString = ConfigurationManager.AppSettings["StorageConnectionString"];
            CloudStorageAccount storageAccount = CloudStorageAccount.Parse("DefaultEndpointsProtocol=https;AccountName=visionzerostorage;AccountKey=gub7wrXQbWsNxb2vW4+MqhXPKFo9Ik9GtugE3b590NCnNHspYZHYRU/SdwW9BziNiPQlN6mz2P2rlIVK/is5TQ==");
            CloudTableClient tableClient = storageAccount.CreateCloudTableClient();
            CloudTable collisionDataTable = tableClient.GetTableReference("dashboarddata");
            collisionDataTable.CreateIfNotExists();

            TableEntity te = new TableEntity("progress", resultString);
            TableOperation to = TableOperation.Insert(te);
            collisionDataTable.Execute(to);
        }
    }
}
