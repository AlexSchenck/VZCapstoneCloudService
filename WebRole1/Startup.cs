﻿using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.Owin;
using Owin;

[assembly: OwinStartup(typeof(WebRole1.Startup))]

namespace WebRole1
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
        }
    }
}
