// https://www.jvandemo.com/how-to-use-environment-variables-to-configure-your-angular-application-without-a-rebuild/
(function (window) {
  window.__env = window.__env || {};

  // environment-dependent settings
  window.__env.apiUrl = "http://localhost:5152/api/";
  window.__env.version = '8.1.0';
  window.__env.thesImportEnabled = true;
})(this);
