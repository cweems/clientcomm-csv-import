Script for importing csv data into production. This is a hotfix implemented 07/18/2017 and should become a feature later.

# Usage:
1. Add csv-formatted data to script.rb (headers are first_name, last_number, phone_number)
2. Specify user's email
3. Run:

`ruby ./irbify.rb script.rb | heroku run rails console --app=[APP NAME HERE]`
