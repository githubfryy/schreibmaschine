## v0.12.4



## v0.12.3



## v0.12.2



## v0.12.0



### What's New


We added new `back` and `away` target modifiers thanks to [@djaiss](https://github.com/djaiss) ([#123](https://github.com/imacrayon/alpine-ajax/pull/123))

-   `target.back="my_element"` will target `my_element` only when the AJAX request redirects backto the same page.
    
-   `target.away="my_element"` will target `my_element` only when the AJAX request redirects awayto a new page.
    

We've deprecated the `_self` target since the `target.away` modifier is easier to grok. Instead of `target.3xx="_self"` use `target.away="_top"`.
There are more examples using the `back` and `away` modifiers in the documentation here: [https://alpine-ajax.js.org/reference/#targets-based-on-response-status-code](https://alpine-ajax.js.org/reference/#targets-based-on-response-status-code)


### What's fixed


-   We do a better job of normalizing URLs internally. Requests to relative URLs are now appropriately cached ([#124](https://github.com/imacrayon/alpine-ajax/pull/124))

Full Changelog: [v0.11.0...v0.12.0](https://github.com/imacrayon/alpine-ajax/compare/v0.11.0...v0.12.0)


## v0.11.0



### Happy New Year!


Just some quick fixes and clean up items before the year ends.


#### Breaking


For `GET` requests listening to the `ajax:send` event: `detail.body` will be `null` and this data will exist as query parameters in the URL of `detail.action` instead.


#### Fixed


-   Fixed simultaneous requests to the same URL aborting all requests ([#117](https://github.com/imacrayon/alpine-ajax/issues/117))
-   Fixed query strings mucking up redirect behavior ([#118](https://github.com/imacrayon/alpine-ajax/issues/118))

Full Changelog: [v0.10.5...v0.11.0](https://github.com/imacrayon/alpine-ajax/compare/v0.10.5...v0.11.0)


## v0.10.5


-   Fixed issues caused by targeting an element that is already being synced (with `x-sync`).

Full Changelog: [v0.10.4...v0.10.5](https://github.com/imacrayon/alpine-ajax/compare/v0.10.4...v0.10.5)


## v0.10.4



## v0.10.3



## v0.10.2


05 Nov 14:16


## v0.10.1