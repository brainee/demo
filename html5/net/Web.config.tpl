<?xml version="1.0" encoding="utf-8" ?>
<!--
  For more information on how to configure your ASP.NET application, please visit
  http://go.microsoft.com/fwlink/?LinkId=169433
  -->
<configuration>
  <configSections>
    <!-- For more information on Entity Framework configuration, visit http://go.microsoft.com/fwlink/?LinkID=237468 -->
    <section name="entityFramework" type="System.Data.Entity.Internal.ConfigFile.EntityFrameworkSection, EntityFramework, Version=4.4.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089" requirePermission="false" />
  </configSections>
  <appSettings configSource="Config\AppSetting.config" />
  <system.web>
    <compilation targetFramework="4.0" />
  </system.web>
  <system.webServer>
    <modules runAllManagedModulesForAllRequests="true" />
  </system.webServer>
  <runtime>
    <assemblyBinding xmlns="urn:schemas-microsoft-com:asm.v1">
      <dependentAssembly>
        <assemblyIdentity name="DotNetOpenAuth.Core" publicKeyToken="2780ccd10d57b246" />
        <bindingRedirect oldVersion="1.0.0.0-4.0.0.0" newVersion="4.1.0.0" />
      </dependentAssembly>
      <dependentAssembly>
        <assemblyIdentity name="DotNetOpenAuth.AspNet" publicKeyToken="2780ccd10d57b246" />
        <bindingRedirect oldVersion="1.0.0.0-4.0.0.0" newVersion="4.1.0.0" />
      </dependentAssembly>
    </assemblyBinding>
  </runtime>
  <entityFramework>
    <defaultConnectionFactory type="System.Data.Entity.Infrastructure.SqlConnectionFactory, EntityFramework" />
  </entityFramework>
</configuration>