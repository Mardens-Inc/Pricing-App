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

