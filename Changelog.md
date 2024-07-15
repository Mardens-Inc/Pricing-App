# Version 0.1.2:
Date: _07/15/2024_

## New Features

- "Added new utility for column name mapping": A new utiltiy tool has been added for easier mapping of column names
- "Added 'options_utility' module in main.rs": A new 'options_utility' module has been introduced in the main.rs
- "Added column mapping functionality to application": The application now supports column mapping functionality
- "Added new URL rewrites and CORS headers to nginx config": Additional URL rewrites and CORS headers have been added to the nginx configuration

## Refactorings and optimizations

- "Refactored CSS selectors for improved readability": The CSS selectors have been refactoring for readability improvements
- "Refactored CSS for cleaner styling and specificity": The CSS codebase has been refactored to enhance the styling specificity and to keep the codebase cleaner
- "Refactor database-options-manager.js for code optimization": The code of database-options-manager.js has been refactored for optimal performance
- "Refactored 'mardens-price' logic and changed print implementation": The logic of 'mardens-price' has been refactored and print implementation changed
- "Refactored column-mapping script to separate file": The column-mapping script has been refactored into a separate file

## Removed

- "Removed unused CSS files": Unused css files have been removed from codebase

# Version 0.1.0:
Date: _07/03/2024_
## Added
- Assigned mapped data to window object
- Added and implemented mpCategory in database list
- Add PapaParse v5.4.1 for CSV parsing
- Add new PriceTagger routes and options in fake.js
- Add light mode CSS file
- Add padding to input fields in CSS
- Add padding to bottom of options form
- Add Changelog.md with version history

## Updated
- Updated visibility and structure of form elements in database-options-form
- Updated property types and added MardensPriceOption in fake.js
- Update Papaparse library link and comment out lightmode.css

## Improved
- Refined print settings and improved 'mardens-price' implementation
- Improved print functionality, using the new price tagger system.

## Changed
- Changed parameter type in batchAddRecords function

## Implemented
- Implemented "mardens-price"

## Refactored
- Refactor CSV parsing and variable handling
- Refactor page-navigation.js for better readability
- Refactor and enhance dropdown element JavaScript
- Refactor database options form HTML
- Refactor code for loading unique column data
- Refactor loadPopup and remove unused functions
- Enhance CSV handling and form building functionality

# Version 0.0.8:
Date: _07/03/2024_
## Added
- Added dynamic Mardens Price generation option
- Added Papa Parse library
- Added error handling to page-navigation.js
- Added batch record addition functionality
- Added mardens-price property to fake.js
- Added 'register' class to login popup on register button click
- Added papaparse.min.js script to index.html

## Updated
- Updated version handling in directory-list.js
- Updated form styles and interaction in inventory script
- Updated authentication logic and added loading states
- Disabled required attribute enforcement in form fields

## Improved
- Improved column mapping and removed debug logs

## Changed
- Refactored and enhanced "database-options-manager.js" for better handling of columns

## Implemented
- Implemented calculation for discounted price

# Version 0.0.1:
Date: _04/10/2024_
## *Updates:*

- CSS updates for the inventory form.
- Improved functionalities and layout for the inventory form.
- Added inventory management with the feature to update quantity.
- Updated database deletion feature and improved item selection.
- Updated handling of subtitles in the directory list.
- Updated the pricing-app version and reformatted dependencies in Cargo.toml and Cargo.lock files.

## *Code Refactoring:*

- Refactored the property types in List Options.
- Improved the efficiency and correctness of the updater module.
- Amended the log output condition in deploy.js.

## *Bug fixes:*

- Fixed the invocation of update check function.

## *New Features:*

- Added import line in `page-navigation.js`.
- Added password strength validation and check for common passwords.

## *UI Changes:*

- Commented out the label size control in the database options form to modify the UI.

## *Other Changes:*

- Removed unused 'event' argument in authentication form submission.
- Converted ajax data to JSON format in `location.js`.
- Made improvements to page navigation and login prompt handling.
- Indentation corrected in `Cargo.lock` file.
- Added new files to .gitignore.

