# We are the Lions
The endorsement wall for your teammates.

My scrimba solo project in module 3. 
I build it from scratch and use all the tricks and great practice I learned so far. 
I also learned from building:
- updata firebase data
- add icon from fontawesome
- form, input and textarea feature, like required attribute
- more DOM methods, like `appendChild`, `insertAdjacentElement`
- sanitize third-party content before sending to innerHTML to prevent XSS. Manually creating markup is safe, but sometimes it's a LOT of code.

## Feture
- [x] Firebase Realtime Database, update in realtime 
- [x] Optional "from" and the "to" fields
- [x] The newest post on the top
- [x] "likes" feature, one person can only like the same post once

### About "like" feature
need info:
- The endorsement element the user clicked “like” on: id
- The endorsement document that relates to the element the user clicked “like” on: use key to get data entry
- The current number of likes for that endorsement: read and update database
- Whether the user has already “liked” the endorsement previously: use localStorage