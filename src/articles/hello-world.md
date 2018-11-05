---
author: Vytenis Butkevicius
title: Hello world!
summary: I've had this idea of building my own site—my own blog for a couple of years now...and it's finally alive. Here is how it works.
date: 2018-11-01
id: 1
---

I've had this idea of building my own site—my own blog for a couple of years now. And last year I decided to finally build it. [First commit](https://github.com/vybu/blog/commit/b7bc8ac60fa877e629c972a3aa6a03fd52d2be1b) was done on April the 5th 2017, so more than year and a half ago. A couple of months of hacking and I was done. The only remaining part was to deploy everything and write the first blog article (the one you are reading now).

...and it didn't happen.

As it often happens with side projects I couldn't ship it. As the project reached finish line, the interest and motivation faded away.

Until about a month ago I picked up where I left off and finally finished it.

## This is what I built

Main goals of the project were:

- build it as custom static site generator from scratch. 
- make it  work with or without JavaScript - progressively enhanced
- make it as fast as possible
- add user interaction: comments and likes

Following these goals I started hacking and made a static site generator monolith that has 2 build modes: a production one and development one with live reload.

The build process looks like this:

1. The generator parses md files and turns them into html representation (in memory for now).
2. Comments and likes for each article are retrieved from github gist, which acts as a database.
3. Webpack compiles and bundles client side code and also service worker code.
4. Using custom templates made with \`template literals\` the generator part creates html files for all pages (*landing*, *about*, *article*) and also json files for articles (more on this later).
5. Assets likes fonts, images are copied to the same folder as html files.
6. "Server" files are transpiled and bundled into single file, which works as AWS function. The function acts as a server for retrieving and creating likes and comments.

7. Serving:
    - *Locally* folder containing static files is served with browserify and the serverless function has a simple proxy made with micro.
    - *The production* version is deployed on [netlify](netlify.com). Which runs the exact same build process and distributes the statics folder through CDNs and deploys serverless api to AWS. While the initial plan was to host it on private VPS server. But now that there is netlify it's too good to not use. They basically have unlimited free plan (at least for now).

After everything is built and deployed the live site itself works like and *old school* static site that is **progressively enhanced**.

Users that have **javascript enabled** get a **serviceWorker** installed, which caches assets so site load loads faster on subsequent visits and also works offline.
Also navigation between pages is handled with ajax - this is where the previously generated json files are used (they simply contain html content, which is appended to DOM on navigation). Likes and comments are also handled with ajax and have better user feedback when enhanced with javascript.

However, is **javascript disabled** everything still works. Navigation is simply done with hyperlinks, comments are urlencoded forms and likes are also hyperlinks.
User experience is not as good, but functionality is the same.

Article comments and likes are handled by AWS lambda function (running on nodejs), which saves the data to private github gist and also triggers netlify rebuild hook. It takes about 30 seconds for the site to update. Not as fast as I would like, but most users shouldn't notice, because data is saved in localstorage, so likes and comments made by the user are visible for him before the rebuild is done.

_______________________

All in all I'm quite happy with the result. The site feels fast, works everywhere, has user interactions, and most importantly it's unique and built from scratch by myself. There are still some adjustments I want to make (and will probably keep making changes each time I write an article), but the site is live and open for business!
