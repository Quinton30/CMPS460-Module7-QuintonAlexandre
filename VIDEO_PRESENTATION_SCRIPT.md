# Module 7 Video Presentation Script (5–8 Minutes)

## 1. Introduction (about 30 seconds)

Hello, my name is Quinton Alexandre. This is my CMPS 460 Module 7 application, Hoop Session Tracker. It is an original React Native fitness application that helps basketball players organize training sessions. The application stores records locally with AsyncStorage so they remain available after the app is closed and reopened.

## 2. Create and View Records (about 1 minute)

I will create three sessions to demonstrate the three required categories. I will add a Shooting session, a Conditioning session, and a Strength session. Each form includes a title, date, duration, category, status, and optional notes. When I press Add Session, the record appears in the FlatList below the form.

I will also press Add Session with an empty form to demonstrate validation. The application rejects the submission and explains what must be corrected.

## 3. Update and Delete (about 1 minute)

To update a record, I press Edit. The selected record is loaded into the form. I can change its title, duration, category, status, or notes, and then press Save Changes. The updated information immediately appears in the list.

To delete a record, I press Delete. The application displays a confirmation message before permanently removing it.

## 4. Categories and Filtering (about 45 seconds)

The application supports Shooting, Conditioning, and Strength categories. In the filter section, I can display all records or select one category. I can also filter by Planned or Completed status. The result counter shows how many records match the selected filters.

## 5. Persistence Demonstration (about 45 seconds)

I currently have saved records in the list. I will completely close the application and reopen it. The records return because they were stored with AsyncStorage. This shows that the data persists between sessions instead of being lost when the app closes.

## 6. Source Code Explanation (about 1–2 minutes)

In App.tsx, the BasketballSession interface defines the record structure. Each record has a unique ID plus a title, date, duration, category, status, and notes.

The useState hooks manage the collection, form values, filters, editing ID, validation message, and loading status. The first useEffect runs once at startup. It calls AsyncStorage.getItem and JSON.parse to load the saved collection. The second useEffect watches the sessions array. It calls JSON.stringify and AsyncStorage.setItem whenever the records change. The storageLoaded value prevents an empty array from being saved before the original data finishes loading.

The saveRecord function handles both creating and updating records. The deleteRecord function filters the selected ID out of the array. The filteredSessions value determines which records appear in the FlatList.

## 7. GitHub Repository (about 45 seconds)

This is my GitHub repository named CMPS460-Module7-QuintonAlexandre. The main source code is in App.tsx. The package.json and package-lock.json files contain the project dependencies. The Android and iOS folders contain the native project configuration. The screenshots folder contains evidence of the running application. The README describes the application, features, setup process, AsyncStorage implementation, tests, screenshots, and known limitations. The node_modules folder is excluded through .gitignore.

## 8. Challenge and Closing (about 45 seconds)

One technical challenge was preventing the first empty state from replacing saved records before AsyncStorage finished loading. I solved this with a storageLoaded state value. Saving begins only after the loading attempt has completed. I also added validation for titles, dates, and durations so invalid records are not stored.

This application demonstrates creating, reading, updating, deleting, filtering, validating, and persistently storing typed React Native data. Thank you for watching my presentation.

