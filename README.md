# Cinequotes API

## Requirements

All requirements are listed in [Cinequotes.pdf](./Cinequotes.pdf) file.

## Run

To run this application, 
first - You need to clone this repo, and translate worker to the same directory.

```sh
mkdir test
cd test
git clone https://github.com/mdovhopo/cinequotes-translate-worker.git
git clone https://github.com/mdovhopo/cinequotes-api.git
cd cinequotes-api
```
Than just run docker-compose inside cinequotes-api directory.
```sh
docker-compose up
```

Run tests with

```shell script
npm test
```

**IMPORTANT:**
compose file assume that translate worker repo will be cloned at the same level to this repo

## API

## Setup Demo data - GET /api/util/setup-firestore-demo-data

Simple method, added to simplify app testing.

It inserts demo data to firestore, all data that already in firestore will be erased!

### Ping - /ping

simple api call to verify, that service is running

pong with current server time is returned.

```json
{
  "pong": "current server time is 2020-11-17T19:19:27.503Z"
}
```

### Get movies - GET api/v1/movie

list of movies is returned

```json
[
  {
    "id": "P1Paxb0S8C37YHF30QM9",
    "title": "The Hitchhiker's Guide to the Galaxy"
  }
]

```

### Quotes to movie - GET /api/v1/movies/:movieId/quotes?locale=*

List all quotes to movie with translation

Language controlled by **Accept-Language** header or by **locale** query parameter

locale has more priority over header and can be one of - EN, FR, *

\* - return all available translations

list of quotes to movie is returned


with locale = *
```json
[
  {
    "id": "gWz4e2rSoVn3LJkEqvwq",
    "actor": "Douglas Adams",
    "quote": "Don't Panic.",
    "translations": {
      "FR": "Dis bonjour à mon petit ami."
    }
  }
]
```
with locale = EN
```json
[
  {
    "id": "gWz4e2rSoVn3LJkEqvwq",
    "actor": "Douglas Adams",
    "quote": "Don't Panic."
  }
]
```

with locale = FR

if no FR translation is available EN text will be returned.
```json
[
  {
    "id": "gWz4e2rSoVn3LJkEqvwq",
    "actor": "Douglas Adams",
    "quote": "Dis bonjour à mon petit ami."
  }
]
```

### Add quote to movie - POST /api/v1/quotes
Request body example, all fields are required. 
If no film found by this name, a new one will be created. 
Search will be case-insensitive

Also after creating quote, translate service will translate it to FR.
```json
{
  "movieTitle": "The Hitchhiker's Guide to the Galaxy",
  "actor": "Douglas Adams",
  "quote": "Don't Panic."
}
```

OK Response

```json5
{
  "id": "7bx6Xmmd3kyM05XzxZJ9", // quote id, do not confuse with movieId
  "quote": "Don't Panic.",
  "actor": "Douglas Adams"
}
```

Error Response

```json5
{
  "error": "Smth went wrong" 
}
```

