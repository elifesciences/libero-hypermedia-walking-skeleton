## Authorization scenarios

### 1. The public can access a published scholarly article through the front end.

There is no authentication token on the front end, so the API calls are by default associated to this `Audience`:

```
{
    "@type": "http://schema.org/Audience",
    "audienceType": "public"
}
```

Using `Audience` rather than `Organization` as it is an open ended set of people rather than a precise group.

The document itself grants a `ReadPermission` `DigitalDocumentPermission`.

### 2. A scholarly article in preview is not visible to the public.

Similarly with a `public` `Audience`, the `Article` is not present in listings.

Moreover, the `Article` resouce returns a 404 if loaded directly (but there is no navigation link to it).

### 3. A scholarly article in preview is visible to production team members.

After logging in with a preferred mechanism, the authentication token in the front end has a claim for this `Organization`:

```
{
    "@id": "http://localhost:8081/groups/1234",
    "@type": "http://schema.org/Organization",
    "name": "Production"
}
```

Listings contain the article, and allow to navigate to it.

### 4. Production team members can publish the scholarly article.

For this authorized `Organization`, a `PublishAction` is shown as part of `potentialAction`. Moreover, the `Article` grants a `WritePermission` to this `Organization`; therefore, the action can be performed.

### 5. Editorial team members cannot publish an article.

The options are alternative, but could also both be supported.

#### Option A: `WritePermission` necessary

With the `Editorial` `Organization`, a `PublishAction` is shown as part of `potentialAction`. However, the `Article` grants a `ReadPermission` to this `Organization`; therefore:

- the action may be displayed by a front end but not as executable (imagine a grayed out button)

#### Option B: `participant` in `Action`

With a `editorial` `Organization`, a `PublishAction` is shown as part of `potentialAction` having this `Organization` as a `participant` rather than an `Agent`; therefore:

- the action may be displayed by a front end but not as executable (imagine a grayed out button)

### 6. An article is being ingested, so it cannot be published yet; that action will appear in the future. This is true for all clients.

The `potentialAction` contains:

```
{
    "@type": "PublishAction",
    "actionStatus": "PotentialActionStatus",
    "https://libero.pub/requiresCompletionOf": {
        "@type": "IngestAction",
        "actionStatus": "ActiveActionStatus"
    }
}
```

7. An administrator can add people to the production team

```
{
    "@id": "http://localhost:8081/groups/1234",
    "@type": "http://schema.org/Organization",
    "name": "Production"
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

To keep the reference simple, using an `Audience` of `administrators`; could switch to an `Organization` but this looks more like a default reference that allows administrators to override everything everywhere, rather than an explicit link to a group of users that has to be maintained.

8. A production team member can delegate publication to a marketing team member in order to coordinate press releases to the minute

```
{
    "@type": "PublishAction",
    "actionStatus": "PotentialActionStatus",
    "agent": {
        "@id": "http://localhost:8081/groups/1234",
        "@type": "http://schema.org/Organization",
        "name": "Production"
    },
    "participant": {
        "@id": "http://localhost:8081/groups/9012",
        "@type": "http://schema.org/Organization",
        "name": "Marketing"
    },
    "potentialAction": {
        "@type": "AuthorizeAction",
        "actionStatus": "PotentialActionStatus",
        "recipient": {
            "@id": "http://localhost:8081/groups/9012",
            "@type": "http://schema.org/Organization",
            "name": "Marketing"
        }
    }
}
```

To be more general, the `recipient` here could possibly be parameterized rather than being hardcoded, as that assumes this delegation was configured.

9. Only the author of a paper can see its preview, not all authors in general

TBD this is a case that calls for Audience rather than Organization, along with some kind of field describing who the author is

10. The editor-in-chief is denied write permissions for an action if they are also an author of the article.

TBD 
