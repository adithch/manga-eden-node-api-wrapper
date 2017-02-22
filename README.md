# Manga Eden Node.js Api Wrapper
A Node.js wrapper for the [API](www.mangaeden.com/api/) of Manga Eden.

____

The popular manga repository [Manga Eden](www.mangaeden.com/) provides useful REST APIs to access its resources; clients consuming such APIs are in fact able to:

1) List the mangas available in the database, in English or Italian;

2) Retrieve information regarding a specific manga (title, author, description, number of chapters available to download, etc);

3) Retrieve information regarding a specific chapter (page number, download link, etc).

However, the APIs are not always compliant with the standard of JSON REST APIs, and require some effort client-side in order to be properly consumed.
For example, the API call to retrieve manga information produces in the response a _Chapter's array_ described in these terms:

```
Chapter's array explained

Example of a chapter array element: 
[ 
5, # <-- chapter's number 
1275542373.0, # <-- chapter's date 
"5", # <-- chapter's title 
"4e711cb0c09225616d037cc2" # <-- chapter's ID (chapter.id in the next section) 
]
```

It's clear that JSON serializers/deserializers libraries like GSON or Jackson are not able to parse this response, and the developers need to do that manually parsing the JSON array element-by-element, since no keys are provided and multiple types are used.

In order to reduce the development effort client-side, I wrote this Node.js wrapper which acts as a middleware between the client application and Manga Eden APIs, parsing the response appropriately and adding some useful features.

____

## Installation and run

To try the Manga Eden API Wrapper on localhost, assuming you already installed [Node.js](https://nodejs.org/it/download/), clone the repository or download the zip and extract it, then on the terminal:

1) `cd` into the project's root folder;

2) execute `npm install`;

3) execute `npm start`.

Now you're ready to test the APIs. Just prefix `localhost:3000` to the URLs here described (for example: `localhost:3000/api/v1/list/it/`).

To deploy this application on a server, follow the procedures available for your environment.

## Usage: comparison between Manga Eden API and Node.js Wrapper

#### List mangas API:

**Manga Eden:**

`https://www.mangaeden.com/api/list/:language/` to fetch all mangas, where `:language` is `0` for English and `1` for Italian;

`https://www.mangaeden.com/api/list/:language/?p=X` to fetch 500 mangas at the page X;

`https://www.mangaeden.com/api/list/:language/?p=X&l=Y` to fetch Y mangas, those at the page X, with Y in \[25;2000];

**Node.js Wrapper**

`/api/v1/list/:language/` to fetch all mangas, where `:language` is `en` for English and `it` for Italian;

`/api/v1/list/:language?page=X` to fetch 500 mangas at the page X;

`/api/v1/list/:language?page=X&size=Y` to fetch Y mangas, those at the page X, with Y in \[25;2000];

The Node.js Wrapper response has the following schema:
```
{
	"page_number": int,
	"page_number_start": int,
	"page_number_end": int,
	"manga_total_number": int,
	"manga": [
		{
			"title": string,
			"alias": string,
			"categories": [string],
			"status": int,
			"image_link": string,
			"id": string,
			"link": string,
			"last_chapter_date": timestamp,
			"hits": int
		}
	]

}
```
where `[{ ... }]` is an array of objects and `[...]` is an array of primitive types, which is easily deserialized and parsed by any JSON library. 

#### Get manga's information API:

**Manga Eden**

`https://www.mangaeden.com/api/manga/:id/` to fetch the information specific to the manga with that `id`, retrieved from the previous call.

**Node.js Wrapper**

`/api/v1/manga/:id/` the same. The difference is in the response schema, which is:

```
{
	"title": string,
	"author": string,
	"artist": string,
	"aka": [string],
	"alias": string,
	"categories": [string],
	"chapter_number": int,
	"last_chapter_date": timestamp,
	"hits": int,
	"description": string,
	"image_link": string,
	"release_year": int,
	"language": string,
	"chapters": [
		{
			"number": int,
			"release_date": timestamp,
			"title": string,
			"id": string,
			"link": string
		}
	]
}
```

#### Get chapter's information API:

**Manga Eden**

`https://www.mangaeden.com/api/chapter/:id/` to fetch the information specific to the chapter with that `id`, retrieved from the previous call.

**Node.js Wrapper**

`/api/v1/chapter/:id/` the same. The difference is in the response schema, which is:

```
{
	"chapter_pages": [
		{
			"page_number": int,
			"id": string,
			"link": string
		}
	]
}
```

## Additional features

In addiction to provide JSON REST APis responses easily deserialized by common parsers, this Node.js Wrapper has a couple of improvements:

1) All the `link` keys in the responses are URLs ready to be consumed by the client to either make the subsequent call or download an image; no cancatenation with other URLs are necessary;

2) Where necessary, the HTML entities are decoded, so instead of receiving response strings like `&#x50D5;&#x305F;&#x3061;&#x306E;&#x3001;&#x604B;&#x306E;&#x306F;&#x3058;&#x307E;&#x308A;` as you get with the original APIs, you obtain `僕たちの、恋のはじまり`. 


## Error responses

Contrary to the original APIs, the Node.js wrapper provides JSON error responses comprising of status code - which is obviously the status code of the response itself -, the status code message and a description of the error. 

For example, if you call the API `/api/v1/list/es/`, since Spanish (`es`) language is not supported, the response will have the form:

```
{
  "status": 400,
  "message": "Bad Request",
  "description": "[es] is not a supported language; use [en] or [it] instead."
}
```

Or, if you try to provide a non-existent manga id calling `/api/v1/manga/56b7feqqw4b4719a1668b7b2183b/`, you get:

```
{
  "status": 404,
  "message": "Not Found",
  "description": "Manga not found. Make sure you searched for a valid manga id."
}
```
