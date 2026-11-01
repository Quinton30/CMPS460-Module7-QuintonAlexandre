# Hoop Session Tracker

**Student:** Quinton Alexandre  
**Course:** CMPS 460 Mobile Application Development  
**Repository:** `CMPS460-Module7-QuintonAlexandre`

## Application Description

Hoop Session Tracker is an original React Native application for organizing basketball workouts. A user can create, view, edit, and delete training sessions. Each record contains a title, date, duration, category, status, and optional notes. The application supports Shooting, Conditioning, and Strength categories and allows records to be filtered by category or completion status.

## Implemented Features

- Create basketball training sessions through a validated form.
- Read saved sessions in a `FlatList`.
- Update an existing session by pressing **Edit**.
- Delete sessions with a confirmation message.
- Store and reload records with AsyncStorage.
- Use three categories: Shooting, Conditioning, and Strength.
- Filter records by category and by Planned or Completed status.
- Reject missing titles, invalid dates, and invalid durations.
- Display a helpful empty state when no records match the filters.

## AsyncStorage

The application saves the session array under the key `@hoop_session_tracker_sessions`. When the application starts, a `useEffect` calls `AsyncStorage.getItem()` and uses `JSON.parse()` to restore the saved array. A second `useEffect` watches the sessions array and saves each change with `AsyncStorage.setItem()` and `JSON.stringify()`. This allows records to remain available after the app is closed and reopened.

## Installation and Run Instructions

1. Install Node.js, Android Studio, the Android SDK, and the Android Emulator.
2. Open a terminal in the project folder.
3. Install dependencies:

   ```powershell
   npm.cmd install
   npm.cmd install @react-native-async-storage/async-storage
   ```

4. Start an Android emulator.
5. In Terminal 1, start Metro:

   ```powershell
   npm.cmd start -- --port 8082
   ```

6. In Terminal 2, build and launch the application:

   ```powershell
   npm.cmd run android -- --port 8082
   ```

If port 8082 is already in use, choose another available port and use the same port in both commands.

## Testing Instructions

1. Try submitting the blank form and verify that validation appears.
2. Add at least three records, using all three categories.
3. Edit one record and save the changes.
4. Filter the list by category and status.
5. Delete one record and confirm the deletion.
6. Close the application completely and reopen it.
7. Verify that the remaining records are restored.

## Screenshots

Add at least three real emulator screenshots to a `screenshots` folder and display them here before submitting:

1. Form and initial application screen.
2. List containing at least three saved sessions.
3. Edit mode or a filtered list.

Example Markdown after adding the files:

```markdown
![Add session form](screenshots/add-session.png)
![Saved sessions](screenshots/saved-sessions.png)
![Filtered sessions](screenshots/filtered-sessions.png)
```

## Known Limitations

- Records are stored only on the current device and are not synchronized across devices.
- The application does not use user accounts or cloud backup.
- Dates are entered manually in `YYYY-MM-DD` format instead of using a calendar picker.
- Deleting the application or clearing its storage removes the saved records.

