# Russ.Eats Word Counter

<img src="https://i.imgur.com/D5mc9ys.jpeg" align="right" width="100px" alt="Russ.Eats Logo">

> **_4 March 2024:_** _Latest tally can be found [here](https://gist.github.com/PerryRose/0b71248d33e8c9d4bc086f4d14aecfbe)._

This project calculates the count of every word Russ has said in his TikTok videos.

It scrapes every video from his profile, extracts the audio, and feeds it into the **whisper-1** model to obtain transcripts. 

Then each word is tallied up and written to src/assets/transcripts/completeTally.txt.

