# Architecture

This is static site hosted on netlify. It's rebuild on each push and when a new like or comments is submitted. 

## Generator
Runs on server, nodejs.

Responsible for:
 - parsing *.md files into html/json.
 - compiling templates and content parsed from *.md into final html files for serving.

## Client
Runs in browser.

Responsible for:
 - handling navigation.
 - Enhances Likes 
 - Enhances Comments

## Server
Contains logic for persisting likes and comments. 

For production builds into and `function` that run on netlify (basically AWS function). Locally `micro` is used as an adapter to accept http calls and transform them into function like payload.


_______________________

## TODO before release

[x] Prepare static build process for netlify

[x] Build function with hotRebuild included

[x] Fix comments bugs (likes message double appearing)

[x] Improve comments experience: better success/fail message, spacing

[x] Remake likes so they work and are SSR'ed

[] Do proper testing on different browsers devices, there has to be 0 bugs

[] Ensure that SW is working as expected

[x] Don't transpile client code, modern browsers should support everything. On IE11 just don't run it. 

[] Extract first paragraph

[] Order articles in asc order

[] Write first article

[] Connect custom domain

## TODO after release

[] Simplify server. It's very simple in what it does, but implementation is over complicated

[] Refactor comments: save comment in localstorage while it's building

[] Leave/Remake/Remove hot rebuilder

[] Treeshake the client code since it imports from templates

[] Add a "kickstart" for likebox
