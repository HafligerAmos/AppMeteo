using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EsempioMeteo
{
    public class WeatherApiConfig
    {
        public string ApiKey { get; set; }
        public string BaseUrl { get; set; }

        public WeatherApiConfig()
        {
            // Inserisci la tua API key qui
            ApiKey = "617feaa2a3d5475ca8592447241610";
            BaseUrl = "https://api.openweathermap.org/data/2.5/";
        }
    }

}
