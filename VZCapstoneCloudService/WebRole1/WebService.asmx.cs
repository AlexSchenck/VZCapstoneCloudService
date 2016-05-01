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
            //Determine total records
            String url = "https://data.seattle.gov/resource/v7k9-7dn4.json?$select=count(reportno)";
            var totalRecordsJSON = new WebClient().DownloadString(url);
            int totalRecords = Convert.ToInt32(totalRecordsJSON.Split('"')[3].Trim());
            
            // Final JSON list of collisions
            List<JObject> collisions = new List<JObject>();

            // List of object for Map
            List<JObject> mapPoints = new List<JObject>();

            Stopwatch sw = new Stopwatch();
            sw.Start();
            
            // Get all records from soda endpoint
            for (int i = 0; i < totalRecords; i += 49999)
            {
                // Get next block of 50k records
                url = "https://data.seattle.gov/resource/v7k9-7dn4.json?$limit=49999&$offset=" + i;
                String response = new WebClient().DownloadString(url);

                List<JObject> responseList = JsonConvert.DeserializeObject<List<JObject>>(response);

                // Remove unnecessary fields to save space
                foreach (JObject jo in responseList)
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

                    collisions.Add(jo);
                }

                Trace.TraceInformation("Completed iteration");
            }

            //System.IO.File.WriteAllText(@"C:\Users\Alex\Desktop\ALLDATA.txt", allRecords);

            /*
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

            Trace.TraceInformation("Time to serialize and reduce all data: " + sw.Elapsed);
            Trace.TraceInformation("" + collisions.Count);
            Trace.TraceInformation("" + collisions[0]);
            sw.Restart();

            // Make for map
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

            return "done";
        }
    }
}
