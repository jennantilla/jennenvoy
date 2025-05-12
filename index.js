const express = require('express');
const { middleware, errorMiddleware } = require('@envoy/envoy-integrations-sdk');

const app = express();
app.use(middleware());

app.post('/visitor-sign-out', async (req, res) => {
    const envoy = req.envoy; // our middleware adds an "envoy" object to req.
    const job = envoy.job;
    const durationLimit = envoy.meta.config.TIME;
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