---
page: home
---
<h1>Repos:</h1>
{% for repo in site.github.public_repositories %}
  * [{{ repo.name }}]({{ repo.html_url }})
{% endfor %}
<h1>Sandbox:</h1>
<ul>
	<li><a href="weather-forecast/weather_cost.html">Weather Cost</a></li>
	<li><a href="base64-to-hex/base64_to_bin.html">Base64 to Bin/Hex Converter</a></li>
	<li><a href="flag-test/flag_test.html">Flag Test</a></li>
    <li><a href="n-gon-diagram-examples/index.html">nGonDiagram Examples</a></li>
</ul>
