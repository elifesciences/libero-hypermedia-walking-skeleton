# Libero Hypermedia Walking Skeleton

## Starting point

- 1 front-end app
- 1 back-end app
- Monorepo
- Run from source
- Node.js
- Bare HTML output
- Understands [`http://schema.org/Article`](http://schema.org/Article) and [`http://schema.org/name`](https://schema.org/name)
  - Will pass through unknown properties
- Has [`CreateArticle`](https://schema.org/CreateAction) and [`Search`](https://schema.org/SearchAction) actions
- Ignore server-sent events
- JSON-LD only

## Running it

- Run `make`
- Open http://localhost:8080 to see the public-facing app
  - Fill out the 'Create an article' form
  - See the result appear in the list and basic search
  - Look at the logs to see responses from the API
    - Especially actions being created, which have their own URI.
- Open http://localhost:8081 to see the API
  - See links that can be followed, and actions that can be performed

## Notes

- JSON-LD will need a wrapper around it, as it can be in lots of different forms (eg single value, multiple value)
  - Doesn't appear to exist though?
- No tooling available about using Schema.org as hypermedia
  - Got me thinking about Hydra again, which does having tooling in JS (eg [Alcaeus](https://www.npmjs.com/package/alcaeus))
    - Still hard to understand, and not sure it adds anything over Schema.org
- Would Schema.org really be better than going for more specialist vocabularies (eg the [SPAR Ontologies](http://www.sparontologies.net/))?
  - Feels easier to adopt (probably a lot more familiar), but won't cover everything that we need
- Started to look at [rdflib.js](https://github.com/linkeddata/rdflib.js)
  - JSON-LD support appears to be broken, Turtle worked
  - API is quite nice, but going all in on RDF is probably a set to far
  - Hard to see how it would be persisted without using something completely unfamiliar (SPARQL, supported by Amazon Neptune)
  - Got Tim Berners-Lee behind it (used in https://solid.inrupt.com/)
