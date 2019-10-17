## Authorization scenarios

### 1. The public can access a published scholarly article through the front end.

There is no authentication token on the front end, so the API calls are by default associated to this `Audience`:

```
{
    "@type": "http://schema.org/Audience",
    "audienceType": "public"
}
```

The document itself grants a `ReadPermission` `DigitalDocumentPermission`.

### 2. A scholarly article in preview is not visible to the public.

Similarly with a `public` `Audience`, the `Article` is not present in listings.

Moreover, the `Article` resouce returns a 404 if loaded directly (but there is no navigation link to it).

### 3. A scholarly article in preview is visible to production team members.

After logging in with a preferred mechanism, the authentication token in the front end has a claim for this `Audience`:

```
{
    "@type": "http://schema.org/Audience",
    "audienceType": "production"
}
```

Listings contain the article, and allow to navigate to it.

### 4. Production team members can publish the scholarly article.

With a `production` `Audience`, a `PublishAction` is shown as part of `potentialAction`. Moreover, the `Article` grants a `WritePermission` to this `Audience`; therefore, the action can be performed.

### 5. Editorial team members cannot publish an article.

The options are alternative, but could also both be supported.

#### Option A: `WritePermission` necessary

With a `editorial` `Audience`, a `PublishAction` is shown as part of `potentialAction`. However, the `Article` grants a `ReadPermission` to this `Audience`; therefore:

- the action may be displayed by a front end but not as executable (imagine a grayed out button)

#### Option B: `participant` in `Action`

With a `editorial` `Audience`, a `PublishAction` is shown as part of `potentialAction` having this audience as a `participant` rather than an `Agent`; therefore:

- the action may be displayed by a front end but not as executable (imagine a grayed out button)

### 6. An article is being ingested, so it cannot be published yet; that action will appear in the future. This is true for all clients.

The `potentialAction` contains:

```
{
    "@type": "PublishAction",
    "actionStatus": "PotentialActionStatus",
    "requiresCompletionOf": {
        "@type": "IngestAction",
        "actionStatus": "ActiveActionStatus"
    }
}
```

7. An administrator can add people to the production team

```
{
    "@type": "Audience",
    "audienceType": "production",
    # doesn't look right on a generic resource that is not content
    "http://schema.org/hasDigitalDocumentPermission": [
		{
			"@type": "http://schema.org/DigitalDocumentPermission",
			"http://schema.org/permissionType": "AdminPermission",
			"http://schema.org/grantee": [
				 {
					"@type": "http://schema.org/Audience",
					"audienceType": "administrators"
				 }
			 ]
		},
    ]
}
```

8. A production team member can delegate publication to a marketing team member in order to coordinate press releases to the minute

```
{
    "@type": "PublishAction",
    "actionStatus": "PotentialActionStatus",
    "agent": {
        "@type": "Audience",
        "audienceType": "production"
    },
    "participant": {
        "@type": "Audience",
        "audienceType": "marketing"
    },
    "potentialAction": {
        "@type": "AuthorizeAction",
        "actionStatus": "PotentialActionStatus",
        "recipient": {
            "@type": "Audience",
            "audienceType": "marketing"
        }
    }
}
```

To be more general, the `recipient` here could possibly be parameterized rather than being hardcoded, as that assumes this delegation was configured.

9. Only the author of a paper can see its preview, not all authors in general

TBD this is a case that calls for Audience rather than Organization, along with some kind of field describing who the author is
