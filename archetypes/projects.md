---
title: "{{ replace .Name "-" " " | title }}"
draft: true
draft: true
source: "https://github.com"
source_brand: "github"
website: "https://example.com"
license: "MIT"
screenshot: "cover_placeholder.png"
summary: "A quick summary about the project. Like a tagline or something"
---

Describe the project in more details. This shouldn't be too long as nobody likes to read excessively long paragraphs

## Description of Fields

Delete this before publishing!

* `startdate` - The start date of the project
* `enddate` - The end date of the project
* `categories` - An array of categories that the project belongs to
* `source` (Optional) - A link to the source of the project
* `source_brand` (Optional) - A fontawesome icon for the brand (i.e. "github" "bitbucket" "gitlab")
* `website` (Optional) - The project's website (if one exists)
* `license` (Optional) - The license that the project was released under (i.e. "MIT", "GPL v3")
* `screenshot` (Optional) - A screenshot to use for the project. Will be scaled down to 600x900 (preserving aspect ratio)
* `summary` - A summary about the project. If omitted, the first part of the body will be used instead