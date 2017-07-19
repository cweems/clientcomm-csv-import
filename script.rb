require 'csv'

csv_text = 'first_name,last_name,phone_number
Paras,Sanghavi,222-222-2222
Rachel,Edelman,098-765-4321'

# Set this before running
email = 'charlie@codeforamerica.org'
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
