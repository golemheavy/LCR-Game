# LCR Online -- the dice game Left-Center-Right

This project is an online multiplayer version of the dice game known as L-C-R, or “Left-Center-Right.” The rules are simple and the game is a fun one for parties, because it can be played for cash, making it more interesting for social gatherings.

We implemented this multiplayer game using Firebase's Realtime Database service. We use this service to track the game’s states and also to synchronize the various players' browsers with the communal data. The Realtime Database includes functionality which can be used to notify clients who are connected to the database whenever a value is updated. With this capability we can build a game for any number of players from 3 to 20. Future iterations will contain automated agents as players, although the MVP doesn't contain this requirement.

Our organization's github flow involves converting the kanban project board cards into issues, and then working the issues inside of a new branch named after the issue ID.

After a developer completes work on an issue, the issue should be deployed to gh-pages to see the hosted site's behavior. If code owners sign off on the code reivew, the pull request should be granted and the code should be merged into master. The ticket should be closed, which will cause the kanban card to move to the "done" column.

The Minimum Viable Product will allow for 3 to 20 unique players to connect to the application's page to synchronize and play a game of LCR. Following completion of the game, a winner is decided according to the rules, and a game over message is displayed to all participants.

Project Board and Mockup of main page design are linked below:

[Project Board](https://github.com/bratwurst-productions/LCR-Game/projects/1)


![LCROnline_Mockup](https://user-images.githubusercontent.com/46508146/56332224-1db49880-6155-11e9-9797-3b8e2d210599.png)

Our application uses an API called [Avataaars Generator](https://getavataaars.com) to generate every player's unique avatar for the duration of the game. In later versions we would like to add animations by utilizing this library's built-in variations of certain elements of the avatar to cause the avatar to emote in reaction to that player's roll.

We also plan to support "spectating" and new games / multiple games in future iterations of this app.
