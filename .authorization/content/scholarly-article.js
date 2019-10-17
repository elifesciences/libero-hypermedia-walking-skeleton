{
    "@id":"http://localhost:8081/articles/808dce4276ee8ac7464f12ae30c66180",
    "@type":"http://schema.org/Article",
    // title of the article, so far so good
    "http://schema.org/name":"Homo Naledi",
    // possibly abusing this field as this is not a DigitalDocument,
    // the common ancestor is CreativeWork
    "http://schema.org/hasDigitalDocumentPermission": [
        {
            "@type": "http://schema.org/DigitalDocumentPermission",
            "http://schema.org/permissionType": "ReadPermission",
            // the public can (generically) read
            "http://schema.org/grantee": [
                {
                    "@type": "http://schema.org/Audience",
                    "audienceType": "public"
                }
            ]
        },
        {
            "@type": "http://schema.org/DigitalDocumentPermission",
            "http://schema.org/permissionType": "WritePermission",
            // the production team can modify
            "http://schema.org/grantee": [
                {
                    "@id": "http://localhost:8081/groups/1234",
                    "@type": "http://schema.org/Organization",
                    "name": "Production"
                }
            ]
        }
    ],
    "http://schema.org/potentialAction": [
        {
            "@type": "http://libero.pub/PublishAction",
            "http://schema.org/agent": [
                // production team can click "Publish"
                {
                    "@id": "http://localhost:8081/groups/1234",
                    "@type": "http://schema.org/Organization",
                    "name": "Production"
                },
            ],
            "http://schema.org/participant": [
                // editorial team can view the possible action(s) but not issue them
                {
                    "@id": "http://localhost:8081/groups/5678",
                    "@type": "http://schema.org/Organization",
                    "name": "Editorial"
                }
            ]
        }
    ]
}
