const express = require('express');
const { middleware, errorMiddleware } = require('@envoy/envoy-integrations-sdk');

const app = express();
app.use(middleware());

// Install webhook endpoint where Envoy sends config data
app.post('/install', (req, res) => {
    console.log('Request Body:', req.body);
    const maxVisitDuration = Number(req.body.payload?.TIME);

    console.log('Received maxVisitDuration:', maxVisitDuration);

    // Validate the input value
    if (isNaN(maxVisitDuration) || !Number.isInteger(maxVisitDuration) || maxVisitDuration < 0 || maxVisitDuration > 180) {
        return res.sendFailed('Please enter a whole number between 0 and 180 for max visit duration.');
    }

    // Return the config so Envoy saves it
    res.send({ TIME: maxVisitDuration });
});
  
app.post('/visitor-sign-out', async (req, res) => {
    const envoy = req.envoy; // our middleware adds an "envoy" object to req.
    const job = envoy.job;
    const durationLimit = envoy.meta.config.TIME || 180; // default to 180 if no config
    const visitor = envoy.payload;

    const visitorName = visitor.attributes['full-name'];
    const signInTime = visitor.attributes['signed-in-at'];
    const signOutTime = visitor.attributes['signed-out-at'];

    const visitDuration = (new Date(signOutTime) - new Date(signInTime)) / 1000 / 60;

    // if visit duration was longer than configured in app, send message.
    if (visitDuration <= durationLimit) {
        await job.attach({ label: 'Time', value: `Goodbye, ${visitorName}!` });
    } else {
        await job.attach({label: 'Time', value: 'Visitor overstayed allotted visit limit'}); 
    }
    
    res.send({ durationLimit });
});

// Dubugging
app.use(function (req, res, next) {
    console.log('Time:', Date.now())
    next()
})

app.use(errorMiddleware());

const listener = app.listen(process.env.PORT || 0, () => {
  console.log(`Listening on port ${listener.address().port}`);
});