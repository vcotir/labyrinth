# labyrinth

##Installation 
> git clone https://github.com/Victorkjngo/labyrinth.git labyrinth_victor_ngo;
> cd labyrinth_victor_ngo;
> npm i;

## Running (assumes you're within repo directory)
> node index.js

Purpose: The purpose of the program is to interact correctly with the cyberspace labryinth to generate and send the correct report. 

Reminder to self:
1) Write clean, easy to follow, well commented code
2) Demonstrate quality

#TODO List
[x] THINK about how to solve problem!
[x] Formulate plan of attack (make diagram!)
[] Complete design decisions section

#High Level Plan
1) Create helper functions for separating concerns and easier development

ULTIMATE GOAL: 
- Send report to /report in desired format w/ required information

# Thought process

1) What is the required information?
  A) roomIds: [Array of roomId's with lights broken]
  B) challenge: "<challenge code>" (from concatenating writing on wall of lit room in order)

2) How do we get 1.A?
  A) Need to check all roomIds and store ones with light off
    - get all roomIds with an order of -1 in response object's 'roomIds' array

3) How do we get 1.B?
  A) Need to check all roomIds and store ones with lights on
    - sort all roomIds by 'order' property
    - concatenate the sorted roomId's writings into string
    - assign above string to 'challenge' property

4) Can we combine Step 2 and 3?
  A) Get all roomIds and check the writing on the wall of all of them
    - store writing on the wall for sorting later
      - Resultant shape: [{'exampleRoomId': {writing: 'F', order: 4}}, ...]
  B) Iterate thru all roomIds
    - Store roomIds with -1 (lights off) order on writing on the wall (hereon called "WOTW") in roomIds array
    - Place all roomIds with lights on into array (for sorting!)
    - Sort above array by 'order' property lowest to greatest
    - Iterate thru above array
      - Concatate string to form challenge code
      - assign challenge code to 'challenge' property of response object

5) How can we get ALL roomIds?
  A) Get start roomId
  B) Check exits of start roomId
  C) For each element in exit
  D) Find roomIds of each room
  E) Store roomId in roomIds array

6) Seems like we have some work in Step 5 that can be done recursively?
  Plan of attack (w/ recursion in mind)
  A) Get start roomId
  B) Push into roomId into roomIds
  C) Find exits of this roomId
  D) For each direction in exits
  E) Peek to get roomId of room in that direction
  F) Repeat steps B) --> E) until explored all rooms

  Recursive function
  Input: roomId, Output: none, Side Effect
  A) Push into roomId into roomIds
  B) Find exits of this roomId
  C) For each direction in exits
  D) Peek to get roomId of room in that direction
  E) Recursive case: Invoke recursive function on those roomIds
  F) Base case: When there are no children (enforced by the loop. Recursive won't happen when no children)

7) Dealing with asynchronicity of recursive function with multiple elements
  A) Utilize Promise.all

#Design Decisions:
1) Why use axios?
- B/c of its promise based interface + HTTP client

2) Why make so many helper functions?
- Abstraction to make it easier to


