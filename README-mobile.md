# Using mobile views

In the ApplicationController there is a method "mobile_request?" which determines whether a given request is from a mobile client or not. Currently, a request is considered a mobile request if the domain name contains a 'm' subdomain. This method could easily be changed to use a path prefix, user agent, boolean or other criteria. The rest of this section details how to set up a machine to fake being a mobile client using this 'm' subdomain approach.

To use the mobile views (as a client), you need to access the site via an 'm' subdomain, e.g. m.maphub.com. In order to make this happen you need to either:

1. Set up DNS to resolve an actual subdomain hostname for your domain. This should probably be a CNAME record (alias) for your primary domain name.
2. Bypass DNS and use your system's "hosts" file to direct requests for the 'm' subdomain to the correct server.

To set up the latter option, edit your hosts file (on Unix/Linux this is /etc/hosts, on Windows the location varies but generally C:\Windows\system32\drivers\etc\hosts) and add a line like:

127.0.0.1 m.localhost.int

Note that you *must* have the full three domain parts (hostname, domain and top-level domain) for Rails to understand the hostname. In other words, you need x.y.z, not y.z, so m.localhost will not work. You may use the localhost IP address as shown here or insert your server's IP address.

Once this change is made, simply navigate to the server (e.g. http://m.localhost.int:3000/maps/6). Rails should notice the 'm' subdomain and use mobile views if they exist.

# Changes from upstream

app/controllers/application_controller.rb

Two methods were added to allow mobile views to be used and preferred over non-mobile views (and allow fall-back to non-mobile views): "prepend_mobile_path" and "mobile_request?".

app/views/layouts/default.html.erb

Two "yield" statements were added with section labels so the mobile views can "insert" code in either the <head> tag or the container <div> of the layout document.

