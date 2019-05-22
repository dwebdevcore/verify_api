# Website Verification Form

This form is to verify site services/taxonomy once they're ready to launch.

## GET API

The form reads site data from our Services API and posts it to our update API.

This API accepts a few options.

`https://api.heartland.com/services/` returns all services.

Adding a `practice_id` or `content_url` returns services offered at that practice.

Adding `?verification=on` to the GET request returns all services each containing a bool value called `is_provided`.


## URL Params

This page accepts two URL params, one for the site:

`site=mycharlestondentist`

And optionally one for the auth token:

`auth=1234`

Auth tokens will be distributed with emails to the reps who approve the sites.

Auth tokens expire after 5 uses.