require 'csv'

# Set this before running
email = nil
csv_text = 'last_name,first_name,phone_number
PASTE_CONTACTS_HERE'

user = User.find_by!(email: email)

csv = CSV.parse(csv_text, headers: true)
csv.each do |row|
  entry = row.to_hash

  client = Client.new(
    phone_number: entry['phone_number'],
    first_name: entry['first_name'],
    last_name: entry['last_name'],
    user: user
  )

  if !client.save && client.errors.added?(:phone_number, :external_taken)
    raise StandardError(client.errors.full_messages)
  end
end
