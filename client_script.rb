require 'csv'

csv_text = "last_name,first_name,phone_number
PASTE_CONTACTS_HERE"


puts 'script running'
# Set this before running
email = 'test@example.com'
user = User.find_by(email: email)

csv = CSV.parse(csv_text, :headers => true)
csv.each do |row|
  entry = row.to_hash
  Client.create!(
    phone_number: entry['phone_number'],
    first_name: entry['first_name'],
    last_name: entry['last_name'],
    user: user
  )
end
