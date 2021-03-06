// Copyright 2012-2016, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// Testing Rob

'use strict';

var google = require('googleapis');   // all api access from google
var fs = require("fs");               // File System allows us to read in client_secrets.json
var OAuth2Client = google.auth.OAuth2; // retrieves OAuth2 class
var ft = google.fusiontables('v2');    // retrieves class. 'V2' = version 2 of fusion tables

// Client ID and client secret are available at
// https://code.google.com/apis/console
var client_secrets = JSON.parse(fs.readFileSync('/home/ubuntu/workspace/client_secrets.json'));
var CLIENT_ID = client_secrets.web.client_id;
var CLIENT_SECRET = client_secrets.web.client_secret;

// location of the page google will return the user to after once client is
// logged into their google account and allowed permissions.
var REDIRECT_URL = 'https://builder2-deisingj1.c9users.io/fusiontable/auth';

//
var oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
google.options({
    auth: oauth2Client  // sets this OAuth2Client as the authentication method
});

module.exports = {
    setRefreshToken: function(tokens) {
        oauth2Client.setCredentials({
            refresh_token: tokens.refresh_token
        });
    },
    blank: function() {
        return {};
    },
    get: function(ret) {
        var url = oauth2Client.generateAuthUrl({
            access_type: 'offline', // will return a refresh token
            scope: 'https://www.googleapis.com/auth/fusiontables.readonly' // can be a space-delimited string or an array of scopes
        });
        ret(null, url);
    },
    oauthcallback: function(code, ret) {
        oauth2Client.getToken(code, function(err, tokens) {
            if (err) {
                return ret(err, null);
            }
            // set tokens to the client
            // TODO: tokens should be set by OAuth2 client.

            // sets the tokens that have been received to
            // the credentials of the client.
            oauth2Client.setCredentials(tokens);

            // retreives all fusion tables the user owns.
            ft.table.list({}, [], function(err, profile) {
                if (err) {
                    console.log('An error occured', err);
                }
                ret(err, profile);
            });
        });
    },
    tables: function(ret) {
        ft.table.list({}, [], function(err, profile) {
            if (err) {
                console.log('An error occured', err);
            }
            ret(err, profile);
        });
    }
};
