# jennenvoy
Node.js application that interacts with Envoy.

Prompt: create an app on the Envoy platform with the following requirements:

1. It should have one setup step that asks for a number of minutes, between 0 and
180, that visitors are allowed to stay on-premises. This value should be validated (i.e., it should not let the installer save the settings if there is anything other than a number between 0 and 180 put in).
2. Upon visitor sign-in, nothing needs to occur.
3. Upon visitor sign-out, you should attach a message (as in the example) that indicates
whether the visitors overstayed their allotted time.
