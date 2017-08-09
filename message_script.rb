require 'csv'

messages = "user_email | body | inbound | client_number | created_at
[PASTE_MESSAGES_HERE]"

email = 'test@example.com'
user = User.find_by(email: email)

csv = CSV.parse(messages, :col_sep => "|", :headers => true)
csv.each do |row|
  entry = row.to_hash
  Message.create!(
    client_id: Client.find_by(phone_number: entry['client_number']),
    user_id: user,
    body: entry['body'],
    number_from: 'CHANGE_ME',
    number_to: entry['client_number'],
    inbound: entry['inbound'],
    created_at: entry['created_at'],
    sent: true
  )
end
