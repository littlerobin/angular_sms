warning: LF will be replaced by CRLF in package-lock.json.
The file will have its original line endings in your working directory.
warning: LF will be replaced by CRLF in package.json.
The file will have its original line endings in your working directory.
[1mdiff --git a/app/engines-origin/campaign/compose/services/CampaignComposeService.js b/app/engines-origin/campaign/compose/services/CampaignComposeService.js[m
[1mindex 69e424ff..238971c5 100644[m
[1m--- a/app/engines-origin/campaign/compose/services/CampaignComposeService.js[m
[1m+++ b/app/engines-origin/campaign/compose/services/CampaignComposeService.js[m
[36m@@ -619,7 +619,7 @@[m [mangular[m
         if (composeData.saveChanges) {[m
           url = 'campaigns/update-campaign-name-caller-id';[m
         } else {[m
[31m-          url = 'campaigns/update-campaign';[m
[32m+[m[32m          url = 'campaigns/update-campaign-name-caller-id';[m[41m[m
           if (campaignData.schedulations) {[m
             campaignData.schedulations.forEach(function(schedulation) {[m
               var check = composeData.checkForSchedulation(schedulation.start);[m
[1mdiff --git a/index.html b/index.html[m
[1mindex 8294c1bb..061aef1b 100644[m
[1m--- a/index.html[m
[1m+++ b/index.html[m
[36m@@ -58,9 +58,9 @@[m
     <!-- notifications-->[m
 [m
     <!--styles-->[m
[31m-    <link rel="stylesheet" href="/dist/assets/css/app.css?rev=7e3f48714944d34c6912f94b16ae8781">[m
[31m-    <link rel="stylesheet" href="/dist/assets/css/style.css?rev=edd3c3628747f2d84297c343d16269ad">[m
[31m-    <link rel="stylesheet" href="/assets/css/style.css?rev=18c766d2278902e3fe6f39bbdb821143">[m
[32m+[m[32m    <link rel="stylesheet" href="/dist/assets/css/app.css?rev=9a40e045d73cc6796043eab0e43c5741">[m[41m[m
[32m+[m[32m    <link rel="stylesheet" href="/dist/assets/css/style.css?rev=e664dea7ce429eaea390493ac46900ad">[m[41m[m
[32m+[m[32m    <link rel="stylesheet" href="/assets/css/style.css?rev=a43338918d613ad46e3f826b0fab0f8b">[m[41m[m
 [m
     <!--/styles-->[m
     <!-- data-ng-show="showLoading" -->[m
[36m@@ -109,9 +109,9 @@[m
 <script type="text/javascript" src="/bower_components/tinymce/tinymce.js"></script>[m
 [m
 <script type="text/javascript" src="/app/config/config.js"></script>[m
[31m-<script type="text/javascript" src="/dist/assets/js/app.min.js?rev=c068659e300677fa633570ff2de19ddb"></script>[m
[32m+[m[32m<script type="text/javascript" src="/dist/assets/js/app.min.js?rev=f5677ab58966c410d0b7705e037ee4d3"></script>[m[41m[m
 <script src="/bower_components/ng-intl-tel-input/dist/ng-intl-tel-input.min.js"></script>[m
[31m-<script type="text/javascript" src="/dist/app.js?rev=29f06964c26bc9582e659d085a1f486e"></script>[m
[32m+[m[32m<script type="text/javascript" src="/dist/app.js?rev=0a8d097a4926fd37aca50d37cfdcb89b"></script>[m[41m[m
 [m
 <script type="text/javascript" src="/bower_components/angular-ui-tinymce/src/tinymce.js"></script>[m
 [m
[1mdiff --git a/package-lock.json b/package-lock.json[m
[1mindex 0edb4f5d..950b364a 100644[m
[1m--- a/package-lock.json[m
[1m+++ b/package-lock.json[m
[36m@@ -4,2466 +4,3277 @@[m
   "lockfileVersion": 1,[m
   "requires": true,[m
   "dependencies": {[m
[32m+[m[32m    "@babel/runtime": {[m
[32m+[m[32m      "version": "7.0.0-rc.1",[m
[32m+[m[32m      "resolved": "https://registry.npmjs.org/@babel/runtime/-/runtime-7.0.0-rc.1.tgz",[m
[32m+[m[32m      "integrity": "sha512-Nifv2kwP/nwR39cAOasNxzjYfpeuf/ZbZNtQz5eYxWTC9yHARU9wItFnAwz1GTZ62MU+AtSjzZPMbLK5Q9hmbg==",[m
[32m+[m[32m      "requires": {[m
[32m+[m[32m        "regenerator-runtime": "0.12.1"[m
[32m+[m[32m      }[m
[32m+[m[32m    },[m
     "@gulp-sourcemaps/map-sources": {[m
[31m-      "version": "https://registry.npmjs.org/@gulp-sourcemaps/map-sources/-/map-sources-1.0.0.tgz",[m
[32m+[m[32m      "version": "1.0.0",[m
[32m+[m[32m      "resolved": "https://registry.npmjs.org/@gulp-sourcemaps/map-sources/-/map-sources-1.0.0.tgz",[m
       "integrity": "sha1-iQrnxdjId/bThIYCFazp1+yUW9o=",[m
       "dev": true,[m
       "requires": {[m
[31m-        "normalize-path": "https://registry.npmjs.org/normalize-path/-/normalize-path-2.1.1.tgz",[m
[31m-        "through2": "https://registry.npmjs.org/through2/-/through2-2.0.3.tgz"[m
[32m+[m[32m        "normalize-path": "2.1.1",[m
[32m+[m[32m        "through2": "2.0.3"[m
       }[m
     },[m
     "Base64": {[m
[31m-      "version": "https://registry.npmjs.org/Base64/-/Base64-1.0.1.tgz",[m
[32m+[m[32m      "version": "1.0.1",[m
[32m+[m[32m      "resolved": "https://registry.npmjs.org/Base64/-/Base64-1.0.1.tgz",[m
       "integrity": "sha1-3vRcxQyWG8yb8jIdD1K8v+wfG7E=",[m
       "dev": true[m
     },[m
     "JSONStream": {[m
[31m-      "version": "https://registry.npmjs.org/JSONStream/-/JSONStream-1.3.1.tgz",[m
[31m-      "integrity": "sha1-cH92HgHa6eFvG8+TcDt4xwlmV5o=",[m
[32m+[m[32m      "version": "1.3.4",[m
[32m+[m[32m      "resolved": "https://registry.npmjs.org/JSONStream/-/JSONStream-1.3.4.tgz",[m
[32m+[m[32m      "integrity": "sha512-Y7vfi3I5oMOYIr+WxV8NZxDSwcbNgzdKYsTNInmycOq9bUYwGg9ryu57Wg5NLmCjqdFPNUmpMBo3kSJN9tCbXg==",[m
       "requires": {[m
[31m-        "jsonparse": "https://registry.npmjs.org/jsonparse/-/jsonparse-1.3.1.tgz",[m
[31m-        "through": "https://registry.npmjs.org/through/-/through-2.3.8.tgz"[m
[32m+[m[32m        "jsonparse": "1.3.1",[m
[32m+[m[32m        "through": "2.3.8"[m
       }[m
     },[m
     "abbrev": {[m
[31m-      "version": "https://registry.npmjs.org/abbrev/-/abbrev-1.1.1.tgz",[m
[31m-      "integrity": "sha1-+PLIh60Qv2f2NPAFtph/7TF5qsg="[m
[32m+[m[32m      "version": "1.1.1",[m
[32m+[m[32m      "resolved": "https://registry.npmjs.org/abbrev/-/abbrev-1.1.1.tgz",[m
[32m+[m[32m      "integrity": "sha512-nne9/IiQ/hzIhY6pdDnbBtz7DjPTKrY00P/zvPSm5pOFkl6xuGrGnXn/VtTNNfNtAfZ9/1RtehkszU9qcTii0Q=="[m
     },[m
     "accepts": {[m
[31m-      "version": "https://registry.npmjs.org/accepts/-/accepts-1.3.4.tgz",[m
[31m-      "integrity": "sha1-hiRnWMfdbSGmR0/whKR0DsBesh8=",[m
[32m+[m[32m      "version": "1.3.5",[m
[32m+[m[32m      "resolved": "https://registry.npmjs.org/accepts/-/accepts-1.3.5.tgz",[m
[32m+[m[32m      "integrity": "sha1-63d99gEXI6OxTopywIBcjoZ0a9I=",[m
       "dev": true,[m
       "requires": {[m
[31m-        "mime-types": "https://registry.npmjs.org/mime-types/-/mime-types-2.1.17.tgz",[m
[31m-        "negotiator": "https://registry.npmjs.org/negotiator/-/negotiator-0.6.1.tgz"[m
[32m+[m[32m        "mime-types": "2.1.20",[m
[32m+[m[32m        "negotiator": "0.6.1"[m
       }[m
     },[m
     "accessory": {[m
[31m-      "version": "https://registry.npmjs.org/accessory/-/accessory-1.1.0.tgz",[m
[32m+[m[32m      "version": "1.1.0",[m
[32m+[m[32m      "resolved": "https://registry.npmjs.org/accessory/-/accessory-1.1.0.tgz",[m
       "integrity": "sha1-eDPpg5oy3tdtJgIfNqQXB6Ug9ZM=",[m
       "dev": true,[m
       "requires": {[m
[31m-        "ap": "https://registry.npmjs.org/ap/-/ap-0.2.0.tgz",[m
[31m-        "balanced-match": "https://registry.npmjs.org/balanced-match/-/balanced-match-0.2.1.tgz",[m
[31m-        "dot-parts": "https://registry.npmjs.org/dot-parts/-/dot-parts-1.0.1.tgz"[m
[32m+[m[32m        "ap": "0.2.0",[m
[32m+[m[32m        "balanced-match": "0.2.1",[m
[32m+[m[32m        "dot-parts": "1.0.1"[m
       },[m
       "dependencies": {[m
         "balanced-match": {[m
[31m-          "version": "https://registry.npmjs.org/balanced-match/-/balanced-match-0.2.1.tgz",[m
[32m+[m[32m          "version": "0.2.1",[m
[32m+[m[32m          "resolved": "https://registry.npmjs.org/balanced-match/-/balanced-match-0.2.1.tgz",[m
           "integrity": "sha1-e8ZYtL7WHu5CStdPdfXD4sTfPMc=",[m
           "dev": true[m
         }[m
       }[m
     },[m
     "accord": {[m
[31m-      "version": "https://registry.npmjs.org/accord/-/accord-0.27.3.tgz",[m
[31m-      "integrity": "sha1-f7kSlwkoXK6oTrNyxOiCAxtxOOg=",[m
[31m-      "dev": true,[m
[31m-      "requires": {[m
[31m-        "convert-source-map": "https://registry.npmjs.org/convert-source-map/-/convert-source-map-1.5.0.tgz",[m
[31m-        "glob": "https://registry.npmjs.org/glob/-/glob-7.1.2.tgz",[m
[31m-        "indx": "https://registry.npmjs.org/indx/-/indx-0.2.3.tgz",[m
[31m-        "lodash.clone": "https://registry.npmjs.org/lodash.clone/-/lodash.clone-4.5.0.tgz",[m
[31m-        "lodash.defaults": "https://registry.npmjs.org/lodash.defaults/-/lodash.defaults-4.2.0.tgz",[m
[31m-        "lodash.flatten": "https://registry.npmjs.org/lodash.flatten/-/lodash.flatten-4.4.0.tgz",[m
[31m-        "lodash.merge": "https://registry.npmjs.org/lodash.merge/-/lodash.merge-4.6.0.tgz",[m
[31m-        "lodash.partialright": "https://registry.npmjs.org/lodash.partialright/-/lodash.partialright-4.2.1.tgz",[m
[31m-        "lodash.pick": "https://registry.npmjs.org/lodash.pick/-/lodash.pick-4.4.0.tgz",[m
[31m-        "lodash.uniq": "https://registry.npmjs.org/lodash.uniq/-/lodash.uniq-4.5.0.tgz",[m
[31m-        "resolve": "https://registry.npmjs.org/resolve/-/resolve-1.4.0.tgz",[m
[31m-        "semver": "https://registry.npmjs.org/semver/-/semver-5.4.1.tgz",[m
[31m-        "uglify-js": "https://registry.npmjs.org/uglify-js/-/uglify-js-2.8.29.tgz",[m
[31m-        "when": "https://registry.npmjs.org/when/-/when-3.7.8.tgz"[m
[32m+[m[32m      "version": "0.28.0",[m
[32m+[m[32m      "resolved": "https://registry.npmjs.org/accord/-/accord-0.28.0.tgz",[m
[32m+[m[32m      "integrity": "sha512-sPF34gqHegaCSryKf5wHJ8wREK1dTZnHmC9hsB7D8xjntRdd30DXDPKf0YVIcSvnXJmcYu5SCvZRz28H++kFhQ==",[m
[32m+[m[32m      "dev": true,[m
[32m+[m[32m      "requires": {[m
[32m+[m[32m        "convert-source-map": "1.6.0",[m
[32m+[m[32m        "glob": "7.1.3",[m
[32m+[m[32m        "indx": "0.2.3",[m
[32m+[m[32m        "lodash.clone": "4.5.0",[m
[32m+[m[32m        "lodash.defaults": "4.2.0",[m
[32m+[m[32m        "lodash.flatten": "4.4.0",[m
[32m+[m[32m        "lodash.merge": "4.6.1",[m
[32m+[m[32m        "lodash.partialright": "4.2.1",[m
[32m+[m[32m        "lodash.pick": "4.4.0",[m
[32m+[m[32m        "lodash.uniq": "4.5.0",[m
[32m+[m[32m        "resolve": "1.8.1",[m
[32m+[m[32m        "semver": "5.5.1",[m
[32m+[m[32m        "uglify-js": "2.8.29",[m
[32m+[m[32m        "when": "3.7.8"[m
       }[m
     },[m
     "acorn": {[m
[31m-      "version": "https://registry.npmjs.org/acorn/-/acorn-4.0.13.tgz",[m
[31m-      "integrity": "sha1-EFSVrlNh1pe9GVyCUZLhrX8lN4c="[m
[31m-    },[m
[31m-    "after": {[m
[31m-      "version": "https://registry.npmjs.org/after/-/after-0.8.1.tgz",[m
[31m-      "integrity": "sha1-q11PuIP1loFtNRX495HAr0ht1ic=",[m
[32m+[m[32m      "version": "4.0.13",[m
[32m+[m[32m      "resolved": "https://registry.npmjs.org/acorn/-/acorn-4.0.13.tgz",[m
[32m+[m[32m      "integrity": "sha1-EFSVrlNh1pe9GVyCUZLhrX8lN4c=",[m
       "dev": true[m
     },[m
[31m-    "ajv": {[m
[31m-      "version": "https://registry.npmjs.org/ajv/-/ajv-4.11.8.tgz",[m
[31m-      "integrity": "sha1-gv+wKynmYq5TvcIK8VlHcGc5xTY=",[m
[31m-      "dev": true,[m
[32m+[m[32m    "acorn-dynamic-import": {[m
[32m+[m[32m      "version": "3.0.0",[m
[32m+[m[32m      "resolved": "https://registry.npmjs.org/acorn-dynamic-import/-/acorn-dynamic-import-3.0.0.tgz",[m
[32m+[m[32m      "integrity": "sha512-zVWV8Z8lislJoOKKqdNMOB+s6+XV5WERty8MnKBeFgwA+19XJjJHs2RP5dzM57FftIs+jQnRToLiWazKr6sSWg==",[m
       "requires": {[m
[31m-        "co": "4.6.0",[m
[31m-        "json-stable-stringify": "https://registry.npmjs.org/json-stable-stringify/-/json-stable-stringify-1.0.1.tgz"[m
[32m+[m[32m        "acorn": "5.7.3"[m
       },[m
       "dependencies": {[m
[31m-        "json-stable-stringify": {[m
[31m-          "version": "https://registry.npmjs.org/json-stable-stringify/-/json-stable-stringify-1.0.1.tgz",[m
[31m-          "integrity": "sha1-mnWdOcXy/1A/1TAGRu1EX4jE+a8=",[m
[31m-          "dev": true,[m
[31m-          "requires": {[m
[31m-            "jsonify": "https://registry.npmjs.org/jsonify/-/jsonify-0.0.0.tgz"[m
[31m-          }[m
[32m+[m[32m        "acorn": {[m
[32m+[m[32m          "version": "5.7.3",[m
[32m+[m[32m          "resolved": "https://registry.npmjs.org/acorn/-/acorn-5.7.3.tgz",[m
[32m+[m[32m          "integrity": "sha512-T/zvzYRfbVojPWahDsE5evJdHb3oJoQfFbsrKM7w5Zcs++Tr257tia3BmMP8XYVjp1S9RZXQMh7gao96BlqZOw=="[m
[32m+[m[32m        }[m
[32m+[m[32m      }[m
[32m+[m[32m    },[m
[32m+[m[32m    "acorn-jsx": {[m
[32m+[m[32m      "version": "4.1.1",[m
[32m+[m[32m      "resolved": "https://registry.npmjs.org/acorn-jsx/-/acorn-jsx-4.1.1.tgz",[m
[32m+[m[32m      "integrity": "sha512-JY+iV6r+cO21KtntVvFkD+iqjtdpRUpGqKWgfkCdZq1R+kbreEl8EcdcJR4SmiIgsIQT33s6QzheQ9a275Q8xw==",[m
[32m+[m[32m      "requires": {[m
[32m+[m[32m        "acorn": "5.7.3"[m
[32m+[m[32m      },[m
[32m+[m[32m      "dependencies": {[m
[32m+[m[32m        "acorn": {[m
[32m+[m[32m          "version": "5.7.3",[m
[32m+[m[32m          "resolved": "https://registry.npmjs.org/acorn/-/acorn-5.7.3.tgz",[m
[32m+[m[32m          "integrity": "sha512-T/zvzYRfbVojPWahDsE5evJdHb3oJoQfFbsrKM7w5Zcs++Tr257tia3BmMP8XYVjp1S9RZXQMh7gao96BlqZOw=="[m
[32m+[m[32m        }[m
[32m+[m[32m      }[m
[32m+[m[32m    },[m
[32m+[m[32m    "acorn-node": {[m
[32m+[m[32m      "version": "1.5.2",[m
[32m+[m[32m      "resolved": "https://registry.npmjs.org/acorn-node/-/acorn-node-1.5.2.tgz",[m
[32m+[m[32m      "integrity": "sha512-krFKvw/d1F17AN3XZbybIUzEY4YEPNiGo05AfP3dBlfVKrMHETKpgjpuZkSF8qDNt9UkQcqj7am8yJLseklCMg==",[m
[32m+[m[32m      "requires": {[m
[32m+[m[32m        "acorn": "5.7.3",[m
[32m+[m[32m        "acorn-dynamic-import": "3.0.0",[m
[32m+[m[32m        "xtend": "4.0.1"[m
[32m+[m[32m      },[m
[32m+[m[32m      "dependencies": {[m
[32m+[m[32m        "acorn": {[m
[32m+[m[32m          "version": "5.7.3",[m
[32m+[m[32m          "resolved": "https://registry.npmjs.org/acorn/-/acorn-5.7.3.tgz",[m
[32m+[m[32m          "integrity": "sha512-T/zvzYRfbVojPWahDsE5evJdHb3oJoQfFbsrKM7w5Zcs++Tr257tia3BmMP8XYVjp1S9RZXQMh7gao96BlqZOw=="[m
         }[m
       }[m
     },[m
[32m+[m[32m    "after": {[m
[32m+[m[32m      "version": "0.8.2",[m
[32m+[m[32m      "resolved": "https://registry.npmjs.org/after/-/after-0.8.2.tgz",[m
[32m+[m[32m      "integrity": "sha1-/ts5T58OAqqXaOcCvaI7UF+ufh8="[m
[32m+[m[32m    },[m
[32m+[m[32m    "ajv": {[m
[32m+[m[32m      "version": "5.5.2",[m
[32m+[m[32m      "resolved": "https://registry.npmjs.org/ajv/-/ajv-5.5.2.tgz",[m
[32m+[m[32m      "integrity": "sha1-c7Xuyj+rZT49P5Qis0GtQiBdyWU=",[m
[32m+[m[32m      "requires": {[m
[32m+[m[32m        "co": "4.6.0",[m
[32m+[m[32m        "fast-deep-equal": "1.1.0",[m
[32m+[m[32m        "fast-json-stable-stringify": "2.0.0",[m
[32m+[m[32m        "json-schema-traverse": "0.3.1"[m
[32m+[m[32m      }[m
[32m+[m[32m    },[m
     "align-text": {[m
[31m-      "version": "https://registry.npmjs.org/align-text/-/align-text-0.1.4.tgz",[m
[32m+[m[32m      "version": "0.1.4",[m
[32m+[m[32m      "resolved": "https://registry.npmjs.org/align-text/-/align-text-0.1.4.tgz",[m
       "integrity": "sha1-DNkKVhCT810KmSVsIrcGlDP60Rc=",[m
       "dev": true,[m
       "requires": {[m
[31m-        "kind-of": "https://registry.npmjs.org/kind-of/-/kind-of-3.2.2.tgz",[m
[31m-        "longest": "https://registry.npmjs.org/longest/-/longest-1.0.1.tgz",[m
[31m-        "repeat-string": "https://registry.npmjs.org/repeat-string/-/repeat-string-1.6.1.tgz"[m
[32m+[m[32m        "kind-of": "3.2.2",[m
[32m+[m[32m        "longest": "1.0.1",[m
[32m+[m[32m        "repeat-string": "1.6.1"[m
       }[m
     },[m
     "alphanum-sort": {[m
[31m-      "version": "https://registry.npmjs.org/alphanum-sort/-/alphanum-sort-1.0.2.tgz",[m
[32m+[m[32m      "version": "1.0.2",[m
[32m+[m[32m      "resolved": "https://registry.npmjs.org